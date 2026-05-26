import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import wardrobeReducer from './slices/wardrobeSlice';
import historyReducer from './slices/historySlice';
import toastReducer from './slices/toastSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    wardrobe: wardrobeReducer,
    history: historyReducer,
    toast: toastReducer,
  },
  devTools: process.env.NODE_ENV !== 'production',
});

export default store;
