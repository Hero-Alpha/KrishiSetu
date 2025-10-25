import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import CartSidebar from './CartSidebar';

const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout, isFarmer } = useAuth();
  const { getCartItemsCount } = useCart();
  const [showCart, setShowCart] = useState(false);
  const { wishlistCount } = useWishlist();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <>
      <nav className="bg-white shadow-lg border-b border-green-200">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-lg">🌱</span>
              </div>
              <span className="text-xl font-bold text-green-800">KrishiSetu</span>
            </Link>

            {/* Navigation Links */}
            <div className="hidden md:flex items-center space-x-8">
              <Link
                to="/"
                className={`${location.pathname === '/' ? 'text-green-600 border-b-2 border-green-600' : 'text-gray-600'} hover:text-green-500 px-3 py-2 text-sm font-medium`}
              >
                Home
              </Link>
              <Link
                to="/marketplace"
                className={`${location.pathname === '/marketplace' ? 'text-green-600 border-b-2 border-green-600' : 'text-gray-600'} hover:text-green-500 px-3 py-2 text-sm font-medium`}
              >
                Marketplace
              </Link>

              {/* Orders */}
              {user && (
                <Link
                  to="/orders"
                  className={`${location.pathname === '/orders' ? 'text-green-600 border-b-2 border-green-600' : 'text-gray-600'} hover:text-green-500 px-3 py-2 text-sm font-medium`}
                >
                  My Orders
                </Link>
              )}
              {/* Wishlist */}
              <Link to="/wishlist" className="flex items-center space-x-1 text-gray-700 hover:text-green-600">
                <span>Wishlist</span>
                {wishlistCount > 0 && (
                  <span className="bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {wishlistCount}
                  </span>
                )}
              </Link>
              {/* Show Farmer Dashboard only to farmers */}
              {isFarmer && (
                <Link
                  to="/farmer/dashboard"
                  className={`${location.pathname === '/farmer/dashboard' ? 'text-green-600 border-b-2 border-green-600' : 'text-gray-600'} hover:text-green-500 px-3 py-2 text-sm font-medium`}
                >
                  Farmer Dashboard
                </Link>
              )}
            </div>

            {/* Auth Buttons & Cart */}
            <div className="flex items-center space-x-4">
              {/* Cart Icon - Show for ALL users (including guests) */}
              <button
                onClick={() => setShowCart(true)}
                className="relative p-2 text-gray-600 hover:text-green-500"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5.5M7 13l2.5 5.5m0 0L17 21" />
                </svg>
                {getCartItemsCount() > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {getCartItemsCount()}
                  </span>
                )}
              </button>

              {user ? (
                <div className="flex items-center space-x-4">
                  <span className="text-gray-700 text-sm hidden sm:block">
                    Welcome, {user.name}!
                  </span>
                  <button
                    onClick={handleLogout}
                    className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition duration-200"
                  >
                    Logout
                  </button>
                </div>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="text-gray-600 hover:text-green-500 px-3 py-2 text-sm font-medium"
                  >
                    Login
                  </Link>
                  <Link
                    to="/register"
                    className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition duration-200"
                  >
                    Sign Up
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Cart Sidebar */}
      <CartSidebar isOpen={showCart} onClose={() => setShowCart(false)} />
    </>
  );
};

export default Navbar;