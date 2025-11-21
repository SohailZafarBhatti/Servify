import React from 'react';
import Modal from './ModalWrapper';

const TaskCancelModal = ({ isOpen, onClose, task, onSubmit }) => {
  const handleCancel = () => {
    onSubmit(task?._id);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Cancel Task">
      <div className="space-y-4 text-center">
        <p className="text-gray-700">Are you sure you want to cancel this task?</p>
        <p className="font-semibold">{task?.title}</p>
        <div className="flex justify-center gap-4">
          <button 
            onClick={onClose} 
            className="px-4 py-2 border rounded hover:bg-gray-100"
          >
            No
          </button>
          <button 
            onClick={handleCancel} 
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Yes, Cancel
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default TaskCancelModal;
