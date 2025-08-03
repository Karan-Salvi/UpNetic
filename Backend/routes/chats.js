import express from 'express';
import { asyncHandler } from '../middleware/errorHandler.js';
import Chat from '../models/Chat.js';
import User from '../models/User.js';

const router = express.Router();

// @route   GET /api/chats
// @desc    Get user's chats
// @access  Private
router.get('/', asyncHandler(async (req, res) => {
  const userId = req.user._id;

  const chats = await Chat.getUserChats(userId);

  // Calculate unread count for each chat
  const chatsWithUnread = chats.map(chat => {
    const unreadCount = chat.messages.filter(message => 
      message.sender.toString() !== userId.toString() &&
      !message.readBy.some(read => read.user.toString() === userId.toString())
    ).length;

    return {
      ...chat.toObject(),
      unreadCount
    };
  });

  res.json({
    success: true,
    chats: chatsWithUnread
  });
}));

// @route   GET /api/chats/:chatId
// @desc    Get specific chat
// @access  Private
router.get('/:chatId', asyncHandler(async (req, res) => {
  const { chatId } = req.params;
  const userId = req.user._id;

  const chat = await Chat.findById(chatId)
    .populate('participants', 'name avatar headline')
    .populate('messages.sender', 'name avatar');

  if (!chat) {
    return res.status(404).json({
      success: false,
      message: 'Chat not found'
    });
  }

  // Check if user is a participant
  if (!chat.participants.some(p => p._id.toString() === userId.toString())) {
    return res.status(403).json({
      success: false,
      message: 'You are not a participant in this chat'
    });
  }

  res.json({
    success: true,
    chat
  });
}));

// @route   GET /api/chats/:chatId/messages
// @desc    Get chat messages
// @access  Private
router.get('/:chatId/messages', asyncHandler(async (req, res) => {
  const { chatId } = req.params;
  const { page = 1, limit = 50 } = req.query;
  const userId = req.user._id;

  const chat = await Chat.findById(chatId);

  if (!chat) {
    return res.status(404).json({
      success: false,
      message: 'Chat not found'
    });
  }

  // Check if user is a participant
  if (!chat.participants.some(p => p._id.toString() === userId.toString())) {
    return res.status(403).json({
      success: false,
      message: 'You are not a participant in this chat'
    });
  }

  // Get messages with pagination (latest first, then reverse)
  const skip = (page - 1) * limit;
  const messages = chat.messages
    .sort((a, b) => b.createdAt - a.createdAt)
    .slice(skip, skip + parseInt(limit))
    .reverse();

  const total = chat.messages.length;

  res.json({
    success: true,
    messages,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      pages: Math.ceil(total / limit)
    }
  });
}));

// @route   POST /api/chats
// @desc    Create or get direct chat
// @access  Private
router.post('/', asyncHandler(async (req, res) => {
  const { participantId } = req.body;
  const userId = req.user._id;

  if (!participantId) {
    return res.status(400).json({
      success: false,
      message: 'Participant ID is required'
    });
  }

  if (participantId === userId.toString()) {
    return res.status(400).json({
      success: false,
      message: 'Cannot create chat with yourself'
    });
  }

  // Check if participant exists
  const participant = await User.findById(participantId);
  if (!participant) {
    return res.status(404).json({
      success: false,
      message: 'User not found'
    });
  }

  // Find or create direct chat
  const chat = await Chat.findOrCreateDirectChat(userId, participantId);

  res.json({
    success: true,
    message: 'Chat retrieved successfully',
    chat
  });
}));

