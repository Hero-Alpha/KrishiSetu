import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User.js';
import Product from './models/Product.js';
import Order from './models/Order.js';

dotenv.config();

const debugAnalytics = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    const farmerId = '68f923a59028e517933269d9';
    
    console.log('🔍 DEBUG: Checking current data for farmer:', farmerId);
    
    // Check farmer exists
    const farmer = await User.findById(farmerId);
    console.log('✅ Farmer:', farmer ? farmer.farmName : 'NOT FOUND');
    
    // Check products
    const products = await Product.find({ farmer: farmerId });
    console.log('📦 Products linked to farmer:', products.length);
    products.forEach(p => {
      console.log(`   - ${p.name} (ID: ${p._id}, Stock: ${p.currentStock})`);
    });
    
    // Check orders
    const productIds = products.map(p => p._id);
    const orders = await Order.find({
      'items.product': { $in: productIds }
    }).populate('items.product').populate('consumer', 'name');
    
    console.log('🛒 Orders with farmer products:', orders.length);
    orders.forEach(order => {
      console.log(`   Order ${order._id}:`);
      order.items.forEach(item => {
        if (item.product && item.product.farmer.toString() === farmerId) {
          console.log(`     - ${item.quantity} ${item.product.unit} of ${item.product.name} - ₹${item.price * item.quantity}`);
        }
      });
    });
    
  } catch (error) {
    console.error('Debug error:', error);
  } finally {
    await mongoose.connection.close();
  }
};

debugAnalytics();