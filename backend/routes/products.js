import express from 'express';
import Product from '../models/Product.js';
import auth from '../middleware/auth.js';
import { cloudinary } from '../utils/cloudinary.js';

const router = express.Router();

// Get all products (public)
router.get('/', async (req, res) => {
  try {
    const { category, farmer, search, page = 1, limit = 20 } = req.query;

    let filter = { status: 'active' };

    if (category) filter.category = category;
    if (farmer) filter.farmer = farmer;
    if (search) {
      filter.name = { $regex: search, $options: 'i' };
    }

    const products = await Product.find(filter)
      .populate('farmer', 'name farmName location')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Product.countDocuments(filter);

    res.json({
      status: 'success',
      results: products.length,
      data: {
        products
      },
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / limit),
        total
      }
    });
  } catch (error) {
    console.error('Get products error:', error);
    res.status(400).json({
      status: 'error',
      message: error.message
    });
  }
});

// Get single product
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)
      .populate('farmer', 'name farmName location phone');

    if (!product) {
      return res.status(404).json({
        status: 'fail',
        message: 'Product not found'
      });
    }

    res.json({
      status: 'success',
      data: {
        product
      }
    });
  } catch (error) {
    res.status(400).json({
      status: 'error',
      message: error.message
    });
  }
});

// Create product (farmer only)
import multer from 'multer';

// Configure multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'), false);
    }
  }
});

// Update the POST route to handle image uploads
router.post('/', auth, upload.array('images', 5), async (req, res) => {
  try {
    if (req.user.role !== 'farmer') {
      return res.status(403).json({
        status: 'fail',
        message: 'Only farmers can create products'
      });
    }

    let imageUrls = [];

    // Upload images to Cloudinary if any
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        const result = await cloudinary.uploader.upload(
          `data:${file.mimetype};base64,${file.buffer.toString('base64')}`,
          {
            folder: 'krishisetu/products',
            transformation: [
              { width: 800, height: 600, crop: 'limit' },
              { quality: 'auto' },
              { format: 'webp' }
            ]
          }
        );

        imageUrls.push({
          url: result.secure_url,
          publicId: result.public_id
        });
      }
    }

    // Use farmer's address as location, or a default
    const farmLocation = req.user.location?.address ||
      `${req.user.location?.city || ''} ${req.user.location?.state || ''}`.trim() ||
      'Local Farm';

    const productData = {
      ...req.body,
      farmer: req.user.id,
      farmLocation: farmLocation,
      images: imageUrls
    };

    console.log('Creating product with data:', productData);

    const product = await Product.create(productData);

    const populatedProduct = await Product.findById(product._id)
      .populate('farmer', 'name farmName location');

    res.status(201).json({
      status: 'success',
      data: {
        product: populatedProduct
      }
    });
  } catch (error) {
    console.error('Create product error:', error);
    res.status(400).json({
      status: 'error',
      message: error.message
    });
  }
});

// update products
router.put('/:id', auth, upload.array('images', 5), async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        status: 'fail',
        message: 'Product not found'
      });
    }

    // Check if user owns the product
    if (product.farmer.toString() !== req.user.id) {
      return res.status(403).json({
        status: 'fail',
        message: 'You can only update your own products'
      });
    }

    let updatedImages = [...product.images];

    // Upload new images if any
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        const result = await cloudinary.uploader.upload(
          `data:${file.mimetype};base64,${file.buffer.toString('base64')}`,
          {
            folder: 'krishisetu/products',
            transformation: [
              { width: 800, height: 600, crop: 'limit' },
              { quality: 'auto' },
              { format: 'webp' }
            ]
          }
        );

        updatedImages.push({
          url: result.secure_url,
          publicId: result.public_id
        });
      }
    }

    const updateData = {
      ...req.body,
      images: updatedImages
    };

    const updatedProduct = await Product.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    ).populate('farmer', 'name farmName location');

    res.json({
      status: 'success',
      data: {
        product: updatedProduct
      }
    });
  } catch (error) {
    res.status(400).json({
      status: 'error',
      message: error.message
    });
  }
});

// Delete product
router.delete('/:id', auth, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        status: 'fail',
        message: 'Product not found'
      });
    }

    if (product.farmer.toString() !== req.user.id) {
      return res.status(403).json({
        status: 'fail',
        message: 'You can only delete your own products'
      });
    }

    // Delete images from Cloudinary
    if (product.images && product.images.length > 0) {
      for (const image of product.images) {
        if (image.publicId) {
          await cloudinary.uploader.destroy(image.publicId);
        }
      }
    }

    await Product.findByIdAndDelete(req.params.id);

    res.json({
      status: 'success',
      message: 'Product deleted successfully'
    });
  } catch (error) {
    res.status(400).json({
      status: 'error',
      message: error.message
    });
  }
});

// Get farmer's products
router.get('/farmer/my-products', auth, async (req, res) => {
  try {
    if (req.user.role !== 'farmer') {
      return res.status(403).json({
        status: 'fail',
        message: 'Only farmers can access this route'
      });
    }

    console.log('🔍 Fetching products for farmer ID:', req.user._id);
    console.log('🔍 Farmer details:', {
      id: req.user._id,
      name: req.user.name,
      farmName: req.user.farmName
    });

    const products = await Product.find({ farmer: req.user._id })
      .sort({ createdAt: -1 });

    console.log('✅ Found products:', products.length);
    console.log('📦 Products:', products.map(p => ({ id: p._id, name: p.name, farmer: p.farmer })));

    res.json({
      status: 'success',
      results: products.length,
      data: {
        products
      }
    });
  } catch (error) {
    console.error('❌ Get farmer products error:', error);
    res.status(400).json({
      status: 'error',
      message: error.message
    });
  }
});

export default router;