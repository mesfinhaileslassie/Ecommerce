import { createSlice } from '@reduxjs/toolkit';
import api from '../../services/api';

const initialState = {
    items: [],
    totalPrice: 0,
    itemCount: 0,
    loading: false,
    error: null,
};

const cartSlice = createSlice({
    name: 'cart',
    initialState,
    reducers: {
        fetchCartStart: (state) => {
            state.loading = true;
            state.error = null;
        },
        fetchCartSuccess: (state, action) => {
            state.loading = false;
            state.items = action.payload.items || [];
            state.totalPrice = action.payload.totalPrice || 0;
            state.itemCount = action.payload.itemCount || 0;
        },
        fetchCartFailure: (state, action) => {
            state.loading = false;
            state.error = action.payload;
        },
        addToCartStart: (state) => {
            state.loading = true;
        },
        addToCartSuccess: (state, action) => {
            state.loading = false;
            state.items = action.payload.items || [];
            state.totalPrice = action.payload.totalPrice || 0;
            state.itemCount = action.payload.itemCount || 0;
        },
        addToCartFailure: (state, action) => {
            state.loading = false;
            state.error = action.payload;
        },
        updateCartSuccess: (state, action) => {
            state.items = action.payload.items || [];
            state.totalPrice = action.payload.totalPrice || 0;
            state.itemCount = action.payload.itemCount || 0;
        },
        removeFromCartSuccess: (state, action) => {
            state.items = action.payload.items || [];
            state.totalPrice = action.payload.totalPrice || 0;
            state.itemCount = action.payload.itemCount || 0;
        },
        clearCartSuccess: (state) => {
            state.items = [];
            state.totalPrice = 0;
            state.itemCount = 0;
        },
    },
});

export const {
    fetchCartStart,
    fetchCartSuccess,
    fetchCartFailure,
    addToCartStart,
    addToCartSuccess,
    addToCartFailure,
    updateCartSuccess,
    removeFromCartSuccess,
    clearCartSuccess,
} = cartSlice.actions;

export const fetchCart = () => async (dispatch) => {
    const token = localStorage.getItem('token');
    if (!token) {
        dispatch(fetchCartSuccess({ items: [], totalPrice: 0, itemCount: 0 }));
        return;
    }
    
    try {
        dispatch(fetchCartStart());
        const { data } = await api.get('/cart');
        dispatch(fetchCartSuccess(data.cart));
    } catch (error) {
        console.error('Fetch cart error:', error);
        dispatch(fetchCartFailure(error.response?.data?.message || 'Failed to fetch cart'));
        dispatch(fetchCartSuccess({ items: [], totalPrice: 0, itemCount: 0 }));
    }
};

export const addToCart = (productId, quantity) => async (dispatch) => {
    try {
        dispatch(addToCartStart());
        console.log('Sending to backend:', { productId, quantity });
        
        const { data } = await api.post('/cart/add', { productId, quantity });
        console.log('Backend response:', data);
        
        dispatch(addToCartSuccess(data.cart));
        return { success: true, data };
    } catch (error) {
        console.error('Add to cart error:', error.response || error);
        const message = error.response?.data?.message || 'Failed to add to cart';
        dispatch(addToCartFailure(message));
        return { error: { message } };
    }
};

export const updateCartItem = (productId, quantity) => async (dispatch) => {
    try {
        const { data } = await api.put(`/cart/update/${productId}`, { quantity });
        dispatch(updateCartSuccess(data.cart));
        return { success: true };
    } catch (error) {
        console.error('Update cart error:', error);
        return { error: { message: error.response?.data?.message || 'Update failed' } };
    }
};

export const removeFromCart = (productId) => async (dispatch) => {
    try {
        const { data } = await api.delete(`/cart/remove/${productId}`);
        dispatch(removeFromCartSuccess(data.cart));
        return { success: true };
    } catch (error) {
        console.error('Remove from cart error:', error);
        return { error: { message: error.response?.data?.message || 'Remove failed' } };
    }
};

export const clearCart = () => async (dispatch) => {
    try {
        await api.delete('/cart/clear');
        dispatch(clearCartSuccess());
        return { success: true };
    } catch (error) {
        console.error('Clear cart error:', error);
        return { error: { message: error.response?.data?.message || 'Clear failed' } };
    }
};

export default cartSlice.reducer;