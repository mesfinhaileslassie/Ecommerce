import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { FaShoppingCart, FaUser } from 'react-icons/fa';
import { logout } from '../../redux/slices/authSlice';
import toast from 'react-hot-toast';

const Navbar = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { user } = useSelector((state) => state.auth);
    const { itemCount } = useSelector((state) => state.cart);

    const handleLogout = () => {
        dispatch(logout());
        toast.success('Logged out successfully');
        navigate('/');
    };

    return (
        <nav style={{
            backgroundColor: '#1a1a2e',
            padding: '1rem 0',
            position: 'sticky',
            top: 0,
            zIndex: 1000
        }}>
            <div style={{
                maxWidth: '1200px',
                margin: '0 auto',
                padding: '0 20px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
            }}>
                <Link to="/" style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#fff', textDecoration: 'none' }}>
                    🛍️ E-Shop
                </Link>

                <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
                    <Link to="/products" style={{ color: '#fff', textDecoration: 'none' }}>
                        Products
                    </Link>
                    
                    {user && (
                        <Link to="/cart" style={{ color: '#fff', textDecoration: 'none', position: 'relative' }}>
                            <FaShoppingCart />
                            {itemCount > 0 && (
                                <span style={{
                                    position: 'absolute',
                                    top: '-8px',
                                    right: '-12px',
                                    backgroundColor: '#dc3545',
                                    color: '#fff',
                                    borderRadius: '50%',
                                    padding: '2px 6px',
                                    fontSize: '12px'
                                }}>{itemCount}</span>
                            )}
                        </Link>
                    )}

                    {user ? (
                        <>
                            <Link to="/profile" style={{ color: '#fff', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '5px' }}>
                                <FaUser /> {user.name}
                            </Link>
                            <Link to="/orders" style={{ color: '#fff', textDecoration: 'none' }}>
                                Orders
                            </Link>
                            <button onClick={handleLogout} style={{
                                backgroundColor: 'transparent',
                                border: '1px solid #dc3545',
                                color: '#dc3545',
                                padding: '5px 15px',
                                borderRadius: '5px',
                                cursor: 'pointer'
                            }}>
                                Logout
                            </button>
                        </>
                    ) : (
                        <>
                            <Link to="/login" style={{ color: '#fff', textDecoration: 'none' }}>
                                Login
                            </Link>
                            <Link to="/register" style={{ color: '#fff', textDecoration: 'none' }}>
                                Register
                            </Link>
                        </>
                    )}
                </div>
            </div>
        </nav>
    );
};

export default Navbar;