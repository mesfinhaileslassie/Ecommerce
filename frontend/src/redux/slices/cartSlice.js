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
            console.log('✅ fetchCartSuccess - items:', state.items.length, 'total:', state.totalPrice);
        },
        fetchCartFailure: (state, action) => {
            state.loading = false;
            state.error = action.payload;
        },
        addToCartSuccess: (state, action) => {
            state.items = action.payload.items || [];
            state.totalPrice = action.payload.totalPrice || 0;
            state.itemCount = action.payload.itemCount || 0;
            console.log('✅ addToCartSuccess - items:', state.items.length, 'itemCount:', state.itemCount);
        },
        updateCartSuccess: (state, action) => {
            state.items = action.payload.items || [];
            state.totalPrice = action.payload.totalPrice || 0;
            state.itemCount = action.payload.itemCount || 0;
            console.log('✅ updateCartSuccess - items:', state.items.length, 'itemCount:', state.itemCount);
        },
        removeFromCartSuccess: (state, action) => {
            state.items = action.payload.items || [];
            state.totalPrice = action.payload.totalPrice || 0;
            state.itemCount = action.payload.itemCount || 0;
            console.log('✅ removeFromCartSuccess - items:', state.items.length);
        },
        clearCartSuccess: (state) => {
            state.items = [];
            state.totalPrice = 0;
            state.itemCount = 0;
            console.log('✅ clearCartSuccess - cart cleared');
        },
    },
});

export const {
    fetchCartStart,
    fetchCartSuccess,
    fetchCartFailure,
    addToCartSuccess,
    updateCartSuccess,
    removeFromCartSuccess,
    clearCartSuccess,
} = cartSlice.actions;

export const fetchCart = () => async (dispatch) => {
    const token = localStorage.getItem('token');
    console.log('🔍 fetchCart - token exists:', !!token);
    
    if (!token) {
        dispatch(fetchCartSuccess({ items: [], totalPrice: 0, itemCount: 0 }));
        return;
    }
    
    try {
        dispatch(fetchCartStart());
        const { data } = await api.get('/cart');
        console.log('📦 fetchCart response:', data);
        dispatch(fetchCartSuccess(data.cart));
        return { success: true, cart: data.cart };
    } catch (error) {
        console.error('❌ Fetch cart error:', error);
        dispatch(fetchCartFailure(error.response?.data?.message || 'Failed to fetch cart'));
        dispatch(fetchCartSuccess({ items: [], totalPrice: 0, itemCount: 0 }));
        return { error: { message: error.response?.data?.message || 'Failed to fetch cart' } };
    }
};

export const addToCart = (productId, quantity) => async (dispatch) => {
    try {
        console.log('🛒 Adding to cart - Product ID:', productId, 'Quantity:', quantity);
        
        const { data } = await api.post('/cart/add', { productId, quantity });
        
        console.log('📦 Add to cart response:', data);
        console.log('📋 Cart items after add:', data.cart.items);
        console.log('💰 Cart total after add:', data.cart.totalPrice);
        console.log('🔢 Item count:', data.cart.itemCount);
        
        dispatch(addToCartSuccess(data.cart));
        console.log('✅ addToCartSuccess dispatched');
        
        return { success: true, cart: data.cart };
    } catch (error) {
        console.error('❌ Add to cart error:', error.response?.data || error);
        const message = error.response?.data?.message || 'Failed to add to cart';
        return { error: { message } };
    }
};

export const updateCartItem = (productId, quantity) => async (dispatch) => {
    try {
        console.log('✏️ Updating cart item:', { productId, quantity });
        const { data } = await api.put(`/cart/update/${productId}`, { quantity });
        console.log('📦 Update response:', data);
        dispatch(updateCartSuccess(data.cart));
        return { success: true, cart: data.cart };
    } catch (error) {
        console.error('❌ Update cart error:', error.response?.data || error);
        const message = error.response?.data?.message || 'Update failed';
        return { error: { message } };
    }
};

export const removeFromCart = (productId) => async (dispatch) => {
    try {
        console.log('🗑️ Removing from cart:', productId);
        const { data } = await api.delete(`/cart/remove/${productId}`);
        dispatch(removeFromCartSuccess(data.cart));
        return { success: true, cart: data.cart };
    } catch (error) {
        console.error('❌ Remove from cart error:', error);
        const message = error.response?.data?.message || 'Remove failed';
        return { error: { message } };
    }
};

export const clearCart = () => async (dispatch) => {
    try {
        console.log('🧹 Clearing cart');
        await api.delete('/cart/clear');
        dispatch(clearCartSuccess());
        return { success: true };
    } catch (error) {
        console.error('❌ Clear cart error:', error);
        const message = error.response?.data?.message || 'Clear failed';
        return { error: { message } };
    }
};

export default cartSlice.reducer;