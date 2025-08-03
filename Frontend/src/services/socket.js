import io from 'socket.io-client';
import store from '../store';
import { addMessage, setOnlineUsers } from '../store/slices/chatSlice';

class SocketService {
  constructor() {
    this.socket = null;
  }

  connect(userId) {
    this.socket = io('http://localhost:5000', {
      auth: {
        userId,
      },
    });

    this.socket.on('connect', () => {
      console.log('Connected to server');
    });

    this.socket.on('message', (data) => {
      store.dispatch(addMessage(data));
    });

    this.socket.on('onlineUsers', (users) => {
      store.dispatch(setOnlineUsers(users));
    });

    this.socket.on('disconnect', () => {
      console.log('Disconnected from server');
    });
  }

  sendMessage(chatId, message) {
    if (this.socket) {
      this.socket.emit('sendMessage', { chatId, message });
    }
  }

  joinChat(chatId) {
    if (this.socket) {
      this.socket.emit('joinChat', chatId);
    }
  }

  leaveChat(chatId) {
    if (this.socket) {
      this.socket.emit('leaveChat', chatId);
    }
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }
}

export default new SocketService();