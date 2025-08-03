import express from 'express';
import { asyncHandler } from '../middleware/errorHandler.js';
import Connection from '../models/Connection.js';
import User from '../models/User.js';

const router = express.Router();

// @route   GET /api/connections
// @desc    Get user's connections and requests
// @access  Private
router.get('/', asyncHandler(async (req, res) => {
  const userId = req.user._id;

  // Get accepted connections
  const connections = await Connection.find({
    $or: [
      { requester: userId, status: 'accepted' },
      { recipient: userId, status: 'accepted' }
    ]
  })
  .populate('requester', 'name avatar headline location')
  .populate('recipient', 'name avatar headline location');

  // Get pending requests (received)
  const pendingRequests = await Connection.find({
    recipient: userId,
    status: 'pending'
  })
  .populate('requester', 'name avatar headline location')
  .sort({ createdAt: -1 });

  // Get sent requests
  const sentRequests = await Connection.find({
    requester: userId,
    status: 'pending'
  })
  .populate('recipient', 'name avatar headline location')
  .sort({ createdAt: -1 });

  // Format connections to get the other user
  const formattedConnections = connections.map(conn => {
    const otherUser = conn.requester._id.toString() === userId.toString() 
      ? conn.recipient 
      : conn.requester;
    
    return {
      _id: conn._id,
      user: otherUser,
      connectedAt: conn.acceptedAt,
      mutualConnections: 0 // This could be calculated if needed
    };
  });

  // Format pending requests
  const formattedRequests = pendingRequests.map(req => ({
    _id: req._id,
    from: req.requester,
    message: req.message,
    createdAt: req.createdAt
  }));

  // Format sent requests
  const formattedSentRequests = sentRequests.map(req => ({
    _id: req._id,
    to: req.recipient,
    message: req.message,
    createdAt: req.createdAt
  }));

  res.json({
    success: true,
    connections: formattedConnections,
    pendingRequests: formattedRequests,
    sentRequests: formattedSentRequests,
    stats: {
      connectionsCount: formattedConnections.length,
      pendingCount: formattedRequests.length,
      sentCount: formattedSentRequests.length
    }
  });
}));

// @route   POST /api/connections/request
// @desc    Send connection request
// @access  Private
router.post('/request', asyncHandler(async (req, res) => {
  const { userId, message = '' } = req.body;
  const requesterId = req.user._id;

  if (!userId) {
    return res.status(400).json({
      success: false,
      message: 'User ID is required'
    });
  }

  if (userId === requesterId.toString()) {
    return res.status(400).json({
      success: false,
      message: 'You cannot send a connection request to yourself'
    });
  }

  // Check if recipient exists
  const recipient = await User.findById(userId);
  if (!recipient) {
    return res.status(404).json({
      success: false,
      message: 'User not found'
    });
  }

  // Check if connection already exists
  const existingConnection = await Connection.checkConnection(requesterId, userId);
  
  if (existingConnection) {
    let message = '';
    switch (existingConnection.status) {
      case 'accepted':
        message = 'You are already connected to this user';
        break;
      case 'pending':
        if (existingConnection.requester.toString() === requesterId.toString()) {
          message = 'Connection request already sent';
        } else {
          message = 'This user has already sent you a connection request';
        }
        break;
      case 'rejected':
        message = 'Connection request was previously rejected';
        break;
      case 'blocked':
        message = 'Unable to send connection request';
        break;
      default:
        message = 'Connection already exists';
    }
    
    return res.status(400).json({
      success: false,
      message
    });
  }

  // Create connection request
  const connectionRequest = await Connection.create({
    requester: requesterId,
    recipient: userId,
    message: message.trim(),
    status: 'pending'
  });

  const populatedRequest = await Connection.findById(connectionRequest._id)
    .populate('requester', 'name avatar headline')
    .populate('recipient', 'name avatar headline');

  res.status(201).json({
    success: true,
    message: 'Connection request sent successfully',
    request: populatedRequest
  });
}));

