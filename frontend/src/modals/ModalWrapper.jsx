import React from 'react';

const ModalWrapper = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-md p-6 relative">
        <h2 className="text-lg font-semibold mb-4">{title}</h2>
        {children}
        <button 
          onClick={onClose} 
          className="absolute top-3 right-3 text-gray-500 hover:text-gray-900"
        >
          ×
        </button>
      </div>
    </div>
  );
};

export default ModalWrapper;
