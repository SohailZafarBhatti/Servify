import React, { useState, useEffect } from 'react';
import { apiService } from '../services/apiService';
import { toast } from 'react-toastify';
import LoadingButton from './LoadingButton';

const ServiceInfoModal = ({ isOpen, onClose, user }) => {
  const [formData, setFormData] = useState({
    serviceDescription: '',
    experience: ''
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData({
        serviceDescription: user.serviceDescription || '',
        experience: user.experience || ''
      });
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.serviceDescription.trim()) {
      toast.error('Service description is required');
      return;
    }

    setLoading(true);
    try {
      const response = await apiService.profile.update(formData);
      
      if (response.error) {
        toast.error(`Failed to update service information: ${response.error.message}`);
      } else {
        toast.success('Service information updated successfully!');
        onClose();
      }
    } catch (err) {
      toast.error('An error occurred. Please try again.');
      console.error('Error updating service information:', err);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Update Service Information</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6">
          <div className="mb-4">
            <label htmlFor="serviceDescription" className="block text-sm font-medium text-gray-700 mb-1">
              Service Description*
            </label>
            <textarea
              id="serviceDescription"
              name="serviceDescription"
              value={formData.serviceDescription}
              onChange={handleChange}
              rows={4}
              className="input-field"
              placeholder="Describe the services you provide..."
            />
            <p className="text-xs text-gray-500 mt-1">
              Provide a detailed description of the services you offer, your specialties, and what makes your service unique.
            </p>
          </div>

          <div className="mb-6">
            <label htmlFor="experience" className="block text-sm font-medium text-gray-700 mb-1">
              Experience
            </label>
            <textarea
              id="experience"
              name="experience"
              value={formData.experience}
              onChange={handleChange}
              rows={3}
              className="input-field"
              placeholder="Describe your experience and qualifications..."
            />
            <p className="text-xs text-gray-500 mt-1">
              Share your years of experience, certifications, training, and previous work history relevant to your services.
            </p>
          </div>

          <div className="flex space-x-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 btn-secondary"
            >
              Cancel
            </button>
            <LoadingButton
              type="submit"
              isLoading={loading}
              loadingText="Saving..."
              className="flex-1"
            >
              Save Changes
            </LoadingButton>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ServiceInfoModal;