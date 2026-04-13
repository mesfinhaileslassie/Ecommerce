import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { FaShoppingCart, FaUser, FaTachometerAlt, FaHeart, FaBars, FaTimes } from 'react-icons/fa';
import { logout } from '../../redux/slices/authSlice';
import { fetchCart } from '../../redux/slices/cartSlice';
import ThemeToggle from '../Common/ThemeToggle';
import toast from 'react-hot-toast';

const Navbar = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const { user, token } = useSelector((state) => state.auth);
    const { itemCount } = useSelector((state) => state.cart);

    useEffect(() => {
        if (token && user) {
            dispatch(fetchCart());
        }
    }, [dispatch, token, user]);

    const handleLogout = () => {
        dispatch(logout());
        toast.success('Logged out successfully');
        navigate('/');
        setIsMenuOpen(false);
    };

    const closeMenu = () => setIsMenuOpen(false);

    return (
        <nav className="navbar">
            <div className="navbar-container">
                {/* Logo */}
                <Link to="/" className="navbar-logo" onClick={closeMenu}>
                    <span className="navbar-logo-icon">🛍️</span>
                    <span className="navbar-logo-text">Habesha Gebeya</span>
                </Link>

                {/* Hamburger Menu Button - Mobile Only */}
                <button 
                    onClick={() => setIsMenuOpen(!isMenuOpen)} 
                    className="navbar-menu-btn"
                    aria-label="Toggle menu"
                >
                    {isMenuOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
                </button>

                {/* Desktop Navigation */}
                <div className="navbar-desktop-menu">
                    <Link to="/products" className="navbar-link">
                        Products
                    </Link>
                    
                    {user && (
                        <>
                            <Link to="/wishlist" className="navbar-link">
                                <FaHeart /> Wishlist
                            </Link>
                            <Link to="/cart" className="navbar-cart-link">
                                <FaShoppingCart />
                                {itemCount > 0 && (
                                    <span className="navbar-cart-badge">
                                        {itemCount > 99 ? '99+' : itemCount}
                                    </span>
                                )}
                            </Link>
                            <Link to="/profile" className="navbar-user-link">
                                <FaUser /> {user.name.split(' ')[0]}
                            </Link>
                            <Link to="/orders" className="navbar-link">
                                📦 Orders
                            </Link>
                            
                            {user.isAdmin && (
                                <Link to="/admin" className="navbar-admin-link">
                                    <FaTachometerAlt /> Admin
                                </Link>
                            )}
                            
                            <button onClick={handleLogout} className="navbar-logout-btn">
                                Logout
                            </button>
                        </>
                    )}
                    
                    {!user && (
                        <>
                            <Link to="/login" className="navbar-link">
                                Login
                            </Link>
                            <Link to="/register" className="navbar-register-btn">
                                Sign Up
                            </Link>
                        </>
                    )}
                    
                    {/* Theme Toggle - Always Last */}
                    <ThemeToggle />
                </div>

                {/* Mobile Navigation - Hamburger Menu */}
                <div className={`navbar-mobile-menu ${isMenuOpen ? 'navbar-mobile-menu-open' : ''}`}>
                    <Link to="/products" className="navbar-mobile-link" onClick={closeMenu}>
                        Products
                    </Link>
                    
                    {user && (
                        <>
                            <Link to="/wishlist" className="navbar-mobile-link" onClick={closeMenu}>
                                ❤️ Wishlist
                            </Link>
                            <Link to="/cart" className="navbar-mobile-link" onClick={closeMenu}>
                                🛒 Cart {itemCount > 0 && `(${itemCount > 99 ? '99+' : itemCount})`}
                            </Link>
                            <Link to="/profile" className="navbar-mobile-link" onClick={closeMenu}>
                                👤 {user.name.split(' ')[0]}
                            </Link>
                            <Link to="/orders" className="navbar-mobile-link" onClick={closeMenu}>
                                📦 Orders
                            </Link>
                            {user.isAdmin && (
                                <Link to="/admin" className="navbar-mobile-admin-link" onClick={closeMenu}>
                                    ⚡ Admin Dashboard
                                </Link>
                            )}
                            <button onClick={handleLogout} className="navbar-mobile-logout-btn">
                                Logout
                            </button>
                        </>
                    )}
                    
                    {!user && (
                        <>
                            <Link to="/login" className="navbar-mobile-link" onClick={closeMenu}>
                                Login
                            </Link>
                            <Link to="/register" className="navbar-mobile-register-btn" onClick={closeMenu}>
                                Sign Up
                            </Link>
                        </>
                    )}
                    
                    {/* Theme Toggle for Mobile - Always Last */}
                    <div className="navbar-mobile-theme-toggle">
                        <ThemeToggle />
                        <span className="navbar-mobile-theme-text">Dark Mode</span>
                    </div>
                </div>
            </div>
        </nav>
    );
};

