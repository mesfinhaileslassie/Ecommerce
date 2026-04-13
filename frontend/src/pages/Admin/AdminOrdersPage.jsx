import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import api from '../../services/api';
import { FaEye, FaSpinner, FaSearch, FaSync, FaChevronLeft, FaChevronRight, FaCheckDouble, FaTimes, FaTruck, FaBox, FaCheck } from 'react-icons/fa';
import toast from 'react-hot-toast';

const AdminOrdersPage = () => {
    const { user } = useSelector((state) => state.auth);
    const [orders, setOrders] = useState([]);
    const [filteredOrders, setFilteredOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [statusFilter, setStatusFilter] = useState('All');
    const [searchTerm, setSearchTerm] = useState('');
    const [updating, setUpdating] = useState(false);
    const [selectedOrders, setSelectedOrders] = useState([]);
    const [selectAll, setSelectAll] = useState(false);
    const [showBulkBar, setShowBulkBar] = useState(false);
    
    // Pagination
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(20);

    const statuses = ['All', 'Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'];

    // Bulk action options
    const bulkActions = [
        { value: 'Processing', label: 'Mark as Processing', icon: <FaBox />, color: '#3b82f6' },
        { value: 'Shipped', label: 'Mark as Shipped', icon: <FaTruck />, color: '#10b981' },
        { value: 'Delivered', label: 'Mark as Delivered', icon: <FaCheck />, color: '#10b981' },
        { value: 'Cancelled', label: 'Cancel Selected', icon: <FaTimes />, color: '#dc3545' }
    ];

    useEffect(() => {
        if (user && user.isAdmin) {
            fetchOrders();
        }
    }, [user]);

    useEffect(() => {
        filterOrders();
    }, [orders, statusFilter, searchTerm]);

    useEffect(() => {
        setShowBulkBar(selectedOrders.length > 0);
    }, [selectedOrders]);

    const fetchOrders = async () => {
        try {
            const { data } = await api.get('/orders');
            setOrders(data.orders);
            setFilteredOrders(data.orders);
        } catch (error) {
            toast.error('Failed to fetch orders');
        } finally {
            setLoading(false);
        }
    };

    const filterOrders = () => {
        let filtered = [...orders];
        
        if (statusFilter !== 'All') {
            filtered = filtered.filter(order => order.status === statusFilter);
        }
        
        if (searchTerm) {
            filtered = filtered.filter(order => 
                order._id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                order.user?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                order.user?.email?.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }
        
        setFilteredOrders(filtered);
        setCurrentPage(1);
        setSelectedOrders([]);
        setSelectAll(false);
    };

    const updateOrderStatus = async (orderId, newStatus) => {
        setUpdating(true);
        try {
            await api.put(`/orders/${orderId}/status`, { status: newStatus });
            toast.success(`Order status updated to ${newStatus}`);
            fetchOrders();
        } catch (error) {
            toast.error('Failed to update status');
        } finally {
            setUpdating(false);
        }
    };

    // Bulk update selected orders
    const bulkUpdateStatus = async (newStatus) => {
        if (selectedOrders.length === 0) {
            toast.error('No orders selected');
            return;
        }
        
        const confirmMessage = `Update ${selectedOrders.length} order(s) to ${newStatus}?`;
        if (!window.confirm(confirmMessage)) return;
        
        setUpdating(true);
        let successCount = 0;
        let failCount = 0;
        
        for (const orderId of selectedOrders) {
            try {
                await api.put(`/orders/${orderId}/status`, { status: newStatus });
                successCount++;
            } catch (error) {
                failCount++;
            }
        }
        
        if (successCount > 0) {
            toast.success(`${successCount} order(s) updated to ${newStatus}`);
        }
        if (failCount > 0) {
            toast.error(`${failCount} order(s) failed to update`);
        }
        
        setSelectedOrders([]);
        setSelectAll(false);
        fetchOrders();
        setUpdating(false);
    };

    // Bulk delete selected orders (optional)
    const bulkDeleteOrders = async () => {
        if (selectedOrders.length === 0) {
            toast.error('No orders selected');
            return;
        }
        
        const confirmMessage = `⚠️ WARNING: This will permanently delete ${selectedOrders.length} order(s). This action cannot be undone. Continue?`;
        if (!window.confirm(confirmMessage)) return;
        
        setUpdating(true);
        let successCount = 0;
        let failCount = 0;
        
        for (const orderId of selectedOrders) {
            try {
                await api.delete(`/orders/${orderId}`);
                successCount++;
            } catch (error) {
                failCount++;
            }
        }
        
        if (successCount > 0) {
            toast.success(`${successCount} order(s) deleted`);
        }
        if (failCount > 0) {
            toast.error(`${failCount} order(s) failed to delete`);
        }
        
        setSelectedOrders([]);
        setSelectAll(false);
        fetchOrders();
        setUpdating(false);
    };

    const handleSelectOrder = (orderId) => {
        setSelectedOrders(prev => 
            prev.includes(orderId) 
                ? prev.filter(id => id !== orderId)
                : [...prev, orderId]
        );
    };

    const handleSelectAll = () => {
        if (selectAll) {
            setSelectedOrders([]);
        } else {
            const currentOrderIds = currentOrders.map(order => order._id);
            setSelectedOrders(currentOrderIds);
        }
        setSelectAll(!selectAll);
    };

    const getStatusColor = (status) => {
        switch(status) {
            case 'Pending': return { bg: '#fef3c7', text: '#92400e' };
            case 'Processing': return { bg: '#dbeafe', text: '#1e40af' };
            case 'Shipped': return { bg: '#d1fae5', text: '#065f46' };
            case 'Delivered': return { bg: '#d1fae5', text: '#065f46' };
            case 'Cancelled': return { bg: '#fee2e2', text: '#991b1b' };
            default: return { bg: '#f3f4f6', text: '#374151' };
        }
    };

    // Pagination logic
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentOrders = filteredOrders.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);

    if (!user || !user.isAdmin) {
        return (
            <div className="orders-center">
                <h2>Access Denied</h2>
                <p>You need admin privileges to view this page.</p>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="orders-center">
                <FaSpinner className="orders-spinner" />
                <p>Loading orders...</p>
            </div>
        );
    }

    return (
        <div className="orders-container">
            <div className="orders-header">
                <h1 className="orders-title">Order Management</h1>
                <button onClick={fetchOrders} className="orders-refresh-btn">
                    <FaSync /> Refresh
                </button>
            </div>

            {/* Stats Summary */}
            <div className="orders-stats-grid">
                <div className="orders-stat-card">
                    <h3>Total Orders</h3>
                    <p>{orders.length}</p>
                </div>
                <div className="orders-stat-card">
                    <h3>Pending</h3>
                    <p>{orders.filter(o => o.status === 'Pending').length}</p>
                </div>
                <div className="orders-stat-card">
                    <h3>Processing</h3>
                    <p>{orders.filter(o => o.status === 'Processing').length}</p>
                </div>
                <div className="orders-stat-card">
                    <h3>Shipped</h3>
                    <p>{orders.filter(o => o.status === 'Shipped').length}</p>
                </div>
                <div className="orders-stat-card">
                    <h3>Delivered</h3>
                    <p>{orders.filter(o => o.status === 'Delivered').length}</p>
                </div>
            </div>

            {/* Filters Bar */}
            <div className="orders-filters-bar">
                <div className="orders-search-container">
                    <FaSearch className="orders-search-icon" />
                    <input
                        type="text"
                        placeholder="Search by Order ID or Customer..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="orders-search-input"
                    />
                </div>
                <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="orders-filter-select"
                >
                    {statuses.map(status => (
                        <option key={status} value={status}>{status}</option>
                    ))}
                </select>
            </div>

            {/* Bulk Actions Bar */}
            {showBulkBar && (
                <div className="orders-bulk-bar">
                    <div className="orders-bulk-info">
                        <FaCheckDouble className="orders-bulk-icon" />
                        <span>{selectedOrders.length} order(s) selected</span>
                    </div>
                    <div className="orders-bulk-actions">
                        {bulkActions.map(action => (
                            <button
                                key={action.value}
                                onClick={() => bulkUpdateStatus(action.value)}
                                className="orders-bulk-action-btn"
                                style={{ backgroundColor: action.color }}
                                disabled={updating}
                            >
                                {action.icon} {action.label}
                            </button>
                        ))}
                        <button
                            onClick={bulkDeleteOrders}
                            className="orders-bulk-delete-btn"
                            disabled={updating}
                        >
                            <FaTimes /> Delete Selected
                        </button>
                    </div>
                </div>
            )}

            {/* Orders Table */}
            <div className="orders-table-container">
                <table className="orders-table">
                    <thead>
                        <tr>
                            <th style={{ width: '40px' }}>
                                <input
                                    type="checkbox"
                                    checked={selectAll && currentOrders.length > 0}
                                    onChange={handleSelectAll}
                                    disabled={currentOrders.length === 0}
                                />
                            </th>
                            <th>Order ID</th>
                            <th>Customer</th>
                            <th>Total</th>
                            <th>Status</th>
                            <th>Date</th>
                            <th>Items</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {currentOrders.length === 0 ? (
                            <tr>
                                <td colSpan="8" className="orders-empty-cell">
                                    No orders found
                                </td>
                            </tr>
                        ) : (
                            currentOrders.map((order) => {
                                const statusStyle = getStatusColor(order.status);
                                return (
                                    <tr key={order._id} className={selectedOrders.includes(order._id) ? 'orders-selected-row' : ''}>
                                        <td>
                                            <input
                                                type="checkbox"
                                                checked={selectedOrders.includes(order._id)}
                                                onChange={() => handleSelectOrder(order._id)}
                                            />
                                        </td>
                                        <td className="orders-order-id">#{order._id.slice(-8)}</td>
                                        <td>
                                            <div>{order.user?.name || 'Guest'}</div>
                                            <small className="orders-customer-email">{order.user?.email || 'N/A'}</small>
                                        </td>
                                        <td className="orders-total-cell">${order.totalPrice.toFixed(2)}</td>
                                        <td>
                                            <select
                                                value={order.status}
                                                onChange={(e) => updateOrderStatus(order._id, e.target.value)}
                                                className="orders-status-select"
                                                style={{
                                                    backgroundColor: statusStyle.bg,
                                                    color: statusStyle.text,
                                                }}
                                                disabled={updating}
                                            >
                                                <option value="Pending">Pending</option>
                                                <option value="Processing">Processing</option>
                                                <option value="Shipped">Shipped</option>
                                                <option value="Delivered">Delivered</option>
                                                <option value="Cancelled">Cancelled</option>
                                            </select>
                                        </td>
                                        <td>{new Date(order.createdAt).toLocaleDateString()}</td>
                                        <td>{order.items.length}</td>
                                        <td>
                                            <button
                                                onClick={() => setSelectedOrder(order)}
                                                className="orders-view-btn"
                                                title="View Details"
                                            >
                                                <FaEye />
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="orders-pagination">
                    <button
                        onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                        disabled={currentPage === 1}
                        className="orders-page-btn"
                    >
                        <FaChevronLeft /> Previous
                    </button>
                    <span className="orders-page-info">
                        Page {currentPage} of {totalPages} ({filteredOrders.length} orders)
                    </span>
                    <button
                        onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                        disabled={currentPage === totalPages}
                        className="orders-page-btn"
                    >
                        Next <FaChevronRight />
                    </button>
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
                        
                        <div className="orders-order-info">
                            <div className="orders-info-row">
                                <strong>Order ID:</strong>
                                <span>{selectedOrder._id}</span>
                            </div>
                            <div className="orders-info-row">
                                <strong>Customer:</strong>
                                <span>{selectedOrder.user?.name || 'Guest'}</span>
                            </div>
                            <div className="orders-info-row">
                                <strong>Email:</strong>
                                <span>{selectedOrder.user?.email || 'N/A'}</span>
                            </div>
                            <div className="orders-info-row">
                                <strong>Date:</strong>
                                <span>{new Date(selectedOrder.createdAt).toLocaleString()}</span>
                            </div>
                            <div className="orders-info-row">
                                <strong>Payment Method:</strong>
                                <span>{selectedOrder.paymentMethod}</span>
                            </div>
                            <div className="orders-info-row">
                                <strong>Total:</strong>
                                <span>${selectedOrder.totalPrice.toFixed(2)}</span>
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
                                        <td>{item.name}</td>
                                        <td>{item.quantity}</td>
                                        <td>${item.price}</td>
                                        <td>${(item.price * item.quantity).toFixed(2)}</td>
                                    </tr>
                                ))}
                            </tbody>
                            <tfoot>
                                <tr>
                                    <td colSpan="3" className="orders-total-row">Total:</td>
                                    <td className="orders-total-amount">${selectedOrder.totalPrice.toFixed(2)}</td>
                                </tr>
                            </tfoot>
                        </table>
                        
                        <div className="orders-modal-actions">
                            <button
                                onClick={() => {
                                    updateOrderStatus(selectedOrder._id, 'Processing');
                                    setSelectedOrder(null);
                                }}
                                className="orders-modal-btn"
                            >
                                Mark Processing
                            </button>
                            <button
                                onClick={() => {
                                    updateOrderStatus(selectedOrder._id, 'Shipped');
                                    setSelectedOrder(null);
                                }}
                                className="orders-modal-btn"
                            >
                                Mark Shipped
                            </button>
                            <button
                                onClick={() => {
                                    updateOrderStatus(selectedOrder._id, 'Delivered');
                                    setSelectedOrder(null);
                                }}
                                className="orders-modal-btn"
                            >
                                Mark Delivered
                            </button>
                            <button
                                onClick={() => setSelectedOrder(null)}
                                className="orders-close-modal-btn"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

// Inject CSS Styles for Orders Page
const styleSheet = document.createElement("style");
styleSheet.textContent = `
    /* Orders Page Styles - Dark Mode Compatible */
    .orders-center {
        text-align: center;
        padding: 50px;
    }
    
    .orders-spinner {
        animation: spin 1s linear infinite;
        font-size: 2rem;
        color: #6366f1;
        margin-bottom: 1rem;
    }
    
    .orders-container {
        max-width: 1400px;
        margin: 0 auto;
        padding: 20px;
    }
    
    .orders-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 30px;
        flex-wrap: wrap;
        gap: 15px;
    }
    
    .orders-title {
        font-size: 1.8rem;
        color: var(--text-primary, #333);
        margin: 0;
    }
    
    .orders-refresh-btn {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 10px 20px;
        background: linear-gradient(135deg, #4f46e5, #6366f1);
        color: #fff;
        border: none;
        border-radius: 0.5rem;
        cursor: pointer;
    }
    
    .orders-stats-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
        gap: 20px;
        margin-bottom: 30px;
    }
    
    .orders-stat-card {
        background-color: var(--card-bg, #fff);
        padding: 20px;
        border-radius: 1rem;
        text-align: center;
        box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        border: 1px solid var(--border-color, #e5e7eb);
    }
    
    .orders-stat-card h3 {
        color: var(--text-secondary, #666);
        margin-bottom: 10px;
        font-size: 0.85rem;
    }
    
    .orders-stat-card p {
        color: var(--text-primary, #333);
        font-size: 1.8rem;
        font-weight: bold;
        margin: 0;
    }
    
    .orders-filters-bar {
        display: flex;
        gap: 15px;
        margin-bottom: 20px;
        flex-wrap: wrap;
    }
    
    .orders-search-container {
        flex: 1;
        position: relative;
        min-width: 250px;
    }
    
    .orders-search-icon {
        position: absolute;
        left: 12px;
        top: 50%;
        transform: translateY(-50%);
        color: var(--text-secondary, #999);
    }
    
    .orders-search-input {
        width: 100%;
        padding: 10px 10px 10px 35px;
        border: 1px solid var(--border-color, #ddd);
        border-radius: 0.5rem;
        font-size: 14px;
        background-color: var(--input-bg, #fff);
        color: var(--text-primary, #333);
    }
    
    .orders-filter-select {
        padding: 10px;
        border: 1px solid var(--border-color, #ddd);
        border-radius: 0.5rem;
        font-size: 14px;
        background-color: var(--input-bg, #fff);
        color: var(--text-primary, #333);
    }
    
    .orders-bulk-bar {
        display: flex;
        justify-content: space-between;
        align-items: center;
        background-color: #eef2ff;
        padding: 12px 20px;
        border-radius: 0.5rem;
        margin-bottom: 20px;
        flex-wrap: wrap;
        gap: 15px;
    }
    
    body.dark-mode .orders-bulk-bar {
        background-color: #1e1b4b;
    }
    
    .orders-bulk-info {
        display: flex;
        align-items: center;
        gap: 10px;
        font-weight: bold;
        color: #4f46e5;
    }
    
    .orders-bulk-icon {
        font-size: 18px;
    }
    
    .orders-bulk-actions {
        display: flex;
        gap: 10px;
        flex-wrap: wrap;
    }
    
    .orders-bulk-action-btn {
        display: flex;
        align-items: center;
        gap: 6px;
        padding: 6px 12px;
        border: none;
        border-radius: 0.5rem;
        color: #fff;
        cursor: pointer;
        font-size: 13px;
    }
    
    .orders-bulk-delete-btn {
        display: flex;
        align-items: center;
        gap: 6px;
        padding: 6px 12px;
        background-color: #dc3545;
        color: #fff;
        border: none;
        border-radius: 0.5rem;
        cursor: pointer;
        font-size: 13px;
    }
    
    .orders-table-container {
        background-color: var(--card-bg, #fff);
        border-radius: 1rem;
        overflow: auto;
        box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        border: 1px solid var(--border-color, #e5e7eb);
    }
    
    .orders-table {
        width: 100%;
        border-collapse: collapse;
        min-width: 800px;
    }
    
    .orders-table th {
        background-color: var(--table-header-bg, #f9fafb);
        padding: 12px;
        text-align: left;
        font-weight: 600;
        color: var(--text-primary, #333);
        border-bottom: 1px solid var(--border-color, #e5e7eb);
    }
    
    .orders-table td {
        padding: 12px;
        border-bottom: 1px solid var(--border-color, #e5e7eb);
        color: var(--text-primary, #333);
    }
    
    .orders-selected-row {
        background-color: rgba(99, 102, 241, 0.1);
    }
    
    .orders-order-id {
        font-family: monospace;
        font-weight: bold;
        color: var(--text-primary, #333);
    }
    
    .orders-customer-email {
        font-size: 11px;
        color: var(--text-secondary, #999);
    }
    
    .orders-total-cell {
        font-weight: bold;
        color: #10b981;
    }
    
    .orders-status-select {
        padding: 5px 10px;
        border-radius: 20px;
        border: none;
        font-size: 12px;
        font-weight: 500;
        cursor: pointer;
    }
    
    .orders-view-btn {
        padding: 6px 10px;
        background-color: #6366f1;
        color: #fff;
        border: none;
        border-radius: 5px;
        cursor: pointer;
    }
    
    .orders-pagination {
        display: flex;
        justify-content: center;
        align-items: center;
        gap: 15px;
        margin-top: 20px;
    }
    
    .orders-page-btn {
        padding: 8px 16px;
        background-color: var(--bg-secondary, #e5e7eb);
        border: 1px solid var(--border-color, #ddd);
        border-radius: 0.5rem;
        cursor: pointer;
        display: flex;
        align-items: center;
        gap: 5px;
        color: var(--text-primary, #333);
    }
    
    .orders-page-btn:disabled {
        opacity: 0.5;
        cursor: not-allowed;
    }
    
    .orders-page-info {
        font-size: 14px;
        color: var(--text-secondary, #666);
    }
    
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
        max-width: 700px;
        max-height: 90vh;
        overflow: auto;
        border: 1px solid var(--border-color, #e5e7eb);
    }
    
    .orders-modal-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 20px;
    }
    
    .orders-modal-header h2 {
        color: var(--text-primary, #333);
    }
    
    .orders-close-btn {
        background: none;
        border: none;
        font-size: 28px;
        cursor: pointer;
        color: var(--text-secondary, #999);
    }
    
    .orders-order-info {
        background-color: var(--bg-secondary, #f8f9fa);
        padding: 15px;
        border-radius: 8px;
        margin-bottom: 20px;
    }
    
    .orders-info-row {
        display: flex;
        justify-content: space-between;
        padding: 8px 0;
        border-bottom: 1px solid var(--border-color, #eee);
        color: var(--text-primary, #333);
    }
    
    .orders-address-info {
        background-color: var(--bg-secondary, #f8f9fa);
        padding: 15px;
        border-radius: 8px;
        margin-bottom: 20px;
        line-height: 1.6;
        color: var(--text-primary, #333);
    }
    
    .orders-items-table {
        width: 100%;
        border-collapse: collapse;
        margin-bottom: 20px;
    }
    
    .orders-items-table th,
    .orders-items-table td {
        padding: 8px;
        text-align: left;
        border-bottom: 1px solid var(--border-color, #eee);
        color: var(--text-primary, #333);
    }
    
    .orders-total-row {
        text-align: right;
        font-weight: bold;
        padding-top: 10px;
        color: var(--text-primary, #333);
    }
    
    .orders-total-amount {
        color: #10b981;
        font-size: 1.2rem;
    }
    
    .orders-modal-actions {
        display: flex;
        gap: 10px;
        justify-content: flex-end;
        margin-top: 20px;
        flex-wrap: wrap;
    }
    
    .orders-modal-btn {
        padding: 8px 16px;
        background: linear-gradient(135deg, #4f46e5, #6366f1);
        color: #fff;
        border: none;
        border-radius: 0.5rem;
        cursor: pointer;
    }
    
    .orders-close-modal-btn {
        padding: 8px 16px;
        background-color: #6c757d;
        color: #fff;
        border: none;
        border-radius: 0.5rem;
        cursor: pointer;
    }
    
    .orders-empty-cell {
        text-align: center;
        padding: 40px;
        color: var(--text-secondary, #999);
    }
    
    @keyframes spin {
        from { transform: rotate(0deg); }
        to { transform: rotate(360deg); }
    }
`;
document.head.appendChild(styleSheet);

export default AdminOrdersPage;