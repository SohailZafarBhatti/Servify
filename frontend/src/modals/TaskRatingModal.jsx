import React, { useState } from 'react';
import Modal from './ModalWrapper'; // Optional wrapper for consistent styling

const TaskRatingModal = ({ isOpen, onClose, task, onSubmit }) => {
  const [rating, setRating] = useState(0);
  const [feedback, setFeedback] = useState('');

  const handleSubmit = () => {
    onSubmit({ taskId: task?._id, rating, feedback });
    setRating(0);
    setFeedback('');
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Rate Task">
      <div className="space-y-4">
        <p className="text-gray-700">Rate your experience for task: <strong>{task?.title}</strong></p>
        <input 
          type="number" 
          min="1" max="5" 
          value={rating} 
          onChange={(e) => setRating(Number(e.target.value))} 
          className="w-full p-2 border rounded"
          placeholder="Rating (1-5)"
        />
        <textarea 
          value={feedback} 
          onChange={(e) => setFeedback(e.target.value)} 
          className="w-full p-2 border rounded" 
          placeholder="Feedback"
        />
        <button 
          onClick={handleSubmit} 
          className="w-full bg-primary-600 text-white p-2 rounded hover:bg-primary-700"
        >
          Submit Rating
        </button>
      </div>
    </Modal>
  );
};

export default TaskRatingModal;
