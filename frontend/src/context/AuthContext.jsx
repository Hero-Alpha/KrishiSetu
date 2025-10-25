import React, { createContext, useState, useContext, useEffect } from 'react';
import { authAPI } from '../services/api'; // ADD THIS IMPORT

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simple auth check - just use stored data
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    
    if (token && userData) {
      const parsedUser = JSON.parse(userData);
      // Ensure user has both _id and id for compatibility
      const userWithIds = {
        ...parsedUser,
        id: parsedUser._id || parsedUser.id // Add id field if missing
      };
      setUser(userWithIds);
    }
    setLoading(false);
  }, []);

  const login = async (userData, token) => {
    // Ensure user data has both _id and id for compatibility
    const userWithIds = {
      ...userData,
      id: userData._id || userData.id // Ensure both _id and id are available
    };
    
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(userWithIds));
    setUser(userWithIds);
  };

  const register = async (userData) => {
    const response = await authAPI.register(userData);
    
    // Ensure the user data from backend has both _id and id
    const userWithIds = {
      ...response.data.data.user,
      id: response.data.data.user._id || response.data.data.user.id
    };
    
    login(userWithIds, response.data.token);
    return response.data;
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  const value = {
    user,
    login,
    register,
    logout,
    loading,
    isFarmer: user?.role === 'farmer',
    isConsumer: user?.role === 'consumer'
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};