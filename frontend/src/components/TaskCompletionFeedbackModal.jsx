import React, { useState } from 'react';
import { toast } from 'react-toastify';
import LoadingButton from './LoadingButton';

const TaskCompletionFeedbackModal = ({ isOpen, onClose, task, onSubmit }) => {
  const [formData, setFormData] = useState({
    rating: 5,
    feedback: '',
    workSatisfaction: 5,
    communication: 5,
    payment: 5
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name.includes('rating') || name === 'rating' || name === 'workSatisfaction' || name === 'communication' || name === 'payment' 
        ? parseInt(value) 
        : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (formData.rating < 1 || formData.rating > 5) {
      toast.error('Rating must be between 1 and 5');
      return;
    }

    setLoading(true);
    try {
      await onSubmit({
        ...formData,
        taskId: task._id,
        customerId: task.createdBy._id
      });
      
      toast.success('Task completed successfully!');
      onClose();
      
      // Reset form
      setFormData({
        rating: 5,
        feedback: '',
        workSatisfaction: 5,
        communication: 5,
        payment: 5
      });
    } catch (err) {
      toast.error('Failed to complete task. Please try again.');
      console.error('Error completing task with feedback:', err);
    } finally {
      setLoading(false);
    }
  };

  const StarRating = ({ value, onChange, name, label }) => (
    <div className="mb-4">
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {label}
      </label>
      <div className="flex space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => onChange({ target: { name, value: star } })}
            className={`w-8 h-8 ${
              star <= value 
                ? 'text-yellow-400' 
                : 'text-gray-300'
            } hover:text-yellow-400 transition-colors`}
          >
            <svg className="w-full h-full fill-current" viewBox="0 0 24 24">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
            </svg>
          </button>
        ))}
      </div>
      <span className="text-sm text-gray-500 ml-2">{value}/5</span>
    </div>
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Complete Task & Provide Feedback</h2>
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
          <div className="mb-6">
            <h3 className="text-lg font-medium text-gray-800 mb-2">Task: {task?.title}</h3>
            <p className="text-sm text-gray-600 mb-2">Customer: {task?.createdBy?.name}</p>
            <p className="text-sm text-gray-500">Please rate your experience working on this task:</p>
          </div>

          <StarRating
            value={formData.rating}
            onChange={handleChange}
            name="rating"
            label="Overall Experience"
          />

          <StarRating
            value={formData.workSatisfaction}
            onChange={handleChange}
            name="workSatisfaction"
            label="Work Satisfaction"
          />

          <StarRating
            value={formData.communication}
            onChange={handleChange}
            name="communication"
            label="Customer Communication"
          />

          <StarRating
            value={formData.payment}
            onChange={handleChange}
            name="payment"
            label="Payment Process"
          />

          <div className="mb-6">
            <label htmlFor="feedback" className="block text-sm font-medium text-gray-700 mb-2">
              Additional Comments (Optional)
            </label>
            <textarea
              id="feedback"
              name="feedback"
              value={formData.feedback}
              onChange={handleChange}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              placeholder="Share your experience working on this task..."
            />
            <p className="text-xs text-gray-500 mt-1">
              Your feedback helps improve the platform for all service providers.
            </p>
          </div>

          <div className="flex space-x-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
            >
              Cancel
            </button>
            <LoadingButton
              type="submit"
              isLoading={loading}
              loadingText="Completing..."
              className="flex-1 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md transition-colors"
            >
              Complete Task
            </LoadingButton>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TaskCompletionFeedbackModal;