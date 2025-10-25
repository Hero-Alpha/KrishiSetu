import React, { createContext, useState, useContext, useEffect } from 'react'; // ADD useEffect import
import { analyticsAPI } from '../services/api';

const AnalyticsContext = createContext();

export const useAnalytics = () => {
  const context = useContext(AnalyticsContext);
  if (!context) {
    throw new Error('useAnalytics must be used within an AnalyticsProvider');
  }
  return context;
};

export const AnalyticsProvider = ({ children }) => {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentPeriod, setCurrentPeriod] = useState('30d'); // Track current period for auto-refresh

  const getFarmerAnalytics = async (period = '30d') => {
    setLoading(true);
    setError(null);
    try {
      console.log('📊 Fetching analytics for period:', period);
      const response = await analyticsAPI.getFarmerAnalytics(period);
      console.log('📊 Analytics response:', response.data);
      setAnalytics(response.data.data.analytics);
      setCurrentPeriod(period); // Update current period
      return response.data.data.analytics;
    } catch (err) {
      console.error('❌ Analytics error:', err);
      const errorMessage = err.response?.data?.message || err.message || 'Failed to load analytics';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // FIXED: Real-time updates every 30 seconds when analytics data exists
  useEffect(() => {
    if (analytics) {
      const interval = setInterval(() => {
        console.log('🔄 Auto-refreshing analytics data...');
        getFarmerAnalytics(currentPeriod);
      }, 30000); // 30 seconds
      
      return () => clearInterval(interval);
    }
  }, [analytics, currentPeriod]); // Dependencies: analytics and currentPeriod

  const refreshAnalytics = (period = '30d') => {
    return getFarmerAnalytics(period);
  };

  const value = {
    analytics,
    loading,
    error,
    getFarmerAnalytics,
    refreshAnalytics,
    currentPeriod // Optional: expose current period if needed
  };

  return (
    <AnalyticsContext.Provider value={value}>
      {children}
    </AnalyticsContext.Provider>
  );
};