import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import { apiService } from '../services/apiService';
import { toast } from 'react-toastify';
import LoadingSpinner from '../components/LoadingSpinner';
import TaskIssueReportModal from '../components/TaskIssueReportModal';
import ServiceInfoModal from '../components/ServiceInfoModal';
import ServiceProviderProfileTab from '../components/ServiceProviderProfileTab';
import TaskCompletionFeedbackModal from '../components/TaskCompletionFeedbackModal';

const ServiceProviderDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { socket, updateTaskStatus } = useSocket();

  const [activeTab, setActiveTab] = useState('available');
  const [allTasks, setAllTasks] = useState([]); // Store all tasks
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [loadingTasks, setLoadingTasks] = useState(new Set());

  // Chat-related state
  const [activeChatTaskId, setActiveChatTaskId] = useState(null);
  const [activeChatTask, setActiveChatTask] = useState(null);
  const [chatMessages, setChatMessages] = useState({});
  const [newMessage, setNewMessage] = useState('');
  const [isSendingMessage, setIsSendingMessage] = useState(false);
  const [chatLoading, setChatLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const chatInputRef = useRef(null);

  const [showReportModal, setShowReportModal] = useState(false);
  const [reportData, setReportData] = useState({ type: '', description: '', taskId: null, userId: null });
  const [showServiceInfoModal, setShowServiceInfoModal] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [taskToComplete, setTaskToComplete] = useState(null);
  const [newTaskIds, setNewTaskIds] = useState([]);

  // Constants and helper functions
  const STATUS_FILTERS = {
    available: 'posted',
    accepted: 'accepted',
    in_progress: 'in_progress',
    completed: 'completed'
  };

  const STATUS_COLORS = {
    posted: 'bg-blue-100 text-blue-800',
    accepted: 'bg-yellow-100 text-yellow-800',
    in_progress: 'bg-orange-100 text-orange-800',
    completed: 'bg-green-100 text-green-800',
    cancelled: 'bg-red-100 text-red-800',
    default: 'bg-gray-100 text-gray-800'
  };

  const PRIORITY_COLORS = {
    high: 'bg-red-100 text-red-800',
    medium: 'bg-yellow-100 text-yellow-800',
    low: 'bg-green-100 text-green-800',
    default: 'bg-gray-100 text-gray-800'
  };

  const capitalize = useCallback((str) => 
    str ? str.charAt(0).toUpperCase() + str.slice(1) : '', []
  );

  const getStatusColor = useCallback((status) => 
    STATUS_COLORS[status] || STATUS_COLORS.default, []
  );

  const getPriorityColor = useCallback((priority) => 
    PRIORITY_COLORS[priority] || PRIORITY_COLORS.default, []
  );

  // Safe date formatting
  const formatDate = useCallback((dateValue) => {
    if (!dateValue) return 'N/A';
    
    const date = new Date(dateValue);
    if (isNaN(date.getTime())) return 'Invalid Date';
    
    return date.toLocaleDateString();
  }, []);

  // Chat-specific date formatting
  const formatMessageDate = useCallback((dateValue) => {
    if (!dateValue) return new Date().toLocaleString();
    
    let date;
    
    if (typeof dateValue === 'string') {
      if (dateValue.includes('T') || dateValue.includes('Z')) {
        date = new Date(dateValue);
      } else if (/^\d+$/.test(dateValue)) {
        date = new Date(parseInt(dateValue));
      } else {
        date = new Date(dateValue);
      }
    } else if (typeof dateValue === 'number') {
      date = new Date(dateValue);
    } else if (dateValue instanceof Date) {
      date = dateValue;
    } else {
      date = new Date();
    }
    
    if (isNaN(date.getTime())) {
      console.warn('Invalid date received:', dateValue);
      return new Date().toLocaleString();
    }
    
    const now = new Date();
    const diffInHours = (now - date) / (1000 * 60 * 60);
    
    if (diffInHours < 1) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (diffInHours < 24) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else {
      return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
  }, []);

  // Chat scroll to bottom
  const scrollChatToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  // Task normalization
  const normalizeTask = useCallback((task) => ({
    ...task,
    status: task.status || 'posted',
    minBudget: task.minBudget ?? task.budget?.min ?? 0,
    maxBudget: task.maxBudget ?? task.budget?.max ?? 0,
    date: task.date ?? task.preferredDate ?? task.createdAt,
  }), []);

  const extractTasksFromResponse = useCallback((response) => {
    if (!response?.data) return [];
    
    const data = response.data;
    return Array.isArray(data) 
      ? data
      : Array.isArray(data.data) 
      ? data.data
      : Array.isArray(data.tasks) 
      ? data.tasks
      : [];
  }, []);

  // Filter tasks by status
  const filterTasksByStatus = useCallback((tasks, activeTab) => {
    if (activeTab === 'chat') return tasks;
    const targetStatus = STATUS_FILTERS[activeTab];
    return targetStatus ? tasks.filter(task => task.status === targetStatus) : tasks;
  }, []);

  // Memoized computations
  const safeAllTasks = useMemo(() => Array.isArray(allTasks) ? allTasks : [], [allTasks]);

  const taskStats = useMemo(() => ({
    posted: safeAllTasks.filter(t => t.status === 'posted').length,
    accepted: safeAllTasks.filter(t => t.status === 'accepted').length,
    in_progress: safeAllTasks.filter(t => t.status === 'in_progress').length,
    completed: safeAllTasks.filter(t => t.status === 'completed').length,
  }), [safeAllTasks]);

  const filteredTasks = useMemo(() => 
    filterTasksByStatus(safeAllTasks, activeTab), 
    [safeAllTasks, activeTab, filterTasksByStatus]
  );

  // Chat-related functions
  const fetchChatMessages = useCallback(async (taskId) => {
    if (!taskId || chatMessages[taskId]) return;
    
    setChatLoading(true);
    
    try {
      console.log('Fetching messages for task:', taskId);
      const response = await apiService.chat.getMessages(taskId);
      console.log('Chat messages response:', response);
      
      let messagesData = [];
      
      if (response?.data) {
        if (Array.isArray(response.data)) {
          messagesData = response.data;
        } else if (Array.isArray(response.data.messages)) {
          messagesData = response.data.messages;
        } else if (response.data.data && Array.isArray(response.data.data)) {
          messagesData = response.data.data;
        }
      } else if (Array.isArray(response)) {
        messagesData = response;
      }
      
      const normalizedMessages = messagesData.map(msg => {
        let content = '';
        if (typeof msg.content === 'string') {
          content = msg.content;
        } else if (typeof msg.message === 'string') {
          content = msg.message;
        } else if (typeof msg.text === 'string') {
          content = msg.text;
        } else if (msg.content && typeof msg.content === 'object') {
          content = JSON.stringify(msg.content);
        } else {
          content = '';
        }

        return {
          _id: msg._id || msg.id || Date.now() + Math.random(),
          content: content,
          sender: {
            _id: msg.sender?._id || msg.senderId || msg.sender || 'unknown',
            name: msg.sender?.name || msg.senderName || 'Unknown User'
          },
          createdAt: msg.createdAt || msg.timestamp || msg.created_at || new Date().toISOString(),
          taskId: msg.taskId || taskId
        };
      });
      
      setChatMessages(prev => ({
        ...prev,
        [taskId]: normalizedMessages
      }));
      
      if (socket) {
        socket.emit('join_task_chat', { taskId });
      }
      
    } catch (err) {
      console.error('Error fetching chat messages:', err);
      
      if (err.response?.status === 404) {
        toast.error('Chat not found for this task');
      } else if (err.response?.status === 401) {
        toast.error('Authentication error - please login again');
      } else {
        toast.error('Failed to load chat messages');
      }
      
      setChatMessages(prev => ({
        ...prev,
        [taskId]: []
      }));
    } finally {
      setChatLoading(false);
    }
  }, [chatMessages, socket]);

  const handleSendChatMessage = useCallback(async () => {
    if (!newMessage.trim() || !activeChatTaskId || isSendingMessage) return;
    
    const messageContent = newMessage.trim();
    setNewMessage('');
    setIsSendingMessage(true);
    
    const tempMessage = {
      _id: 'temp-' + Date.now(),
      content: messageContent,
      sender: {
        _id: user._id,
        name: user.name || 'You'
      },
      createdAt: new Date().toISOString(),
      taskId: activeChatTaskId,
      isPending: true
    };
    
    setChatMessages(prev => ({
      ...prev,
      [activeChatTaskId]: [...(prev[activeChatTaskId] || []), tempMessage]
    }));
    
    try {
      const response = await apiService.chat.sendMessage({
        taskId: activeChatTaskId,
        content: messageContent,
        receiverId: activeChatTask?.createdBy?._id
      });
      
      let messageData = null;
      
      if (response?.data) {
        messageData = response.data;
      } else if (response?.message) {
        messageData = response.message;
      } else if (response?._id) {
        messageData = response;
      }

      const realMessage = {
        _id: messageData?._id || messageData?.id || `msg_${Date.now()}_${Math.random()}`,
        content: messageContent,
        sender: {
          _id: user._id,
          name: user.name || 'You'
        },
        createdAt: messageData?.createdAt || messageData?.timestamp || new Date().toISOString(),
        taskId: activeChatTaskId
      };
      
      setChatMessages(prev => ({
        ...prev,
        [activeChatTaskId]: prev[activeChatTaskId].map(msg => 
          msg._id === tempMessage._id ? realMessage : msg
        )
      }));
      
      if (socket) {
        const taskInfo = safeAllTasks.find(t => t._id === activeChatTaskId);
        
        socket.emit('new_message', {
          taskId: activeChatTaskId,
          message: realMessage,
          recipientId: taskInfo?.createdBy?._id,
          senderId: user._id
        });
      }
      
    } catch (err) {
      console.error('Error sending message:', err);
      
      setChatMessages(prev => ({
        ...prev,
        [activeChatTaskId]: prev[activeChatTaskId].filter(msg => msg._id !== tempMessage._id)
      }));
      
      setNewMessage(messageContent);
      toast.error('Failed to send message - please try again');
      
    } finally {
      setIsSendingMessage(false);
      chatInputRef.current?.focus();
    }
  }, [newMessage, activeChatTaskId, user, socket, isSendingMessage, activeChatTask, safeAllTasks]);

  const handleChatKeyPress = useCallback((e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendChatMessage();
    }
  }, [handleSendChatMessage]);

  const handleOpenChat = useCallback((taskId) => {
    const selectedTask = safeAllTasks.find(task => task._id === taskId);
    
    setActiveChatTaskId(taskId);
    setActiveChatTask(selectedTask || null);
    setActiveTab('chat');
    fetchChatMessages(taskId);
  }, [safeAllTasks, fetchChatMessages]);

  // Fetch all tasks function
  const fetchAllTasks = useCallback(async () => {
    try {
      console.log('Fetching all tasks...');
      
      const [availableResponse, assignedResponse] = await Promise.all([
        apiService.tasks.getAll().catch(err => {
          console.error('Error fetching available tasks:', err);
          return { data: [] };
        }),
        apiService.tasks.getAssignedTasks().catch(err => {
          console.error('Error fetching assigned tasks:', err);
          return { data: [] };
        })
      ]);
      
      const availableTasks = extractTasksFromResponse(availableResponse);
      const assignedTasks = extractTasksFromResponse(assignedResponse);
      
      // Combine and normalize all tasks, removing duplicates
      const taskMap = new Map();
      
      [...availableTasks, ...assignedTasks].forEach(task => {
        if (task && task._id) {
          const normalizedTask = normalizeTask(task);
          taskMap.set(task._id, normalizedTask);
        }
      });
      
      const allTasksArray = Array.from(taskMap.values());
      console.log('Final combined tasks:', allTasksArray);
      
      return allTasksArray;
    } catch (error) {
      console.error('Error fetching all tasks:', error);
      throw error;
    }
  }, [extractTasksFromResponse, normalizeTask]);

  // Initial load effect
  useEffect(() => {
    const loadAllTasks = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        const tasks = await fetchAllTasks();
        setAllTasks(tasks);
        console.log('Set all tasks:', tasks);
      } catch (err) {
        console.error('Error loading tasks:', err);
        setError('Failed to fetch tasks. Please try again.');
        setAllTasks([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadAllTasks();
  }, [fetchAllTasks]);

  // Refresh all tasks function
  const refreshAllTasks = useCallback(async () => {
    try {
      const tasks = await fetchAllTasks();
      setAllTasks(tasks);
      console.log('Refreshed all tasks:', tasks);
    } catch (err) {
      console.error('Error refreshing all tasks:', err);
    }
  }, [fetchAllTasks]);

  // Real-time task updates
  useEffect(() => {
    if (!socket) return;

    const handleTaskUpdate = (updatedTask) => {
      console.log('Received task update:', updatedTask);
      const normalizedTask = normalizeTask(updatedTask);
      
      setAllTasks(prevTasks => {
        const existingIndex = prevTasks.findIndex(t => t._id === normalizedTask._id);
        
        if (existingIndex !== -1) {
          const updatedTasks = [...prevTasks];
          updatedTasks[existingIndex] = { ...prevTasks[existingIndex], ...normalizedTask };
          console.log('Updated existing task:', updatedTasks[existingIndex]);
          return updatedTasks;
        } else {
          console.log('Adding new task:', normalizedTask);
          setNewTaskIds(prev => [...prev, normalizedTask._id]);
          return [normalizedTask, ...prevTasks];
        }
      });
    };

    const handleNewMessage = (data) => {
      console.log('Received new message:', data);
      
      if (!data?.message || !data?.taskId) {
        console.warn('Invalid message data received:', data);
        return;
      }

      const normalizedMessage = {
        _id: data.message._id || `socket_${Date.now()}_${Math.random()}`,
        content: typeof data.message.content === 'string' ? data.message.content : JSON.stringify(data.message.content) || 'Invalid message',
        sender: {
          _id: data.message.sender?._id || 'unknown',
          name: typeof data.message.sender?.name === 'string' ? data.message.sender.name : 'Unknown User'
        },
        createdAt: data.message.createdAt || new Date().toISOString(),
        taskId: data.taskId
      };
      
      if (normalizedMessage.sender._id !== user._id) {
        setChatMessages(prev => {
          const taskMessages = prev[data.taskId] || [];
          const exists = taskMessages.some(msg => msg._id === normalizedMessage._id);
          
          if (!exists) {
            console.log('Adding new message to task:', data.taskId);
            return {
              ...prev,
              [data.taskId]: [...taskMessages, normalizedMessage]
            };
          }
          return prev;
        });
        
        if (data.taskId !== activeChatTaskId) {
          const taskInfo = safeAllTasks.find(t => t._id === data.taskId);
          const senderName = normalizedMessage.sender.name || 'Someone';
          const taskTitle = taskInfo?.title || `Task #${data.taskId.slice(-6)}`;
          
          toast.info(`New message from ${senderName} in ${taskTitle}`);
        }
      }
    };

    socket.on('task_updated', handleTaskUpdate);
    socket.on('new_message', handleNewMessage);
    
    socket.emit('join_user_room', { userId: user._id });
    
    return () => {
      socket.off('task_updated', handleTaskUpdate);
      socket.off('new_message', handleNewMessage);
    };
  }, [socket, normalizeTask, user._id, activeChatTaskId, safeAllTasks]);

  // Auto-scroll chat
  useEffect(() => {
    if (activeTab === 'chat') {
      scrollChatToBottom();
    }
  }, [chatMessages, activeTab, scrollChatToBottom]);

  // FIXED: Task action handler for Accept
  const handleAcceptTask = useCallback(async (taskId) => {
    setLoadingTasks(prev => new Set(prev).add(taskId));
    
    const originalTask = safeAllTasks.find(t => t._id === taskId);
    
    // Optimistic update
    setAllTasks((prevTasks) =>
      prevTasks.map((task) =>
        task._id === taskId ? { 
          ...task, 
          status: "accepted", 
          assignedTo: { _id: user._id, name: user.name, email: user.email }
        } : task
      )
    );
    
    try {
      console.log('Accepting task:', taskId);
      
      const response = await apiService.put(`/tasks/${taskId}/accept`);
      console.log('Accept response:', response);

      toast.success("Task accepted successfully!");
      setActiveTab("accepted");
      
      await refreshAllTasks();
      
    } catch (error) {
      console.error("Error accepting task:", error);
      
      // Rollback optimistic update on error
      if (originalTask) {
        setAllTasks((prevTasks) =>
          prevTasks.map((task) =>
            task._id === taskId ? originalTask : task
          )
        );
      }
      
      const errorMessage = error.response?.data?.message || "Failed to accept task.";
      toast.error(errorMessage);
      
    } finally {
      setLoadingTasks(prev => {
        const newSet = new Set(prev);
        newSet.delete(taskId);
        return newSet;
      });
    }
  }, [user, refreshAllTasks, safeAllTasks]);

  // Task action handler for Start
  const handleStartTask = useCallback(async (taskId) => {
    setLoadingTasks(prev => new Set(prev).add(taskId));
    
    const originalTask = safeAllTasks.find(t => t._id === taskId);
    
    // Optimistic update
    setAllTasks((prevTasks) =>
      prevTasks.map((task) =>
        task._id === taskId ? { ...task, status: "in_progress" } : task
      )
    );
    
    try {
      console.log('Starting task:', taskId);
      
      const response = await apiService.put(`/tasks/${taskId}/status`, {
        status: 'in_progress'
      });
      console.log('Start response:', response);

      toast.success("Task started successfully!");
      setActiveTab("in_progress");
      
      await refreshAllTasks();
      
    } catch (error) {
      console.error("Error starting task:", error);
      
      // Rollback optimistic update on error
      if (originalTask) {
        setAllTasks((prevTasks) =>
          prevTasks.map((task) =>
            task._id === taskId ? originalTask : task
          )
        );
      }
      
      const errorMessage = error.response?.data?.message || "Failed to start task.";
      toast.error(errorMessage);
      
    } finally {
      setLoadingTasks(prev => {
        const newSet = new Set(prev);
        newSet.delete(taskId);
        return newSet;
      });
    }
  }, [refreshAllTasks, safeAllTasks]);

  // Task action handler for Complete
  const handleCompleteTask = useCallback(async (taskId) => {
    const taskToComplete = safeAllTasks.find(t => t._id === taskId);
    if (!taskToComplete) {
      toast.error('Task not found');
      return;
    }
    
    setTaskToComplete(taskToComplete);
    setShowFeedbackModal(true);
  }, [safeAllTasks]);

  // Task action handler for Cancel
  const handleCancelTask = useCallback(async (taskId) => {
    setLoadingTasks(prev => new Set(prev).add(taskId));
    
    const originalTask = safeAllTasks.find(t => t._id === taskId);
    
    // Optimistic update
    setAllTasks((prevTasks) =>
      prevTasks.map((task) =>
        task._id === taskId ? { ...task, status: "cancelled" } : task
      )
    );
    
    try {
      console.log('Cancelling task:', taskId);
      
      const response = await apiService.put(`/tasks/${taskId}/status`, {
        status: 'cancelled'
      });
      console.log('Cancel response:', response);

      toast.success("Task cancelled successfully!");
      
      await refreshAllTasks();
      
    } catch (error) {
      console.error("Error cancelling task:", error);
      
      // Rollback optimistic update on error
      if (originalTask) {
        setAllTasks((prevTasks) =>
          prevTasks.map((task) =>
            task._id === taskId ? originalTask : task
          )
        );
      }
      
      const errorMessage = error.response?.data?.message || "Failed to cancel task.";
      toast.error(errorMessage);
      
    } finally {
      setLoadingTasks(prev => {
        const newSet = new Set(prev);
        newSet.delete(taskId);
        return newSet;
      });
    }
  }, [refreshAllTasks, safeAllTasks]);

  // Report task issue handler
  const handleReportTaskIssue = useCallback((taskId) => {
    const task = safeAllTasks.find(t => t._id === taskId);
    setReportData({
      type: 'task_issue',
      description: '',
      taskId: taskId,
      userId: task?.createdBy?._id || null
    });
    setShowReportModal(true);
  }, [safeAllTasks]);

  // Feedback submission handler
  const handleFeedbackSubmit = useCallback(async (feedbackData) => {
    try {
      const response = await apiService.serviceProviderFeedback.submitAndCompleteTask(feedbackData);
      
      if (response.error) {
        throw new Error(response.error.message);
      }

      setAllTasks(prevTasks => 
        prevTasks.map(task => 
          task._id === feedbackData.taskId 
            ? { ...task, status: 'completed', completedAt: new Date().toISOString() } 
            : task
        )
      );

      if (taskToComplete?.createdBy?._id) {
        updateTaskStatus(feedbackData.taskId, 'completed', taskToComplete.createdBy._id);
      }

      await refreshAllTasks();
      
      toast.success("Task completed and feedback submitted successfully!");
      setActiveTab("completed");
      
    } catch (error) {
      console.error('Error submitting feedback and completing task:', error);
      toast.error(error.message || 'Failed to complete task');
      throw error;
    }
  }, [taskToComplete, updateTaskStatus, refreshAllTasks]);

  const handleLogout = useCallback(() => { logout(); navigate('/'); }, [logout, navigate]);

  if (isLoading) return <LoadingSpinner />;

  return (
    <div className="page-container py-6">
      {/* Header */}
      <div className="card mb-6 sm:mb-8">
        <div className="flex flex-col space-y-4 p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
            <div className="text-center sm:text-left">
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Dashboard</h1>
              <p className="text-gray-600 mt-1 text-sm sm:text-base">Welcome back, {user?.name || 'Service Provider'}!</p>
            </div>
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
              <button 
                onClick={() => setShowProfileModal(true)} 
                className="btn-secondary text-sm sm:text-base px-3 sm:px-4 py-2 hover:scale-105 transition-transform"
              >
                Profile
              </button>
              <button 
                onClick={() => setShowServiceInfoModal(true)} 
                className="btn-secondary text-sm sm:text-base px-3 sm:px-4 py-2 hover:scale-105 transition-transform"
              >
                Service Info
              </button>
              <button 
                onClick={handleLogout} 
                className="btn-outline text-red-600 border-red-600 hover:bg-red-600 hover:text-white text-sm sm:text-base px-3 sm:px-4 py-2 hover:scale-105 transition-transform"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6 mb-6 sm:mb-8">
        {Object.entries(taskStats).map(([status, count]) => (
          <div key={status} className="card text-center p-3 sm:p-4 lg:p-6 hover:shadow-lg transition-shadow rounded-lg">
            <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-800 mb-1 sm:mb-2">{count}</div>
            <div className="text-xs sm:text-sm lg:text-base text-gray-500">{capitalize(status.replace('_', ' '))} Tasks</div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="card mb-6 sm:mb-8 p-1 sm:p-2 rounded-lg">
        <div className="border-b border-gray-300">
          <nav className="-mb-px flex space-x-2 sm:space-x-4 lg:space-x-8 overflow-x-auto scrollbar-hide px-2 sm:px-0">
            {Object.keys(STATUS_FILTERS).map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`py-2 px-2 sm:px-3 border-b-2 font-medium text-xs sm:text-sm whitespace-nowrap transition-colors ${
                  activeTab === tab 
                    ? 'border-primary-500 text-primary-600' 
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <span className="hidden sm:inline">{capitalize(tab.replace('_', ' '))} ({taskStats[STATUS_FILTERS[tab]] || 0})</span>
                <span className="sm:hidden">{capitalize(tab.replace('_', ' '))}</span>
              </button>
            ))}
            {/* Chat Tab */}
            <button
              onClick={() => setActiveTab('chat')}
              className={`py-2 px-2 sm:px-3 border-b-2 font-medium text-xs sm:text-sm whitespace-nowrap transition-colors ${
                activeTab === 'chat' 
                  ? 'border-primary-500 text-primary-600' 
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <span className="hidden lg:inline">Chat {activeChatTask ? `(${activeChatTask.createdBy?.name || 'Task Poster'})` : activeChatTaskId ? `(Task #${activeChatTaskId.slice(-6)})` : ''}</span>
              <span className="lg:hidden">Chat</span>
            </button>
          </nav>
        </div>
        
        <div className="p-2 sm:p-4">
          {/* Chat Content */}
          {activeTab === 'chat' ? (
            <div className="space-y-4">
              {!activeChatTaskId ? (
                <div className="text-center py-8 sm:py-12 px-4">
                  <svg className="mx-auto h-12 w-12 sm:h-16 sm:w-16 text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                  <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-2">No Active Chat</h3>
                  <p className="text-gray-500 mb-4 text-sm sm:text-base">Click the "Chat" button on any task to start messaging.</p>
                  <button 
                    onClick={() => setActiveTab('available')}
                    className="btn-primary text-sm sm:text-base px-4 py-2"
                  >
                    View Available Tasks
                  </button>
                </div>
              ) : (
                <div className="bg-white rounded-lg border shadow-sm">
                  {/* Chat Header */}
                  <div className="flex items-center justify-between p-3 sm:p-4 bg-gray-50 border-b rounded-t-lg">
                    <div className="min-w-0 flex-1 mr-2">
                      <h3 className="text-sm sm:text-lg font-semibold text-gray-800 truncate">
                        {activeChatTask ? (
                          <>
                            <span className="block sm:inline">Chat with {activeChatTask.createdBy?.name || 'Task Poster'}</span>
                            <span className="text-xs sm:text-sm text-gray-500 block">
                              Task: {activeChatTask.title || `#${activeChatTaskId.slice(-6)}`}
                            </span>
                          </>
                        ) : (
                          `Task Chat #${activeChatTaskId.slice(-6)}`
                        )}
                      </h3>
                    </div>
                    <button
                      onClick={() => {
                        setActiveChatTaskId(null);
                        setActiveChatTask(null);
                        setActiveTab('available');
                      }}
                      className="text-gray-400 hover:text-gray-600 transition-colors flex-shrink-0"
                    >
                      <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>

                  {/* Messages Area */}
                  <div className="h-64 sm:h-80 md:h-96 overflow-y-auto p-3 sm:p-4 space-y-3 sm:space-y-4">
                    {chatLoading ? (
                      <div className="flex items-center justify-center h-full">
                        <div className="animate-spin rounded-full h-6 w-6 sm:h-8 sm:w-8 border-b-2 border-blue-500"></div>
                      </div>
                    ) : (chatMessages[activeChatTaskId] || []).length === 0 ? (
                      <div className="text-center text-gray-500 py-6 sm:py-8">
                        <p className="text-sm sm:text-base">No messages yet. Start the conversation!</p>
                      </div>
                    ) : (
                      (chatMessages[activeChatTaskId] || []).map((message) => {
                        const isOwn = message.sender._id === user._id;
                        
                        return (
                          <div key={message._id} className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-[85%] sm:max-w-xs lg:max-w-md`}>
                              <div className={`
                                px-3 py-2 sm:px-4 sm:py-2 rounded-lg shadow-sm
                                ${isOwn 
                                  ? 'bg-blue-500 text-white rounded-br-none' 
                                  : 'bg-gray-200 text-gray-800 rounded-bl-none'
                                }
                                ${message.isPending ? 'opacity-70' : ''}
                              `}>
                                <p className="text-sm whitespace-pre-wrap break-words">
                                  {typeof message.content === 'string' ? message.content : JSON.stringify(message.content) || 'Invalid message content'}
                                </p>
                              </div>
                              
                              <div className={`flex items-center mt-1 space-x-2 text-xs text-gray-500 ${isOwn ? 'justify-end' : 'justify-start'}`}>
                                {!isOwn && (
                                  <span className="font-medium truncate max-w-20 sm:max-w-none">
                                    {typeof message.sender?.name === 'string' ? message.sender.name : 'Unknown User'}
                                  </span>
                                )}
                                <span className="flex-shrink-0">{formatMessageDate(message.createdAt)}</span>
                                {message.isPending && (
                                  <span className="text-blue-500 flex-shrink-0">Sending...</span>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })
                    )}
                    <div ref={messagesEndRef} />
                  </div>

                  {/* Input Area */}
                  <div className="p-3 sm:p-4 border-t bg-gray-50">
                    <div className="flex space-x-2">
                      <div className="flex-1">
                        <textarea
                          ref={chatInputRef}
                          value={newMessage}
                          onChange={(e) => setNewMessage(e.target.value)}
                          onKeyPress={handleChatKeyPress}
                          placeholder="Type your message..."
                          rows="2"
                          disabled={isSendingMessage}
                          className="w-full px-3 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none disabled:opacity-50 disabled:cursor-not-allowed"
                        />
                      </div>
                      <button
                        onClick={handleSendChatMessage}
                        disabled={!newMessage.trim() || isSendingMessage}
                        className="px-3 py-2 sm:px-4 sm:py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex-shrink-0"
                      >
                        {isSendingMessage ? (
                          <div className="w-4 h-4 sm:w-5 sm:h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        ) : (
                          <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                          </svg>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* Task List Content */
            <>
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
                  {error}
                  <button 
                    onClick={() => window.location.reload()} 
                    className="ml-2 underline hover:no-underline"
                  >
                    Retry
                  </button>
                </div>
              )}
              
              {filteredTasks.length === 0 ? (
                <p className="text-gray-500 text-center py-6">No tasks found.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse min-w-full">
                    <thead>
                      <tr>
                        <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                        <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden sm:table-cell">Status</th>
                        <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">Priority</th>
                        <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden lg:table-cell">Budget</th>
                        <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden lg:table-cell">Date</th>
                        <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {filteredTasks.map(task => {
                        const isLoading = loadingTasks.has(task._id);
                        const isNewTask = newTaskIds.includes(task._id);
                        
                        return (
                          <tr 
                            key={task._id} 
                            className={`${isNewTask ? 'bg-blue-50 animate-pulse' : ''} ${isLoading ? 'opacity-60' : ''}`}
                          >
                            <td className="px-3 sm:px-6 py-4 font-medium">
                              <div className="min-w-0">
                                <div className="text-sm font-medium text-gray-900 truncate">{task.title}</div>
                                <div className="sm:hidden mt-1 flex flex-wrap gap-1">
                                  <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(task.status)}`}>
                                    {capitalize(task.status.replace('_', ' '))}
                                  </span>
                                  <span className={`px-2 py-1 text-xs rounded-full ${getPriorityColor(task.priority)}`}>
                                    {capitalize(task.priority)}
                                  </span>
                                </div>
                                <div className="lg:hidden mt-1 text-xs text-gray-500">
                                  PKR {task.minBudget} - PKR {task.maxBudget} • {formatDate(task.date)}
                                </div>
                              </div>
                            </td>
                            <td className="px-3 sm:px-6 py-4 whitespace-nowrap hidden sm:table-cell">
                              <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(task.status)}`}>
                                {capitalize(task.status.replace('_', ' '))}
                              </span>
                            </td>
                            <td className="px-3 sm:px-6 py-4 whitespace-nowrap hidden md:table-cell">
                              <span className={`px-2 py-1 text-xs rounded-full ${getPriorityColor(task.priority)}`}>
                                {capitalize(task.priority)}
                              </span>
                            </td>
                            <td className="px-3 sm:px-6 py-4 whitespace-nowrap hidden lg:table-cell">PKR {task.minBudget} - PKR {task.maxBudget}</td>
                            <td className="px-3 sm:px-6 py-4 whitespace-nowrap hidden lg:table-cell">
                              {formatDate(task.date)}
                            </td>
                            <td className="px-3 sm:px-6 py-4">
                              <div className="flex gap-1 sm:gap-2 flex-wrap">
                                {task.status === 'posted' && (
                                  <button 
                                    onClick={() => handleAcceptTask(task._id)} 
                                    disabled={isLoading}
                                    className="btn-primary text-xs sm:text-sm px-2 sm:px-3 py-1 sm:py-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                  >
                                    {isLoading ? 'Accepting...' : 'Accept'}
                                  </button>
                                )}
                                {task.status === 'accepted' && (
                                  <button 
                                    onClick={() => handleStartTask(task._id)} 
                                    disabled={isLoading}
                                    className="btn-primary text-xs sm:text-sm px-2 sm:px-3 py-1 sm:py-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                  >
                                    {isLoading ? 'Starting...' : 'Start'}
                                  </button>
                                )}
                                {task.status === 'in_progress' && (
                                  <button 
                                    onClick={() => handleCompleteTask(task._id)} 
                                    disabled={isLoading}
                                    className="btn-primary text-xs sm:text-sm px-2 sm:px-3 py-1 sm:py-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                  >
                                    {isLoading ? 'Completing...' : 'Complete'}
                                  </button>
                                )}
                                {task.status !== 'completed' && (
                                  <button 
                                    onClick={() => handleCancelTask(task._id)} 
                                    disabled={isLoading}
                                    className="btn-outline text-red-600 text-xs sm:text-sm px-2 sm:px-3 py-1 sm:py-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                  >
                                    <span className="hidden sm:inline">Cancel</span>
                                    <span className="sm:hidden">✕</span>
                                  </button>
                                )}
                                <button 
                                  onClick={() => handleReportTaskIssue(task._id)} 
                                  className="btn-outline text-yellow-600 text-xs sm:text-sm px-2 sm:px-3 py-1 sm:py-2"
                                >
                                  <span className="hidden sm:inline">Report</span>
                                  <span className="sm:hidden">⚠</span>
                                </button>
                                <button 
                                  onClick={() => handleOpenChat(task._id)} 
                                  className="btn-outline text-blue-600 text-xs sm:text-sm px-2 sm:px-3 py-1 sm:py-2"
                                >
                                  <span className="hidden sm:inline">Chat</span>
                                  <span className="sm:hidden">💬</span>
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Modals */}
      {showReportModal && (
        <TaskIssueReportModal 
          isOpen={showReportModal}
          taskId={reportData.taskId}
          userId={reportData.userId}
          onClose={() => setShowReportModal(false)} 
        />
      )}
      {showServiceInfoModal && (
        <ServiceInfoModal 
          isOpen={showServiceInfoModal}
          user={user}
          onClose={() => setShowServiceInfoModal(false)} 
        />
      )}
      {showProfileModal && (
        <ServiceProviderProfileModal 
          onClose={() => setShowProfileModal(false)} 
        />
      )}
      {showFeedbackModal && taskToComplete && (
        <TaskCompletionFeedbackModal
          isOpen={showFeedbackModal}
          task={taskToComplete}
          onClose={() => {
            setShowFeedbackModal(false);
            setTaskToComplete(null);
          }}
          onSubmit={handleFeedbackSubmit}
        />
      )}
    </div>
  );
};

// Modal wrapper for ServiceProviderProfileTab
const ServiceProviderProfileModal = ({ onClose }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
    <div className="bg-white p-4 sm:p-6 rounded-lg w-full max-w-2xl relative max-h-[90vh] overflow-y-auto">
      <button 
        onClick={onClose} 
        className="absolute top-3 right-3 sm:top-4 sm:right-4 text-gray-600 hover:text-gray-900 z-10"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
      <ServiceProviderProfileTab />
    </div>
  </div>
);

export default ServiceProviderDashboard;