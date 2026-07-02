import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

// Assuming base URL is configured globally or proxy is set in vite
const API_URL = '/api/payment';

// Thunk to create Razorpay Order
export const createOrder = createAsyncThunk('payment/createOrder', async (rideId, { getState, rejectWithValue }) => {
    try {
        const { auth: { token } } = getState();
        const config = {
            headers: {
                Authorization: `Bearer ${token}`
            }
        };
        const response = await axios.post(`${API_URL}/create-order`, { rideId }, config);
        return response.data;
    } catch (error) {
        return rejectWithValue(error.response.data);
    }
});

// Thunk to verify Payment Signature
export const verifyPayment = createAsyncThunk('payment/verifyPayment', async (paymentData, { getState, rejectWithValue }) => {
    try {
        const { auth: { token } } = getState();
        const config = {
            headers: {
                Authorization: `Bearer ${token}`
            }
        };
        const response = await axios.post(`${API_URL}/verify`, paymentData, config);
        return response.data;
    } catch (error) {
        return rejectWithValue(error.response.data);
    }
});

// Thunk to fetch payment history
export const fetchPaymentHistory = createAsyncThunk('payment/fetchHistory', async (_, { getState, rejectWithValue }) => {
    try {
        const { auth: { token } } = getState();
        const config = {
            headers: {
                Authorization: `Bearer ${token}`
            }
        };
        const response = await axios.get(`${API_URL}/history`, config);
        return response.data;
    } catch (error) {
        return rejectWithValue(error.response.data);
    }
});

const paymentSlice = createSlice({
    name: 'payment',
    initialState: {
        currentOrder: null,
        history: [],
        loading: false,
        error: null,
        success: false,
    },
    reducers: {
        resetPaymentState: (state) => {
            state.currentOrder = null;
            state.loading = false;
            state.error = null;
            state.success = false;
        }
    },
    extraReducers: (builder) => {
        builder
            // Create Order
            .addCase(createOrder.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(createOrder.fulfilled, (state, action) => {
                state.loading = false;
                state.currentOrder = action.payload;
            })
            .addCase(createOrder.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload?.message || 'Failed to create order';
            })
            // Verify Payment
            .addCase(verifyPayment.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(verifyPayment.fulfilled, (state, action) => {
                state.loading = false;
                state.success = true;
                state.currentOrder = null; // Clear order after success
            })
            .addCase(verifyPayment.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload?.message || 'Payment verification failed';
            })
            // Fetch History
            .addCase(fetchPaymentHistory.pending, (state) => {
                state.loading = true;
            })
            .addCase(fetchPaymentHistory.fulfilled, (state, action) => {
                state.loading = false;
                state.history = action.payload;
            })
            .addCase(fetchPaymentHistory.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload?.message || 'Failed to fetch history';
            });
    }
});

export const { resetPaymentState } = paymentSlice.actions;
export default paymentSlice.reducer;
