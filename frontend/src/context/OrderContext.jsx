import React, { createContext, useState, useContext } from 'react';
import { ordersAPI } from '../services/api';

const OrderContext = createContext();

export const useOrders = () => {
  const context = useContext(OrderContext);
  if (!context) {
    throw new Error('useOrders must be used within an OrderProvider');
  }
  return context;
};

export const OrderProvider = ({ children }) => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const createOrder = async (orderData) => {
    setLoading(true);
    setError(null);
    try {
      const response = await ordersAPI.create(orderData);
      const newOrder = response.data.data.order;
      setOrders(prev => [newOrder, ...prev]);
      return newOrder;
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to create order';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const getConsumerOrders = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await ordersAPI.getMyOrders();
      setOrders(response.data.data.orders);
      return response.data.data.orders;
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to load orders';
      setError(errorMessage);
      return [];
    } finally {
      setLoading(false);
    }
  };

  const getFarmerOrders = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await ordersAPI.getFarmerOrders();
      return response.data.data.orders;
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to load farmer orders';
      setError(errorMessage);
      return [];
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId, status, farmerId = null) => {
    setLoading(true);
    try {
      await ordersAPI.updateStatus(orderId, status);
      // Update local state
      setOrders(prev => prev.map(order => {
        if (order._id === orderId) {
          if (farmerId) {
            const updatedItems = order.items.map(item => 
              item.farmer._id === farmerId ? { ...item, status } : item
            );
            return { ...order, items: updatedItems };
          }
          return { ...order, status };
        }
        return order;
      }));
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to update order status';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const cancelOrder = async (orderId) => {
  setLoading(true);
  try {
    await ordersAPI.cancelOrder(orderId);
    setOrders(prev => prev.map(order => 
      order._id === orderId ? { ...order, status: 'cancelled' } : order
    ));
  } catch (err) {
    const errorMessage = err.response?.data?.message || 'Failed to cancel order';
    setError(errorMessage);
    throw new Error(errorMessage);
  } finally {
    setLoading(false);
  }
};

  const value = {
    orders,
    loading,
    error,
    createOrder,
    getConsumerOrders,
    getFarmerOrders,
    updateOrderStatus,
    cancelOrder,
    refreshOrders: getConsumerOrders
  };

  return (
    <OrderContext.Provider value={value}>
      {children}
    </OrderContext.Provider>
  );
};