import React, { useState } from 'react';

const TaskCancelModal = ({ isOpen, onClose, task, onSubmit }) => {
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);

  const cancelReasons = [
    'I found another provider',
    'I no longer need this service',
    'The task details were incorrect',
    'I want to modify the task',
    'Other'
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!reason) {
      alert('Please select a reason for cancellation');
      return;
    }

    setLoading(true);
    try {
      await onSubmit({ reason, taskId: task.id });
      onClose();
    } catch (error) {
      console.error('Task cancellation failed:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Cancel Task</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            ✕
          </button>
        </div>

        <div className="mb-4">
          <p className="text-sm text-gray-600 mb-2">Task: {task?.title}</p>
          <p className="text-sm text-gray-600">Budget: ${task?.amount}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Cancellation Reason */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Reason for Cancellation *
            </label>
            <select
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              required
              className="input-field"
            >
              <option value="">Select a reason</option>
              {cancelReasons.map((cancelReason) => (
                <option key={cancelReason} value={cancelReason}>
                  {cancelReason}
                </option>
              ))}
            </select>
          </div>

          {/* Additional Comments */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Additional Comments (Optional)
            </label>
            <textarea
              rows={3}
              className="input-field"
              placeholder="Any additional details about the cancellation..."
            />
          </div>

          {/* Warning Message */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
            <div className="flex">
              <div className="flex-shrink-0">
                <span className="text-yellow-400">⚠️</span>
              </div>
              <div className="ml-3">
                <p className="text-sm text-yellow-800">
                  <strong>Warning:</strong> Canceling this task will notify the service provider and may affect your account rating.
                </p>
              </div>
            </div>
          </div>

          {/* Submit Buttons */}
          <div className="flex space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 btn-secondary"
            >
              Keep Task
            </button>
            <button
              type="submit"
              disabled={loading || !reason}
              className="flex-1 btn-secondary bg-red-600 text-white hover:bg-red-700 disabled:opacity-50"
            >
              {loading ? 'Canceling...' : 'Cancel Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TaskCancelModal;
