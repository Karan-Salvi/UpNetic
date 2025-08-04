import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

const baseURI = import.meta.env.VITE_API_URL;

const baseQuery = fetchBaseQuery({
  baseUrl: `${baseURI}/api`,
  prepareHeaders: (headers, { getState }) => {
    const token = getState().auth.token;

    if (token) {
      headers.set("authorization", `Bearer ${token}`);
    }
    return headers;
  },
});

export const api = createApi({
  reducerPath: "api",
  baseQuery,
  tagTypes: ["User", "Post", "Comment", "Connection", "Chat"],
  endpoints: (builder) => ({
    // Auth endpoints
    login: builder.mutation({
      query: (credentials) => ({
        url: "/auth/login",
        method: "POST",
        body: credentials,
      }),
    }),
    register: builder.mutation({
      query: (userData) => ({
        url: "/auth/register",
        method: "POST",
        body: userData,
      }),
    }),

    // User endpoints
    getProfile: builder.query({
      query: (userId) => `/users/profile/${userId}`,
      providesTags: ["User"],
    }),
    updateProfile: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `/users/profile/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["User"],
    }),
    uploadAvatar: builder.mutation({
      query: (formData) => ({
        url: "/users/upload-avatar",
        method: "POST",
        body: formData,
      }),
      invalidatesTags: ["User"],
    }),

    // Post endpoints
    getPosts: builder.query({
      query: ({ filter = "latest", page = 1, limit = 10 }) =>
        `/posts?filter=${filter}&page=${page}&limit=${limit}`,
      providesTags: ["Post"],
    }),
    // getPosts: builder.query({
    //   query: ({ filter = 'latest', page = 1, limit = 10 }) =>
    //     `/posts?filter=${filter}&page=${page}&limit=${limit}`,
    //   providesTags: ['Post'],
    // }),
    getPosts: builder.query({
      query: ({ filter = "latest", page = 1, limit = 10, author }) => {
        let url = `/posts?filter=${filter}&page=${page}&limit=${limit}`;
        if (author) {
          url += `&author=${author}`;
        }
        return url;
      },
      providesTags: ["Post"],
    }),
    createPost: builder.mutation({
      query: (postData) => ({
        url: "/posts",
        method: "POST",
        body: postData,
      }),
      invalidatesTags: ["Post"],
    }),
    likePost: builder.mutation({
      query: (postId) => ({
        url: `/posts/${postId}/like`,
        method: "POST",
      }),
      invalidatesTags: ["Post"],
    }),
    addComment: builder.mutation({
      query: ({ postId, content }) => ({
        url: `/posts/${postId}/comments`,
        method: "POST",
        body: { content },
      }),
      invalidatesTags: ["Post"],
    }),

    // Connection endpoints
    getConnections: builder.query({
      query: () => "/connections",
      providesTags: ["Connection"],
    }),
    sendConnectionRequest: builder.mutation({
      query: (userId) => ({
        url: "/connections/request",
        method: "POST",
        body: { userId },
      }),
      invalidatesTags: ["Connection"],
    }),
    respondToConnection: builder.mutation({
      query: ({ requestId, action }) => ({
        url: `/connections/${requestId}`,
        method: "PUT",
        body: { action },
      }),
      invalidatesTags: ["Connection", "User"],
    }),

    // Chat endpoints
    getChats: builder.query({
      query: () => "/chats",
      providesTags: ["Chat"],
    }),
    getChatMessages: builder.query({
      query: (chatId) => `/chats/${chatId}/messages`,
      providesTags: ["Chat"],
    }),

    // // 🟡 Get messages from a chat with pagination
    // getChatMessages: builder.query({
    //   query: ({ chatId, page = 1, limit = 50 }) =>
    //     `/${chatId}/messages?page=${page}&limit=${limit}`,
    //   providesTags: (result, error, { chatId }) => [
    //     { type: "Messages", id: chatId },
    //   ],
    // }),

    // 🟢 Create or get a direct chat
    createOrGetChat: builder.mutation({
      query: (participantId) => ({
        url: `/chats`,
        method: "POST",
        body: { participantId },
      }),
      invalidatesTags: ["Chats"],
    }),

    // 🟢 Send a message
    sendMessage: builder.mutation({
      query: ({ chatId, content, messageType = "text" }) => ({
        url: `/chats/${chatId}/messages`,
        method: "POST",
        body: { content, messageType },
      }),
      invalidatesTags: (result, error, { chatId }) => [
        { type: "Messages", id: chatId },
        { type: "Chats" },
      ],
    }),

    // 🟡 Edit a message
    editMessage: builder.mutation({
      query: ({ chatId, messageId, content }) => ({
        url: `/chats/${chatId}/messages/${messageId}`,
        method: "PUT",
        body: { content },
      }),
      invalidatesTags: (result, error, { chatId }) => [
        { type: "Messages", id: chatId },
      ],
    }),

    // 🔴 Delete a message
    deleteMessage: builder.mutation({
      query: ({ chatId, messageId }) => ({
        url: `/chats/${chatId}/messages/${messageId}`,
        method: "DELETE",
      }),
      invalidatesTags: (result, error, { chatId }) => [
        { type: "Messages", id: chatId },
      ],
    }),

    // 🟢 Mark messages as read
    markAsRead: builder.mutation({
      query: ({ chatId, messageIds }) => ({
        url: `/chats/${chatId}/read`,
        method: "PUT",
        body: { messageIds },
      }),
      invalidatesTags: (result, error, { chatId }) => [
        { type: "Messages", id: chatId },
        { type: "Chats" },
      ],
    }),
  }),
});

export const {
  useLoginMutation,
  useRegisterMutation,
  useGetProfileQuery,
  useUpdateProfileMutation,
  useUploadAvatarMutation,
  useGetPostsQuery,
  useCreatePostMutation,
  useLikePostMutation,
  useAddCommentMutation,
  useGetConnectionsQuery,
  useSendConnectionRequestMutation,
  useRespondToConnectionMutation,
  useGetChatsQuery,
  useGetChatMessagesQuery,

  useCreateOrGetChatMutation,
  useSendMessageMutation,
  useEditMessageMutation,
  useDeleteMessageMutation,
  useMarkAsReadMutation,
} = api;
