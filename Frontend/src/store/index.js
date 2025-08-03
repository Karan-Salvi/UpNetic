import { configureStore } from '@reduxjs/toolkit';
import { api } from './api';
import authSlice from './slices/authSlice';
import postSlice from './slices/postSlice';
import chatSlice from './slices/chatSlice';
import connectionSlice from './slices/connectionSlice';

export const store = configureStore({
  reducer: {
    [api.reducerPath]: api.reducer,
    auth: authSlice,
    posts: postSlice,
    chat: chatSlice,
    connections: connectionSlice,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST'],
      },
    }).concat(api.middleware),
});

export default store;