import io from "socket.io-client";
import store from "../store";
import { addMessage, setOnlineUsers } from "../store/slices/chatSlice";

const baseURI = import.meta.env.VITE_API_URL;

class SocketService {
  constructor() {
    this.socket = null;
  }

  connect(userId) {
    this.socket = io(baseURI, {
      auth: {
        // userId,
        token: localStorage.getItem("token"),
      },
    });

    this.socket.on("connect", () => {
      console.log("Connected to server");
    });

    this.socket.on("message", (data) => {
      const state = store.getState();
      const currentUserId = state.auth.user?._id;

      // Skip if this message was sent by the current user
      if (data.message?.sender?._id === currentUserId) return;

      store.dispatch(addMessage(data));
    });

    this.socket.on("onlineUsers", (users) => {
      store.dispatch(setOnlineUsers(users));
    });

    this.socket.on("disconnect", () => {
      console.log("Disconnected from server");
    });
  }

  sendMessage(chatId, message) {
    if (this.socket) {
      this.socket.emit("sendMessage", { chatId, message });
    }
  }

  joinChat(chatId) {
    if (this.socket) {
      this.socket.emit("joinChat", chatId);
    }
  }

  leaveChat(chatId) {
    if (this.socket) {
      this.socket.emit("leaveChat", chatId);
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
