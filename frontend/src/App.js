import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Provider, useDispatch, useSelector } from 'react-redux';
import { Toaster } from 'react-hot-toast';
import { store } from './redux/store';
import { fetchWishlist } from './redux/slices/wishlistSlice';

import Navbar from './components/Layout/Navbar';
import Footer from './components/Layout/Footer';
import HomePage from './pages/Home/HomePage';
import ProductsPage from './pages/Products/ProductsPage';
import ProductDetailsPage from './pages/ProductDetails/ProductDetailsPage';
import CartPage from './pages/Cart/CartPage';
import LoginPage from './pages/Login/LoginPage';
import RegisterPage from './pages/Register/RegisterPage';
import ProfilePage from './pages/Profile/ProfilePage';
import OrdersPage from './pages/Orders/OrdersPage';
import CheckoutPage from './pages/Checkout/CheckoutPage';
import WishlistPage from './pages/Wishlist/WishlistPage';

import AdminDashboardPage from './pages/Admin/AdminDashboardPage';
import AdminProductsPage from './pages/Admin/AdminProductsPage';
import AdminOrdersPage from './pages/Admin/AdminOrdersPage';
import AdminRoute from './components/Admin/AdminRoute';
import AdminCouponsPage from './pages/Admin/AdminCouponsPage';

import './styles/index.css';
import './styles/App.css';

const AppContent = () => {
    const dispatch = useDispatch();
    const { token, user } = useSelector((state) => state.auth);

    useEffect(() => {
        if (token && user) {
            dispatch(fetchWishlist());
        }
    }, [dispatch, token, user]);

    return (
        <Router>
            <Toaster 
                position="top-right"
                toastOptions={{
                    duration: 3000,
                    style: {
                        background: '#363636',
                        color: '#fff',
                        borderRadius: '0.5rem',
                    },
                    success: {
                        iconTheme: {
                            primary: '#10b981',
                            secondary: '#fff',
                        },
                    },
                    error: {
                        iconTheme: {
                            primary: '#ef4444',
                            secondary: '#fff',
                        },
                    },
                }}
            />
            <Navbar />
            <main style={{ minHeight: 'calc(100vh - 200px)' }}>
                <Routes>
                    <Route path="/" element={<HomePage />} />
                    <Route path="/products" element={<ProductsPage />} />
                    <Route path="/products/:id" element={<ProductDetailsPage />} />
                    <Route path="/cart" element={<CartPage />} />
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/register" element={<RegisterPage />} />
                    <Route path="/profile" element={<ProfilePage />} />
                    <Route path="/orders" element={<OrdersPage />} />
                    <Route path="/checkout" element={<CheckoutPage />} />
                    <Route path="/wishlist" element={<WishlistPage />} />
                    <Route path="/admin" element={
                        <AdminRoute>
                            <AdminDashboardPage />
                        </AdminRoute>
                    } />


                    <Route path="/admin/coupons" element={
                    <AdminRoute>
                        <AdminCouponsPage />
                    </AdminRoute>
                         } />

                    <Route path="/admin/products" element={
                        <AdminRoute>
                            <AdminProductsPage />
                        </AdminRoute>
                    } />
                    <Route path="/admin/orders" element={
                        <AdminRoute>
                            <AdminOrdersPage />
                        </AdminRoute>
                    } />
                </Routes>
            </main>
            <Footer />
        </Router>
    );
};

function App() {
    return (
        <Provider store={store}>
            <AppContent />
        </Provider>
    );
}

export default App;