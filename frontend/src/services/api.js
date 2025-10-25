import axios from 'axios';

// Create axios instance
const API = axios.create({
  baseURL: 'http://localhost:5000/api',
  timeout: 10000,
});

// Add token to requests
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Handle responses
API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  register: (userData) => API.post('/auth/register', userData),
  login: (credentials) => API.post('/auth/login', credentials),
  getProfile: () => API.get('/auth/me'),
};

// Users API
export const usersAPI = {
  getProfile: () => API.get('/users/profile'),
  updateProfile: (userData) => API.put('/users/profile', userData),
};

// Products API
export const productsAPI = {
  getAll: (params = {}) => API.get('/products', { params }),
  getById: (id) => API.get(`/products/${id}`),
  create: (productData) => {
    const formData = new FormData();

    // Append all product data
    Object.keys(productData).forEach(key => {
      if (key === 'images' && productData.images) {
        // Append each image file
        productData.images.forEach((image, index) => {
          if (image instanceof File) {
            formData.append('images', image);
          }
        });
      } else {
        formData.append(key, productData[key]);
      }
    });

    return API.post('/products', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
  update: (id, productData) => {
    const formData = new FormData();

    Object.keys(productData).forEach(key => {
      if (key === 'images' && productData.images) {
        productData.images.forEach((image, index) => {
          if (image instanceof File) {
            formData.append('images', image);
          }
        });
      } else {
        formData.append(key, productData[key]);
      }
    });

    return API.put(`/products/${id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
  delete: (id) => API.delete(`/products/${id}`),
  getMyProducts: () => API.get('/products/farmer/my-products'),
};

// Orders API
export const ordersAPI = {
  create: (orderData) => API.post('/orders', orderData),
  getMyOrders: () => API.get('/orders/my-orders'),
  getFarmerOrders: () => API.get('/orders/farmer/orders'),
  updateStatus: (orderId, status) => API.patch(`/orders/${orderId}/status`, { status }),
  getUserOrdersForProduct: (productId) => API.get(`/orders/my-orders?product=${productId}`),
  cancelOrder: (orderId) => API.patch(`/orders/${orderId}/cancel`),
};

// Reviews API
export const reviewsAPI = {
  getByProduct: (productId, params = {}) => API.get(`/reviews/product/${productId}`, { params }),
  create: (reviewData) => API.post('/reviews', reviewData),
  update: (id, reviewData) => API.put(`/reviews/${id}`, reviewData),
  delete: (id) => API.delete(`/reviews/${id}`),
  getMyReviews: () => API.get('/reviews/my-reviews'),
  getRatingSummary: (productId) => API.get(`/reviews/product/${productId}/summary`),
};

// Analytics API
export const analyticsAPI = {
  getFarmerAnalytics: (period = '30d') => API.get(`/analytics/farmer?period=${period}`),
};

// Profile API
export const profileAPI = {
  getFarmerProfile: () => API.get('/profile/farmer'),
  updateFarmerProfile: (data) => API.put('/profile/farmer', data, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  }),
  getPublicFarmerProfile: (farmerId) => API.get(`/profile/farmer/${farmerId}/public`),
};

// Health check
export const healthAPI = {
  check: () => API.get('/health'),
};

export default API;