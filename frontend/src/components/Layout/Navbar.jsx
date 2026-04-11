import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../../redux/slices/authSlice';
import { fetchCart } from '../../redux/slices/cartSlice';
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
        <nav style={styles.navbar}>
            <div style={styles.container}>
                <Link to="/" style={styles.logo} onClick={closeMenu}>
                    <span style={styles.logoIcon}>🛍️</span>
                   <span style={styles.logoText}>Habesha Market</span>
                </Link>

                <button 
                    onClick={() => setIsMenuOpen(!isMenuOpen)} 
                    style={styles.menuBtn}
                >
                    ☰
                </button>

                {/* Desktop Menu */}
                <div style={styles.desktopMenu}>
                    <Link to="/products" style={styles.link}>Products</Link>
                    
                    {user && (
                        <Link to="/cart" style={styles.cartLink}>
                            🛒
                            {itemCount > 0 && <span style={styles.cartBadge}>{itemCount}</span>}
                        </Link>
                    )}

                    {user ? (
                        <>
                            <Link to="/wishlist" style={styles.link}>❤️ Wishlist</Link>
                            <Link to="/profile" style={styles.link}>👤 {user.name.split(' ')[0]}</Link>
                            <Link to="/orders" style={styles.link}>📦 Orders</Link>
                            {user.isAdmin && (
                                <Link to="/admin" style={{ ...styles.link, ...styles.adminLink }}>⚡ Admin</Link>
                            )}
                            <button onClick={handleLogout} style={styles.logoutBtn}>Logout</button>
                        </>
                    ) : (
                        <>
                            <Link to="/login" style={styles.link}>Login</Link>
                            <Link to="/register" style={styles.registerBtn}>Sign Up</Link>
                        </>
                    )}
                </div>

                {/* Mobile Menu */}
                {isMenuOpen && (
                    <div style={styles.mobileMenu}>
                        <Link to="/products" style={styles.mobileLink} onClick={closeMenu}>Products</Link>
                        {user && (
                            <Link to="/cart" style={styles.mobileLink} onClick={closeMenu}>
                                Cart {itemCount > 0 && `(${itemCount})`}
                            </Link>
                        )}
                        {user ? (
                            <>
                                <Link to="/wishlist" style={styles.mobileLink} onClick={closeMenu}>Wishlist</Link>
                                <Link to="/profile" style={styles.mobileLink} onClick={closeMenu}>Profile</Link>
                                <Link to="/orders" style={styles.mobileLink} onClick={closeMenu}>Orders</Link>
                                {user.isAdmin && (
                                    <Link to="/admin" style={styles.mobileLink} onClick={closeMenu}>Admin</Link>
                                )}
                                <button onClick={handleLogout} style={styles.mobileLogoutBtn}>Logout</button>
                            </>
                        ) : (
                            <>
                                <Link to="/login" style={styles.mobileLink} onClick={closeMenu}>Login</Link>
                                <Link to="/register" style={styles.mobileRegisterBtn} onClick={closeMenu}>Sign Up</Link>
                            </>
                        )}
                    </div>
                )}
            </div>
        </nav>
    );
};

const styles = {
    navbar: {
        background: 'linear-gradient(135deg, #1f2937 0%, #111827 100%)',
        position: 'sticky',
        top: 0,
        zIndex: 1000,
        boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
    },
    container: {
        maxWidth: '1280px',
        margin: '0 auto',
        padding: '1rem 1.5rem',
        position: 'relative',
    },
    logo: {
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.5rem',
        textDecoration: 'none',
    },
    logoIcon: {
        fontSize: '1.8rem',
    },
    logoText: {
        fontSize: '1.5rem',
        fontWeight: 'bold',
        background: 'linear-gradient(135deg, #fff, #a5b4fc)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        backgroundClip: 'text',
    },
    menuBtn: {
        display: 'none',
        background: 'none',
        border: 'none',
        fontSize: '1.8rem',
        cursor: 'pointer',
        color: 'white',
        position: 'absolute',
        right: '1.5rem',
        top: '1rem',
    },
    desktopMenu: {
        display: 'flex',
        alignItems: 'center',
        gap: '1.5rem',
        float: 'right',
    },
    link: {
        color: '#e5e7eb',
        textDecoration: 'none',
        transition: 'color 0.3s',
        fontSize: '1rem',
    },
    cartLink: {
        color: '#e5e7eb',
        textDecoration: 'none',
        position: 'relative',
        fontSize: '1.2rem',
    },
    cartBadge: {
        position: 'absolute',
        top: '-8px',
        right: '-12px',
        background: '#ef4444',
        color: 'white',
        borderRadius: '50%',
        padding: '2px 6px',
        fontSize: '0.7rem',
        fontWeight: 'bold',
    },
    adminLink: {
        color: '#fbbf24',
    },
    logoutBtn: {
        background: 'rgba(239, 68, 68, 0.2)',
        border: '1px solid #ef4444',
        color: '#ef4444',
        padding: '0.5rem 1rem',
        borderRadius: '0.5rem',
        cursor: 'pointer',
        fontSize: '1rem',
    },
    registerBtn: {
        background: 'linear-gradient(135deg, #6366f1, #4f46e5)',
        color: 'white',
        padding: '0.5rem 1.2rem',
        borderRadius: '0.5rem',
        textDecoration: 'none',
    },
    mobileMenu: {
        display: 'none',
        flexDirection: 'column',
        gap: '1rem',
        marginTop: '1rem',
        paddingTop: '1rem',
        borderTop: '1px solid #374151',
    },
    mobileLink: {
        color: '#e5e7eb',
        textDecoration: 'none',
        padding: '0.5rem 0',
        fontSize: '1rem',
    },
    mobileLogoutBtn: {
        background: 'rgba(239, 68, 68, 0.2)',
        border: '1px solid #ef4444',
        color: '#ef4444',
        padding: '0.5rem',
        borderRadius: '0.5rem',
        cursor: 'pointer',
        fontSize: '1rem',
        width: '100%',
    },
    mobileRegisterBtn: {
        background: 'linear-gradient(135deg, #6366f1, #4f46e5)',
        color: 'white',
        padding: '0.5rem',
        borderRadius: '0.5rem',
        textDecoration: 'none',
        textAlign: 'center',
    },
};

// Add responsive styles via media query
if (typeof window !== 'undefined') {
    const style = document.createElement('style');
    style.textContent = `
        @media (max-width: 768px) {
            .desktop-menu {
                display: none !important;
            }
            .mobile-menu {
                display: flex !important;
            }
            .menu-btn {
                display: block !important;
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
    `;
    document.head.appendChild(style);
}

export default Navbar;