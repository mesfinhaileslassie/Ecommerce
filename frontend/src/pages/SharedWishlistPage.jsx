import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FaHeart, FaShoppingCart } from 'react-icons/fa';
import api from '../services/api';

const SharedWishlistPage = () => {
    const location = useLocation();
    const [wishlistData, setWishlistData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const encodedData = params.get('data');
        
        if (encodedData) {
            try {
                const decodedData = JSON.parse(atob(encodedData));
                setWishlistData(decodedData);
            } catch (error) {
                console.error('Failed to parse wishlist data:', error);
            }
        }
        setLoading(false);
    }, [location]);

    if (loading) {
        return <div style={styles.center}>Loading...</div>;
    }

    if (!wishlistData) {
        return (
            <div style={styles.center}>
                <h2>No wishlist data found</h2>
                <Link to="/" style={styles.btn}>Go to Homepage</Link>
            </div>
        );
    }

    return (
        <div style={styles.container}>
            <div style={styles.header}>
                <FaHeart size={40} color="#ef4444" />
                <h1 style={styles.title}>{wishlistData.user || 'Someone'}'s Wishlist</h1>
                <p style={styles.subtitle}>{wishlistData.totalItems} items saved</p>
            </div>

            <div style={styles.wishlistGrid}>
                {wishlistData.items.map((item, index) => (
                    <div key={index} style={styles.wishlistCard}>
                        <h3 style={styles.productName}>{item.name}</h3>
                        <p style={styles.productCategory}>{item.category}</p>
                        <p style={styles.productPrice}>${item.price}</p>
                    </div>
                ))}
            </div>

            <div style={styles.footer}>
                <p>Inspired by this wishlist? </p>
                <Link to="/products" style={styles.shopBtn}>
                    <FaShoppingCart /> Start Shopping
                </Link>
            </div>
        </div>
    );
};

const styles = {
    container: {
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '40px 20px',
    },
    header: {
        textAlign: 'center',
        marginBottom: '40px',
    },
    title: {
        fontSize: '2rem',
        color: '#333',
        marginTop: '15px',
    },
    subtitle: {
        color: '#666',
        marginTop: '5px',
    },
    wishlistGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
        gap: '20px',
    },
    wishlistCard: {
        backgroundColor: '#fff',
        padding: '20px',
        borderRadius: '8px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    },
    productName: {
        fontSize: '1.1rem',
        fontWeight: 'bold',
        marginBottom: '8px',
    },
    productCategory: {
        fontSize: '0.85rem',
        color: '#666',
        marginBottom: '8px',
    },
    productPrice: {
        fontSize: '1.2rem',
        fontWeight: 'bold',
        color: '#6366f1',
    },
    footer: {
        textAlign: 'center',
        marginTop: '40px',
        paddingTop: '20px',
        borderTop: '1px solid #eee',
    },
    shopBtn: {
        display: 'inline-flex',
        alignItems: 'center',
        gap: '8px',
        marginTop: '15px',
        padding: '12px 24px',
        backgroundColor: '#6366f1',
        color: '#fff',
        textDecoration: 'none',
        borderRadius: '8px',
    },
    center: {
        textAlign: 'center',
        padding: '50px',
    },
    btn: {
        display: 'inline-block',
        marginTop: '20px',
        padding: '10px 24px',
        backgroundColor: '#6366f1',
        color: '#fff',
        textDecoration: 'none',
        borderRadius: '8px',
    },
};

export default SharedWishlistPage;