import mongoose from 'mongoose';

const connectionSchema = new mongoose.Schema({
  requester: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  recipient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'rejected', 'blocked'],
    default: 'pending'
  },
  message: {
    type: String,
    maxlength: [300, 'Connection message cannot be more than 300 characters'],
    default: ''
  },
  acceptedAt: {
    type: Date,
    default: null
  },
  rejectedAt: {
    type: Date,
    default: null
  }
}, {
  timestamps: true
});

// Index for better query performance
connectionSchema.index({ requester: 1, recipient: 1 }, { unique: true });
connectionSchema.index({ recipient: 1, status: 1 });
connectionSchema.index({ requester: 1, status: 1 });

// Static method to check if connection exists
connectionSchema.statics.checkConnection = async function(userId1, userId2) {
  const connection = await this.findOne({
    $or: [
      { requester: userId1, recipient: userId2 },
      { requester: userId2, recipient: userId1 }
    ]
  });
  
  return connection;
};

// Static method to get mutual connections
connectionSchema.statics.getMutualConnections = async function(userId1, userId2) {
  const user1Connections = await this.find({
    $or: [
      { requester: userId1, status: 'accepted' },
      { recipient: userId1, status: 'accepted' }
    ]
  }).populate('requester recipient', 'name avatar');

  const user2Connections = await this.find({
    $or: [
      { requester: userId2, status: 'accepted' },
      { recipient: userId2, status: 'accepted' }
    ]
  }).populate('requester recipient', 'name avatar');

  // Find mutual connections
  const user1ConnectedUsers = user1Connections.map(conn => 
    conn.requester._id.toString() === userId1 ? conn.recipient._id.toString() : conn.requester._id.toString()
  );

  const user2ConnectedUsers = user2Connections.map(conn => 
    conn.requester._id.toString() === userId2 ? conn.recipient._id.toString() : conn.requester._id.toString()
  );

  const mutualUserIds = user1ConnectedUsers.filter(id => user2ConnectedUsers.includes(id));
  
  return mutualUserIds.length;
};

// Static method to get connection suggestions
connectionSchema.statics.getSuggestions = async function(userId, limit = 10) {
  // Get user's existing connections
  const existingConnections = await this.find({
    $or: [
      { requester: userId },
      { recipient: userId }
    ]
  });

  const connectedUserIds = existingConnections.map(conn => 
    conn.requester.toString() === userId ? conn.recipient : conn.requester
  );
  connectedUserIds.push(userId); // Exclude self

  // Find users not already connected
  const suggestions = await mongoose.model('User').find({
    _id: { $nin: connectedUserIds },
    isActive: true
  })
  .limit(limit)
  .select('name avatar headline location');

  return suggestions;
};

export default mongoose.model('Connection', connectionSchema);