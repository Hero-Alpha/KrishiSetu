import React, { useState, useEffect } from 'react';
import { reviewsAPI, ordersAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

const ReviewModal = ({ isOpen, onClose, productId, productName, onReviewSubmitted }) => {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [error, setError] = useState('');
  const [userOrders, setUserOrders] = useState([]);
  const [selectedOrderId, setSelectedOrderId] = useState('');
  const { user } = useAuth();

  useEffect(() => {
    if (isOpen && user) {
      loadUserOrders();
    }
  }, [isOpen, user, productId]);

  const loadUserOrders = async () => {
    setOrdersLoading(true);
    try {
      // Get user's orders that contain this product
      const response = await ordersAPI.getMyOrders();
      const allOrders = response.data.data.orders || [];
      
      // Filter orders that contain the current product
      const ordersWithProduct = allOrders.filter(order => 
        order.items.some(item => item.product?._id === productId || item.product?.id === productId)
      );
      
      setUserOrders(ordersWithProduct);
      
      if (ordersWithProduct.length === 0) {
        setError('You need to purchase this product before you can review it.');
      }
    } catch (error) {
      console.error('Error loading user orders:', error);
      setError('Failed to load your orders. Please try again.');
    } finally {
      setOrdersLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!rating) {
      setError('Please select a rating');
      return;
    }

    if (!selectedOrderId) {
      setError('Please select an order to verify your purchase');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await reviewsAPI.create({
        productId: productId,
        orderId: selectedOrderId,
        rating: rating,
        comment: comment.trim()
      });

      if (onReviewSubmitted) {
        onReviewSubmitted();
      }
      onClose();
      setRating(5);
      setComment('');
      setSelectedOrderId('');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit review. Please make sure you have purchased this product.');
    } finally {
      setLoading(false);
    }
  };

  const resetModal = () => {
    setRating(5);
    setComment('');
    setSelectedOrderId('');
    setError('');
    setUserOrders([]);
  };

  const handleClose = () => {
    resetModal();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75" onClick={handleClose}></div>

        <div className="relative inline-block px-4 pt-5 pb-4 overflow-hidden text-left align-bottom transition-all transform bg-white rounded-lg shadow-xl sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6">
          <h3 className="text-lg font-medium leading-6 text-gray-900 mb-4">
            Review {productName}
          </h3>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg mb-4">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Order Selection */}
            {userOrders.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Order (to verify purchase) *
                </label>
                <select
                  value={selectedOrderId}
                  onChange={(e) => setSelectedOrderId(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                  required
                  disabled={ordersLoading}
                >
                  <option value="">Select your order</option>
                  {userOrders.map(order => (
                    <option key={order._id} value={order._id}>
                      Order #{order.orderNumber} - {new Date(order.createdAt).toLocaleDateString()} - ₹{order.totalAmount}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-gray-500 mt-1">
                  Please select the order containing this product to verify your purchase
                </p>
              </div>
            )}

            {ordersLoading && (
              <div className="text-center py-2">
                <div className="text-gray-500">Loading your orders...</div>
              </div>
            )}

            {userOrders.length === 0 && !ordersLoading && user && (
              <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 px-4 py-3 rounded-lg mb-4">
                <p className="text-sm">
                  You need to purchase this product before you can review it.
                </p>
                <button
                  type="button"
                  onClick={handleClose}
                  className="mt-2 text-yellow-700 underline text-sm"
                >
                  Continue Shopping
                </button>
              </div>
            )}

            {!user && (
              <div className="bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded-lg mb-4">
                <p className="text-sm">
                  Please log in to submit a review.
                </p>
              </div>
            )}

            {/* Star Rating - Only show if user has orders */}
            {userOrders.length > 0 && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Rating *
                  </label>
                  <div className="flex space-x-1">
                    {[1, 2, 3, 4, 5].map(star => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setRating(star)}
                        className="text-2xl focus:outline-none transition-transform hover:scale-110"
                      >
                        {star <= rating ? '⭐' : '☆'}
                      </button>
                    ))}
                  </div>
                  <p className="text-sm text-gray-500 mt-1">
                    {rating === 5 ? 'Excellent' : 
                     rating === 4 ? 'Good' : 
                     rating === 3 ? 'Average' : 
                     rating === 2 ? 'Poor' : 'Very Poor'}
                  </p>
                </div>

                {/* Comment */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Review (Optional)
                  </label>
                  <textarea
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    rows="4"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="Share your experience with this product..."
                    maxLength="500"
                  ></textarea>
                  <p className="text-xs text-gray-500 mt-1">
                    {comment.length}/500 characters
                  </p>
                </div>
              </>
            )}

            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={handleClose}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-transparent rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
              >
                Cancel
              </button>
              
              {userOrders.length > 0 && (
                <button
                  type="submit"
                  disabled={loading || !selectedOrderId}
                  className="px-4 py-2 text-sm font-medium text-white bg-green-600 border border-transparent rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
                >
                  {loading ? 'Submitting...' : 'Submit Review'}
                </button>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ReviewModal;