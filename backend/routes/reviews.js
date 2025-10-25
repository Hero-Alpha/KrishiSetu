import express from 'express';
import mongoose from 'mongoose';
import Review from '../models/Review.js';
import Order from '../models/Order.js';
import auth from '../middleware/auth.js';

const router = express.Router();

// Get reviews for a product
router.get('/product/:productId', async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    
    const reviews = await Review.find({ product: req.params.productId })
      .populate('user', 'name')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Review.countDocuments({ product: req.params.productId });

    res.json({
      status: 'success',
      results: reviews.length,
      data: {
        reviews
      },
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / limit),
        total
      }
    });
  } catch (error) {
    console.error('Get reviews error:', error);
    res.status(400).json({
      status: 'error',
      message: error.message
    });
  }
});

// Create review
router.post('/', auth, async (req, res) => {
  try {
    const { productId, orderId, rating, comment } = req.body;

    // Validate required fields
    if (!productId || !orderId || !rating) {
      return res.status(400).json({
        status: 'fail',
        message: 'Product ID, Order ID, and rating are required'
      });
    }

    // Check if rating is valid
    if (rating < 1 || rating > 5) {
      return res.status(400).json({
        status: 'fail',
        message: 'Rating must be between 1 and 5'
      });
    }

    // Verify that the user has purchased this product
    const order = await Order.findOne({
      _id: orderId,
      consumer: req.user.id,
      'items.product': productId,
      status: 'delivered'
    });

    if (!order) {
      return res.status(403).json({
        status: 'fail',
        message: 'You can only review products you have purchased and received'
      });
    }

    // Check if user has already reviewed this product for this order
    const existingReview = await Review.findOne({
      product: productId,
      user: req.user.id,
      order: orderId
    });

    if (existingReview) {
      return res.status(400).json({
        status: 'fail',
        message: 'You have already reviewed this product for this order'
      });
    }

    // Create review
    const review = await Review.create({
      product: productId,
      user: req.user.id,
      order: orderId,
      rating,
      comment,
      isVerified: true // Mark as verified since user purchased the product
    });

    const populatedReview = await Review.findById(review._id)
      .populate('user', 'name');

    res.status(201).json({
      status: 'success',
      data: {
        review: populatedReview
      }
    });
  } catch (error) {
    console.error('Create review error:', error);
    res.status(400).json({
      status: 'error',
      message: error.message
    });
  }
});

// Update review
router.put('/:id', auth, async (req, res) => {
  try {
    const { rating, comment } = req.body;

    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({
        status: 'fail',
        message: 'Review not found'
      });
    }

    // Check if user owns the review
    if (review.user.toString() !== req.user.id) {
      return res.status(403).json({
        status: 'fail',
        message: 'You can only update your own reviews'
      });
    }

    // Check if rating is valid
    if (rating && (rating < 1 || rating > 5)) {
      return res.status(400).json({
        status: 'fail',
        message: 'Rating must be between 1 and 5'
      });
    }

    // Update review
    const updatedReview = await Review.findByIdAndUpdate(
      req.params.id,
      { rating, comment },
      { new: true, runValidators: true }
    ).populate('user', 'name');

    res.json({
      status: 'success',
      data: {
        review: updatedReview
      }
    });
  } catch (error) {
    res.status(400).json({
      status: 'error',
      message: error.message
    });
  }
});

// Delete review
router.delete('/:id', auth, async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({
        status: 'fail',
        message: 'Review not found'
      });
    }

    // Check if user owns the review
    if (review.user.toString() !== req.user.id) {
      return res.status(403).json({
        status: 'fail',
        message: 'You can only delete your own reviews'
      });
    }

    await Review.findByIdAndDelete(req.params.id);

    res.json({
      status: 'success',
      message: 'Review deleted successfully'
    });
  } catch (error) {
    res.status(400).json({
      status: 'error',
      message: error.message
    });
  }
});

// Get user's reviews
router.get('/my-reviews', auth, async (req, res) => {
  try {
    const reviews = await Review.find({ user: req.user.id })
      .populate('product', 'name images')
      .sort({ createdAt: -1 });

    res.json({
      status: 'success',
      results: reviews.length,
      data: {
        reviews
      }
    });
  } catch (error) {
    res.status(400).json({
      status: 'error',
      message: error.message
    });
  }
});

// Get product rating summary
router.get('/product/:productId/summary', async (req, res) => {
  try {
    const summary = await Review.aggregate([
      {
        $match: { product: mongoose.Types.ObjectId(req.params.productId) }
      },
      {
        $group: {
          _id: '$product',
          averageRating: { $avg: '$rating' },
          totalReviews: { $sum: 1 },
          ratingDistribution: {
            $push: '$rating'
          }
        }
      }
    ]);

    if (summary.length === 0) {
      return res.json({
        status: 'success',
        data: {
          averageRating: 0,
          totalReviews: 0,
          ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
        }
      });
    }

    const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    summary[0].ratingDistribution.forEach(rating => {
      distribution[rating]++;
    });

    res.json({
      status: 'success',
      data: {
        averageRating: Math.round(summary[0].averageRating * 10) / 10,
        totalReviews: summary[0].totalReviews,
        ratingDistribution: distribution
      }
    });
  } catch (error) {
    console.error('Get rating summary error:', error);
    res.status(400).json({
      status: 'error',
      message: error.message
    });
  }
});

export default router;