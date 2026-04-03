import { createSlice } from '@reduxjs/toolkit';
import api from '../../services/api';

const initialState = {
    coupons: [],
    appliedCoupon: null,
    discountAmount: 0,
    loading: false,
    error: null,
};

const couponSlice = createSlice({
    name: 'coupons',
    initialState,
    reducers: {
        fetchCouponsStart: (state) => {
            state.loading = true;
            state.error = null;
        },
        fetchCouponsSuccess: (state, action) => {
            state.loading = false;
            state.coupons = action.payload;
        },
        fetchCouponsFailure: (state, action) => {
            state.loading = false;
            state.error = action.payload;
        },
        validateCouponStart: (state) => {
            state.loading = true;
            state.error = null;
        },
        validateCouponSuccess: (state, action) => {
            state.loading = false;
            state.appliedCoupon = action.payload.coupon;
            // Ensure discountAmount is a number
            state.discountAmount = parseFloat(action.payload.coupon.discountAmount) || 0;
        },
        validateCouponFailure: (state, action) => {
            state.loading = false;
            state.error = action.payload;
            state.appliedCoupon = null;
            state.discountAmount = 0;
        },
        clearCoupon: (state) => {
            state.appliedCoupon = null;
            state.discountAmount = 0;
            state.error = null;
        },
    },
});

export const {
    fetchCouponsStart,
    fetchCouponsSuccess,
    fetchCouponsFailure,
    validateCouponStart,
    validateCouponSuccess,
    validateCouponFailure,
    clearCoupon,
} = couponSlice.actions;

export const fetchCoupons = () => async (dispatch) => {
    try {
        dispatch(fetchCouponsStart());
        const { data } = await api.get('/coupons/active');
        dispatch(fetchCouponsSuccess(data.coupons));
    } catch (error) {
        dispatch(fetchCouponsFailure(error.response?.data?.message || 'Failed to fetch coupons'));
    }
};

export const validateCoupon = (code, cartTotal) => async (dispatch) => {
    try {
        dispatch(validateCouponStart());
        const { data } = await api.post('/coupons/validate', { code, cartTotal });
        dispatch(validateCouponSuccess(data));
        return { success: true, data };
    } catch (error) {
        const message = error.response?.data?.message || 'Invalid coupon code';
        dispatch(validateCouponFailure(message));
        return { error: { message } };
    }
};

export default couponSlice.reducer;