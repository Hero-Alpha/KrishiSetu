import express from 'express';
import Order from '../models/Order.js';
import Product from '../models/Product.js';
import auth from '../middleware/auth.js';

const router = express.Router();

// Create order
router.post('/', auth, async (req, res) => {
  try {
    const { items, deliveryAddress, paymentMethod } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({
        status: 'fail',
        message: 'Order must contain at least one item'
      });
    }

    // Calculate total and validate items
    let totalAmount = 0;
    const orderItems = [];

    for (const item of items) {
      const product = await Product.findById(item.product);

      if (!product) {
        return res.status(404).json({
          status: 'fail',
          message: `Product ${item.product} not found`
        });
      }

      if (product.currentStock < item.quantity) {
        return res.status(400).json({
          status: 'fail',
          message: `Insufficient stock for ${product.name}. Available: ${product.currentStock}`
        });
      }

      totalAmount += product.price * item.quantity;

      orderItems.push({
        product: product._id,
        quantity: item.quantity,
        price: product.price,
        farmer: product.farmer
      });

      // Update product stock
      product.currentStock -= item.quantity;
      if (product.currentStock === 0) {
        product.status = 'out-of-stock';
      }
      await product.save();
    }

    const deliveryFee = 25;
    const finalAmount = totalAmount + deliveryFee;

    const order = await Order.create({
      consumer: req.user.id,
      items: orderItems,
      totalAmount,
      deliveryFee,
      finalAmount,
      deliveryAddress,
      payment: {
        method: paymentMethod
      },
      estimatedDelivery: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours from now
    });

    const populatedOrder = await Order.findById(order._id)
      .populate('consumer', 'name email')
      .populate('items.product', 'name images unit')
      .populate('items.farmer', 'name farmName');

    res.status(201).json({
      status: 'success',
      data: {
        order: populatedOrder
      }
    });
  } catch (error) {
    console.error('Create order error:', error);
    res.status(400).json({
      status: 'error',
      message: error.message
    });
  }
});

// Get consumer orders
router.get('/my-orders', auth, async (req, res) => {
  try {
    const orders = await Order.find({ consumer: req.user.id })
      .populate('items.product', 'name images unit')
      .populate('items.farmer', 'name farmName')
      .sort({ createdAt: -1 });

    res.json({
      status: 'success',
      results: orders.length,
      data: {
        orders
      }
    });
  } catch (error) {
    res.status(400).json({
      status: 'error',
      message: error.message
    });
  }
});

router.patch('/:id/cancel', auth, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        status: 'fail',
        message: 'Order not found'
      });
    }

    // Check if user is the consumer who placed the order
    if (order.consumer.toString() !== req.user.id) {
      return res.status(403).json({
        status: 'fail',
        message: 'You can only cancel your own orders'
      });
    }

    // Only allow cancellation for pending orders
    if (order.status !== 'pending') {
      return res.status(400).json({
        status: 'fail',
        message: 'Only pending orders can be cancelled'
      });
    }

    order.status = 'cancelled';
    await order.save();

    // Restore product stock
    for (const item of order.items) {
      const product = await Product.findById(item.product);
      if (product) {
        product.currentStock += item.quantity;
        if (product.status === 'out-of-stock') {
          product.status = 'available';
        }
        await product.save();
      }
    }

    const updatedOrder = await Order.findById(order._id)
      .populate('consumer', 'name email')
      .populate('items.product', 'name images unit')
      .populate('items.farmer', 'name farmName');

    res.json({
      status: 'success',
      data: { order: updatedOrder }
    });
  } catch (error) {
    res.status(400).json({
      status: 'error',
      message: error.message
    });
  }
});


// Get farmer orders
router.get('/farmer/orders', auth, async (req, res) => {
  try {
    if (req.user.role !== 'farmer') {
      return res.status(403).json({
        status: 'fail',
        message: 'Only farmers can access this route'
      });
    }

    const orders = await Order.find({ 'items.farmer': req.user.id })
      .populate('consumer', 'name email')
      .populate('items.product', 'name images unit')
      .sort({ createdAt: -1 });

    res.json({
      status: 'success',
      results: orders.length,
      data: {
        orders
      }
    });
  } catch (error) {
    res.status(400).json({
      status: 'error',
      message: error.message
    });
  }
});

// Update order status (farmer)
router.patch('/:id/status', auth, async (req, res) => {
  try {
    const { status } = req.body;
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        status: 'fail',
        message: 'Order not found'
      });
    }

    // Check if farmer owns any items in this order
    const farmerItems = order.items.filter(item =>
      item.farmer.toString() === req.user.id
    );

    if (farmerItems.length === 0) {
      return res.status(403).json({
        status: 'fail',
        message: 'You can only update orders containing your products'
      });
    }

    // Update status for farmer's items
    order.items = order.items.map(item =>
      item.farmer.toString() === req.user.id
        ? { ...item, status }
        : item
    );

    // Update overall order status if all items are delivered
    const allItemsDelivered = order.items.every(item => item.status === 'delivered');
    if (allItemsDelivered) {
      order.status = 'delivered';
      order.deliveredAt = new Date();
    }

    await order.save();

    const updatedOrder = await Order.findById(order._id)
      .populate('consumer', 'name email')
      .populate('items.product', 'name images unit')
      .populate('items.farmer', 'name farmName');

    res.json({
      status: 'success',
      data: {
        order: updatedOrder
      }
    });
  } catch (error) {
    res.status(400).json({
      status: 'error',
      message: error.message
    });
  }
});

export default router;