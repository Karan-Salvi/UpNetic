import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  connections: [],
  pendingRequests: [],
  sentRequests: [],
  suggestions: [],
};

const connectionSlice = createSlice({
  name: 'connections',
  initialState,
  reducers: {
    setConnections: (state, action) => {
      state.connections = action.payload;
    },
    setPendingRequests: (state, action) => {
      state.pendingRequests = action.payload;
    },
    setSentRequests: (state, action) => {
      state.sentRequests = action.payload;
    },
    setSuggestions: (state, action) => {
      state.suggestions = action.payload;
    },
    addConnection: (state, action) => {
      state.connections.push(action.payload);
    },
    removeRequest: (state, action) => {
      state.pendingRequests = state.pendingRequests.filter(
        req => req._id !== action.payload
      );
    },
  },
});

export const { 
  setConnections, 
  setPendingRequests, 
  setSentRequests, 
  setSuggestions, 
  addConnection, 
  removeRequest 
} = connectionSlice.actions;
export default connectionSlice.reducer;