// @route   POST /api/chats/:chatId/messages
// @desc    Send message to chat
// @access  Private
router.post('/:chatId/messages', asyncHandler(async (req, res) => {
  const { chatId } = req.params;
  const { content, messageType = 'text' } = req.body;
  const userId = req.user._id;

  if (!content || content.trim().length === 0) {
    return res.status(400).json({
      success: false,
      message: 'Message content is required'
    });
  }

  const chat = await Chat.findById(chatId);

  if (!chat) {
    return res.status(404).json({
      success: false,
      message: 'Chat not found'
    });
  }

  // Check if user is a participant
  if (!chat.participants.some(p => p._id.toString() === userId.toString())) {
    return res.status(403).json({
      success: false,
      message: 'You are not a participant in this chat'
    });
  }

  const message = {
    content: content.trim(),
    sender: userId,
    messageType,
    readBy: [{ user: userId, readAt: new Date() }] // Mark as read by sender
  };

  await chat.addMessage(message);

  const updatedChat = await Chat.findById(chatId)
    .populate('participants', 'name avatar headline')
    .populate('messages.sender', 'name avatar');

  res.status(201).json({
    success: true,
    message: 'Message sent successfully',
    chat: updatedChat,
    newMessage: updatedChat.messages[updatedChat.messages.length - 1]
  });
}));

// @route   PUT /api/chats/:chatId/messages/:messageId
// @desc    Edit message
// @access  Private
router.put('/:chatId/messages/:messageId', asyncHandler(async (req, res) => {
  const { chatId, messageId } = req.params;
  const { content } = req.body;
  const userId = req.user._id;

  if (!content || content.trim().length === 0) {
    return res.status(400).json({
      success: false,
      message: 'Message content is required'
    });
  }

  const chat = await Chat.findById(chatId);

  if (!chat) {
    return res.status(404).json({
      success: false,
      message: 'Chat not found'
    });
  }

  const message = chat.messages.id(messageId);

  if (!message) {
    return res.status(404).json({
      success: false,
      message: 'Message not found'
    });
  }

  // Check if user is the sender
  if (message.sender.toString() !== userId.toString()) {
    return res.status(403).json({
      success: false,
      message: 'You can only edit your own messages'
    });
  }

  // Check if message is not too old (optional: 15 minutes limit)
  const fifteenMinutesAgo = new Date(Date.now() - 15 * 60 * 1000);
  if (message.createdAt < fifteenMinutesAgo) {
    return res.status(400).json({
      success: false,
      message: 'Cannot edit messages older than 15 minutes'
    });
  }

  message.content = content.trim();
  message.isEdited = true;
  message.editedAt = new Date();

  await chat.save();

  res.json({
    success: true,
    message: 'Message updated successfully',
    updatedMessage: message
  });
}));

// @route   DELETE /api/chats/:chatId/messages/:messageId
// @desc    Delete message
// @access  Private
router.delete('/:chatId/messages/:messageId', asyncHandler(async (req, res) => {
  const { chatId, messageId } = req.params;
  const userId = req.user._id;

  const chat = await Chat.findById(chatId);

  if (!chat) {
    return res.status(404).json({
      success: false,
      message: 'Chat not found'
    });
  }

  const message = chat.messages.id(messageId);

  if (!message) {
    return res.status(404).json({
      success: false,
      message: 'Message not found'
    });
  }

  // Check if user is the sender
  if (message.sender.toString() !== userId.toString()) {
    return res.status(403).json({
      success: false,
      message: 'You can only delete your own messages'
    });
  }

  message.isDeleted = true;
  message.deletedAt = new Date();
  message.content = 'This message was deleted';

  await chat.save();

  res.json({
    success: true,
    message: 'Message deleted successfully'
  });
}));

// @route   PUT /api/chats/:chatId/read
// @desc    Mark messages as read
// @access  Private
router.put('/:chatId/read', asyncHandler(async (req, res) => {
  const { chatId } = req.params;
  const { messageIds = [] } = req.body;
  const userId = req.user._id;

  const chat = await Chat.findById(chatId);

  if (!chat) {
    return res.status(404).json({
      success: false,
      message: 'Chat not found'
    });
  }

  // Check if user is a participant
  if (!chat.participants.some(p => p._id.toString() === userId.toString())) {
    return res.status(403).json({
      success: false,
      message: 'You are not a participant in this chat'
    });
  }

  await chat.markAsRead(userId, messageIds);

  res.json({
    success: true,
    message: 'Messages marked as read'
  });
}));

export default router;