import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { apiService } from '../services/apiService';
import { toast } from 'react-toastify';

// Form validation schema
const taskSchema = yup.object({
  title: yup.string().required('Task title is required').min(5, 'Title must be at least 5 characters'),
  description: yup.string().required('Task description is required').min(10, 'Description must be at least 10 characters'),
  category: yup.string().required('Category is required'),
  budget: yup.number().required('Budget is required').positive('Budget must be positive'),
  location: yup.string().required('Location is required'),
  preferredDate: yup.date().required('Preferred date is required'),
  preferredTime: yup.string().required('Preferred time is required')
}).required();

const CreateTask = () => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  
  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    resolver: yupResolver(taskSchema),
    defaultValues: {
      title: '',
      description: '',
      category: '',
      budget: '',
      location: '',
      preferredDate: '',
      preferredTime: ''
    }
  });

  // Clear any previous errors when component mounts
  useEffect(() => {
    setError(null);
  }, []);

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    setError(null); // Clear any previous errors
    
    try {
      console.log('=== CREATE TASK FRONTEND DEBUG ===');
      console.log('Form data received:', data);
      
      // Format the data for the API
      const taskData = {
        title: data.title,
        description: data.description,
        category: data.category,
        budget: {
          min: Number(data.budget) * 0.9, // Set min budget as 90% of entered value
          max: Number(data.budget) * 1.1  // Set max budget as 110% of entered value
        },
        location: {
          address: data.location,
          coordinates: {
            lat: 0, // Placeholder for latitude
            lng: 0  // Placeholder for longitude
          }
        },
        preferredDate: data.preferredDate,
        preferredTime: data.preferredTime,
        priority: 'medium' // Default priority
      };
      
      console.log('Submitting task data:', taskData);
      
      const response = await apiService.tasks.create(taskData);
      console.log('API response received:', response);
      
      if (response.error) {
        console.error('API returned error:', response.error);
        const errorMessage = `Failed to create task: ${response.error.message || 'Unknown error'}`;
        setError(errorMessage);
        // Fallback to console.log if toast fails
        try {
          toast.error(errorMessage);
        } catch (toastError) {
          console.error('Toast error:', toastError);
          alert(errorMessage);
        }
      } else if (response.data) {
        console.log('Task created successfully:', response.data);
        // Fallback to console.log if toast fails
        try {
          toast.success('Task created successfully!');
        } catch (toastError) {
          console.error('Toast error:', toastError);
          alert('Task created successfully!');
        }
        reset();
        // Redirect to the task list
        navigate('/my-tasks');
      } else {
        console.error('Unexpected response format:', response);
        const errorMessage = 'Unexpected response from server. Please try again.';
        setError(errorMessage);
        // Fallback to console.log if toast fails
        try {
          toast.error(errorMessage);
        } catch (toastError) {
          console.error('Toast error:', toastError);
          alert(errorMessage);
        }
      }
    } catch (err) {
      console.error('=== CREATE TASK ERROR ===');
      console.error('Error details:', err);
      console.error('Error message:', err.message);
      console.error('Error stack:', err.stack);
      console.error('=== CREATE TASK ERROR END ===');
      
      const errorMessage = 'An error occurred while creating the task. Please try again.';
      setError(errorMessage);
      // Fallback to console.log if toast fails
      try {
        toast.error(errorMessage);
      } catch (toastError) {
        console.error('Toast error:', toastError);
        alert(errorMessage);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="page-container">
      <div className="section-container">
        <div className="card">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">Post a New Task</h1>
          <p className="text-gray-600 mb-6">Fill out the form below to create a new task request.</p>
          
          {/* Error Display */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">Error</h3>
                  <div className="mt-2 text-sm text-red-700">
                    <p>{error}</p>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Task Title */}
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">Task Title</label>
              <input
                id="title"
                type="text"
                {...register('title')}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
                placeholder="e.g., House Cleaning, Plumbing Repair"
              />
              {errors.title && <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>}
            </div>
            
            {/* Task Description */}
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">Task Description</label>
              <textarea
                id="description"
                {...register('description')}
                rows="4"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
                placeholder="Describe what you need help with..."
              ></textarea>
              {errors.description && <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>}
            </div>
            
            {/* Category */}
            <div>
              <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">Category</label>
              <select
                id="category"
                {...register('category')}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
              >
                <option value="">Select a category</option>
                <option value="cleaning">Cleaning</option>
                <option value="plumbing">Plumbing</option>
                <option value="electrical">Electrical</option>
                <option value="carpentry">Carpentry</option>
                <option value="painting">Painting</option>
                <option value="gardening">Gardening</option>
                <option value="other">Other</option>
              </select>
              {errors.category && <p className="mt-1 text-sm text-red-600">{errors.category.message}</p>}
            </div>
            
            {/* Budget */}
            <div>
              <label htmlFor="budget" className="block text-sm font-medium text-gray-700 mb-1">Estimated Budget ()</label>
              <input
                id="budget"
                type="number"
                {...register('budget')}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
                placeholder="e.g., 50"
                min="1"
                step="0.01"
              />
              <p className="mt-1 text-sm text-gray-500">
                We'll set a budget range of ±10% around your estimate
              </p>
              {errors.budget && <p className="mt-1 text-sm text-red-600">{errors.budget.message}</p>}
            </div>
            
            {/* Location */}
            <div>
              <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">Location/Address</label>
              <input
                id="location"
                type="text"
                {...register('location')}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
                placeholder="Enter your address"
              />
              {errors.location && <p className="mt-1 text-sm text-red-600">{errors.location.message}</p>}
            </div>
            
            {/* Preferred Date */}
            <div>
              <label htmlFor="preferredDate" className="block text-sm font-medium text-gray-700 mb-1">Preferred Date</label>
              <input
                id="preferredDate"
                type="date"
                {...register('preferredDate')}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
                min={new Date().toISOString().split('T')[0]}
              />
              {errors.preferredDate && <p className="mt-1 text-sm text-red-600">{errors.preferredDate.message}</p>}
            </div>
            
            {/* Preferred Time */}
            <div>
              <label htmlFor="preferredTime" className="block text-sm font-medium text-gray-700 mb-1">Preferred Time</label>
              <select
                id="preferredTime"
                {...register('preferredTime')}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
              >
                <option value="">Select preferred time</option>
                <option value="morning">Morning (8am - 12pm)</option>
                <option value="afternoon">Afternoon (12pm - 5pm)</option>
                <option value="evening">Evening (5pm - 9pm)</option>
                <option value="anytime">Anytime</option>
              </select>
              {errors.preferredTime && <p className="mt-1 text-sm text-red-600">{errors.preferredTime.message}</p>}
            </div>
            
            {/* Submit Button */}
            <div className="pt-4">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full btn-primary py-3 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Creating Task...' : 'Post Task'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateTask;
