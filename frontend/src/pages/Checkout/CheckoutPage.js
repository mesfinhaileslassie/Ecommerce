import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { createOrder } from '../../redux/slices/orderSlice';
import { fetchCart, clearCart } from '../../redux/slices/cartSlice';
import { validateCoupon, clearCoupon } from '../../redux/slices/couponSlice';
import CouponInput from '../../components/Checkout/CouponInput';
import { FaSpinner, FaArrowLeft, FaCheckCircle } from 'react-icons/fa';
import toast from 'react-hot-toast';

const CheckoutPage = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { items, totalPrice, loading: cartLoading } = useSelector((state) => state.cart);
    const { user, token } = useSelector((state) => state.auth);
    const { appliedCoupon, discountAmount } = useSelector((state) => state.coupons);
    const { loading: orderLoading } = useSelector((state) => state.orders);
    
    const [shippingAddress, setShippingAddress] = useState({
        fullName: user?.name || '',
        address: '',
        city: '',
        postalCode: '',
        country: '',
        phone: '',
    });
    const [paymentMethod, setPaymentMethod] = useState('Cash on Delivery');
    const [submitting, setSubmitting] = useState(false);
    const [savedAddresses, setSavedAddresses] = useState([]);
    const [useSavedAddress, setUseSavedAddress] = useState(false);
    const [selectedAddressId, setSelectedAddressId] = useState('');

    useEffect(() => {
        if (token && user) {
            dispatch(fetchCart());
            fetchSavedAddresses();
        }
    }, [dispatch, token, user]);

    const fetchSavedAddresses = async () => {
        try {
            const response = await fetch('http://localhost:5000/api/addresses', {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            const data = await response.json();
            if (data.success && data.addresses) {
                setSavedAddresses(data.addresses);
                const defaultAddress = data.addresses.find(addr => addr.isDefault);
                if (defaultAddress) {
                    setSelectedAddressId(defaultAddress._id);
                    setShippingAddress({
                        fullName: defaultAddress.fullName,
                        address: defaultAddress.address,
                        city: defaultAddress.city,
                        postalCode: defaultAddress.postalCode,
                        country: defaultAddress.country,
                        phone: defaultAddress.phone,
                    });
                    setUseSavedAddress(true);
                }
            }
        } catch (error) {
            console.error('Error fetching addresses:', error);
        }
    };

    const handleAddressSelect = async (addressId) => {
        setSelectedAddressId(addressId);
        const selected = savedAddresses.find(addr => addr._id === addressId);
        if (selected) {
            setShippingAddress({
                fullName: selected.fullName,
                address: selected.address,
                city: selected.city,
                postalCode: selected.postalCode,
                country: selected.country,
                phone: selected.phone,
            });
        }
    };

    const handleChange = (e) => {
        setShippingAddress({
            ...shippingAddress,
            [e.target.name]: e.target.value,
        });
    };

    // Add this state and function in CheckoutPage
const [discount, setDiscount] = useState(0);

const handleDiscountChange = (amount) => {
    setDiscount(amount);
};

    const calculateFinalTotal = () => {
        return totalPrice - discountAmount;
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
                paymentMethod: paymentMethod,
                totalAmount: calculateFinalTotal(),
                discountAmount: discountAmount,
                couponCode: appliedCoupon?.code || null
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
                <FaSpinner style={styles.spinner} />
                <p>Loading cart...</p>
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

    const finalTotal = calculateFinalTotal();

    return (
        <div style={styles.container}>
            <button onClick={() => navigate('/cart')} style={styles.backBtn}>
                <FaArrowLeft /> Back to Cart
            </button>
            
            <h1 style={styles.title}>Checkout</h1>
            
            <div style={styles.checkoutContainer}>
                <form onSubmit={handleSubmit} style={styles.form}>
                    {/* Saved Addresses */}
                    {savedAddresses.length > 0 && (
                        <div style={styles.section}>
                            <h2>Saved Addresses</h2>
                            <div style={styles.radioGroup}>
                                <label style={styles.radioLabel}>
                                    <input
                                        type="radio"
                                        checked={!useSavedAddress}
                                        onChange={() => {
                                            setUseSavedAddress(false);
                                            setShippingAddress({
                                                fullName: user?.name || '',
                                                address: '',
                                                city: '',
                                                postalCode: '',
                                                country: '',
                                                phone: '',
                                            });
                                        }}
                                    />
                                    Enter new address
                                </label>
                                <label style={styles.radioLabel}>
                                    <input
                                        type="radio"
                                        checked={useSavedAddress}
                                        onChange={() => setUseSavedAddress(true)}
                                    />
                                    Use saved address
                                </label>
                            </div>
                            
                            {useSavedAddress && (
                                <select
                                    value={selectedAddressId}
                                    onChange={(e) => handleAddressSelect(e.target.value)}
                                    style={styles.select}
                                >
                                    <option value="">Select an address</option>
                                    {savedAddresses.map(addr => (
                                        <option key={addr._id} value={addr._id}>
                                            {addr.fullName} - {addr.address}, {addr.city}
                                        </option>
                                    ))}
                                </select>
                            )}
                        </div>
                    )}
                    
                    {/* Shipping Information */}
                    <div style={styles.section}>
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
                    </div>
                    
                    {/* Payment Method */}
                    <div style={styles.section}>
                        <h2>Payment Method</h2>
                        
                        <div style={styles.paymentOptions}>
                            <label style={styles.paymentLabel}>
                                <input
                                    type="radio"
                                    value="Credit Card"
                                    checked={paymentMethod === 'Credit Card'}
                                    onChange={(e) => setPaymentMethod(e.target.value)}
                                />
                                <div style={styles.paymentCard}>
                                    <span>💳</span>
                                    <span>Credit Card</span>
                                </div>
                            </label>
                            
                            <label style={styles.paymentLabel}>
                                <input
                                    type="radio"
                                    value="PayPal"
                                    checked={paymentMethod === 'PayPal'}
                                    onChange={(e) => setPaymentMethod(e.target.value)}
                                />
                                <div style={styles.paymentCard}>
                                    <span>💰</span>
                                    <span>PayPal</span>
                                </div>
                            </label>
                            
                            <label style={styles.paymentLabel}>
                                <input
                                    type="radio"
                                    value="Cash on Delivery"
                                    checked={paymentMethod === 'Cash on Delivery'}
                                    onChange={(e) => setPaymentMethod(e.target.value)}
                                />
                                <div style={styles.paymentCard}>
                                    <span>💵</span>
                                    <span>Cash on Delivery</span>
                                </div>
                            </label>
                        </div>
                    </div>
                    
                    <button 
                        type="submit" 
                        style={styles.placeOrderBtn}
                        disabled={submitting || orderLoading}
                    >
                        {submitting || orderLoading ? (
                            <><FaSpinner style={styles.spinnerIcon} /> Placing Order...</>
                        ) : (
                            <><FaCheckCircle /> Place Order</>
                        )}
                    </button>
                </form>
                
                {/* Order Summary */}
                <div style={styles.summary}>
                    <h2 style={styles.summaryTitle}>Order Summary</h2>
                    
                    <div style={styles.orderItems}>
                        {items.map((item, index) => (
                            <div key={index} style={styles.orderItem}>
                                <img 
                                    src={item.imageUrl || 'https://via.placeholder.com/60'} 
                                    alt={item.name}
                                    style={styles.itemImage}
                                />
                                <div style={styles.itemInfo}>
                                    <p style={styles.itemName}>{item.name}</p>
                                    <p style={styles.itemQty}>Qty: {item.quantity}</p>
                                </div>
                                <div style={styles.itemPrice}>
                                    ${(item.price * item.quantity).toFixed(2)}
                                </div>
                            </div>
                        ))}
                    </div>
                    
                    <div style={styles.couponSection}>
                       <CouponInput cartTotal={totalPrice} onDiscountChange={handleDiscountChange} />
                    </div>
                    
                    <div style={styles.priceDetails}>
                        <div style={styles.priceRow}>
                            <span>Subtotal:</span>
                            <span>${totalPrice.toFixed(2)}</span>
                        </div>
                        <div style={styles.priceRow}>
                            <span>Shipping:</span>
                            <span>Free</span>
                        </div>
                        {discountAmount > 0 && (
                            <div style={styles.discountRow}>
                                <span>Discount:</span>
                                <span style={{ color: '#10b981' }}>-${discountAmount.toFixed(2)}</span>
                            </div>
                        )}
                        <div style={styles.divider}></div>
                        <div style={styles.totalRow}>
                            <strong>Total:</strong>
                            <strong style={styles.totalAmount}>${finalTotal.toFixed(2)}</strong>
                        </div>
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
    backBtn: {
        display: 'inline-flex',
        alignItems: 'center',
        gap: '8px',
        background: 'none',
        border: 'none',
        color: '#6366f1',
        cursor: 'pointer',
        marginBottom: '20px',
        fontSize: '0.9rem',
    },
    title: {
        fontSize: '2rem',
        marginBottom: '30px',
        color: '#333',
    },
    checkoutContainer: {
        display: 'grid',
        gridTemplateColumns: '1fr 380px',
        gap: '30px',
    },
    form: {
        display: 'flex',
        flexDirection: 'column',
        gap: '25px',
    },
    section: {
        backgroundColor: '#fff',
        borderRadius: '1rem',
        padding: '1.5rem',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    },
    input: {
        width: '100%',
        padding: '12px',
        marginBottom: '15px',
        border: '1px solid #ddd',
        borderRadius: '0.5rem',
        fontSize: '1rem',
        transition: 'border-color 0.3s',
    },
    radioGroup: {
        display: 'flex',
        gap: '20px',
        marginBottom: '15px',
    },
    radioLabel: {
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        cursor: 'pointer',
    },
    select: {
        width: '100%',
        padding: '12px',
        border: '1px solid #ddd',
        borderRadius: '0.5rem',
        fontSize: '1rem',
        backgroundColor: '#fff',
    },
    paymentOptions: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
        gap: '15px',
    },
    paymentLabel: {
        cursor: 'pointer',
    },
    paymentCard: {
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        padding: '12px',
        border: '2px solid #e5e7eb',
        borderRadius: '0.5rem',
        transition: 'all 0.3s',
    },
    placeOrderBtn: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '10px',
        padding: '14px',
        backgroundColor: '#28a745',
        color: '#fff',
        border: 'none',
        borderRadius: '0.5rem',
        fontSize: '1rem',
        fontWeight: '600',
        cursor: 'pointer',
        transition: 'background-color 0.3s',
    },
    summary: {
        backgroundColor: '#fff',
        borderRadius: '1rem',
        padding: '1.5rem',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        height: 'fit-content',
        position: 'sticky',
        top: '20px',
    },
    summaryTitle: {
        fontSize: '1.2rem',
        marginBottom: '1rem',
        paddingBottom: '0.5rem',
        borderBottom: '2px solid #f0f0f0',
    },
    orderItems: {
        maxHeight: '300px',
        overflowY: 'auto',
        marginBottom: '1rem',
    },
    orderItem: {
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        padding: '10px 0',
        borderBottom: '1px solid #f0f0f0',
    },
    itemImage: {
        width: '50px',
        height: '50px',
        objectFit: 'cover',
        borderRadius: '0.5rem',
    },
    itemInfo: {
        flex: 1,
    },
    itemName: {
        fontSize: '0.9rem',
        fontWeight: '500',
        marginBottom: '4px',
    },
    itemQty: {
        fontSize: '0.75rem',
        color: '#666',
    },
    itemPrice: {
        fontWeight: '600',
        color: '#6366f1',
    },
    couponSection: {
        margin: '1rem 0',
        padding: '1rem 0',
        borderTop: '1px solid #f0f0f0',
        borderBottom: '1px solid #f0f0f0',
    },
    priceDetails: {
        marginTop: '1rem',
    },
    priceRow: {
        display: 'flex',
        justifyContent: 'space-between',
        marginBottom: '10px',
        fontSize: '0.9rem',
    },
    discountRow: {
        display: 'flex',
        justifyContent: 'space-between',
        marginBottom: '10px',
        fontSize: '0.9rem',
        color: '#10b981',
    },
    divider: {
        height: '1px',
        backgroundColor: '#e5e7eb',
        margin: '12px 0',
    },
    totalRow: {
        display: 'flex',
        justifyContent: 'space-between',
        fontSize: '1.2rem',
    },
    totalAmount: {
        color: '#28a745',
        fontSize: '1.3rem',
    },
    spinner: {
        animation: 'spin 1s linear infinite',
        fontSize: '2rem',
        color: '#6366f1',
        marginBottom: '1rem',
    },
    spinnerIcon: {
        animation: 'spin 1s linear infinite',
    },
    center: {
        textAlign: 'center',
        padding: '50px',
    },
    loginBtn: {
        padding: '10px 30px',
        backgroundColor: '#6366f1',
        color: '#fff',
        border: 'none',
        borderRadius: '0.5rem',
        cursor: 'pointer',
        marginTop: '20px',
    },
    shopBtn: {
        padding: '10px 30px',
        backgroundColor: '#6366f1',
        color: '#fff',
        border: 'none',
        borderRadius: '0.5rem',
        cursor: 'pointer',
        marginTop: '20px',
    },
};

// Add keyframes for spinner animation
const styleSheet = document.createElement("style");
styleSheet.textContent = `
    @keyframes spin {
        from { transform: rotate(0deg); }
        to { transform: rotate(360deg); }
    }
    
    input:focus, select:focus {
        outline: none;
        border-color: #6366f1;
        box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
    }
    
    .payment-label:hover .payment-card {
        border-color: #6366f1;
        background-color: #f8fafc;
    }
    
    input[type="radio"]:checked + .payment-card {
        border-color: #6366f1;
        background-color: #f0f9ff;
    }
`;
document.head.appendChild(styleSheet);

export default CheckoutPage;