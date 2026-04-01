import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { FaUsers, FaBoxes, FaShoppingCart, FaDollarSign } from 'react-icons/fa';

const AdminDashboardPage = () => {
    const { token } = useSelector((state) => state.auth);
    const [stats, setStats] = useState({
        totalUsers: 0,
        totalProducts: 0,
        totalOrders: 0,
        totalRevenue: 0,
    });
    const [recentOrders, setRecentOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            const { data } = await api.get('/admin/stats');
            setStats(data.stats);
            setRecentOrders(data.recentOrders);
        } catch (error) {
            console.error('Failed to fetch dashboard data:', error);
        } finally {
            setLoading(false);
        }
    };

    const statCards = [
        { title: 'Total Users', value: stats.totalUsers, icon: <FaUsers />, color: '#007bff' },
        { title: 'Total Products', value: stats.totalProducts, icon: <FaBoxes />, color: '#28a745' },
        { title: 'Total Orders', value: stats.totalOrders, icon: <FaShoppingCart />, color: '#ffc107' },
        { title: 'Total Revenue', value: `$${stats.totalRevenue.toFixed(2)}`, icon: <FaDollarSign />, color: '#dc3545' },
    ];

    if (loading) {
        return (
            <div style={styles.center}>
                <h2>Loading dashboard...</h2>
            </div>
        );
    }

    return (
        <div style={styles.container}>
            <h1 style={styles.title}>Admin Dashboard</h1>
            
            <div style={styles.statsGrid}>
                {statCards.map((stat, index) => (
                    <div key={index} style={styles.statCard}>
                        <div style={{ ...styles.statIcon, backgroundColor: stat.color }}>
                            {stat.icon}
                        </div>
                        <div style={styles.statInfo}>
                            <h3 style={styles.statTitle}>{stat.title}</h3>
                            <p style={styles.statValue}>{stat.value}</p>
                        </div>
                    </div>
                ))}
            </div>

            <div style={styles.quickActions}>
                <h2>Quick Actions</h2>
                <div style={styles.actionButtons}>
                    <Link to="/admin/products" style={styles.actionBtn}>
                        Manage Products
                    </Link>
                    <Link to="/admin/orders" style={styles.actionBtn}>
                        Manage Orders
                    </Link>
                </div>
            </div>

            <div style={styles.recentOrders}>
                <h2>Recent Orders</h2>
                {recentOrders.length === 0 ? (
                    <p>No orders yet</p>
                ) : (
                    <table style={styles.table}>
                        <thead>
                            <tr>
                                <th>Order ID</th>
                                <th>Customer</th>
                                <th>Total</th>
                                <th>Status</th>
                                <th>Date</th>
                            </tr>
                        </thead>
                        <tbody>
                            {recentOrders.map((order) => (
                                <tr key={order._id}>
                                    <td>{order._id.slice(-6)}</td>
                                    <td>{order.user?.name || 'N/A'}</td>
                                    <td>${order.totalPrice.toFixed(2)}</td>
                                    <td>
                                        <span style={{
                                            ...styles.statusBadge,
                                            backgroundColor: order.status === 'Delivered' ? '#d4edda' : '#fff3cd',
                                            color: order.status === 'Delivered' ? '#155724' : '#856404',
                                        }}>
                                            {order.status}
                                        </span>
                                    </td>
                                    <td>{new Date(order.createdAt).toLocaleDateString()}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
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
    statsGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        gap: '20px',
        marginBottom: '40px',
    },
    statCard: {
        backgroundColor: '#fff',
        borderRadius: '8px',
        padding: '20px',
        display: 'flex',
        alignItems: 'center',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    },
    statIcon: {
        width: '50px',
        height: '50px',
        borderRadius: '8px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#fff',
        fontSize: '24px',
        marginRight: '15px',
    },
    statInfo: {
        flex: 1,
    },
    statTitle: {
        fontSize: '14px',
        color: '#666',
        marginBottom: '5px',
    },
    statValue: {
        fontSize: '24px',
        fontWeight: 'bold',
        color: '#333',
    },
    quickActions: {
        backgroundColor: '#fff',
        borderRadius: '8px',
        padding: '20px',
        marginBottom: '30px',
    },
    actionButtons: {
        display: 'flex',
        gap: '15px',
        marginTop: '15px',
    },
    actionBtn: {
        padding: '10px 20px',
        backgroundColor: '#007bff',
        color: '#fff',
        textDecoration: 'none',
        borderRadius: '5px',
        transition: 'background-color 0.3s',
    },
    recentOrders: {
        backgroundColor: '#fff',
        borderRadius: '8px',
        padding: '20px',
    },
    table: {
        width: '100%',
        borderCollapse: 'collapse',
        marginTop: '15px',
    },
    statusBadge: {
        padding: '5px 10px',
        borderRadius: '5px',
        fontSize: '12px',
        fontWeight: 'bold',
    },
    center: {
        textAlign: 'center',
        padding: '50px',
    },
};

export default AdminDashboardPage;