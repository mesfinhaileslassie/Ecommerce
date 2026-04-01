import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Provider } from 'react-redux';
import { Toaster } from 'react-hot-toast';
import { store } from './redux/store';

import Navbar from './components/Layout/Navbar';
import HomePage from './pages/Home/HomePage';
import ProductsPage from './pages/Products/ProductsPage';
import ProductDetailsPage from './pages/ProductDetails/ProductDetailsPage';
import CartPage from './pages/Cart/CartPage';
import LoginPage from './pages/Login/LoginPage';
import RegisterPage from './pages/Register/RegisterPage';
import ProfilePage from './pages/Profile/ProfilePage';
import OrdersPage from './pages/Orders/OrdersPage';
import CheckoutPage from './pages/Checkout/CheckoutPage';

// Admin imports
import AdminDashboardPage from './pages/Admin/AdminDashboardPage';
import AdminProductsPage from './pages/Admin/AdminProductsPage';
import AdminOrdersPage from './pages/Admin/AdminOrdersPage';
import AdminRoute from './components/Admin/AdminRoute';

import './styles/App.css';

function App() {
    return (
        <Provider store={store}>
            <Router>
                <Toaster position="top-right" />
                <Navbar />
                <div className="container">
                    <Routes>
                        {/* Public Routes */}
                        <Route path="/" element={<HomePage />} />
                        <Route path="/products" element={<ProductsPage />} />
                        <Route path="/products/:id" element={<ProductDetailsPage />} />
                        <Route path="/login" element={<LoginPage />} />
                        <Route path="/register" element={<RegisterPage />} />
                        
                        {/* Protected User Routes */}
                        <Route path="/cart" element={<CartPage />} />
                        <Route path="/checkout" element={<CheckoutPage />} />
                        <Route path="/profile" element={<ProfilePage />} />
                        <Route path="/orders" element={<OrdersPage />} />
                        
                        {/* Admin Routes */}
                        <Route path="/admin" element={
                            <AdminRoute>
                                <AdminDashboardPage />
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
                </div>
            </Router>
        </Provider>
    );
}

export default App;