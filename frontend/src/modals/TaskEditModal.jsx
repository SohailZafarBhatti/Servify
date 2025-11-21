import React, { useState, useEffect } from 'react';
import Modal from './ModalWrapper';

const TaskEditModal = ({ isOpen, onClose, task, onSubmit }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');

  useEffect(() => {
    if (task) {
      setTitle(task.title);
      setDescription(task.description);
    }
  }, [task]);

  const handleSubmit = () => {
    onSubmit({ ...task, title, description });
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Edit Task">
      <div className="space-y-4">
        <input 
          value={title} 
          onChange={(e) => setTitle(e.target.value)} 
          className="w-full p-2 border rounded" 
          placeholder="Task Title" 
        />
        <textarea 
          value={description} 
          onChange={(e) => setDescription(e.target.value)} 
          className="w-full p-2 border rounded" 
          placeholder="Task Description"
        />
        <button 
          onClick={handleSubmit} 
          className="w-full bg-primary-600 text-white p-2 rounded hover:bg-primary-700"
        >
          Save Changes
        </button>
      </div>
    </Modal>
  );
};

export default TaskEditModal;
