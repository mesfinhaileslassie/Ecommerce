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
                    phoneNumber: paymentMethod === 'Telebirr' ? phoneNumber : null,
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
                    phoneNumber: phoneNumber || null,
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
            <div className="checkout-center">
                <h2>Please login to checkout</h2>
                <button onClick={() => navigate('/login')} className="checkout-login-btn">
                    Login
                </button>
            </div>
        );
    }

    if (cartLoading) {
        return (
            <div className="checkout-center">
                <FaSpinner className="checkout-spinner" />
                <p>Loading checkout...</p>
            </div>
        );
    }

    if (checkoutItems.length === 0 && !orderCreated) {
        return (
            <div className="checkout-center">
                <h2>No items selected for checkout</h2>
                <p>Please go back to cart and select items to checkout</p>
                <button onClick={() => navigate('/cart')} className="checkout-shop-btn">
                    Go to Cart
                </button>
            </div>
        );
    }

    const finalTotal = calculateFinalTotal();

    // Show payment instructions after order is created (for CBE Birr)
    if (orderCreated && !paymentConfirmed && isMobilePayment() && paymentMethod !== 'Telebirr') {
        return (
            <div className="checkout-container">
                <button onClick={() => setOrderCreated(false)} className="checkout-back-btn">
                    <FaArrowLeft /> Back to Checkout
                </button>
                
                <div className="checkout-payment-container">
                    <h1 className="checkout-title">Complete Payment</h1>
                    <p className="checkout-order-info">Order ID: {createdOrder?._id}</p>
                    
                    <PaymentInstructions 
                        paymentMethod={paymentMethod}
                        orderId={createdOrder?._id}
                        totalAmount={finalTotal}
                    />
                    
                    <div className="checkout-payment-form">
                        <div className="checkout-form-group">
                            <label className="checkout-label">Transaction Reference Number</label>
                            <input
                                type="text"
                                value={referenceNumber}
                                onChange={(e) => setReferenceNumber(e.target.value)}
                                placeholder="Enter the reference number from your payment"
                                className="checkout-input"
                                required
                            />
                        </div>
                        
                        <button 
                            onClick={handleConfirmPayment}
                            className="checkout-confirm-payment-btn"
                            disabled={submitting}
                        >
                            {submitting ? <FaSpinner className="checkout-spinner-icon" /> : <FaCheckCircle />}
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
            <div className="checkout-center">
                <FaSpinner className="checkout-spinner" />
                <h2>Redirecting to Telebirr...</h2>
                <p>Please wait while we redirect you to the Telebirr payment page.</p>
            </div>
        );
    }

    // Show success message after payment
    if (paymentConfirmed) {
        return (
            <div className="checkout-center">
                <FaCheckCircle size={64} className="checkout-success-icon" />
                <h2>Payment Successful!</h2>
                <p>Your order has been confirmed and will be processed soon.</p>
                <button onClick={() => navigate('/orders')} className="checkout-view-orders-btn">
                    View My Orders
                </button>
            </div>
        );
    }

    return (
        <div className="checkout-container">
            <button onClick={() => navigate('/cart')} className="checkout-back-btn">
                <FaArrowLeft /> Back to Cart
            </button>
            
            <h1 className="checkout-title">Checkout</h1>
            
            <div className="checkout-layout">
                <div className="checkout-form-section">
                    {/* Saved Addresses */}
                    {savedAddresses.length > 0 && (
                        <div className="checkout-section">
                            <h2>Saved Addresses</h2>
                            <div className="checkout-radio-group">
                                <label className="checkout-radio-label">
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
                                <label className="checkout-radio-label">
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
                                    className="checkout-select"
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
                    <div className="checkout-section">
                        <h2>Shipping Information</h2>
                        
                        <input
                            type="text"
                            name="fullName"
                            placeholder="Full Name"
                            value={shippingAddress.fullName}
                            onChange={handleChange}
                            required
                            className="checkout-input"
                        />
                        
                        <input
                            type="text"
                            name="address"
                            placeholder="Address"
                            value={shippingAddress.address}
                            onChange={handleChange}
                            required
                            className="checkout-input"
                        />
                        
                        <input
                            type="text"
                            name="city"
                            placeholder="City"
                            value={shippingAddress.city}
                            onChange={handleChange}
                            required
                            className="checkout-input"
                        />
                        
                        <input
                            type="text"
                            name="postalCode"
                            placeholder="Postal Code"
                            value={shippingAddress.postalCode}
                            onChange={handleChange}
                            required
                            className="checkout-input"
                        />
                        
                        <input
                            type="text"
                            name="country"
                            placeholder="Country"
                            value={shippingAddress.country}
                            onChange={handleChange}
                            required
                            className="checkout-input"
                        />
                        
                        <input
                            type="tel"
                            name="phone"
                            placeholder="Phone Number"
                            value={shippingAddress.phone}
                            onChange={handleChange}
                            required
                            className="checkout-input"
                        />
                    </div>
                    
                    {/* Payment Method */}
                    <div className="checkout-section">
                        <h2>Payment Method</h2>
                        
                        <div className="checkout-payment-options">
                            <label className="checkout-payment-label">
                                <input
                                    type="radio"
                                    value="Cash on Delivery"
                                    checked={paymentMethod === 'Cash on Delivery'}
                                    onChange={(e) => handlePaymentMethodChange(e.target.value)}
                                />
                                <div className="checkout-payment-card">
                                    <FaMoneyBillWave size={20} />
                                    <span>Cash on Delivery</span>
                                </div>
                            </label>
                            
                            <label className="checkout-payment-label">
                                <input
                                    type="radio"
                                    value="CBE Birr"
                                    checked={paymentMethod === 'CBE Birr'}
                                    onChange={(e) => handlePaymentMethodChange(e.target.value)}
                                />
                                <div className="checkout-payment-card">
                                    <FaUniversity size={20} />
                                    <span>CBE Birr</span>
                                </div>
                            </label>
                            
                            <label className="checkout-payment-label">
                                <input
                                    type="radio"
                                    value="Telebirr"
                                    checked={paymentMethod === 'Telebirr'}
                                    onChange={(e) => handlePaymentMethodChange(e.target.value)}
                                />
                                <div className="checkout-payment-card">
                                    <FaMobile size={20} />
                                    <span>Telebirr</span>
                                    <span className="checkout-payment-badge">Auto-Pay</span>
                                </div>
                            </label>
                        </div>
                    </div>

                    {/* Payment Details for CBE Birr - Phone number removed */}
                    {showPaymentDetails && paymentMethod === 'CBE Birr' && (
                        <div className="checkout-section">
                            <h2>Payment Details</h2>
                            
                            <div className="checkout-form-group">
                                <label className="checkout-label">CBE Birr Account Number</label>
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
                                    className={`checkout-input ${accountNumberError ? 'checkout-input-error' : ''}`}
                                />
                                {accountNumberError && <span className="checkout-error-text">{accountNumberError}</span>}
                                <small className="checkout-hint-text">Account number must start with 1000 followed by 9 digits (total 13 digits)</small>
                            </div>
                        </div>
                    )}

                    {/* Phone Number for Telebirr */}
                    {showPaymentDetails && paymentMethod === 'Telebirr' && (
                        <div className="checkout-section">
                            <h2>Telebirr Payment</h2>
                            <div className="checkout-telebirr-info">
                                <FaShieldAlt size={24} color="#10b981" />
                                <p>You will be redirected to Telebirr secure payment page after order creation.</p>
                            </div>
                            
                            <div className="checkout-form-group">
                                <label className="checkout-label">Phone Number</label>
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
                                    className={`checkout-input ${phoneNumberError ? 'checkout-input-error' : ''}`}
                                    required
                                />
                                {phoneNumberError && <span className="checkout-error-text">{phoneNumberError}</span>}
                                <small className="checkout-hint-text">Enter the phone number registered with Telebirr</small>
                            </div>
                        </div>
                    )}
                    
                    <button 
                        onClick={handleCreateOrder}
                        className="checkout-place-order-btn"
                        disabled={submitting || orderLoading || checkoutItems.length === 0}
                    >
                        {submitting || orderLoading ? (
                            <><FaSpinner className="checkout-spinner-icon" /> Creating Order...</>
                        ) : (
                            <><FaCheckCircle /> Place Order (${finalTotal.toFixed(2)})</>
                        )}
                    </button>
                </div>
                
                {/* Order Summary */}
                <div className="checkout-summary">
                    <h2 className="checkout-summary-title">Order Summary</h2>
                    
                    <div className="checkout-order-items">
                        {checkoutItems.map((item, index) => (
                            <div key={index} className="checkout-order-item">
                                <img 
                                    src={item.imageUrl || 'https://via.placeholder.com/60'} 
                                    alt={item.name}
                                    className="checkout-item-image"
                                />
                                <div className="checkout-item-info">
                                    <p className="checkout-item-name">{item.name}</p>
                                    {item.size && <p className="checkout-item-size">Size: {item.size}</p>}
                                    <p className="checkout-item-qty">Qty: {item.quantity}</p>
                                </div>
                                <div className="checkout-item-price">
                                    ${(item.price * item.quantity).toFixed(2)}
                                </div>
                                <button 
                                    onClick={() => handleRemoveItem(item.product?._id || item.product)}
                                    className="checkout-remove-item-btn"
                                    title="Remove item"
                                >
                                    <FaTrash />
                                </button>
                            </div>
                        ))}
                    </div>
                    
                    <div className="checkout-coupon-section">
                        <CouponInput cartTotal={checkoutTotal} />
                    </div>
                    
                    <div className="checkout-price-details">
                        <div className="checkout-price-row">
                            <span>Subtotal ({checkoutItems.length} items):</span>
                            <span>${checkoutTotal.toFixed(2)}</span>
                        </div>
                        <div className="checkout-price-row">
                            <span>Shipping:</span>
                            <span>Free</span>
                        </div>
                        {discountAmount > 0 && (
                            <div className="checkout-discount-row">
                                <span>Discount:</span>
                                <span style={{ color: '#10b981' }}>-${discountAmount.toFixed(2)}</span>
                            </div>
                        )}
                        <div className="checkout-divider"></div>
                        <div className="checkout-total-row">
                            <strong>Total:</strong>
                            <strong className="checkout-total-amount">${finalTotal.toFixed(2)}</strong>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

// Inject CSS Styles for CheckoutPage
const styleSheet = document.createElement("style");
styleSheet.textContent = `
    @keyframes checkoutSpin {
        from { transform: rotate(0deg); }
        to { transform: rotate(360deg); }
    }
    
    /* Checkout Page Styles - Dark Mode Compatible */
    .checkout-center {
        text-align: center;
        padding: 50px;
        color: var(--text-primary, #333);
    }
    
    .checkout-center h2 {
        color: var(--text-primary, #333);
    }
    
    .checkout-center p {
        color: var(--text-secondary, #666);
    }
    
    .checkout-spinner {
        animation: checkoutSpin 1s linear infinite;
        font-size: 2rem;
        color: #6366f1;
        margin-bottom: 1rem;
    }
    
    .checkout-spinner-icon {
        animation: checkoutSpin 1s linear infinite;
    }
    
    .checkout-success-icon {
        color: #10b981;
        margin-bottom: 20px;
    }
    
    .checkout-login-btn,
    .checkout-shop-btn,
    .checkout-view-orders-btn {
        padding: 10px 30px;
        background: linear-gradient(135deg, #4f46e5, #6366f1);
        color: #fff;
        border: none;
        border-radius: 0.5rem;
        cursor: pointer;
        margin-top: 20px;
    }
    
    .checkout-container {
        max-width: 1200px;
        margin: 0 auto;
        padding: 20px;
    }
    
    .checkout-back-btn {
        display: inline-flex;
        align-items: center;
        gap: 8px;
        background: none;
        border: none;
        color: #6366f1;
        cursor: pointer;
        margin-bottom: 20px;
        font-size: 0.9rem;
    }
    
    body.dark-mode .checkout-back-btn {
        color: #a5b4fc;
    }
    
    .checkout-title {
        font-size: 2rem;
        margin-bottom: 30px;
        color: var(--text-primary, #333);
    }
    
    body.dark-mode .checkout-title {
        color: #ffffff;
    }
    
    .checkout-layout {
        display: grid;
        grid-template-columns: 1fr 380px;
        gap: 30px;
    }
    
    .checkout-form-section {
        display: flex;
        flex-direction: column;
        gap: 25px;
    }
    
    .checkout-section {
        background-color: var(--card-bg, #fff);
        border-radius: 1rem;
        padding: 1.5rem;
        box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        border: 1px solid var(--border-color, #e5e7eb);
    }
    
    body.dark-mode .checkout-section {
        background-color: #1a1a1a;
        border-color: #333333;
    }
    
    .checkout-section h2 {
        color: var(--text-primary, #333);
        margin-bottom: 15px;
        font-size: 1.2rem;
    }
    
    body.dark-mode .checkout-section h2 {
        color: #ffffff;
    }
    
    .checkout-input {
        width: 100%;
        padding: 12px;
        margin-bottom: 15px;
        border: 1px solid var(--border-color, #ddd);
        border-radius: 0.5rem;
        font-size: 1rem;
        transition: border-color 0.3s;
        background-color: var(--input-bg, #fff);
        color: var(--text-primary, #333);
    }
    
    .checkout-input:focus {
        outline: none;
        border-color: #6366f1;
        box-shadow: 0 0 0 2px rgba(99, 102, 241, 0.1);
    }
    
    body.dark-mode .checkout-input {
        background-color: #0a0a0a;
        border-color: #444444;
        color: #ffffff;
    }
    
    .checkout-input-error {
        border-color: #dc3545;
        background-color: #fff8f8;
    }
    
    body.dark-mode .checkout-input-error {
        border-color: #ef4444;
        background-color: rgba(239, 68, 68, 0.1);
    }
    
    .checkout-error-text {
        color: #dc3545;
        font-size: 0.75rem;
        margin-top: 5px;
        display: block;
    }
    
    body.dark-mode .checkout-error-text {
        color: #f87171;
    }
    
    .checkout-hint-text {
        color: var(--text-secondary, #6c757d);
        font-size: 0.7rem;
        margin-top: 5px;
        display: block;
    }
    
    .checkout-radio-group {
        display: flex;
        gap: 20px;
        margin-bottom: 15px;
        flex-wrap: wrap;
    }
    
    .checkout-radio-label {
        display: flex;
        align-items: center;
        gap: 8px;
        cursor: pointer;
        color: var(--text-primary, #333);
    }
    
    body.dark-mode .checkout-radio-label {
        color: #d1d5db;
    }
    
    .checkout-select {
        width: 100%;
        padding: 12px;
        border: 1px solid var(--border-color, #ddd);
        border-radius: 0.5rem;
        font-size: 1rem;
        background-color: var(--input-bg, #fff);
        color: var(--text-primary, #333);
    }
    
    body.dark-mode .checkout-select {
        background-color: #0a0a0a;
        border-color: #444444;
        color: #ffffff;
    }
    
    .checkout-payment-options {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
        gap: 15px;
    }
    
    .checkout-payment-label {
        cursor: pointer;
    }
    
    .checkout-payment-card {
        display: flex;
        align-items: center;
        gap: 10px;
        padding: 12px;
        border: 2px solid var(--border-color, #e5e7eb);
        border-radius: 0.5rem;
        transition: all 0.3s;
        background-color: var(--card-bg, #fff);
        position: relative;
        color: var(--text-primary, #333);
    }
    
    body.dark-mode .checkout-payment-card {
        background-color: #1a1a1a;
        border-color: #444444;
    }
    
    .checkout-payment-label:hover .checkout-payment-card {
        border-color: #6366f1;
        transform: translateY(-2px);
    }
    
    .checkout-payment-badge {
        position: absolute;
        top: -8px;
        right: -8px;
        background-color: #10b981;
        color: #fff;
        font-size: 10px;
        padding: 2px 6px;
        border-radius: 20px;
    }
    
    .checkout-telebirr-info {
        display: flex;
        align-items: center;
        gap: 10px;
        background-color: #f0fdf4;
        padding: 12px;
        border-radius: 0.5rem;
        margin-bottom: 15px;
        border: 1px solid #bbf7d0;
    }
    
    body.dark-mode .checkout-telebirr-info {
        background-color: #064e3b;
        border-color: #065f46;
    }
    
    body.dark-mode .checkout-telebirr-info p {
        color: #86efac;
    }
    
    .checkout-form-group {
        margin-bottom: 15px;
    }
    
    .checkout-label {
        display: block;
        margin-bottom: 5px;
        font-weight: 500;
        color: var(--text-primary, #555);
    }
    
    body.dark-mode .checkout-label {
        color: #d1d5db;
    }
    
    .checkout-place-order-btn {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 10px;
        padding: 14px;
        background: linear-gradient(135deg, #059669, #10b981);
        color: #fff;
        border: none;
        border-radius: 0.5rem;
        font-size: 1rem;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.3s;
        width: 100%;
    }
    
    .checkout-place-order-btn:hover:not(:disabled) {
        transform: translateY(-2px);
        background: linear-gradient(135deg, #047857, #059669);
    }
    
    .checkout-place-order-btn:disabled {
        opacity: 0.6;
        cursor: not-allowed;
    }
    
    /* Order Summary */
    .checkout-summary {
        background-color: var(--card-bg, #fff);
        border-radius: 1rem;
        padding: 1.5rem;
        box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        height: fit-content;
        position: sticky;
        top: 20px;
        border: 1px solid var(--border-color, #e5e7eb);
    }
    
    body.dark-mode .checkout-summary {
        background-color: #1a1a1a;
        border-color: #333333;
    }
    
    .checkout-summary-title {
        font-size: 1.2rem;
        margin-bottom: 1rem;
        padding-bottom: 0.5rem;
        border-bottom: 2px solid var(--border-color, #f0f0f0);
        color: var(--text-primary, #333);
    }
    
    body.dark-mode .checkout-summary-title {
        color: #ffffff;
        border-bottom-color: #333333;
    }
    
    .checkout-order-items {
        max-height: 400px;
        overflow-y: auto;
        margin-bottom: 1rem;
    }
    
    .checkout-order-item {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 10px 0;
        border-bottom: 1px solid var(--border-color, #f0f0f0);
    }
    
    body.dark-mode .checkout-order-item {
        border-bottom-color: #333333;
    }
    
    .checkout-item-image {
        width: 50px;
        height: 50px;
        object-fit: cover;
        border-radius: 0.5rem;
    }
    
    .checkout-item-info {
        flex: 1;
    }
    
    .checkout-item-name {
        font-size: 0.9rem;
        font-weight: 500;
        margin-bottom: 4px;
        color: var(--text-primary, #333);
    }
    
    body.dark-mode .checkout-item-name {
        color: #ffffff;
    }
    
    .checkout-item-size,
    .checkout-item-qty {
        font-size: 0.75rem;
        color: var(--text-secondary, #666);
    }
    
    .checkout-item-price {
        font-weight: 600;
        color: #6366f1;
    }
    
    .checkout-remove-item-btn {
        background: none;
        border: none;
        color: #dc3545;
        cursor: pointer;
        padding: 5px;
        transition: transform 0.2s;
    }
    
    .checkout-remove-item-btn:hover {
        transform: scale(1.1);
    }
    
    .checkout-coupon-section {
        margin: 1rem 0;
        padding: 1rem 0;
        border-top: 1px solid var(--border-color, #f0f0f0);
        border-bottom: 1px solid var(--border-color, #f0f0f0);
    }
    
    body.dark-mode .checkout-coupon-section {
        border-top-color: #333333;
        border-bottom-color: #333333;
    }
    
    .checkout-price-details {
        margin-top: 1rem;
    }
    
    .checkout-price-row {
        display: flex;
        justify-content: space-between;
        margin-bottom: 10px;
        font-size: 0.9rem;
        color: var(--text-primary, #333);
    }
    
    body.dark-mode .checkout-price-row {
        color: #d1d5db;
    }
    
    .checkout-discount-row {
        display: flex;
        justify-content: space-between;
        margin-bottom: 10px;
        font-size: 0.9rem;
        color: #10b981;
    }
    
    .checkout-divider {
        height: 1px;
        background-color: var(--border-color, #e5e7eb);
        margin: 12px 0;
    }
    
    .checkout-total-row {
        display: flex;
        justify-content: space-between;
        font-size: 1.2rem;
        color: var(--text-primary, #333);
    }
    
    body.dark-mode .checkout-total-row {
        color: #ffffff;
    }
    
    .checkout-total-amount {
        color: #10b981;
        font-size: 1.3rem;
    }
    
    .checkout-payment-container {
        max-width: 600px;
        margin: 0 auto;
    }
    
    .checkout-payment-form {
        background-color: var(--card-bg, #fff);
        border-radius: 1rem;
        padding: 1.5rem;
        margin-top: 20px;
        box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        border: 1px solid var(--border-color, #e5e7eb);
    }
    
    body.dark-mode .checkout-payment-form {
        background-color: #1a1a1a;
        border-color: #333333;
    }
    
    .checkout-confirm-payment-btn {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 10px;
        padding: 14px;
        background: linear-gradient(135deg, #059669, #10b981);
        color: #fff;
        border: none;
        border-radius: 0.5rem;
        font-size: 1rem;
        font-weight: 600;
        cursor: pointer;
        width: 100%;
        margin-top: 10px;
        transition: all 0.3s;
    }
    
    .checkout-confirm-payment-btn:hover:not(:disabled) {
        transform: translateY(-2px);
    }
    
    .checkout-order-info {
        text-align: center;
        margin-bottom: 20px;
        font-size: 0.9rem;
        color: var(--text-secondary, #666);
    }
    
    /* Responsive */
    @media (max-width: 768px) {
        .checkout-layout {
            grid-template-columns: 1fr;
            gap: 20px;
        }
        
        .checkout-container {
            padding: 15px;
        }
        
        .checkout-title {
            font-size: 1.5rem;
        }
        
        .checkout-summary {
            position: static;
        }
        
        .checkout-payment-options {
            grid-template-columns: 1fr;
        }
    }
    
    @media (max-width: 480px) {
        .checkout-section {
            padding: 1rem;
        }
        
        .checkout-order-item {
            flex-wrap: wrap;
        }
        
        .checkout-item-price {
            margin-left: auto;
        }
    }
`;
document.head.appendChild(styleSheet);

export default CheckoutPage;