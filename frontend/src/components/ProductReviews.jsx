import React, { useState, useEffect } from 'react';
import { reviewsAPI } from '../services/api';

const ProductReviews = ({ productId }) => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [ratingSummary, setRatingSummary] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    loadReviews();
    loadRatingSummary();
  }, [productId]);

  const loadReviews = async () => {
    try {
      const response = await reviewsAPI.getByProduct(productId);
      setReviews(response.data.data.reviews || []);
    } catch (error) {
      console.error('Error loading reviews:', error);
      setError('Failed to load reviews');
    } finally {
      setLoading(false);
    }
  };

  const loadRatingSummary = async () => {
    try {
      const response = await reviewsAPI.getRatingSummary(productId);
      setRatingSummary(response.data.data);
    } catch (error) {
      console.error('Error loading rating summary:', error);
      // Don't set error here as it's not critical for the UI
    }
  };

  if (loading) {
    return <div className="text-center py-4">Loading reviews...</div>;
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h3 className="text-xl font-semibold mb-4">Customer Reviews</h3>
        <div className="text-center text-gray-500 py-8">
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h3 className="text-xl font-semibold mb-4">Customer Reviews</h3>

      {/* Rating Summary */}
      {ratingSummary && (
        <div className="flex items-center space-x-6 mb-6 p-4 bg-gray-50 rounded-lg">
          <div className="text-center">
            <div className="text-3xl font-bold text-gray-900">
              {ratingSummary.averageRating?.toFixed(1) || '0.0'}
            </div>
            <div className="text-sm text-gray-600">out of 5</div>
          </div>
          <div className="flex-1">
            {[5, 4, 3, 2, 1].map(star => (
              <div key={star} className="flex items-center space-x-2 text-sm">
                <span className="w-8 text-right">{star}⭐</span>
                <div className="flex-1 bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-yellow-400 h-2 rounded-full"
                    style={{ 
                      width: `${((ratingSummary.ratingDistribution?.[star] || 0) / (ratingSummary.totalReviews || 1)) * 100}%` 
                    }}
                  ></div>
                </div>
                <span className="w-8 text-gray-600">
                  ({ratingSummary.ratingDistribution?.[star] || 0})
                </span>
              </div>
            ))}
          </div>
          <div className="text-sm text-gray-600">
            {ratingSummary.totalReviews || 0} review{(ratingSummary.totalReviews || 0) !== 1 ? 's' : ''}
          </div>
        </div>
      )}

      {/* Reviews List */}
      <div className="space-y-4">
        {reviews.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <div className="text-4xl mb-4">💬</div>
            <p>No reviews yet. Be the first to review this product!</p>
          </div>
        ) : (
          reviews.map(review => (
            <div key={review._id} className="border-b border-gray-200 pb-4 last:border-b-0">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h4 className="font-semibold">{review.user?.name || 'Anonymous'}</h4>
                  <div className="flex items-center space-x-1">
                    {'⭐'.repeat(review.rating)}
                    {'☆'.repeat(5 - review.rating)}
                    <span className="text-sm text-gray-600 ml-2">
                      {new Date(review.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
                {review.isVerified && (
                  <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                    ✅ Verified Purchase
                  </span>
                )}
              </div>
              {review.comment && (
                <p className="text-gray-700">{review.comment}</p>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ProductReviews;