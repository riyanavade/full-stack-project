import { configureStore } from '@reduxjs/toolkit';
import authReducer from './authSlice';
import rideReducer from './rideSlice';
import paymentReducer from './paymentSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    ride: rideReducer,
    payment: paymentReducer,
  },
});
