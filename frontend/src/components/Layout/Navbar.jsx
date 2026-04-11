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
        <nav className="navbar" style={styles.navbar}>
            <div style={styles.container}>
                {/* Logo */}
                <Link to="/" style={styles.logo} onClick={closeMenu}>
                    <span style={styles.logoIcon}>🛍️</span>
                    <span style={styles.logoText}>Habesha Gebeya</span>
                </Link>

                {/* Hamburger Menu Button - Mobile Only */}
                <button 
                    onClick={() => setIsMenuOpen(!isMenuOpen)} 
                    style={styles.menuBtn}
                    className="menu-btn"
                    aria-label="Toggle menu"
                >
                    {isMenuOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
                </button>

                {/* Desktop Navigation */}
                <div style={styles.desktopMenu} className="desktop-menu">
                    <Link to="/products" style={styles.link}>
                        Products
                    </Link>
                    
                    {user && (
                        <Link to="/cart" style={styles.cartLink}>
                            <FaShoppingCart />
                            {itemCount > 0 && (
                                <span style={styles.cartBadge}>{itemCount}</span>
                            )}
                        </Link>
                    )}

                    {/* Theme Toggle */}
                    <ThemeToggle />

                    {user ? (
                        <>
                            <Link to="/wishlist" style={styles.link}>
                                <FaHeart /> Wishlist
                            </Link>
                            <Link to="/profile" style={styles.userLink}>
                                <FaUser /> {user.name.split(' ')[0]}
                            </Link>
                            <Link to="/orders" style={styles.link}>
                                📦 Orders
                            </Link>
                            
                            {user.isAdmin && (
                                <Link to="/admin" style={styles.adminLink}>
                                    <FaTachometerAlt /> Admin
                                </Link>
                            )}
                            
                            <button onClick={handleLogout} style={styles.logoutBtn}>
                                Logout
                            </button>
                        </>
                    ) : (
                        <>
                            <Link to="/login" style={styles.link}>
                                Login
                            </Link>
                            <Link to="/register" style={styles.registerBtn}>
                                Sign Up
                            </Link>
                        </>
                    )}
                </div>

                {/* Mobile Navigation - Hamburger Menu */}
                <div className={`mobile-menu ${isMenuOpen ? 'mobile-menu-open' : ''}`} style={styles.mobileMenu}>
                    <Link to="/products" style={styles.mobileLink} onClick={closeMenu}>
                        Products
                    </Link>
                    
                    {user && (
                        <Link to="/cart" style={styles.mobileLink} onClick={closeMenu}>
                            🛒 Cart {itemCount > 0 && `(${itemCount})`}
                        </Link>
                    )}

                    {/* Theme Toggle for Mobile */}
                    <div style={styles.mobileThemeToggle}>
                        <ThemeToggle />
                        <span style={styles.mobileThemeText}>Dark Mode</span>
                    </div>
                    
                    {user ? (
                        <>
                            <Link to="/wishlist" style={styles.mobileLink} onClick={closeMenu}>
                                ❤️ Wishlist
                            </Link>
                            <Link to="/profile" style={styles.mobileLink} onClick={closeMenu}>
                                👤 {user.name.split(' ')[0]}
                            </Link>
                            <Link to="/orders" style={styles.mobileLink} onClick={closeMenu}>
                                📦 Orders
                            </Link>
                            {user.isAdmin && (
                                <Link to="/admin" style={styles.mobileAdminLink} onClick={closeMenu}>
                                    ⚡ Admin Dashboard
                                </Link>
                            )}
                            <button onClick={handleLogout} style={styles.mobileLogoutBtn}>
                                Logout
                            </button>
                        </>
                    ) : (
                        <>
                            <Link to="/login" style={styles.mobileLink} onClick={closeMenu}>
                                Login
                            </Link>
                            <Link to="/register" style={styles.mobileRegisterBtn} onClick={closeMenu}>
                                Sign Up
                            </Link>
                        </>
                    )}
                </div>
            </div>
        </nav>
    );
};

