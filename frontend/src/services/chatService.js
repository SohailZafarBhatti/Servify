// src/services/chatService.js
import api from '../utils/api';

const chatService = {
  // Get all user's chat conversations
  getConversations: async () => {
    try {
      const response = await api.get('/chat');
      return response.data;
    } catch (error) {
      console.error('Error fetching conversations:', error);
      return { chats: [] }; // Return empty array instead of throwing
    }
  },

  // Get or create chat for a specific task
  getMessages: async (taskId) => {
    try {
      const response = await api.get(`/chat/${taskId}/messages`);
      return response.data;
    } catch (error) {
      console.error('Error fetching messages:', error);
      return { messages: [], participants: [] }; // Return empty structure instead of throwing
    }
  },

  // Send message in a task chat
  sendMessage: async (messageData) => {
    try {
      const { taskId, content } = messageData;
      const response = await api.post(`/chat/${taskId}/messages`, { content });
      return response.data;
    } catch (error) {
      console.error('Error sending message:', error);
      throw error; // Still throw for send message to show user the error
    }
  },

  // Get chat info for a specific task
  getTaskChat: async (taskId) => {
    try {
      const response = await api.get(`/chat/task/${taskId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching task chat:', error);
      throw error;
    }
  },

  // Get notifications (if implemented)
  getNotifications: async () => {
    try {
      const response = await api.get('/notifications');
      return response.data;
    } catch (error) {
      console.error('Error fetching notifications:', error);
      return { notifications: [] };
    }
  }
};

export default chatService;
