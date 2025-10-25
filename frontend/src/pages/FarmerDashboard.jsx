import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useProducts } from '../context/ProductContext';
import { useOrders } from '../context/OrderContext';
import { useAnalytics } from '../context/AnalyticsContext';
import { useProfile } from '../context/ProfileContext';
import AddProductModal from '../components/AddProductModal';
import EditProfileModal from '../components/EditProfileModal';
import SalesTrendChart from '../components/SalesTrendChart';
import ProductPerformanceChart from '../components/ProductPerformanceChart';

const FarmerDashboard = () => {
  const [activeTab, setActiveTab] = useState('products');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [farmerProducts, setFarmerProducts] = useState([]);
  const [farmerOrders, setFarmerOrders] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [analyticsPeriod, setAnalyticsPeriod] = useState('30d');
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [chartType, setChartType] = useState('bar');

  const { user } = useAuth();
  const { getFarmerProducts, updateProduct, deleteProduct } = useProducts();
  const { getFarmerOrders, updateOrderStatus, loading: ordersLoading } = useOrders();
  const { analytics, getFarmerAnalytics, loading: analyticsLoading } = useAnalytics();
  const { profile, getFarmerProfile, loading: profileLoading } = useProfile(); // ADD THIS

  const loadAnalytics = async () => {
    try {
      await getFarmerAnalytics(analyticsPeriod);
    } catch (error) {
      console.error('Failed to load analytics:', error);
    }
  };

  // ADD PROFILE LOADING FUNCTION
  const loadProfile = async () => {
    try {
      await getFarmerProfile();
    } catch (error) {
      console.error('Failed to load profile:', error);
    }
  };

  // Load farmer products when user changes or component mounts
  useEffect(() => {
    if (user?.id) {
      loadFarmerProducts();
    }
  }, [user]);

  // Load farmer orders when orders tab is active
  useEffect(() => {
    if (activeTab === 'orders' && user?.id) {
      loadFarmerOrders();
    }
  }, [activeTab, user]);

  // Load farmers analytics
  useEffect(() => {
    if (activeTab === 'analytics' && user?.id) {
      loadAnalytics();
    }
  }, [activeTab, user, analyticsPeriod]);

  // ADD: Load profile when profile tab is active
  useEffect(() => {
    if (activeTab === 'profile' && user?.id) {
      loadProfile();
    }
  }, [activeTab, user]);

  const loadFarmerProducts = async () => {
    const farmerId = user?._id;
    if (farmerId) {
      setLoadingProducts(true);
      try {
        console.log('Loading products for farmer ID:', farmerId);
        const products = await getFarmerProducts(farmerId);
        console.log('Received farmer products:', products);
        setFarmerProducts(Array.isArray(products) ? products : []);
      } catch (error) {
        console.error('Error loading farmer products:', error);
        setFarmerProducts([]);
      } finally {
        setLoadingProducts(false);
      }
    } else {
      console.error('No farmer ID found. User object:', user);
      setFarmerProducts([]);
    }
  };

  const loadFarmerOrders = async () => {
    try {
      const orders = await getFarmerOrders();
      const sortedOrders = Array.isArray(orders)
        ? orders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        : [];
      setFarmerOrders(sortedOrders);
    } catch (error) {
      console.error('Error loading farmer orders:', error);
      setFarmerOrders([]);
    }
  };

  const handleProductAdded = () => {
    setEditingProduct(null);
    loadFarmerProducts();
  };

  const handleEditProduct = (product) => {
    setEditingProduct(product);
    setShowAddModal(true);
  };

  const handleUpdateStock = async (productId, newStock) => {
    try {
      if (newStock < 0) {
        alert('Stock cannot be negative');
        return;
      }

      console.log('Updating stock for product:', productId, 'New stock:', newStock);
      await updateProduct(productId, { currentStock: newStock });
      alert(`Stock updated to ${newStock}`);
      loadFarmerProducts();
    } catch (error) {
      console.error('Failed to update stock:', error);
      alert('Failed to update stock: ' + error.message);
    }
  };

  const handleDeleteProduct = async (productId) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        await deleteProduct(productId);
        loadFarmerProducts();
      } catch (error) {
        alert('Failed to delete product');
      }
    }
  };

  const handleStatusUpdate = async (orderId, newStatus) => {
    try {
      await updateOrderStatus(orderId, newStatus, user.id);
      loadFarmerOrders();
    } catch (error) {
      alert('Failed to update order status: ' + error.message);
    }
  };

  // FIXED: Update profile function
  const handleProfileUpdated = () => {
    loadProfile(); // Refresh profile data after update
  };

  // Safe stats calculation
  const stats = {
    totalSales: farmerProducts.reduce((sum, product) => {
      return sum + (product.price * (product.currentStock / 2));
    }, 0),
    activeProducts: farmerProducts.length,
    pendingOrders: farmerOrders.reduce((sum, order) => {
      const farmerItems = order.items?.filter(item =>
        item.farmer?._id === user?.id || item.farmer === user?.id
      ) || [];
      return sum + (farmerItems.some(item => item.status === 'pending') ? 1 : 0);
    }, 0),
    totalCustomers: new Set(
      farmerOrders
        .map(order => order.consumer?._id)
        .filter(id => id)
    ).size
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Farmer Dashboard</h1>
          <p className="text-gray-600">Welcome back, {user?.farmName || user?.name}!</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-xl shadow-lg">
            <div className="text-2xl font-bold text-green-600">₹{stats.totalSales}</div>
            <div className="text-gray-600">Total Sales</div>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-lg">
            <div className="text-2xl font-bold text-blue-600">{stats.activeProducts}</div>
            <div className="text-gray-600">Active Products</div>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-lg">
            <div className="text-2xl font-bold text-orange-600">{stats.pendingOrders}</div>
            <div className="text-gray-600">Pending Orders</div>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-lg">
            <div className="text-2xl font-bold text-purple-600">{stats.totalCustomers}</div>
            <div className="text-gray-600">Total Customers</div>
          </div>
        </div>

        {/* TAB NAVIGATION */}
        <div className="bg-white rounded-xl shadow-lg p-4 mb-6">
          <div className="flex space-x-8 border-b border-gray-200">
            {[
              { id: 'products', label: 'Your Products', icon: '🌱' },
              { id: 'orders', label: 'Orders', icon: '📦' },
              { id: 'analytics', label: 'Analytics', icon: '📊' },
              { id: 'profile', label: 'Profile', icon: '👨‍🌾' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 px-4 py-2 border-b-2 transition-colors duration-200 ${activeTab === tab.id
                  ? 'border-green-500 text-green-600 font-semibold'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
              >
                <span>{tab.icon}</span>
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Products Tab Content */}
        {activeTab === 'products' && (
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-semibold">Your Products</h3>
              <div className="flex items-center space-x-4">
                <button
                  onClick={loadFarmerProducts}
                  className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg font-semibold"
                >
                  Refresh
                </button>
                <button
                  onClick={() => setShowAddModal(true)}
                  className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg font-semibold flex items-center space-x-2"
                >
                  <span>+</span>
                  <span>Add New Product</span>
                </button>
              </div>
            </div>

            {loadingProducts ? (
              <div className="text-center py-8">
                <div className="text-xl text-gray-600">Loading products...</div>
              </div>
            ) : farmerProducts.length === 0 ? (
              <div className="text-center py-8">
                <div className="text-4xl mb-4">🌱</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No products yet</h3>
                <p className="text-gray-600 mb-4">Start by adding your first product to the marketplace</p>
                <button
                  onClick={() => setShowAddModal(true)}
                  className="bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-lg font-semibold"
                >
                  Add Your First Product
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {farmerProducts.map(product => (
                  <div key={product._id} className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition duration-200">
                    <img
                      src={product.images?.[0]?.url || product.image}
                      alt={product.name}
                      className="w-full h-48 object-cover"
                    />
                    <div className="p-4">
                      <h4 className="font-semibold text-lg mb-2">{product.name}</h4>
                      <p className="text-gray-600 text-sm mb-3">{product.description}</p>

                      <div className="flex justify-between items-center mb-3">
                        <span className="text-2xl font-bold text-green-600">₹{product.price}/{product.unit}</span>
                        <span className="flex items-center bg-green-100 text-green-800 px-2 py-1 rounded-full text-sm">
                          ⭐ {product.averageRating || '0'}
                        </span>
                      </div>

                      <div className="flex items-center justify-between mb-4">
                        <span className="text-sm text-gray-600">Stock: {product.currentStock} {product.unit}</span>
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => handleUpdateStock(product._id, product.currentStock - 1)}
                            disabled={product.currentStock <= 0}
                            className="w-6 h-6 bg-gray-200 rounded-full flex items-center justify-center disabled:opacity-50"
                          >
                            -
                          </button>
                          <button
                            onClick={() => handleUpdateStock(product._id, product.currentStock + 1)}
                            className="w-6 h-6 bg-gray-200 rounded-full flex items-center justify-center"
                          >
                            +
                          </button>
                        </div>
                      </div>

                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleEditProduct(product)}
                          className="flex-1 bg-blue-500 hover:bg-blue-600 text-white py-2 rounded-lg text-sm"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteProduct(product._id)}
                          className="flex-1 bg-red-500 hover:bg-red-600 text-white py-2 rounded-lg text-sm"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Orders Tab */}
        {activeTab === 'orders' && (
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-xl font-semibold mb-6">Order Management</h3>

            {ordersLoading ? (
              <div className="text-center py-8">
                <div className="text-xl text-gray-600">Loading orders...</div>
              </div>
            ) : farmerOrders.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <div className="text-4xl mb-4">📦</div>
                <p>No orders yet. Orders will appear here when customers purchase your products.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {farmerOrders.map(order => {
                  const farmerItems = order.items?.filter(item =>
                    item.farmer?._id === user?.id || item.farmer === user?.id
                  ) || [];

                  if (farmerItems.length === 0) return null;

                  return (
                    <div key={order._id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h4 className="font-semibold">Order #{order.orderId}</h4>
                          <p className="text-sm text-gray-600">Customer: {order.consumer?.name}</p>
                          <p className="text-sm text-gray-600">
                            {new Date(order.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                        <span className={`px-2 py-1 rounded text-xs ${order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                          order.status === 'confirmed' ? 'bg-blue-100 text-blue-800' :
                            'bg-green-100 text-green-800'
                          }`}>
                          {order.status}
                        </span>
                      </div>

                      <div className="space-y-2 mb-3">
                        {farmerItems.map((item, index) => (
                          <div key={index} className="flex justify-between items-center">
                            <div>
                              <span className="font-medium">{item.product?.name}</span>
                              <span className="text-sm text-gray-600 ml-2">
                                {item.quantity} {item.product?.unit} × ₹{item.price}
                              </span>
                            </div>
                            <span className="font-semibold">₹{item.price * item.quantity}</span>
                          </div>
                        ))}
                      </div>

                      <div className="flex justify-between items-center border-t pt-3">
                        <span className="font-semibold">Total: ₹{
                          farmerItems.reduce((sum, item) => sum + (item.price * item.quantity), 0)
                        }</span>

                        {farmerItems[0]?.status === 'pending' && (
                          <div className="space-x-2">
                            <button
                              onClick={() => handleStatusUpdate(order._id, 'confirmed')}
                              className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded text-sm"
                            >
                              Accept
                            </button>
                            <button
                              onClick={() => handleStatusUpdate(order._id, 'cancelled')}
                              className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-sm"
                            >
                              Reject
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}


        {/* Analytics Tab */}
        {activeTab === 'analytics' && (
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-semibold">Sales Analytics</h3>
              <div className="flex items-center space-x-4">
                <select
                  value={analyticsPeriod}
                  onChange={(e) => setAnalyticsPeriod(e.target.value)}
                  className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  <option value="7d">Last 7 Days</option>
                  <option value="30d">Last 30 Days</option>
                  <option value="90d">Last 90 Days</option>
                  <option value="1y">Last Year</option>
                </select>
                <button
                  onClick={loadAnalytics}
                  className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg font-semibold"
                >
                  Refresh
                </button>
              </div>
            </div>

            {analyticsLoading ? (
              <div className="text-center py-8">
                <div className="text-xl text-gray-600">Loading analytics...</div>
              </div>
            ) : analytics ? (
              <div className="space-y-6">
                {/* Overview Cards */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                    <div className="text-2xl font-bold text-green-600">
                      ₹{analytics.overview?.totalRevenue || 0}
                    </div>
                    <div className="text-sm text-green-700">Total Revenue</div>
                  </div>
                  <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                    <div className="text-2xl font-bold text-blue-600">
                      {analytics.overview?.totalOrders || 0}
                    </div>
                    <div className="text-sm text-blue-700">Total Orders</div>
                  </div>
                  <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                    <div className="text-2xl font-bold text-purple-600">
                      {analytics.overview?.totalCustomers || 0}
                    </div>
                    <div className="text-sm text-purple-700">Customers</div>
                  </div>
                  <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
                    <div className="text-2xl font-bold text-orange-600">
                      ₹{analytics.overview?.averageOrderValue?.toFixed(0) || 0}
                    </div>
                    <div className="text-sm text-orange-700">Avg Order Value</div>
                  </div>
                </div>

                {/* Charts Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Sales Trend Chart */}
                  <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                    <div className="flex justify-between items-center mb-4">
                      <h4 className="font-semibold">Sales Trend</h4>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => setChartType('bar')}
                          className={`px-3 py-1 rounded text-sm ${chartType === 'bar' ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-700'}`}
                        >
                          Bar
                        </button>
                        <button
                          onClick={() => setChartType('line')}
                          className={`px-3 py-1 rounded text-sm ${chartType === 'line' ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-700'}`}
                        >
                          Line
                        </button>
                      </div>
                    </div>
                    <SalesTrendChart
                      data={analytics.salesTrend}
                      chartType={chartType}
                      period={analyticsPeriod}
                    />
                  </div>

                  {/* Product Performance Chart */}
                  <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                    <h4 className="font-semibold mb-4">Product Performance</h4>
                    <ProductPerformanceChart data={analytics.productPerformance} />
                  </div>
                </div>

                {/* Additional Analytics */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Order Status */}
                  <div className="bg-white border border-gray-200 rounded-lg p-4">
                    <h4 className="font-semibold mb-4">Order Status Distribution</h4>
                    {analytics.orderStatus ? (
                      <div className="space-y-3">
                        {Object.entries(analytics.orderStatus).map(([status, count]) => (
                          count > 0 && (
                            <div key={status} className="flex justify-between items-center">
                              <span className="text-sm capitalize flex items-center">
                                <span
                                  className={`w-3 h-3 rounded-full mr-2 ${status === 'delivered' ? 'bg-green-500' :
                                    status === 'confirmed' ? 'bg-blue-500' :
                                      status === 'preparing' ? 'bg-yellow-500' :
                                        status === 'shipped' ? 'bg-purple-500' :
                                          status === 'pending' ? 'bg-orange-500' :
                                            'bg-red-500'
                                    }`}
                                ></span>
                                {status}
                              </span>
                              <span className="font-semibold">{count}</span>
                            </div>
                          )
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-500 text-sm">No order status data</p>
                    )}
                  </div>

                  {/* Customer Insights */}
                  <div className="bg-white border border-gray-200 rounded-lg p-4">
                    <h4 className="font-semibold mb-4">Customer Insights</h4>
                    {analytics.customerInsights ? (
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-sm">Total Customers</span>
                          <span className="font-semibold">{analytics.customerInsights.customerCount || 0}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm">Repeat Customers</span>
                          <span className="font-semibold">{analytics.customerInsights.repeatCustomers || 0}</span>
                        </div>
                        {analytics.customerInsights.topCustomers && analytics.customerInsights.topCustomers.length > 0 && (
                          <div className="mt-4">
                            <h5 className="font-medium mb-2">Top Customers</h5>
                            {analytics.customerInsights.topCustomers.slice(0, 3).map((customer, index) => (
                              <div key={index} className="flex justify-between text-sm">
                                <span>{customer.customer?.name}</span>
                                <span className="font-semibold">₹{customer.totalSpent}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ) : (
                      <p className="text-gray-500 text-sm">No customer insights data</p>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <div className="text-4xl mb-4">📊</div>
                <p>No analytics data available yet.</p>
                <p className="text-sm mt-2">Create products and get orders to see analytics.</p>
              </div>
            )}
          </div>
        )}

        {/* Profile Tab */}
        {activeTab === 'profile' && (
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-semibold">Farm Profile</h3>
              <button
                onClick={() => setShowProfileModal(true)}
                className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg font-semibold"
              >
                Edit Profile
              </button>
            </div>

            {profileLoading ? (
              <div className="text-center py-8">
                <div className="text-xl text-gray-600">Loading profile...</div>
              </div>
            ) : profile ? (
              <div className="space-y-6">
                {/* Farm Header */}
                <div className="flex items-start space-x-6">
                  <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center overflow-hidden">
                    {profile.farmImage ? (
                      <img
                        src={profile.farmImage}
                        alt={profile.farmName}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-3xl">🌱</span>
                    )}
                  </div>
                  <div className="flex-1">
                    <h2 className="text-2xl font-bold text-gray-900">{profile.farmName}</h2>
                    <p className="text-gray-600">{profile.farmDescription || 'No description added yet.'}</p>
                    <div className="flex items-center space-x-4 mt-2">
                      <span className="flex items-center space-x-1 text-sm text-gray-600">
                        <span>⭐</span>
                        <span>{profile.rating?.average || '0'}/5 ({profile.rating?.count || 0} reviews)</span>
                      </span>
                      {profile.farmSince && (
                        <span className="text-sm text-gray-600">
                          Farming since {new Date(profile.farmSince).getFullYear()}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Contact Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-semibold mb-3">Contact Information</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center space-x-2">
                        <span className="text-gray-500">📞</span>
                        <span>{profile.phone || 'Not provided'}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-gray-500">✉️</span>
                        <span>{profile.email}</span>
                      </div>
                      {profile.contact?.whatsapp && (
                        <div className="flex items-center space-x-2">
                          <span className="text-gray-500">💬</span>
                          <span>{profile.contact.whatsapp}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-semibold mb-3">Farm Location</h4>
                    <div className="space-y-2 text-sm">
                      {profile.location ? (
                        <>
                          <div>{profile.location.address}</div>
                          <div>{profile.location.city}, {profile.location.state} - {profile.location.pincode}</div>
                        </>
                      ) : (
                        <div className="text-gray-500">Location not set</div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Business Hours */}
                {profile.businessHours && (
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-semibold mb-3">Business Hours</h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      {Object.entries(profile.businessHours).map(([day, hours]) => (
                        hours.open && (
                          <div key={day} className="flex justify-between">
                            <span className="capitalize">{day}:</span>
                            <span>{hours.open} - {hours.close}</span>
                          </div>
                        )
                      ))}
                    </div>
                  </div>
                )}

                {/* Delivery Areas */}
                {profile.deliveryAreas && profile.deliveryAreas.length > 0 && (
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-semibold mb-3">Delivery Areas</h4>
                    <div className="flex flex-wrap gap-2">
                      {profile.deliveryAreas.map((area, index) => (
                        <span key={index} className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-sm">
                          {area}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Certifications */}
                {profile.certifications && profile.certifications.length > 0 && (
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-semibold mb-3">Certifications</h4>
                    <div className="flex flex-wrap gap-2">
                      {profile.certifications.map((cert, index) => (
                        <span key={index} className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-sm">
                          {cert}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Social Media */}
                {profile.socialMedia && Object.values(profile.socialMedia).some(val => val) && (
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-semibold mb-3">Social Media</h4>
                    <div className="flex space-x-4">
                      {profile.socialMedia.website && (
                        <a href={profile.socialMedia.website} target="_blank" rel="noopener noreferrer" className="text-green-600 hover:text-green-700">
                          🌐 Website
                        </a>
                      )}
                      {profile.socialMedia.facebook && (
                        <a href={profile.socialMedia.facebook} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-700">
                          📘 Facebook
                        </a>
                      )}
                      {profile.socialMedia.instagram && (
                        <a href={profile.socialMedia.instagram} target="_blank" rel="noopener noreferrer" className="text-pink-600 hover:text-pink-700">
                          📷 Instagram
                        </a>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <div className="text-4xl mb-4">👨‍🌾</div>
                <p>Unable to load profile information.</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Add Product Modal */}
      <AddProductModal
        isOpen={showAddModal}
        onClose={() => {
          setShowAddModal(false);
          setEditingProduct(null);
        }}
        onProductAdded={handleProductAdded}
        editingProduct={editingProduct}
      />

      {/* Add Edit Profile Modal */}
      <EditProfileModal
        isOpen={showProfileModal}
        onClose={() => setShowProfileModal(false)}
        onProfileUpdated={handleProfileUpdated}
      />
    </div>
  );
};

export default FarmerDashboard;