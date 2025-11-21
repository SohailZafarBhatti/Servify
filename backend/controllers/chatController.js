// backend/controllers/chatController.js
const asyncHandler = require("express-async-handler");
const Chat = require("../models/Chat");
const Message = require("../models/Message");
const Task = require("../models/Task");
const mongoose = require("mongoose");

// GET /api/chat/ - Get user's chat conversations
exports.getChats = asyncHandler(async (req, res) => {
  console.log('=== GET CHATS ===');
  console.log('User ID:', req.user._id);
  
  try {
    const chats = await Chat.find({ 
      participants: req.user._id,
      isActive: true 
    })
      .populate("participants", "name email avatar")
      .populate("task", "title status")
      .sort({ updatedAt: -1 });
    
    // Get last message for each chat
    const chatsWithLastMessage = await Promise.all(
      chats.map(async (chat) => {
        const lastMessage = await Message.findOne({ chat: chat._id })
          .populate("sender", "name email avatar")
          .sort({ createdAt: -1 });
        
        const messageCount = await Message.countDocuments({ chat: chat._id });
        
        return {
          ...chat.toObject(),
          lastMessage,
          messageCount
        };
      })
    );
    
    console.log(`Found ${chatsWithLastMessage.length} chats for user`);
    
    res.json({ success: true, chats: chatsWithLastMessage });
    
  } catch (error) {
    console.error('Error in getChats:', error);
    res.status(500);
    throw new Error(`Failed to get chats: ${error.message}`);
  }
});

// Helper function to determine chat participants
const determineParticipants = (task, currentUserId) => {
  console.log('=== DETERMINE PARTICIPANTS ===');
  console.log('Task ID:', task._id);
  console.log('Task title:', task.title);
  console.log('Task created by (raw):', task.createdBy);
  console.log('Task created by type:', typeof task.createdBy);
  console.log('Task assigned to (raw):', task.assignedTo);
  console.log('Task assigned to type:', typeof task.assignedTo);
  console.log('Current user (raw):', currentUserId);
  console.log('Current user type:', typeof currentUserId);
  
  const participants = new Set();
  
  // Always include task creator
  if (task.createdBy) {
    const creatorId = task.createdBy._id || task.createdBy;
    participants.add(creatorId.toString());
    console.log('Added task creator:', creatorId.toString());
  }
  
  // Include assigned service provider if exists
  if (task.assignedTo) {
    const assignedId = task.assignedTo._id || task.assignedTo;
    participants.add(assignedId.toString());
    console.log('Added assigned user:', assignedId.toString());
  }
  
  // Always include current user
  participants.add(currentUserId.toString());
  console.log('Added current user:', currentUserId.toString());
  
  const result = Array.from(participants);
  console.log('Final participants:', result, 'Count:', result.length);
  
  // Ensure we don't exceed 2 participants
  if (result.length > 2) {
    console.warn('More than 2 participants, keeping task creator and current user');
    const filteredResult = [task.createdBy.toString()];
    if (currentUserId.toString() !== task.createdBy.toString()) {
      filteredResult.push(currentUserId.toString());
    } else if (task.assignedTo && task.assignedTo.toString() !== task.createdBy.toString()) {
      filteredResult.push(task.assignedTo.toString());
    }
    return filteredResult;
  }
  
  return result;
};

