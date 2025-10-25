import mongoose from 'mongoose';
import multer from 'multer';
import { cloudinary } from '../utils/cloudinary.js';

// Configure multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'), false);
    }
  }
});

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide product name'],
    trim: true,
    maxlength: [100, 'Product name cannot be more than 100 characters']
  },
  farmer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  category: {
    type: String,
    enum: ['vegetables', 'fruits', 'dairy', 'grains', 'herbs', 'others'],
    required: true
  },
  price: {
    type: Number,
    required: true,
    min: [1, 'Price must be at least 1']
  },
  unit: {
    type: String,
    required: true,
    enum: ['kg', 'g', 'liter', 'ml', 'piece', 'bunch', 'dozen']
  },
  currentStock: {
    type: Number,
    default: 0,
    min: 0
  },
  minStock: {
    type: Number,
    default: 5
  },
  images: [{
    url: String,
    publicId: String
  }],
  description: {
    type: String,
    maxlength: [500, 'Description cannot be more than 500 characters']
  },
  harvestDate: {
    type: Date,
    default: Date.now
  },
  farmLocation: {
    type: String,
    default: 'Local Farm'
  },
  deliveryRadius: {
    type: Number,
    default: 25 
  },
  tags: [String],
  status: {
    type: String,
    enum: ['active', 'inactive', 'out-of-stock'],
    default: 'active'
  },
  averageRating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5
  },
  reviewCount: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Remove the virtual freshness getter and geospatial index since we're not using coordinates
productSchema.virtual('freshness').get(function() {
  const harvest = this.harvestDate;
  const today = new Date();
  const diffTime = Math.abs(today - harvest);
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays === 0) return 'today';
  if (diffDays === 1) return '1-day';
  if (diffDays === 2) return '2-day';
  return '3+day';
});

// Remove geospatial index since we're not using coordinates
productSchema.index({ farmer: 1, createdAt: -1 });
productSchema.index({ category: 1, status: 1 });

// Ensure virtual fields are serialized
productSchema.set('toJSON', { virtuals: true });

export default mongoose.model('Product', productSchema);