import { createSlice } from '@reduxjs/toolkit';
import api from '../../services/api';

const initialState = {
    orders: [],
    currentOrder: null,
    loading: false,
    error: null,
};

const orderSlice = createSlice({
    name: 'orders',
    initialState,
    reducers: {
        fetchOrdersStart: (state) => {
            state.loading = true;
            state.error = null;
        },
        fetchOrdersSuccess: (state, action) => {
            state.loading = false;
            state.orders = action.payload;
        },
        fetchOrdersFailure: (state, action) => {
            state.loading = false;
            state.error = action.payload;
        },
        createOrderStart: (state) => {
            state.loading = true;
            state.error = null;
        },
        createOrderSuccess: (state, action) => {
            state.loading = false;
            state.currentOrder = action.payload;
            state.orders.unshift(action.payload);
        },
        createOrderFailure: (state, action) => {
            state.loading = false;
            state.error = action.payload;
        },
        clearCurrentOrder: (state) => {
            state.currentOrder = null;
        },
    },
});

export const {
    fetchOrdersStart,
    fetchOrdersSuccess,
    fetchOrdersFailure,
    createOrderStart,
    createOrderSuccess,
    createOrderFailure,
    clearCurrentOrder,
} = orderSlice.actions;

export const fetchMyOrders = () => async (dispatch) => {
    try {
        dispatch(fetchOrdersStart());
        const { data } = await api.get('/orders/myorders');
        dispatch(fetchOrdersSuccess(data.orders));
        return { success: true };
    } catch (error) {
        const message = error.response?.data?.message || 'Failed to fetch orders';
        dispatch(fetchOrdersFailure(message));
        return { error: { message } };
    }
};

export const createOrder = (orderData) => async (dispatch) => {
    try {
        dispatch(createOrderStart());
        console.log('Creating order with data:', orderData);
        
        const { data } = await api.post('/orders', orderData);
        console.log('Order created:', data);
        
        dispatch(createOrderSuccess(data.order));
        return { success: true, order: data.order };
    } catch (error) {
        console.error('Create order error:', error.response?.data || error);
        const message = error.response?.data?.message || 'Failed to create order';
        dispatch(createOrderFailure(message));
        return { error: { message } };
    }
};

export default orderSlice.reducer;