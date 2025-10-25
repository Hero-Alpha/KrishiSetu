import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useOrders } from '../context/OrderContext';

const TrackOrder = () => {
  const { orderId } = useParams();
  const { orders } = useOrders();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const foundOrder = orders.find(o => o._id === orderId);
    setOrder(foundOrder);
    setLoading(false);
  }, [orderId, orders]);

  const getStatusSteps = () => {
    const steps = [
      { status: 'pending', label: 'Order Placed', description: 'Your order has been received' },
      { status: 'confirmed', label: 'Order Confirmed', description: 'Farmer has accepted your order' },
      { status: 'preparing', label: 'Preparing Order', description: 'Farmer is gathering your items' },
      { status: 'ready', label: 'Ready for Pickup', description: 'Your order is ready for delivery' },
      { status: 'shipped', label: 'Shipped', description: 'Order is on its way to you' },
      { status: 'delivered', label: 'Delivered', description: 'Order has been delivered' }
    ];

    const currentIndex = steps.findIndex(step => step.status === order?.status);
    
    return steps.map((step, index) => ({
      ...step,
      completed: index <= currentIndex,
      current: index === currentIndex
    }));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4">📦</div>
          <div className="text-xl text-gray-600">Loading order details...</div>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4">❓</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Order Not Found</h2>
          <p className="text-gray-600">We couldn't find the order you're looking for.</p>
        </div>
      </div>
    );
  }

  const statusSteps = getStatusSteps();

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Track Your Order</h1>
          <p className="text-gray-600">Order #{order.orderId}</p>
          <div className="flex items-center justify-between mt-4">
            <div>
              <p className="text-sm text-gray-500">Placed on</p>
              <p className="font-semibold">{new Date(order.createdAt).toLocaleDateString()}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Estimated Delivery</p>
              <p className="font-semibold">
                {order.estimatedDelivery ? new Date(order.estimatedDelivery).toLocaleDateString() : 'Not set'}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Total Amount</p>
              <p className="font-semibold text-green-600">₹{order.finalAmount}</p>
            </div>
          </div>
        </div>

        {/* Status Timeline */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h2 className="text-xl font-semibold mb-6">Order Status</h2>
          
          <div className="space-y-4">
            {statusSteps.map((step, index) => (
              <div key={step.status} className="flex items-start space-x-4">
                {/* Status Icon */}
                <div className={`shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                  step.completed ? 'bg-green-500 text-white' : 
                  step.current ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-500'
                }`}>
                  {step.completed ? '✓' : index + 1}
                </div>
                
                {/* Connecting Line */}
                {index < statusSteps.length - 1 && (
                  <div className={`absolute left-4 top-8 w-0.5 h-8 ${
                    step.completed ? 'bg-green-500' : 'bg-gray-200'
                  }`}></div>
                )}
                
                {/* Status Details */}
                <div className="flex-1">
                  <h3 className={`font-semibold ${
                    step.current ? 'text-blue-600' : 
                    step.completed ? 'text-green-600' : 'text-gray-500'
                  }`}>
                    {step.label}
                  </h3>
                  <p className="text-sm text-gray-600">{step.description}</p>
                  {step.current && (
                    <p className="text-sm text-blue-600 font-medium mt-1">
                      Current Status
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Order Items */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Order Items</h2>
          <div className="space-y-3">
            {order.items.map((item, index) => (
              <div key={index} className="flex items-center justify-between py-3 border-b border-gray-200 last:border-b-0">
                <div className="flex items-center space-x-4">
                  <img
                    src={item.product?.images?.[0]?.url || item.product?.image}
                    alt={item.product?.name}
                    className="w-12 h-12 object-cover rounded-lg"
                  />
                  <div>
                    <h4 className="font-semibold">{item.product?.name}</h4>
                    <p className="text-sm text-gray-600">
                      {item.quantity} {item.product?.unit} × ₹{item.price}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold">₹{item.price * item.quantity}</p>
                  <p className="text-sm text-gray-500 capitalize">{item.status}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TrackOrder;