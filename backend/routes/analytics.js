import express from 'express';
import Order from '../models/Order.js';
import Product from '../models/Product.js';
import auth from '../middleware/auth.js';

const router = express.Router();

// Get farmer analytics - FIXED VERSION
router.get('/farmer', auth, async (req, res) => {
  try {
    if (req.user.role !== 'farmer') {
      return res.status(403).json({
        status: 'fail',
        message: 'Only farmers can access analytics'
      });
    }

    const farmerId = req.user.id;
    const { period = '30d' } = req.query;

    console.log('🔍 DEBUG ANALYTICS START ====================');
    console.log('📊 Analytics request for farmer:', farmerId);
    console.log('📅 Period:', period);

    // Calculate date range
    const now = new Date();
    let startDate = new Date();
    
    switch (period) {
      case '7d':
        startDate.setDate(now.getDate() - 7);
        break;
      case '30d':
        startDate.setDate(now.getDate() - 30);
        break;
      case '90d':
        startDate.setDate(now.getDate() - 90);
        break;
      case '1y':
        startDate.setFullYear(now.getFullYear() - 1);
        break;
      default:
        startDate.setDate(now.getDate() - 30);
    }

    console.log('📅 Date range:', startDate.toISOString(), 'to', now.toISOString());

    // Get farmer's products
    const farmerProducts = await Product.find({ farmer: farmerId });
    const productIds = farmerProducts.map(p => p._id);

    console.log('🌱 Farmer products found:', farmerProducts.length);
    console.log('🆔 Product IDs:', productIds);
    farmerProducts.forEach(p => {
      console.log(`   - ${p.name} (ID: ${p._id}, Farmer: ${p.farmer})`);
    });

    // Get orders containing farmer's products - FIXED: Use proper date query
    const orders = await Order.find({
      'items.product': { $in: productIds },
      createdAt: { $gte: startDate, $lte: now }
    })
    .populate('items.product', 'name farmer price')
    .populate('consumer', 'name email');

    console.log('📦 Orders found in query:', orders.length);

    // DEBUG: Check each order and its items
    let totalMatchedItems = 0;
    orders.forEach((order, orderIndex) => {
      console.log(`\n📋 Order ${orderIndex + 1}:`, order._id);
      console.log(`   Status: ${order.status}, Date: ${order.createdAt}`);
      
      order.items.forEach((item, itemIndex) => {
        const isFarmerMatch = item.product?.farmer?.toString() === farmerId;
        console.log(`   Item ${itemIndex + 1}:`);
        console.log(`     - Product ID: ${item.product?._id}`);
        console.log(`     - Product Name: ${item.product?.name}`);
        console.log(`     - Product Farmer: ${item.product?.farmer}`);
        console.log(`     - Request Farmer: ${farmerId}`);
        console.log(`     - Farmer Match: ${isFarmerMatch}`);
        console.log(`     - Quantity: ${item.quantity}, Price: ${item.price}`);
        
        if (isFarmerMatch) {
          totalMatchedItems++;
        }
      });
    });

    console.log(`\n🎯 TOTAL MATCHED ITEMS: ${totalMatchedItems}`);

    // Calculate analytics
    const analytics = {
      overview: calculateOverview(orders, farmerId),
      salesTrend: calculateSalesTrend(orders, farmerId, startDate, now),
      productPerformance: calculateProductPerformance(orders, farmerProducts, farmerId),
      customerInsights: calculateCustomerInsights(orders, farmerId),
      orderStatus: calculateOrderStatus(orders, farmerId)
    };

    console.log('📈 FINAL ANALYTICS RESULT:', JSON.stringify(analytics.overview, null, 2));
    console.log('🔍 DEBUG ANALYTICS END ====================\n');

    res.json({
      status: 'success',
      data: {
        analytics
      }
    });
  } catch (error) {
    console.error('Analytics error:', error);
    res.status(400).json({
      status: 'error',
      message: error.message
    });
  }
});

// FIXED Helper functions with better debugging
const calculateOverview = (orders, farmerId) => {
  let totalRevenue = 0;
  let totalOrders = 0;
  let completedOrders = 0;
  const customerSet = new Set();

  console.log('\n💰 CALCULATING OVERVIEW...');
  
  orders.forEach((order, index) => {
    console.log(`\n   Processing Order ${index + 1}: ${order._id}`);
    
    const farmerItems = order.items.filter(item => {
      const isMatch = item.product?.farmer?.toString() === farmerId;
      if (isMatch) {
        console.log(`     ✅ MATCH: ${item.quantity} x ${item.product.name} = ₹${item.price * item.quantity}`);
      }
      return isMatch;
    });

    if (farmerItems.length > 0) {
      const farmerRevenue = farmerItems.reduce((sum, item) => {
        const itemRevenue = item.price * item.quantity;
        console.log(`     💰 Adding revenue: ₹${itemRevenue} from ${item.product.name}`);
        return sum + itemRevenue;
      }, 0);
      
      totalRevenue += farmerRevenue;
      totalOrders += 1;
      
      if (order.status === 'delivered') {
        completedOrders += 1;
      }
      
      if (order.consumer?._id) {
        customerSet.add(order.consumer._id.toString());
      }
      
      console.log(`     📊 Order ${order._id}: +₹${farmerRevenue} (Total: ₹${totalRevenue})`);
    } else {
      console.log(`     ❌ No matching items in order ${order._id}`);
    }
  });

  const result = {
    totalRevenue,
    totalOrders,
    completedOrders,
    pendingOrders: totalOrders - completedOrders,
    totalCustomers: customerSet.size,
    averageOrderValue: totalOrders > 0 ? totalRevenue / totalOrders : 0
  };

  console.log('   📈 OVERVIEW RESULT:', result);
  return result;
};

