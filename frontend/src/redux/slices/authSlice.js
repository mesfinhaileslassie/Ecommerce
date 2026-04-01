import { createSlice } from '@reduxjs/toolkit';
import api from '../../services/api';

const initialState = {
    user: localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')) : null,
    token: localStorage.getItem('token') || null,
    loading: false,
    error: null,
};

const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        loginStart: (state) => {
            state.loading = true;
            state.error = null;
        },
        loginSuccess: (state, action) => {
            state.loading = false;
            state.user = action.payload.user;
            state.token = action.payload.token;
            localStorage.setItem('token', action.payload.token);
            localStorage.setItem('user', JSON.stringify(action.payload.user));
        },
        loginFailure: (state, action) => {
            state.loading = false;
            state.error = action.payload;
        },
        logout: (state) => {
            state.user = null;
            state.token = null;
            localStorage.removeItem('token');
            localStorage.removeItem('user');
        },
        clearError: (state) => {
            state.error = null;
        },
    },
});

export const { loginStart, loginSuccess, loginFailure, logout, clearError } = authSlice.actions;

export const login = (email, password) => async (dispatch) => {
    try {
        dispatch(loginStart());
        const { data } = await api.post('/auth/login', { email, password });
        dispatch(loginSuccess(data));
        return data;
    } catch (error) {
        const message = error.response?.data?.message || 'Login failed';
        dispatch(loginFailure(message));
        throw new Error(message);
    }
};

export const register = (name, email, password) => async (dispatch) => {
    try {
        dispatch(loginStart());
        const { data } = await api.post('/auth/register', { name, email, password });
        dispatch(loginSuccess(data));
        return data;
    } catch (error) {
        const message = error.response?.data?.message || 'Registration failed';
        dispatch(loginFailure(message));
        throw new Error(message);
    }
};

export default authSlice.reducer;