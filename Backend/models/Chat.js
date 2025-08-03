import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
  {
    content: {
      type: String,
      required: [true, "Message content is required"],
      maxlength: [1000, "Message cannot be more than 1000 characters"],
    },
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    messageType: {
      type: String,
      enum: ["text", "image", "file", "voice"],
      default: "text",
    },
    attachment: {
      url: String,
      filename: String,
      size: Number,
      mimeType: String,
    },
    readBy: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        readAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    isEdited: {
      type: Boolean,
      default: false,
    },
    editedAt: {
      type: Date,
      default: null,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
    deletedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

const chatSchema = new mongoose.Schema(
  {
    participants: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },
    ],
    chatType: {
      type: String,
      enum: ["direct", "group"],
      default: "direct",
    },
    chatName: {
      type: String,
      maxlength: [50, "Chat name cannot be more than 50 characters"],
    },
    chatDescription: {
      type: String,
      maxlength: [200, "Chat description cannot be more than 200 characters"],
    },
    chatAvatar: {
      type: String,
      default: null,
    },
    messages: [messageSchema],
    lastMessage: {
      type: messageSchema,
      default: null,
    },
    lastActivity: {
      type: Date,
      default: Date.now,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    admins: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    settings: {
      allowNewMembers: {
        type: Boolean,
        default: true,
      },
      muteNotifications: [
        {
          user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
          },
          mutedUntil: Date,
        },
      ],
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Index for better query performance
chatSchema.index({ participants: 1 });
chatSchema.index({ lastActivity: -1 });
chatSchema.index({ "messages.sender": 1, "messages.createdAt": -1 });

// Virtual for unread message count per user
chatSchema.virtual("unreadCount").get(function () {
  // This would be calculated per user in the API
  return 0;
});

// Method to add message
chatSchema.methods.addMessage = function (messageData) {
  this.messages.push(messageData);
  this.lastMessage = messageData;
  this.lastActivity = new Date();
  return this.save();
};

// Method to mark messages as read
chatSchema.methods.markAsRead = function (userId, messageIds = []) {
  if (messageIds.length === 0) {
    // Mark all messages as read
    this.messages.forEach((message) => {
      if (!message.readBy.some((read) => read.user.toString() === userId)) {
        message.readBy.push({ user: userId, readAt: new Date() });
      }
    });
  } else {
    // Mark specific messages as read
    messageIds.forEach((messageId) => {
      const message = this.messages.id(messageId);
      if (
        message &&
        !message.readBy.some((read) => read.user.toString() === userId)
      ) {
        message.readBy.push({ user: userId, readAt: new Date() });
      }
    });
  }

  return this.save();
};

// Static method to find or create direct chat
chatSchema.statics.findOrCreateDirectChat = async function (userId1, userId2) {
  let chat = await this.findOne({
    chatType: "direct",
    participants: { $all: [userId1, userId2], $size: 2 },
  }).populate("participants", "name avatar");

  if (!chat) {
    chat = await this.create({
      participants: [userId1, userId2],
      chatType: "direct",
    });

    chat = await this.findById(chat._id).populate(
      "participants",
      "name avatar"
    );
  }

  return chat;
};

// Static method to get user's chats
chatSchema.statics.getUserChats = function (userId) {
  return this.find({
    participants: userId,
    isActive: true,
  })
    .populate("participants", "name avatar headline")
    .sort({ lastActivity: -1 });
};

export default mongoose.model("Chat", chatSchema);
