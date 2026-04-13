import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { updateProfile, updateAvatar, logout } from '../../redux/slices/authSlice';
import { fetchMyOrders } from '../../redux/slices/orderSlice';
import { fetchWishlist } from '../../redux/slices/wishlistSlice';
import { Link, useNavigate } from 'react-router-dom';
import { FaUser, FaEnvelope, FaLock, FaCamera, FaSignOutAlt, FaShoppingBag, FaHeart, FaMapMarkerAlt, FaSpinner, FaGoogle } from 'react-icons/fa';
import toast from 'react-hot-toast';

const ProfilePage = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    
    const { user, loading: authLoading } = useSelector((state) => state.auth);
    const { orders, loading: ordersLoading } = useSelector((state) => state.orders);
    const { items: wishlistItems, loading: wishlistLoading } = useSelector((state) => state.wishlist);
    
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({
        name: user?.name || '',
        email: user?.email || '',
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
    });
    const [avatarPreview, setAvatarPreview] = useState(user?.avatar || '');
    const [uploadingAvatar, setUploadingAvatar] = useState(false);
    const [isGoogleUser, setIsGoogleUser] = useState(false);

    useEffect(() => {
        if (user) {
            console.log('📊 Fetching user data for profile...');
            dispatch(fetchMyOrders());
            dispatch(fetchWishlist());
            // Check if user is a Google user
            setIsGoogleUser(!!user.googleId);
            console.log('Is Google user:', !!user.googleId);
        }
    }, [dispatch, user]);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const handleAvatarChange = async (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 2 * 1024 * 1024) {
                toast.error('Image size should be less than 2MB');
                return;
            }
            
            if (!file.type.startsWith('image/')) {
                toast.error('Please upload an image file');
                return;
            }
            
            setUploadingAvatar(true);
            
            const reader = new FileReader();
            reader.onloadend = async () => {
                const base64String = reader.result;
                setAvatarPreview(base64String);
                try {
                    await dispatch(updateAvatar(base64String));
                    toast.success('Avatar updated successfully!');
                } catch (error) {
                    toast.error(error.message);
                    setAvatarPreview(user?.avatar || '');
                } finally {
                    setUploadingAvatar(false);
                }
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        const isSettingPassword = formData.newPassword && !formData.currentPassword;
        const isChangingPassword = formData.currentPassword || formData.newPassword;
        
        // For Google users setting password for first time
        if (isGoogleUser && isSettingPassword) {
            if (formData.newPassword.length < 6) {
                toast.error('Password must be at least 6 characters');
                return;
            }
            if (formData.newPassword !== formData.confirmPassword) {
                toast.error('Passwords do not match');
                return;
            }
        }
        // For regular users changing password
        else if (!isGoogleUser && isChangingPassword) {
            if (!formData.currentPassword) {
                toast.error('Please enter your current password');
                return;
            }
            if (!formData.newPassword) {
                toast.error('Please enter a new password');
                return;
            }
            if (formData.newPassword.length < 6) {
                toast.error('New password must be at least 6 characters');
                return;
            }
            if (formData.newPassword !== formData.confirmPassword) {
                toast.error('New passwords do not match');
                return;
            }
        }
        
        try {
            const updateData = {
                name: formData.name,
                email: formData.email,
            };
            
            // Handle password update
            if (formData.newPassword) {
                updateData.newPassword = formData.newPassword;
                // For regular users, also send current password
                if (!isGoogleUser) {
                    updateData.currentPassword = formData.currentPassword;
                }
            }
            
            console.log('Sending update data...');
            const result = await dispatch(updateProfile(updateData));
            
            if (result.error) {
                toast.error(result.error.message);
            } else {
                toast.success('Profile updated successfully!');
                setIsEditing(false);
                setFormData({
                    ...formData,
                    currentPassword: '',
                    newPassword: '',
                    confirmPassword: '',
                });
            }
        } catch (error) {
            console.error('Update error:', error);
            toast.error(error.message || 'Update failed');
        }
    };

    const handleLogout = () => {
        dispatch(logout());
        toast.success('Logged out successfully');
        navigate('/');
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'Recently joined';
        try {
            const date = new Date(dateString);
            if (isNaN(date.getTime())) return 'Recently joined';
            return date.toLocaleDateString('en-US', { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
            });
        } catch (error) {
            return 'Recently joined';
        }
    };

    const getAvatarUrl = () => {
        if (avatarPreview) return avatarPreview;
        if (user?.avatar) return user.avatar;
        return `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'User')}&background=6366f1&color=fff&size=120`;
    };

    const orderCount = Array.isArray(orders) ? orders.length : 0;
    const wishlistCount = Array.isArray(wishlistItems) ? wishlistItems.length : 0;

    if (!user) {
        return (
            <div className="profile-center">
                <h2>Please login to view your profile</h2>
                <Link to="/login" className="profile-login-btn">Login</Link>
            </div>
        );
    }

    if (ordersLoading || wishlistLoading) {
        return (
            <div className="profile-center">
                <FaSpinner className="profile-spinner" />
                <p>Loading your profile...</p>
            </div>
        );
    }

    return (
        <div className="profile-container">
            <h1 className="profile-title">My Profile</h1>
            
            <div className="profile-grid">
                {/* Profile Card */}
                <div className="profile-card">
                    <div className="profile-avatar-section">
                        <div className="profile-avatar-container">
                            <img 
                                src={getAvatarUrl()} 
                                alt={user.name}
                                className="profile-avatar"
                            />
                            <label htmlFor="avatar-upload" className="profile-camera-icon">
                                {uploadingAvatar ? <FaSpinner className="profile-spinner-icon" /> : <FaCamera />}
                                <input
                                    id="avatar-upload"
                                    type="file"
                                    accept="image/*"
                                    onChange={handleAvatarChange}
                                    disabled={uploadingAvatar}
                                    style={{ display: 'none' }}
                                />
                            </label>
                        </div>
                        <h2 className="profile-user-name">{user.name}</h2>
                        <p className="profile-user-email">{user.email}</p>
                        {isGoogleUser && (
                            <p className="profile-google-badge">
                                <FaGoogle /> Signed in with Google
                            </p>
                        )}
                        <p className="profile-user-since">
                            Member since {formatDate(user.createdAt)}
                        </p>
                        <button onClick={handleLogout} className="profile-logout-btn">
                            <FaSignOutAlt /> Logout
                        </button>
                    </div>
                    
                    <div className="profile-stats-section">
                        <Link to="/orders" className="profile-stat-item">
                            <div className="profile-stat-icon-container">
                                <FaShoppingBag className="profile-stat-icon" />
                            </div>
                            <div>
                                <h3 className="profile-stat-number">{orderCount}</h3>
                                <p className="profile-stat-label">Orders</p>
                            </div>
                        </Link>
                        <Link to="/wishlist" className="profile-stat-item">
                            <div className="profile-stat-icon-container">
                                <FaHeart className="profile-stat-icon" />
                            </div>
                            <div>
                                <h3 className="profile-stat-number">{wishlistCount}</h3>
                                <p className="profile-stat-label">Wishlist</p>
                            </div>
                        </Link>
                    </div>
                </div>
                
                {/* Edit Profile Form */}
                <div className="profile-edit-card">
                    <div className="profile-card-header">
                        <h2>Account Information</h2>
                        {!isEditing && (
                            <button onClick={() => setIsEditing(true)} className="profile-edit-btn">
                                Edit Profile
                            </button>
                        )}
                    </div>
                    
                    {isEditing ? (
                        <form onSubmit={handleSubmit} className="profile-form">
                            <div className="profile-form-group">
                                <label className="profile-label">
                                    <FaUser /> Full Name
                                </label>
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    required
                                    className="profile-input"
                                    placeholder="Enter your full name"
                                />
                            </div>
                            
                            <div className="profile-form-group">
                                <label className="profile-label">
                                    <FaEnvelope /> Email Address
                                </label>
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    required
                                    className="profile-input"
                                    placeholder="Enter your email"
                                />
                            </div>
                            
                            <div className="profile-divider" />
                            
                            <h3 className="profile-subtitle">
                                {isGoogleUser ? 'Set Password (Optional)' : 'Change Password'}
                            </h3>
                            
                            {isGoogleUser && (
                                <p className="profile-hint-text">
                                    You signed up with Google. You can set a password to login with email in the future.
                                </p>
                            )}
                            
                            {!isGoogleUser && (
                                <div className="profile-form-group">
                                    <label className="profile-label">
                                        <FaLock /> Current Password
                                    </label>
                                    <input
                                        type="password"
                                        name="currentPassword"
                                        value={formData.currentPassword}
                                        onChange={handleChange}
                                        placeholder="Enter your current password"
                                        className="profile-input"
                                    />
                                </div>
                            )}
                            
                            <div className="profile-form-group">
                                <label className="profile-label">
                                    <FaLock /> {isGoogleUser ? 'New Password (Optional)' : 'New Password'}
                                </label>
                                <input
                                    type="password"
                                    name="newPassword"
                                    value={formData.newPassword}
                                    onChange={handleChange}
                                    placeholder={isGoogleUser ? "Enter new password (min 6 characters)" : "Enter new password (min 6 characters)"}
                                    className="profile-input"
                                />
                            </div>
                            
                            <div className="profile-form-group">
                                <label className="profile-label">
                                    <FaLock /> Confirm New Password
                                </label>
                                <input
                                    type="password"
                                    name="confirmPassword"
                                    value={formData.confirmPassword}
                                    onChange={handleChange}
                                    placeholder="Confirm your new password"
                                    className="profile-input"
                                />
                            </div>
                            
                            <div className="profile-button-group">
                                <button type="submit" className="profile-save-btn" disabled={authLoading}>
                                    {authLoading ? 'Saving...' : 'Save Changes'}
                                </button>
                                <button 
                                    type="button" 
                                    onClick={() => {
                                        setIsEditing(false);
                                        setFormData({
                                            name: user.name,
                                            email: user.email,
                                            currentPassword: '',
                                            newPassword: '',
                                            confirmPassword: '',
                                        });
                                    }}
                                    className="profile-cancel-btn"
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    ) : (
                        <div className="profile-info-display">
                            <div className="profile-info-row">
                                <strong>Name:</strong>
                                <span>{user.name}</span>
                            </div>
                            <div className="profile-info-row">
                                <strong>Email:</strong>
                                <span>{user.email}</span>
                            </div>
                            <div className="profile-info-row">
                                <strong>Account Type:</strong>
                                <span>{user.isAdmin ? 'Administrator' : 'Customer'}</span>
                            </div>
                            <div className="profile-info-row">
                                <strong>Login Method:</strong>
                                <span>{isGoogleUser ? 'Google Account' : 'Email & Password'}</span>
                            </div>
                            <div className="profile-info-row">
                                <strong>Member Since:</strong>
                                <span>{formatDate(user.createdAt)}</span>
                            </div>
                            <div className="profile-info-row">
                                <strong>Total Orders:</strong>
                                <span className="profile-order-count">{orderCount}</span>
                            </div>
                            <div className="profile-info-row">
                                <strong>Wishlist Items:</strong>
                                <span className="profile-wishlist-count">{wishlistCount}</span>
                            </div>
                        </div>
                    )}
                </div>
            </div>
            
            {/* Quick Links */}
            <div className="profile-quick-links">
                <h2 className="profile-section-title">Quick Actions</h2>
                <div className="profile-links-grid">
                    <Link to="/orders" className="profile-link-card">
                        <FaShoppingBag size={24} />
                        <span>My Orders</span>
                        <p>{orderCount} order{orderCount !== 1 ? 's' : ''}</p>
                    </Link>
                    <Link to="/wishlist" className="profile-link-card">
                        <FaHeart size={24} />
                        <span>Wishlist</span>
                        <p>{wishlistCount} item{wishlistCount !== 1 ? 's' : ''}</p>
                    </Link>
                    <Link to="/checkout" className="profile-link-card">
                        <FaMapMarkerAlt size={24} />
                        <span>Checkout</span>
                        <p>Complete purchase</p>
                    </Link>
                </div>
            </div>
        </div>
    );
};

