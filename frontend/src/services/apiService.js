import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  timeout: 10000,
});

// Add token to requests if available
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Handle token expiration
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Helper function to handle API responses
const handleResponse = (response) => {
  if (response.data && response.data.success) {
    return { data: response.data, error: null };
  } else if (response.data) {
    return { data: response.data, error: null };
  } else {
    return { data: null, error: { message: response.data?.message || 'Request failed' } };
  }
};

const handleError = (error) => {
    return { 
      data: null, 
      error: {
      message: error.response?.data?.message || error.message || 'Request failed' 
    } 
  };
};

export const apiService = {
  // Auth endpoints
  auth: {
    login: async (credentials) => {
      try {
        const response = await api.post('/auth/login', credentials);
        return handleResponse(response);
      } catch (error) {
        return handleError(error);
      }
    },
    register: async (userData) => {
      try {
        const response = await api.post('/auth/register', userData);
        return handleResponse(response);
      } catch (error) {
        return handleError(error);
      }
    },
    getMe: async () => {
      try {
        const response = await api.get('/auth/me');
        return handleResponse(response);
      } catch (error) {
        return handleError(error);
      }
    },
    updateProfile: async (userData) => {
      try {
        const response = await api.put('/auth/profile', userData);
        return handleResponse(response);
      } catch (error) {
        return handleError(error);
      }
    },
    changePassword: async (passwordData) => {
      try {
        const response = await api.put('/auth/change-password', passwordData);
        return handleResponse(response);
      } catch (error) {
        return handleError(error);
      }
    },
    getUserById: async (userId) => {
      try {
        const response = await api.get(`/auth/user/${userId}`);
        return handleResponse(response);
      } catch (error) {
        return handleError(error);
      }
    }
  },

  // Task endpoints
  tasks: {
    create: async (taskData) => {
      try {
        const response = await api.post('/tasks', taskData);
        return handleResponse(response);
      } catch (error) {
        return handleError(error);
      }
    },
    getAll: async (filters = {}) => {
      try {
        const response = await api.get('/tasks', { params: filters });
        return handleResponse(response);
      } catch (error) {
        return handleError(error);
      }
    },
    getMyTasks: async () => {
      try {
        const response = await api.get('/tasks/my-tasks');
        return handleResponse(response);
      } catch (error) {
        return handleError(error);
      }
    },
    getAssignedTasks: async () => {
      try {
        const response = await api.get('/tasks/assigned');
        return handleResponse(response);
      } catch (error) {
        return handleError(error);
      }
    },
    getById: async (taskId) => {
      try {
        const response = await api.get(`/tasks/${taskId}`);
        return handleResponse(response);
      } catch (error) {
        return handleError(error);
      }
    },
    accept: async (taskId) => {
      try {
        const response = await api.post(`/tasks/${taskId}/accept`);
        return handleResponse(response);
      } catch (error) {
        return handleError(error);
      }
    },
    updateStatus: async (taskId, status, data = {}) => {
      try {
        const response = await api.put(`/tasks/${taskId}/status`, { status, ...data });
        return handleResponse(response);
      } catch (error) {
        return handleError(error);
      }
    },
    rateAndReview: async (taskId, rating, review) => {
      try {
        const response = await api.post(`/tasks/${taskId}/review`, { rating, review });
        return handleResponse(response);
      } catch (error) {
        return handleError(error);
      }
    },
  delete: async (taskId) => {
      try {
        const response = await api.delete(`/tasks/${taskId}`);
        return handleResponse(response);
      } catch (error) {
        return handleError(error);
      }
    }
  },

  // Chat endpoints
  chat: {
    getConversations: async () => {
      try {
        const response = await api.get('/chat');
        return handleResponse(response);
      } catch (error) {
        return handleError(error);
      }
    },
    getMessages: async (taskId) => {
      try {
        const response = await api.get(`/chat/${taskId}/messages`);
        return handleResponse(response);
      } catch (error) {
        return handleError(error);
      }
    },
    sendMessage: async (messageData) => {
      try {
        const { taskId, content, receiverId } = messageData;
        const response = await api.post(`/chat/${taskId}/messages`, {
          content,
          receiverId
        });
        return handleResponse(response);
      } catch (error) {
        return handleError(error);
      }
    },
    markAsRead: async (chatId) => {
      try {
        const response = await api.put(`/chat/${chatId}/read`);
        return handleResponse(response);
      } catch (error) {
        return handleError(error);
      }
    },
    getUnreadCount: async () => {
      try {
        const response = await api.get('/chat/unread/count');
        return handleResponse(response);
      } catch (error) {
        return handleError(error);
      }
    }
  },

  // Profile endpoints
  profile: {
  getRatings: async () => {
      try {
        const response = await api.get('/profile/ratings');
        return handleResponse(response);
      } catch (error) {
        return handleError(error);
      }
    },
    update: async (profileData) => {
      try {
        const response = await api.put('/auth/profile', profileData);
        return handleResponse(response);
      } catch (error) {
        return handleError(error);
      }
    }
  },

  // Issue endpoints
  issues: {
    report: async (issueData) => {
      try {
        const response = await api.post('/issues', issueData);
        return handleResponse(response);
      } catch (error) {
        return handleError(error);
      }
    }
  },

  // Service Provider Feedback endpoints
  serviceProviderFeedback: {
    submitAndCompleteTask: async (feedbackData) => {
      try {
        const response = await api.post('/service-provider-feedback', feedbackData);
        return handleResponse(response);
      } catch (error) {
        return handleError(error);
      }
    },
    getMyFeedback: async () => {
      try {
        const response = await api.get('/service-provider-feedback/my-feedback');
        return handleResponse(response);
      } catch (error) {
        return handleError(error);
      }
    },
    getCustomerFeedback: async (customerId) => {
      try {
        const response = await api.get(`/service-provider-feedback/customer/${customerId}`);
        return handleResponse(response);
      } catch (error) {
        return handleError(error);
      }
    },
    getTaskFeedback: async (taskId) => {
      try {
        const response = await api.get(`/service-provider-feedback/task/${taskId}`);
        return handleResponse(response);
      } catch (error) {
        return handleError(error);
      }
    }
  },

  // Notifications endpoints
  notifications: {
    getAll: async () => {
      try {
        const response = await api.get('/notifications');
        return handleResponse(response);
      } catch (error) {
        return handleError(error);
      }
    },
  markAsRead: async (notificationId) => {
      try {
        const response = await api.put(`/notifications/${notificationId}/read`);
        return handleResponse(response);
      } catch (error) {
        return handleError(error);
      }
    },
    markAllAsRead: async () => {
      try {
        const response = await api.put('/notifications/read-all');
        return handleResponse(response);
      } catch (error) {
        return handleError(error);
      }
    }
  },

  // Generic API methods
  get: async (url, config = {}) => {
    try {
      const response = await api.get(url, config);
      return handleResponse(response);
    } catch (error) {
      return handleError(error);
    }
  },

  post: async (url, data = {}, config = {}) => {
    try {
      const response = await api.post(url, data, config);
      return handleResponse(response);
    } catch (error) {
      return handleError(error);
    }
  },

  put: async (url, data = {}, config = {}) => {
    try {
      const response = await api.put(url, data, config);
      return handleResponse(response);
    } catch (error) {
      return handleError(error);
    }
  },

  delete: async (url, config = {}) => {
    try {
      const response = await api.delete(url, config);
      return handleResponse(response);
    } catch (error) {
      return handleError(error);
    }
  }
};