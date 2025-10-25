import React from 'react';
import { useCart } from '../context/CartContext';

const Notification = () => {
  const { showNotification, notificationMessage } = useCart();

  if (!showNotification) return null;

  return (
    <div className="fixed top-20 right-4 z-50 animate-slide-in">
      <div className="bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg flex items-center space-x-2">
        <span>✅</span>
        <span>{notificationMessage}</span>
      </div>
    </div>
  );
};

export default Notification;