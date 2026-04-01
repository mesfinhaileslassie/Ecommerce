import { createSlice } from '@reduxjs/toolkit';
import api from '../../services/api';

const initialState = {
    reviews: [],
    rating: 0,
    numReviews: 0,
    loading: false,
    error: null,
};

const reviewSlice = createSlice({
    name: 'reviews',
    initialState,
    reducers: {
        fetchReviewsStart: (state) => {
            state.loading = true;
            state.error = null;
        },
        fetchReviewsSuccess: (state, action) => {
            state.loading = false;
            state.reviews = action.payload.reviews;
            state.rating = action.payload.rating;
            state.numReviews = action.payload.numReviews;
        },
        fetchReviewsFailure: (state, action) => {
            state.loading = false;
            state.error = action.payload;
        },
        addReviewSuccess: (state, action) => {
            state.reviews = action.payload.reviews;
            state.rating = action.payload.rating;
            state.numReviews = action.payload.numReviews;
        },
    },
});

export const {
    fetchReviewsStart,
    fetchReviewsSuccess,
    fetchReviewsFailure,
    addReviewSuccess,
} = reviewSlice.actions;

export const fetchProductReviews = (productId) => async (dispatch) => {
    try {
        dispatch(fetchReviewsStart());
        const { data } = await api.get(`/products/${productId}/reviews`);
        dispatch(fetchReviewsSuccess(data));
        return { success: true };
    } catch (error) {
        const message = error.response?.data?.message || 'Failed to fetch reviews';
        dispatch(fetchReviewsFailure(message));
        return { error: { message } };
    }
};

export const addProductReview = (productId, rating, comment) => async (dispatch) => {
    try {
        const { data } = await api.post(`/products/${productId}/reviews`, { rating, comment });
        dispatch(addReviewSuccess(data.product));
        return { success: true, product: data.product };
    } catch (error) {
        const message = error.response?.data?.message || 'Failed to add review';
        return { error: { message } };
    }
};

export default reviewSlice.reducer;