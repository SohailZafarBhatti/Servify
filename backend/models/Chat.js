const mongoose = require("mongoose");

const chatSchema = new mongoose.Schema(
  {
    task: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Task",
      required: true
    },
    participants: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    }],
    isActive: {
      type: Boolean,
      default: true
    }
  },
  { timestamps: true }
);

// Add indexes for better performance
chatSchema.index({ task: 1, participants: 1 });
chatSchema.index({ participants: 1, updatedAt: -1 });
chatSchema.index({ task: 1 });

// Improved pre-save validation
chatSchema.pre('save', function(next) {
  console.log('=== CHAT PRE-SAVE VALIDATION ===');
  console.log('Chat ID:', this._id);
  console.log('Task ID:', this.task);
  console.log('Participants:', this.participants);
  console.log('Participants length:', this.participants.length);
  console.log('Is new document:', this.isNew);
  
  // Clean up participants array - remove duplicates and null values
  if (this.participants && Array.isArray(this.participants)) {
    // Remove null/undefined values and duplicates
    const cleanParticipants = this.participants
      .filter(p => p != null)
      .map(p => p.toString())
      .filter((p, index, arr) => arr.indexOf(p) === index);
    
    console.log('Cleaned participants:', cleanParticipants);
    this.participants = cleanParticipants;
  }
  
  // Validate participant count
  const participantCount = this.participants.length;
  
  if (participantCount === 0) {
    console.error('Chat validation failed: no participants');
    return next(new Error('Chat must have at least one participant'));
  }
  
  if (participantCount > 2) {
    console.error('Chat validation failed: too many participants', participantCount);
    return next(new Error('Chat cannot have more than 2 participants'));
  }
  
  // Allow 1 or 2 participants
  if (participantCount === 1) {
    console.warn('Chat has only 1 participant - this might be for unassigned tasks');
  }
  
  console.log('Chat validation passed with', participantCount, 'participant(s)');
  next();
});

// Instance method to check if user is participant
chatSchema.methods.isParticipant = function(userId) {
  return this.participants.some(p => p.toString() === userId.toString());
};

// Instance method to get the other participant (for 2-person chats)
chatSchema.methods.getOtherParticipant = function(userId) {
  return this.participants.find(p => p.toString() !== userId.toString());
};

// Static method to find or create chat
chatSchema.statics.findOrCreateChat = async function(taskId, participants) {
  console.log('=== FIND OR CREATE CHAT ===');
  console.log('Task ID:', taskId);
  console.log('Participants:', participants);
  
  // Clean participants array
  const cleanParticipants = participants
    .filter(p => p != null)
    .map(p => p.toString())
    .filter((p, index, arr) => arr.indexOf(p) === index);
  
  if (cleanParticipants.length === 0) {
    throw new Error('Cannot create chat without participants');
  }
  
  // Try to find existing chat with these participants and task
  let chat = await this.findOne({
    task: taskId,
    participants: { $all: cleanParticipants, $size: cleanParticipants.length }
  });
  
  if (chat) {
    console.log('Found existing chat:', chat._id);
    return chat;
  }
  
  // Try to find chat where current user is participant
  chat = await this.findOne({
    task: taskId,
    participants: { $in: cleanParticipants }
  });
  
  if (chat) {
    console.log('Found existing chat with overlapping participants:', chat._id);
    return chat;
  }
  
  // Create new chat if not found
  console.log('Creating new chat...');
  
  if (cleanParticipants.length > 2) {
    console.warn('More than 2 participants, limiting to first 2');
    cleanParticipants.splice(2);
  }
  
  chat = new this({
    task: taskId,
    participants: cleanParticipants,
    isActive: true
  });
  
  await chat.save();
  console.log('New chat created:', chat._id);
  
  return chat;
};

// Virtual to get message count (requires separate query)
chatSchema.virtual('messageCount', {
  ref: 'Message',
  localField: '_id',
  foreignField: 'chat',
  count: true
});

// Virtual to get latest message (requires separate query)
chatSchema.virtual('latestMessage', {
  ref: 'Message',
  localField: '_id',
  foreignField: 'chat',
  options: { sort: { createdAt: -1 }, limit: 1 }
});

// Middleware to cascade delete messages when chat is deleted
chatSchema.pre('deleteOne', { document: true, query: false }, async function(next) {
  try {
    // Delete all messages for this chat
    const Message = mongoose.model('Message');
    await Message.deleteMany({ chat: this._id });
    console.log('Deleted messages for chat:', this._id);
    next();
  } catch (error) {
    next(error);
  }
});

// Middleware for findOneAndDelete
chatSchema.pre('findOneAndDelete', async function(next) {
  try {
    const chat = await this.model.findOne(this.getQuery());
    if (chat) {
      const Message = mongoose.model('Message');
      await Message.deleteMany({ chat: chat._id });
      console.log('Deleted messages for chat:', chat._id);
    }
    next();
  } catch (error) {
    next(error);
  }
});

module.exports = mongoose.model("Chat", chatSchema);