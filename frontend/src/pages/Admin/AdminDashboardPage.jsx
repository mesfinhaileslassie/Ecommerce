import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { 
    FaUsers, 
    FaBoxes, 
    FaShoppingCart, 
    FaDollarSign, 
    FaTachometerAlt,
    FaChartLine,
    FaEye,
    FaCheckCircle,
    FaClock,
    FaTruck,
    FaTag,
    FaStar,
    FaArrowUp,
    FaArrowDown
} from 'react-icons/fa';

const AdminDashboardPage = () => {
    const { token, user } = useSelector((state) => state.auth);
    const [stats, setStats] = useState({
        totalUsers: 0,
        totalProducts: 0,
        totalOrders: 0,
        totalRevenue: 0,
        pendingOrders: 0,
        shippedOrders: 0,
        deliveredOrders: 0,
        lowStockProducts: 0,
        averageOrderValue: 0,
    });
    const [recentOrders, setRecentOrders] = useState([]);
    const [recentUsers, setRecentUsers] = useState([]);
    const [topProducts, setTopProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedPeriod, setSelectedPeriod] = useState('week');

    useEffect(() => {
        if (user && user.isAdmin) {
            fetchDashboardData();
            fetchRecentUsers();
            fetchTopProducts();
        }
    }, [user, selectedPeriod]);

    const fetchDashboardData = async () => {
        try {
            const { data } = await api.get('/admin/stats');
            setStats({
                ...data.stats,
                pendingOrders: data.stats.pendingOrders || 0,
                shippedOrders: data.stats.shippedOrders || 0,
                deliveredOrders: data.stats.deliveredOrders || 0,
                lowStockProducts: data.stats.lowStockProducts || 0,
                averageOrderValue: data.stats.totalRevenue / (data.stats.totalOrders || 1),
            });
            setRecentOrders(data.recentOrders || []);
        } catch (error) {
            console.error('Failed to fetch dashboard data:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchRecentUsers = async () => {
        try {
            const { data } = await api.get('/users?limit=5');
            setRecentUsers(data.users || []);
        } catch (error) {
            console.error('Failed to fetch users:', error);
        }
    };

    const fetchTopProducts = async () => {
        try {
            const { data } = await api.get('/products/top');
            setTopProducts(data.products || []);
        } catch (error) {
            console.error('Failed to fetch top products:', error);
        }
    };

    const statCards = [
        { 
            title: 'Total Users', 
            value: stats.totalUsers, 
            icon: <FaUsers />, 
            color: '#6366f1',
            bgColor: '#eef2ff',
            link: '/admin/users'
        },
        { 
            title: 'Total Products', 
            value: stats.totalProducts, 
            icon: <FaBoxes />, 
            color: '#10b981',
            bgColor: '#d1fae5',
            link: '/admin/products'
        },
        { 
            title: 'Total Orders', 
            value: stats.totalOrders, 
            icon: <FaShoppingCart />, 
            color: '#f59e0b',
            bgColor: '#fef3c7',
            link: '/admin/orders'
        },
        { 
            title: 'Total Revenue', 
            value: `$${stats.totalRevenue.toFixed(2)}`, 
            icon: <FaDollarSign />, 
            color: '#ef4444',
            bgColor: '#fee2e2',
            link: '/admin/orders'
        },
    ];

    const orderStatusCards = [
        { 
            title: 'Pending', 
            value: stats.pendingOrders, 
            icon: <FaClock />, 
            color: '#f59e0b',
            bgColor: '#fef3c7',
        },
        { 
            title: 'Shipped', 
            value: stats.shippedOrders, 
            icon: <FaTruck />, 
            color: '#3b82f6',
            bgColor: '#dbeafe',
        },
        { 
            title: 'Delivered', 
            value: stats.deliveredOrders, 
            icon: <FaCheckCircle />, 
            color: '#10b981',
            bgColor: '#d1fae5',
        },
        { 
            title: 'Low Stock', 
            value: stats.lowStockProducts, 
            icon: <FaBoxes />, 
            color: '#ef4444',
            bgColor: '#fee2e2',
        },
    ];

    if (loading) {
        return (
            <div style={styles.center}>
                <div className="spinner"></div>
                <p>Loading dashboard...</p>
            </div>
        );
    }

    return (
        <div style={styles.container}>
            <div style={styles.header}>
                <div>
                    <h1 style={styles.title}>Admin Dashboard</h1>
                    <p style={styles.subtitle}>Welcome back, {user?.name}!</p>
                </div>
                <div style={styles.periodSelector}>
                    <button 
                        onClick={() => setSelectedPeriod('week')}
                        style={{...styles.periodBtn, ...(selectedPeriod === 'week' && styles.periodBtnActive)}}
                    >
                        Week
                    </button>
                    <button 
                        onClick={() => setSelectedPeriod('month')}
                        style={{...styles.periodBtn, ...(selectedPeriod === 'month' && styles.periodBtnActive)}}
                    >
                        Month
                    </button>
                    <button 
                        onClick={() => setSelectedPeriod('year')}
                        style={{...styles.periodBtn, ...(selectedPeriod === 'year' && styles.periodBtnActive)}}
                    >
                        Year
                    </button>
                </div>
            </div>

            {/* Main Stats Cards */}
            <div style={styles.statsGrid}>
                {statCards.map((stat, index) => (
                    <Link to={stat.link} key={index} style={styles.statCard}>
                        <div style={{...styles.statIcon, backgroundColor: stat.bgColor, color: stat.color}}>
                            {stat.icon}
                        </div>
                        <div style={styles.statInfo}>
                            <h3 style={styles.statTitle}>{stat.title}</h3>
                            <p style={styles.statValue}>{stat.value}</p>
                        </div>
                    </Link>
                ))}
            </div>

            {/* Order Status Cards */}
            <div style={styles.orderStatusGrid}>
                {orderStatusCards.map((status, index) => (
                    <div key={index} style={styles.statusCard}>
                        <div style={{...styles.statusIcon, backgroundColor: status.bgColor, color: status.color}}>
                            {status.icon}
                        </div>
                        <div>
                            <h4 style={styles.statusTitle}>{status.title}</h4>
                            <p style={styles.statusValue}>{status.value}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Quick Actions */}
            <div style={styles.section}>
                <h2 style={styles.sectionTitle}>Quick Actions</h2>
                <div style={styles.actionButtons}>
                    <Link to="/admin/products" style={styles.actionBtn}>
                        <FaBoxes /> Manage Products
                    </Link>
                    <Link to="/admin/orders" style={styles.actionBtn}>
                        <FaShoppingCart /> Manage Orders
                    </Link>
                    <Link to="/admin/coupons" style={styles.actionBtn}>
                        <FaTag /> Manage Coupons
                    </Link>
                    <Link to="/admin/users" style={styles.actionBtn}>
                        <FaUsers /> Manage Users
                    </Link>
                </div>
            </div>

            {/* Recent Orders and Top Products */}
            <div style={styles.twoColumnGrid}>
                {/* Recent Orders */}
                <div style={styles.card}>
                    <div style={styles.cardHeader}>
                        <h2 style={styles.cardTitle}>
                            <FaClock /> Recent Orders
                        </h2>
                        <Link to="/admin/orders" style={styles.viewAllLink}>View All →</Link>
                    </div>
                    {recentOrders.length === 0 ? (
                        <p style={styles.emptyText}>No orders yet</p>
                    ) : (
                        <div style={styles.orderList}>
                            {recentOrders.map((order) => (
                                <div key={order._id} style={styles.orderItem}>
                                    <div style={styles.orderInfo}>
                                        <span style={styles.orderId}>#{order._id.slice(-8)}</span>
                                        <span style={styles.orderCustomer}>{order.user?.name || 'Guest'}</span>
                                    </div>
                                    <div style={styles.orderDetails}>
                                        <span style={styles.orderAmount}>${order.totalPrice.toFixed(2)}</span>
                                        <span style={{
                                            ...styles.orderStatus,
                                            backgroundColor: order.status === 'Delivered' ? '#d1fae5' : 
                                                           order.status === 'Shipped' ? '#dbeafe' : '#fef3c7',
                                            color: order.status === 'Delivered' ? '#065f46' : 
                                                   order.status === 'Shipped' ? '#1e40af' : '#92400e',
                                        }}>
                                            {order.status}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Top Products */}
                <div style={styles.card}>
                    <div style={styles.cardHeader}>
                        <h2 style={styles.cardTitle}>
                            <FaStar /> Top Products
                        </h2>
                        <Link to="/admin/products" style={styles.viewAllLink}>View All →</Link>
                    </div>
                    {topProducts.length === 0 ? (
                        <p style={styles.emptyText}>No products yet</p>
                    ) : (
                        <div style={styles.productList}>
                            {topProducts.map((product, index) => (
                                <div key={product._id} style={styles.productItem}>
                                    <div style={styles.productRank}>{index + 1}</div>
                                    <img 
                                        src={product.imageUrl || 'https://via.placeholder.com/40'} 
                                        alt={product.name}
                                        style={styles.productImage}
                                    />
                                    <div style={styles.productInfo}>
                                        <p style={styles.productName}>{product.name}</p>
                                        <p style={styles.productSales}>{product.soldCount || 0} sold</p>
                                    </div>
                                    <div style={styles.productRevenue}>
                                        ${((product.price * (product.soldCount || 0)).toFixed(2))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Recent Users */}
            <div style={styles.card}>
                <div style={styles.cardHeader}>
                    <h2 style={styles.cardTitle}>
                        <FaUsers /> New Users
                    </h2>
                    <Link to="/admin/users" style={styles.viewAllLink}>View All →</Link>
                </div>
                {recentUsers.length === 0 ? (
                    <p style={styles.emptyText}>No users yet</p>
                ) : (
                    <div style={styles.userList}>
                        {recentUsers.map((user) => (
                            <div key={user._id} style={styles.userItem}>
                                <div style={styles.userAvatar}>
                                    {user.name?.charAt(0).toUpperCase()}
                                </div>
                                <div style={styles.userInfo}>
                                    <p style={styles.userName}>{user.name}</p>
                                    <p style={styles.userEmail}>{user.email}</p>
                                </div>
                                <div style={styles.userDate}>
                                    {new Date(user.createdAt).toLocaleDateString()}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
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
        flexWrap: 'wrap',
        gap: '15px',
    },
    title: {
        fontSize: '2rem',
        color: '#333',
        marginBottom: '5px',
    },
    subtitle: {
        color: '#666',
        fontSize: '0.9rem',
    },
    periodSelector: {
        display: 'flex',
        gap: '10px',
        backgroundColor: '#f3f4f6',
        padding: '4px',
        borderRadius: '0.5rem',
    },
    periodBtn: {
        padding: '8px 16px',
        border: 'none',
        backgroundColor: 'transparent',
        borderRadius: '0.3rem',
        cursor: 'pointer',
        fontSize: '0.9rem',
        transition: 'all 0.3s',
    },
    periodBtnActive: {
        backgroundColor: '#fff',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
        color: '#6366f1',
    },
    statsGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
        gap: '20px',
        marginBottom: '30px',
    },
    statCard: {
        backgroundColor: '#fff',
        borderRadius: '1rem',
        padding: '20px',
        display: 'flex',
        alignItems: 'center',
        gap: '15px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        textDecoration: 'none',
        transition: 'transform 0.3s, box-shadow 0.3s',
    },
    statIcon: {
        width: '50px',
        height: '50px',
        borderRadius: '0.75rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '24px',
    },
    statInfo: {
        flex: 1,
    },
    statTitle: {
        fontSize: '0.85rem',
        color: '#666',
        marginBottom: '5px',
    },
    statValue: {
        fontSize: '1.8rem',
        fontWeight: 'bold',
        color: '#333',
        margin: 0,
    },
    orderStatusGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '20px',
        marginBottom: '30px',
    },
    statusCard: {
        backgroundColor: '#fff',
        borderRadius: '0.75rem',
        padding: '15px',
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
    },
    statusIcon: {
        width: '40px',
        height: '40px',
        borderRadius: '0.5rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '18px',
    },
    statusTitle: {
        fontSize: '0.8rem',
        color: '#666',
        marginBottom: '5px',
    },
    statusValue: {
        fontSize: '1.2rem',
        fontWeight: 'bold',
        color: '#333',
        margin: 0,
    },
    section: {
        marginBottom: '30px',
    },
    sectionTitle: {
        fontSize: '1.2rem',
        marginBottom: '15px',
        color: '#333',
    },
    actionButtons: {
        display: 'flex',
        gap: '15px',
        flexWrap: 'wrap',
    },
    actionBtn: {
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        padding: '12px 20px',
        backgroundColor: '#6366f1',
        color: '#fff',
        textDecoration: 'none',
        borderRadius: '0.5rem',
        transition: 'background-color 0.3s, transform 0.3s',
    },
    twoColumnGrid: {
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '20px',
        marginBottom: '30px',
    },
    card: {
        backgroundColor: '#fff',
        borderRadius: '1rem',
        padding: '20px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    },
    cardHeader: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '15px',
        paddingBottom: '10px',
        borderBottom: '1px solid #eee',
    },
    cardTitle: {
        fontSize: '1rem',
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        margin: 0,
    },
    viewAllLink: {
        color: '#6366f1',
        textDecoration: 'none',
        fontSize: '0.85rem',
    },
    orderList: {
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
    },
    orderItem: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '10px',
        backgroundColor: '#f8fafc',
        borderRadius: '0.5rem',
    },
    orderInfo: {
        display: 'flex',
        flexDirection: 'column',
        gap: '4px',
    },
    orderId: {
        fontWeight: 'bold',
        fontFamily: 'monospace',
        fontSize: '0.85rem',
    },
    orderCustomer: {
        fontSize: '0.75rem',
        color: '#666',
    },
    orderDetails: {
        textAlign: 'right',
    },
    orderAmount: {
        fontWeight: 'bold',
        display: 'block',
        marginBottom: '4px',
    },
    orderStatus: {
        fontSize: '0.7rem',
        padding: '2px 8px',
        borderRadius: '20px',
    },
    productList: {
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
    },
    productItem: {
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        padding: '10px',
        backgroundColor: '#f8fafc',
        borderRadius: '0.5rem',
    },
    productRank: {
        width: '30px',
        height: '30px',
        backgroundColor: '#e5e7eb',
        borderRadius: '50%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontWeight: 'bold',
        fontSize: '0.9rem',
    },
    productImage: {
        width: '40px',
        height: '40px',
        objectFit: 'cover',
        borderRadius: '0.5rem',
    },
    productInfo: {
        flex: 1,
    },
    productName: {
        fontWeight: '500',
        marginBottom: '4px',
        fontSize: '0.9rem',
    },
    productSales: {
        fontSize: '0.7rem',
        color: '#666',
    },
    productRevenue: {
        fontWeight: 'bold',
        color: '#10b981',
    },
    userList: {
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
    },
    userItem: {
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        padding: '10px',
        backgroundColor: '#f8fafc',
        borderRadius: '0.5rem',
    },
    userAvatar: {
        width: '40px',
        height: '40px',
        backgroundColor: '#6366f1',
        borderRadius: '50%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#fff',
        fontWeight: 'bold',
    },
    userInfo: {
        flex: 1,
    },
    userName: {
        fontWeight: '500',
        marginBottom: '4px',
    },
    userEmail: {
        fontSize: '0.75rem',
        color: '#666',
    },
    userDate: {
        fontSize: '0.75rem',
        color: '#999',
    },
    emptyText: {
        textAlign: 'center',
        color: '#999',
        padding: '20px',
    },
    center: {
        textAlign: 'center',
        padding: '50px',
    },
};

export default AdminDashboardPage;