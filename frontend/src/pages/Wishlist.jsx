import React from 'react';
import { Link } from 'react-router-dom';
import { useWishlist } from '../context/WishlistContext';
import { useCart } from '../context/CartContext';
import WishlistButton from '../components/WishlistButton';

const Wishlist = () => {
  const { wishlist, removeFromWishlist } = useWishlist();
  const { addToCart } = useCart();

  const handleAddToCart = (product, e) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(product, 1);
  };

  if (wishlist.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <div className="text-6xl mb-4">🤍</div>
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Your Wishlist is Empty</h1>
          <p className="text-gray-600 mb-6">Save your favorite products here!</p>
          <Link
            to="/marketplace"
            className="bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-lg font-semibold"
          >
            Start Shopping
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">My Wishlist ({wishlist.length})</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {wishlist.map(product => (
            <div key={product._id} className="bg-white rounded-lg shadow-lg overflow-hidden">
              <div className="relative">
                <img
                  src={product.images?.[0]?.url || product.image}
                  alt={product.name}
                  className="w-full h-48 object-cover"
                />
                <div className="absolute top-2 right-2">
                  <WishlistButton product={product} />
                </div>
              </div>
              
              <div className="p-4">
                <h3 className="text-lg font-semibold mb-2">
                  <Link to={`/product/${product._id}`} className="hover:text-green-600">
                    {product.name}
                  </Link>
                </h3>
                <p className="text-green-600 text-sm mb-2">
                  By {product.farmer?.farmName || 'Local Farmer'}
                </p>
                <p className="text-2xl font-bold text-gray-900 mb-4">₹{product.price}/{product.unit}</p>
                
                <div className="flex space-x-2">
                  <button
                    onClick={(e) => handleAddToCart(product, e)}
                    disabled={product.currentStock === 0}
                    className={`flex-1 py-2 px-4 rounded-lg font-semibold ${
                      product.currentStock === 0
                        ? 'bg-gray-400 cursor-not-allowed text-white'
                        : 'bg-green-500 hover:bg-green-600 text-white'
                    }`}
                  >
                    {product.currentStock === 0 ? 'Out of Stock' : 'Add to Cart'}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Wishlist;