// GET /api/chat/:taskId/messages - Get or create chat for a specific task
exports.getMessages = asyncHandler(async (req, res) => {
  const { taskId } = req.params;
  
  console.log('=== GET MESSAGES ===');
  console.log('Task ID:', taskId);
  console.log('User ID:', req.user._id);
  
  // Validate taskId
  if (!mongoose.isValidObjectId(taskId)) {
    res.status(400);
    throw new Error("Invalid task ID format");
  }
  
  try {
    // Find existing chat where user is a participant
    let chat = await Chat.findOne({ 
      task: taskId,
      participants: req.user._id 
    }).populate("participants", "name email avatar");

    if (!chat) {
      console.log('No existing chat found, creating new one...');
      
      // Get task details with populated user references
      const task = await Task.findById(taskId)
        .populate('createdBy', '_id name email')
        .populate('assignedTo', '_id name email');
      if (!task) {
        res.status(404);
        throw new Error("Task not found");
      }
      
      console.log('Task details:', {
        id: task._id,
        title: task.title,
        createdBy: task.createdBy,
        assignedTo: task.assignedTo,
        status: task.status
      });

      // Determine participants
      const participants = determineParticipants(task, req.user._id);
      
      // Validate participants
      if (participants.length === 0) {
        res.status(400);
        throw new Error("Cannot create chat without participants");
      }
      
      // Create new chat
      chat = new Chat({
        task: taskId,
        participants: participants,
        isActive: true
      });
      
      await chat.save();
      console.log('New chat created:', chat._id);
      
      // Populate participants after creation
      await chat.populate("participants", "name email avatar");
    }

    console.log('Chat ready:', {
      chatId: chat._id,
      participantCount: chat.participants.length
    });

    // Get messages for this chat
    const messages = await Message.find({ chat: chat._id })
      .populate("sender", "name email avatar")
      .sort({ createdAt: 1 }); // Oldest first for chronological order
    
    console.log(`Retrieved ${messages.length} messages for chat ${chat._id}`);

    res.json({ 
      success: true, 
      chatId: chat._id,
      messages: messages,
      participants: chat.participants,
      task: chat.task
    });
    
  } catch (error) {
    console.error('Error in getMessages:', error);
    
    const statusCode = error.name === 'ValidationError' ? 400 : 
                      error.message.includes('not found') ? 404 : 500;
    
    res.status(statusCode);
    throw new Error(`Failed to get messages: ${error.message}`);
  }
});