// Inject CSS Styles for Profile Page
const styleSheet = document.createElement("style");
styleSheet.textContent = `
    /* Profile Page Styles - Light & Dark Mode Compatible */
    
    @keyframes profileSpin {
        from { transform: rotate(0deg); }
        to { transform: rotate(360deg); }
    }
    
    .profile-center {
        text-align: center;
        padding: 50px;
    }
    
    .profile-spinner {
        animation: profileSpin 1s linear infinite;
        font-size: 2rem;
        color: #6366f1;
        margin-bottom: 1rem;
    }
    
    .profile-spinner-icon {
        animation: profileSpin 1s linear infinite;
    }
    
    .profile-login-btn {
        display: inline-block;
        margin-top: 20px;
        padding: 10px 30px;
        background: linear-gradient(135deg, #4f46e5, #6366f1);
        color: #fff;
        text-decoration: none;
        border-radius: 0.5rem;
    }
    
    .profile-container {
        max-width: 1200px;
        margin: 0 auto;
        padding: 20px;
    }
    
    .profile-title {
        font-size: 2rem;
        margin-bottom: 30px;
        color: var(--text-primary, #333);
    }
    
    .profile-grid {
        display: grid;
        grid-template-columns: 1fr 2fr;
        gap: 30px;
        margin-bottom: 40px;
    }
    
    /* Profile Card */
    .profile-card {
        background-color: var(--card-bg, #fff);
        border-radius: 1rem;
        padding: 30px;
        box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        text-align: center;
        border: 1px solid var(--border-color, #e5e7eb);
    }
    
    .profile-avatar-section {
        margin-bottom: 20px;
    }
    
    .profile-avatar-container {
        position: relative;
        display: inline-block;
        margin-bottom: 15px;
    }
    
    .profile-avatar {
        width: 120px;
        height: 120px;
        border-radius: 50%;
        object-fit: cover;
        border: 4px solid #6366f1;
    }
    
    .profile-camera-icon {
        position: absolute;
        bottom: 5px;
        right: 5px;
        background-color: #6366f1;
        color: #fff;
        border-radius: 50%;
        width: 32px;
        height: 32px;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        transition: all 0.3s;
    }
    
    .profile-camera-icon:hover {
        transform: scale(1.05);
    }
    
    .profile-user-name {
        font-size: 1.25rem;
        margin-bottom: 5px;
        color: var(--text-primary, #333);
    }
    
    .profile-user-email {
        color: var(--text-secondary, #666);
        font-size: 0.875rem;
        margin-bottom: 5px;
    }
    
    .profile-google-badge {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        background-color: #e8eaed;
        color: #5f6368;
        padding: 4px 12px;
        border-radius: 20px;
        font-size: 0.7rem;
        margin-bottom: 10px;
    }
    
    body.dark-mode .profile-google-badge {
        background-color: #1a1a1a;
        color: #a5b4fc;
        border: 1px solid #333333;
    }
    
    .profile-user-since {
        color: var(--text-secondary, #999);
        font-size: 0.75rem;
        margin-bottom: 15px;
    }
    
    .profile-logout-btn {
        background-color: #dc3545;
        color: #fff;
        border: none;
        padding: 8px 16px;
        border-radius: 0.5rem;
        cursor: pointer;
        display: inline-flex;
        align-items: center;
        gap: 8px;
        font-size: 0.875rem;
        transition: all 0.3s;
    }
    
    .profile-logout-btn:hover {
        background-color: #c82333;
        transform: translateY(-2px);
    }
    
    .profile-stats-section {
        display: flex;
        justify-content: space-around;
        padding-top: 20px;
        border-top: 1px solid var(--border-color, #eee);
        margin-top: 20px;
    }
    
    .profile-stat-item {
        display: flex;
        align-items: center;
        gap: 12px;
        text-align: left;
        text-decoration: none;
        cursor: pointer;
        transition: transform 0.3s;
        padding: 10px;
        border-radius: 0.5rem;
        flex: 1;
        justify-content: center;
    }
    
    .profile-stat-item:hover {
        transform: translateY(-2px);
        background-color: var(--bg-secondary, #f8fafc);
    }
    
    .profile-stat-icon-container {
        width: 40px;
        height: 40px;
        background-color: var(--bg-secondary, #f3f4f6);
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
    }
    
    .profile-stat-icon {
        font-size: 20px;
        color: #6366f1;
    }
    
    .profile-stat-number {
        font-size: 1.5rem;
        font-weight: bold;
        color: var(--text-primary, #333);
        margin: 0;
    }
    
    .profile-stat-label {
        font-size: 0.75rem;
        color: var(--text-secondary, #666);
        margin: 0;
    }
    
    /* Edit Card */
    .profile-edit-card {
        background-color: var(--card-bg, #fff);
        border-radius: 1rem;
        padding: 30px;
        box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        border: 1px solid var(--border-color, #e5e7eb);
    }
    
    .profile-card-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 20px;
        padding-bottom: 15px;
        border-bottom: 1px solid var(--border-color, #eee);
    }
    
    .profile-card-header h2 {
        color: var(--text-primary, #333);
        margin: 0;
    }
    
    .profile-edit-btn {
        background: linear-gradient(135deg, #4f46e5, #6366f1);
        color: #fff;
        border: none;
        padding: 8px 16px;
        border-radius: 0.5rem;
        cursor: pointer;
    }
    
    .profile-form {
        display: flex;
        flex-direction: column;
        gap: 15px;
    }
    
    .profile-form-group {
        display: flex;
        flex-direction: column;
        gap: 5px;
    }
    
    .profile-label {
        display: flex;
        align-items: center;
        gap: 8px;
        font-weight: 500;
        color: var(--text-primary, #555);
    }
    
    .profile-input {
        padding: 10px;
        border: 1px solid var(--border-color, #ddd);
        border-radius: 0.5rem;
        font-size: 1rem;
        transition: all 0.3s;
        background-color: var(--input-bg, #fff);
        color: var(--text-primary, #333);
    }
    
    .profile-input:focus {
        outline: none;
        border-color: #6366f1;
        box-shadow: 0 0 0 2px rgba(99, 102, 241, 0.1);
    }
    
    .profile-divider {
        height: 1px;
        background-color: var(--border-color, #eee);
        margin: 10px 0;
    }
    
    .profile-subtitle {
        font-size: 1rem;
        margin-bottom: 10px;
        color: var(--text-primary, #333);
    }
    
    .profile-hint-text {
        font-size: 0.75rem;
        color: var(--text-secondary, #666);
        margin-bottom: 10px;
        font-style: italic;
    }
    
    .profile-button-group {
        display: flex;
        gap: 10px;
        margin-top: 10px;
    }
    
    .profile-save-btn {
        flex: 1;
        padding: 10px;
        background: linear-gradient(135deg, #059669, #10b981);
        color: #fff;
        border: none;
        border-radius: 0.5rem;
        cursor: pointer;
    }
    
    .profile-cancel-btn {
        flex: 1;
        padding: 10px;
        background-color: #6c757d;
        color: #fff;
        border: none;
        border-radius: 0.5rem;
        cursor: pointer;
    }
    
    .profile-info-display {
        display: flex;
        flex-direction: column;
        gap: 15px;
    }
    
    .profile-info-row {
        display: flex;
        justify-content: space-between;
        padding: 10px 0;
        border-bottom: 1px solid var(--border-color, #f0f0f0);
        color: var(--text-primary, #333);
    }
    
    .profile-order-count {
        font-weight: bold;
        color: #10b981;
    }
    
    .profile-wishlist-count {
        font-weight: bold;
        color: #ef4444;
    }
    
    /* Quick Links */
    .profile-quick-links {
        margin-top: 40px;
    }
    
    .profile-section-title {
        font-size: 1.25rem;
        margin-bottom: 20px;
        color: var(--text-primary, #333);
    }
    
    .profile-links-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
        gap: 20px;
    }
    
    .profile-link-card {
        background-color: var(--card-bg, #fff);
        padding: 20px;
        border-radius: 1rem;
        text-decoration: none;
        text-align: center;
        transition: all 0.3s;
        box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        border: 1px solid var(--border-color, #e5e7eb);
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 8px;
    }
    
    .profile-link-card:hover {
        transform: translateY(-4px);
        box-shadow: 0 8px 25px rgba(0,0,0,0.1);
    }
    
    .profile-link-card span {
        color: var(--text-primary, #333);
        font-weight: 500;
    }
    
    .profile-link-card p {
        color: var(--text-secondary, #666);
        font-size: 0.75rem;
        margin: 0;
    }
    
    .profile-link-card svg {
        color: #6366f1;
    }
    
    /* Dark Mode Specific Overrides */
    body.dark-mode .profile-stat-icon-container {
        background-color: #1a1a1a;
    }
    
    body.dark-mode .profile-stat-item:hover {
        background-color: #1a1a1a;
    }
    
    body.dark-mode .profile-link-card p {
        color: #aaaaaa;
    }
    
    /* Responsive */
    @media (max-width: 768px) {
        .profile-grid {
            grid-template-columns: 1fr;
            gap: 20px;
        }
        
        .profile-title {
            font-size: 1.5rem;
        }
        
        .profile-links-grid {
            grid-template-columns: 1fr;
        }
    }
`;
document.head.appendChild(styleSheet);

export default ProfilePage;