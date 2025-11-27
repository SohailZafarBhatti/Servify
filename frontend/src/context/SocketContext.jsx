import React, { createContext, useContext, useEffect, useState } from 'react';
import io from 'socket.io-client';
import { useAuth } from './AuthContext';

const SocketContext = createContext();

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const { user, isAuthenticated } = useAuth();

  useEffect(() => {
    if (isAuthenticated && user) {
      // Determine Socket.IO base URL with sensible fallbacks for prod/local
      const socketUrl =
        import.meta.env.VITE_SOCKET_URL ||
        (import.meta.env.VITE_API_FRONTEND_URL
          ? import.meta.env.VITE_API_FRONTEND_URL.replace(/\/api\/?$/, '')
          : window.location.origin || 'http://localhost:5000');
      
      console.log('Connecting to socket server:', socketUrl);
      
      const newSocket = io(socketUrl, {
        auth: {
          token: localStorage.getItem('token')
        }
      });

      newSocket.on('connect', () => {
        console.log('Connected to Socket.IO server');
        setIsConnected(true);
        
        // Join user's room
        newSocket.emit('join', user._id);
      });

      newSocket.on('disconnect', () => {
        console.log('Disconnected from Socket.IO server');
        setIsConnected(false);
      });

      newSocket.on('connect_error', (error) => {
        console.error('Socket connection error:', error);
        setIsConnected(false);
      });

      setSocket(newSocket);

      // Cleanup on unmount
      return () => {
        newSocket.close();
      };
    } else {
      // Disconnect if not authenticated
      if (socket) {
        socket.close();
        setSocket(null);
        setIsConnected(false);
      }
    }
  }, [isAuthenticated, user]);

  // Send message function
  const sendMessage = (messageData) => {
    if (socket && isConnected) {
      console.log('Socket sending message:', messageData);
      socket.emit('send_message', {
        taskId: messageData.taskId,
        content: messageData.content,
        receiverId: messageData.receiverId,
        chatId: messageData.chatId,
        message: messageData.message,
        senderId: user._id,
        timestamp: new Date()
      });
    } else {
      console.warn('Socket not connected, message not sent');
    }
  };

  // Update task status function
  const updateTaskStatus = (taskId, status, userId) => {
    if (socket && isConnected) {
      socket.emit('task_update', {
        taskId,
        status,
        userId
      });
    }
  };

  // Send notification function
  const sendNotification = (userId, notification) => {
    if (socket && isConnected) {
      socket.emit('send_notification', {
        userId,
        notification
      });
    }
  };

  // Listen for incoming messages
  const onMessage = (callback) => {
    if (socket) {
      socket.on('receive_message', callback);
    }
  };

  // Listen for task updates
  const onTaskUpdate = (callback) => {
    if (socket) {
      socket.on('task_updated', callback);
    }
  };

  // Listen for notifications
  const onNotification = (callback) => {
    if (socket) {
      socket.on('receive_notification', callback);
    }
  };

  // Remove event listeners
  const removeListener = (event) => {
    if (socket) {
      socket.off(event);
    }
  };

  const value = {
    socket,
    isConnected,
    sendMessage,
    updateTaskStatus,
    sendNotification,
    onMessage,
    onTaskUpdate,
    onNotification,
    removeListener
  };

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};
