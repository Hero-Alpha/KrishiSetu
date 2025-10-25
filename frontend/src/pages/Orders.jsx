import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useOrders } from '../context/OrderContext';
import { useAuth } from '../context/AuthContext';
import ReviewModal from '../components/ReviewModal.jsx';

const Orders = () => {
  const navigate = useNavigate();
  const { getConsumerOrders, orders, loading, cancelOrder } = useOrders();
  const { user } = useAuth();
  const [reviewModal, setReviewModal] = useState({ open: false, product: null, orderId: null });
  const [sortedOrders, setSortedOrders] = useState([]);

  useEffect(() => {
    getConsumerOrders();
  }, []);

  // Sort orders by creation date (newest first)
  useEffect(() => {
    if (orders.length > 0) {
      const sorted = [...orders].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      setSortedOrders(sorted);
    } else {
      setSortedOrders([]);
    }
  }, [orders]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'confirmed': return 'bg-blue-100 text-blue-800';
      case 'preparing': return 'bg-orange-100 text-orange-800';
      case 'shipped': return 'bg-purple-100 text-purple-800';
      case 'delivered': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4">📦</div>
          <div className="text-xl text-gray-600">Loading your orders...</div>
        </div>
      </div>
    );
  }

  if (sortedOrders.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <div className="text-6xl mb-4">📦</div>
          <h1 className="text-3xl font-bold text-gray-900 mb-4">No Orders Yet</h1>
          <p className="text-gray-600 mb-6">You haven't placed any orders yet.</p>
          <a
            href="/marketplace"
            className="bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-lg font-semibold"
          >
            Start Shopping
          </a>
        </div>
      </div>
    );
  }

  const handleReviewClick = (product, orderId) => {
    setReviewModal({
      open: true,
      product: product,
      orderId: orderId
    });
  };

  const handleReviewSubmitted = () => {
    getConsumerOrders();
  };

  const handleCancelOrder = async (orderId) => {
    if (window.confirm('Are you sure you want to cancel this order?')) {
      try {
        await cancelOrder(orderId);
        getConsumerOrders();
      } catch (error) {
        alert(error.message);
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">My Orders</h1>

        <div className="space-y-6">
          {sortedOrders.map(order => (
            <div key={order._id} className="bg-white rounded-lg shadow-lg p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-semibold">Order #{order.orderId}</h3>
                  <p className="text-sm text-gray-500">
                    Placed on {new Date(order.createdAt).toLocaleDateString()} at {new Date(order.createdAt).toLocaleTimeString()}
                  </p>
                </div>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
                  {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                </span>
              </div>

              <div className="space-y-3 mb-4">
                {order.items.map((item, index) => (
                  <div key={index} className="flex items-center space-x-4">
                    <img
                      src={item.product?.images?.[0]?.url || item.product?.image}
                      alt={item.product?.name}
                      className="w-12 h-12 object-cover rounded-lg"
                    />
                    <div className="flex-1">
                      <h4 className="font-semibold">{item.product?.name}</h4>
                      <p className="text-sm text-gray-600">
                        By {item.farmerName || item.product?.farmer?.farmName || item.product?.farmer?.name || 'Local Farmer'}
                      </p>
                      <p className="text-sm text-gray-600">
                        {item.quantity} {item.product?.unit} × ₹{item.price}
                      </p>
                      {order.status === 'delivered' && !item.reviewed && (
                        <button
                          onClick={() => handleReviewClick(item.product, order._id)}
                          className="text-green-600 hover:text-green-700 text-sm font-medium mt-1"
                        >
                          ✍️ Write Review
                        </button>
                      )}
                    </div>
                    <div className="font-semibold">
                      ₹{item.price * item.quantity}
                    </div>
                  </div>
                ))}
              </div>

              <div className="border-t pt-4 flex justify-between items-center">
                <div>
                  <p className="font-semibold">Total: ₹{order.finalAmount}</p>
                  <p className="text-sm text-gray-600">
                    Estimated delivery: {order.estimatedDelivery ? new Date(order.estimatedDelivery).toLocaleDateString() : 'Not specified'}
                  </p>
                </div>
                <div className="space-x-2">
                  <button
                    onClick={() => navigate(`/track-order/${order._id}`)}
                    className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg text-sm"
                  >
                    Track Order
                  </button>
                  {order.status === 'pending' && (
                    <button
                      onClick={() => handleCancelOrder(order._id)}
                      className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg text-sm">
                      Cancel Order
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Review Modal */}
        <ReviewModal
          isOpen={reviewModal.open}
          onClose={() => setReviewModal({ open: false, product: null, orderId: null })}
          product={reviewModal.product}
          orderId={reviewModal.orderId}
          onReviewSubmitted={handleReviewSubmitted}
        />
      </div>
    </div>
  );
};

export default Orders;