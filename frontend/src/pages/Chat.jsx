import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { apiService } from '../services/apiService';
import { toast } from 'react-toastify';
import LoadingSpinner from '../components/LoadingSpinner';

const Chat = () => {
  const { user } = useAuth();
  const { socket } = useSocket();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentTask, setCurrentTask] = useState(null);
  const [otherUser, setOtherUser] = useState(null);
  const [chatId, setChatId] = useState(null);
  
  const messagesEndRef = useRef(null);
  const taskId = searchParams.get('task');

  // Scroll to bottom of messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Initialize chat when component mounts
  useEffect(() => {
    const initializeChat = async () => {
      if (!user) {
        setError('Please log in to access chat');
        setLoading(false);
        return;
      }

      if (!taskId) {
        setError('No task specified for chat');
        setLoading(false);
        return;
      }

      try {
        console.log('=== CHAT INITIALIZATION DEBUG ===');
        console.log('User:', user);
        console.log('Task ID:', taskId);

        // Get task details
        const taskResponse = await apiService.tasks.getById(taskId);
        console.log('Task response:', taskResponse);

        if (taskResponse.error) {
          console.error('Task API error:', taskResponse.error);
          setError(`Failed to load task details: ${taskResponse.error.message || 'Unknown error'}`);
          setLoading(false);
          return;
        }

        if (!taskResponse.data || !taskResponse.data.task) {
          console.error('No task data received');
          setError('No task data received from server');
          setLoading(false);
          return;
        }

        const task = taskResponse.data.task;
        console.log('Task data:', task);
        setCurrentTask(task);

        // Get or create chat for this task
        console.log('Fetching chat messages for task:', taskId);
        const chatResponse = await apiService.chat.getMessages(taskId);
        console.log('Chat response:', chatResponse);

        if (chatResponse.error) {
          console.error('Chat API error:', chatResponse.error);
          setError(`Failed to load chat: ${chatResponse.error.message || 'Unknown error'}`);
          setLoading(false);
          return;
        }

        const chatData = chatResponse.data;
        console.log('Chat data:', chatData);
        console.log('Chat data type:', typeof chatData);
        console.log('Chat data keys:', Object.keys(chatData || {}));
        console.log('Participants:', chatData.participants);
        console.log('Participants type:', typeof chatData.participants);
        console.log('Participants length:', chatData.participants?.length);
        console.log('Current user ID:', user._id);
        console.log('Current user type:', typeof user._id);
        
        setChatId(chatData.chatId);
        setMessages(chatData.messages || []);

        // Determine the other user from chat participants
        if (chatData.participants && chatData.participants.length > 0) {
          console.log('Processing participants...');
          console.log('All participants:', chatData.participants);
          
          const otherParticipant = chatData.participants.find(p => {
            console.log('Checking participant:', p);
            console.log('Participant ID:', p._id);
            console.log('Participant ID type:', typeof p._id);
            console.log('User ID:', user._id);
            console.log('User ID type:', typeof user._id);
            console.log('Are they equal?', p._id !== user._id);
            return p._id !== user._id;
          });
          
          console.log('Other participant found:', otherParticipant);
          
          if (otherParticipant) {
            setOtherUser(otherParticipant);
          } else {
            setError('Unable to identify chat participants');
            setLoading(false);
            return;
          }
        } else {
          console.error('No participants found in chat data');
          console.error('chatData.participants:', chatData.participants);
          setError('No chat participants found');
          setLoading(false);
          return;
        }

        console.log('=== CHAT INITIALIZATION SUCCESS ===');
        setLoading(false);

      } catch (err) {
        console.error('=== CHAT INITIALIZATION ERROR ===');
        console.error('Error details:', err);
        console.error('Error message:', err.message);
        console.error('Error stack:', err.stack);
        console.error('=== CHAT INITIALIZATION ERROR END ===');
        
        setError(`Failed to initialize chat: ${err.message}`);
        setLoading(false);
      }
    };

    initializeChat();
  }, [user, taskId]);

  // Listen for incoming messages
  useEffect(() => {
    if (!socket) return;

    // Join user to their room for receiving messages
    console.log('Joining user to room:', user._id);
    socket.emit('join', user._id);

    const handleNewMessage = (data) => {
      console.log('New message received:', data);
      if (data.taskId === taskId) {
        // Only add message if it's not from current user (to avoid duplication)
        const messageFromOther = (data.message.sender?._id || data.message.sender) !== user._id;
        if (messageFromOther) {
          setMessages(prev => [...prev, data.message]);
        }
      }
    };

    const handleMessageSent = (data) => {
      console.log('Message sent confirmation:', data);
    };

    socket.on('receive_message', handleNewMessage);
    socket.on('message_sent', handleMessageSent);

    return () => {
      socket.off('receive_message', handleNewMessage);
      socket.off('message_sent', handleMessageSent);
    };
  }, [socket, taskId, user._id]);

  // Send message
  const handleSendMessage = async () => {
    if (!newMessage.trim() || !taskId) return;

    try {
      const messageData = {
        taskId: taskId,
        content: newMessage.trim()
      };

      console.log('Sending message:', messageData);

      // Send via API
      const response = await apiService.chat.sendMessage(messageData);
      
      if (response.error) {
        toast.error('Failed to send message');
        return;
      }

      // Add message to local state
      const sentMessage = response.data.message;
      setMessages(prev => [...prev, sentMessage]);
      setNewMessage('');

      // Socket emission is handled by backend, no need to emit again

    } catch (err) {
      console.error('Error sending message:', err);
      toast.error('Failed to send message');
    }
  };

  // Handle Enter key
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

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
          <div className="card text-center py-8">
            <div className="text-red-600 mb-4">{error}</div>
            <button
              onClick={() => navigate(-1)}
              className="btn-primary"
            >
              Go Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="section-container">
        <div className="card h-[600px] flex flex-col">
          {/* Chat Header */}
          <div className="border-b border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">
                  Chat with {otherUser?.name || 'User'}
                </h2>
                <p className="text-sm text-gray-600">
                  Task: {currentTask?.title}
                </p>
                <p className="text-xs text-gray-500">
                  {currentTask?.status ? `Status: ${currentTask.status}` : ''}
                </p>
              </div>
              <button
                onClick={() => navigate(-1)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.length === 0 ? (
              <div className="text-center text-gray-500 py-8">
                <p>No messages yet. Start the conversation!</p>
              </div>
            ) : (
              messages.map((message) => (
                <div
                  key={message._id}
                  className={`flex ${(message.sender?._id || message.sender) === user._id ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                      (message.sender?._id || message.sender) === user._id
                        ? 'bg-primary-500 text-white'
                        : 'bg-gray-100 text-gray-900'
                    }`}
                  >
                    <p className="text-sm">{message.content}</p>
                    <p className={`text-xs mt-1 ${
                      (message.sender?._id || message.sender) === user._id ? 'text-primary-100' : 'text-gray-500'
                    }`}>
                      {new Date(message.createdAt || message.timestamp).toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              ))
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Message Input */}
          <div className="border-t border-gray-200 p-4">
            <div className="flex space-x-2">
              <textarea
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type your message..."
                className="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:ring-primary-500 focus:border-primary-500 resize-none"
                rows="2"
              />
              <button
                onClick={handleSendMessage}
                disabled={!newMessage.trim()}
                className="btn-primary px-6 py-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Send
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Chat;
