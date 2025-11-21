import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';

const TaskDetail = () => {
  const navigate = useNavigate();
  const { taskId } = useParams();

  const handleChatClick = () => {
    navigate(`/chat?task=${taskId}`);
  };

  return (
    <div className="page-container">
      <div className="section-container">
        <div className="card">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">Task Details</h1>
          <p className="text-gray-600 mb-4">This page will show detailed information about a specific task.</p>
          <div className="space-y-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <h2 className="text-lg font-semibold text-gray-800 mb-2">Task Information</h2>
              <p className="text-gray-600">Task details will be displayed here...</p>
            </div>
            <div className="flex space-x-4">
              <button className="btn-primary">Accept Task</button>
              <button className="btn-secondary">Contact Provider</button>
              <button 
                className="btn-primary bg-green-600 hover:bg-green-700"
                onClick={handleChatClick}
              >
                💬 Chat
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaskDetail;
