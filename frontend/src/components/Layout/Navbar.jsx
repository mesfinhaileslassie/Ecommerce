import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { FaShoppingCart, FaUser, FaTachometerAlt } from 'react-icons/fa';
import { logout } from '../../redux/slices/authSlice';
import { fetchCart } from '../../redux/slices/cartSlice';
import toast from 'react-hot-toast';

const Navbar = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
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
    };

    return (
        <nav style={styles.navbar}>
            <div style={styles.container}>
                <Link to="/" style={styles.logo}>
                    🛍️ E-Shop
                </Link>

                <div style={styles.navLinks}>
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

                    {user ? (
                        <>
                            <Link to="/profile" style={styles.userLink}>
                                <FaUser /> {user.name}
                            </Link>
                            <Link to="/orders" style={styles.link}>
                                Orders
                            </Link>
                            
                            {/* Admin Dashboard Link - Only visible to admin users */}
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
                            <Link to="/register" style={styles.link}>
                                Register
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
        padding: '1rem 0',
        position: 'sticky',
        top: 0,
        zIndex: 1000,
        boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
    },
    container: {
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '0 20px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
    },
    logo: {
        fontSize: '1.5rem',
        fontWeight: 'bold',
        color: '#fff',
        textDecoration: 'none',
        transition: 'opacity 0.3s',
    },
    navLinks: {
        display: 'flex',
        gap: '1.5rem',
        alignItems: 'center',
        flexWrap: 'wrap',
    },
    link: {
        color: '#fff',
        textDecoration: 'none',
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        transition: 'color 0.3s',
        padding: '5px 0',
    },
    userLink: {
        color: '#fff',
        textDecoration: 'none',
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        transition: 'color 0.3s',
        padding: '5px 0',
        borderBottom: '2px solid transparent',
    },
    adminLink: {
        color: '#ffc107',
        textDecoration: 'none',
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        transition: 'color 0.3s',
        padding: '5px 0',
        fontWeight: '500',
    },
    cartLink: {
        color: '#fff',
        textDecoration: 'none',
        position: 'relative',
        fontSize: '1.2rem',
        transition: 'color 0.3s',
        padding: '5px 0',
    },
    cartBadge: {
        position: 'absolute',
        top: '-8px',
        right: '-12px',
        backgroundColor: '#dc3545',
        color: '#fff',
        borderRadius: '50%',
        padding: '2px 6px',
        fontSize: '12px',
        fontWeight: 'bold',
    },
    logoutBtn: {
        backgroundColor: 'transparent',
        border: '1px solid #dc3545',
        color: '#dc3545',
        padding: '5px 15px',
        borderRadius: '5px',
        cursor: 'pointer',
        transition: 'all 0.3s',
        fontSize: '14px',
    },
};

export default Navbar;