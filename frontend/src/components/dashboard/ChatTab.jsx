import React, { useState, useEffect, useRef } from "react";
import { useAuth } from "../../context/AuthContext";
import { useSocket } from "../../context/SocketContext";
import chatService from "../../services/chatService";

const ChatTab = () => {
  const { user } = useAuth();
  const { socket } = useSocket();

  const [conversations, setConversations] = useState([]);
  const [activeChat, setActiveChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  
  const activeChatTaskIdRef = useRef(null);

  useEffect(() => {
    activeChatTaskIdRef.current = activeChat?.task?._id || null;
  }, [activeChat]);

  const formatMessageTime = (dateValue) => {
    if (!dateValue) return '';
    
    const date = new Date(dateValue);
    if (isNaN(date.getTime())) return '';
    
    const now = new Date();
    const diffInMinutes = Math.floor((now - date) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    
    return date.toLocaleDateString();
  };

  // Fixed function to properly identify message ownership
  const isOwnMessage = (msg) => {
    if (!user || !msg) {
      return false;
    }
    
    // Get current user ID
    const currentUserId = user._id || user.id;
    if (!currentUserId) {
      console.warn('No current user ID found');
      return false;
    }
    
    // Extract sender ID - backend populates sender as object with _id
    let messageSenderId = null;
    
    if (msg.sender && typeof msg.sender === 'object' && msg.sender._id) {
      messageSenderId = msg.sender._id;
    } else if (typeof msg.sender === 'string') {
      messageSenderId = msg.sender;
    } else if (msg.senderId) {
      messageSenderId = msg.senderId;
    }
    
    if (!messageSenderId) {
      console.warn('No sender ID found in message:', msg);
      return false;
    }
    
    const isOwn = String(currentUserId) === String(messageSenderId);
    
    // Debug output (only for first few messages to avoid spam)
    if (Math.random() < 0.1) { // Only log 10% of the time to reduce spam
      console.log(`[ChatTab] Message ownership:`, {
        content: msg.content?.substring(0, 30) + '...',
        currentUserId: String(currentUserId),
        messageSenderId: String(messageSenderId),
        isOwn,
        alignment: isOwn ? 'RIGHT' : 'LEFT'
      });
    }
    
    return isOwn;
  };

  // Fetch conversations
  useEffect(() => {
    const fetchChats = async () => {
      try {
        const res = await chatService.getConversations();
        const chats = Array.isArray(res?.chats) ? res.chats : [];
        setConversations(chats);
      } catch (err) {
        console.error("Failed to fetch chats:", err);
      }
    };
    fetchChats();
  }, []);

  // Socket event handlers
  useEffect(() => {
    if (!socket || !user) return;

    const handleReceiveMessage = (payload) => {
      console.log('[ChatTab] Received message payload:', payload);
      
      // Check if message is from another user
      const messageSender = payload.message?.sender?._id || payload.message?.sender || payload.message?.senderId;
      const currentUserId = user?._id || user?.id;
      const messageFromOther = String(messageSender) !== String(currentUserId);
      
      if (messageFromOther) {
        const currentActiveTaskId = activeChatTaskIdRef.current;
        if (currentActiveTaskId && payload.taskId === currentActiveTaskId) {
          setMessages((prevMessages) => [...prevMessages, payload.message]);
        }

        setConversations((prev) => {
          const updated = prev.map((c) =>
            c._id === payload.chatId ? { ...c, lastMessage: payload.message } : c
          );
          updated.sort((a, b) => new Date(b.updatedAt || 0) - new Date(a.updatedAt || 0));
          return updated;
        });
      }
    };

    socket.on("receive_message", handleReceiveMessage);
    return () => socket.off("receive_message", handleReceiveMessage);
  }, [socket, user]);

  const openChat = async (chat) => {
    try {
      const res = await chatService.getMessages(chat.task?._id);
      const msgs = Array.isArray(res?.messages) ? res.messages : [];
      setMessages(msgs);
      setActiveChat(chat);
      activeChatTaskIdRef.current = chat.task?._id;
    } catch (err) {
      console.error("Failed to open chat:", err);
    }
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !activeChat?.task?._id) return;

    const tempMessage = newMessage.trim();
    setNewMessage("");

    try {
      const response = await chatService.sendMessage({ 
        taskId: activeChat.task._id, 
        content: tempMessage 
      });
      
      if (response?.message) {
        console.log('[ChatTab] Adding sent message to state:', response.message);
        console.log('[ChatTab] Sent message sender field:', response.message.sender);
        setMessages((prev) => [...prev, response.message]);
      } else {
        setNewMessage(tempMessage);
      }
    } catch (err) {
      console.error("Failed to send message:", err);
      setNewMessage(tempMessage);
      alert('Failed to send message. Please try again.');
    }
  };

  return (
    <div className="flex h-full">
      {/* Conversations list */}
      <div className="w-1/3 border-r overflow-y-auto">
        <h2 className="p-2 font-semibold">Chats</h2>
        {conversations.length === 0 && <p className="text-gray-500 p-2">No chats yet</p>}
        {conversations.map((chat) => (
          <div
            key={chat._id}
            className={`p-2 cursor-pointer hover:bg-gray-100 ${
              activeChat?._id === chat._id ? "bg-gray-200" : ""
            }`}
            onClick={() => openChat(chat)}
          >
            <p className="font-medium">
              {Array.isArray(chat.participants)
                ? chat.participants
                    .filter((p) => p._id !== user?._id)
                    .map((p) => p.name)
                    .join(", ")
                : "Unknown"}
            </p>
            {chat.lastMessage && (
              <p className="text-sm text-gray-500 truncate">{chat.lastMessage.content}</p>
            )}
            <p className="text-xs text-gray-400 truncate">{chat.task?.title}</p>
          </div>
        ))}
      </div>

      {/* Chat window */}
      <div className="flex-1 flex flex-col">
        {activeChat ? (
          <>
            {/* Header */}
            <div className="p-3 border-b bg-gray-50">
              <h3 className="font-semibold">
                {Array.isArray(activeChat.participants)
                  ? activeChat.participants
                      .filter((p) => p._id !== user?._id)
                      .map((p) => p.name)
                      .join(", ")
                  : "Unknown"}
              </h3>
              <p className="text-sm text-gray-600">Task: {activeChat.task?.title}</p>
              <p className="text-xs text-gray-500">Status: {activeChat.task?.status}</p>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              
              {messages.length === 0 && (
                <p className="text-gray-500 text-center">No messages yet. Start the conversation!</p>
              )}
              {messages.map((msg, index) => {
                if (!msg || typeof msg !== 'object') return null;
                
                const isOwn = isOwnMessage(msg);
                
                
                let messageContent = '';
                if (typeof msg.content === 'string') {
                  messageContent = msg.content;
                } else if (typeof msg.message === 'string') {
                  messageContent = msg.message;
                } else if (typeof msg.text === 'string') {
                  messageContent = msg.text;
                } else {
                  messageContent = 'Invalid message content';
                }
                
                return (
                  <div
                    key={msg._id || msg.timestamp || index}
                    className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`max-w-xs lg:max-w-md px-3 py-2 rounded-lg ${
                      isOwn 
                        ? 'bg-blue-500 text-white rounded-br-none' 
                        : 'bg-gray-200 text-gray-800 rounded-bl-none'
                    }`}>
                      <p className="text-sm">{messageContent}</p>
                      <p className={`text-xs mt-1 ${
                        isOwn ? 'text-blue-100' : 'text-gray-500'
                      }`}>
                        {formatMessageTime(msg.createdAt || msg.timestamp || msg.sentAt)}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Message input */}
            <form onSubmit={sendMessage} className="p-3 border-t bg-white">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  className="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:border-blue-500"
                  placeholder="Type your message..."
                />
                <button 
                  type="submit" 
                  disabled={!newMessage.trim()}
                  className="bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg transition-colors"
                >
                  Send
                </button>
              </div>
            </form>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-500">
            <div className="text-center">
              <p className="text-lg mb-2">💬</p>
              <p>Select a chat to start messaging</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatTab;