import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  posts: [],
  currentFilter: 'latest',
  loading: false,
  hasMore: true,
  page: 1,
};

const postSlice = createSlice({
  name: 'posts',
  initialState,
  reducers: {
    setPosts: (state, action) => {
      state.posts = action.payload;
    },
    addPost: (state, action) => {
      state.posts.unshift(action.payload);
    },
    updatePost: (state, action) => {
      const index = state.posts.findIndex(post => post._id === action.payload._id);
      if (index !== -1) {
        state.posts[index] = action.payload;
      }
    },
    setFilter: (state, action) => {
      state.currentFilter = action.payload;
      state.page = 1;
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
  },
});

export const { setPosts, addPost, updatePost, setFilter, setLoading } = postSlice.actions;
export default postSlice.reducer;