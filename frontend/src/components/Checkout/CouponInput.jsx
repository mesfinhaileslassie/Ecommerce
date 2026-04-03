import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { validateCoupon, clearCoupon } from '../../redux/slices/couponSlice';
import { FaTag, FaCheck, FaTimes, FaSpinner } from 'react-icons/fa';
import toast from 'react-hot-toast';

const CouponInput = ({ cartTotal, onDiscountChange }) => {
    const dispatch = useDispatch();
    const { appliedCoupon, discountAmount, loading, error } = useSelector((state) => state.coupons);
    const [couponCode, setCouponCode] = useState('');
    const [isApplying, setIsApplying] = useState(false);

    const handleApplyCoupon = async () => {
        if (!couponCode.trim()) {
            toast.error('Please enter a coupon code');
            return;
        }

        setIsApplying(true);
        const result = await dispatch(validateCoupon(couponCode, cartTotal));
        if (result.success && result.data) {
            toast.success('Coupon applied successfully!');
            // Ensure discountAmount is a number
            const discount = parseFloat(result.data.coupon.discountAmount) || 0;
            if (onDiscountChange && typeof onDiscountChange === 'function') {
                onDiscountChange(discount);
            }
        } else if (result.error) {
            toast.error(result.error.message);
        }
        setIsApplying(false);
    };

    const handleRemoveCoupon = () => {
        dispatch(clearCoupon());
        setCouponCode('');
        if (onDiscountChange && typeof onDiscountChange === 'function') {
            onDiscountChange(0);
        }
        toast.success('Coupon removed');
    };

    // Ensure discountAmount is a number for display
    const displayDiscount = typeof discountAmount === 'number' ? discountAmount : 0;

    return (
        <div style={styles.container}>
            <h3 style={styles.title}>
                <FaTag /> Coupon Code
            </h3>
            
            {appliedCoupon ? (
                <div style={styles.appliedCoupon}>
                    <div style={styles.couponInfo}>
                        <FaCheck style={styles.checkIcon} />
                        <div>
                            <strong>{appliedCoupon.code}</strong>
                            <p style={styles.couponDesc}>{appliedCoupon.description}</p>
                            <span style={styles.discountText}>
                                {appliedCoupon.discountType === 'percentage' 
                                    ? `${appliedCoupon.discountValue}% OFF` 
                                    : `$${appliedCoupon.discountValue} OFF`}
                            </span>
                        </div>
                    </div>
                    <button onClick={handleRemoveCoupon} style={styles.removeBtn}>
                        <FaTimes /> Remove
                    </button>
                </div>
            ) : (
                <div style={styles.inputGroup}>
                    <input
                        type="text"
                        placeholder="Enter coupon code"
                        value={couponCode}
                        onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                        style={styles.input}
                    />
                    <button 
                        onClick={handleApplyCoupon} 
                        disabled={isApplying || !couponCode}
                        style={styles.applyBtn}
                    >
                        {isApplying ? <FaSpinner style={styles.spinner} /> : 'Apply'}
                    </button>
                </div>
            )}
            
            {error && (
                <div style={styles.error}>
                    <FaTimes /> {error}
                </div>
            )}
            
            {appliedCoupon && displayDiscount > 0 && (
                <div style={styles.savings}>
                    <span>You saved:</span>
                    <strong>${displayDiscount.toFixed(2)}</strong>
                </div>
            )}
        </div>
    );
};

const styles = {
    container: {
        backgroundColor: '#fff',
        borderRadius: '0.75rem',
        padding: '1rem',
        marginBottom: '1rem',
        border: '1px solid #e5e7eb',
    },
    title: {
        fontSize: '1rem',
        marginBottom: '0.75rem',
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
    },
    inputGroup: {
        display: 'flex',
        gap: '0.5rem',
    },
    input: {
        flex: 1,
        padding: '0.6rem',
        border: '1px solid #ddd',
        borderRadius: '0.5rem',
        fontSize: '0.9rem',
        textTransform: 'uppercase',
    },
    applyBtn: {
        padding: '0.6rem 1.2rem',
        backgroundColor: '#6366f1',
        color: '#fff',
        border: 'none',
        borderRadius: '0.5rem',
        cursor: 'pointer',
        transition: 'background-color 0.3s',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minWidth: '80px',
    },
    appliedCoupon: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: '#d1fae5',
        padding: '0.75rem',
        borderRadius: '0.5rem',
        flexWrap: 'wrap',
        gap: '10px',
    },
    couponInfo: {
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem',
    },
    checkIcon: {
        color: '#10b981',
        fontSize: '1.2rem',
    },
    couponDesc: {
        fontSize: '0.8rem',
        color: '#065f46',
        marginTop: '2px',
    },
    discountText: {
        fontSize: '0.75rem',
        color: '#065f46',
        display: 'block',
        marginTop: '0.25rem',
        fontWeight: '500',
    },
    removeBtn: {
        background: 'none',
        border: 'none',
        color: '#dc3545',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        gap: '0.25rem',
        fontSize: '0.8rem',
        padding: '4px 8px',
        borderRadius: '4px',
        transition: 'background-color 0.3s',
    },
    error: {
        marginTop: '0.5rem',
        padding: '0.5rem',
        backgroundColor: '#fee2e2',
        color: '#dc2626',
        borderRadius: '0.5rem',
        fontSize: '0.8rem',
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
    },
    savings: {
        marginTop: '0.75rem',
        paddingTop: '0.75rem',
        borderTop: '1px solid #e5e7eb',
        display: 'flex',
        justifyContent: 'space-between',
        fontSize: '0.9rem',
    },
    spinner: {
        animation: 'spin 1s linear infinite',
    },
};

// Add keyframes for spinner
const styleSheet = document.createElement("style");
styleSheet.textContent = `
    @keyframes spin {
        from { transform: rotate(0deg); }
        to { transform: rotate(360deg); }
    }
`;
document.head.appendChild(styleSheet);

export default CouponInput;