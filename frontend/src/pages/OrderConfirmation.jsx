import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useOrders } from '../context/OrderContext';

const OrderConfirmation = () => {
  const { orderId } = useParams();
  const { orders } = useOrders();
  const [order, setOrder] = useState(null);

  useEffect(() => {
    // FIX: Use _id instead of id
    const foundOrder = orders.find(o => o._id === orderId);
    setOrder(foundOrder);
  }, [orderId, orders]);

  if (!order) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4">❓</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Order Not Found</h2>
          <Link to="/marketplace" className="text-green-600 hover:text-green-700">
            Continue Shopping
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-lg p-8 text-center">
          <div className="text-6xl mb-4">✅</div>
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Order Confirmed!</h1>
          <p className="text-gray-600 mb-2">Thank you for your order</p>
          <p className="text-sm text-gray-500 mb-6">Order ID: {order.orderId}</p>

          <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-6">
            <h2 className="text-lg font-semibold text-green-800 mb-2">Order Details</h2>
            <div className="space-y-2 text-left">
              <div className="flex justify-between">
                <span>Total Amount:</span>
                {/* FIX: Use finalAmount instead of total */}
                <span className="font-semibold">₹{order.finalAmount}</span>
              </div>
              <div className="flex justify-between">
                <span>Status:</span>
                <span className="capitalize text-green-600">{order.status}</span>
              </div>
              <div className="flex justify-between">
                <span>Estimated Delivery:</span>
                {/* FIX: Check if estimatedDelivery exists */}
                <span>{order.estimatedDelivery ? new Date(order.estimatedDelivery).toLocaleDateString() : 'Not set'}</span>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <Link 
              to="/orders"
              className="block bg-green-500 hover:bg-green-600 text-white py-3 px-6 rounded-lg font-semibold"
            >
              View My Orders
            </Link>
            <Link 
              to="/marketplace"
              className="block border border-green-500 text-green-600 hover:bg-green-50 py-3 px-6 rounded-lg font-semibold"
            >
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderConfirmation;