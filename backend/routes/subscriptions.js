import express from 'express';
import Subscription from '../models/Subscription.js';
import auth from '../middleware/auth.js';

const router = express.Router();

// Create subscription
router.post('/', auth, async (req, res) => {
  try {
    const subscription = new Subscription({
      ...req.body,
      customer: req.user.id
    });
    await subscription.save();
    res.status(201).json({ status: 'success', data: { subscription } });
  } catch (error) {
    res.status(400).json({ status: 'error', message: error.message });
  }
});

// Get user subscriptions
router.get('/my-subscriptions', auth, async (req, res) => {
  try {
    const subscriptions = await Subscription.find({ customer: req.user.id })
      .populate('product')
      .populate('farmer');
    res.json({ status: 'success', data: { subscriptions } });
  } catch (error) {
    res.status(400).json({ status: 'error', message: error.message });
  }
});

export default router;