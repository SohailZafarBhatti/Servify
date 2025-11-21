import api from '../utils/api';

const feedbackService = {
  // Submit feedback for a completed task
  submitFeedback: async (feedbackData) => {
    try {
      const response = await api.post('/feedback', feedbackData);
      return response.data;
    } catch (error) {
      console.error('Error submitting feedback:', error);
      throw error;
    }
  },

  // Get tasks pending feedback
  getPendingFeedback: async () => {
    try {
      const response = await api.get('/feedback/pending');
      return response.data;
    } catch (error) {
      console.error('Error fetching pending feedback:', error);
      throw error;
    }
  },

  // Get customer's submitted feedback
  getCustomerFeedback: async (page = 1, limit = 10) => {
    try {
      const response = await api.get(`/feedback/customer?page=${page}&limit=${limit}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching customer feedback:', error);
      throw error;
    }
  },

  // Get feedback for a specific task
  getFeedbackByTask: async (taskId) => {
    try {
      const response = await api.get(`/feedback/task/${taskId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching task feedback:', error);
      throw error;
    }
  },

  // Get feedback for a service provider
  getProviderFeedback: async (providerId, page = 1, limit = 10) => {
    try {
      const response = await api.get(`/feedback/provider/${providerId}?page=${page}&limit=${limit}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching provider feedback:', error);
      throw error;
    }
  }
};

export default feedbackService;