const calculateSalesTrend = (orders, farmerId, startDate, endDate) => {
  console.log('\n📅 CALCULATING SALES TREND...');
  const salesByDay = {};
  const currentDate = new Date(startDate);
  const now = new Date(endDate);

  // Initialize all dates in range with 0
  while (currentDate <= now) {
    const dateKey = currentDate.toISOString().split('T')[0];
    salesByDay[dateKey] = 0;
    currentDate.setDate(currentDate.getDate() + 1);
  }

  // Fill with actual sales data
  orders.forEach(order => {
    const farmerItems = order.items.filter(item => 
      item.product?.farmer?.toString() === farmerId
    );

    if (farmerItems.length > 0) {
      const orderDate = order.createdAt || order.updatedAt || new Date();
      const dateKey = new Date(orderDate).toISOString().split('T')[0];
      const dailyRevenue = farmerItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      
      console.log(`   📊 Adding ₹${dailyRevenue} to ${dateKey}`);
      salesByDay[dateKey] = (salesByDay[dateKey] || 0) + dailyRevenue;
    }
  });

  const result = Object.entries(salesByDay).map(([date, revenue]) => ({
    date,
    revenue
  }));

  console.log('   📈 SALES TREND RESULT:', result);
  return result;
};

const calculateProductPerformance = (orders, farmerProducts, farmerId) => {
  console.log('\n🏆 CALCULATING PRODUCT PERFORMANCE...');
  const productPerformance = {};

  farmerProducts.forEach(product => {
    productPerformance[product._id] = {
      name: product.name,
      totalSold: 0,
      totalRevenue: 0,
      stock: product.currentStock
    };
  });

  orders.forEach(order => {
    const farmerItems = order.items.filter(item => 
      item.product?.farmer?.toString() === farmerId &&
      productPerformance[item.product?._id]
    );

    farmerItems.forEach(item => {
      const productId = item.product?._id;
      if (productPerformance[productId]) {
        const quantity = item.quantity;
        const revenue = item.price * quantity;
        
        productPerformance[productId].totalSold += quantity;
        productPerformance[productId].totalRevenue += revenue;
        
        console.log(`   📦 ${productPerformance[productId].name}: +${quantity} sold, +₹${revenue} revenue`);
      }
    });
  });

  const result = Object.values(productPerformance)
    .sort((a, b) => b.totalRevenue - a.totalRevenue)
    .filter(p => p.totalSold > 0);

  console.log('   🏆 PRODUCT PERFORMANCE RESULT:', result);
  return result.length > 0 ? result : Object.values(productPerformance).sort((a, b) => b.stock - a.stock);
};

const calculateCustomerInsights = (orders, farmerId) => {
  console.log('\n👥 CALCULATING CUSTOMER INSIGHTS...');
  const customerOrders = {};

  orders.forEach(order => {
    const farmerItems = order.items.filter(item => 
      item.product?.farmer?.toString() === farmerId
    );

    if (farmerItems.length > 0 && order.consumer) {
      const customerId = order.consumer._id.toString();
      const orderValue = farmerItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

      if (!customerOrders[customerId]) {
        customerOrders[customerId] = {
          customer: order.consumer,
          orderCount: 0,
          totalSpent: 0
        };
      }

      customerOrders[customerId].orderCount += 1;
      customerOrders[customerId].totalSpent += orderValue;
      
      console.log(`   👤 Customer ${order.consumer.name}: Order #${customerOrders[customerId].orderCount}, Spent: ₹${orderValue}`);
    }
  });

  const result = {
    repeatCustomers: Object.values(customerOrders).filter(c => c.orderCount > 1).length,
    topCustomers: Object.values(customerOrders)
      .sort((a, b) => b.totalSpent - a.totalSpent)
      .slice(0, 5),
    customerCount: Object.keys(customerOrders).length
  };

  console.log('   👥 CUSTOMER INSIGHTS RESULT:', result);
  return result;
};

const calculateOrderStatus = (orders, farmerId) => {
  console.log('\n📊 CALCULATING ORDER STATUS...');
  const statusCount = {
    pending: 0,
    confirmed: 0,
    preparing: 0,
    shipped: 0,
    delivered: 0,
    cancelled: 0
  };

  orders.forEach(order => {
    const hasFarmerItems = order.items.some(item => 
      item.product?.farmer?.toString() === farmerId
    );

    if (hasFarmerItems) {
      statusCount[order.status] = (statusCount[order.status] || 0) + 1;
      console.log(`   📦 Order ${order._id}: Status ${order.status} -> Count: ${statusCount[order.status]}`);
    }
  });

  console.log('   📊 ORDER STATUS RESULT:', statusCount);
  return statusCount;
};

export default router;