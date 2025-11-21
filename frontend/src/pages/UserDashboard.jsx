import React, { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useSocket } from "../context/SocketContext";
import { Menu, X } from "lucide-react"; 

import OverviewTab from "../components/dashboard/OverviewTab";
import TasksTab from "../components/dashboard/TasksTab";
// import AssignedTasksTab from "../components/dashboard/AssignedTasksTab";
import PostTaskTab from "../components/dashboard/PostTaskTab";
import ProfileTab from "../components/dashboard/ProfileTab";
import ChatTab from "../components/dashboard/ChatTab";
import NotificationsTab from "../components/dashboard/NotificationsTab";
import SettingsTab from "../components/dashboard/SettingsTab";

import taskService from "../services/taskService";
import authService from "../services/authService";
import chatService from "../services/chatService";
import feedbackService from "../services/feedbackService";
import FeedbackModal from "../components/FeedbackModal";

const tabs = [
  "Overview",
  "My Tasks",
  // "Assigned Tasks",
  "Post Task",
  "Profile",
  "Chat",
  "Notifications",
  "Settings",
];

const UserDashboard = () => {
  const { user } = useAuth();
  const { socket } = useSocket();

  const [activeTab, setActiveTab] = useState("Overview");
  const [tasks, setTasks] = useState([]);
  const [assignedTasks, setAssignedTasks] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false); // mobile sidebar state

  // Feedback modal state
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [selectedTaskForFeedback, setSelectedTaskForFeedback] = useState(null);
  const [pendingFeedbackTasks, setPendingFeedbackTasks] = useState([]);

  // Fetch initial data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [myTasks, myAssignedTasks, , userNotifications, pendingFeedback] = await Promise.all([
          taskService.getMyTasks(),
          taskService.getAssignedTasks(),
          authService.getMe(),
          chatService.getNotifications?.() || [],
          feedbackService.getPendingFeedback().catch(() => ({ pendingTasks: [] })),
        ]);
        setTasks(myTasks || []);
        setAssignedTasks(myAssignedTasks || []);
        setNotifications(userNotifications || []);
        setPendingFeedbackTasks(pendingFeedback.pendingTasks || []);

        // Auto-show feedback modal if there are pending tasks
        if (pendingFeedback.pendingTasks && pendingFeedback.pendingTasks.length > 0) {
          console.log('Found pending feedback tasks:', pendingFeedback.pendingTasks.length);
          // Show feedback for the most recent completed task
          setTimeout(() => {
            setSelectedTaskForFeedback(pendingFeedback.pendingTasks[0]);
            setShowFeedbackModal(true);
          }, 1000); // Delay to let dashboard load
        }
      } catch (err) {
        console.error("Dashboard fetch error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Socket: Listen for task and chat updates
  useEffect(() => {
    if (!socket) return;

    const handleTaskUpdate = (updatedTask) => {
      setTasks((prev) => prev.map((t) => (t._id === updatedTask._id ? updatedTask : t)));
      setAssignedTasks((prev) => prev.map((t) => (t._id === updatedTask._id ? updatedTask : t)));

      // Check if task was just completed and needs feedback
      if (updatedTask.status === 'completed' && updatedTask.createdBy === user?._id) {
        console.log('Task completed, prompting for feedback:', updatedTask.title);
        
        // Add to pending feedback tasks if not already there
        setPendingFeedbackTasks(prev => {
          const exists = prev.some(task => task._id === updatedTask._id);
          if (!exists) {
            const newPendingTasks = [updatedTask, ...prev];
            
            // Auto-show feedback modal if no other modal is open
            if (!showFeedbackModal) {
              setTimeout(() => {
                setSelectedTaskForFeedback(updatedTask);
                setShowFeedbackModal(true);
              }, 2000);
            }
            
            return newPendingTasks;
          }
          return prev;
        });
      }
    };

    const handleNewTask = (newTask) => setTasks((prev) => [newTask, ...prev]);
    const handleNewNotification = (notification) =>
      setNotifications((prev) => [notification, ...prev]);

    // Join user's personal room for receiving messages and updates
    console.log('[UserDashboard] Socket connection status:', socket?.connected);
    console.log('[UserDashboard] Socket ID:', socket?.id);
    
    if (user?._id) {
      console.log('[UserDashboard] Joining socket room for user:', user._id);
      socket.emit('join', user._id);
    }

    // Debug message reception at UserDashboard level
    const handleReceiveMessage = (data) => {
      console.log('[UserDashboard] Received message:', data);
      // ChatTab will handle the actual processing
    };

    socket.on("task_updated", handleTaskUpdate);
    socket.on("newTask", handleNewTask);
    socket.on("receive_notification", handleNewNotification);
    socket.on("receive_message", handleReceiveMessage);

    return () => {
      socket.off("task_updated", handleTaskUpdate);
      socket.off("newTask", handleNewTask);
      socket.off("receive_notification", handleNewNotification);
      socket.off("receive_message", handleReceiveMessage);
    };
  }, [socket, user._id]);

  const addTask = (task) => setTasks((prev) => [task, ...prev]);

  // Handle feedback submission
  const handleFeedbackSubmit = async (feedbackData) => {
    try {
      console.log('Submitting feedback:', feedbackData);
      await feedbackService.submitFeedback(feedbackData);
      
      // Remove task from pending feedback list
      setPendingFeedbackTasks(prev => 
        prev.filter(task => task._id !== feedbackData.taskId)
      );

      console.log('Feedback submitted successfully');
      alert('Thank you for your feedback!');
    } catch (error) {
      console.error('Error submitting feedback:', error);
      throw error; // Re-throw to let modal handle the error
    }
  };

  // Handle closing feedback modal
  const handleFeedbackClose = () => {
    setShowFeedbackModal(false);
    setSelectedTaskForFeedback(null);
  };

  const renderTab = () => {
    switch (activeTab) {
      case "Overview":
        return <OverviewTab tasks={tasks} assignedTasks={assignedTasks} />;
      case "My Tasks":
        return <TasksTab tasks={tasks} />;
      case "Assigned Tasks":
        return <AssignedTasksTab tasks={assignedTasks} />;
      case "Post Task":
        return <PostTaskTab addTask={addTask} />;
      case "Profile":
        return <ProfileTab />;
      case "Chat":
        return <ChatTab />;
      case "Notifications":
        return <NotificationsTab notifications={notifications} />;
      case "Settings":
        return <SettingsTab />;
      default:
        return <div>Tab not found</div>;
    }
  };

  if (loading) return <p className="p-6 text-center text-gray-600">Loading dashboard...</p>;

  return (
    <div className="flex min-h-screen bg-gray-50 overflow-hidden">
      {/* Sidebar (desktop) */}
      <aside className="hidden lg:flex w-64 xl:w-72 bg-white shadow-md flex-col">
        <div className="p-4 lg:p-6 border-b bg-gradient-to-r from-blue-50 to-indigo-50">
          <h1 className="font-bold text-lg lg:text-xl text-gray-800">Dashboard</h1>
          <p className="text-xs lg:text-sm text-gray-600 mt-1">Welcome back!</p>
        </div>
        <nav className="mt-2 lg:mt-4 flex-1 px-2 lg:px-4">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`w-full text-left px-3 lg:px-4 py-2 lg:py-3 mb-1 lg:mb-2 rounded-lg hover:bg-gray-100 transition-all duration-200 ${
                activeTab === tab ? "bg-blue-50 text-blue-700 font-semibold shadow-sm" : "text-gray-700"
              }`}
            >
              <span className="text-sm lg:text-base">{tab}</span>
              {tab === "Notifications" && notifications.length > 0 && (
                <span className="ml-2 inline-block bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
                  {notifications.length}
                </span>
              )}
            </button>
          ))}
        </nav>
        <div className="p-4 lg:p-6 border-t bg-gray-50">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 lg:w-10 lg:h-10 bg-blue-500 rounded-full flex items-center justify-center">
              <span className="text-white font-semibold text-sm lg:text-base">
                {user?.name?.charAt(0)?.toUpperCase() || 'U'}
              </span>
            </div>
            <div>
              <p className="text-gray-800 font-medium text-sm lg:text-base truncate">{user?.name}</p>
              <p className="text-gray-500 text-xs lg:text-sm">User Account</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar (mobile & tablet slide-in) */}
      <aside
        className={`fixed inset-y-0 left-0 w-72 sm:w-80 bg-white shadow-xl z-50 transform transition-transform duration-300 ease-in-out lg:hidden flex flex-col
        ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}`}
      >
        <div className="p-4 sm:p-6 flex justify-between items-center border-b bg-gradient-to-r from-blue-50 to-indigo-50">
          <div>
            <h1 className="font-bold text-lg sm:text-xl text-gray-800">Dashboard</h1>
            <p className="text-sm text-gray-600 mt-1">Welcome back!</p>
          </div>
          <button 
            onClick={() => setSidebarOpen(false)}
            className="p-2 hover:bg-gray-200 rounded-full transition-colors"
          >
            <X className="h-5 w-5 sm:h-6 sm:w-6 text-gray-600" />
          </button>
        </div>
        <nav className="mt-4 flex-1 px-4 sm:px-6">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => {
                setActiveTab(tab);
                setSidebarOpen(false);
              }}
              className={`w-full text-left px-4 py-3 mb-2 rounded-lg hover:bg-gray-100 transition-all duration-200 ${
                activeTab === tab ? "bg-blue-50 text-blue-700 font-semibold shadow-sm" : "text-gray-700"
              }`}
            >
              <span className="text-base">{tab}</span>
              {tab === "Notifications" && notifications.length > 0 && (
                <span className="ml-2 inline-block bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
                  {notifications.length}
                </span>
              )}
            </button>
          ))}
        </nav>
        <div className="p-4 sm:p-6 border-t bg-gray-50">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
              <span className="text-white font-semibold">
                {user?.name?.charAt(0)?.toUpperCase() || 'U'}
              </span>
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-gray-800 font-medium truncate">{user?.name}</p>
              <p className="text-gray-500 text-sm">User Account</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Topbar for mobile & tablet */}
        <header className="lg:hidden flex items-center justify-between bg-white px-4 py-3 sm:px-6 sm:py-4 shadow-sm border-b">
          <button 
            onClick={() => setSidebarOpen(true)}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <Menu className="h-5 w-5 sm:h-6 sm:w-6 text-gray-700" />
          </button>
          <div className="flex-1 text-center">
            <h1 className="font-semibold text-base sm:text-lg text-gray-800">{activeTab}</h1>
            {activeTab === "Notifications" && notifications.length > 0 && (
              <span className="ml-2 inline-block bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
                {notifications.length}
              </span>
            )}
          </div>
          <div className="w-9 sm:w-10 flex justify-end">
            <div className="w-7 h-7 sm:w-8 sm:h-8 bg-blue-500 rounded-full flex items-center justify-center">
              <span className="text-white font-semibold text-xs sm:text-sm">
                {user?.name?.charAt(0)?.toUpperCase() || 'U'}
              </span>
            </div>
          </div>
        </header>

        <main className="flex-1 p-3 sm:p-4 lg:p-6 xl:p-8 overflow-auto bg-gray-50">
          <div className="max-w-7xl mx-auto">
            {renderTab()}
          </div>
        </main>
      </div>

      {/* Feedback Modal */}
      {showFeedbackModal && selectedTaskForFeedback && (
        <FeedbackModal
          isOpen={showFeedbackModal}
          task={selectedTaskForFeedback}
          onClose={handleFeedbackClose}
          onSubmit={handleFeedbackSubmit}
        />
      )}
    </div>
  );
};

export default UserDashboard;
