import { createSlice } from '@reduxjs/toolkit';
import api from '../../services/api';

const initialState = {
    items: [],
    itemCount: 0,
    loading: false,
    error: null,
};

const wishlistSlice = createSlice({
    name: 'wishlist',
    initialState,
    reducers: {
        fetchWishlistStart: (state) => {
            state.loading = true;
            state.error = null;
        },
        fetchWishlistSuccess: (state, action) => {
            state.loading = false;
            state.items = action.payload.items || [];
            state.itemCount = action.payload.itemCount || 0;
        },
        fetchWishlistFailure: (state, action) => {
            state.loading = false;
            state.error = action.payload;
        },
        addToWishlistSuccess: (state, action) => {
            state.items = action.payload.items || [];
            state.itemCount = action.payload.itemCount || 0;
            state.loading = false;
        },
        removeFromWishlistSuccess: (state, action) => {
            state.items = action.payload.items || [];
            state.itemCount = action.payload.itemCount || 0;
            state.loading = false;
        },
        clearWishlist: (state) => {
            state.items = [];
            state.itemCount = 0;
        },
    },
});

export const {
    fetchWishlistStart,
    fetchWishlistSuccess,
    fetchWishlistFailure,
    addToWishlistSuccess,
    removeFromWishlistSuccess,
    clearWishlist,
} = wishlistSlice.actions;

export const fetchWishlist = () => async (dispatch) => {
    const token = localStorage.getItem('token');
    if (!token) {
        dispatch(fetchWishlistSuccess({ items: [], itemCount: 0 }));
        return;
    }
    
    try {
        dispatch(fetchWishlistStart());
        const { data } = await api.get('/wishlist');
        dispatch(fetchWishlistSuccess(data.wishlist));
        return { success: true };
    } catch (error) {
        console.error('Fetch wishlist error:', error);
        const message = error.response?.data?.message || 'Failed to fetch wishlist';
        dispatch(fetchWishlistFailure(message));
        dispatch(fetchWishlistSuccess({ items: [], itemCount: 0 }));
        return { error: message };
    }
};

export const addToWishlist = (productId) => async (dispatch) => {
    try {
        const token = localStorage.getItem('token');
        if (!token) {
            return { error: 'Please login first' };
        }
        
        const { data } = await api.post('/wishlist/add', { productId });
        dispatch(addToWishlistSuccess(data.wishlist));
        return { success: true };
    } catch (error) {
        console.error('Add to wishlist error:', error);
        const message = error.response?.data?.message || 'Failed to add to wishlist';
        return { error: message };
    }
};

export const removeFromWishlist = (productId) => async (dispatch) => {
    try {
        const { data } = await api.delete(`/wishlist/remove/${productId}`);
        dispatch(removeFromWishlistSuccess(data.wishlist));
        return { success: true };
    } catch (error) {
        console.error('Remove from wishlist error:', error);
        const message = error.response?.data?.message || 'Failed to remove from wishlist';
        return { error: message };
    }
};

export default wishlistSlice.reducer;