import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import cartReducer from './slices/cartSlice';
import productReducer from './slices/productSlice';
import orderReducer from './slices/orderSlice';

// Custom logger middleware to see state changes
const loggerMiddleware = store => next => action => {
    console.log('🎯 Action dispatched:', action.type);
    console.log('📦 Action payload:', action.payload);
    const result = next(action);
    console.log('🔄 New state:', store.getState());
    return result;
};

export const store = configureStore({
    reducer: {
        auth: authReducer,
        cart: cartReducer,
        products: productReducer,
        orders: orderReducer,
    },
    middleware: (getDefaultMiddleware) => 
        getDefaultMiddleware().concat(loggerMiddleware),
    devTools: process.env.NODE_ENV !== 'production',
});