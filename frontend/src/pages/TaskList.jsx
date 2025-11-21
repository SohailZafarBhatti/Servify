import React, { useState, useEffect } from 'react';
import { apiService } from '../services/apiService';
import LoadingSpinner from '../components/LoadingSpinner';
import withLoading from '../hoc/withLoading';

const TaskList = () => {
  const [tasks, setTasks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    const fetchTasks = async () => {
      setIsLoading(true);
      const { data, error } = await apiService.tasks.getAll();
      
      if (error) {
        setError(error.message);
      } else {
        setTasks(data || []);
      }
      
      setIsLoading(false);
    };
    
    fetchTasks();
  }, []);
  return (
    <div className="page-container">
      <div className="section-container">
        <div className="card">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">Available Tasks</h1>
          <p className="text-gray-600 mb-6">Browse and find tasks that match your skills and location.</p>
          
          {isLoading ? (
            <div className="py-10">
              <LoadingSpinner size="large" />
              <p className="text-center mt-4 text-gray-600">Loading available tasks...</p>
            </div>
          ) : error ? (
            <div className="py-10 text-center">
              <p className="text-red-500 mb-4">{error}</p>
              <button 
                className="btn-primary" 
                onClick={() => window.location.reload()}
              >
                Try Again
              </button>
            </div>
          ) : tasks.length === 0 ? (
            <div className="py-10 text-center">
              <p className="text-gray-600 mb-4">No tasks available at the moment.</p>
              <button className="btn-primary" onClick={() => window.location.href = '/create-task'}>
                Create a Task
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Using mock data since we don't have actual API data */}
              {[
                { id: 1, title: 'House Cleaning', description: 'Need help with regular house cleaning services.', budget: 50 },
                { id: 2, title: 'Plumbing Repair', description: 'Leaky faucet needs immediate attention.', budget: 80 },
                { id: 3, title: 'Garden Maintenance', description: 'Weekly garden maintenance and lawn care.', budget: 40 }
              ].map(task => (
                <div key={task.id} className="card-hover">
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">{task.title}</h3>
                  <p className="text-gray-600 mb-3">{task.description}</p>
                  <div className="flex justify-between items-center">
                    <span className="text-primary-600 font-medium">${task.budget}</span>
                    <button className="btn-primary text-sm">View Details</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Wrap the component with the withLoading HOC for initial page load
export default withLoading(TaskList, {
  delay: 500, // 500ms delay to show loading state
  loadingMessage: 'Loading tasks page...'
});