// Inject CSS Styles for Navbar
const styleSheet = document.createElement("style");
styleSheet.textContent = `
    /* Navbar Base Styles */
    .navbar {
        background-color: #1a1a2e;
        position: sticky;
        top: 0;
        z-index: 1000;
        box-shadow: 0 4px 20px rgba(0,0,0,0.1);
    }
    
    body.dark-mode .navbar {
        background-color: #0a0a0a;
        border-bottom: 1px solid #333333;
    }
    
    .navbar-container {
        max-width: 1280px;
        margin: 0 auto;
        padding: 1rem 1.5rem;
        display: flex;
        justify-content: space-between;
        align-items: center;
        position: relative;
    }
    
    /* Logo Styles */
    .navbar-logo {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        text-decoration: none;
        z-index: 1001;
    }
    
    .navbar-logo-icon {
        font-size: 1.8rem;
    }
    
    .navbar-logo-text {
        font-size: 1.2rem;
        font-weight: bold;
        background: linear-gradient(135deg, #fff, #a5b4fc);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
    }
    
    /* Desktop Menu */
    .navbar-desktop-menu {
        display: flex;
        align-items: center;
        gap: 1.5rem;
    }
    
    /* Navigation Links */
    .navbar-link {
        color: #e5e7eb;
        text-decoration: none;
        transition: color 0.3s;
        font-size: 1rem;
        display: flex;
        align-items: center;
        gap: 0.5rem;
    }
    
    .navbar-link:hover {
        color: #a5b4fc;
    }
    
    body.dark-mode .navbar-link {
        color: #d1d5db;
    }
    
    body.dark-mode .navbar-link:hover {
        color: #a5b4fc;
    }
    
    /* User Link */
    .navbar-user-link {
        color: #e5e7eb;
        text-decoration: none;
        display: flex;
        align-items: center;
        gap: 0.5rem;
        transition: color 0.3s;
    }
    
    .navbar-user-link:hover {
        color: #a5b4fc;
    }
    
    body.dark-mode .navbar-user-link {
        color: #d1d5db;
    }
    
    /* Admin Link */
    .navbar-admin-link {
        color: #fbbf24;
        text-decoration: none;
        display: flex;
        align-items: center;
        gap: 0.5rem;
        font-weight: 500;
        transition: color 0.3s;
    }
    
    .navbar-admin-link:hover {
        color: #fcd34d;
    }
    
    /* Cart Link with Badge */
    .navbar-cart-link {
        color: #e5e7eb;
        text-decoration: none;
        position: relative;
        font-size: 1.2rem;
        display: flex;
        align-items: center;
        transition: transform 0.3s, color 0.3s;
    }
    
    .navbar-cart-link:hover {
        color: #a5b4fc;
        transform: scale(1.05);
    }
    
    body.dark-mode .navbar-cart-link {
        color: #d1d5db;
    }
    
    /* Cart Badge - Fixed Size */
    .navbar-cart-badge {
        position: absolute;
        top: -10px;
        right: -14px;
        background-color: #dc3545;
        color: white;
        border-radius: 50%;
        min-width: 18px;
        height: 18px;
        padding: 0 5px;
        font-size: 10px;
        font-weight: bold;
        display: flex;
        align-items: center;
        justify-content: center;
        line-height: 1;
        box-shadow: 0 1px 2px rgba(0,0,0,0.2);
    }
    
    /* Logout Button */
    .navbar-logout-btn {
        background-color: transparent;
        border: 1px solid #dc3545;
        color: #dc3545;
        padding: 6px 16px;
        border-radius: 0.5rem;
        cursor: pointer;
        transition: all 0.3s;
        font-size: 0.9rem;
    }
    
    .navbar-logout-btn:hover {
        background-color: #dc3545;
        color: white;
    }
    
    /* Register Button */
    .navbar-register-btn {
        background: linear-gradient(135deg, #6366f1, #4f46e5);
        color: white;
        padding: 6px 16px;
        border-radius: 0.5rem;
        text-decoration: none;
        transition: transform 0.3s, box-shadow 0.3s;
        font-size: 0.9rem;
    }
    
    .navbar-register-btn:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 10px rgba(99, 102, 241, 0.3);
    }
    
    /* Mobile Menu Button */
    .navbar-menu-btn {
        display: none;
        background: none;
        border: none;
        cursor: pointer;
        color: white;
        padding: 0.5rem;
        z-index: 1001;
    }
    
    body.dark-mode .navbar-menu-btn {
        color: #d1d5db;
    }
    
    /* Mobile Menu */
    .navbar-mobile-menu {
        display: none;
        flex-direction: column;
        gap: 0.5rem;
        background-color: #1a1a2e;
        position: absolute;
        top: 70px;
        left: 0;
        right: 0;
        padding: 1.5rem;
        z-index: 1000;
        box-shadow: 0 4px 6px rgba(0,0,0,0.1);
        border-top: 1px solid #374151;
        max-height: 0;
        overflow: hidden;
        opacity: 0;
        transition: all 0.3s ease;
    }
    
    body.dark-mode .navbar-mobile-menu {
        background-color: #0a0a0a;
        border-top-color: #333333;
    }
    
    .navbar-mobile-menu-open {
        max-height: 500px;
        opacity: 1;
    }
    
    .navbar-mobile-link {
        color: #e5e7eb;
        text-decoration: none;
        padding: 0.75rem 0;
        font-size: 1rem;
        display: flex;
        align-items: center;
        gap: 0.5rem;
        border-bottom: 1px solid #374151;
        transition: color 0.3s;
    }
    
    .navbar-mobile-link:hover {
        color: #a5b4fc;
    }
    
    body.dark-mode .navbar-mobile-link {
        color: #d1d5db;
        border-bottom-color: #333333;
    }
    
    .navbar-mobile-admin-link {
        color: #fbbf24;
        text-decoration: none;
        padding: 0.75rem 0;
        font-size: 1rem;
        display: flex;
        align-items: center;
        gap: 0.5rem;
        border-bottom: 1px solid #374151;
        transition: color 0.3s;
    }
    
    .navbar-mobile-admin-link:hover {
        color: #fcd34d;
    }
    
    body.dark-mode .navbar-mobile-admin-link {
        border-bottom-color: #333333;
    }
    
    .navbar-mobile-logout-btn {
        background-color: rgba(239, 68, 68, 0.2);
        border: 1px solid #ef4444;
        color: #ef4444;
        padding: 0.75rem;
        border-radius: 0.5rem;
        cursor: pointer;
        font-size: 1rem;
        width: 100%;
        text-align: center;
        margin-top: 0.5rem;
        transition: all 0.3s;
    }
    
    .navbar-mobile-logout-btn:hover {
        background-color: #ef4444;
        color: white;
    }
    
    .navbar-mobile-register-btn {
        background: linear-gradient(135deg, #6366f1, #4f46e5);
        color: white;
        padding: 0.75rem;
        border-radius: 0.5rem;
        text-decoration: none;
        text-align: center;
        display: block;
        transition: transform 0.3s;
    }
    
    .navbar-mobile-register-btn:hover {
        transform: translateY(-2px);
    }
    
    /* Mobile Theme Toggle */
    .navbar-mobile-theme-toggle {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        padding: 0.75rem 0;
        color: #e5e7eb;
        border-bottom: 1px solid #374151;
    }
    
    body.dark-mode .navbar-mobile-theme-toggle {
        color: #d1d5db;
        border-bottom-color: #333333;
    }
    
    .navbar-mobile-theme-text {
        font-size: 1rem;
    }
    
    /* Responsive Styles */
    @media (max-width: 768px) {
        .navbar-desktop-menu {
            display: none !important;
        }
        
        .navbar-menu-btn {
            display: block !important;
        }
        
        .navbar-mobile-menu {
            display: flex !important;
        }
        
        .navbar-container {
            padding: 0.8rem 1rem;
        }
        
        .navbar-logo-text {
            font-size: 1rem;
        }
        
        .navbar-logo-icon {
            font-size: 1.5rem;
        }
    }
    
    @media (min-width: 769px) {
        .navbar-desktop-menu {
            display: flex !important;
        }
        
        .navbar-mobile-menu {
            display: none !important;
        }
        
        .navbar-menu-btn {
            display: none !important;
        }
    }
    
    /* Small mobile devices */
    @media (max-width: 480px) {
        .navbar-logo-text {
            font-size: 0.85rem;
        }
        
        .navbar-container {
            padding: 0.7rem 0.8rem;
        }
        
        .navbar-cart-badge {
            top: -8px;
            right: -12px;
            min-width: 16px;
            height: 16px;
            font-size: 9px;
            padding: 0 4px;
        }
    }
`;
document.head.appendChild(styleSheet);

export default Navbar;