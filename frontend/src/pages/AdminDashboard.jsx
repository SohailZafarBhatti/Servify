import React, { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";

const AdminDashboard = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("overview");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // State for API data
  const [users, setUsers] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [issues, setIssues] = useState([]);
  const [categories, setCategories] = useState([]);
  const [pendingVerifications, setPendingVerifications] = useState([]);
  const [stats, setStats] = useState({});
  const [recentActivity, setRecentActivity] = useState({ tasks: [], users: [] });
  const [charts, setCharts] = useState({});

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch all data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');
        const baseURL = import.meta.env.VITE_API_FRONTEND_URL|| 'http://localhost:5000';
        const config = {
          baseURL,
          headers: {
            Authorization: `Bearer ${token}`
          }
        };

        console.log('Fetching admin data with config:', { baseURL, hasToken: !!token });

        // Test admin routes first
        try {
          console.log('Testing admin health endpoint...');
          const healthRes = await axios.get("/admin/health", config);
          console.log('Admin health check successful:', healthRes.data);
          
          console.log('Testing admin test endpoint...');
          const testRes = await axios.get("/admin/test", config);
          console.log('Admin routes test successful:', testRes.data);
        } catch (testError) {
          console.error('Admin routes test failed:', testError);
          console.error('Full test error:', {
            message: testError.message,
            status: testError.response?.status,
            statusText: testError.response?.statusText,
            url: testError.config?.url,
            baseURL: testError.config?.baseURL
          });
          throw new Error(`Cannot connect to admin API endpoints: ${testError.message}`);
        }

        const [
          usersRes,
          tasksRes,
          issuesRes,
          categoriesRes,
          statsRes,
        ] = await Promise.all([
          axios.get("/admin/users", config),
          axios.get("/admin/tasks", config),
          axios.get("/admin/issues", config),
          axios.get("/admin/categories", config),
          axios.get("/admin/dashboard-stats", config),
        ]);

        // Handle response data structure
        const statsData = statsRes.data.data || {};
        
        setUsers(usersRes.data.data?.users || []);
        setTasks(tasksRes.data.data?.tasks || []);
        setIssues(issuesRes.data.data?.issues || []);
        setCategories(categoriesRes.data.data?.categories || []);
        setStats(statsData.overview || {});
        setRecentActivity(statsData.recentActivity || { tasks: [], users: [] });
        setCharts(statsData.charts || {});  
        setPendingVerifications([]);
        
        console.log('Admin Dashboard Data Loaded:', {
          totalUsers: statsData.overview?.totalUsers,
          totalTasks: statsData.overview?.totalTasks,
          completedTasks: statsData.overview?.completedTasks,
          totalRevenue: statsData.overview?.totalRevenue
        });
      } catch (error) {
        console.error("Error fetching admin data:", error);
        console.error("Error details:", {
          message: error.message,
          status: error.response?.status,
          statusText: error.response?.statusText,
          responseData: error.response?.data,
          config: {
            url: error.config?.url,
            baseURL: error.config?.baseURL,
            method: error.config?.method
          }
        });
        setError(error.response?.data?.message || error.message || 'Failed to fetch admin data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Render functions
  const renderUsers = () => (
    <div className="space-y-4 lg:space-y-6">
      <h2 className="text-xl lg:text-2xl font-bold text-gray-900">Users</h2>
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white rounded-lg shadow">
          <thead>
            <tr className="bg-gray-100 text-left text-gray-600 uppercase text-sm">
              <th className="px-3 lg:px-6 py-3">Name</th>
              <th className="px-3 lg:px-6 py-3 hidden sm:table-cell">Email</th>
              <th className="px-3 lg:px-6 py-3">Role</th>
              <th className="px-3 lg:px-6 py-3 hidden md:table-cell">Phone</th>
              <th className="px-3 lg:px-6 py-3">Status</th>
              <th className="px-3 lg:px-6 py-3 hidden lg:table-cell">Join Date</th>
            </tr>
          </thead>
          <tbody className="text-gray-700">
            {users.length === 0 ? (
              <tr>
                <td colSpan="6" className="px-6 py-8 text-center text-gray-500">
                  <div className="flex flex-col items-center">
                    <svg className="w-12 h-12 mb-2 text-gray-300" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
                    </svg>
                    <p>No users found</p>
                  </div>
                </td>
              </tr>
            ) : (
              users.map((user) => (
                <tr key={user._id} className="border-b hover:bg-gray-50">
                  <td className="px-3 lg:px-6 py-4">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-8 w-8">
                        <div className="h-8 w-8 rounded-full bg-gray-300 flex items-center justify-center text-sm font-medium text-gray-700">
                          {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                        </div>
                      </div>
                      <div className="ml-3 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">{user.name || 'Unnamed'}</p>
                        <p className="sm:hidden text-xs text-gray-500 truncate">{user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-3 lg:px-6 py-4 text-sm text-gray-900 hidden sm:table-cell">
                    <div className="truncate max-w-xs">{user.email}</div>
                  </td>
                  <td className="px-3 lg:px-6 py-4">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      user.role === 'service_provider' ? 'bg-blue-100 text-blue-800' :
                      user.role === 'user' ? 'bg-green-100 text-green-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      <span className="hidden sm:inline">{user.role === 'service_provider' ? 'Provider' : user.role === 'user' ? 'Customer' : 'Unknown'}</span>
                      <span className="sm:hidden">{user.role === 'service_provider' ? 'P' : user.role === 'user' ? 'C' : 'U'}</span>
                    </span>
                  </td>
                  <td className="px-3 lg:px-6 py-4 text-sm text-gray-500 hidden md:table-cell">{user.phone || 'Not provided'}</td>
                  <td className="px-3 lg:px-6 py-4">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      user.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {user.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-3 lg:px-6 py-4 text-sm text-gray-500 hidden lg:table-cell">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderTasks = () => (
    <div className="space-y-4 lg:space-y-6">
      <h2 className="text-xl lg:text-2xl font-bold text-gray-900">Tasks</h2>
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white rounded-lg shadow">
          <thead>
            <tr className="bg-gray-100 text-left text-gray-600 uppercase text-sm">
              <th className="px-3 lg:px-6 py-3">Task</th>
              <th className="px-3 lg:px-6 py-3 hidden sm:table-cell">Customer</th>
              <th className="px-3 lg:px-6 py-3 hidden md:table-cell">Provider</th>
              <th className="px-3 lg:px-6 py-3 hidden lg:table-cell">Category</th>
              <th className="px-3 lg:px-6 py-3">Status</th>
              <th className="px-3 lg:px-6 py-3 hidden md:table-cell">Budget</th>
              <th className="px-3 lg:px-6 py-3 hidden lg:table-cell">Date</th>
            </tr>
          </thead>
          <tbody className="text-gray-700">
            {tasks.length === 0 ? (
              <tr>
                <td colSpan="7" className="px-6 py-8 text-center text-gray-500">
                  <div className="flex flex-col items-center">
                    <svg className="w-12 h-12 mb-2 text-gray-300" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                    </svg>
                    <p>No tasks found</p>
                  </div>
                </td>
              </tr>
            ) : (
              tasks.map((task) => (
                <tr key={task._id} className="border-b hover:bg-gray-50">
                  <td className="px-3 lg:px-6 py-4">
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{task.title}</p>
                      <p className="text-xs text-gray-500 truncate">{task.description?.substring(0, 50)}...</p>
                      <div className="sm:hidden mt-1 flex flex-wrap gap-1">
                        <span className="text-xs text-gray-500">{task.createdBy?.name || 'Unknown'}</span>
                        {task.assignedTo?.name && <span className="text-xs text-blue-600">• {task.assignedTo.name}</span>}
                      </div>
                      <div className="md:hidden lg:hidden mt-1">
                        <span className="text-xs text-gray-500">
                          {task.minBudget && task.maxBudget ? 
                            `PKR ${task.minBudget} - PKR ${task.maxBudget}` : 
                            task.maxBudget ? `PKR ${task.maxBudget}` : 'Budget: N/A'
                          }
                        </span>
                      </div>
                    </div>
                  </td>
                  <td className="px-3 lg:px-6 py-4 text-sm text-gray-900 hidden sm:table-cell">
                    <div className="truncate">{task.createdBy?.name || 'Unknown'}</div>
                  </td>
                  <td className="px-3 lg:px-6 py-4 text-sm text-gray-500 hidden md:table-cell">
                    <div className="truncate">
                      {task.assignedTo?.name || (
                        <span className="text-orange-600 italic">Unassigned</span>
                      )}
                    </div>
                  </td>
                  <td className="px-3 lg:px-6 py-4 hidden lg:table-cell">
                    <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800">
                      {task.category || 'Uncategorized'}
                    </span>
                  </td>
                  <td className="px-3 lg:px-6 py-4">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      task.status === 'completed' ? 'bg-green-100 text-green-800' :
                      task.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                      task.status === 'accepted' ? 'bg-yellow-100 text-yellow-800' :
                      task.status === 'posted' ? 'bg-gray-100 text-gray-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {task.status ? task.status.replace('_', ' ').toUpperCase() : 'NO STATUS'}
                    </span>
                  </td>
                  <td className="px-3 lg:px-6 py-4 text-sm text-gray-900 hidden md:table-cell">
                    {task.minBudget && task.maxBudget ? 
                      `PKR ${task.minBudget} - PKR ${task.maxBudget}` : 
                      task.maxBudget ? `PKR ${task.maxBudget}` : 'Not specified'
                    }
                  </td>
                  <td className="px-3 lg:px-6 py-4 text-sm text-gray-500 hidden lg:table-cell">
                    {new Date(task.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderIssues = () => (
    <div className="space-y-4 lg:space-y-6">
      <h2 className="text-xl lg:text-2xl font-bold text-gray-900">Issues & Feedback</h2>
      
      {issues.length === 0 ? (
        <div className="text-center py-8 text-gray-500 bg-white rounded-lg shadow">
          <div className="flex flex-col items-center">
            <svg className="w-12 h-12 mb-2 text-gray-300" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
            <p className="text-lg font-medium">No issues found</p>
            <p className="text-sm mt-1">Issues and feedback will appear here</p>
          </div>
        </div>
      ) : (
        <>
          {/* Mobile Card Layout */}
          <div className="block lg:hidden space-y-4">
            {issues.map((issue) => (
              <div key={issue._id} className="bg-white p-4 rounded-lg shadow hover:shadow-md transition-shadow">
                <div className="flex flex-col space-y-3">
                  {/* Header with Type and Status */}
                  <div className="flex items-center justify-between">
                    <span className="px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                      {issue.issueType?.replace('_', ' ').toUpperCase() || 'N/A'}
                    </span>
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                      issue.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      issue.status === 'under_review' ? 'bg-blue-100 text-blue-800' :
                      issue.status === 'resolved' ? 'bg-green-100 text-green-800' :
                      issue.status === 'dismissed' ? 'bg-red-100 text-red-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {issue.status?.replace('_', ' ').toUpperCase() || 'UNKNOWN'}
                    </span>
                  </div>
                  
                  {/* Title */}
                  <h3 className="font-medium text-sm text-gray-900">
                    {issue.title || 'No title'}
                  </h3>
                  
                  {/* Description */}
                  <p className="text-sm text-gray-600 line-clamp-2">
                    {issue.description || 'No description'}
                  </p>
                  
                  {/* Footer with Reporter and Date */}
                  <div className="flex items-center justify-between text-xs text-gray-500 pt-2 border-t border-gray-100">
                    <span className="flex items-center">
                      <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                      </svg>
                      {issue.reporter?.name || 'Unknown'}
                    </span>
                    <span className="flex items-center">
                      <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                      </svg>
                      {issue.createdAt ? new Date(issue.createdAt).toLocaleDateString() : 'Invalid Date'}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          {/* Desktop Table Layout */}
          <div className="hidden lg:block overflow-x-auto">
            <table className="min-w-full bg-white rounded-lg shadow">
              <thead>
                <tr className="bg-gray-100 text-left text-gray-600 uppercase text-sm">
                  <th className="px-6 py-3">Type</th>
                  <th className="px-6 py-3">Title</th>
                  <th className="px-6 py-3">Description</th>
                  <th className="px-6 py-3">Status</th>
                  <th className="px-6 py-3">Reporter</th>
                  <th className="px-6 py-3">Date</th>
                </tr>
              </thead>
              <tbody className="text-gray-700">
                {issues.map((issue) => (
                  <tr key={issue._id} className="border-b hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <span className="px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                        {issue.issueType?.replace('_', ' ').toUpperCase() || 'N/A'}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-medium max-w-xs">
                      <div className="truncate" title={issue.title}>
                        {issue.title || 'No title'}
                      </div>
                    </td>
                    <td className="px-6 py-4 max-w-sm">
                      <div className="truncate" title={issue.description}>
                        {issue.description || 'No description'}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                        issue.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        issue.status === 'under_review' ? 'bg-blue-100 text-blue-800' :
                        issue.status === 'resolved' ? 'bg-green-100 text-green-800' :
                        issue.status === 'dismissed' ? 'bg-red-100 text-red-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {issue.status?.replace('_', ' ').toUpperCase() || 'UNKNOWN'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {issue.reporter?.name || 'Unknown'}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {issue.createdAt ? new Date(issue.createdAt).toLocaleDateString() : 'Invalid Date'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {/* Tablet Layout (md and up, but not lg) */}
          <div className="hidden md:block lg:hidden overflow-x-auto">
            <table className="min-w-full bg-white rounded-lg shadow">
              <thead>
                <tr className="bg-gray-100 text-left text-gray-600 uppercase text-sm">
                  <th className="px-4 py-3">Issue</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Reporter</th>
                  <th className="px-4 py-3">Date</th>
                </tr>
              </thead>
              <tbody className="text-gray-700">
                {issues.map((issue) => (
                  <tr key={issue._id} className="border-b hover:bg-gray-50">
                    <td className="px-4 py-4">
                      <div className="min-w-0">
                        <div className="flex items-center space-x-2 mb-1">
                          <span className="px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                            {issue.issueType?.replace('_', ' ').toUpperCase() || 'N/A'}
                          </span>
                        </div>
                        <p className="font-medium text-sm text-gray-900 truncate">{issue.title || 'No title'}</p>
                        <p className="text-xs text-gray-500 truncate mt-1" title={issue.description}>
                          {issue.description || 'No description'}
                        </p>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                        issue.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        issue.status === 'under_review' ? 'bg-blue-100 text-blue-800' :
                        issue.status === 'resolved' ? 'bg-green-100 text-green-800' :
                        issue.status === 'dismissed' ? 'bg-red-100 text-red-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {issue.status?.replace('_', ' ').toUpperCase() || 'UNKNOWN'}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-900">
                      <div className="truncate">{issue.reporter?.name || 'Unknown'}</div>
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-500">
                      {issue.createdAt ? new Date(issue.createdAt).toLocaleDateString() : 'Invalid Date'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );

  const renderCategories = () => (
    <div className="space-y-4 lg:space-y-6">
      <h2 className="text-xl lg:text-2xl font-bold text-gray-900">Service Categories</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 lg:gap-6">
        {categories.map((category, index) => (
          <div
            key={category.name || index}
            className="bg-white p-4 lg:p-6 rounded-lg shadow hover:shadow-md transition-shadow"
          >
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-semibold text-base lg:text-lg text-gray-900 capitalize truncate mr-2">
                {category.name || 'Unknown Category'}
              </h3>
              <span className={`px-2 py-1 text-xs font-semibold rounded-full flex-shrink-0 ${
                category.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
              }`}>
                <span className="hidden sm:inline">{category.isActive ? 'Active' : 'Inactive'}</span>
                <span className="sm:hidden">{category.isActive ? 'A' : 'I'}</span>
              </span>
            </div>
            <div className="text-gray-600">
              <p className="text-sm mb-1">
                <span className="font-medium">Tasks:</span> {category.taskCount || 0}
              </p>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-500 h-2 rounded-full transition-all duration-300" 
                  style={{
                    width: `${Math.min(100, (category.taskCount / Math.max(...categories.map(c => c.taskCount || 0), 1)) * 100)}%`
                  }}
                ></div>
              </div>
            </div>
          </div>
        ))}
      </div>
      {categories.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <div className="text-4xl lg:text-6xl text-gray-300 mb-4">📂</div>
          <p className="text-base lg:text-lg font-medium">No categories found</p>
          <p className="text-sm">Categories will appear here once tasks are created</p>
        </div>
      )}
    </div>
  );

  const renderOverview = () => (
    <div className="space-y-6 lg:space-y-8">
      {/* Main Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-4 lg:p-6 rounded-lg shadow-lg text-white">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-blue-100 text-xs lg:text-sm font-medium">Total Users</h3>
              <p className="text-2xl lg:text-3xl font-bold">{stats.totalUsers || 0}</p>
            </div>
            <div className="text-blue-200">
              <svg className="w-6 h-6 lg:w-8 lg:h-8" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
              </svg>
            </div>
          </div>
          <p className="text-blue-200 text-xs lg:text-sm mt-2">{stats.activeUsers || 0} active users</p>
        </div>
        
        <div className="bg-gradient-to-r from-green-500 to-green-600 p-4 lg:p-6 rounded-lg shadow-lg text-white">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-green-100 text-xs lg:text-sm font-medium">Total Tasks</h3>
              <p className="text-2xl lg:text-3xl font-bold">{stats.totalTasks || 0}</p>
            </div>
            <div className="text-green-200">
              <svg className="w-6 h-6 lg:w-8 lg:h-8" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
              </svg>
            </div>
          </div>
          <p className="text-green-200 text-xs lg:text-sm mt-2">{stats.pendingTasks || 0} pending</p>
        </div>
        
        <div className="bg-gradient-to-r from-purple-500 to-purple-600 p-4 lg:p-6 rounded-lg shadow-lg text-white">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-purple-100 text-xs lg:text-sm font-medium">Completed Tasks</h3>
              <p className="text-2xl lg:text-3xl font-bold">{stats.completedTasks || 0}</p>
            </div>
            <div className="text-purple-200">
              <svg className="w-6 h-6 lg:w-8 lg:h-8" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            </div>
          </div>
          <p className="text-purple-200 text-xs lg:text-sm mt-2">{((stats.completedTasks || 0) / (stats.totalTasks || 1) * 100).toFixed(1)}% completion rate</p>
        </div>
        
        <div className="bg-gradient-to-r from-yellow-500 to-yellow-600 p-4 lg:p-6 rounded-lg shadow-lg text-white">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-yellow-100 text-xs lg:text-sm font-medium">Total Revenue</h3>
              <p className="text-2xl lg:text-3xl font-bold">PKR{(stats.totalRevenue || 0).toLocaleString()}</p>
            </div>
            <div className="text-yellow-200">
              <svg className="w-6 h-6 lg:w-8 lg:h-8" fill="currentColor" viewBox="0 0 20 20">
                <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z" />
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clipRule="evenodd" />
              </svg>
            </div>
          </div>
          <p className="text-yellow-200 text-xs lg:text-sm mt-2">Average: PKR{Math.round((stats.totalRevenue || 0) / (stats.completedTasks || 1))}</p>
        </div>
      </div>
      
      {/* Task Status Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
        <div className="bg-white p-4 lg:p-6 rounded-lg shadow">
          <h3 className="text-base lg:text-lg font-semibold mb-4">Task Status Breakdown</h3>
          <div className="space-y-3">
            {Object.entries(charts.tasksByStatus || {}).map(([status, count]) => (
              <div key={status} className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className={`w-3 h-3 rounded-full mr-3 ${
                    status === 'completed' ? 'bg-green-500' :
                    status === 'in_progress' ? 'bg-blue-500' :
                    status === 'accepted' ? 'bg-yellow-500' :
                    status === 'posted' ? 'bg-gray-500' : 'bg-red-500'
                  }`}></div>
                  <span className="capitalize text-sm lg:text-base">{status === 'null' ? 'No Status' : status.replace('_', ' ')}</span>
                </div>
                <span className="font-semibold text-sm lg:text-base">{count}</span>
              </div>
            ))}
          </div>
        </div>
        
        <div className="bg-white p-4 lg:p-6 rounded-lg shadow">
          <h3 className="text-base lg:text-lg font-semibold mb-4">Recent Activity</h3>
          <div className="space-y-3">
            <div>
              <h4 className="font-medium text-gray-700 mb-2 text-sm lg:text-base">Recent Tasks</h4>
              {recentActivity.tasks?.slice(0, 3).map(task => (
                <div key={task._id} className="text-sm text-gray-600 mb-1">
                  <div className="truncate">{task.title}</div>
                  <span className={`capitalize text-xs ${
                    task.status === 'completed' ? 'text-green-600' :
                    task.status === 'in_progress' ? 'text-blue-600' :
                    'text-gray-600'
                  }`}>{task.status}</span>
                </div>
              ))}
            </div>
            <div>
              <h4 className="font-medium text-gray-700 mb-2 mt-4 text-sm lg:text-base">New Users</h4>
              {recentActivity.users?.slice(0, 3).map(user => (
                <div key={user._id} className="text-sm text-gray-600 mb-1">
                  <div className="truncate">{user.name}</div>
                  <div className="text-xs">{new Date(user.createdAt).toLocaleDateString()}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Loading Admin Dashboard...</p>
          <p className="text-gray-500 text-sm mt-2">Fetching real-time data from database</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="text-center bg-white p-8 rounded-lg shadow-lg max-w-md">
          <div className="text-red-500 mb-4">
            <svg className="w-16 h-16 mx-auto" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Error Loading Dashboard</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button 
            onClick={() => {
              setError(null);
              setLoading(true);
              // Re-fetch data
              window.location.reload();
            }}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden" 
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}

      {/* Sidebar */}
      <div className={`fixed lg:static inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out lg:translate-x-0 ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <div className="flex items-center justify-between p-4 lg:p-6 font-bold text-lg lg:text-xl border-b">
          <span>Admin Panel</span>
          <button 
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden text-gray-500 hover:text-gray-700"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <nav className="p-4 lg:p-6 space-y-2 lg:space-y-4">
          {[
            { id: "overview", label: "Overview", icon: "📊" },
            { id: "users", label: "Users", icon: "👥" },
            { id: "tasks", label: "Tasks", icon: "📋" },
            { id: "issues", label: "Issues", icon: "⚠️" },
            { id: "categories", label: "Categories", icon: "📂" }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id);
                setSidebarOpen(false);
              }}
              className={`flex items-center w-full text-left px-3 lg:px-4 py-2 rounded-lg transition-colors ${
                activeTab === tab.id 
                  ? "bg-primary-100 text-primary-700" 
                  : "hover:bg-gray-50"
              }`}
            >
              <span className="mr-3 text-sm">{tab.icon}</span>
              <span className="text-sm lg:text-base">{tab.label}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* Main content */}
      <div className="flex-1 lg:ml-0">
        {/* Mobile header */}
        <div className="lg:hidden bg-white shadow-sm border-b p-4">
          <div className="flex items-center justify-between">
            <button 
              onClick={() => setSidebarOpen(true)}
              className="text-gray-500 hover:text-gray-700"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <h1 className="text-lg font-semibold text-gray-900">
              {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}
            </h1>
            <div className="w-6"></div> {/* Spacer */}
          </div>
        </div>

        {/* Content */}
        <div className="p-4 lg:p-8">
          {activeTab === "overview" && renderOverview()}
          {activeTab === "users" && renderUsers()}
          {activeTab === "tasks" && renderTasks()}
          {activeTab === "issues" && renderIssues()}
          {activeTab === "categories" && renderCategories()}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
