import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import Chat from '../models/Chat.js';

const connectedUsers = new Map();

export const setupSocketHandlers = (io) => {
  // Authentication middleware for socket connections
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token || socket.handshake.headers.authorization?.split(' ')[1];
      
      if (!token) {
        return next(new Error('Authentication error: No token provided'));
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.userId).select('-password');
      
      if (!user || !user.isActive) {
        return next(new Error('Authentication error: Invalid user'));
      }

      socket.userId = user._id.toString();
      socket.user = user;
      next();
    } catch (error) {
      console.error('Socket authentication error:', error);
      next(new Error('Authentication error'));
    }
  });

  io.on('connection', (socket) => {
    console.log(`User ${socket.user.name} connected with socket ID: ${socket.id}`);
    
    // Store user connection
    connectedUsers.set(socket.userId, {
      socketId: socket.id,
      user: socket.user,
      lastSeen: new Date()
    });

    // Broadcast online users to all connected clients
    broadcastOnlineUsers();

    // Join user to their personal room
    socket.join(`user_${socket.userId}`);

    // Handle joining chat rooms
    socket.on('joinChat', async (chatId) => {
      try {
        const chat = await Chat.findById(chatId);
        
        if (chat && chat.participants.includes(socket.userId)) {
          socket.join(`chat_${chatId}`);
          console.log(`User ${socket.user.name} joined chat ${chatId}`);
          
          // Mark messages as read when joining chat
          await chat.markAsRead(socket.userId);
        }
      } catch (error) {
        console.error('Error joining chat:', error);
        socket.emit('error', { message: 'Failed to join chat' });
      }
    });

    // Handle leaving chat rooms
    socket.on('leaveChat', (chatId) => {
      socket.leave(`chat_${chatId}`);
      console.log(`User ${socket.user.name} left chat ${chatId}`);
    });

    // Handle sending messages
    socket.on('sendMessage', async (data) => {
      try {
        const { chatId, message } = data;
        
        const chat = await Chat.findById(chatId);
        
        if (!chat || !chat.participants.includes(socket.userId)) {
          socket.emit('error', { message: 'Unauthorized or chat not found' });
          return;
        }

        const messageData = {
          content: message.content,
          sender: socket.userId,
          messageType: message.messageType || 'text',
          readBy: [{ user: socket.userId, readAt: new Date() }]
        };

        await chat.addMessage(messageData);

        // Get the newly added message with populated sender
        const updatedChat = await Chat.findById(chatId)
          .populate('messages.sender', 'name avatar');
        
        const newMessage = updatedChat.messages[updatedChat.messages.length - 1];

        // Emit message to all users in the chat
        io.to(`chat_${chatId}`).emit('message', {
          chatId,
          message: newMessage
        });

        // Send push notification to offline users (if implemented)
        const offlineParticipants = chat.participants.filter(participantId => 
          participantId.toString() !== socket.userId && 
          !connectedUsers.has(participantId.toString())
        );

        if (offlineParticipants.length > 0) {
          // Here you would implement push notifications
          console.log(`Send push notification to ${offlineParticipants.length} offline users`);
        }

      } catch (error) {
        console.error('Error sending message:', error);
        socket.emit('error', { message: 'Failed to send message' });
      }
    });

    // Handle typing indicators
    socket.on('typing', (data) => {
      const { chatId, isTyping } = data;
      socket.to(`chat_${chatId}`).emit('userTyping', {
        userId: socket.userId,
        userName: socket.user.name,
        isTyping
      });
    });

    // Handle connection status
    socket.on('updateStatus', (status) => {
      if (connectedUsers.has(socket.userId)) {
        connectedUsers.get(socket.userId).status = status;
        broadcastOnlineUsers();
      }
    });

    // Handle disconnection
    socket.on('disconnect', (reason) => {
      console.log(`User ${socket.user.name} disconnected: ${reason}`);
      
      // Remove user from connected users
      connectedUsers.delete(socket.userId);
      
      // Broadcast updated online users list
      broadcastOnlineUsers();
      
      // Update user's last seen
      User.findByIdAndUpdate(socket.userId, { 
        lastLoginAt: new Date() 
      }).catch(err => console.error('Error updating last seen:', err));
    });

    // Handle errors
    socket.on('error', (error) => {
      console.error('Socket error:', error);
    });
  });

  // Broadcast online users to all connected clients
  function broadcastOnlineUsers() {
    const onlineUsers = Array.from(connectedUsers.values()).map(conn => ({
      userId: conn.user._id,
      name: conn.user.name,
      avatar: conn.user.avatar,
      status: conn.status || 'online',
      lastSeen: conn.lastSeen
    }));

    io.emit('onlineUsers', onlineUsers);
  }

  // Cleanup disconnected users periodically
  setInterval(() => {
    const now = new Date();
    const fiveMinutesAgo = new Date(now.getTime() - 5 * 60 * 1000);

    for (const [userId, userData] of connectedUsers.entries()) {
      if (userData.lastSeen < fiveMinutesAgo) {
        connectedUsers.delete(userId);
      }
    }
  }, 60 * 1000); // Check every minute

  console.log('Socket.IO handlers set up successfully');
};

// Export connected users for use in routes if needed
export const getConnectedUsers = () => connectedUsers;