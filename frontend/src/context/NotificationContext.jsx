import React, { createContext, useState, useContext, useEffect } from 'react';
import { useAuth } from './AuthContext';

const NotificationContext = createContext();

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  const { user } = useAuth();

  const addNotification = (notification) => {
    const newNotification = {
      id: Date.now(),
      timestamp: new Date(),
      read: false,
      ...notification
    };
    
    setNotifications(prev => [newNotification, ...prev]);
  };

  const markAsRead = (notificationId) => {
    setNotifications(prev => 
      prev.map(notif => 
        notif.id === notificationId ? { ...notif, read: true } : notif
      )
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(notif => ({ ...notif, read: true })));
  };

  const clearNotification = (notificationId) => {
    setNotifications(prev => prev.filter(notif => notif.id !== notificationId));
  };

  const getUnreadCount = () => {
    return notifications.filter(notif => !notif.read).length;
  };

  // Simulate real-time notifications (in production, use WebSockets)
  useEffect(() => {
    if (!user) return;

    // This would be replaced with actual WebSocket connection
    const interval = setInterval(() => {
      // Check for order status updates
      // This is a simulation - in real app, this would come from backend
    }, 30000);

    return () => clearInterval(interval);
  }, [user]);

  const value = {
    notifications,
    addNotification,
    markAsRead,
    markAllAsRead,
    clearNotification,
    getUnreadCount,
    notify: {
    success: (title, message) => addNotification({ type: 'success', title, message, variant: 'success' }),
    error: (title, message) => addNotification({ type: 'error', title, message, variant: 'error' }),
    info: (title, message) => addNotification({ type: 'info', title, message, variant: 'info' }),
    warning: (title, message) => addNotification({ type: 'warning', title, message, variant: 'warning' })
  }
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};