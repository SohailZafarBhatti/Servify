import React, { useState } from 'react';
import { apiService } from '../services/apiService';
import { toast } from 'react-toastify';
import LoadingButton from './LoadingButton';

const TaskIssueReportModal = ({ isOpen, onClose, taskId, userId }) => {
  const [formData, setFormData] = useState({
    type: 'payment_dispute',
    description: '',
    taskId: taskId || null,
    userId: userId || null
  });

  // Update formData when props change
  React.useEffect(() => {
    setFormData(prev => ({
      ...prev,
      taskId: taskId || null,
      userId: userId || null
    }));
  }, [taskId, userId]);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.description.trim()) {
      toast.error('Please provide a description of the issue');
      return;
    }
    
    setLoading(true);
    try {
      const response = await apiService.issues.report(formData);
      
      if (response.error) {
        toast.error(`Failed to report issue: ${response.error.message}`);
      } else {
        toast.success('Issue reported successfully!');
        onClose();
        // Reset form
        setFormData({
          type: 'payment_dispute',
          description: '',
          taskId: taskId || null,
          userId: userId || null
        });
      }
    } catch (err) {
      toast.error('An error occurred. Please try again.');
      console.error('Error reporting issue:', err);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Report an Issue</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Issue Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Issue Type *
            </label>
            <select
              name="type"
              value={formData.type}
              onChange={handleChange}
              className="input-field"
            >
              <option value="payment_dispute">Payment Dispute</option>
              <option value="client_behavior">Client Behavior</option>
              <option value="safety_concern">Safety Concern</option>
              <option value="other">Other</option>
            </select>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description *
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={4}
              className="input-field"
              placeholder="Describe the issue in detail"
            />
          </div>

          {/* Submit Buttons */}
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
              loadingText="Submitting..."
              className="flex-1"
            >
              Submit Report
            </LoadingButton>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TaskIssueReportModal;