import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchMyOrders } from '../../redux/slices/orderSlice';
import { FaBox, FaClock, FaCheckCircle, FaTruck, FaHome, FaEye } from 'react-icons/fa';

const OrdersPage = () => {
    const dispatch = useDispatch();
    const { orders, loading } = useSelector((state) => state.orders);
    const { user } = useSelector((state) => state.auth);
    const [selectedOrder, setSelectedOrder] = useState(null);

    useEffect(() => {
        if (user) {
            dispatch(fetchMyOrders());
        }
    }, [dispatch, user]);

    const getStatusIcon = (status) => {
        switch(status) {
            case 'Pending':
                return <FaClock style={{ color: '#f59e0b' }} />;
            case 'Processing':
                return <FaBox style={{ color: '#3b82f6' }} />;
            case 'Shipped':
                return <FaTruck style={{ color: '#10b981' }} />;
            case 'Delivered':
                return <FaHome style={{ color: '#10b981' }} />;
            default:
                return <FaClock style={{ color: '#6b7280' }} />;
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

    const getStatusSteps = (currentStatus) => {
        const steps = ['Pending', 'Processing', 'Shipped', 'Delivered'];
        const currentIndex = steps.indexOf(currentStatus);
        return steps.map((step, index) => ({
            name: step,
            completed: index <= currentIndex,
            active: index === currentIndex,
        }));
    };

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

    if (orders.length === 0) {
        return (
            <div style={styles.center}>
                <h2>No orders yet</h2>
                <p>Start shopping to place your first order</p>
            </div>
        );
    }

    return (
        <div style={styles.container}>
            <h1 style={styles.title}>My Orders</h1>
            
            <div style={styles.ordersGrid}>
                {orders.map((order) => (
                    <div key={order._id} style={styles.orderCard}>
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
                            <button onClick={() => setSelectedOrder(order)} style={styles.viewBtn}>
                                <FaEye /> View Details
                            </button>
                        </div>
                    </div>
                ))}
            </div>
            
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
                        
                        {/* Order Tracking Timeline */}
                        <div style={styles.timeline}>
                            <h3>Order Tracking</h3>
                            <div style={styles.timelineSteps}>
                                {getStatusSteps(selectedOrder.status).map((step, index) => (
                                    <div key={index} style={styles.timelineStep}>
                                        <div style={{
                                            ...styles.timelineDot,
                                            backgroundColor: step.completed ? '#10b981' : '#e5e7eb',
                                        }}>
                                            {step.completed && <FaCheckCircle style={{ color: '#fff', fontSize: '12px' }} />}
                                        </div>
                                        {index < 3 && <div style={styles.timelineLine} />}
                                        <div style={styles.timelineLabel}>
                                            <strong style={{ color: step.active ? '#10b981' : '#6b7280' }}>{step.name}</strong>
                                        </div>
                                    </div>
                                ))}
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
    title: {
        fontSize: '2rem',
        marginBottom: '30px',
        color: '#333',
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
    timeline: {
        marginBottom: '20px',
        padding: '20px',
        backgroundColor: '#f8f9fa',
        borderRadius: '8px',
    },
    timelineSteps: {
        display: 'flex',
        justifyContent: 'space-between',
        marginTop: '20px',
        position: 'relative',
    },
    timelineStep: {
        flex: 1,
        textAlign: 'center',
        position: 'relative',
    },
    timelineDot: {
        width: '30px',
        height: '30px',
        borderRadius: '50%',
        backgroundColor: '#e5e7eb',
        margin: '0 auto 10px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        zIndex: 2,
    },
    timelineLine: {
        position: 'absolute',
        top: '15px',
        left: '50%',
        right: '-50%',
        height: '2px',
        backgroundColor: '#e5e7eb',
        zIndex: 1,
    },
    timelineLabel: {
        fontSize: '0.75rem',
        fontWeight: '500',
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