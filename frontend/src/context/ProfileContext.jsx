import React, { createContext, useState, useContext } from 'react';
import { profileAPI } from '../services/api';

const ProfileContext = createContext();

export const useProfile = () => {
  const context = useContext(ProfileContext);
  if (!context) {
    throw new Error('useProfile must be used within a ProfileProvider');
  }
  return context;
};

export const ProfileProvider = ({ children }) => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const getFarmerProfile = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await profileAPI.getFarmerProfile();
      setProfile(response.data.data.farmer);
      return response.data.data.farmer;
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to load profile';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const updateFarmerProfile = async (profileData) => {
    setLoading(true);
    try {
      const formData = new FormData();

      // Append all profile data with proper field names
      Object.keys(profileData).forEach(key => {
        if (key === 'farmImage' && profileData.farmImage instanceof File) {
          formData.append('farmImage', profileData.farmImage);
        } else if (key === 'location') {
          formData.append('location', JSON.stringify(profileData.location));
        } else if (key === 'businessHours') {
          formData.append('businessHours', JSON.stringify(profileData.businessHours));
        } else if (key === 'socialMedia') {
          formData.append('socialMedia', JSON.stringify(profileData.socialMedia));
        } else if (key === 'deliveryAreas') {
          formData.append('deliveryAreas', JSON.stringify(profileData.deliveryAreas));
        } else if (key === 'certifications') {
          formData.append('certifications', JSON.stringify(profileData.certifications));
        } else {
          formData.append(key, profileData[key]);
        }
      });

      const response = await profileAPI.updateFarmerProfile(formData);
      setProfile(response.data.data.farmer);
      return response.data.data.farmer;
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to update profile';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const value = {
    profile,
    loading,
    error,
    getFarmerProfile,
    updateFarmerProfile,
    refreshProfile: getFarmerProfile
  };

  return (
    <ProfileContext.Provider value={value}>
      {children}
    </ProfileContext.Provider>
  );
};