import { useState, useEffect, useRef } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useGetChatsQuery, useGetChatMessagesQuery } from "../store/api";
import { setActiveChat, addMessage } from "../store/slices/chatSlice";
import Header from "../components/Layout/Header";
import socketService from "../services/socket";
import { formatDistanceToNow } from "date-fns";
import {
  PaperAirplaneIcon,
  MagnifyingGlassIcon,
} from "@heroicons/react/24/outline";

const Chat = () => {
  const [messageText, setMessageText] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const messagesEndRef = useRef(null);

  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { activeChat, messages, onlineUsers } = useSelector(
    (state) => state.chat
  );

  console.log("activeChat is : ", activeChat);
  console.log("messages is : ", messages);
  console.log("onlineUsers is : ", onlineUsers);

  const { data: chatsData, isLoading: chatsLoading } = useGetChatsQuery();
  const { data: messagesData, isLoading: messagesLoading } =
    useGetChatMessagesQuery(activeChat?._id, {
      skip: !activeChat?._id, // Prevents undefined error
    });

  console.log("messagesData is : ", messagesData);

  useEffect(() => {
    if (user?._id) {
      socketService.connect(user._id);
    }

    return () => {
      socketService.disconnect();
    };
  }, [user?._id]);

  useEffect(() => {
    if (activeChat) {
      socketService.joinChat(activeChat._id);
    }
  }, [activeChat]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, activeChat]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleChatSelect = (chat) => {
    dispatch(setActiveChat(chat));
  };

  console.log("Handler send message is : ", activeChat?.lastMessage?.sender);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!messageText.trim() || !activeChat) return;

    const message = {
      content: messageText.trim(),
      sender: user._id,
      timestamp: new Date(),
    };

    // socketService.sendMessage(activeChat._id, message);
    // if (activeChat?.lastMessage?.sender !== user._id) {
    //   dispatch(addMessage({ chatId: activeChat._id, message }));
    // }

    socketService.sendMessage(activeChat._id, message);

    dispatch(addMessage({ chatId: activeChat._id, message }));

    setMessageText("");
  };

  const isUserOnline = (userId) => {
    return onlineUsers.includes(userId);
  };

  const getOtherUser = (chat) => {
    return chat.participants.find((p) => p._id !== user._id);
  };

  const filteredChats =
    chatsData?.chats?.filter((chat) => {
      const otherUser = getOtherUser(chat);
      return otherUser.name.toLowerCase().includes(searchQuery.toLowerCase());
    }) || [];

  console.log("filteredChats is : ", filteredChats);

  return (
    <div className="min-h-screen bg-linkedin-gray-light">
      <Header />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="card h-[calc(100vh-200px)] flex">
          {/* Chat List */}
          <div className="w-1/3 border-r border-gray-200 flex flex-col">
            {/* Search */}
            <div className="p-4 border-b border-gray-200">
              <div className="relative">
                <MagnifyingGlassIcon className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search conversations..."
                  className="w-full pl-10 pr-4 py-2 bg-gray-100 rounded-lg border-none outline-none focus:ring-2 focus:ring-linkedin-blue"
                />
              </div>
            </div>

            {/* Chats List */}
            <div className="flex-1 overflow-y-auto">
              {chatsLoading ? (
                <div className="flex justify-center items-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-linkedin-blue"></div>
                </div>
              ) : (
                <div className="space-y-1">
                  {filteredChats.map((chat) => {
                    const otherUser = getOtherUser(chat);
                    const isOnline = isUserOnline(otherUser._id);
                    const isActive = activeChat?._id === chat._id;

                    return (
                      <button
                        key={chat._id}
                        onClick={() => handleChatSelect(chat)}
                        className={`w-full p-4 text-left hover:bg-gray-50 transition-colors cursor-pointer ${
                          isActive
                            ? "bg-linkedin-blue bg-opacity-10 border-r-2 border-linkedin-blue"
                            : ""
                        }`}
                      >
                        <div className="flex items-center space-x-3">
                          <div className="relative">
                            <img
                              src={otherUser.avatar || "/images/profile.png"}
                              alt={otherUser.name}
                              className="w-12 h-12 rounded-full object-cover"
                            />
                            {isOnline && (
                              <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-gray-900 truncate">
                              {otherUser.name}
                            </p>
                            <p className="text-sm text-gray-600 truncate">
                              {chat.lastMessage?.content ||
                                "Start a conversation"}
                            </p>
                          </div>
                          {chat.lastMessage && (
                            <div className="text-xs text-gray-500">
                              {/* {message.timestamp
                                ? formatDistanceToNow(
                                    new Date(message.timestamp),
                                    { addSuffix: true }
                                  )
                                : "just now"} */}
                            </div>
                          )}
                        </div>
                      </button>
                    );
                  })}

                  {filteredChats.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      No conversations found
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Chat Messages */}
          <div className="flex-1 flex flex-col">
            {activeChat ? (
              <>
                {/* Chat Header */}
                <div className="p-4 border-b border-gray-200 bg-gray-50">
                  <div className="flex items-center space-x-3">
                    <div className="relative">
                      <img
                        src={
                          getOtherUser(activeChat).avatar ||
                          "/images/profile.png"
                        }
                        alt={getOtherUser(activeChat).name}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                      {isUserOnline(getOtherUser(activeChat)._id) && (
                        <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                      )}
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">
                        {getOtherUser(activeChat).name}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {isUserOnline(getOtherUser(activeChat)._id)
                          ? "Online"
                          : "Offline"}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {messagesLoading ? (
                    <div className="flex justify-center items-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-linkedin-blue"></div>
                    </div>
                  ) : (
                    <>
                      {(
                        messages[activeChat._id] ||
                        messagesData?.messages ||
                        []
                      ).map((message, index) => {
                        const isOwn = message.sender === user._id;
                        console.log("message is : ", message);
                        console.log("isOwn is : ", isOwn);
                        return (
                          <div
                            key={index}
                            className={`flex ${
                              isOwn ? "justify-end" : "justify-start"
                            }`}
                          >
                            <div
                              className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                                isOwn
                                  ? "bg-blue-500 text-white"
                                  : "bg-gray-200 text-gray-900"
                              }`}
                            >
                              <p className="text-sm">{message.content}</p>
                              <p
                                className={`text-xs mt-1 ${
                                  isOwn
                                    ? "text-blue-500-light"
                                    : "text-gray-500"
                                }`}
                              >
                                {message?.createdAt
                                  ? formatDistanceToNow(
                                      new Date(message?.createdAt),
                                      { addSuffix: true }
                                    )
                                  : "just now"}
                              </p>
                            </div>
                          </div>
                        );
                      })}
                      <div ref={messagesEndRef} />
                    </>
                  )}
                </div>

                {/* Message Input */}
                <form
                  onSubmit={handleSendMessage}
                  className="p-4 border-t border-gray-200"
                >
                  <div className="flex space-x-3">
                    <input
                      type="text"
                      value={messageText}
                      onChange={(e) => setMessageText(e.target.value)}
                      placeholder="Type a message..."
                      className="flex-1 px-4 py-2 bg-gray-100 rounded-full border-none outline-none focus:ring-2 focus:ring-linkedin-blue"
                    />
                    <button
                      type="submit"
                      disabled={!messageText.trim()}
                      className="bg-blue-500 hover:bg-linkedin-blue-dark text-white p-2 px-2.5 font-medium transition-all duration-200 transform hover:scale-105   rounded-full disabled:opacity-50 cursor-pointer"
                    >
                      <PaperAirplaneIcon className="w-5 h-5" />
                    </button>
                  </div>
                </form>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center">
                  <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl">💬</span>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Select a conversation
                  </h3>
                  <p className="text-gray-500">
                    Choose from your existing conversations or start a new one
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Chat;
