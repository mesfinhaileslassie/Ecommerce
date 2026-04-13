import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { updateCartItem, removeFromCart, clearCart, fetchCart } from '../../redux/slices/cartSlice';
import { FaTrash, FaPlus, FaMinus, FaCheckSquare, FaSquare, FaMoneyBillWave, FaClock, FaExclamationTriangle } from 'react-icons/fa';
import toast from 'react-hot-toast';
import api from '../../services/api';

const CartPage = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { items, totalPrice, itemCount, loading } = useSelector((state) => state.cart);
    const { user, token } = useSelector((state) => state.auth);
    const [updating, setUpdating] = useState(false);
    const [selectedItems, setSelectedItems] = useState({});
    const [selectAll, setSelectAll] = useState(true);
    const [expirationInfo, setExpirationInfo] = useState(null);
    const [loadingExpiration, setLoadingExpiration] = useState(true);

    useEffect(() => {
        if (token && user) {
            loadCart();
            fetchExpirationInfo();
        }
    }, [dispatch, token, user]);

    useEffect(() => {
        // Initialize selected items when cart loads
        if (items.length > 0) {
            const initialSelected = {};
            items.forEach(item => {
                const itemId = item.product?._id || item.product;
                initialSelected[itemId] = selectAll;
            });
            setSelectedItems(initialSelected);
        }
    }, [items]);

    const loadCart = async () => {
        try {
            await dispatch(fetchCart());
        } catch (error) {
            console.error('Failed to load cart:', error);
        }
    };

    const fetchExpirationInfo = async () => {
        try {
            const { data } = await api.get('/cart/expiration');
            setExpirationInfo(data);
        } catch (error) {
            console.error('Failed to fetch expiration info:', error);
        } finally {
            setLoadingExpiration(false);
        }
    };

    const handleSelectItem = (productId) => {
        setSelectedItems(prev => ({
            ...prev,
            [productId]: !prev[productId]
        }));
        setSelectAll(false);
    };

    const handleSelectAll = () => {
        const newSelectAll = !selectAll;
        setSelectAll(newSelectAll);
        const newSelected = {};
        items.forEach(item => {
            const itemId = item.product?._id || item.product;
            newSelected[itemId] = newSelectAll;
        });
        setSelectedItems(newSelected);
    };

    const getSelectedTotal = () => {
        let total = 0;
        let selectedCount = 0;
        items.forEach(item => {
            const itemId = item.product?._id || item.product;
            if (selectedItems[itemId]) {
                total += item.price * item.quantity;
                selectedCount++;
            }
        });
        return { total, count: selectedCount };
    };

    const handleCheckout = () => {
        const selected = getSelectedTotal();
        if (selected.count === 0) {
            toast.error('Please select at least one item to checkout');
            return;
        }
        
        // Store selected items in sessionStorage for checkout
        const selectedProducts = items.filter(item => {
            const itemId = item.product?._id || item.product;
            return selectedItems[itemId];
        });
        
        sessionStorage.setItem('checkoutItems', JSON.stringify(selectedProducts));
        navigate('/checkout', { state: { selectedItems: selectedProducts } });
    };

    const handleUpdateQuantity = async (productId, quantity) => {
        if (quantity < 1) {
            handleRemoveItem(productId);
            return;
        }
        
        setUpdating(true);
        try {
            const result = await dispatch(updateCartItem(productId, quantity));
            if (result.error) {
                toast.error(result.error.message || 'Update failed');
            } else {
                toast.success('Cart updated');
                await loadCart();
                await fetchExpirationInfo();
            }
        } catch (error) {
            toast.error(error.message || 'Update failed');
        } finally {
            setUpdating(false);
        }
    };

    const handleRemoveItem = async (productId) => {
        try {
            const result = await dispatch(removeFromCart(productId));
            if (result.error) {
                toast.error(result.error.message || 'Remove failed');
            } else {
                toast.success('Item removed');
                await loadCart();
                await fetchExpirationInfo();
                // Remove from selected items
                setSelectedItems(prev => {
                    const newSelected = { ...prev };
                    delete newSelected[productId];
                    return newSelected;
                });
            }
        } catch (error) {
            toast.error('Remove failed');
        }
    };

    const handleClearCart = async () => {
        if (window.confirm('Clear entire cart?')) {
            try {
                const result = await dispatch(clearCart());
                if (result.error) {
                    toast.error(result.error.message || 'Clear failed');
                } else {
                    toast.success('Cart cleared');
                    await loadCart();
                    await fetchExpirationInfo();
                    setSelectedItems({});
                    setSelectAll(true);
                }
            } catch (error) {
                toast.error('Clear failed');
            }
        }
    };

    const handleRefreshCart = () => {
        loadCart();
        fetchExpirationInfo();
        toast.success('Cart refreshed');
    };

    const { total: selectedTotal, count: selectedCount } = getSelectedTotal();

    if (!user) {
        return (
            <div className="cart-center">
                <h2>Please login to view your cart</h2>
                <Link to="/login" className="cart-login-btn">Login</Link>
            </div>
        );
    }

    if (loading || loadingExpiration) {
        return (
            <div className="cart-center">
                <div className="spinner"></div>
                <h2>Loading your cart...</h2>
            </div>
        );
    }

    // Check if cart is expired
    if (expirationInfo && expirationInfo.isExpired) {
        return (
            <div className="cart-center">
                <FaExclamationTriangle size={48} className="cart-expired-icon" />
                <h2>Your cart has expired</h2>
                <p>Items in your cart were held for too long and have been removed.</p>
                <p>Please add items to your cart again to continue shopping.</p>
                <div className="cart-button-group">
                    <Link to="/products" className="cart-shop-btn">Continue Shopping</Link>
                    <button onClick={handleRefreshCart} className="cart-refresh-btn">Refresh Cart</button>
                </div>
            </div>
        );
    }

    if (items.length === 0) {
        return (
            <div className="cart-center">
                <h2>Your cart is empty</h2>
                <p>Start shopping to add items to your cart</p>
                <Link to="/products" className="cart-shop-btn">Continue Shopping</Link>
            </div>
        );
    }

    return (
        <div className="cart-container">
            <h1 className="cart-title">Shopping Cart</h1>
            
            {/* Expiration Warning */}
            {expirationInfo && expirationInfo.hasCart && !expirationInfo.isExpired && (
                <div className="cart-expiration-warning">
                    <FaClock size={16} />
                    <span>
                        Items in your cart will expire in{' '}
                        {expirationInfo.daysRemaining > 0 
                            ? `${expirationInfo.daysRemaining} day${expirationInfo.daysRemaining !== 1 ? 's' : ''}` 
                            : `${expirationInfo.hoursRemaining} hour${expirationInfo.hoursRemaining !== 1 ? 's' : ''}`}
                    </span>
                </div>
            )}
            
            <div className="cart-grid">
                <div className="cart-items-section">
                    {/* Select All Header */}
                    <div className="cart-select-all-row">
                        <button onClick={handleSelectAll} className="cart-select-all-btn">
                            {selectAll ? <FaCheckSquare color="#6366f1" /> : <FaSquare color="#999" />}
                            <span>Select All Items</span>
                        </button>
                        <span className="cart-select-all-info">{selectedCount} of {items.length} items selected</span>
                    </div>
                    
                    {items.map((item) => {
                        const itemId = item.product?._id || item.product;
                        return (
                            <div key={itemId} className="cart-item">
                                <button 
                                    onClick={() => handleSelectItem(itemId)}
                                    className="cart-select-checkbox"
                                >
                                    {selectedItems[itemId] ? <FaCheckSquare color="#6366f1" size={20} /> : <FaSquare color="#999" size={20} />}
                                </button>
                                
                                <img 
                                    src={item.imageUrl || 'https://via.placeholder.com/100'} 
                                    alt={item.name}
                                    className="cart-item-image"
                                />
                                
                                <div className="cart-item-details">
                                    <h3>{item.name}</h3>
                                    {item.size && <p className="cart-item-size">Size: {item.size}</p>}
                                    <p className="cart-item-price">${item.price.toFixed(2)}</p>
                                </div>
                                
                                <div className="cart-quantity-controls">
                                    <button 
                                        onClick={() => handleUpdateQuantity(itemId, item.quantity - 1)}
                                        disabled={updating}
                                        className="cart-qty-btn"
                                    >
                                        <FaMinus />
                                    </button>
                                    <span className="cart-quantity">{item.quantity}</span>
                                    <button 
                                        onClick={() => handleUpdateQuantity(itemId, item.quantity + 1)}
                                        disabled={updating}
                                        className="cart-qty-btn"
                                    >
                                        <FaPlus />
                                    </button>
                                </div>
                                
                                <div className="cart-item-total">
                                    <strong>${(item.price * item.quantity).toFixed(2)}</strong>
                                </div>
                                
                                <button 
                                    onClick={() => handleRemoveItem(itemId)}
                                    className="cart-remove-btn"
                                >
                                    <FaTrash />
                                </button>
                            </div>
                        );
                    })}
                </div>
                
                <div className="cart-summary-section">
                    <h2>Order Summary</h2>
                    
                    <div className="cart-summary-row">
                        <span>Selected Items ({selectedCount}):</span>
                        <span>${selectedTotal.toFixed(2)}</span>
                    </div>
                    
                    <div className="cart-summary-row">
                        <span>Total Items in Cart ({itemCount}):</span>
                        <span>${totalPrice.toFixed(2)}</span>
                    </div>
                    
                    <div className="cart-summary-row">
                        <span>Shipping:</span>
                        <span>Free</span>
                    </div>
                    
                    <hr className="cart-divider" />
                    
                    <div className="cart-summary-total">
                        <strong>Selected Total:</strong>
                        <strong>${selectedTotal.toFixed(2)}</strong>
                    </div>
                    
                    {selectedCount === 0 ? (
                        <button className="cart-disabled-checkout-btn" disabled>
                            Select Items to Checkout
                        </button>
                    ) : (
                        <button onClick={handleCheckout} className="cart-checkout-btn">
                            <FaMoneyBillWave /> Checkout Selected ({selectedCount})
                        </button>
                    )}
                    
                    <button onClick={handleClearCart} className="cart-clear-btn">
                        Clear Cart
                    </button>
                </div>
            </div>
        </div>
    );
};

