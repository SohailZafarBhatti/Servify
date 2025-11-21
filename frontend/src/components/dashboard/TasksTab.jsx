import React, { useEffect, useState } from "react";
import LoadingSpinner from "../LoadingSpinner";
import { useSocket } from "../../context/SocketContext";
import axios from "axios";

const TasksTab = ({ tasks: injectedTasks }) => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const { socket, onTaskUpdate, removeListener } = useSocket();

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const response = await axios.get("http://localhost:5000/api/tasks/my-tasks", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setTasks(response.data.tasks || []);
    } catch (err) {
      console.error("Error fetching tasks:", err.response?.data || err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (injectedTasks) return; // Parent controls data
    fetchTasks();

    // Listen for real-time task updates only when fetching locally
    const handleTaskUpdate = (data) => {
      // Only add if task belongs to this user
      if (data.createdBy === localStorage.getItem("userId")) {
        setTasks((prev) => [data, ...prev]);
      }
    };

    onTaskUpdate(handleTaskUpdate);

    return () => {
      removeListener("task_updated");
    };
  }, [injectedTasks]);

  const displayTasks = injectedTasks ?? tasks;

  if (loading && !injectedTasks) {
    return (
      <div className="flex justify-center items-center h-48 sm:h-64">
        <LoadingSpinner />
      </div>
    );
  }

  if (!displayTasks || !displayTasks.length) {
    return (
      <div className="text-center py-8 sm:py-12">
        <div className="mx-auto w-12 h-12 sm:w-16 sm:h-16 text-gray-300 mb-4">
          <svg fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zm0 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V8zm0 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1v-2z" clipRule="evenodd" />
          </svg>
        </div>
        <p className="text-gray-500 text-base sm:text-lg font-medium">No tasks available</p>
        <p className="text-gray-400 text-sm mt-2">Your posted tasks will appear here</p>
      </div>
    );
  }

  return (
    <div className="space-y-3 sm:space-y-4">
      <div className="flex items-center justify-between mb-4 sm:mb-6">
        <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-800">My Tasks</h2>
        <span className="text-sm text-gray-500">{displayTasks.length} tasks</span>
      </div>
      
      {/* Mobile Card Layout */}
      <div className="block sm:hidden space-y-4">
        {displayTasks.map((task) => (
          <div
            key={task._id}
            className="bg-white p-4 border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="flex items-start justify-between mb-3">
              <h3 className="font-semibold text-base text-gray-900 flex-1 pr-2">{task.title}</h3>
              <span className={`px-2 py-1 text-xs font-medium rounded-full flex-shrink-0 ${
                task.status === 'completed' ? 'bg-green-100 text-green-800' :
                task.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                task.status === 'accepted' ? 'bg-yellow-100 text-yellow-800' :
                'bg-gray-100 text-gray-800'
              }`}>
                {task.status.replace('_', ' ')}
              </span>
            </div>
            
            <p className="text-sm text-gray-600 mb-3 line-clamp-2">{task.description || "No description"}</p>
            
            <div className="space-y-2">
              {task.location && (
                <div className="flex items-center text-xs text-gray-500">
                  <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                  </svg>
                  <span className="truncate">{task.location.address || "Location provided"}</span>
                </div>
              )}
              
              {task.assignedTo && (
                <div className="flex items-center text-xs text-blue-600">
                  <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                  </svg>
                  <span>Assigned to: {task.assignedTo.name || "Unknown"}</span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
      
      {/* Desktop/Tablet List Layout */}
      <div className="hidden sm:block">
        <ul className="space-y-4 lg:space-y-6">
          {displayTasks.map((task) => (
            <li
              key={task._id}
              className="bg-white p-4 sm:p-6 border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between mb-3">
                <h3 className="font-bold text-lg sm:text-xl text-gray-900 flex-1 pr-4">{task.title}</h3>
                <span className={`px-3 py-1 text-sm font-medium rounded-full flex-shrink-0 ${
                  task.status === 'completed' ? 'bg-green-100 text-green-800' :
                  task.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                  task.status === 'accepted' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {task.status.replace('_', ' ')}
                </span>
              </div>
              
              <p className="text-gray-700 mb-4">{task.description || "No description"}</p>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
                {task.location ? (
                  <div className="text-gray-600">
                    <p className="flex items-center mb-1">
                      <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                      </svg>
                      <span className="font-semibold">Address:</span>
                    </p>
                    <p className="ml-6 text-gray-500">{task.location.address || "N/A"}</p>
                    {Array.isArray(task.location.coordinates) && (
                      <p className="ml-6 text-xs text-gray-400 mt-1">
                        Coordinates: {task.location.coordinates[1]}, {task.location.coordinates[0]}
                      </p>
                    )}
                  </div>
                ) : (
                  <div className="text-gray-500 text-sm flex items-center">
                    <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                    </svg>
                    Location not provided
                  </div>
                )}

                {task.assignedTo ? (
                  <div className="text-blue-600">
                    <p className="flex items-center">
                      <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                      </svg>
                      <span>Assigned to: <span className="font-medium">{task.assignedTo.name || "Unknown"}</span></span>
                    </p>
                  </div>
                ) : (
                  <div className="text-gray-500 flex items-center">
                    <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                    </svg>
                    Not assigned yet
                  </div>
                )}
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default TasksTab;
