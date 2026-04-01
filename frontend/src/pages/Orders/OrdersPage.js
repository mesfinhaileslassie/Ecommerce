import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchMyOrders } from '../../redux/slices/orderSlice';

const OrdersPage = () => {
    const dispatch = useDispatch();
    const { orders, loading } = useSelector((state) => state.orders);
    const { user } = useSelector((state) => state.auth);

    useEffect(() => {
        if (user) {
            dispatch(fetchMyOrders());
        }
    }, [dispatch, user]);

    if (!user) {
        return (
            <div style={styles.center}>
                <h2>Please login to view your orders</h2>
            </div>
        );
    }

    if (loading) {
        return <div style={styles.center}>Loading orders...</div>;
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
            
            {orders.map((order) => (
                <div key={order._id} style={styles.orderCard}>
                    <div style={styles.orderHeader}>
                        <div>
                            <strong>Order ID:</strong> {order._id}
                        </div>
                        <div>
                            <strong>Date:</strong> {new Date(order.createdAt).toLocaleDateString()}
                        </div>
                        <div style={{
                            ...styles.status,
                            backgroundColor: order.status === 'Delivered' ? '#d4edda' : '#fff3cd',
                            color: order.status === 'Delivered' ? '#155724' : '#856404',
                        }}>
                            {order.status}
                        </div>
                    </div>
                    
                    <div style={styles.orderItems}>
                        {order.items.map((item, index) => (
                            <div key={index} style={styles.orderItem}>
                                <img 
                                    src={item.imageUrl || 'https://via.placeholder.com/60'} 
                                    alt={item.name}
                                    style={styles.itemImage}
                                />
                                <div style={styles.itemDetails}>
                                    <h4>{item.name}</h4>
                                    <p>Quantity: {item.quantity}</p>
                                </div>
                                <div style={styles.itemPrice}>
                                    ${(item.price * item.quantity).toFixed(2)}
                                </div>
                            </div>
                        ))}
                    </div>
                    
                    <div style={styles.orderFooter}>
                        <div>
                            <strong>Shipping Address:</strong><br />
                            {order.shippingAddress.fullName}<br />
                            {order.shippingAddress.address}<br />
                            {order.shippingAddress.city}, {order.shippingAddress.postalCode}<br />
                            {order.shippingAddress.country}<br />
                            Phone: {order.shippingAddress.phone}
                        </div>
                        <div style={styles.total}>
                            <strong>Total: ${order.totalPrice.toFixed(2)}</strong>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
};

const styles = {
    container: {
        maxWidth: '1000px',
        margin: '0 auto',
        padding: '20px',
    },
    title: {
        marginBottom: '30px',
    },
    orderCard: {
        backgroundColor: '#fff',
        borderRadius: '8px',
        marginBottom: '20px',
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
    status: {
        padding: '5px 10px',
        borderRadius: '5px',
        fontSize: '0.9rem',
        fontWeight: 'bold',
    },
    orderItems: {
        padding: '20px',
    },
    orderItem: {
        display: 'flex',
        alignItems: 'center',
        gap: '15px',
        padding: '10px 0',
        borderBottom: '1px solid #eee',
    },
    itemImage: {
        width: '60px',
        height: '60px',
        objectFit: 'cover',
        borderRadius: '5px',
    },
    itemDetails: {
        flex: 1,
    },
    itemPrice: {
        fontWeight: 'bold',
        color: '#007bff',
    },
    orderFooter: {
        display: 'flex',
        justifyContent: 'space-between',
        padding: '20px',
        backgroundColor: '#f8f9fa',
        borderTop: '1px solid #eee',
        flexWrap: 'wrap',
        gap: '20px',
    },
    total: {
        fontSize: '1.2rem',
        color: '#28a745',
    },
    center: {
        textAlign: 'center',
        padding: '50px',
    },
};

export default OrdersPage;