// Inject CSS Styles for CartPage
const styleSheet = document.createElement("style");
styleSheet.textContent = `
    /* Cart Page Styles - Dark Mode Compatible */
    
    .cart-center {
        text-align: center;
        padding: 50px;
    }
    
    .cart-center h2 {
        color: var(--text-primary, #333);
    }
    
    .cart-center p {
        color: var(--text-secondary, #666);
    }
    
    .cart-expired-icon {
        color: #dc3545;
        margin-bottom: 20px;
    }
    
    .cart-login-btn,
    .cart-shop-btn {
        display: inline-block;
        margin-top: 20px;
        padding: 10px 30px;
        background: linear-gradient(135deg, #4f46e5, #6366f1);
        color: #fff;
        text-decoration: none;
        border-radius: 5px;
    }
    
    .cart-refresh-btn {
        display: inline-block;
        margin-top: 20px;
        margin-left: 10px;
        padding: 10px 30px;
        background: linear-gradient(135deg, #059669, #10b981);
        color: #fff;
        border: none;
        border-radius: 5px;
        cursor: pointer;
    }
    
    .cart-button-group {
        display: flex;
        gap: 10px;
        justify-content: center;
        margin-top: 20px;
    }
    
    .cart-container {
        max-width: 1200px;
        margin: 0 auto;
        padding: 20px;
    }
    
    .cart-title {
        margin-bottom: 20px;
        color: var(--text-primary, #333);
    }
    
    .cart-expiration-warning {
        display: flex;
        align-items: center;
        gap: 10px;
        background-color: #fff3cd;
        color: #856404;
        padding: 12px 16px;
        border-radius: 8px;
        margin-bottom: 20px;
        font-size: 14px;
    }
    
    body.dark-mode .cart-expiration-warning {
        background-color: #7f5f00;
        color: #ffd966;
    }
    
    .cart-grid {
        display: grid;
        grid-template-columns: 1fr 320px;
        gap: 30px;
    }
    
    .cart-items-section {
        background-color: var(--card-bg, #fff);
        border-radius: 8px;
        padding: 20px;
        border: 1px solid var(--border-color, #e5e7eb);
    }
    
    .cart-select-all-row {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 10px 0;
        border-bottom: 2px solid var(--border-color, #eee);
        margin-bottom: 15px;
    }
    
    .cart-select-all-btn {
        display: flex;
        align-items: center;
        gap: 10px;
        background: none;
        border: none;
        cursor: pointer;
        font-size: 14px;
        font-weight: 500;
        color: var(--text-primary, #333);
    }
    
    .cart-select-all-info {
        font-size: 13px;
        color: var(--text-secondary, #666);
    }
    
    .cart-item {
        display: flex;
        align-items: center;
        padding: 15px;
        border-bottom: 1px solid var(--border-color, #eee);
        gap: 15px;
        flex-wrap: wrap;
    }
    
    .cart-select-checkbox {
        background: none;
        border: none;
        cursor: pointer;
        padding: 5px;
    }
    
    .cart-item-image {
        width: 80px;
        height: 80px;
        object-fit: cover;
        border-radius: 8px;
    }
    
    .cart-item-details {
        flex: 1;
        min-width: 150px;
    }
    
    .cart-item-details h3 {
        color: var(--text-primary, #333);
        margin: 0 0 5px 0;
    }
    
    .cart-item-size {
        font-size: 12px;
        color: var(--text-secondary, #666);
        margin-top: 4px;
    }
    
    .cart-item-price {
        color: #6366f1;
        font-weight: bold;
        margin-top: 4px;
    }
    
    .cart-quantity-controls {
        display: flex;
        align-items: center;
        gap: 10px;
    }
    
    .cart-qty-btn {
        width: 30px;
        height: 30px;
        border-radius: 5px;
        border: 1px solid var(--border-color, #ddd);
        background-color: var(--bg-secondary, #f5f5f5);
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        color: var(--text-primary, #333);
    }
    
    .cart-qty-btn:hover:not(:disabled) {
        background-color: var(--border-color, #e5e7eb);
    }
    
    .cart-qty-btn:disabled {
        opacity: 0.5;
        cursor: not-allowed;
    }
    
    .cart-quantity {
        min-width: 30px;
        text-align: center;
        color: var(--text-primary, #333);
    }
    
    .cart-item-total {
        min-width: 80px;
        text-align: right;
        color: var(--text-primary, #333);
    }
    
    .cart-remove-btn {
        background: transparent;
        border: none;
        color: #dc3545;
        cursor: pointer;
        font-size: 1.1rem;
        transition: transform 0.2s;
    }
    
    .cart-remove-btn:hover {
        transform: scale(1.1);
    }
    
    .cart-summary-section {
        background-color: var(--card-bg, #fff);
        border-radius: 8px;
        padding: 20px;
        height: fit-content;
        position: sticky;
        top: 80px;
        border: 1px solid var(--border-color, #e5e7eb);
    }
    
    .cart-summary-section h2 {
        color: var(--text-primary, #333);
        margin-bottom: 20px;
    }
    
    .cart-summary-row {
        display: flex;
        justify-content: space-between;
        margin-bottom: 10px;
        color: var(--text-primary, #333);
    }
    
    .cart-summary-total {
        display: flex;
        justify-content: space-between;
        font-size: 1.2rem;
        margin-top: 10px;
        color: var(--text-primary, #333);
    }
    
    .cart-divider {
        margin: 15px 0;
        border: none;
        border-top: 1px solid var(--border-color, #eee);
    }
    
    .cart-checkout-btn {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
        width: 100%;
        padding: 12px;
        background: linear-gradient(135deg, #059669, #10b981);
        color: #fff;
        text-align: center;
        text-decoration: none;
        border-radius: 5px;
        margin-top: 20px;
        border: none;
        cursor: pointer;
        transition: all 0.3s;
    }
    
    .cart-checkout-btn:hover {
        transform: translateY(-2px);
        background: linear-gradient(135deg, #047857, #059669);
    }
    
    .cart-disabled-checkout-btn {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
        width: 100%;
        padding: 12px;
        background-color: #ccc;
        color: #666;
        text-align: center;
        border-radius: 5px;
        margin-top: 20px;
        border: none;
        cursor: not-allowed;
    }
    
    body.dark-mode .cart-disabled-checkout-btn {
        background-color: #374151;
        color: #9ca3af;
    }
    
    .cart-clear-btn {
        width: 100%;
        padding: 12px;
        background-color: #dc3545;
        color: #fff;
        border: none;
        border-radius: 5px;
        margin-top: 10px;
        cursor: pointer;
        transition: all 0.3s;
    }
    
    .cart-clear-btn:hover {
        background-color: #c82333;
        transform: translateY(-2px);
    }
    
    /* Responsive */
    @media (max-width: 768px) {
        .cart-grid {
            grid-template-columns: 1fr;
            gap: 20px;
        }
        
        .cart-summary-section {
            position: static;
        }
        
        .cart-item {
            flex-direction: column;
            text-align: center;
        }
        
        .cart-item-details {
            text-align: center;
        }
        
        .cart-item-total {
            text-align: center;
        }
        
        .cart-select-all-row {
            flex-direction: column;
            gap: 10px;
        }
    }
    
    @media (max-width: 480px) {
        .cart-container {
            padding: 15px;
        }
        
        .cart-title {
            font-size: 1.5rem;
        }
        
        .cart-item-image {
            width: 100px;
            height: 100px;
        }
        
        .cart-quantity-controls {
            justify-content: center;
        }
    }
`;
document.head.appendChild(styleSheet);

export default CartPage;