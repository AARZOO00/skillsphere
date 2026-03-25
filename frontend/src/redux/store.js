import { configureStore } from '@reduxjs/toolkit';
import authReducer         from './slices/authSlice';
import gigReducer          from './slices/gigSlice';
import chatReducer         from './slices/chatSlice';
import notificationReducer from './slices/notificationSlice';

const store = configureStore({
  reducer: {
    auth: authReducer,
    gigs: gigReducer,
  },
});

export default store;