// @route   PUT /api/connections/:requestId
// @desc    Accept or reject connection request
// @access  Private
router.put('/:requestId', asyncHandler(async (req, res) => {
  const { requestId } = req.params;
  const { action } = req.body; // 'accept' or 'reject'
  const userId = req.user._id;

  if (!['accept', 'reject'].includes(action)) {
    return res.status(400).json({
      success: false,
      message: 'Action must be either "accept" or "reject"'
    });
  }

  const connectionRequest = await Connection.findById(requestId);

  if (!connectionRequest) {
    return res.status(404).json({
      success: false,
      message: 'Connection request not found'
    });
  }

  // Check if the current user is the recipient
  if (connectionRequest.recipient.toString() !== userId.toString()) {
    return res.status(403).json({
      success: false,
      message: 'You can only respond to requests sent to you'
    });
  }

  // Check if request is still pending
  if (connectionRequest.status !== 'pending') {
    return res.status(400).json({
      success: false,
      message: 'This request has already been processed'
    });
  }

  // Update connection status
  connectionRequest.status = action === 'accept' ? 'accepted' : 'rejected';
  
  if (action === 'accept') {
    connectionRequest.acceptedAt = new Date();
    
    // Add each user to the other's connections array
    await User.findByIdAndUpdate(
      connectionRequest.requester,
      { $addToSet: { connections: connectionRequest.recipient } }
    );
    
    await User.findByIdAndUpdate(
      connectionRequest.recipient,
      { $addToSet: { connections: connectionRequest.requester } }
    );
  } else {
    connectionRequest.rejectedAt = new Date();
  }

  await connectionRequest.save();

  const updatedRequest = await Connection.findById(requestId)
    .populate('requester', 'name avatar headline')
    .populate('recipient', 'name avatar headline');

  res.json({
    success: true,
    message: `Connection request ${action}ed successfully`,
    request: updatedRequest
  });
}));

// @route   DELETE /api/connections/:connectionId
// @desc    Remove connection
// @access  Private
router.delete('/:connectionId', asyncHandler(async (req, res) => {
  const { connectionId } = req.params;
  const userId = req.user._id;

  const connection = await Connection.findById(connectionId);

  if (!connection) {
    return res.status(404).json({
      success: false,
      message: 'Connection not found'
    });
  }

  // Check if user is part of this connection
  const isRequester = connection.requester.toString() === userId.toString();
  const isRecipient = connection.recipient.toString() === userId.toString();

  if (!isRequester && !isRecipient) {
    return res.status(403).json({
      success: false,
      message: 'You can only remove your own connections'
    });
  }

  const otherUserId = isRequester ? connection.recipient : connection.requester;

  // Remove connection
  await Connection.findByIdAndDelete(connectionId);

  // Remove from both users' connections arrays
  await User.findByIdAndUpdate(
    userId,
    { $pull: { connections: otherUserId } }
  );
  
  await User.findByIdAndUpdate(
    otherUserId,
    { $pull: { connections: userId } }
  );

  res.json({
    success: true,
    message: 'Connection removed successfully'
  });
}));

// @route   GET /api/connections/mutual/:userId
// @desc    Get mutual connections with another user  
// @access  Private
router.get('/mutual/:userId', asyncHandler(async (req, res) => {
  const { userId } = req.params;
  const currentUserId = req.user._id;

  if (userId === currentUserId.toString()) {
    return res.status(400).json({
      success: false,
      message: 'Cannot get mutual connections with yourself'
    });
  }

  const mutualCount = await Connection.getMutualConnections(currentUserId, userId);

  res.json({
    success: true,
    mutualCount
  });
}));

// @route   GET /api/connections/suggestions
// @desc    Get connection suggestions
// @access  Private
router.get('/suggestions', asyncHandler(async (req, res) => {
  const { limit = 5 } = req.query;
  const userId = req.user._id;

  const suggestions = await Connection.getSuggestions(userId, parseInt(limit));

  // For each suggestion, get mutual connection count
  const suggestionsWithMutuals = await Promise.all(
    suggestions.map(async (user) => {
      const mutualCount = await Connection.getMutualConnections(userId, user._id);
      return {
        ...user.toObject(),
        mutualConnections: mutualCount
      };
    })
  );

  res.json({
    success: true,
    suggestions: suggestionsWithMutuals
  });
}));

export default router;