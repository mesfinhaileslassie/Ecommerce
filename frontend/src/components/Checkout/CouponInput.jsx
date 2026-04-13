import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { validateCoupon, clearCoupon } from '../../redux/slices/couponSlice';
import { FaTag, FaCheck, FaTimes, FaSpinner, FaBoxes } from 'react-icons/fa';
import toast from 'react-hot-toast';

const CouponInput = ({ cartTotal, cartItemsCount, onDiscountChange }) => {
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
        try {
            const result = await dispatch(validateCoupon(couponCode, cartTotal, cartItemsCount));
            console.log('Coupon validation result:', result);
            
            if (result.success && result.data) {
                toast.success('Coupon applied successfully!');
                const discount = parseFloat(result.data.coupon.discountAmount) || 0;
                if (onDiscountChange && typeof onDiscountChange === 'function') {
                    onDiscountChange(discount);
                }
            } else if (result.error) {
                const errorMsg = result.error.message || 'Invalid coupon code';
                toast.error(errorMsg);
            }
        } catch (error) {
            console.error('Coupon error:', error);
            toast.error(error.response?.data?.message || 'Failed to apply coupon');
        } finally {
            setIsApplying(false);
        }
    };

    const handleRemoveCoupon = () => {
        dispatch(clearCoupon());
        setCouponCode('');
        if (onDiscountChange && typeof onDiscountChange === 'function') {
            onDiscountChange(0);
        }
        toast.success('Coupon removed');
    };

    const displayDiscount = typeof discountAmount === 'number' ? discountAmount : 0;

    return (
        <div className="coupon-container">
            <h3 className="coupon-title">
                <FaTag /> Coupon Code
            </h3>
            
            {appliedCoupon ? (
                <div className="coupon-applied">
                    <div className="coupon-info">
                        <FaCheck className="coupon-check-icon" />
                        <div>
                            <strong>{appliedCoupon.code}</strong>
                            <p className="coupon-desc">{appliedCoupon.description}</p>
                            <div className="coupon-requirements">
                                {appliedCoupon.minimumItems > 0 && (
                                    <span className="coupon-requirement-badge">
                                        <FaBoxes /> Min {appliedCoupon.minimumItems} items
                                    </span>
                                )}
                                {appliedCoupon.minimumOrder > 0 && (
                                    <span className="coupon-requirement-badge">
                                        Min ${appliedCoupon.minimumOrder} order
                                    </span>
                                )}
                            </div>
                            <span className="coupon-discount-text">
                                {appliedCoupon.discountType === 'percentage' 
                                    ? `${appliedCoupon.discountValue}% OFF` 
                                    : `$${appliedCoupon.discountValue} OFF`}
                            </span>
                        </div>
                    </div>
                    <button onClick={handleRemoveCoupon} className="coupon-remove-btn">
                        <FaTimes /> Remove
                    </button>
                </div>
            ) : (
                <div className="coupon-input-group">
                    <input
                        type="text"
                        placeholder="Enter coupon code"
                        value={couponCode}
                        onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                        className="coupon-input"
                    />
                    <button 
                        onClick={handleApplyCoupon} 
                        disabled={isApplying || !couponCode}
                        className="coupon-apply-btn"
                    >
                        {isApplying ? <FaSpinner className="coupon-spinner" /> : 'Apply'}
                    </button>
                </div>
            )}
            
            {error && (
                <div className="coupon-error">
                    <FaTimes /> {error}
                </div>
            )}
            
            {appliedCoupon && displayDiscount > 0 && (
                <div className="coupon-savings">
                    <span>You saved:</span>
                    <strong>${displayDiscount.toFixed(2)}</strong>
                </div>
            )}

            {/* Show cart items count */}
            <div className="coupon-cart-info">
                <FaBoxes /> {cartItemsCount} item{cartItemsCount !== 1 ? 's' : ''} in cart
            </div>
        </div>
    );
};

