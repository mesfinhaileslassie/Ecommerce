import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { 
    FaUsers, 
    FaBoxes, 
    FaShoppingCart, 
    FaDollarSign, 
    FaCheckCircle,
    FaClock,
    FaTruck,
    FaTag,
    FaStar,
    FaSpinner
} from 'react-icons/fa';

const AdminDashboardPage = () => {
    const { user } = useSelector((state) => state.auth);
    const [stats, setStats] = useState({
        totalUsers: 0,
        totalProducts: 0,
        totalOrders: 0,
        totalRevenue: 0,
        pendingOrders: 0,
        shippedOrders: 0,
        deliveredOrders: 0,
        lowStockProducts: 0,
    });
    const [recentOrders, setRecentOrders] = useState([]);
    const [topProducts, setTopProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedPeriod, setSelectedPeriod] = useState('week');

    useEffect(() => {
        if (user && user.isAdmin) {
            fetchDashboardData();
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
            });
            setRecentOrders(data.recentOrders || []);
        } catch (error) {
            console.error('Failed to fetch dashboard data:', error);
        } finally {
            setLoading(false);
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

    if (loading) {
        return (
            <div style={styles.center}>
                <FaSpinner style={styles.spinner} />
                <p>Loading dashboard...</p>
            </div>
        );
    }

    return (
        <div>
            {/* Full Width Hero Section */}
            <div className="admin-hero-fullwidth">
                <div className="admin-hero-fullwidth-overlay"></div>
                <div className="admin-hero-fullwidth-content">
                    <h1 className="admin-hero-fullwidth-title">Admin Dashboard</h1>
                    <p className="admin-hero-fullwidth-subtitle">Welcome back, {user?.name}!</p>
                    <div className="admin-tab-container">
                        <button 
                            onClick={() => setSelectedPeriod('week')}
                            className={`admin-tab-btn ${selectedPeriod === 'week' ? 'admin-tab-btn-active' : ''}`}
                        >
                            Week
                        </button>
                        <button 
                            onClick={() => setSelectedPeriod('month')}
                            className={`admin-tab-btn ${selectedPeriod === 'month' ? 'admin-tab-btn-active' : ''}`}
                        >
                            Month
                        </button>
                        <button 
                            onClick={() => setSelectedPeriod('year')}
                            className={`admin-tab-btn ${selectedPeriod === 'year' ? 'admin-tab-btn-active' : ''}`}
                        >
                            Year
                        </button>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div style={styles.container}>
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
                    </div>
                </div>

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
                                    <div>
                                        <span style={styles.orderId}>#{order._id.slice(-8)}</span>
                                        <span style={styles.orderCustomer}>{order.user?.name || 'Guest'}</span>
                                    </div>
                                    <div>
                                        <span style={styles.orderAmount}>${order.totalPrice.toFixed(2)}</span>
                                        <span style={{
                                            ...styles.orderStatus,
                                            backgroundColor: order.status === 'Delivered' ? '#d1fae5' : '#fef3c7',
                                            color: order.status === 'Delivered' ? '#065f46' : '#92400e',
                                        }}>
                                            {order.status}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
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
        transition: 'transform 0.3s',
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
        transition: 'background-color 0.3s',
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
        flexWrap: 'wrap',
        gap: '10px',
    },
    orderId: {
        fontWeight: 'bold',
        fontFamily: 'monospace',
        fontSize: '0.85rem',
        marginRight: '10px',
    },
    orderCustomer: {
        fontSize: '0.75rem',
        color: '#666',
    },
    orderAmount: {
        fontWeight: 'bold',
        marginRight: '10px',
    },
    orderStatus: {
        fontSize: '0.7rem',
        padding: '2px 8px',
        borderRadius: '20px',
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
    spinner: {
        animation: 'spin 1s linear infinite',
        fontSize: '2rem',
        color: '#6366f1',
        marginBottom: '1rem',
    },
};

// Inject CSS Styles
const styleSheet = document.createElement("style");
styleSheet.textContent = `
    @keyframes spin {
        from { transform: rotate(0deg); }
        to { transform: rotate(360deg); }
    }
    
    /* FULL WIDTH HERO SECTION - NO WHITE SPACE */
    .admin-hero-fullwidth {
        position: relative;
        width: 100%;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        min-height: 320px;
        display: flex;
        align-items: center;
        justify-content: center;
        text-align: center;
        overflow: hidden;
        margin: 0;
        padding: 0;
    }
    
    .admin-hero-fullwidth-overlay {
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: radial-gradient(circle at center, rgba(0,0,0,0.2) 0%, rgba(0,0,0,0.3) 100%);
        pointer-events: none;
    }
    
    .admin-hero-fullwidth-content {
        position: relative;
        z-index: 1;
        color: white;
        padding: 2rem;
        max-width: 1200px;
        width: 100%;
        margin: 0 auto;
    }
    
    .admin-hero-fullwidth-title {
        font-size: 2.5rem;
        font-weight: bold;
        margin-bottom: 0.75rem;
        animation: fadeIn 0.6s ease-out;
    }
    
    .admin-hero-fullwidth-subtitle {
        font-size: 1.1rem;
        margin-bottom: 1.5rem;
        opacity: 0.9;
    }
    
    /* VISIBLE TABS */
    .admin-tab-container {
        display: flex;
        gap: 15px;
        justify-content: center;
        margin-top: 0.5rem;
        flex-wrap: wrap;
    }
    
    .admin-tab-btn {
        padding: 10px 30px;
        background: rgba(255, 255, 255, 0.15);
        border: 2px solid rgba(255, 255, 255, 0.4);
        border-radius: 40px;
        color: white;
        cursor: pointer;
        font-size: 1rem;
        font-weight: 600;
        transition: all 0.3s ease;
        letter-spacing: 0.5px;
    }
    
    .admin-tab-btn-active {
        padding: 10px 30px;
        background: white;
        border: 2px solid white;
        border-radius: 40px;
        color: #667eea;
        cursor: pointer;
        font-size: 1rem;
        font-weight: 700;
        box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
    }
    
    .admin-tab-btn:hover {
        background: rgba(255, 255, 255, 0.3);
        transform: translateY(-2px);
        border-color: rgba(255, 255, 255, 0.7);
    }
    
    .admin-tab-btn-active:hover {
        background: white;
        transform: translateY(-2px);
        box-shadow: 0 6px 20px rgba(0, 0, 0, 0.25);
    }
    
    @keyframes fadeIn {
        from {
            opacity: 0;
            transform: translateY(20px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }
    
    /* Hover effects */
    .stat-card:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 6px rgba(0,0,0,0.1);
    }
    
    .action-btn:hover {
        background-color: #4f46e5;
        transform: translateY(-2px);
    }
    
    /* Responsive Styles */
    @media (max-width: 768px) {
        .admin-hero-fullwidth {
            min-height: 260px;
        }
        
        .admin-hero-fullwidth-title {
            font-size: 1.8rem;
        }
        
        .admin-hero-fullwidth-subtitle {
            font-size: 0.9rem;
            margin-bottom: 1rem;
        }
        
        .admin-tab-btn,
        .admin-tab-btn-active {
            padding: 7px 20px;
            font-size: 0.85rem;
        }
        
        .admin-tab-container {
            gap: 10px;
        }
    }
    
    @media (max-width: 480px) {
        .admin-hero-fullwidth {
            min-height: 240px;
        }
        
        .admin-hero-fullwidth-title {
            font-size: 1.4rem;
        }
        
        .admin-hero-fullwidth-subtitle {
            font-size: 0.8rem;
        }
        
        .stat-value {
            font-size: 1.3rem;
        }
        
        .stat-icon {
            width: 40px !important;
            height: 40px !important;
            font-size: 18px !important;
        }
        
        .admin-tab-btn,
        .admin-tab-btn-active {
            padding: 5px 14px;
            font-size: 0.75rem;
        }
        
        .admin-tab-container {
            gap: 8px;
        }
    }
`;
document.head.appendChild(styleSheet);

export default AdminDashboardPage;