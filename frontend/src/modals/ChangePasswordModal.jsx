import React, { useState } from 'react';
import Modal from './ModalWrapper';

const ChangePasswordModal = ({ isOpen, onClose, onSubmit }) => {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleSubmit = () => {
    if (newPassword !== confirmPassword) {
      alert("Passwords do not match");
      return;
    }
    onSubmit({ currentPassword, newPassword });
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Change Password">
      <div className="space-y-4">
        <input 
          type="password" 
          placeholder="Current Password" 
          value={currentPassword} 
          onChange={(e) => setCurrentPassword(e.target.value)}
          className="w-full p-2 border rounded"
        />
        <input 
          type="password" 
          placeholder="New Password" 
          value={newPassword} 
          onChange={(e) => setNewPassword(e.target.value)}
          className="w-full p-2 border rounded"
        />
        <input 
          type="password" 
          placeholder="Confirm New Password" 
          value={confirmPassword} 
          onChange={(e) => setConfirmPassword(e.target.value)}
          className="w-full p-2 border rounded"
        />
        <button 
          onClick={handleSubmit} 
          className="w-full bg-primary-600 text-white p-2 rounded hover:bg-primary-700"
        >
          Change Password
        </button>
      </div>
    </Modal>
  );
};

export default ChangePasswordModal;
