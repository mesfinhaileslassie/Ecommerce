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
            <div className="admin-center">
                <FaSpinner className="admin-spinner" />
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
            <div className="admin-container">
                {/* Main Stats Cards */}
                <div className="admin-stats-grid">
                    {statCards.map((stat, index) => (
                        <Link to={stat.link} key={index} className="admin-stat-card">
                            <div className="admin-stat-icon" style={{ backgroundColor: stat.bgColor, color: stat.color }}>
                                {stat.icon}
                            </div>
                            <div className="admin-stat-info">
                                <h3 className="admin-stat-title">{stat.title}</h3>
                                <p className="admin-stat-value">{stat.value}</p>
                            </div>
                        </Link>
                    ))}
                </div>

                {/* Quick Actions */}
                <div className="admin-section">
                    <h2 className="admin-section-title">Quick Actions</h2>
                    <div className="admin-action-buttons">
                        <Link to="/admin/products" className="admin-action-btn">
                            <FaBoxes /> Manage Products
                        </Link>
                        <Link to="/admin/orders" className="admin-action-btn">
                            <FaShoppingCart /> Manage Orders
                        </Link>
                        <Link to="/admin/coupons" className="admin-action-btn">
                            <FaTag /> Manage Coupons
                        </Link>
                    </div>
                </div>

                {/* Recent Orders */}
                <div className="admin-card">
                    <div className="admin-card-header">
                        <h2 className="admin-card-title">
                            <FaClock /> Recent Orders
                        </h2>
                        <Link to="/admin/orders" className="admin-view-all-link">View All →</Link>
                    </div>
                    {recentOrders.length === 0 ? (
                        <p className="admin-empty-text">No orders yet</p>
                    ) : (
                        <div className="admin-order-list">
                            {recentOrders.map((order) => (
                                <div key={order._id} className="admin-order-item">
                                    <div>
                                        <span className="admin-order-id">#{order._id.slice(-8)}</span>
                                        <span className="admin-order-customer">{order.user?.name || 'Guest'}</span>
                                    </div>
                                    <div>
                                        <span className="admin-order-amount">${order.totalPrice.toFixed(2)}</span>
                                        <span className={`admin-order-status admin-order-status-${order.status.toLowerCase()}`}>
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

// Inject CSS Styles for Admin Dashboard (these will work with dark mode)
const styleSheet = document.createElement("style");
styleSheet.textContent = `
    @keyframes spin {
        from { transform: rotate(0deg); }
        to { transform: rotate(360deg); }
    }
    
    .admin-center {
        text-align: center;
        padding: 50px;
    }
    
    .admin-spinner {
        animation: spin 1s linear infinite;
        font-size: 2rem;
        color: #6366f1;
        margin-bottom: 1rem;
    }
    
    .admin-container {
        max-width: 1400px;
        margin: 0 auto;
        padding: 20px;
    }
    
    .admin-stats-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
        gap: 20px;
        margin-bottom: 30px;
    }
    
    .admin-stat-card {
        background-color: var(--card-bg, #fff);
        border-radius: 1rem;
        padding: 20px;
        display: flex;
        align-items: center;
        gap: 15px;
        box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        text-decoration: none;
        transition: transform 0.3s;
        border: 1px solid var(--border-color, #e5e7eb);
    }
    
    .admin-stat-card:hover {
        transform: translateY(-2px);
    }
    
    .admin-stat-icon {
        width: 50px;
        height: 50px;
        border-radius: 0.75rem;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 24px;
    }
    
    .admin-stat-info {
        flex: 1;
    }
    
    .admin-stat-title {
        font-size: 0.85rem;
        color: var(--text-secondary, #666);
        margin-bottom: 5px;
    }
    
    .admin-stat-value {
        font-size: 1.8rem;
        font-weight: bold;
        color: var(--text-primary, #333);
        margin: 0;
    }
    
    .admin-section {
        margin-bottom: 30px;
    }
    
    .admin-section-title {
        font-size: 1.2rem;
        margin-bottom: 15px;
        color: var(--text-primary, #333);
    }
    
    .admin-action-buttons {
        display: flex;
        gap: 15px;
        flex-wrap: wrap;
    }
    
    .admin-action-btn {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 12px 20px;
        background: linear-gradient(135deg, #4f46e5, #6366f1);
        color: #fff !important;
        text-decoration: none;
        border-radius: 0.5rem;
        transition: background-color 0.3s;
    }
    
    .admin-action-btn:hover {
        background: linear-gradient(135deg, #4338ca, #4f46e5);
        transform: translateY(-2px);
    }
    
    .admin-card {
        background-color: var(--card-bg, #fff);
        border-radius: 1rem;
        padding: 20px;
        box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        border: 1px solid var(--border-color, #e5e7eb);
    }
    
    .admin-card-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 15px;
        padding-bottom: 10px;
        border-bottom: 1px solid var(--border-color, #eee);
    }
    
    .admin-card-title {
        font-size: 1rem;
        display: flex;
        align-items: center;
        gap: 8px;
        margin: 0;
        color: var(--text-primary, #333);
    }
    
    .admin-view-all-link {
        color: #6366f1;
        text-decoration: none;
        font-size: 0.85rem;
    }
    
    .admin-order-list {
        display: flex;
        flex-direction: column;
        gap: 12px;
    }
    
    .admin-order-item {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 10px;
        background-color: var(--bg-secondary, #f8fafc);
        border-radius: 0.5rem;
        flex-wrap: wrap;
        gap: 10px;
    }
    
    .admin-order-id {
        font-weight: bold;
        font-family: monospace;
        font-size: 0.85rem;
        margin-right: 10px;
        color: var(--text-primary, #333);
    }
    
    .admin-order-customer {
        font-size: 0.75rem;
        color: var(--text-secondary, #666);
    }
    
    .admin-order-amount {
        font-weight: bold;
        margin-right: 10px;
        color: var(--text-primary, #333);
    }
    
    .admin-order-status {
        font-size: 0.7rem;
        padding: 2px 8px;
        border-radius: 20px;
    }
    
    .admin-order-status-delivered {
        background-color: #d1fae5;
        color: #065f46;
    }
    
    .admin-order-status-pending,
    .admin-order-status-processing {
        background-color: #fef3c7;
        color: #92400e;
    }
    
    .admin-empty-text {
        text-align: center;
        padding: 20px;
        color: var(--text-secondary, #999);
    }
    
    /* FULL WIDTH HERO SECTION */
    .admin-hero-fullwidth {
        position: relative;
        width: 100%;
        background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%);
        min-height: 300px;
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
        background: radial-gradient(circle at center, rgba(0,0,0,0.15) 0%, rgba(0,0,0,0.25) 100%);
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
        color: white !important;
    }
    
    .admin-hero-fullwidth-subtitle {
        font-size: 1.1rem;
        margin-bottom: 1.5rem;
        opacity: 0.9;
        color: white !important;
    }
    
    .admin-tab-container {
        display: flex;
        gap: 15px;
        justify-content: center;
        margin-top: 0.5rem;
        flex-wrap: wrap;
    }
    
    .admin-tab-btn {
        padding: 10px 30px;
        background: rgba(255, 255, 255, 0.2);
        border: 2px solid rgba(255, 255, 255, 0.5);
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
        color: #6366f1;
        cursor: pointer;
        font-size: 1rem;
        font-weight: 700;
        box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
    }
    
    .admin-tab-btn:hover {
        background: rgba(255, 255, 255, 0.35);
        transform: translateY(-2px);
        border-color: rgba(255, 255, 255, 0.8);
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
        
        .admin-stat-value {
            font-size: 1.3rem;
        }
        
        .admin-stat-icon {
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