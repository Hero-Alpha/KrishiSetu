import React, { useState, useEffect } from 'react';
import { useProfile } from '../context/ProfileContext';
import { useNotifications } from '../context/NotificationContext';

const EditProfileModal = ({ isOpen, onClose, onProfileUpdated }) => {
  const { profile, updateFarmerProfile, loading } = useProfile();
  const { notify } = useNotifications();

  const [formData, setFormData] = useState({
    farmName: '',
    farmDescription: '',
    farmImage: null,
    phone: '',
    whatsapp: '',
    location: {
      address: '',
      city: '',
      state: '',
      pincode: ''
    },
    businessHours: {
      monday: { open: '09:00', close: '18:00' },
      tuesday: { open: '09:00', close: '18:00' },
      wednesday: { open: '09:00', close: '18:00' },
      thursday: { open: '09:00', close: '18:00' },
      friday: { open: '09:00', close: '18:00' },
      saturday: { open: '09:00', close: '18:00' },
      sunday: { open: '09:00', close: '18:00' }
    },
    deliveryAreas: [],
    farmSince: '',
    certifications: [],
    socialMedia: {
      website: '',
      facebook: '',
      instagram: '',
      youtube: ''
    }
  });
  const [newDeliveryArea, setNewDeliveryArea] = useState('');
  const [newCertification, setNewCertification] = useState('');

  // Initialize form with profile data
  useEffect(() => {
    if (profile && isOpen) {
      setFormData({
        farmName: profile.farmName || '',
        farmDescription: profile.farmDescription || '',
        farmImage: profile.farmImage || null,
        phone: profile.phone || '',
        whatsapp: profile.contact?.whatsapp || '',
        location: {
          address: profile.location?.address || '',
          city: profile.location?.city || '',
          state: profile.location?.state || '',
          pincode: profile.location?.pincode || ''
        },
        businessHours: profile.businessHours || {
          monday: { open: '09:00', close: '18:00' },
          tuesday: { open: '09:00', close: '18:00' },
          wednesday: { open: '09:00', close: '18:00' },
          thursday: { open: '09:00', close: '18:00' },
          friday: { open: '09:00', close: '18:00' },
          saturday: { open: '09:00', close: '18:00' },
          sunday: { open: '09:00', close: '18:00' }
        },
        deliveryAreas: profile.deliveryAreas || [],
        farmSince: profile.farmSince ? new Date(profile.farmSince).toISOString().split('T')[0] : '',
        certifications: profile.certifications || [],
        socialMedia: profile.socialMedia || {
          website: '',
          facebook: '',
          instagram: '',
          youtube: ''
        }
      });
    }
  }, [profile, isOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else if (name.includes('_')) {
      const [parent, day, type] = name.split('_');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [day]: {
            ...prev[parent][day],
            [type]: value
          }
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData(prev => ({
        ...prev,
        farmImage: file
      }));
    }
  };

  const addDeliveryArea = () => {
    if (newDeliveryArea.trim() && !formData.deliveryAreas.includes(newDeliveryArea.trim())) {
      setFormData(prev => ({
        ...prev,
        deliveryAreas: [...prev.deliveryAreas, newDeliveryArea.trim()]
      }));
      setNewDeliveryArea('');
    }
  };

  const removeDeliveryArea = (area) => {
    setFormData(prev => ({
      ...prev,
      deliveryAreas: prev.deliveryAreas.filter(a => a !== area)
    }));
  };

  const addCertification = () => {
    if (newCertification.trim() && !formData.certifications.includes(newCertification.trim())) {
      setFormData(prev => ({
        ...prev,
        certifications: [...prev.certifications, newCertification.trim()]
      }));
      setNewCertification('');
    }
  };

  const removeCertification = (cert) => {
    setFormData(prev => ({
      ...prev,
      certifications: prev.certifications.filter(c => c !== cert)
    }));
  };


  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await updateFarmerProfile(formData);

      // FIXED: Check if notify exists before using it
      if (notify && notify.success) {
        notify.success('Profile Updated', 'Your farm profile has been updated successfully!');
      } else {
        console.log('Profile updated successfully!');
        // Fallback: Show a simple alert or just close
        alert('Profile updated successfully!');
      }

      onProfileUpdated();
      onClose();
    } catch (error) {
      console.error('Profile update error:', error);

      // FIXED: Safe error notification
      if (notify && notify.error) {
        notify.error('Update Failed', error.message || 'Failed to update profile. Please try again.');
      } else {
        console.error('Update failed:', error.message);
        alert('Update failed: ' + (error.message || 'Please try again.'));
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75" onClick={onClose}></div>

        <div className="relative inline-block px-4 pt-5 pb-4 overflow-hidden text-left align-bottom transition-all transform bg-white rounded-lg shadow-xl sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full sm:p-6">
          <h3 className="text-lg font-medium leading-6 text-gray-900 mb-4">
            Edit Farm Profile
          </h3>

          <form onSubmit={handleSubmit} className="space-y-6 max-h-96 overflow-y-auto pr-2">
            {/* Farm Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Farm Name *
                </label>
                <input
                  type="text"
                  name="farmName"
                  required
                  value={formData.farmName}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Farm Since
                </label>
                <input
                  type="date"
                  name="farmSince"
                  value={formData.farmSince}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Farm Description
              </label>
              <textarea
                name="farmDescription"
                rows="3"
                value={formData.farmDescription}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="Tell customers about your farm, practices, and values..."
                maxLength="500"
              />
              <p className="text-xs text-gray-500 mt-1">
                {formData.farmDescription.length}/500 characters
              </p>
            </div>

            {/* Farm Image */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Farm Image
              </label>
              <div className="flex items-center space-x-4">
                {formData.farmImage && (
                  <div className="w-16 h-16 rounded-full overflow-hidden bg-green-100">
                    <img
                      src={formData.farmImage instanceof File ? URL.createObjectURL(formData.farmImage) : formData.farmImage}
                      alt="Farm preview"
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
            </div>

            {/* Contact Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone Number *
                </label>
                <input
                  type="tel"
                  name="phone"
                  required
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  WhatsApp Number
                </label>
                <input
                  type="tel"
                  name="whatsapp"
                  value={formData.whatsapp}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
            </div>

            {/* Location */}
            <div className="space-y-4">
              <h4 className="font-semibold text-gray-900">Farm Location</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input
                  type="text"
                  name="location.address"
                  placeholder="Street Address"
                  value={formData.location.address}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                />
                <input
                  type="text"
                  name="location.city"
                  placeholder="City"
                  value={formData.location.city}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                />
                <input
                  type="text"
                  name="location.state"
                  placeholder="State"
                  value={formData.location.state}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                />
                <input
                  type="text"
                  name="location.pincode"
                  placeholder="Pincode"
                  value={formData.location.pincode}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
            </div>

            {/* Delivery Areas */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Delivery Areas
              </label>
              <div className="flex space-x-2 mb-2">
                <input
                  type="text"
                  value={newDeliveryArea}
                  onChange={(e) => setNewDeliveryArea(e.target.value)}
                  onKeyPress={(e) => handleKeyPress(e, addDeliveryArea)}
                  placeholder="Add delivery area"
                  className="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                />
                <button
                  type="button"
                  onClick={addDeliveryArea}
                  className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg"
                >
                  Add
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {formData.deliveryAreas.map((area, index) => (
                  <span
                    key={index}
                    className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm flex items-center space-x-1"
                  >
                    <span>{area}</span>
                    <button
                      type="button"
                      onClick={() => removeDeliveryArea(area)}
                      className="text-green-600 hover:text-green-800"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            </div>

            {/* Certifications */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Certifications
              </label>
              <div className="flex space-x-2 mb-2">
                <input
                  type="text"
                  value={newCertification}
                  onChange={(e) => setNewCertification(e.target.value)}
                  onKeyPress={(e) => handleKeyPress(e, addCertification)}
                  placeholder="Add certification"
                  className="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                />
                <button
                  type="button"
                  onClick={addCertification}
                  className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg"
                >
                  Add
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {formData.certifications.map((cert, index) => (
                  <span
                    key={index}
                    className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm flex items-center space-x-1"
                  >
                    <span>{cert}</span>
                    <button
                      type="button"
                      onClick={() => removeCertification(cert)}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            </div>
            {/* Business Hours */}
            <div className="space-y-4">
              <h4 className="font-semibold text-gray-900">Business Hours</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.entries(formData.businessHours).map(([day, hours]) => (
                  <div key={day} className="flex items-center space-x-2">
                    <label className="w-20 text-sm font-medium text-gray-700 capitalize">
                      {day}:
                    </label>
                    <div className="flex space-x-2">
                      <input
                        type="time"
                        name={`businessHours_${day}_open`}
                        value={hours.open}
                        onChange={handleChange}
                        className="flex-1 border border-gray-300 rounded-lg px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-green-500"
                      />
                      <span className="self-center">-</span>
                      <input
                        type="time"
                        name={`businessHours_${day}_close`}
                        value={hours.close}
                        onChange={handleChange}
                        className="flex-1 border border-gray-300 rounded-lg px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-green-500"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
            {/* Social Media */}
            <div className="space-y-4">
              <h4 className="font-semibold text-gray-900">Social Media</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input
                  type="url"
                  name="socialMedia.website"
                  placeholder="Website URL"
                  value={formData.socialMedia.website}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                />
                <input
                  type="url"
                  name="socialMedia.facebook"
                  placeholder="Facebook URL"
                  value={formData.socialMedia.facebook}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                />
                <input
                  type="url"
                  name="socialMedia.instagram"
                  placeholder="Instagram URL"
                  value={formData.socialMedia.instagram}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                />
                <input
                  type="url"
                  name="socialMedia.youtube"
                  placeholder="YouTube URL"
                  value={formData.socialMedia.youtube}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
            </div>
          </form>

          <div className="flex justify-end space-x-3 pt-6 mt-6 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-transparent rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              onClick={handleSubmit}
              disabled={loading}
              className="px-4 py-2 text-sm font-medium text-white bg-green-600 border border-transparent rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
            >
              {loading ? 'Updating...' : 'Update Profile'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditProfileModal;