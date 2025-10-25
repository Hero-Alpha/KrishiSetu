import React, { createContext, useState, useContext } from 'react';

const ReviewContext = createContext();

export const useReviews = () => {
  const context = useContext(ReviewContext);
  if (!context) {
    return {
      getProductRating: () => 4, 
      addReview: () => {},
      getProductReviews: () => []
    };
  }
  return context;
};

export const ReviewProvider = ({ children }) => {
  const [reviews, setReviews] = useState([
    {
      id: 1,
      productId: 1,
      userId: 2,
      userName: 'Test Consumer',
      rating: 5,
      comment: 'Fresh and delicious tomatoes!',
      createdAt: new Date().toISOString()
    },
    {
      id: 2,
      productId: 1,
      userId: 3,
      userName: 'Another Customer',
      rating: 4,
      comment: 'Good quality, will buy again',
      createdAt: new Date().toISOString()
    }
  ]);

  const getProductRating = (productId) => {
    const productReviews = reviews.filter(review => review.productId === productId);
    if (productReviews.length === 0) return 0;
    
    const average = productReviews.reduce((sum, review) => sum + review.rating, 0) / productReviews.length;
    return Math.round(average * 10) / 10; // Round to 1 decimal
  };

  const getProductReviews = (productId) => {
    return reviews.filter(review => review.productId === productId)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  };

  const addReview = (productId, userId, userName, rating, comment) => {
    const newReview = {
      id: Date.now(),
      productId,
      userId,
      userName,
      rating,
      comment,
      createdAt: new Date().toISOString()
    };
    
    setReviews(prev => [newReview, ...prev]);
  };

  const value = {
    getProductRating,
    getProductReviews,
    addReview
  };

  return (
    <ReviewContext.Provider value={value}>
      {children}
    </ReviewContext.Provider>
  );
};