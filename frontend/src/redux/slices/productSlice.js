import { createSlice } from '@reduxjs/toolkit';
import api from '../../services/api';

const initialState = {
    products: [],
    product: null,
    loading: false,
    error: null,
};

const productSlice = createSlice({
    name: 'products',
    initialState,
    reducers: {
        fetchProductsStart: (state) => {
            state.loading = true;
            state.error = null;
        },
        fetchProductsSuccess: (state, action) => {
            state.loading = false;
            state.products = action.payload;
        },
        fetchProductsFailure: (state, action) => {
            state.loading = false;
            state.error = action.payload;
        },
        fetchProductStart: (state) => {
            state.loading = true;
            state.error = null;
        },
        fetchProductSuccess: (state, action) => {
            state.loading = false;
            state.product = action.payload;
        },
        fetchProductFailure: (state, action) => {
            state.loading = false;
            state.error = action.payload;
        },
        createProductSuccess: (state, action) => {
            state.products.push(action.payload);
        },
        updateProductSuccess: (state, action) => {
            const index = state.products.findIndex(p => p._id === action.payload._id);
            if (index !== -1) state.products[index] = action.payload;
        },
        deleteProductSuccess: (state, action) => {
            state.products = state.products.filter(p => p._id !== action.payload);
        },
    },
});

export const {
    fetchProductsStart,
    fetchProductsSuccess,
    fetchProductsFailure,
    fetchProductStart,
    fetchProductSuccess,
    fetchProductFailure,
    createProductSuccess,
    updateProductSuccess,
    deleteProductSuccess,
} = productSlice.actions;

export const fetchProducts = () => async (dispatch) => {
    try {
        dispatch(fetchProductsStart());
        const { data } = await api.get('/products');
        dispatch(fetchProductsSuccess(data.products));
    } catch (error) {
        dispatch(fetchProductsFailure(error.response?.data?.message || 'Failed to fetch products'));
    }
};

export const fetchProduct = (id) => async (dispatch) => {
    try {
        dispatch(fetchProductStart());
        const { data } = await api.get(`/products/${id}`);
        dispatch(fetchProductSuccess(data.product));
    } catch (error) {
        dispatch(fetchProductFailure(error.response?.data?.message || 'Failed to fetch product'));
    }
};

export default productSlice.reducer;