// POST /api/chat/:taskId/messages - Send message in task chat
exports.sendMessage = asyncHandler(async (req, res) => {
  const { taskId } = req.params;
  const { content } = req.body;

  console.log('=== SEND MESSAGE ===');
  console.log('Task ID:', taskId);
  console.log('User ID:', req.user._id);
  console.log('Content preview:', content?.substring(0, 50) + '...');

  // Input validation
  if (!taskId || !mongoose.isValidObjectId(taskId)) {
    res.status(400);
    throw new Error("Invalid task ID format");
  }

  if (!content || typeof content !== 'string' || !content.trim()) {
    res.status(400);
    throw new Error("Message content is required and cannot be empty");
  }

  const trimmedContent = content.trim();
  if (trimmedContent.length > 1000) {
    res.status(400);
    throw new Error("Message content cannot exceed 1000 characters");
  }

  try {
    // Find existing chat where user is a participant
    let chat = await Chat.findOne({ 
      task: taskId,
      participants: req.user._id 
    });

    console.log('Existing chat found:', !!chat);

    if (!chat) {
      console.log('No existing chat found, creating new one...');
      
      // Get task details with populated user references
      const task = await Task.findById(taskId)
        .populate('createdBy', '_id name email')
        .populate('assignedTo', '_id name email');
      if (!task) {
        res.status(404);
        throw new Error("Task not found");
      }

      // Determine participants
      const participants = determineParticipants(task, req.user._id);
      
      if (participants.length === 0) {
        res.status(400);
        throw new Error("Cannot create chat without participants");
      }
      
      // Create new chat
      chat = new Chat({
        task: taskId,
        participants: participants,
        isActive: true
      });
      
      await chat.save();
      console.log('New chat created:', chat._id);
    }

    // Security check - verify user is participant
    const isParticipant = chat.participants.some(p => 
      p.toString() === req.user._id.toString()
    );
    
    if (!isParticipant) {
      res.status(403);
      throw new Error("You are not authorized to send messages in this chat");
    }

    console.log('Creating message document...');
    
    // Create new message
    const message = new Message({
      chat: chat._id,
      sender: req.user._id,
      content: trimmedContent
    });
    
    await message.save();
    console.log('Message saved with ID:', message._id);
    
    // Update chat's timestamp
    chat.updatedAt = new Date();
    await chat.save();

    console.log('Database operations completed successfully');

    // Populate sender info
    await message.populate("sender", "name email avatar");

    // Emit real-time message via Socket.IO (non-blocking)
    setImmediate(async () => {
      try {
        const io = req.app.get("io");
        if (io && chat) {
          console.log('Emitting real-time message...');
          
          // Get updated chat with participants
          const chatWithParticipants = await Chat.findById(chat._id);
          
          console.log('[Backend] Chat participants:', chatWithParticipants.participants);
          console.log('[Backend] Chat participants count:', chatWithParticipants.participants.length);
          
          // Emit to all participants except sender
          chatWithParticipants.participants.forEach(participantId => {
            const participantIdStr = participantId.toString();
            const senderIdStr = req.user._id.toString();
            
            console.log('[Backend] Processing participant:', participantIdStr);
            console.log('[Backend] Sender ID:', senderIdStr);
            console.log('[Backend] Participant === Sender:', participantIdStr === senderIdStr);
            console.log('[Backend] Should emit to this participant:', participantIdStr !== senderIdStr);
            
            if (participantIdStr !== senderIdStr) {
              console.log('[Backend] ✓ EMITTING receive_message to participant:', participantIdStr);
              console.log('[Backend] Message content being sent:', message.content);
              console.log('[Backend] Full message being sent:', JSON.stringify(message, null, 2));
              
              const payload = {
                chatId: chat._id,
                taskId: taskId,
                message: message
              };
              
              console.log('[Backend] Complete payload:', JSON.stringify(payload, null, 2));
              
              io.to(participantIdStr).emit("receive_message", payload);
              console.log('[Backend] ✓ Message emitted to room:', participantIdStr);
            } else {
              console.log('[Backend] ✗ Skipping sender (would duplicate message)');
            }
          });
          
          console.log('Socket.IO emission completed');
        } else {
          console.warn('Socket.IO not available');
        }
      } catch (socketError) {
        console.error('Socket.IO emission error (non-blocking):', socketError);
        // Don't fail the request for socket errors
      }
    });

    console.log('Message sent successfully');

    res.status(201).json({ 
      success: true, 
      message: message,
      chatId: chat._id
    });

  } catch (error) {
    console.error('Error in sendMessage:', error);
    
    // Determine appropriate HTTP status code
    let statusCode = 500; // Default server error
    
    if (error.name === 'ValidationError' || 
        error.message.includes('required') || 
        error.message.includes('Invalid') ||
        error.message.includes('cannot exceed')) {
      statusCode = 400; // Bad request
    } else if (error.message.includes('not found')) {
      statusCode = 404; // Not found
    } else if (error.message.includes('not authorized')) {
      statusCode = 403; // Forbidden
    }
    
    res.status(statusCode);
    throw new Error(`Failed to send message: ${error.message}`);
  }
});

// GET /api/chat/task/:taskId - Get chat info for a specific task
exports.getTaskChat = asyncHandler(async (req, res) => {
  const { taskId } = req.params;
  
  console.log('=== GET TASK CHAT ===');
  console.log('Task ID:', taskId);
  console.log('User ID:', req.user._id);
  
  if (!mongoose.isValidObjectId(taskId)) {
    res.status(400);
    throw new Error("Invalid task ID format");
  }
  
  try {
    const chat = await Chat.findOne({ 
      task: taskId,
      participants: req.user._id 
    }).populate("participants", "name email avatar");

    if (!chat) {
      // This is not necessarily an error - chat might not exist yet
      console.log('No chat found for task:', taskId);
      res.json({ 
        success: true, 
        chat: null,
        message: "No chat found for this task"
      });
      return;
    }

    // Get message statistics
    const messageCount = await Message.countDocuments({ chat: chat._id });
    const lastMessage = await Message.findOne({ chat: chat._id })
      .populate("sender", "name email avatar")
      .sort({ createdAt: -1 });

    console.log(`Chat found with ${messageCount} messages`);

    res.json({ 
      success: true, 
      chat: {
        _id: chat._id,
        task: chat.task,
        participants: chat.participants,
        messageCount,
        lastMessage,
        isActive: chat.isActive,
        createdAt: chat.createdAt,
        updatedAt: chat.updatedAt
      }
    });
    
  } catch (error) {
    console.error('Error in getTaskChat:', error);
    res.status(500);
    throw new Error(`Failed to get task chat: ${error.message}`);
  }
});