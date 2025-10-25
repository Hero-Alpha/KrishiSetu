import React, { createContext, useState, useContext, useEffect } from 'react';
import { productsAPI } from '../services/api';

const ProductContext = createContext();

export const useProducts = () => {
  const context = useContext(ProductContext);
  if (!context) {
    throw new Error('useProducts must be used within a ProductProvider');
  }
  return context;
};

export const ProductProvider = ({ children }) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
  setLoading(true);
  setError(null);
  try {
    const response = await productsAPI.getAll();
    console.log('Products API response:', response.data); // DEBUG
    setProducts(response.data.data.products || []);
  } catch (err) {
    setError(err.response?.data?.message || 'Failed to load products');
    console.error('Load products error:', err);
  } finally {
    setLoading(false);
  }
};

const getFarmerProducts = async (farmerId) => {
  try {
    console.log('🔄 Fetching farmer products for ID:', farmerId);
    const response = await productsAPI.getMyProducts();
    console.log('✅ Farmer products response:', response.data);
    
    if (response.data.data && Array.isArray(response.data.data.products)) {
      return response.data.data.products;
    } else {
      console.warn('⚠️ Unexpected response format:', response.data);
      return [];
    }
  } catch (err) {
    console.error('❌ Get farmer products error:', err);
    console.error('❌ Error details:', err.response?.data);
    return [];
  }
};

  const addProduct = async (productData) => {
    try {
      const response = await productsAPI.create(productData);
      const newProduct = response.data.data.product;
      setProducts(prev => [newProduct, ...prev]);
      return newProduct;
    } catch (err) {
      throw new Error(err.response?.data?.message || 'Failed to add product');
    }
  };

  const updateProduct = async (productId, updates) => {
    try {
      const response = await productsAPI.update(productId, updates);
      const updatedProduct = response.data.data.product;
      setProducts(prev => prev.map(product =>
        product._id === productId ? updatedProduct : product
      ));
      return updatedProduct;
    } catch (err) {
      throw new Error(err.response?.data?.message || 'Failed to update product');
    }
  };

  const deleteProduct = async (productId) => {
    try {
      await productsAPI.delete(productId);
      setProducts(prev => prev.filter(product => product._id !== productId));
    } catch (err) {
      throw new Error(err.response?.data?.message || 'Failed to delete product');
    }
  };

  const value = {
    products,
    loading,
    error,
    getFarmerProducts,
    addProduct,
    updateProduct,
    deleteProduct,
    refreshProducts: loadProducts
  };

  return (
    <ProductContext.Provider value={value}>
      {children}
    </ProductContext.Provider>
  );
};