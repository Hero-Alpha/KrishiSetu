import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { ProductProvider } from './context/ProductContext';
import { OrderProvider } from './context/OrderContext';
import { NotificationProvider } from './context/NotificationContext';
import { AnalyticsProvider } from './context/AnalyticsContext';
import { ProfileProvider } from './context/ProfileContext';
import { WishlistProvider } from './context/WishlistContext';
import { ChatProvider } from './context/ChatContext';

import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import Notification from './components/Notification';
import ChatManager from './components/ChatManager';

import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Marketplace from './pages/Marketplace';
import FarmerDashboard from './pages/FarmerDashboard';
import Checkout from './pages/Checkout';
import OrderConfirmation from './pages/OrderConfirmation';
import Orders from './pages/Orders';
import ProductDetail from './pages/ProductDetails';
import TrackOrder from './pages/TrackOrder';
import Wishlist from './pages/Wishlist';

function App() {
  return (
    <Router>
      <ChatProvider>
        <WishlistProvider>
          <AuthProvider>
            <CartProvider>
              <ProductProvider>
                <OrderProvider>
                  <AnalyticsProvider>
                    <ProfileProvider>
                      <NotificationProvider>
                        <div className="min-h-screen bg-gray-50">
                          <Navbar />
                          <Notification />
                          <Routes>
                            <Route path="/" element={<Home />} />
                            <Route path="/login" element={<Login />} />
                            <Route path="/register" element={<Register />} />
                            <Route path="/marketplace" element={<Marketplace />} />
                            <Route path="/checkout" element={<Checkout />} />
                            <Route path="/orders" element={<Orders />} />
                            <Route path="/order-confirmation/:orderId" element={<OrderConfirmation />} />
                            <Route path='/product/:id' element={<ProductDetail />} />
                            <Route path="/track-order/:orderId" element={<TrackOrder />} />
                            <Route path="/wishlist" element={<Wishlist />} />
                            <Route
                              path="/farmer/dashboard"
                              element={
                                <ProtectedRoute requiredRole="farmer">
                                  <FarmerDashboard />
                                </ProtectedRoute>
                              }
                            />
                          </Routes>
                        </div>
                      </NotificationProvider>
                    </ProfileProvider>
                  </AnalyticsProvider>
                </OrderProvider>
              </ProductProvider>
            </CartProvider>
          </AuthProvider>
          <ChatManager />
        </WishlistProvider>
      </ChatProvider>
    </Router>
  );
}

export default App;