import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { FaBox, FaClock, FaTruck, FaHome, FaEye, FaArchive, FaTrashRestore, FaArchive as FaArchiveAll, FaFilter } from 'react-icons/fa';
import toast from 'react-hot-toast';
import api from '../../services/api';

const OrdersPage = () => {
    const { user } = useSelector((state) => state.auth);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [showArchived, setShowArchived] = useState(false);
    const [localOrders, setLocalOrders] = useState([]);
    const [archiving, setArchiving] = useState(false);
    const [showArchiveOptions, setShowArchiveOptions] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (user) {
            loadOrders();
        }
    }, [user, showArchived]);

    const loadOrders = async () => {
        setLoading(true);
        try {
            const { data } = await api.get(`/orders/myorders?showArchived=${showArchived}`);
            setLocalOrders(data.orders);
        } catch (error) {
            console.error('Failed to load orders:', error);
            toast.error('Failed to load orders');
        } finally {
            setLoading(false);
        }
    };

    const handleArchiveOrder = async (orderId, archive) => {
        try {
            await api.put(`/orders/${orderId}/archive`, { archive });
            toast.success(archive ? 'Order archived' : 'Order restored');
            loadOrders();
        } catch (error) {
            toast.error('Failed to archive order');
        }
    };

    // Archive orders by status
    const archiveByStatus = async (status) => {
        const ordersToArchive = localOrders.filter(order => 
            order.status === status && !order.isArchived
        );
        
        if (ordersToArchive.length === 0) {
            toast.error(`No ${status} orders to archive`);
            return;
        }
        
        if (window.confirm(`Archive ${ordersToArchive.length} ${status} order(s)?`)) {
            setArchiving(true);
            try {
                for (const order of ordersToArchive) {
                    await api.put(`/orders/${order._id}/archive`, { archive: true });
                }
                toast.success(`${ordersToArchive.length} ${status} order(s) archived`);
                loadOrders();
            } catch (error) {
                toast.error('Failed to archive orders');
            } finally {
                setArchiving(false);
                setShowArchiveOptions(false);
            }
        }
    };

    // Archive all orders (except archived ones)
    const archiveAllOrders = async () => {
        const ordersToArchive = localOrders.filter(order => !order.isArchived);
        
        if (ordersToArchive.length === 0) {
            toast.error('No orders to archive');
            return;
        }
        
        if (window.confirm(`Archive all ${ordersToArchive.length} active order(s)?`)) {
            setArchiving(true);
            try {
                for (const order of ordersToArchive) {
                    await api.put(`/orders/${order._id}/archive`, { archive: true });
                }
                toast.success(`All ${ordersToArchive.length} order(s) archived`);
                loadOrders();
            } catch (error) {
                toast.error('Failed to archive orders');
            } finally {
                setArchiving(false);
                setShowArchiveOptions(false);
            }
        }
    };

    const getStatusIcon = (status) => {
        switch(status) {
            case 'Pending': return <FaClock style={{ color: '#f59e0b' }} />;
            case 'Processing': return <FaBox style={{ color: '#3b82f6' }} />;
            case 'Shipped': return <FaTruck style={{ color: '#10b981' }} />;
            case 'Delivered': return <FaHome style={{ color: '#10b981' }} />;
            default: return <FaClock style={{ color: '#6b7280' }} />;
        }
    };

    const getStatusColor = (status) => {
        switch(status) {
            case 'Pending': return '#f59e0b';
            case 'Processing': return '#3b82f6';
            case 'Shipped': return '#10b981';
            case 'Delivered': return '#10b981';
            default: return '#6b7280';
        }
    };

    // Get order counts by status
    const getOrderCounts = () => {
        const counts = {
            Pending: 0,
            Processing: 0,
            Shipped: 0,
            Delivered: 0,
            Cancelled: 0,
            Archived: 0
        };
        
        localOrders.forEach(order => {
            if (order.isArchived) {
                counts.Archived++;
            } else if (counts[order.status] !== undefined) {
                counts[order.status]++;
            }
        });
        
        return counts;
    };

    const orderCounts = getOrderCounts();

    if (!user) {
        return (
            <div className="orders-center">
                <h2>Please login to view your orders</h2>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="orders-center">
                <div className="spinner"></div>
                <p>Loading your orders...</p>
            </div>
        );
    }

    return (
        <div className="orders-container">
            <div className="orders-header">
                <h1 className="orders-title">My Orders</h1>
                <div className="orders-header-actions">
                    {/* Archive Dropdown Button */}
                    <div className="orders-archive-dropdown">
                        <button
                            onClick={() => setShowArchiveOptions(!showArchiveOptions)}
                            className="orders-archive-menu-btn"
                            disabled={archiving}
                        >
                            <FaArchiveAll /> Archive Options {!showArchiveOptions && <FaFilter size={12} />}
                        </button>
                        {showArchiveOptions && (
                            <div className="orders-archive-dropdown-menu">
                                <button onClick={() => archiveByStatus('Pending')} className="orders-dropdown-item">
                                    Archive Pending Orders ({orderCounts.Pending})
                                </button>
                                <button onClick={() => archiveByStatus('Processing')} className="orders-dropdown-item">
                                    Archive Processing Orders ({orderCounts.Processing})
                                </button>
                                <button onClick={() => archiveByStatus('Shipped')} className="orders-dropdown-item">
                                    Archive Shipped Orders ({orderCounts.Shipped})
                                </button>
                                <button onClick={() => archiveByStatus('Delivered')} className="orders-dropdown-item">
                                    Archive Delivered Orders ({orderCounts.Delivered})
                                </button>
                                <button onClick={() => archiveByStatus('Cancelled')} className="orders-dropdown-item">
                                    Archive Cancelled Orders ({orderCounts.Cancelled})
                                </button>
                                <hr className="orders-dropdown-divider" />
                                <button onClick={archiveAllOrders} className="orders-dropdown-item-all">
                                    Archive All Active Orders ({localOrders.filter(o => !o.isArchived).length})
                                </button>
                            </div>
                        )}
                    </div>
                    
                    {/* Toggle Archived View Button */}
                    <button
                        onClick={() => setShowArchived(!showArchived)}
                        className={`orders-archive-toggle-btn ${showArchived ? 'orders-archive-toggle-active' : 'orders-archive-toggle-inactive'}`}
                    >
                        <FaArchive /> {showArchived ? 'Showing Archived' : 'Hide Archived'}
                    </button>
                </div>
            </div>

            {/* Order Summary Stats */}
            <div className="orders-stats-bar">
                <div className="orders-stat-item">
                    <span>📋 Pending:</span>
                    <strong>{orderCounts.Pending}</strong>
                </div>
                <div className="orders-stat-item">
                    <span>⚙️ Processing:</span>
                    <strong>{orderCounts.Processing}</strong>
                </div>
                <div className="orders-stat-item">
                    <span>🚚 Shipped:</span>
                    <strong>{orderCounts.Shipped}</strong>
                </div>
                <div className="orders-stat-item">
                    <span>✅ Delivered:</span>
                    <strong>{orderCounts.Delivered}</strong>
                </div>
                <div className="orders-stat-item">
                    <span>📦 Archived:</span>
                    <strong>{orderCounts.Archived}</strong>
                </div>
            </div>

            {localOrders.filter(o => !o.isArchived).length === 0 && !showArchived ? (
                <div className="orders-center">
                    <h2>No active orders</h2>
                    {orderCounts.Archived > 0 && (
                        <button onClick={() => setShowArchived(true)} className="orders-show-active-btn">
                            View Archived Orders
                        </button>
                    )}
                </div>
            ) : localOrders.length === 0 ? (
                <div className="orders-center">
                    <h2>No orders found</h2>
                    <p>Start shopping to place your first order</p>
                </div>
            ) : (
                <div className="orders-grid">
                    {localOrders.map((order) => (
                        <div key={order._id} className={`orders-card ${order.isArchived ? 'orders-card-archived' : ''}`}>
                            <div className="orders-card-header">
                                <div>
                                    <span className="orders-label">Order ID:</span>
                                    <span className="orders-id">#{order._id.slice(-8)}</span>
                                </div>
                                <div>
                                    <span className="orders-label">Date:</span>
                                    <span>{new Date(order.createdAt).toLocaleDateString()}</span>
                                </div>
                                <div className="orders-status-badge" style={{ backgroundColor: `${getStatusColor(order.status)}20`, color: getStatusColor(order.status) }}>
                                    {getStatusIcon(order.status)}
                                    <span>{order.status}</span>
                                </div>
                                {order.isArchived && (
                                    <div className="orders-archived-badge">Archived</div>
                                )}
                            </div>
                            
                            <div className="orders-items">
                                {order.items.slice(0, 3).map((item, index) => (
                                    <div key={index} className="orders-item">
                                        <img 
                                            src={item.imageUrl || 'https://via.placeholder.com/60'} 
                                            alt={item.name}
                                            className="orders-item-image"
                                        />
                                        <div className="orders-item-details">
                                            <h4>{item.name}</h4>
                                            <p>Qty: {item.quantity} × ${item.price}</p>
                                        </div>
                                        <div className="orders-item-total">
                                            ${(item.price * item.quantity).toFixed(2)}
                                        </div>
                                    </div>
                                ))}
                                {order.items.length > 3 && (
                                    <p className="orders-more-items">+{order.items.length - 3} more items</p>
                                )}
                            </div>
                            
                            <div className="orders-card-footer">
                                <div className="orders-total">
                                    <strong>Total:</strong>
                                    <strong className="orders-total-amount">${order.totalPrice.toFixed(2)}</strong>
                                </div>
                                <div className="orders-action-buttons">
                                    <button onClick={() => setSelectedOrder(order)} className="orders-view-btn">
                                        <FaEye /> View Details
                                    </button>
                                    {!order.isArchived && (
                                        <button onClick={() => handleArchiveOrder(order._id, true)} className="orders-archive-btn">
                                            <FaArchive /> Archive
                                        </button>
                                    )}
                                    {order.isArchived && (
                                        <button onClick={() => handleArchiveOrder(order._id, false)} className="orders-restore-btn">
                                            <FaTrashRestore /> Restore
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
            
            {/* Order Details Modal */}
            {selectedOrder && (
                <div className="orders-modal">
                    <div className="orders-modal-content">
                        <div className="orders-modal-header">
                            <h2>Order Details</h2>
                            <button onClick={() => setSelectedOrder(null)} className="orders-close-btn">×</button>
                        </div>
                        
                        <div className="orders-info">
                            <div className="orders-info-row">
                                <strong>Order ID:</strong>
                                <span>{selectedOrder._id}</span>
                            </div>
                            <div className="orders-info-row">
                                <strong>Order Date:</strong>
                                <span>{new Date(selectedOrder.createdAt).toLocaleString()}</span>
                            </div>
                            <div className="orders-info-row">
                                <strong>Payment Method:</strong>
                                <span>{selectedOrder.paymentMethod}</span>
                            </div>
                            <div className="orders-info-row">
                                <strong>Order Status:</strong>
                                <span style={{ color: getStatusColor(selectedOrder.status) }}>{selectedOrder.status}</span>
                            </div>
                        </div>
                        
                        <h3>Shipping Address</h3>
                        <div className="orders-address-info">
                            <p>{selectedOrder.shippingAddress?.fullName}</p>
                            <p>{selectedOrder.shippingAddress?.address}</p>
                            <p>{selectedOrder.shippingAddress?.city}, {selectedOrder.shippingAddress?.postalCode}</p>
                            <p>{selectedOrder.shippingAddress?.country}</p>
                            <p>Phone: {selectedOrder.shippingAddress?.phone}</p>
                        </div>
                        
                        <h3>Order Items</h3>
                        <table className="orders-items-table">
                            <thead>
                                <tr>
                                    <th>Product</th>
                                    <th>Quantity</th>
                                    <th>Price</th>
                                    <th>Total</th>
                                </tr>
                            </thead>
                            <tbody>
                                {selectedOrder.items.map((item, index) => (
                                    <tr key={index}>
                                        <td>
                                            <div className="orders-item-cell">
                                                <img src={item.imageUrl || 'https://via.placeholder.com/40'} alt={item.name} className="orders-small-image" />
                                                <span>{item.name}</span>
                                            </div>
                                        </td>
                                        <td>{item.quantity}</td>
                                        <td>${item.price}</td>
                                        <td>${(item.price * item.quantity).toFixed(2)}</td>
                                    </tr>
                                ))}
                            </tbody>
                            <tfoot>
                                <tr>
                                    <td colSpan="3" className="orders-total-row">Total:</td>
                                    <td className="orders-total-amount-modal">${selectedOrder.totalPrice.toFixed(2)}</td>
                                </tr>
                            </tfoot>
                        </table>
                        
                        <button onClick={() => setSelectedOrder(null)} className="orders-done-btn">
                            Close
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

// Inject CSS Styles for OrdersPage
const styleSheet = document.createElement("style");
styleSheet.textContent = `
    /* Orders Page Styles - Dark Mode Compatible */
    
    .orders-center {
        text-align: center;
        padding: 50px;
        color: var(--text-primary, #333);
    }
    
    .orders-center h2 {
        color: var(--text-primary, #333);
    }
    
    .orders-center p {
        color: var(--text-secondary, #666);
    }
    
    .orders-container {
        max-width: 1200px;
        margin: 0 auto;
        padding: 20px;
    }
    
    .orders-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 20px;
        flex-wrap: wrap;
        gap: 15px;
    }
    
    .orders-title {
        font-size: 2rem;
        color: var(--text-primary, #333);
        margin: 0;
    }
    
    body.dark-mode .orders-title {
        color: #ffffff;
    }
    
    .orders-header-actions {
        display: flex;
        gap: 10px;
        position: relative;
    }
    
    .orders-stats-bar {
        display: flex;
        gap: 20px;
        padding: 15px;
        background-color: var(--bg-secondary, #f8f9fa);
        border-radius: 8px;
        margin-bottom: 25px;
        flex-wrap: wrap;
        justify-content: space-around;
        border: 1px solid var(--border-color, #e5e7eb);
    }
    
    body.dark-mode .orders-stats-bar {
        background-color: #1a1a1a;
        border-color: #333333;
    }
    
    .orders-stat-item {
        display: flex;
        gap: 8px;
        align-items: center;
        font-size: 14px;
        color: var(--text-primary, #333);
    }
    
    body.dark-mode .orders-stat-item {
        color: #d1d5db;
    }
    
    /* Archive Dropdown */
    .orders-archive-dropdown {
        position: relative;
    }
    
    .orders-archive-menu-btn {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 8px 16px;
        background: linear-gradient(135deg, #4f46e5, #6366f1);
        color: #fff;
        border: none;
        border-radius: 0.5rem;
        cursor: pointer;
    }
    
    .orders-archive-menu-btn:hover:not(:disabled) {
        transform: translateY(-2px);
    }
    
    .orders-archive-dropdown-menu {
        position: absolute;
        top: 100%;
        right: 0;
        margin-top: 5px;
        background-color: var(--card-bg, #fff);
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        z-index: 100;
        min-width: 220px;
        overflow: hidden;
        border: 1px solid var(--border-color, #e5e7eb);
    }
    
    body.dark-mode .orders-archive-dropdown-menu {
        background-color: #1a1a1a;
        border-color: #333333;
    }
    
    .orders-dropdown-item {
        display: block;
        width: 100%;
        padding: 10px 16px;
        text-align: left;
        border: none;
        background-color: transparent;
        cursor: pointer;
        transition: background-color 0.3s;
        color: var(--text-primary, #333);
    }
    
    .orders-dropdown-item:hover {
        background-color: var(--bg-secondary, #f3f4f6);
    }
    
    body.dark-mode .orders-dropdown-item:hover {
        background-color: #2a2a2a;
    }
    
    .orders-dropdown-item-all {
        display: block;
        width: 100%;
        padding: 10px 16px;
        text-align: left;
        border: none;
        background-color: #fee2e2;
        cursor: pointer;
        color: #dc2626;
        font-weight: bold;
    }
    
    body.dark-mode .orders-dropdown-item-all {
        background-color: #7f1d1d;
        color: #fca5a5;
    }
    
    .orders-dropdown-divider {
        margin: 5px 0;
        border: none;
        border-top: 1px solid var(--border-color, #eee);
    }
    
    body.dark-mode .orders-dropdown-divider {
        border-top-color: #333333;
    }
    
    .orders-archive-toggle-btn {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 8px 16px;
        border: none;
        border-radius: 0.5rem;
        cursor: pointer;
        transition: all 0.3s;
    }
    
    .orders-archive-toggle-active {
        background-color: #6366f1;
        color: #fff;
    }
    
    .orders-archive-toggle-inactive {
        background-color: var(--bg-secondary, #e5e7eb);
        color: var(--text-primary, #333);
    }
    
    body.dark-mode .orders-archive-toggle-inactive {
        background-color: #1a1a1a;
        color: #d1d5db;
        border: 1px solid #333333;
    }
    
    .orders-grid {
        display: flex;
        flex-direction: column;
        gap: 20px;
    }
    
    .orders-card {
        background-color: var(--card-bg, #fff);
        border-radius: 1rem;
        overflow: hidden;
        box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        transition: opacity 0.3s;
        border: 1px solid var(--border-color, #e5e7eb);
    }
    
    .orders-card-archived {
        opacity: 0.7;
    }
    
    .orders-card-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 15px 20px;
        background-color: var(--bg-secondary, #f8f9fa);
        border-bottom: 1px solid var(--border-color, #eee);
        flex-wrap: wrap;
        gap: 10px;
    }
    
    body.dark-mode .orders-card-header {
        background-color: #0a0a0a;
        border-bottom-color: #333333;
    }
    
    .orders-label {
        font-weight: 500;
        color: var(--text-secondary, #666);
        margin-right: 8px;
    }
    
    .orders-id {
        font-family: monospace;
        font-weight: bold;
        color: var(--text-primary, #333);
    }
    
    body.dark-mode .orders-id {
        color: #ffffff;
    }
    
    .orders-status-badge {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 5px 12px;
        border-radius: 20px;
        font-size: 0.875rem;
        font-weight: 500;
    }
    
    .orders-archived-badge {
        background-color: #9ca3af;
        color: #fff;
        padding: 4px 10px;
        border-radius: 20px;
        font-size: 0.75rem;
    }
    
    .orders-items {
        padding: 20px;
    }
    
    .orders-item {
        display: flex;
        align-items: center;
        gap: 15px;
        padding: 10px 0;
        border-bottom: 1px solid var(--border-color, #f0f0f0);
    }
    
    body.dark-mode .orders-item {
        border-bottom-color: #333333;
    }
    
    .orders-item-image {
        width: 60px;
        height: 60px;
        object-fit: cover;
        border-radius: 8px;
    }
    
    .orders-item-details {
        flex: 1;
    }
    
    .orders-item-details h4 {
        color: var(--text-primary, #333);
        margin: 0 0 5px 0;
    }
    
    body.dark-mode .orders-item-details h4 {
        color: #ffffff;
    }
    
    .orders-item-details p {
        color: var(--text-secondary, #666);
        margin: 0;
    }
    
    .orders-item-total {
        font-weight: bold;
        color: #6366f1;
    }
    
    .orders-more-items {
        color: var(--text-secondary, #666);
        font-size: 0.875rem;
        margin-top: 10px;
        font-style: italic;
    }
    
    .orders-card-footer {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 15px 20px;
        background-color: var(--bg-secondary, #f8f9fa);
        border-top: 1px solid var(--border-color, #eee);
        flex-wrap: wrap;
        gap: 15px;
    }
    
    body.dark-mode .orders-card-footer {
        background-color: #0a0a0a;
        border-top-color: #333333;
    }
    
    .orders-total {
        display: flex;
        gap: 10px;
        font-size: 1.1rem;
        color: var(--text-primary, #333);
    }
    
    body.dark-mode .orders-total {
        color: #ffffff;
    }
    
    .orders-total-amount {
        color: #10b981;
        font-size: 1.25rem;
    }
    
    .orders-action-buttons {
        display: flex;
        gap: 10px;
    }
    
    .orders-view-btn {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 8px 16px;
        background: linear-gradient(135deg, #4f46e5, #6366f1);
        color: #fff;
        border: none;
        border-radius: 0.5rem;
        cursor: pointer;
    }
    
    .orders-view-btn:hover {
        transform: translateY(-2px);
    }
    
    .orders-archive-btn {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 8px 16px;
        background-color: #f59e0b;
        color: #fff;
        border: none;
        border-radius: 0.5rem;
        cursor: pointer;
    }
    
    .orders-archive-btn:hover {
        background-color: #d97706;
        transform: translateY(-2px);
    }
    
    .orders-restore-btn {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 8px 16px;
        background-color: #10b981;
        color: #fff;
        border: none;
        border-radius: 0.5rem;
        cursor: pointer;
    }
    
    .orders-restore-btn:hover {
        background-color: #059669;
        transform: translateY(-2px);
    }
    
    .orders-show-active-btn {
        margin-top: 20px;
        padding: 10px 20px;
        background: linear-gradient(135deg, #4f46e5, #6366f1);
        color: #fff;
        border: none;
        border-radius: 0.5rem;
        cursor: pointer;
    }
    
    /* Modal Styles */
    .orders-modal {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background-color: rgba(0,0,0,0.5);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 1000;
    }
    
    .orders-modal-content {
        background-color: var(--card-bg, #fff);
        border-radius: 1rem;
        padding: 30px;
        width: 90%;
        max-width: 800px;
        max-height: 90vh;
        overflow: auto;
        border: 1px solid var(--border-color, #e5e7eb);
    }
    
    body.dark-mode .orders-modal-content {
        background-color: #1a1a1a;
    }
    
    .orders-modal-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 20px;
        padding-bottom: 15px;
        border-bottom: 1px solid var(--border-color, #eee);
    }
    
    .orders-modal-header h2 {
        color: var(--text-primary, #333);
        margin: 0;
    }
    
    body.dark-mode .orders-modal-header h2 {
        color: #ffffff;
    }
    
    .orders-close-btn {
        background: none;
        border: none;
        font-size: 28px;
        cursor: pointer;
        color: var(--text-secondary, #999);
    }
    
    .orders-info {
        background-color: var(--bg-secondary, #f8f9fa);
        padding: 15px;
        border-radius: 8px;
        margin-bottom: 20px;
        border: 1px solid var(--border-color, #e5e7eb);
    }
    
    body.dark-mode .orders-info {
        background-color: #0a0a0a;
        border-color: #333333;
    }
    
    .orders-info-row {
        display: flex;
        justify-content: space-between;
        padding: 8px 0;
        border-bottom: 1px solid var(--border-color, #eee);
        color: var(--text-primary, #333);
    }
    
    body.dark-mode .orders-info-row {
        border-bottom-color: #333333;
        color: #d1d5db;
    }
    
    .orders-address-info {
        background-color: var(--bg-secondary, #f8f9fa);
        padding: 15px;
        border-radius: 8px;
        margin-bottom: 20px;
        line-height: 1.6;
        color: var(--text-primary, #333);
        border: 1px solid var(--border-color, #e5e7eb);
    }
    
    body.dark-mode .orders-address-info {
        background-color: #0a0a0a;
        border-color: #333333;
        color: #d1d5db;
    }
    
    .orders-items-table {
        width: 100%;
        border-collapse: collapse;
        margin-bottom: 20px;
    }
    
    .orders-items-table th,
    .orders-items-table td {
        padding: 10px;
        text-align: left;
        border-bottom: 1px solid var(--border-color, #eee);
        color: var(--text-primary, #333);
    }
    
    body.dark-mode .orders-items-table th,
    body.dark-mode .orders-items-table td {
        border-bottom-color: #333333;
        color: #d1d5db;
    }
    
    .orders-item-cell {
        display: flex;
        align-items: center;
        gap: 10px;
    }
    
    .orders-small-image {
        width: 40px;
        height: 40px;
        object-fit: cover;
        border-radius: 4px;
    }
    
    .orders-total-row {
        text-align: right;
        font-weight: bold;
        padding-top: 10px;
    }
    
    .orders-total-amount-modal {
        color: #10b981;
        font-weight: bold;
    }
    
    .orders-done-btn {
        width: 100%;
        padding: 12px;
        background: linear-gradient(135deg, #4f46e5, #6366f1);
        color: #fff;
        border: none;
        border-radius: 0.5rem;
        cursor: pointer;
        margin-top: 10px;
    }
    
    .orders-done-btn:hover {
        transform: translateY(-2px);
    }
    
    /* Responsive */
    @media (max-width: 768px) {
        .orders-container {
            padding: 15px;
        }
        
        .orders-title {
            font-size: 1.5rem;
        }
        
        .orders-card-header,
        .orders-card-footer {
            flex-direction: column;
            align-items: flex-start;
        }
        
        .orders-action-buttons {
            width: 100%;
        }
        
        .orders-view-btn,
        .orders-archive-btn,
        .orders-restore-btn {
            flex: 1;
            justify-content: center;
        }
        
        .orders-modal-content {
            padding: 20px;
        }
    }
    
    @media (max-width: 480px) {
        .orders-stats-bar {
            gap: 10px;
        }
        
        .orders-stat-item {
            font-size: 12px;
        }
        
        .orders-item {
            flex-wrap: wrap;
        }
        
        .orders-item-total {
            margin-left: auto;
        }
    }
`;
document.head.appendChild(styleSheet);

export default OrdersPage;