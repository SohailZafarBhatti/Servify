import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { apiService } from '../services/apiService';
import { toast } from 'react-toastify';
import LoadingSpinner from '../components/LoadingSpinner';

const MyTasks = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('all');
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch user's tasks
  useEffect(() => {
    const fetchTasks = async () => {
      try {
        setLoading(true);
        setError(null);
        
        console.log('=== MY TASKS DEBUG ===');
        const response = await apiService.tasks.getMyTasks();
        console.log('API response:', response);
        
        if (response.error) {
          console.error('API error:', response.error);
          setError(response.error.message);
          setTasks([]); // Ensure tasks is always an array
        } else if (response.data) {
          // Handle different response formats
          let tasksData = [];
          
          if (Array.isArray(response.data)) {
            // Direct array
            tasksData = response.data;
          } else if (response.data.data && Array.isArray(response.data.data)) {
            // Nested data structure
            tasksData = response.data.data;
          } else if (response.data.tasks && Array.isArray(response.data.tasks)) {
            // Tasks property
            tasksData = response.data.tasks;
          } else {
            console.error('Unexpected response format:', response.data);
            setError('Invalid response format from server');
            setTasks([]);
            return;
          }
          
          console.log('Processed tasks data:', tasksData);
          setTasks(tasksData);
        } else {
          console.error('No data in response:', response);
          setError('No data received from server');
          setTasks([]);
        }
      } catch (err) {
        console.error('=== MY TASKS ERROR ===');
        console.error('Error details:', err);
        console.error('Error message:', err.message);
        console.error('=== MY TASKS ERROR END ===');
        
        setError('Failed to fetch tasks. Please try again.');
        setTasks([]); // Ensure tasks is always an array
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchTasks();
    }
  }, [user]);

  // Handle task actions
  const handleTaskAction = async (taskId, action, data = {}) => {
    try {
      let response;
      
      switch (action) {
        case 'start':
          response = await apiService.tasks.updateStatus(taskId, 'in_progress');
          break;
        case 'complete':
          response = await apiService.tasks.updateStatus(taskId, 'completed');
          break;
        case 'cancel':
          response = await apiService.tasks.updateStatus(taskId, 'cancelled', data);
          break;
      default:
          return;
      }

      if (response.error) {
        toast.error(`Failed to ${action} task: ${response.error.message}`);
      } else {
        toast.success(`Task ${action}ed successfully!`);
        // Refresh tasks
        window.location.reload();
      }
    } catch (err) {
      toast.error(`An error occurred while ${action}ing task. Please try again.`);
      console.error(`Error ${action}ing task:`, err);
    }
  };

  // Navigate to chat for a task
  const handleChatClick = (taskId) => {
    navigate(`/chat?task=${taskId}`);
  };

  // Navigate to task details
  const handleViewDetails = (taskId) => {
    navigate(`/tasks/${taskId}`);
  };

  // Get status color
  const getStatusColor = (status) => {
    switch (status) {
      case 'posted':
        return 'bg-blue-100 text-blue-800';
      case 'accepted':
        return 'bg-yellow-100 text-yellow-800';
      case 'in_progress':
        return 'bg-orange-100 text-orange-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Get status text
  const getStatusText = (status) => {
    return status.replace('_', ' ').charAt(0).toUpperCase() + status.replace('_', ' ').slice(1);
  };

  // Ensure tasks is always an array and filter tasks based on active tab
  const safeTasks = Array.isArray(tasks) ? tasks : [];
  const filteredTasks = safeTasks.filter(task => {
    if (activeTab === 'all') return true;
    return task.status === activeTab;
  });

  // Define tabs based on user role
  const getTabs = () => {
    if (user?.role === 'service_provider') {
      return [
        { id: 'all', label: 'All Tasks', count: safeTasks.length },
        { id: 'accepted', label: 'Accepted', count: safeTasks.filter(t => t.status === 'accepted').length },
        { id: 'in_progress', label: 'In Progress', count: safeTasks.filter(t => t.status === 'in_progress').length },
        { id: 'completed', label: 'Completed', count: safeTasks.filter(t => t.status === 'completed').length }
      ];
    } else {
      return [
        { id: 'all', label: 'All Tasks', count: safeTasks.length },
        { id: 'posted', label: 'Posted', count: safeTasks.filter(t => t.status === 'posted').length },
        { id: 'accepted', label: 'Accepted', count: safeTasks.filter(t => t.status === 'accepted').length },
        { id: 'completed', label: 'Completed', count: safeTasks.filter(t => t.status === 'completed').length }
      ];
    }
  };

  const tabs = getTabs();

  if (loading) {
    return (
      <div className="page-container">
        <div className="section-container">
          <div className="card">
            <LoadingSpinner />
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="page-container">
        <div className="section-container">
          <div className="card">
            <div className="text-center py-8">
              <h2 className="text-xl font-semibold text-red-600 mb-4">Error</h2>
              <p className="text-gray-600 mb-4">{error}</p>
              <button 
                onClick={() => window.location.reload()}
                className="btn-primary"
              >
                Retry
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="section-container">
        {/* Header */}
        <div className="card mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {user?.role === 'service_provider' ? 'My Assigned Tasks' : 'My Posted Tasks'}
              </h1>
              <p className="text-gray-600">
                {user?.role === 'service_provider' 
                  ? 'Track and manage your assigned tasks'
                  : 'Monitor the status of your service requests'
                }
              </p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-primary-600">
                {safeTasks.length}
              </p>
              <p className="text-sm text-gray-600">Total Tasks</p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="card mb-8">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-primary-500 text-primary-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {tab.label}
                  <span className="ml-2 bg-gray-100 text-gray-900 py-0.5 px-2.5 rounded-full text-xs font-medium">
                    {tab.count}
                  </span>
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Tasks List */}
        <div className="space-y-6">
          {filteredTasks.length === 0 ? (
            <div className="card text-center py-12">
              <div className="text-6xl mb-4">📋</div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No tasks found</h3>
              <p className="text-gray-600">
                {activeTab === 'all' 
                  ? 'You don\'t have any tasks yet.'
                  : `No ${activeTab} tasks found.`
                }
              </p>
              {user?.role === 'user' && (
                <button
                  onClick={() => navigate('/create-task')}
                  className="btn-primary mt-4"
                >
                  Post Your First Task
                </button>
              )}
            </div>
          ) : (
            filteredTasks.map((task) => (
              <div key={task._id} className="card-hover">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">{task.title}</h3>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(task.status)}`}>
                        {getStatusText(task.status)}
                      </span>
                      {task.priority && (
                        <span className={`px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800`}>
                          {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)} Priority
                        </span>
                      )}
                    </div>
                    
                    <p className="text-gray-600 mb-3">{task.description}</p>
                    
                    <div className="flex items-center space-x-6 text-sm text-gray-500">
                      <div className="flex items-center space-x-1">
                        <span>📅</span>
                        <span>{new Date(task.preferredDate).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <span>📍</span>
                        <span>{task.location.address}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <span>🏷️</span>
                        <span className="capitalize">{task.category}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <span>💰</span>
                        <span>${task.budget.min} - ${task.budget.max}</span>
                      </div>
                      {user?.role === 'service_provider' ? (
                        <div className="flex items-center space-x-1">
                          <span>👤</span>
                          <span>{task.createdBy?.name || 'Unknown User'}</span>
                        </div>
                      ) : (
                        <div className="flex items-center space-x-1">
                          <span>👷</span>
                          <span>{task.assignedTo?.name || 'No provider assigned'}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="text-right ml-6">
                    <div className="text-2xl font-bold text-primary-600 mb-2">
                      ${task.budget.min} - ${task.budget.max}
                    </div>
                    <div className="space-y-2">
                      <button 
                        onClick={() => handleViewDetails(task._id)}
                        className="btn-primary text-sm px-4 py-2"
                      >
                        View Details
                      </button>
                      
                      {/* Chat button for accepted tasks */}
                      {(task.status === 'accepted' || task.status === 'in_progress') && (
                        <button 
                          onClick={() => handleChatClick(task._id)}
                          className="btn-secondary text-sm px-4 py-2 w-full"
                        >
                          💬 Chat
                        </button>
                      )}
                      
                      {/* Action buttons based on status and user role */}
                      {user?.role === 'service_provider' && task.status === 'accepted' && (
                        <button 
                          onClick={() => handleTaskAction(task._id, 'start')}
                          className="btn-primary text-sm px-4 py-2 w-full"
                        >
                          Start Task
                        </button>
                      )}
                      
                      {user?.role === 'service_provider' && task.status === 'in_progress' && (
                        <button 
                          onClick={() => handleTaskAction(task._id, 'complete')}
                          className="btn-primary text-sm px-4 py-2 w-full"
                        >
                          Complete Task
                      </button>
                      )}
                      
                      {task.status === 'posted' && user?.role === 'user' && (
                        <button 
                          onClick={() => handleTaskAction(task._id, 'cancel', { reason: 'User cancelled' })}
                          className="btn-outline text-sm px-4 py-2 w-full"
                        >
                          Cancel Task
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default MyTasks;
