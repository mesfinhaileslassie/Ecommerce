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
            <div style={styles.center}>
                <h2>Please login to view your orders</h2>
            </div>
        );
    }

    if (loading) {
        return (
            <div style={styles.center}>
                <div className="spinner"></div>
                <p>Loading your orders...</p>
            </div>
        );
    }

    return (
        <div style={styles.container}>
            <div style={styles.header}>
                <h1 style={styles.title}>My Orders</h1>
                <div style={styles.headerActions}>
                    {/* Archive Dropdown Button */}
                    <div style={styles.archiveDropdown}>
                        <button
                            onClick={() => setShowArchiveOptions(!showArchiveOptions)}
                            style={styles.archiveMenuBtn}
                            disabled={archiving}
                        >
                            <FaArchiveAll /> Archive Options {!showArchiveOptions && <FaFilter size={12} />}
                        </button>
                        {showArchiveOptions && (
                            <div style={styles.archiveDropdownMenu}>
                                <button onClick={() => archiveByStatus('Pending')} style={styles.dropdownItem}>
                                    Archive Pending Orders ({orderCounts.Pending})
                                </button>
                                <button onClick={() => archiveByStatus('Processing')} style={styles.dropdownItem}>
                                    Archive Processing Orders ({orderCounts.Processing})
                                </button>
                                <button onClick={() => archiveByStatus('Shipped')} style={styles.dropdownItem}>
                                    Archive Shipped Orders ({orderCounts.Shipped})
                                </button>
                                <button onClick={() => archiveByStatus('Delivered')} style={styles.dropdownItem}>
                                    Archive Delivered Orders ({orderCounts.Delivered})
                                </button>
                                <button onClick={() => archiveByStatus('Cancelled')} style={styles.dropdownItem}>
                                    Archive Cancelled Orders ({orderCounts.Cancelled})
                                </button>
                                <hr style={styles.dropdownDivider} />
                                <button onClick={archiveAllOrders} style={styles.dropdownItemAll}>
                                    Archive All Active Orders ({localOrders.filter(o => !o.isArchived).length})
                                </button>
                            </div>
                        )}
                    </div>
                    
                    {/* Toggle Archived View Button */}
                    <button
                        onClick={() => setShowArchived(!showArchived)}
                        style={{
                            ...styles.archiveToggleBtn,
                            backgroundColor: showArchived ? '#6366f1' : '#e5e7eb',
                            color: showArchived ? '#fff' : '#333',
                        }}
                    >
                        <FaArchive /> {showArchived ? 'Showing Archived' : 'Hide Archived'}
                    </button>
                </div>
            </div>

            {/* Order Summary Stats */}
            <div style={styles.statsBar}>
                <div style={styles.statItem}>
                    <span>📋 Pending:</span>
                    <strong>{orderCounts.Pending}</strong>
                </div>
                <div style={styles.statItem}>
                    <span>⚙️ Processing:</span>
                    <strong>{orderCounts.Processing}</strong>
                </div>
                <div style={styles.statItem}>
                    <span>🚚 Shipped:</span>
                    <strong>{orderCounts.Shipped}</strong>
                </div>
                <div style={styles.statItem}>
                    <span>✅ Delivered:</span>
                    <strong>{orderCounts.Delivered}</strong>
                </div>
                <div style={styles.statItem}>
                    <span>📦 Archived:</span>
                    <strong>{orderCounts.Archived}</strong>
                </div>
            </div>

            {localOrders.filter(o => !o.isArchived).length === 0 && !showArchived ? (
                <div style={styles.center}>
                    <h2>No active orders</h2>
                    {orderCounts.Archived > 0 && (
                        <button onClick={() => setShowArchived(true)} style={styles.showActiveBtn}>
                            View Archived Orders
                        </button>
                    )}
                </div>
            ) : localOrders.length === 0 ? (
                <div style={styles.center}>
                    <h2>No orders found</h2>
                    <p>Start shopping to place your first order</p>
                </div>
            ) : (
                <div style={styles.ordersGrid}>
                    {localOrders.map((order) => (
                        <div key={order._id} style={{...styles.orderCard, opacity: order.isArchived ? 0.7 : 1}}>
                            <div style={styles.orderHeader}>
                                <div>
                                    <span style={styles.orderLabel}>Order ID:</span>
                                    <span style={styles.orderId}>#{order._id.slice(-8)}</span>
                                </div>
                                <div>
                                    <span style={styles.orderLabel}>Date:</span>
                                    <span>{new Date(order.createdAt).toLocaleDateString()}</span>
                                </div>
                                <div style={{ ...styles.statusBadge, backgroundColor: `${getStatusColor(order.status)}20`, color: getStatusColor(order.status) }}>
                                    {getStatusIcon(order.status)}
                                    <span>{order.status}</span>
                                </div>
                                {order.isArchived && (
                                    <div style={styles.archivedBadge}>Archived</div>
                                )}
                            </div>
                            
                            <div style={styles.orderItems}>
                                {order.items.slice(0, 3).map((item, index) => (
                                    <div key={index} style={styles.orderItem}>
                                        <img 
                                            src={item.imageUrl || 'https://via.placeholder.com/60'} 
                                            alt={item.name}
                                            style={styles.itemImage}
                                        />
                                        <div style={styles.itemDetails}>
                                            <h4>{item.name}</h4>
                                            <p>Qty: {item.quantity} × ${item.price}</p>
                                        </div>
                                        <div style={styles.itemTotal}>
                                            ${(item.price * item.quantity).toFixed(2)}
                                        </div>
                                    </div>
                                ))}
                                {order.items.length > 3 && (
                                    <p style={styles.moreItems}>+{order.items.length - 3} more items</p>
                                )}
                            </div>
                            
                            <div style={styles.orderFooter}>
                                <div style={styles.orderTotal}>
                                    <strong>Total:</strong>
                                    <strong style={styles.totalAmount}>${order.totalPrice.toFixed(2)}</strong>
                                </div>
                                <div style={styles.actionButtons}>
                                    <button onClick={() => setSelectedOrder(order)} style={styles.viewBtn}>
                                        <FaEye /> View Details
                                    </button>
                                    {!order.isArchived && (
                                        <button onClick={() => handleArchiveOrder(order._id, true)} style={styles.archiveBtn}>
                                            <FaArchive /> Archive
                                        </button>
                                    )}
                                    {order.isArchived && (
                                        <button onClick={() => handleArchiveOrder(order._id, false)} style={styles.restoreBtn}>
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
                                <strong>Order Date:</strong>
                                <span>{new Date(selectedOrder.createdAt).toLocaleString()}</span>
                            </div>
                            <div style={styles.infoRow}>
                                <strong>Payment Method:</strong>
                                <span>{selectedOrder.paymentMethod}</span>
                            </div>
                            <div style={styles.infoRow}>
                                <strong>Order Status:</strong>
                                <span style={{ color: getStatusColor(selectedOrder.status) }}>{selectedOrder.status}</span>
                            </div>
                        </div>
                        
                        <h3>Shipping Address</h3>
                        <div style={styles.addressInfo}>
                            <p>{selectedOrder.shippingAddress.fullName}</p>
                            <p>{selectedOrder.shippingAddress.address}</p>
                            <p>{selectedOrder.shippingAddress.city}, {selectedOrder.shippingAddress.postalCode}</p>
                            <p>{selectedOrder.shippingAddress.country}</p>
                            <p>Phone: {selectedOrder.shippingAddress.phone}</p>
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
                                        <td>
                                            <div style={styles.itemCell}>
                                                <img src={item.imageUrl || 'https://via.placeholder.com/40'} alt={item.name} style={styles.smallImage} />
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
                                    <td colSpan="3" style={styles.totalRow}>Total:</td>
                                    <td style={styles.totalAmount}>${selectedOrder.totalPrice.toFixed(2)}</td>
                                </tr>
                            </tfoot>
                        </table>
                        
                        <button onClick={() => setSelectedOrder(null)} style={styles.doneBtn}>
                            Close
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

const styles = {
    container: {
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '20px',
    },
    header: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '20px',
        flexWrap: 'wrap',
        gap: '15px',
    },
    title: {
        fontSize: '2rem',
        color: '#333',
    },
    headerActions: {
        display: 'flex',
        gap: '10px',
        position: 'relative',
    },
    statsBar: {
        display: 'flex',
        gap: '20px',
        padding: '15px',
        backgroundColor: '#f8f9fa',
        borderRadius: '8px',
        marginBottom: '25px',
        flexWrap: 'wrap',
        justifyContent: 'space-around',
    },
    statItem: {
        display: 'flex',
        gap: '8px',
        alignItems: 'center',
        fontSize: '14px',
    },
    archiveDropdown: {
        position: 'relative',
    },
    archiveMenuBtn: {
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        padding: '8px 16px',
        backgroundColor: '#6366f1',
        color: '#fff',
        border: 'none',
        borderRadius: '0.5rem',
        cursor: 'pointer',
    },
    archiveDropdownMenu: {
        position: 'absolute',
        top: '100%',
        right: 0,
        marginTop: '5px',
        backgroundColor: '#fff',
        borderRadius: '8px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
        zIndex: 100,
        minWidth: '220px',
        overflow: 'hidden',
    },
    dropdownItem: {
        display: 'block',
        width: '100%',
        padding: '10px 16px',
        textAlign: 'left',
        border: 'none',
        backgroundColor: '#fff',
        cursor: 'pointer',
        transition: 'background-color 0.3s',
    },
    dropdownItemAll: {
        display: 'block',
        width: '100%',
        padding: '10px 16px',
        textAlign: 'left',
        border: 'none',
        backgroundColor: '#fee2e2',
        cursor: 'pointer',
        color: '#dc2626',
        fontWeight: 'bold',
    },
    dropdownDivider: {
        margin: '5px 0',
        border: 'none',
        borderTop: '1px solid #eee',
    },
    archiveToggleBtn: {
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        padding: '8px 16px',
        border: 'none',
        borderRadius: '0.5rem',
        cursor: 'pointer',
        transition: 'all 0.3s',
    },
    ordersGrid: {
        display: 'flex',
        flexDirection: 'column',
        gap: '20px',
    },
    orderCard: {
        backgroundColor: '#fff',
        borderRadius: '1rem',
        overflow: 'hidden',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        transition: 'opacity 0.3s',
    },
    orderHeader: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '15px 20px',
        backgroundColor: '#f8f9fa',
        borderBottom: '1px solid #eee',
        flexWrap: 'wrap',
        gap: '10px',
    },
    orderLabel: {
        fontWeight: '500',
        color: '#666',
        marginRight: '8px',
    },
    orderId: {
        fontFamily: 'monospace',
        fontWeight: 'bold',
        color: '#333',
    },
    statusBadge: {
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        padding: '5px 12px',
        borderRadius: '20px',
        fontSize: '0.875rem',
        fontWeight: '500',
    },
    archivedBadge: {
        backgroundColor: '#9ca3af',
        color: '#fff',
        padding: '4px 10px',
        borderRadius: '20px',
        fontSize: '0.75rem',
    },
    orderItems: {
        padding: '20px',
    },
    orderItem: {
        display: 'flex',
        alignItems: 'center',
        gap: '15px',
        padding: '10px 0',
        borderBottom: '1px solid #f0f0f0',
    },
    itemImage: {
        width: '60px',
        height: '60px',
        objectFit: 'cover',
        borderRadius: '8px',
    },
    itemDetails: {
        flex: 1,
    },
    itemTotal: {
        fontWeight: 'bold',
        color: '#6366f1',
    },
    moreItems: {
        color: '#666',
        fontSize: '0.875rem',
        marginTop: '10px',
        fontStyle: 'italic',
    },
    orderFooter: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '15px 20px',
        backgroundColor: '#f8f9fa',
        borderTop: '1px solid #eee',
        flexWrap: 'wrap',
        gap: '15px',
    },
    orderTotal: {
        display: 'flex',
        gap: '10px',
        fontSize: '1.1rem',
    },
    totalAmount: {
        color: '#28a745',
        fontSize: '1.25rem',
    },
    actionButtons: {
        display: 'flex',
        gap: '10px',
    },
    viewBtn: {
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        padding: '8px 16px',
        backgroundColor: '#6366f1',
        color: '#fff',
        border: 'none',
        borderRadius: '0.5rem',
        cursor: 'pointer',
    },
    archiveBtn: {
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        padding: '8px 16px',
        backgroundColor: '#f59e0b',
        color: '#fff',
        border: 'none',
        borderRadius: '0.5rem',
        cursor: 'pointer',
    },
    restoreBtn: {
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        padding: '8px 16px',
        backgroundColor: '#10b981',
        color: '#fff',
        border: 'none',
        borderRadius: '0.5rem',
        cursor: 'pointer',
    },
    showActiveBtn: {
        marginTop: '20px',
        padding: '10px 20px',
        backgroundColor: '#6366f1',
        color: '#fff',
        border: 'none',
        borderRadius: '0.5rem',
        cursor: 'pointer',
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
        maxWidth: '800px',
        maxHeight: '90vh',
        overflow: 'auto',
    },
    modalHeader: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '20px',
        paddingBottom: '15px',
        borderBottom: '1px solid #eee',
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
    itemCell: {
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
    },
    smallImage: {
        width: '40px',
        height: '40px',
        objectFit: 'cover',
        borderRadius: '4px',
    },
    totalRow: {
        textAlign: 'right',
        fontWeight: 'bold',
        paddingTop: '10px',
    },
    doneBtn: {
        width: '100%',
        padding: '12px',
        backgroundColor: '#6366f1',
        color: '#fff',
        border: 'none',
        borderRadius: '0.5rem',
        cursor: 'pointer',
        marginTop: '10px',
    },
    center: {
        textAlign: 'center',
        padding: '50px',
    },
};

export default OrdersPage;