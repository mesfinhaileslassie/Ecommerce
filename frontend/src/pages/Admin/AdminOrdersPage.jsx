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
            <div style={styles.center}>
                <h2>Access Denied</h2>
                <p>You need admin privileges to view this page.</p>
            </div>
        );
    }

    if (loading) {
        return (
            <div style={styles.center}>
                <FaSpinner style={styles.spinner} />
                <p>Loading orders...</p>
            </div>
        );
    }

    return (
        <div style={styles.container}>
            <div style={styles.header}>
                <h1 style={styles.title}>Order Management</h1>
                <button onClick={fetchOrders} style={styles.refreshBtn}>
                    <FaSync /> Refresh
                </button>
            </div>

            {/* Stats Summary */}
            <div style={styles.statsGrid}>
                <div style={styles.statCard}>
                    <h3>Total Orders</h3>
                    <p>{orders.length}</p>
                </div>
                <div style={styles.statCard}>
                    <h3>Pending</h3>
                    <p>{orders.filter(o => o.status === 'Pending').length}</p>
                </div>
                <div style={styles.statCard}>
                    <h3>Processing</h3>
                    <p>{orders.filter(o => o.status === 'Processing').length}</p>
                </div>
                <div style={styles.statCard}>
                    <h3>Shipped</h3>
                    <p>{orders.filter(o => o.status === 'Shipped').length}</p>
                </div>
                <div style={styles.statCard}>
                    <h3>Delivered</h3>
                    <p>{orders.filter(o => o.status === 'Delivered').length}</p>
                </div>
            </div>

            {/* Filters Bar */}
            <div style={styles.filtersBar}>
                <div style={styles.searchContainer}>
                    <FaSearch style={styles.searchIcon} />
                    <input
                        type="text"
                        placeholder="Search by Order ID or Customer..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        style={styles.searchInput}
                    />
                </div>
                <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    style={styles.filterSelect}
                >
                    {statuses.map(status => (
                        <option key={status} value={status}>{status}</option>
                    ))}
                </select>
            </div>

            {/* Bulk Actions Bar */}
            {showBulkBar && (
                <div style={styles.bulkBar}>
                    <div style={styles.bulkInfo}>
                        <FaCheckDouble style={styles.bulkIcon} />
                        <span>{selectedOrders.length} order(s) selected</span>
                    </div>
                    <div style={styles.bulkActions}>
                        {bulkActions.map(action => (
                            <button
                                key={action.value}
                                onClick={() => bulkUpdateStatus(action.value)}
                                style={{
                                    ...styles.bulkActionBtn,
                                    backgroundColor: action.color,
                                }}
                                disabled={updating}
                            >
                                {action.icon} {action.label}
                            </button>
                        ))}
                        <button
                            onClick={bulkDeleteOrders}
                            style={styles.bulkDeleteBtn}
                            disabled={updating}
                        >
                            <FaTimes /> Delete Selected
                        </button>
                    </div>
                </div>
            )}

            {/* Orders Table */}
            <div style={styles.tableContainer}>
                <table style={styles.table}>
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
                                <td colSpan="8" style={styles.emptyCell}>
                                    No orders found
                                </td>
                            </tr>
                        ) : (
                            currentOrders.map((order) => {
                                const statusStyle = getStatusColor(order.status);
                                return (
                                    <tr key={order._id} style={selectedOrders.includes(order._id) ? styles.selectedRow : {}}>
                                        <td>
                                            <input
                                                type="checkbox"
                                                checked={selectedOrders.includes(order._id)}
                                                onChange={() => handleSelectOrder(order._id)}
                                            />
                                        </td>
                                        <td style={styles.orderId}>#{order._id.slice(-8)}</td>
                                        <td>
                                            <div>{order.user?.name || 'Guest'}</div>
                                            <small style={styles.customerEmail}>{order.user?.email || 'N/A'}</small>
                                        </td>
                                        <td style={styles.totalCell}>${order.totalPrice.toFixed(2)}</td>
                                        <td>
                                            <select
                                                value={order.status}
                                                onChange={(e) => updateOrderStatus(order._id, e.target.value)}
                                                style={{
                                                    ...styles.statusSelect,
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
                                                style={styles.viewBtn}
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
                <div style={styles.pagination}>
                    <button
                        onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                        disabled={currentPage === 1}
                        style={styles.pageBtn}
                    >
                        <FaChevronLeft /> Previous
                    </button>
                    <span style={styles.pageInfo}>
                        Page {currentPage} of {totalPages} ({filteredOrders.length} orders)
                    </span>
                    <button
                        onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                        disabled={currentPage === totalPages}
                        style={styles.pageBtn}
                    >
                        Next <FaChevronRight />
                    </button>
                </div>
            )}

            {/* Order Details Modal */}
            {selectedOrder && (
                <div style={styles.modal}>
                    <div style={styles.modalContent}>
                        <div style={styles.modalHeader}>
                            <h2>Order Details</h2>
                            <button onClick={() => setSelectedOrder(null)} style={styles.closeBtn}>×</button>
                        </div>
                        
                        <div style={styles.orderInfo}>
                            <div style={styles.infoRow}>
                                <strong>Order ID:</strong>
                                <span>{selectedOrder._id}</span>
                            </div>
                            <div style={styles.infoRow}>
                                <strong>Customer:</strong>
                                <span>{selectedOrder.user?.name || 'Guest'}</span>
                            </div>
                            <div style={styles.infoRow}>
                                <strong>Email:</strong>
                                <span>{selectedOrder.user?.email || 'N/A'}</span>
                            </div>
                            <div style={styles.infoRow}>
                                <strong>Date:</strong>
                                <span>{new Date(selectedOrder.createdAt).toLocaleString()}</span>
                            </div>
                            <div style={styles.infoRow}>
                                <strong>Payment Method:</strong>
                                <span>{selectedOrder.paymentMethod}</span>
                            </div>
                            <div style={styles.infoRow}>
                                <strong>Total:</strong>
                                <span>${selectedOrder.totalPrice.toFixed(2)}</span>
                            </div>
                        </div>
                        
                        <h3>Shipping Address</h3>
                        <div style={styles.addressInfo}>
                            <p>{selectedOrder.shippingAddress?.fullName}</p>
                            <p>{selectedOrder.shippingAddress?.address}</p>
                            <p>{selectedOrder.shippingAddress?.city}, {selectedOrder.shippingAddress?.postalCode}</p>
                            <p>{selectedOrder.shippingAddress?.country}</p>
                            <p>Phone: {selectedOrder.shippingAddress?.phone}</p>
                        </div>
                        
                        <h3>Order Items</h3>
                        <table style={styles.itemsTable}>
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
                                    <td colSpan="3" style={styles.totalRow}>Total:</td>
                                    <td style={styles.totalAmount}>${selectedOrder.totalPrice.toFixed(2)}</td>
                                </tr>
                            </tfoot>
                        </table>
                        
                        <div style={styles.modalActions}>
                            <button
                                onClick={() => {
                                    updateOrderStatus(selectedOrder._id, 'Processing');
                                    setSelectedOrder(null);
                                }}
                                style={styles.modalBtn}
                            >
                                Mark Processing
                            </button>
                            <button
                                onClick={() => {
                                    updateOrderStatus(selectedOrder._id, 'Shipped');
                                    setSelectedOrder(null);
                                }}
                                style={styles.modalBtn}
                            >
                                Mark Shipped
                            </button>
                            <button
                                onClick={() => {
                                    updateOrderStatus(selectedOrder._id, 'Delivered');
                                    setSelectedOrder(null);
                                }}
                                style={styles.modalBtn}
                            >
                                Mark Delivered
                            </button>
                            <button
                                onClick={() => setSelectedOrder(null)}
                                style={styles.closeModalBtn}
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

const styles = {
    container: {
        maxWidth: '1400px',
        margin: '0 auto',
        padding: '20px',
    },
    header: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '30px',
    },
    title: {
        fontSize: '1.8rem',
        color: '#333',
    },
    refreshBtn: {
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        padding: '10px 20px',
        backgroundColor: '#6366f1',
        color: '#fff',
        border: 'none',
        borderRadius: '0.5rem',
        cursor: 'pointer',
    },
    statsGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
        gap: '20px',
        marginBottom: '30px',
    },
    statCard: {
        backgroundColor: '#fff',
        padding: '20px',
        borderRadius: '1rem',
        textAlign: 'center',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    },
    filtersBar: {
        display: 'flex',
        gap: '15px',
        marginBottom: '20px',
        flexWrap: 'wrap',
    },
    searchContainer: {
        flex: 1,
        position: 'relative',
        minWidth: '250px',
    },
    searchIcon: {
        position: 'absolute',
        left: '12px',
        top: '50%',
        transform: 'translateY(-50%)',
        color: '#999',
    },
    searchInput: {
        width: '100%',
        padding: '10px 10px 10px 35px',
        border: '1px solid #ddd',
        borderRadius: '0.5rem',
        fontSize: '14px',
    },
    filterSelect: {
        padding: '10px',
        border: '1px solid #ddd',
        borderRadius: '0.5rem',
        fontSize: '14px',
        backgroundColor: '#fff',
    },
    bulkBar: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: '#eef2ff',
        padding: '12px 20px',
        borderRadius: '0.5rem',
        marginBottom: '20px',
        flexWrap: 'wrap',
        gap: '15px',
    },
    bulkInfo: {
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        fontWeight: 'bold',
        color: '#4f46e5',
    },
    bulkIcon: {
        fontSize: '18px',
    },
    bulkActions: {
        display: 'flex',
        gap: '10px',
        flexWrap: 'wrap',
    },
    bulkActionBtn: {
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        padding: '6px 12px',
        border: 'none',
        borderRadius: '0.5rem',
        color: '#fff',
        cursor: 'pointer',
        fontSize: '13px',
    },
    bulkDeleteBtn: {
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        padding: '6px 12px',
        backgroundColor: '#dc3545',
        color: '#fff',
        border: 'none',
        borderRadius: '0.5rem',
        cursor: 'pointer',
        fontSize: '13px',
    },
    tableContainer: {
        backgroundColor: '#fff',
        borderRadius: '1rem',
        overflow: 'auto',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    },
    table: {
        width: '100%',
        borderCollapse: 'collapse',
        minWidth: '800px',
    },
    selectedRow: {
        backgroundColor: '#eef2ff',
    },
    orderId: {
        fontFamily: 'monospace',
        fontWeight: 'bold',
    },
    customerEmail: {
        fontSize: '11px',
        color: '#999',
    },
    totalCell: {
        fontWeight: 'bold',
        color: '#10b981',
    },
    statusSelect: {
        padding: '5px 10px',
        borderRadius: '20px',
        border: 'none',
        fontSize: '12px',
        fontWeight: '500',
        cursor: 'pointer',
    },
    viewBtn: {
        padding: '6px 10px',
        backgroundColor: '#6366f1',
        color: '#fff',
        border: 'none',
        borderRadius: '5px',
        cursor: 'pointer',
    },
    pagination: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        gap: '15px',
        marginTop: '20px',
    },
    pageBtn: {
        padding: '8px 16px',
        backgroundColor: '#e5e7eb',
        border: 'none',
        borderRadius: '0.5rem',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        gap: '5px',
    },
    pageInfo: {
        fontSize: '14px',
        color: '#666',
    },
    modal: {
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.5)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1000,
    },
    modalContent: {
        backgroundColor: '#fff',
        borderRadius: '1rem',
        padding: '30px',
        width: '90%',
        maxWidth: '700px',
        maxHeight: '90vh',
        overflow: 'auto',
    },
    modalHeader: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '20px',
    },
    closeBtn: {
        background: 'none',
        border: 'none',
        fontSize: '28px',
        cursor: 'pointer',
        color: '#999',
    },
    orderInfo: {
        backgroundColor: '#f8f9fa',
        padding: '15px',
        borderRadius: '8px',
        marginBottom: '20px',
    },
    infoRow: {
        display: 'flex',
        justifyContent: 'space-between',
        padding: '8px 0',
        borderBottom: '1px solid #eee',
    },
    addressInfo: {
        backgroundColor: '#f8f9fa',
        padding: '15px',
        borderRadius: '8px',
        marginBottom: '20px',
        lineHeight: '1.6',
    },
    itemsTable: {
        width: '100%',
        borderCollapse: 'collapse',
        marginBottom: '20px',
    },
    totalRow: {
        textAlign: 'right',
        fontWeight: 'bold',
        paddingTop: '10px',
    },
    totalAmount: {
        color: '#10b981',
        fontSize: '1.2rem',
    },
    modalActions: {
        display: 'flex',
        gap: '10px',
        justifyContent: 'flex-end',
        marginTop: '20px',
        flexWrap: 'wrap',
    },
    modalBtn: {
        padding: '8px 16px',
        backgroundColor: '#6366f1',
        color: '#fff',
        border: 'none',
        borderRadius: '0.5rem',
        cursor: 'pointer',
    },
    closeModalBtn: {
        padding: '8px 16px',
        backgroundColor: '#6c757d',
        color: '#fff',
        border: 'none',
        borderRadius: '0.5rem',
        cursor: 'pointer',
    },
    emptyCell: {
        textAlign: 'center',
        padding: '40px',
        color: '#999',
    },
    spinner: {
        animation: 'spin 1s linear infinite',
        fontSize: '2rem',
        color: '#6366f1',
    },
    center: {
        textAlign: 'center',
        padding: '50px',
    },
};

export default AdminOrdersPage;