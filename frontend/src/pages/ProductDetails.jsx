import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { productsAPI } from '../services/api';
import ProductReviews from '../components/ProductReviews';
import ReviewModal from '../components/ReviewModal.jsx';
import WishlistButton from '../components/WishlistButton';
import ShareButton from '../components/ShareButton';
import SubscriptionModal from '../components/SubscriptionModal';
import ChatButton from '../components/ChatButton';
import SeasonalCalendar from '../components/SeasonalCalendar';

const ProductDetail = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedImage, setSelectedImage] = useState(0);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [selectedQuantity, setSelectedQuantity] = useState(1);
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);
  const { addToCart } = useCart();

  useEffect(() => {
    loadProduct();
  }, [id]);

  const loadProduct = async () => {
    try {
      const response = await productsAPI.getById(id);
      setProduct(response.data.data.product);
    } catch (err) {
      setError('Product not found');
    } finally {
      setLoading(false);
    }
  };

  // FIXED: Add to cart handler with event prevention
  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!product) return;

    try {
      addToCart(product, selectedQuantity);

      // Show success message (you can replace this with a toast notification)
      console.log(`${selectedQuantity} ${product.unit} of ${product.name} added to cart!`);

      // Optional: Reset quantity after adding
      setSelectedQuantity(1);

    } catch (error) {
      console.error('Failed to add to cart:', error);
    }
  };

  // Quantity handlers
  const incrementQuantity = () => {
    if (selectedQuantity < product.currentStock) {
      setSelectedQuantity(prev => prev + 1);
    }
  };

  const decrementQuantity = () => {
    if (selectedQuantity > 1) {
      setSelectedQuantity(prev => prev - 1);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4">🌱</div>
          <div className="text-xl text-gray-600">Loading product...</div>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4">❌</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Product Not Found</h2>
          <p className="text-gray-600">The product you're looking for doesn't exist.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Breadcrumb */}
        <nav className="flex mb-6" aria-label="Breadcrumb">
          <ol className="flex items-center space-x-2 text-sm text-gray-600">
            <li><a href="/marketplace" className="hover:text-green-600">Marketplace</a></li>
            <li>→</li>
            <li className="text-gray-900">{product.name}</li>
          </ol>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Product Images */}
          <div>
            <div className="bg-white rounded-lg shadow-lg overflow-hidden mb-4">
              <img
                src={product.images?.[selectedImage]?.url || product.image}
                alt={product.name}
                className="w-full h-96 object-cover"
              />
            </div>
            {product.images && product.images.length > 1 && (
              <div className="grid grid-cols-4 gap-2">
                {product.images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`border-2 rounded-lg overflow-hidden ${selectedImage === index ? 'border-green-500' : 'border-gray-300'
                      }`}
                  >
                    <img
                      src={image.url}
                      alt={`${product.name} ${index + 1}`}
                      className="w-full h-20 object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="bg-white rounded-xl shadow-lg p-8">
            <div className="mb-6">
              <h1 className="text-3xl font-bold text-gray-900 mb-3">{product.name}</h1>
              <p className="text-green-600 text-lg font-medium">
                By {product.farmer?.farmName || product.farmer?.name}
              </p>
            </div>

            {/* Price and Rating */}
            <div className="flex items-center justify-between mb-6 p-4 bg-gray-50 rounded-lg">
              <div>
                <span className="text-3xl font-bold text-gray-900">₹{product.price}</span>
                <span className="text-gray-600 text-lg ml-1">/{product.unit}</span>
              </div>
              <div className="flex items-center bg-green-100 text-green-800 px-4 py-2 rounded-full">
                <span className="text-lg">⭐</span>
                <span className="ml-2 font-semibold">{product.averageRating || '0'}</span>
                <span className="text-sm ml-1">({product.reviewCount || 0})</span>
              </div>
            </div>

            {/* Product Details Grid */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">Category</p>
                <p className="font-semibold capitalize">{product.category}</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">Stock</p>
                <p className="font-semibold">{product.currentStock} {product.unit}</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">Freshness</p>
                <p className={`font-semibold ${product.freshness === 'today' ? 'text-green-600' :
                  product.freshness === '1-day' ? 'text-yellow-600' : 'text-orange-600'
                  }`}>
                  {product.freshness === 'today' ? 'Harvested Today' :
                    product.freshness === '1-day' ? '1 Day Old' : '2+ Days Old'}
                </p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">Farm Location</p>
                <p className="font-semibold">{product.farmLocation}</p>
              </div>
            </div>

            {/* Description */}
            {product.description && (
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-3 text-gray-900">Description</h3>
                <p className="text-gray-700 leading-relaxed">{product.description}</p>
              </div>
            )}

            {/* Quantity Selector */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-3">Select Quantity</label>
              <div className="flex items-center justify-between bg-gray-50 p-4 rounded-lg">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-3">
                    <button
                      onClick={decrementQuantity}
                      disabled={selectedQuantity <= 1}
                      className="w-12 h-12 rounded-full border border-gray-300 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white transition-colors"
                    >
                      <span className="text-xl">-</span>
                    </button>
                    <span className="text-2xl font-bold w-12 text-center">
                      {selectedQuantity}
                    </span>
                    <button
                      onClick={incrementQuantity}
                      disabled={selectedQuantity >= product.currentStock}
                      className="w-12 h-12 rounded-full border border-gray-300 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white transition-colors"
                    >
                      <span className="text-xl">+</span>
                    </button>
                  </div>
                  <span className="text-lg text-gray-600 font-medium">
                    {product.unit}
                  </span>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-gray-900">
                    ₹{(product.price * selectedQuantity).toFixed(2)}
                  </p>
                  <p className="text-sm text-gray-600">Total</p>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-4">
              <button
                onClick={handleAddToCart}
                disabled={product.currentStock === 0}
                className={`w-full py-4 px-6 rounded-xl font-semibold text-lg transition duration-200 ${product.currentStock === 0
                  ? 'bg-gray-400 cursor-not-allowed text-white'
                  : 'bg-green-500 hover:bg-green-600 text-white shadow-lg hover:shadow-xl'
                  }`}
              >
                {product.currentStock === 0
                  ? 'Out of Stock'
                  : `Add ${selectedQuantity} to Cart`
                }
              </button>

              {/* Secondary Actions */}
              <div className="flex space-x-3">
                <WishlistButton product={product} />
                <ChatButton farmer={product.farmer} />
                <ShareButton product={product} />
                <button
                  onClick={() => setShowSubscriptionModal(true)}
                  className="flex-1 bg-orange-500 hover:bg-orange-600 text-white py-3 px-4 rounded-lg font-semibold transition duration-200 flex items-center justify-center space-x-2"
                >
                  <span>📦</span>
                  <span>Subscribe</span>
                </button>
              </div>


              {/* Write Review */}
              <button
                onClick={() => setShowReviewModal(true)}
                className="w-full py-3 px-6 border-2 border-green-500 text-green-600 hover:bg-green-50 rounded-lg font-semibold transition duration-200"
              >
                ✍️ Write a Review
              </button>
            </div>
          </div>
        </div>
        
        {/* Seasonal Calendar*/}
        <div className="mb-8">
          <SeasonalCalendar />
        </div>

        {/* Reviews Section */}
        <ProductReviews productId={product._id} />

        {/* Review Modal */}
        <ReviewModal
          isOpen={showReviewModal}
          onClose={() => setShowReviewModal(false)}
          productId={product._id}
          productName={product.name}
        />
        <SubscriptionModal
          isOpen={showSubscriptionModal}
          onClose={() => setShowSubscriptionModal(false)}
          product={product}
        />
      </div>
    </div>
  );
};

export default ProductDetail;