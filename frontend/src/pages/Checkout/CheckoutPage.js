import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useLocation } from 'react-router-dom';
import { createOrder } from '../../redux/slices/orderSlice';
import { fetchCart, clearCart, removeFromCart } from '../../redux/slices/cartSlice';
import { validateCoupon, clearCoupon } from '../../redux/slices/couponSlice';
import CouponInput from '../../components/Checkout/CouponInput';
import PaymentInstructions from '../../components/Checkout/PaymentInstructions';
import { FaSpinner, FaArrowLeft, FaCheckCircle, FaMobile, FaUniversity, FaMoneyBillWave, FaShieldAlt, FaTrash } from 'react-icons/fa';
import toast from 'react-hot-toast';
import api from '../../services/api';

const CheckoutPage = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const location = useLocation();
    const { items, totalPrice, loading: cartLoading } = useSelector((state) => state.cart);
    const { user, token } = useSelector((state) => state.auth);
    const { appliedCoupon, discountAmount } = useSelector((state) => state.coupons);
    const { loading: orderLoading } = useSelector((state) => state.orders);
    
    const [checkoutItems, setCheckoutItems] = useState([]);
    const [checkoutTotal, setCheckoutTotal] = useState(0);
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
    const [orderCreated, setOrderCreated] = useState(false);
    const [createdOrder, setCreatedOrder] = useState(null);
    const [paymentConfirmed, setPaymentConfirmed] = useState(false);
    const [showPaymentDetails, setShowPaymentDetails] = useState(false);
    const [accountNumber, setAccountNumber] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [referenceNumber, setReferenceNumber] = useState('');
    const [phoneNumberError, setPhoneNumberError] = useState('');
    const [accountNumberError, setAccountNumberError] = useState('');
    const [isProcessingTelebirr, setIsProcessingTelebirr] = useState(false);

    // Load selected items from cart page
    useEffect(() => {
        const selectedItemsFromCart = location.state?.selectedItems || 
                                       JSON.parse(sessionStorage.getItem('checkoutItems') || '[]');
        
        if (selectedItemsFromCart.length > 0) {
            setCheckoutItems(selectedItemsFromCart);
            // Clear session storage after use
            sessionStorage.removeItem('checkoutItems');
        } else {
            setCheckoutItems(items);
        }
    }, [location, items]);

    // Calculate checkout total
    useEffect(() => {
        const total = checkoutItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        setCheckoutTotal(total);
    }, [checkoutItems]);

    useEffect(() => {
        if (token && user) {
            fetchSavedAddresses();
        }
    }, [dispatch, token, user]);

    const fetchSavedAddresses = async () => {
        try {
            const response = await api.get('/addresses');
            if (response.data.success && response.data.addresses) {
                setSavedAddresses(response.data.addresses);
                const defaultAddress = response.data.addresses.find(addr => addr.isDefault);
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

    const handleRemoveItem = async (productId) => {
        // Remove from checkout items
        setCheckoutItems(prev => prev.filter(item => (item.product?._id || item.product) !== productId));
        // Also remove from cart if it exists in cart
        await dispatch(removeFromCart(productId));
        toast.success('Item removed from order');
    };

    const calculateFinalTotal = () => {
        return checkoutTotal - discountAmount;
    };

    // Validation functions
    const validateCBEAccount = (number) => {
        const pattern = /^1000\d{9}$/;
        return pattern.test(number);
    };

    const validatePhoneNumber = (number) => {
        const pattern = /^\+2519\d{8}$/;
        return pattern.test(number);
    };

    const handlePaymentMethodChange = (method) => {
        setPaymentMethod(method);
        setShowPaymentDetails(method === 'CBE Birr' || method === 'Telebirr');
        setAccountNumber('');
        setPhoneNumber('');
        setAccountNumberError('');
        setPhoneNumberError('');
    };

    const handleCreateOrder = async () => {
        // Validate shipping address
        if (!shippingAddress.fullName || !shippingAddress.address || !shippingAddress.city || 
            !shippingAddress.postalCode || !shippingAddress.country || !shippingAddress.phone) {
            toast.error('Please fill in all shipping address fields');
            return;
        }

        // Validate checkout items
        if (checkoutItems.length === 0) {
            toast.error('No items selected for checkout');
            return;
        }

        // Validate payment details for mobile payments
        if (paymentMethod === 'CBE Birr') {
            if (!accountNumber) {
                toast.error('Please enter your CBE Birr account number');
                return;
            }
            if (!validateCBEAccount(accountNumber)) {
                toast.error('Invalid CBE Birr account number. Must start with 1000 followed by 9 digits');
                return;
            }
            if (!phoneNumber) {
                toast.error('Please enter your phone number');
                return;
            }
            if (!validatePhoneNumber(phoneNumber)) {
                toast.error('Invalid phone number format. Use +2519XXXXXXXX');
                return;
            }
        }

        if (paymentMethod === 'Telebirr') {
            if (!phoneNumber) {
                toast.error('Please enter your phone number');
                return;
            }
            if (!validatePhoneNumber(phoneNumber)) {
                toast.error('Invalid phone number format. Use +2519XXXXXXXX');
                return;
            }
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
                totalPrice: calculateFinalTotal(),
                discountAmount: discountAmount,
                couponCode: appliedCoupon?.code || null,
                paymentStatus: 'pending',
                items: checkoutItems.map(item => ({
                    product: item.product?._id || item.product,
                    name: item.name,
                    price: item.price,
                    quantity: item.quantity,
                    imageUrl: item.imageUrl,
                    size: item.size || null
                })),
                paymentDetails: {
                    accountNumber: paymentMethod === 'CBE Birr' ? accountNumber : null,
                    phoneNumber: phoneNumber,
                    referenceNumber: referenceNumber
                }
            };

            const result = await dispatch(createOrder(orderData));
            
            if (result.error) {
                toast.error(result.error.message || 'Order creation failed');
                setSubmitting(false);
                return;
            }
            
            const createdOrderData = result.order;
            setCreatedOrder(createdOrderData);

            // Remove checked out items from cart
            for (const item of checkoutItems) {
                const productId = item.product?._id || item.product;
                await dispatch(removeFromCart(productId));
            }

            // Handle different payment methods
            if (paymentMethod === 'Telebirr') {
                setIsProcessingTelebirr(true);
                try {
                    const telebirrResponse = await api.post('/telebirr/initiate', {
                        orderId: createdOrderData._id,
                        amount: calculateFinalTotal().toFixed(2),
                        subject: `Payment for Order #${createdOrderData._id.slice(-8)}`
                    });
                    
                    if (telebirrResponse.data.success && telebirrResponse.data.toPayUrl) {
                        window.location.href = telebirrResponse.data.toPayUrl;
                    } else {
                        toast.error('Failed to initiate Telebirr payment. Please try again.');
                        setSubmitting(false);
                        setIsProcessingTelebirr(false);
                    }
                } catch (telebirrError) {
                    console.error('Telebirr error:', telebirrError);
                    toast.error(telebirrError.response?.data?.message || 'Failed to connect to Telebirr. Please try again.');
                    setSubmitting(false);
                    setIsProcessingTelebirr(false);
                }
            } else {
                setOrderCreated(true);
                toast.success('Order created! Please complete payment.');
                
                if (paymentMethod === 'Cash on Delivery') {
                    setTimeout(() => {
                        navigate('/orders');
                    }, 3000);
                }
                setSubmitting(false);
            }
        } catch (error) {
            console.error('Order error:', error);
            toast.error(error.response?.data?.message || 'Failed to create order');
            setSubmitting(false);
        }
    };

    const handleConfirmPayment = async () => {
        if (paymentMethod === 'CBE Birr') {
            if (!phoneNumber) {
                toast.error('Please enter your phone number');
                return;
            }
            if (!referenceNumber) {
                toast.error('Please enter the transaction reference number');
                return;
            }
        }

        setSubmitting(true);
        
        try {
            const updateData = {
                paymentStatus: 'paid',
                paymentDetails: {
                    accountNumber: accountNumber,
                    phoneNumber: phoneNumber,
                    referenceNumber: referenceNumber,
                    paidAt: new Date()
                }
            };
            
            await api.put(`/orders/${createdOrder._id}`, updateData);
            
            setPaymentConfirmed(true);
            toast.success('Payment confirmed! Order completed.');
            
            setTimeout(() => {
                navigate('/orders');
            }, 2000);
        } catch (error) {
            console.error('Payment confirmation error:', error);
            toast.error('Failed to confirm payment. Please contact support.');
        } finally {
            setSubmitting(false);
        }
    };

    const isMobilePayment = () => {
        return ['CBE Birr', 'Telebirr', 'Mobile Banking'].includes(paymentMethod);
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
                <p>Loading checkout...</p>
            </div>
        );
    }

    if (checkoutItems.length === 0 && !orderCreated) {
        return (
            <div style={styles.center}>
                <h2>No items selected for checkout</h2>
                <p>Please go back to cart and select items to checkout</p>
                <button onClick={() => navigate('/cart')} style={styles.shopBtn}>
                    Go to Cart
                </button>
            </div>
        );
    }

    const finalTotal = calculateFinalTotal();

    // Show payment instructions after order is created (for CBE Birr)
    if (orderCreated && !paymentConfirmed && isMobilePayment() && paymentMethod !== 'Telebirr') {
        return (
            <div style={styles.container}>
                <button onClick={() => setOrderCreated(false)} style={styles.backBtn}>
                    <FaArrowLeft /> Back to Checkout
                </button>
                
                <div style={styles.paymentContainer}>
                    <h1 style={styles.title}>Complete Payment</h1>
                    <p style={styles.orderInfo}>Order ID: {createdOrder?._id}</p>
                    
                    <PaymentInstructions 
                        paymentMethod={paymentMethod}
                        orderId={createdOrder?._id}
                        totalAmount={finalTotal}
                    />
                    
                    <div style={styles.paymentForm}>
                        <div style={styles.formGroup}>
                            <label style={styles.label}>Phone Number</label>
                            <input
                                type="tel"
                                value={phoneNumber}
                                onChange={(e) => setPhoneNumber(e.target.value)}
                                placeholder="Enter your phone number"
                                style={styles.input}
                                required
                            />
                        </div>
                        
                        <div style={styles.formGroup}>
                            <label style={styles.label}>Transaction Reference Number</label>
                            <input
                                type="text"
                                value={referenceNumber}
                                onChange={(e) => setReferenceNumber(e.target.value)}
                                placeholder="Enter the reference number from your payment"
                                style={styles.input}
                                required
                            />
                        </div>
                        
                        <button 
                            onClick={handleConfirmPayment}
                            style={styles.confirmPaymentBtn}
                            disabled={submitting}
                        >
                            {submitting ? <FaSpinner style={styles.spinnerIcon} /> : <FaCheckCircle />}
                            {submitting ? 'Confirming...' : 'I Have Paid - Confirm Payment'}
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // Show Telebirr processing state
    if (isProcessingTelebirr) {
        return (
            <div style={styles.center}>
                <FaSpinner style={styles.spinner} />
                <h2>Redirecting to Telebirr...</h2>
                <p>Please wait while we redirect you to the Telebirr payment page.</p>
            </div>
        );
    }

    // Show success message after payment
    if (paymentConfirmed) {
        return (
            <div style={styles.center}>
                <FaCheckCircle size={64} color="#10b981" />
                <h2>Payment Successful!</h2>
                <p>Your order has been confirmed and will be processed soon.</p>
                <button onClick={() => navigate('/orders')} style={styles.viewOrdersBtn}>
                    View My Orders
                </button>
            </div>
        );
    }

    return (
        <div style={styles.container}>
            <button onClick={() => navigate('/cart')} style={styles.backBtn}>
                <FaArrowLeft /> Back to Cart
            </button>
            
            <h1 style={styles.title}>Checkout</h1>
            
            <div style={styles.checkoutContainer}>
                <div style={styles.form}>
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
                                    value="Cash on Delivery"
                                    checked={paymentMethod === 'Cash on Delivery'}
                                    onChange={(e) => handlePaymentMethodChange(e.target.value)}
                                />
                                <div style={styles.paymentCard}>
                                    <FaMoneyBillWave size={20} />
                                    <span>Cash on Delivery</span>
                                </div>
                            </label>
                            
                            <label style={styles.paymentLabel}>
                                <input
                                    type="radio"
                                    value="CBE Birr"
                                    checked={paymentMethod === 'CBE Birr'}
                                    onChange={(e) => handlePaymentMethodChange(e.target.value)}
                                />
                                <div style={styles.paymentCard}>
                                    <FaUniversity size={20} />
                                    <span>CBE Birr</span>
                                </div>
                            </label>
                            
                            <label style={styles.paymentLabel}>
                                <input
                                    type="radio"
                                    value="Telebirr"
                                    checked={paymentMethod === 'Telebirr'}
                                    onChange={(e) => handlePaymentMethodChange(e.target.value)}
                                />
                                <div style={styles.paymentCard}>
                                    <FaMobile size={20} />
                                    <span>Telebirr</span>
                                    <span style={styles.paymentBadge}>Auto-Pay</span>
                                </div>
                            </label>
                        </div>
                    </div>

                    {/* Payment Details for CBE Birr */}
                    {showPaymentDetails && paymentMethod === 'CBE Birr' && (
                        <div style={styles.section}>
                            <h2>Payment Details</h2>
                            
                            <div style={styles.formGroup}>
                                <label style={styles.label}>CBE Birr Account Number</label>
                                <input
                                    type="text"
                                    value={accountNumber}
                                    onChange={(e) => {
                                        setAccountNumber(e.target.value);
                                        if (validateCBEAccount(e.target.value)) {
                                            setAccountNumberError('');
                                        } else {
                                            setAccountNumberError('Account number must start with 1000 followed by 9 digits (e.g., 1000123456789)');
                                        }
                                    }}
                                    placeholder="1000123456789"
                                    style={{...styles.input, ...(accountNumberError && styles.inputError)}}
                                />
                                {accountNumberError && <span style={styles.errorText}>{accountNumberError}</span>}
                                <small style={styles.hintText}>Account number must start with 1000 followed by 9 digits (total 13 digits)</small>
                            </div>
                            
                            <div style={styles.formGroup}>
                                <label style={styles.label}>Phone Number</label>
                                <input
                                    type="tel"
                                    value={phoneNumber}
                                    onChange={(e) => {
                                        setPhoneNumber(e.target.value);
                                        if (validatePhoneNumber(e.target.value)) {
                                            setPhoneNumberError('');
                                        } else {
                                            setPhoneNumberError('Phone number must start with +2519 followed by 8 digits (e.g., +251912345678)');
                                        }
                                    }}
                                    placeholder="+251912345678"
                                    style={{...styles.input, ...(phoneNumberError && styles.inputError)}}
                                />
                                {phoneNumberError && <span style={styles.errorText}>{phoneNumberError}</span>}
                                <small style={styles.hintText}>Enter your phone number in international format (+2519XXXXXXXX)</small>
                            </div>
                        </div>
                    )}

                    {/* Phone Number for Telebirr */}
                    {showPaymentDetails && paymentMethod === 'Telebirr' && (
                        <div style={styles.section}>
                            <h2>Telebirr Payment</h2>
                            <div style={styles.telebirrInfo}>
                                <FaShieldAlt size={24} color="#10b981" />
                                <p>You will be redirected to Telebirr secure payment page after order creation.</p>
                            </div>
                            
                            <div style={styles.formGroup}>
                                <label style={styles.label}>Phone Number</label>
                                <input
                                    type="tel"
                                    value={phoneNumber}
                                    onChange={(e) => {
                                        setPhoneNumber(e.target.value);
                                        if (validatePhoneNumber(e.target.value)) {
                                            setPhoneNumberError('');
                                        } else {
                                            setPhoneNumberError('Phone number must start with +2519 followed by 8 digits (e.g., +251912345678)');
                                        }
                                    }}
                                    placeholder="+251912345678"
                                    style={{...styles.input, ...(phoneNumberError && styles.inputError)}}
                                    required
                                />
                                {phoneNumberError && <span style={styles.errorText}>{phoneNumberError}</span>}
                                <small style={styles.hintText}>Enter the phone number registered with Telebirr</small>
                            </div>
                        </div>
                    )}
                    
                    <button 
                        onClick={handleCreateOrder}
                        style={styles.placeOrderBtn}
                        disabled={submitting || orderLoading || checkoutItems.length === 0}
                    >
                        {submitting || orderLoading ? (
                            <><FaSpinner style={styles.spinnerIcon} /> Creating Order...</>
                        ) : (
                            <><FaCheckCircle /> Place Order (${finalTotal.toFixed(2)})</>
                        )}
                    </button>
                </div>
                
                {/* Order Summary */}
                <div style={styles.summary}>
                    <h2 style={styles.summaryTitle}>Order Summary</h2>
                    
                    <div style={styles.orderItems}>
                        {checkoutItems.map((item, index) => (
                            <div key={index} style={styles.orderItem}>
                                <img 
                                    src={item.imageUrl || 'https://via.placeholder.com/60'} 
                                    alt={item.name}
                                    style={styles.itemImage}
                                />
                                <div style={styles.itemInfo}>
                                    <p style={styles.itemName}>{item.name}</p>
                                    {item.size && <p style={styles.itemSize}>Size: {item.size}</p>}
                                    <p style={styles.itemQty}>Qty: {item.quantity}</p>
                                </div>
                                <div style={styles.itemPrice}>
                                    ${(item.price * item.quantity).toFixed(2)}
                                </div>
                                <button 
                                    onClick={() => handleRemoveItem(item.product?._id || item.product)}
                                    style={styles.removeItemBtn}
                                    title="Remove item"
                                >
                                    <FaTrash />
                                </button>
                            </div>
                        ))}
                    </div>
                    
                    <div style={styles.couponSection}>
                        <CouponInput cartTotal={checkoutTotal} />
                    </div>
                    
                    <div style={styles.priceDetails}>
                        <div style={styles.priceRow}>
                            <span>Subtotal ({checkoutItems.length} items):</span>
                            <span>${checkoutTotal.toFixed(2)}</span>
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
    inputError: {
        borderColor: '#dc3545',
        backgroundColor: '#fff8f8',
    },
    errorText: {
        color: '#dc3545',
        fontSize: '0.75rem',
        marginTop: '5px',
        display: 'block',
    },
    hintText: {
        color: '#6c757d',
        fontSize: '0.7rem',
        marginTop: '5px',
        display: 'block',
    },
    radioGroup: {
        display: 'flex',
        gap: '20px',
        marginBottom: '15px',
        flexWrap: 'wrap',
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
        gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
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
        backgroundColor: '#fff',
        position: 'relative',
    },
    paymentBadge: {
        position: 'absolute',
        top: '-8px',
        right: '-8px',
        backgroundColor: '#10b981',
        color: '#fff',
        fontSize: '10px',
        padding: '2px 6px',
        borderRadius: '20px',
    },
    telebirrInfo: {
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        backgroundColor: '#f0fdf4',
        padding: '12px',
        borderRadius: '0.5rem',
        marginBottom: '15px',
        border: '1px solid #bbf7d0',
    },
    formGroup: {
        marginBottom: '15px',
    },
    label: {
        display: 'block',
        marginBottom: '5px',
        fontWeight: '500',
        color: '#555',
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
        width: '100%',
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
        maxHeight: '400px',
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
    itemSize: {
        fontSize: '0.75rem',
        color: '#666',
    },
    itemQty: {
        fontSize: '0.75rem',
        color: '#666',
    },
    itemPrice: {
        fontWeight: '600',
        color: '#6366f1',
    },
    removeItemBtn: {
        background: 'none',
        border: 'none',
        color: '#dc3545',
        cursor: 'pointer',
        padding: '5px',
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
    paymentContainer: {
        maxWidth: '600px',
        margin: '0 auto',
    },
    paymentForm: {
        backgroundColor: '#fff',
        borderRadius: '1rem',
        padding: '1.5rem',
        marginTop: '20px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    },
    confirmPaymentBtn: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '10px',
        padding: '14px',
        backgroundColor: '#10b981',
        color: '#fff',
        border: 'none',
        borderRadius: '0.5rem',
        fontSize: '1rem',
        fontWeight: '600',
        cursor: 'pointer',
        width: '100%',
        marginTop: '10px',
    },
    orderInfo: {
        textAlign: 'center',
        marginBottom: '20px',
        fontSize: '0.9rem',
        color: '#666',
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
    viewOrdersBtn: {
        padding: '10px 30px',
        backgroundColor: '#6366f1',
        color: '#fff',
        border: 'none',
        borderRadius: '0.5rem',
        cursor: 'pointer',
        marginTop: '20px',
    },
};

// Add keyframes for spinner
const styleSheet = document.createElement("style");
styleSheet.textContent = `
    @keyframes spin {
        from { transform: rotate(0deg); }
        to { transform: rotate(360deg); }
    }
    
    input:focus, select:focus {
        outline: none;
        border-color: #6366f1;
        box-shadow: 0 0 0 2px rgba(99, 102, 241, 0.1);
    }
    
    .payment-label:hover .payment-card {
        border-color: #6366f1;
        background-color: #f8fafc;
        transform: translateY(-2px);
    }
    
    input[type="radio"]:checked + .payment-card {
        border-color: #6366f1;
        background-color: #f0f9ff;
    }
`;
document.head.appendChild(styleSheet);

export default CheckoutPage;