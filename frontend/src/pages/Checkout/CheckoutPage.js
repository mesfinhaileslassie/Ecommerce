import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { createOrder } from '../../redux/slices/orderSlice';
import { fetchCart } from '../../redux/slices/cartSlice';
import toast from 'react-hot-toast';

const CheckoutPage = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { items, totalPrice, loading: cartLoading } = useSelector((state) => state.cart);
    const { user, token } = useSelector((state) => state.auth);
    const { loading: orderLoading } = useSelector((state) => state.orders);

    const [shippingAddress, setShippingAddress] = useState({
        fullName: user?.name || '',
        address: '',
        city: '',
        postalCode: '',
        country: '',
        phone: '',
    });
    const [paymentMethod, setPaymentMethod] = useState('Credit Card');
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        if (token && user) {
            dispatch(fetchCart());
        }
    }, [dispatch, token, user]);

    const handleChange = (e) => {
        setShippingAddress({
            ...shippingAddress,
            [e.target.name]: e.target.value,
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // Validate shipping address
        if (!shippingAddress.fullName || !shippingAddress.address || !shippingAddress.city || 
            !shippingAddress.postalCode || !shippingAddress.country || !shippingAddress.phone) {
            toast.error('Please fill in all shipping address fields');
            return;
        }

        if (items.length === 0) {
            toast.error('Your cart is empty');
            return;
        }

        setSubmitting(true);

        try {
            const orderData = {
                shippingAddress: {
                    fullName: shippingAddress.fullName,
                    address: shippingAddress.address,
                    city: shippingAddress.city,
                    postalCode: shippingAddress.postalCode,
                    country: shippingAddress.country,
                    phone: shippingAddress.phone
                },
                paymentMethod: paymentMethod
            };

            console.log('Sending order:', orderData);
            
            const result = await dispatch(createOrder(orderData));
            console.log('Order result:', result);
            
            if (result.error) {
                toast.error(result.error.message || 'Order failed');
            } else {
                toast.success('Order placed successfully!');
                navigate('/orders');
            }
        } catch (error) {
            console.error('Order error:', error);
            toast.error(error.response?.data?.message || 'Failed to place order');
        } finally {
            setSubmitting(false);
        }
    };

    if (!user) {
        return (
            <div style={styles.center}>
                <h2>Please login to checkout</h2>
                <button onClick={() => navigate('/login')} style={styles.loginBtn}>
                    Login
                </button>
            </div>
        );
    }

    if (cartLoading) {
        return (
            <div style={styles.center}>
                <h2>Loading cart...</h2>
            </div>
        );
    }

    if (items.length === 0) {
        return (
            <div style={styles.center}>
                <h2>Your cart is empty</h2>
                <button onClick={() => navigate('/products')} style={styles.shopBtn}>
                    Continue Shopping
                </button>
            </div>
        );
    }

    return (
        <div style={styles.container}>
            <h1 style={styles.title}>Checkout</h1>
            
            <div style={styles.checkoutContainer}>
                <form onSubmit={handleSubmit} style={styles.form}>
                    <h2>Shipping Information</h2>
                    
                    <input
                        type="text"
                        name="fullName"
                        placeholder="Full Name"
                        value={shippingAddress.fullName}
                        onChange={handleChange}
                        required
                        style={styles.input}
                    />
                    
                    <input
                        type="text"
                        name="address"
                        placeholder="Address"
                        value={shippingAddress.address}
                        onChange={handleChange}
                        required
                        style={styles.input}
                    />
                    
                    <input
                        type="text"
                        name="city"
                        placeholder="City"
                        value={shippingAddress.city}
                        onChange={handleChange}
                        required
                        style={styles.input}
                    />
                    
                    <input
                        type="text"
                        name="postalCode"
                        placeholder="Postal Code"
                        value={shippingAddress.postalCode}
                        onChange={handleChange}
                        required
                        style={styles.input}
                    />
                    
                    <input
                        type="text"
                        name="country"
                        placeholder="Country"
                        value={shippingAddress.country}
                        onChange={handleChange}
                        required
                        style={styles.input}
                    />
                    
                    <input
                        type="tel"
                        name="phone"
                        placeholder="Phone Number"
                        value={shippingAddress.phone}
                        onChange={handleChange}
                        required
                        style={styles.input}
                    />
                    
                    <h2>Payment Method</h2>
                    
                    <div style={styles.radioGroup}>
                        <label style={styles.radioLabel}>
                            <input
                                type="radio"
                                value="Credit Card"
                                checked={paymentMethod === 'Credit Card'}
                                onChange={(e) => setPaymentMethod(e.target.value)}
                            />
                            Credit Card
                        </label>
                        <label style={styles.radioLabel}>
                            <input
                                type="radio"
                                value="PayPal"
                                checked={paymentMethod === 'PayPal'}
                                onChange={(e) => setPaymentMethod(e.target.value)}
                            />
                            PayPal
                        </label>
                        <label style={styles.radioLabel}>
                            <input
                                type="radio"
                                value="Cash on Delivery"
                                checked={paymentMethod === 'Cash on Delivery'}
                                onChange={(e) => setPaymentMethod(e.target.value)}
                            />
                            Cash on Delivery
                        </label>
                    </div>
                    
                    <button 
                        type="submit" 
                        style={styles.placeOrderBtn}
                        disabled={submitting || orderLoading}
                    >
                        {submitting || orderLoading ? 'Placing Order...' : 'Place Order'}
                    </button>
                </form>
                
                <div style={styles.orderSummary}>
                    <h2>Order Summary</h2>
                    {items.map((item, index) => (
                        <div key={index} style={styles.orderItem}>
                            <span>{item.name} x {item.quantity}</span>
                            <span>${(item.price * item.quantity).toFixed(2)}</span>
                        </div>
                    ))}
                    <hr style={styles.divider} />
                    <div style={styles.total}>
                        <strong>Total:</strong>
                        <strong>${totalPrice.toFixed(2)}</strong>
                    </div>
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
    },
    checkoutContainer: {
        display: 'grid',
        gridTemplateColumns: '1fr 350px',
        gap: '30px',
    },
    form: {
        backgroundColor: '#fff',
        padding: '30px',
        borderRadius: '8px',
    },
    input: {
        width: '100%',
        padding: '10px',
        marginBottom: '15px',
        border: '1px solid #ddd',
        borderRadius: '5px',
        fontSize: '16px',
    },
    radioGroup: {
        marginBottom: '20px',
    },
    radioLabel: {
        display: 'block',
        marginBottom: '10px',
        cursor: 'pointer',
    },
    placeOrderBtn: {
        width: '100%',
        padding: '12px',
        backgroundColor: '#28a745',
        color: '#fff',
        border: 'none',
        borderRadius: '5px',
        fontSize: '16px',
        cursor: 'pointer',
    },
    orderSummary: {
        backgroundColor: '#fff',
        padding: '30px',
        borderRadius: '8px',
        height: 'fit-content',
    },
    orderItem: {
        display: 'flex',
        justifyContent: 'space-between',
        marginBottom: '10px',
    },
    divider: {
        margin: '15px 0',
        border: 'none',
        borderTop: '1px solid #eee',
    },
    total: {
        display: 'flex',
        justifyContent: 'space-between',
        fontSize: '1.2rem',
    },
    center: {
        textAlign: 'center',
        padding: '50px',
    },
    loginBtn: {
        padding: '10px 30px',
        backgroundColor: '#007bff',
        color: '#fff',
        border: 'none',
        borderRadius: '5px',
        cursor: 'pointer',
        marginTop: '20px',
    },
    shopBtn: {
        padding: '10px 30px',
        backgroundColor: '#007bff',
        color: '#fff',
        border: 'none',
        borderRadius: '5px',
        cursor: 'pointer',
        marginTop: '20px',
    },
};

export default CheckoutPage;