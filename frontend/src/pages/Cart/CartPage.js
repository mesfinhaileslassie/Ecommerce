import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { updateCartItem, removeFromCart, clearCart, fetchCart } from '../../redux/slices/cartSlice';
import { FaTrash, FaPlus, FaMinus, FaCheckSquare, FaSquare, FaMoneyBillWave } from 'react-icons/fa';
import toast from 'react-hot-toast';

const CartPage = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();  // Add this line
    const { items, totalPrice, itemCount, loading } = useSelector((state) => state.cart);
    const { user, token } = useSelector((state) => state.auth);
    const [updating, setUpdating] = React.useState(false);
    const [selectedItems, setSelectedItems] = React.useState({});
    const [selectAll, setSelectAll] = React.useState(true);

    useEffect(() => {
        if (token && user) {
            loadCart();
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
                    setSelectedItems({});
                    setSelectAll(true);
                }
            } catch (error) {
                toast.error('Clear failed');
            }
        }
    };

    const { total: selectedTotal, count: selectedCount } = getSelectedTotal();

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
                    {/* Select All Header */}
                    <div style={styles.selectAllRow}>
                        <button onClick={handleSelectAll} style={styles.selectAllBtn}>
                            {selectAll ? <FaCheckSquare color="#6366f1" /> : <FaSquare color="#999" />}
                            <span>Select All Items</span>
                        </button>
                        <span style={styles.selectAllInfo}>{selectedCount} of {items.length} items selected</span>
                    </div>
                    
                    {items.map((item) => {
                        const itemId = item.product?._id || item.product;
                        return (
                            <div key={itemId} style={styles.cartItem}>
                                <button 
                                    onClick={() => handleSelectItem(itemId)}
                                    style={styles.selectCheckbox}
                                >
                                    {selectedItems[itemId] ? <FaCheckSquare color="#6366f1" size={20} /> : <FaSquare color="#999" size={20} />}
                                </button>
                                
                                <img 
                                    src={item.imageUrl || 'https://via.placeholder.com/100'} 
                                    alt={item.name}
                                    style={styles.itemImage}
                                />
                                
                                <div style={styles.itemDetails}>
                                    <h3>{item.name}</h3>
                                    {item.size && <p style={styles.itemSize}>Size: {item.size}</p>}
                                    <p style={styles.itemPrice}>${item.price.toFixed(2)}</p>
                                </div>
                                
                                <div style={styles.quantityControls}>
                                    <button 
                                        onClick={() => handleUpdateQuantity(itemId, item.quantity - 1)}
                                        disabled={updating}
                                        style={styles.qtyBtn}
                                    >
                                        <FaMinus />
                                    </button>
                                    <span style={styles.quantity}>{item.quantity}</span>
                                    <button 
                                        onClick={() => handleUpdateQuantity(itemId, item.quantity + 1)}
                                        disabled={updating}
                                        style={styles.qtyBtn}
                                    >
                                        <FaPlus />
                                    </button>
                                </div>
                                
                                <div style={styles.itemTotal}>
                                    <strong>${(item.price * item.quantity).toFixed(2)}</strong>
                                </div>
                                
                                <button 
                                    onClick={() => handleRemoveItem(itemId)}
                                    style={styles.removeBtn}
                                >
                                    <FaTrash />
                                </button>
                            </div>
                        );
                    })}
                </div>
                
                <div style={styles.summarySection}>
                    <h2>Order Summary</h2>
                    
                    <div style={styles.summaryRow}>
                        <span>Selected Items ({selectedCount}):</span>
                        <span>${selectedTotal.toFixed(2)}</span>
                    </div>
                    
                    <div style={styles.summaryRow}>
                        <span>Total Items in Cart ({itemCount}):</span>
                        <span>${totalPrice.toFixed(2)}</span>
                    </div>
                    
                    <div style={styles.summaryRow}>
                        <span>Shipping:</span>
                        <span>Free</span>
                    </div>
                    
                    <hr style={styles.divider} />
                    
                    <div style={styles.summaryTotal}>
                        <strong>Selected Total:</strong>
                        <strong>${selectedTotal.toFixed(2)}</strong>
                    </div>
                    
                    {selectedCount === 0 ? (
                        <button style={styles.disabledCheckoutBtn} disabled>
                            Select Items to Checkout
                        </button>
                    ) : (
                        <button onClick={handleCheckout} style={styles.checkoutBtn}>
                            <FaMoneyBillWave /> Checkout Selected ({selectedCount})
                        </button>
                    )}
                    
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
    selectAllRow: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '10px 0',
        borderBottom: '2px solid #eee',
        marginBottom: '15px',
    },
    selectAllBtn: {
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        background: 'none',
        border: 'none',
        cursor: 'pointer',
        fontSize: '14px',
        fontWeight: '500',
        color: '#333',
    },
    selectAllInfo: {
        fontSize: '13px',
        color: '#666',
    },
    cartItem: {
        display: 'flex',
        alignItems: 'center',
        padding: '15px',
        borderBottom: '1px solid #eee',
        gap: '15px',
    },
    selectCheckbox: {
        background: 'none',
        border: 'none',
        cursor: 'pointer',
        padding: '5px',
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
    itemSize: {
        fontSize: '12px',
        color: '#666',
        marginTop: '4px',
    },
    itemPrice: {
        color: '#007bff',
        fontWeight: 'bold',
        marginTop: '4px',
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
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '8px',
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
    disabledCheckoutBtn: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '8px',
        width: '100%',
        padding: '12px',
        backgroundColor: '#ccc',
        color: '#666',
        textAlign: 'center',
        borderRadius: '5px',
        marginTop: '20px',
        border: 'none',
        cursor: 'not-allowed',
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