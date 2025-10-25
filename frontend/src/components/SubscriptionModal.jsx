import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';

const SubscriptionModal = ({ isOpen, onClose, product }) => {
  const [selectedPlan, setSelectedPlan] = useState('weekly');
  const [quantity, setQuantity] = useState(1);
  const { user } = useAuth();

  if (!isOpen) return null;

  const subscriptionPlans = {
    weekly: {
      name: 'Weekly Box',
      discount: 10,
      description: 'Get fresh produce every week',
      delivery: 'Every Monday'
    },
    biweekly: {
      name: 'Bi-Weekly Box',
      discount: 15,
      description: 'Fresh produce every 2 weeks',
      delivery: 'Alternate Mondays'
    },
    monthly: {
      name: 'Monthly Box',
      discount: 20,
      description: 'Monthly curated selection',
      delivery: 'First Monday of month'
    }
  };

  const calculatePrice = () => {
    const basePrice = product.price * quantity;
    const discount = (basePrice * subscriptionPlans[selectedPlan].discount) / 100;
    return {
      base: basePrice,
      discount: discount,
      final: basePrice - discount
    };
  };

  const handleSubscribe = async () => {
    // TODO: Integrate with subscription API
    const subscriptionData = {
      productId: product._id,
      plan: selectedPlan,
      quantity: quantity,
      price: calculatePrice(),
      customerId: user.id
    };
    
    console.log('Subscription data:', subscriptionData);
    alert(`Subscribed to ${subscriptionPlans[selectedPlan].name}!`);
    onClose();
  };

  const price = calculatePrice();

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-start justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-lg max-w-md w-full p-6 my-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">Subscribe & Save</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl"
          >
            ×
          </button>
        </div>
        
        {/* Product Info */}
        <div className="flex items-center space-x-4 mb-6 p-4 bg-gray-50 rounded-lg">
          <img
            src={product.images?.[0]?.url || product.image}
            alt={product.name}
            className="w-16 h-16 object-cover rounded-lg"
          />
          <div>
            <h3 className="font-semibold">{product.name}</h3>
            <p className="text-gray-600">₹{product.price}/{product.unit}</p>
          </div>
        </div>

        {/* Subscription Plans */}
        <div className="mb-6">
          <label className="block text-sm font-medium mb-3">Choose Plan</label>
          <div className="space-y-2">
            {Object.entries(subscriptionPlans).map(([key, plan]) => (
              <label key={key} className="flex items-center space-x-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                <input
                  type="radio"
                  name="subscriptionPlan"
                  value={key}
                  checked={selectedPlan === key}
                  onChange={(e) => setSelectedPlan(e.target.value)}
                  className="text-green-500"
                />
                <div className="flex-1">
                  <div className="font-semibold">{plan.name}</div>
                  <div className="text-sm text-gray-600">{plan.description}</div>
                  <div className="text-sm text-green-600">Save {plan.discount}% • {plan.delivery}</div>
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* Quantity */}
        <div className="mb-6">
          <label className="block text-sm font-medium mb-2">Quantity per delivery</label>
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
              className="w-8 h-8 rounded-full border flex items-center justify-center hover:bg-gray-50"
            >
              -
            </button>
            <span className="font-semibold">{quantity} {product.unit}</span>
            <button
              onClick={() => setQuantity(quantity + 1)}
              className="w-8 h-8 rounded-full border flex items-center justify-center hover:bg-gray-50"
            >
              +
            </button>
          </div>
        </div>

        {/* Price Summary */}
        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <div className="flex justify-between mb-2">
            <span>Base Price:</span>
            <span>₹{price.base.toFixed(2)}</span>
          </div>
          <div className="flex justify-between mb-2 text-green-600">
            <span>Discount ({subscriptionPlans[selectedPlan].discount}%):</span>
            <span>-₹{price.discount.toFixed(2)}</span>
          </div>
          <div className="flex justify-between font-bold text-lg border-t pt-2">
            <span>Final Price:</span>
            <span>₹{price.final.toFixed(2)}</span>
          </div>
          <div className="text-sm text-gray-600 mt-2">
            per delivery • {subscriptionPlans[selectedPlan].delivery}
          </div>
        </div>

        {/* Actions */}
        <div className="flex space-x-3">
          <button
            onClick={onClose}
            className="flex-1 py-3 border border-gray-300 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubscribe}
            className="flex-1 py-3 bg-green-500 text-white rounded-lg font-semibold hover:bg-green-600 transition-colors"
          >
            Subscribe Now
          </button>
        </div>
      </div>
    </div>
  );
};

export default SubscriptionModal;