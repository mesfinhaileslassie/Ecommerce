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
            <div style={styles.center}>
                <h2>Please login to view your profile</h2>
                <Link to="/login" style={styles.loginBtn}>Login</Link>
            </div>
        );
    }

    if (ordersLoading || wishlistLoading) {
        return (
            <div style={styles.center}>
                <FaSpinner style={styles.spinner} />
                <p>Loading your profile...</p>
            </div>
        );
    }

    return (
        <div style={styles.container}>
            <h1 style={styles.title}>My Profile</h1>
            
            <div style={styles.profileGrid}>
                {/* Profile Card */}
                <div style={styles.profileCard}>
                    <div style={styles.avatarSection}>
                        <div style={styles.avatarContainer}>
                            <img 
                                src={getAvatarUrl()} 
                                alt={user.name}
                                style={styles.avatar}
                            />
                            <label htmlFor="avatar-upload" style={styles.cameraIcon}>
                                {uploadingAvatar ? <FaSpinner style={styles.spinnerIcon} /> : <FaCamera />}
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
                        <h2 style={styles.userName}>{user.name}</h2>
                        <p style={styles.userEmail}>{user.email}</p>
                        {isGoogleUser && (
                            <p style={styles.googleBadge}>
                                <FaGoogle /> Signed in with Google
                            </p>
                        )}
                        <p style={styles.userSince}>
                            Member since {formatDate(user.createdAt)}
                        </p>
                        <button onClick={handleLogout} style={styles.logoutBtn}>
                            <FaSignOutAlt /> Logout
                        </button>
                    </div>
                    
                    <div style={styles.statsSection}>
                        <Link to="/orders" style={styles.statItem}>
                            <div style={styles.statIconContainer}>
                                <FaShoppingBag style={styles.statIcon} />
                            </div>
                            <div>
                                <h3 style={styles.statNumber}>{orderCount}</h3>
                                <p style={styles.statLabel}>Orders</p>
                            </div>
                        </Link>
                        <Link to="/wishlist" style={styles.statItem}>
                            <div style={styles.statIconContainer}>
                                <FaHeart style={styles.statIcon} />
                            </div>
                            <div>
                                <h3 style={styles.statNumber}>{wishlistCount}</h3>
                                <p style={styles.statLabel}>Wishlist</p>
                            </div>
                        </Link>
                    </div>
                </div>
                
                {/* Edit Profile Form */}
                <div style={styles.editCard}>
                    <div style={styles.cardHeader}>
                        <h2>Account Information</h2>
                        {!isEditing && (
                            <button onClick={() => setIsEditing(true)} style={styles.editBtn}>
                                Edit Profile
                            </button>
                        )}
                    </div>
                    
                    {isEditing ? (
                        <form onSubmit={handleSubmit} style={styles.form}>
                            <div style={styles.formGroup}>
                                <label style={styles.label}>
                                    <FaUser /> Full Name
                                </label>
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    required
                                    style={styles.input}
                                    placeholder="Enter your full name"
                                />
                            </div>
                            
                            <div style={styles.formGroup}>
                                <label style={styles.label}>
                                    <FaEnvelope /> Email Address
                                </label>
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    required
                                    style={styles.input}
                                    placeholder="Enter your email"
                                />
                            </div>
                            
                            <div style={styles.divider} />
                            
                            <h3 style={styles.subtitle}>
                                {isGoogleUser ? 'Set Password (Optional)' : 'Change Password'}
                            </h3>
                            
                            {isGoogleUser && (
                                <p style={styles.hintText}>
                                    You signed up with Google. You can set a password to login with email in the future.
                                </p>
                            )}
                            
                            {!isGoogleUser && (
                                <div style={styles.formGroup}>
                                    <label style={styles.label}>
                                        <FaLock /> Current Password
                                    </label>
                                    <input
                                        type="password"
                                        name="currentPassword"
                                        value={formData.currentPassword}
                                        onChange={handleChange}
                                        placeholder="Enter your current password"
                                        style={styles.input}
                                    />
                                </div>
                            )}
                            
                            <div style={styles.formGroup}>
                                <label style={styles.label}>
                                    <FaLock /> {isGoogleUser ? 'New Password (Optional)' : 'New Password'}
                                </label>
                                <input
                                    type="password"
                                    name="newPassword"
                                    value={formData.newPassword}
                                    onChange={handleChange}
                                    placeholder={isGoogleUser ? "Enter new password (min 6 characters)" : "Enter new password (min 6 characters)"}
                                    style={styles.input}
                                />
                            </div>
                            
                            <div style={styles.formGroup}>
                                <label style={styles.label}>
                                    <FaLock /> Confirm New Password
                                </label>
                                <input
                                    type="password"
                                    name="confirmPassword"
                                    value={formData.confirmPassword}
                                    onChange={handleChange}
                                    placeholder="Confirm your new password"
                                    style={styles.input}
                                />
                            </div>
                            
                            <div style={styles.buttonGroup}>
                                <button type="submit" style={styles.saveBtn} disabled={authLoading}>
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
                                    style={styles.cancelBtn}
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    ) : (
                        <div style={styles.infoDisplay}>
                            <div style={styles.infoRow}>
                                <strong>Name:</strong>
                                <span>{user.name}</span>
                            </div>
                            <div style={styles.infoRow}>
                                <strong>Email:</strong>
                                <span>{user.email}</span>
                            </div>
                            <div style={styles.infoRow}>
                                <strong>Account Type:</strong>
                                <span>{user.isAdmin ? 'Administrator' : 'Customer'}</span>
                            </div>
                            <div style={styles.infoRow}>
                                <strong>Login Method:</strong>
                                <span>{isGoogleUser ? 'Google Account' : 'Email & Password'}</span>
                            </div>
                            <div style={styles.infoRow}>
                                <strong>Member Since:</strong>
                                <span>{formatDate(user.createdAt)}</span>
                            </div>
                            <div style={styles.infoRow}>
                                <strong>Total Orders:</strong>
                                <span style={styles.orderCount}>{orderCount}</span>
                            </div>
                            <div style={styles.infoRow}>
                                <strong>Wishlist Items:</strong>
                                <span style={styles.wishlistCount}>{wishlistCount}</span>
                            </div>
                        </div>
                    )}
                </div>
            </div>
            
            {/* Quick Links */}
            <div style={styles.quickLinks}>
                <h2 style={styles.sectionTitle}>Quick Actions</h2>
                <div style={styles.linksGrid}>
                    <Link to="/orders" style={styles.linkCard}>
                        <FaShoppingBag size={24} />
                        <span>My Orders</span>
                        <p>{orderCount} order{orderCount !== 1 ? 's' : ''}</p>
                    </Link>
                    <Link to="/wishlist" style={styles.linkCard}>
                        <FaHeart size={24} />
                        <span>Wishlist</span>
                        <p>{wishlistCount} item{wishlistCount !== 1 ? 's' : ''}</p>
                    </Link>
                    <Link to="/checkout" style={styles.linkCard}>
                        <FaMapMarkerAlt size={24} />
                        <span>Checkout</span>
                        <p>Complete purchase</p>
                    </Link>
                </div>
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
        fontSize: '2rem',
        marginBottom: '30px',
        color: '#333',
    },
    profileGrid: {
        display: 'grid',
        gridTemplateColumns: '1fr 2fr',
        gap: '30px',
        marginBottom: '40px',
    },
    profileCard: {
        backgroundColor: '#fff',
        borderRadius: '1rem',
        padding: '30px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        textAlign: 'center',
    },
    avatarSection: {
        marginBottom: '20px',
    },
    avatarContainer: {
        position: 'relative',
        display: 'inline-block',
        marginBottom: '15px',
    },
    avatar: {
        width: '120px',
        height: '120px',
        borderRadius: '50%',
        objectFit: 'cover',
        border: '4px solid #6366f1',
    },
    cameraIcon: {
        position: 'absolute',
        bottom: '5px',
        right: '5px',
        backgroundColor: '#6366f1',
        color: '#fff',
        borderRadius: '50%',
        width: '32px',
        height: '32px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        transition: 'all 0.3s',
    },
    spinnerIcon: {
        animation: 'spin 1s linear infinite',
    },
    userName: {
        fontSize: '1.25rem',
        marginBottom: '5px',
        color: '#333',
    },
    userEmail: {
        color: '#666',
        fontSize: '0.875rem',
        marginBottom: '5px',
    },
    googleBadge: {
        display: 'inline-flex',
        alignItems: 'center',
        gap: '6px',
        backgroundColor: '#e8eaed',
        color: '#5f6368',
        padding: '4px 12px',
        borderRadius: '20px',
        fontSize: '0.7rem',
        marginBottom: '10px',
    },
    userSince: {
        color: '#999',
        fontSize: '0.75rem',
        marginBottom: '15px',
    },
    logoutBtn: {
        backgroundColor: '#dc3545',
        color: '#fff',
        border: 'none',
        padding: '8px 16px',
        borderRadius: '0.5rem',
        cursor: 'pointer',
        display: 'inline-flex',
        alignItems: 'center',
        gap: '8px',
        fontSize: '0.875rem',
        transition: 'all 0.3s',
    },
    statsSection: {
        display: 'flex',
        justifyContent: 'space-around',
        paddingTop: '20px',
        borderTop: '1px solid #eee',
        marginTop: '20px',
    },
    statItem: {
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        textAlign: 'left',
        textDecoration: 'none',
        color: 'inherit',
        cursor: 'pointer',
        transition: 'transform 0.3s',
        padding: '10px',
        borderRadius: '0.5rem',
    },
    statIconContainer: {
        width: '40px',
        height: '40px',
        backgroundColor: '#f3f4f6',
        borderRadius: '50%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
    },
    statIcon: {
        fontSize: '20px',
        color: '#6366f1',
    },
    statNumber: {
        fontSize: '1.5rem',
        fontWeight: 'bold',
        color: '#333',
        margin: 0,
    },
    statLabel: {
        fontSize: '0.75rem',
        color: '#666',
        margin: 0,
    },
    editCard: {
        backgroundColor: '#fff',
        borderRadius: '1rem',
        padding: '30px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    },
    cardHeader: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '20px',
        paddingBottom: '15px',
        borderBottom: '1px solid #eee',
    },
    editBtn: {
        backgroundColor: '#6366f1',
        color: '#fff',
        border: 'none',
        padding: '8px 16px',
        borderRadius: '0.5rem',
        cursor: 'pointer',
    },
    form: {
        display: 'flex',
        flexDirection: 'column',
        gap: '15px',
    },
    formGroup: {
        display: 'flex',
        flexDirection: 'column',
        gap: '5px',
    },
    label: {
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        fontWeight: '500',
        color: '#555',
    },
    input: {
        padding: '10px',
        border: '1px solid #ddd',
        borderRadius: '0.5rem',
        fontSize: '1rem',
        transition: 'all 0.3s',
    },
    divider: {
        height: '1px',
        backgroundColor: '#eee',
        margin: '10px 0',
    },
    subtitle: {
        fontSize: '1rem',
        marginBottom: '10px',
        color: '#333',
    },
    hintText: {
        fontSize: '0.75rem',
        color: '#666',
        marginBottom: '10px',
        fontStyle: 'italic',
    },
    buttonGroup: {
        display: 'flex',
        gap: '10px',
        marginTop: '10px',
    },
    saveBtn: {
        flex: 1,
        padding: '10px',
        backgroundColor: '#28a745',
        color: '#fff',
        border: 'none',
        borderRadius: '0.5rem',
        cursor: 'pointer',
    },
    cancelBtn: {
        flex: 1,
        padding: '10px',
        backgroundColor: '#6c757d',
        color: '#fff',
        border: 'none',
        borderRadius: '0.5rem',
        cursor: 'pointer',
    },
    infoDisplay: {
        display: 'flex',
        flexDirection: 'column',
        gap: '15px',
    },
    infoRow: {
        display: 'flex',
        justifyContent: 'space-between',
        padding: '10px 0',
        borderBottom: '1px solid #f0f0f0',
    },
    orderCount: {
        fontWeight: 'bold',
        color: '#28a745',
    },
    wishlistCount: {
        fontWeight: 'bold',
        color: '#ef4444',
    },
    quickLinks: {
        marginTop: '40px',
    },
    sectionTitle: {
        fontSize: '1.25rem',
        marginBottom: '20px',
        color: '#333',
    },
    linksGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '20px',
    },
    linkCard: {
        backgroundColor: '#fff',
        padding: '20px',
        borderRadius: '1rem',
        textDecoration: 'none',
        textAlign: 'center',
        transition: 'all 0.3s',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        color: '#333',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '8px',
    },
    center: {
        textAlign: 'center',
        padding: '50px',
    },
    loginBtn: {
        display: 'inline-block',
        marginTop: '20px',
        padding: '10px 30px',
        backgroundColor: '#6366f1',
        color: '#fff',
        textDecoration: 'none',
        borderRadius: '0.5rem',
    },
    spinner: {
        animation: 'spin 1s linear infinite',
        fontSize: '2rem',
        color: '#6366f1',
        marginBottom: '1rem',
    },
};

// Add keyframes for spinner animation
const styleSheet = document.createElement("style");
styleSheet.textContent = `
    @keyframes spin {
        from {
            transform: rotate(0deg);
        }
        to {
            transform: rotate(360deg);
        }
    }
    
    input:focus {
        outline: none;
        border-color: #6366f1;
        box-shadow: 0 0 0 2px rgba(99, 102, 241, 0.1);
    }
    
    .stat-item:hover {
        transform: translateY(-2px);
        background-color: #f8fafc;
    }
    
    .link-card:hover {
        transform: translateY(-4px);
        box-shadow: 0 8px 25px rgba(0,0,0,0.1);
    }
`;
document.head.appendChild(styleSheet);



export default ProfilePage;