// Inject CSS Styles for CouponInput
const styleSheet = document.createElement("style");
styleSheet.textContent = `
    @keyframes couponSpin {
        from { transform: rotate(0deg); }
        to { transform: rotate(360deg); }
    }
    
    /* Coupon Input Styles - Dark Mode Compatible */
    .coupon-container {
        background-color: var(--card-bg, #fff);
        border-radius: 0.75rem;
        padding: 1rem;
        margin-bottom: 1rem;
        border: 1px solid var(--border-color, #e5e7eb);
    }
    
    body.dark-mode .coupon-container {
        background-color: #1a1a1a;
        border-color: #333333;
    }
    
    .coupon-title {
        font-size: 1rem;
        margin-bottom: 0.75rem;
        display: flex;
        align-items: center;
        gap: 0.5rem;
        color: var(--text-primary, #333);
    }
    
    body.dark-mode .coupon-title {
        color: #ffffff;
    }
    
    .coupon-input-group {
        display: flex;
        gap: 0.5rem;
    }
    
    .coupon-input {
        flex: 1;
        padding: 0.6rem;
        border: 1px solid var(--border-color, #ddd);
        border-radius: 0.5rem;
        font-size: 0.9rem;
        text-transform: uppercase;
        background-color: var(--input-bg, #fff);
        color: var(--text-primary, #333);
        transition: border-color 0.3s, box-shadow 0.3s;
    }
    
    .coupon-input:focus {
        outline: none;
        border-color: #6366f1;
        box-shadow: 0 0 0 2px rgba(99, 102, 241, 0.1);
    }
    
    body.dark-mode .coupon-input {
        background-color: #0a0a0a;
        border-color: #444444;
        color: #ffffff;
    }
    
    .coupon-apply-btn {
        padding: 0.6rem 1.2rem;
        background: linear-gradient(135deg, #4f46e5, #6366f1);
        color: #fff;
        border: none;
        border-radius: 0.5rem;
        cursor: pointer;
        transition: all 0.3s;
        display: flex;
        align-items: center;
        justify-content: center;
        min-width: 80px;
    }
    
    .coupon-apply-btn:hover:not(:disabled) {
        transform: translateY(-2px);
        background: linear-gradient(135deg, #4338ca, #4f46e5);
    }
    
    .coupon-apply-btn:disabled {
        opacity: 0.6;
        cursor: not-allowed;
    }
    
    .coupon-applied {
        display: flex;
        justify-content: space-between;
        align-items: center;
        background-color: #d1fae5;
        padding: 0.75rem;
        border-radius: 0.5rem;
        flex-wrap: wrap;
        gap: 10px;
    }
    
    body.dark-mode .coupon-applied {
        background-color: #064e3b;
    }
    
    .coupon-info {
        display: flex;
        align-items: flex-start;
        gap: 0.75rem;
        flex: 1;
    }
    
    .coupon-info strong {
        color: #065f46;
    }
    
    body.dark-mode .coupon-info strong {
        color: #34d399;
    }
    
    .coupon-check-icon {
        color: #10b981;
        font-size: 1.2rem;
        margin-top: 0.2rem;
    }
    
    body.dark-mode .coupon-check-icon {
        color: #34d399;
    }
    
    .coupon-desc {
        font-size: 0.8rem;
        color: #065f46;
        margin-top: 2px;
    }
    
    body.dark-mode .coupon-desc {
        color: #86efac;
    }
    
    .coupon-requirements {
        display: flex;
        gap: 0.5rem;
        margin-top: 0.25rem;
        flex-wrap: wrap;
    }
    
    .coupon-requirement-badge {
        font-size: 0.7rem;
        background-color: #a7f3d0;
        padding: 2px 6px;
        border-radius: 10px;
        display: inline-flex;
        align-items: center;
        gap: 3px;
        color: #065f46;
    }
    
    body.dark-mode .coupon-requirement-badge {
        background-color: #065f46;
        color: #86efac;
    }
    
    .coupon-discount-text {
        font-size: 0.75rem;
        color: #065f46;
        display: block;
        margin-top: 0.25rem;
        font-weight: 500;
    }
    
    body.dark-mode .coupon-discount-text {
        color: #86efac;
    }
    
    .coupon-remove-btn {
        background: none;
        border: none;
        color: #dc3545;
        cursor: pointer;
        display: flex;
        align-items: center;
        gap: 0.25rem;
        font-size: 0.8rem;
        padding: 4px 8px;
        border-radius: 4px;
        transition: all 0.3s;
    }
    
    .coupon-remove-btn:hover {
        background-color: rgba(220, 53, 69, 0.1);
    }
    
    body.dark-mode .coupon-remove-btn {
        color: #f87171;
    }
    
    body.dark-mode .coupon-remove-btn:hover {
        background-color: rgba(248, 113, 113, 0.1);
    }
    
    .coupon-error {
        margin-top: 0.5rem;
        padding: 0.5rem;
        background-color: #fee2e2;
        color: #dc2626;
        border-radius: 0.5rem;
        font-size: 0.8rem;
        display: flex;
        align-items: center;
        gap: 0.5rem;
    }
    
    body.dark-mode .coupon-error {
        background-color: #7f1d1d;
        color: #fca5a5;
    }
    
    .coupon-savings {
        margin-top: 0.75rem;
        padding-top: 0.75rem;
        border-top: 1px solid var(--border-color, #e5e7eb);
        display: flex;
        justify-content: space-between;
        font-size: 0.9rem;
        color: var(--text-primary, #333);
    }
    
    body.dark-mode .coupon-savings {
        color: #ffffff;
        border-top-color: #333333;
    }
    
    .coupon-savings strong {
        color: #10b981;
    }
    
    .coupon-cart-info {
        margin-top: 0.75rem;
        padding-top: 0.75rem;
        border-top: 1px solid var(--border-color, #e5e7eb);
        font-size: 0.8rem;
        color: var(--text-secondary, #666);
        display: flex;
        align-items: center;
        gap: 0.5rem;
    }
    
    body.dark-mode .coupon-cart-info {
        border-top-color: #333333;
        color: #a0a0a0;
    }
    
    .coupon-spinner {
        animation: couponSpin 1s linear infinite;
    }
`;
document.head.appendChild(styleSheet);

export default CouponInput;