const styles = {
    navbar: {
        backgroundColor: '#1a1a2e',
        position: 'sticky',
        top: 0,
        zIndex: 1000,
        boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
    },
    container: {
        maxWidth: '1280px',
        margin: '0 auto',
        padding: '1rem 1.5rem',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        position: 'relative',
    },
    logo: {
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        textDecoration: 'none',
        zIndex: 1001,
    },
    logoIcon: {
        fontSize: '1.8rem',
    },
    logoText: {
        fontSize: '1.2rem',
        fontWeight: 'bold',
        background: 'linear-gradient(135deg, #fff, #a5b4fc)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        backgroundClip: 'text',
        '@media (max-width: 480px)': {
            fontSize: '1rem',
        },
    },
    menuBtn: {
        display: 'none',
        background: 'none',
        border: 'none',
        cursor: 'pointer',
        color: 'white',
        padding: '0.5rem',
        zIndex: 1001,
    },
    desktopMenu: {
        display: 'flex',
        alignItems: 'center',
        gap: '1.5rem',
    },
    link: {
        color: '#e5e7eb',
        textDecoration: 'none',
        transition: 'color 0.3s',
        fontSize: '1rem',
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
    },
    userLink: {
        color: '#e5e7eb',
        textDecoration: 'none',
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        transition: 'color 0.3s',
    },
    adminLink: {
        color: '#fbbf24',
        textDecoration: 'none',
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        fontWeight: '500',
    },
    cartLink: {
        color: '#e5e7eb',
        textDecoration: 'none',
        position: 'relative',
        fontSize: '1.2rem',
        display: 'flex',
        alignItems: 'center',
    },
    cartBadge: {
        position: 'absolute',
        top: '-8px',
        right: '-12px',
        backgroundColor: '#dc3545',
        color: '#fff',
        borderRadius: '50%',
        padding: '2px 6px',
        fontSize: '11px',
        fontWeight: 'bold',
        minWidth: '18px',
        textAlign: 'center',
    },
    logoutBtn: {
        backgroundColor: 'transparent',
        border: '1px solid #dc3545',
        color: '#dc3545',
        padding: '6px 16px',
        borderRadius: '0.5rem',
        cursor: 'pointer',
        transition: 'all 0.3s',
        fontSize: '0.9rem',
    },
    registerBtn: {
        background: 'linear-gradient(135deg, #6366f1, #4f46e5)',
        color: 'white',
        padding: '6px 16px',
        borderRadius: '0.5rem',
        textDecoration: 'none',
        transition: 'transform 0.3s',
        fontSize: '0.9rem',
    },
    mobileMenu: {
        display: 'none',
        flexDirection: 'column',
        gap: '1rem',
        marginTop: '1rem',
        paddingTop: '1rem',
        borderTop: '1px solid #374151',
        backgroundColor: '#1a1a2e',
        position: 'absolute',
        top: '70px',
        left: 0,
        right: 0,
        padding: '1.5rem',
        zIndex: 1000,
        boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
    },
    mobileLink: {
        color: '#e5e7eb',
        textDecoration: 'none',
        padding: '0.75rem 0',
        fontSize: '1rem',
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        borderBottom: '1px solid #374151',
    },
    mobileAdminLink: {
        color: '#fbbf24',
        textDecoration: 'none',
        padding: '0.75rem 0',
        fontSize: '1rem',
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        borderBottom: '1px solid #374151',
    },
    mobileLogoutBtn: {
        backgroundColor: 'rgba(239, 68, 68, 0.2)',
        border: '1px solid #ef4444',
        color: '#ef4444',
        padding: '0.75rem',
        borderRadius: '0.5rem',
        cursor: 'pointer',
        fontSize: '1rem',
        width: '100%',
        textAlign: 'center',
        marginTop: '0.5rem',
    },
    mobileRegisterBtn: {
        background: 'linear-gradient(135deg, #6366f1, #4f46e5)',
        color: 'white',
        padding: '0.75rem',
        borderRadius: '0.5rem',
        textDecoration: 'none',
        textAlign: 'center',
        display: 'block',
    },
    mobileThemeToggle: {
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        padding: '0.75rem 0',
        color: '#e5e7eb',
        borderBottom: '1px solid #374151',
    },
    mobileThemeText: {
        fontSize: '1rem',
    },
};

// Add responsive styles via style tag
const styleSheet = document.createElement("style");
styleSheet.textContent = `
    @media (max-width: 768px) {
        .desktop-menu {
            display: none !important;
        }
        
        .menu-btn {
            display: block !important;
        }
        
        .mobile-menu {
            display: flex !important;
        }
    }
    
    @media (min-width: 769px) {
        .desktop-menu {
            display: flex !important;
        }
        
        .mobile-menu {
            display: none !important;
        }
        
        .menu-btn {
            display: none !important;
        }
    }
    
    /* Hover effects */
    .desktop-menu a:hover,
    .mobile-menu a:hover {
        color: #a5b4fc !important;
    }
    
    .logout-btn:hover,
    .mobile-logout-btn:hover {
        background-color: #dc3545 !important;
        color: white !important;
    }
    
    .register-btn:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 10px rgba(99, 102, 241, 0.3);
    }
    
    .cart-link:hover {
        transform: scale(1.05);
    }
    
    /* Smooth transition for mobile menu */
    .mobile-menu {
        transition: all 0.3s ease;
        max-height: 0;
        overflow: hidden;
        opacity: 0;
    }
    
    .mobile-menu-open {
        max-height: 500px;
        opacity: 1;
    }
`;
document.head.appendChild(styleSheet);

export default Navbar;