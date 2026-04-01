import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
    timeout: 10000,
});

// Request interceptor - Add token to requests
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor - Handle errors
api.interceptors.response.use(
    (response) => {
        return response;
    },
    (error) => {
        // Handle 401 Unauthorized errors
        if (error.response?.status === 401) {
            const isAuthEndpoint = error.config?.url?.includes('/auth/');
            const isCartEndpoint = error.config?.url?.includes('/cart');
            
            // For cart endpoints, return empty cart instead of error
            if (isCartEndpoint && error.config?.method === 'get') {
                return Promise.resolve({ 
                    data: { 
                        cart: { 
                            items: [], 
                            totalPrice: 0, 
                            itemCount: 0 
                        } 
                    } 
                });
            }
            
            // For other protected endpoints, clear storage and redirect to login
            if (!isAuthEndpoint && !isCartEndpoint) {
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                // Only redirect if not already on login/register page
                if (!window.location.pathname.includes('/login') && 
                    !window.location.pathname.includes('/register')) {
                    window.location.href = '/login';
                }
            }
        }
        
        // Handle 404 Not Found
        if (error.response?.status === 404) {
            console.error('API endpoint not found:', error.config?.url);
        }
        
        // Handle network errors
        if (error.code === 'ECONNABORTED') {
            console.error('Request timeout:', error.config?.url);
        }
        
        if (!error.response) {
            console.error('Network error - check if backend is running');
        }
        
        return Promise.reject(error);
    }
);

export default api;