import React from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';

const ProfilePage = () => {
    const { user } = useSelector((state) => state.auth);

    if (!user) {
        return (
            <div style={styles.center}>
                <h2>Please login to view your profile</h2>
                <Link to="/login" style={styles.loginBtn}>Login</Link>
            </div>
        );
    }

    return (
        <div style={styles.container}>
            <h1 style={styles.title}>My Profile</h1>
            
            <div style={styles.profileCard}>
                <div style={styles.profileInfo}>
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
                        <strong>Member Since:</strong>
                        <span>{new Date(user.createdAt).toLocaleDateString()}</span>
                    </div>
                </div>
                
                <div style={styles.actions}>
                    <Link to="/orders" style={styles.ordersBtn}>
                        View My Orders
                    </Link>
                </div>
            </div>
        </div>
    );
};

const styles = {
    container: {
        maxWidth: '800px',
        margin: '0 auto',
        padding: '20px',
    },
    title: {
        marginBottom: '30px',
    },
    profileCard: {
        backgroundColor: '#fff',
        borderRadius: '8px',
        padding: '30px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    },
    profileInfo: {
        marginBottom: '30px',
    },
    infoRow: {
        display: 'flex',
        justifyContent: 'space-between',
        padding: '12px 0',
        borderBottom: '1px solid #eee',
    },
    actions: {
        textAlign: 'center',
    },
    ordersBtn: {
        display: 'inline-block',
        padding: '10px 30px',
        backgroundColor: '#007bff',
        color: '#fff',
        textDecoration: 'none',
        borderRadius: '5px',
    },
    center: {
        textAlign: 'center',
        padding: '50px',
    },
    loginBtn: {
        display: 'inline-block',
        marginTop: '20px',
        padding: '10px 30px',
        backgroundColor: '#007bff',
        color: '#fff',
        textDecoration: 'none',
        borderRadius: '5px',
    },
};

export default ProfilePage;