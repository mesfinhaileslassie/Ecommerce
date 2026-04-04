import { createSlice } from '@reduxjs/toolkit';
import api from '../../services/api';
import toast from 'react-hot-toast'; // Add this import

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
        updateProfileSuccess: (state, action) => {
            state.user = action.payload.user;
            localStorage.setItem('user', JSON.stringify(action.payload.user));
        },
        updateAvatarSuccess: (state, action) => {
            if (state.user) {
                state.user.avatar = action.payload.avatar;
                localStorage.setItem('user', JSON.stringify(state.user));
            }
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

export const { 
    loginStart, 
    loginSuccess, 
    loginFailure, 
    updateProfileSuccess,
    updateAvatarSuccess,
    logout, 
    clearError 
} = authSlice.actions;

// Login action
export const login = (email, password) => async (dispatch) => {
    try {
        dispatch(loginStart());
        const { data } = await api.post('/auth/login', { email, password });
        dispatch(loginSuccess(data));
        return { success: true, data };
    } catch (error) {
        const message = error.response?.data?.message || 'Invalid credentials';
        dispatch(loginFailure(message));
        return { error: { message } };
    }
};
// Register action - Updated
export const register = (name, email, password) => async (dispatch) => {
    try {
        dispatch(loginStart());
        const { data } = await api.post('/auth/register', { name, email, password });
        dispatch(loginSuccess(data));
        return { success: true, data };
    } catch (error) {
        const message = error.response?.data?.message || 'Registration failed';
        dispatch(loginFailure(message));
        return { error: { message } };
    }
};

// Updated Profile action
export const updateProfile = (profileData) => async (dispatch) => {
    try {
        dispatch(loginStart());
        const { data } = await api.put('/auth/profile', profileData);
        dispatch(updateProfileSuccess(data));
        toast.success('Profile updated successfully!');
        return { success: true, data };
    } catch (error) {
        console.error('Update profile error:', error.response?.data);
        const message = error.response?.data?.message || 'Update failed';
        dispatch(loginFailure(message));
        toast.error(message);
        return { error: { message } };
    }
};

// Update Avatar action
export const updateAvatar = (avatar) => async (dispatch) => {
    try {
        const { data } = await api.post('/auth/avatar', { avatar });
        dispatch(updateAvatarSuccess(data));
        toast.success('Avatar updated successfully!');
        return data;
    } catch (error) {
        const message = error.response?.data?.message || 'Avatar update failed';
        toast.error(message);
        throw new Error(message);
    }
};

export default authSlice.reducer;