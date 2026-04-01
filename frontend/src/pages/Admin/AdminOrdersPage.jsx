import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';

const AdminOrdersPage = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedOrder, setSelectedOrder] = useState(null);

    useEffect(() => {
        fetchOrders();
    }, []);

    const fetchOrders = async () => {
        try {
            const { data } = await api.get('/orders');
            setOrders(data.orders);
        } catch (error) {
            toast.error('Failed to fetch orders');
        } finally {
            setLoading(false);
        }
    };

    const updateOrderStatus = async (orderId, status) => {
        try {
            await api.put(`/orders/${orderId}/status`, { status });
            toast.success('Order status updated');
            fetchOrders();
        } catch (error) {
            toast.error('Failed to update status');
        }
    };

    if (loading) {
        return <div style={styles.center}>Loading orders...</div>;
    }

    return (
        <div style={styles.container}>
            <h1 style={styles.title}>Manage Orders</h1>

            <div style={styles.tableContainer}>
                <table style={styles.table}>
                    <thead>
                        <tr>
                            <th>Order ID</th>
                            <th>Customer</th>
                            <th>Total</th>
                            <th>Status</th>
                            <th>Date</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {orders.map((order) => (
                            <tr key={order._id}>
                                <td>{order._id.slice(-6)}</td>
                                <td>{order.user?.name || 'N/A'}</td>
                                <td>${order.totalPrice.toFixed(2)}</td>
                                <td>
                                    <select
                                        value={order.status}
                                        onChange={(e) => updateOrderStatus(order._id, e.target.value)}
                                        style={{
                                            ...styles.statusSelect,
                                            backgroundColor: order.status === 'Delivered' ? '#d4edda' : 
                                                           order.status === 'Cancelled' ? '#f8d7da' : '#fff3cd',
                                            color: order.status === 'Delivered' ? '#155724' : 
                                                   order.status === 'Cancelled' ? '#721c24' : '#856404',
                                        }}
                                    >
                                        <option value="Pending">Pending</option>
                                        <option value="Processing">Processing</option>
                                        <option value="Shipped">Shipped</option>
                                        <option value="Delivered">Delivered</option>
                                        <option value="Cancelled">Cancelled</option>
                                    </select>
                                </td>
                                <td>{new Date(order.createdAt).toLocaleDateString()}</td>
                                <td>
                                    <button 
                                        onClick={() => setSelectedOrder(order)} 
                                        style={styles.viewBtn}
                                    >
                                        View Details
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {selectedOrder && (
                <div style={styles.modal}>
                    <div style={styles.modalContent}>
                        <h2>Order Details</h2>
                        <div style={styles.orderInfo}>
                            <p><strong>Order ID:</strong> {selectedOrder._id}</p>
                            <p><strong>Customer:</strong> {selectedOrder.user?.name}</p>
                            <p><strong>Email:</strong> {selectedOrder.user?.email}</p>
                            <p><strong>Phone:</strong> {selectedOrder.shippingAddress?.phone}</p>
                            <p><strong>Address:</strong> {selectedOrder.shippingAddress?.address}, {selectedOrder.shippingAddress?.city}, {selectedOrder.shippingAddress?.country}</p>
                            <p><strong>Payment Method:</strong> {selectedOrder.paymentMethod}</p>
                            <p><strong>Status:</strong> {selectedOrder.status}</p>
                        </div>
                        
                        <h3>Items</h3>
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
                        </table>
                        
                        <div style={styles.orderTotal}>
                            <strong>Total: ${selectedOrder.totalPrice.toFixed(2)}</strong>
                        </div>
                        
                        <button onClick={() => setSelectedOrder(null)} style={styles.closeBtn}>
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
        marginBottom: '30px',
    },
    tableContainer: {
        backgroundColor: '#fff',
        borderRadius: '8px',
        overflow: 'auto',
    },
    table: {
        width: '100%',
        borderCollapse: 'collapse',
    },
    statusSelect: {
        padding: '5px 10px',
        borderRadius: '5px',
        border: 'none',
        cursor: 'pointer',
    },
    viewBtn: {
        padding: '5px 10px',
        backgroundColor: '#007bff',
        color: '#fff',
        border: 'none',
        borderRadius: '5px',
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
        padding: '30px',
        borderRadius: '8px',
        width: '90%',
        maxWidth: '600px',
        maxHeight: '80vh',
        overflow: 'auto',
    },
    orderInfo: {
        marginBottom: '20px',
        padding: '15px',
        backgroundColor: '#f8f9fa',
        borderRadius: '5px',
    },
    itemsTable: {
        width: '100%',
        borderCollapse: 'collapse',
        marginTop: '10px',
    },
    orderTotal: {
        textAlign: 'right',
        marginTop: '15px',
        fontSize: '1.2rem',
    },
    closeBtn: {
        marginTop: '20px',
        padding: '10px 20px',
        backgroundColor: '#dc3545',
        color: '#fff',
        border: 'none',
        borderRadius: '5px',
        cursor: 'pointer',
        width: '100%',
    },
    center: {
        textAlign: 'center',
        padding: '50px',
    },
};

export default AdminOrdersPage;