import express from 'express';
import User from '../models/User.js';
import auth from '../middleware/auth.js';
import { cloudinary } from '../utils/cloudinary.js';
import multer from 'multer';

const router = express.Router();

// Configure multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 2 * 1024 * 1024, // 2MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'), false);
    }
  }
});

// Get farmer profile
router.get('/farmer', auth, async (req, res) => {
  try {
    if (req.user.role !== 'farmer') {
      return res.status(403).json({
        status: 'fail',
        message: 'Only farmers can access this profile'
      });
    }

    const farmer = await User.findById(req.user.id);
    
    res.json({
      status: 'success',
      data: {
        farmer
      }
    });
  } catch (error) {
    console.error('Get farmer profile error:', error);
    res.status(400).json({
      status: 'error',
      message: error.message
    });
  }
});

// Update farmer profile
router.put('/farmer', auth, upload.single('farmImage'), async (req, res) => {
  try {
    if (req.user.role !== 'farmer') {
      return res.status(403).json({
        status: 'fail',
        message: 'Only farmers can update this profile'
      });
    }

    const updateData = { ...req.body };
    
    // Handle image upload
    if (req.file) {
      const result = await cloudinary.uploader.upload(
        `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`,
        {
          folder: 'krishisetu/farmers',
          transformation: [
            { width: 400, height: 400, crop: 'fill' },
            { quality: 'auto' },
            { format: 'webp' }
          ]
        }
      );
      
      updateData.farmImage = result.secure_url;
    }

    // Parse JSON fields
    if (updateData.businessHours) {
      updateData.businessHours = JSON.parse(updateData.businessHours);
    }
    if (updateData.location) {
      updateData.location = JSON.parse(updateData.location);
    }
    if (updateData.socialMedia) {
      updateData.socialMedia = JSON.parse(updateData.socialMedia);
    }
    if (updateData.deliveryAreas) {
      updateData.deliveryAreas = JSON.parse(updateData.deliveryAreas);
    }

    const farmer = await User.findByIdAndUpdate(
      req.user.id,
      updateData,
      { new: true, runValidators: true }
    );

    res.json({
      status: 'success',
      data: {
        farmer
      }
    });
  } catch (error) {
    console.error('Update farmer profile error:', error);
    res.status(400).json({
      status: 'error',
      message: error.message
    });
  }
});

// Get public farmer profile (for consumers)
router.get('/farmer/:id/public', async (req, res) => {
  try {
    const farmer = await User.findById(req.params.id)
      .select('name farmName farmDescription farmImage location contact businessHours farmSince certifications socialMedia rating isVerified');

    if (!farmer || farmer.role !== 'farmer') {
      return res.status(404).json({
        status: 'fail',
        message: 'Farmer not found'
      });
    }

    res.json({
      status: 'success',
      data: {
        farmer
      }
    });
  } catch (error) {
    console.error('Get public farmer profile error:', error);
    res.status(400).json({
      status: 'error',
      message: error.message
    });
  }
});

export default router;