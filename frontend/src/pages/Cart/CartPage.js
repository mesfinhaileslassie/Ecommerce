import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { updateCartItem, removeFromCart, clearCart, fetchCart } from '../../redux/slices/cartSlice';
import { FaTrash, FaPlus, FaMinus } from 'react-icons/fa';
import toast from 'react-hot-toast';

const CartPage = () => {
    const dispatch = useDispatch();
    const { items, totalPrice, itemCount, loading } = useSelector((state) => state.cart);
    const { user, token } = useSelector((state) => state.auth);

    useEffect(() => {
        if (token && user) {
            dispatch(fetchCart());
        }
    }, [dispatch, token, user]);

    const handleUpdateQuantity = async (productId, quantity) => {
        if (quantity < 1) {
            handleRemoveItem(productId);
            return;
        }
        try {
            await dispatch(updateCartItem(productId, quantity)).unwrap();
            toast.success('Cart updated');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Update failed');
        }
    };

    const handleRemoveItem = async (productId) => {
        try {
            await dispatch(removeFromCart(productId)).unwrap();
            toast.success('Item removed');
        } catch (error) {
            toast.error('Remove failed');
        }
    };

    const handleClearCart = async () => {
        if (window.confirm('Clear entire cart?')) {
            await dispatch(clearCart());
            toast.success('Cart cleared');
        }
    };

    if (!user) {
        return (
            <div style={styles.center}>
                <h2>Please login to view your cart</h2>
                <Link to="/login" style={styles.loginBtn}>Login</Link>
            </div>
        );
    }

    if (loading) {
        return (
            <div style={styles.center}>
                <h2>Loading your cart...</h2>
            </div>
        );
    }

    if (items.length === 0) {
        return (
            <div style={styles.center}>
                <h2>Your cart is empty</h2>
                <p>Start shopping to add items to your cart</p>
                <Link to="/products" style={styles.shopBtn}>Continue Shopping</Link>
            </div>
        );
    }

    return (
        <div style={styles.container}>
            <h1 style={styles.title}>Shopping Cart</h1>
            <div style={styles.cartContainer}>
                <div style={styles.itemsSection}>
                    {items.map((item) => (
                        <div key={item.product?._id || item.product} style={styles.cartItem}>
                            <img 
                                src={item.imageUrl || 'https://via.placeholder.com/100'} 
                                alt={item.name}
                                style={styles.itemImage}
                            />
                            <div style={styles.itemDetails}>
                                <h3>{item.name}</h3>
                                <p style={styles.itemPrice}>${item.price.toFixed(2)}</p>
                            </div>
                            <div style={styles.quantityControls}>
                                <button 
                                    onClick={() => handleUpdateQuantity(item.product?._id || item.product, item.quantity - 1)}
                                    style={styles.qtyBtn}
                                >
                                    <FaMinus />
                                </button>
                                <span style={styles.quantity}>{item.quantity}</span>
                                <button 
                                    onClick={() => handleUpdateQuantity(item.product?._id || item.product, item.quantity + 1)}
                                    style={styles.qtyBtn}
                                >
                                    <FaPlus />
                                </button>
                            </div>
                            <div style={styles.itemTotal}>
                                <strong>${(item.price * item.quantity).toFixed(2)}</strong>
                            </div>
                            <button 
                                onClick={() => handleRemoveItem(item.product?._id || item.product)}
                                style={styles.removeBtn}
                            >
                                <FaTrash />
                            </button>
                        </div>
                    ))}
                </div>
                
                <div style={styles.summarySection}>
                    <h2>Order Summary</h2>
                    <div style={styles.summaryRow}>
                        <span>Items ({itemCount}):</span>
                        <span>${totalPrice.toFixed(2)}</span>
                    </div>
                    <div style={styles.summaryRow}>
                        <span>Shipping:</span>
                        <span>Free</span>
                    </div>
                    <hr style={styles.divider} />
                    <div style={styles.summaryTotal}>
                        <strong>Total:</strong>
                        <strong>${totalPrice.toFixed(2)}</strong>
                    </div>
                    <Link to="/checkout" style={styles.checkoutBtn}>
                        Proceed to Checkout
                    </Link>
                    <button onClick={handleClearCart} style={styles.clearBtn}>
                        Clear Cart
                    </button>
                </div>
            </div>
        </div>
    );
};

const styles = {
    container: {
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '20px',
    },
    title: {
        marginBottom: '30px',
        color: '#333',
    },
    cartContainer: {
        display: 'grid',
        gridTemplateColumns: '1fr 320px',
        gap: '30px',
    },
    itemsSection: {
        backgroundColor: '#fff',
        borderRadius: '8px',
        padding: '20px',
    },
    cartItem: {
        display: 'flex',
        alignItems: 'center',
        padding: '15px',
        borderBottom: '1px solid #eee',
        gap: '15px',
    },
    itemImage: {
        width: '80px',
        height: '80px',
        objectFit: 'cover',
        borderRadius: '8px',
    },
    itemDetails: {
        flex: 1,
    },
    itemPrice: {
        color: '#007bff',
        fontWeight: 'bold',
    },
    quantityControls: {
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
    },
    qtyBtn: {
        width: '30px',
        height: '30px',
        borderRadius: '5px',
        border: '1px solid #ddd',
        backgroundColor: '#f5f5f5',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
    },
    quantity: {
        minWidth: '30px',
        textAlign: 'center',
    },
    itemTotal: {
        minWidth: '80px',
        textAlign: 'right',
    },
    removeBtn: {
        backgroundColor: 'transparent',
        border: 'none',
        color: '#dc3545',
        cursor: 'pointer',
        fontSize: '1.1rem',
    },
    summarySection: {
        backgroundColor: '#fff',
        borderRadius: '8px',
        padding: '20px',
        height: 'fit-content',
        position: 'sticky',
        top: '80px',
    },
    summaryRow: {
        display: 'flex',
        justifyContent: 'space-between',
        marginBottom: '10px',
    },
    summaryTotal: {
        display: 'flex',
        justifyContent: 'space-between',
        fontSize: '1.2rem',
        marginTop: '10px',
    },
    divider: {
        margin: '15px 0',
        border: 'none',
        borderTop: '1px solid #eee',
    },
    checkoutBtn: {
        display: 'block',
        width: '100%',
        padding: '12px',
        backgroundColor: '#28a745',
        color: '#fff',
        textAlign: 'center',
        textDecoration: 'none',
        borderRadius: '5px',
        marginTop: '20px',
        border: 'none',
        cursor: 'pointer',
    },
    clearBtn: {
        width: '100%',
        padding: '12px',
        backgroundColor: '#dc3545',
        color: '#fff',
        border: 'none',
        borderRadius: '5px',
        marginTop: '10px',
        cursor: 'pointer',
    },
    center: {
        textAlign: 'center',
        padding: '50px',
    },
    loginBtn: {
        display: 'inline-block',
        marginTop: '20px',
        padding: '10px 30px',
        backgroundColor: '#007bff',
        color: '#fff',
        textDecoration: 'none',
        borderRadius: '5px',
    },
    shopBtn: {
        display: 'inline-block',
        marginTop: '20px',
        padding: '10px 30px',
        backgroundColor: '#007bff',
        color: '#fff',
        textDecoration: 'none',
        borderRadius: '5px',
    },
};

export default CartPage;