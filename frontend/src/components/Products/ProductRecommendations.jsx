import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import ProductCard from './ProductCard';
import api from '../../services/api';
import { FaSpinner, FaStar, FaFire, FaHistory, FaThumbsUp } from 'react-icons/fa';

const ProductRecommendations = ({ type, productId, title, limit = 4 }) => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const { user } = useSelector((state) => state.auth);

    useEffect(() => {
        fetchRecommendations();
    }, [type, productId]);

    const fetchRecommendations = async () => {
        setLoading(true);
        try {
            let response;
            let url = '';
            
            switch(type) {
                case 'similar':
                    url = `/products/similar/${productId}`;
                    response = await api.get(url);
                    break;
                case 'bought-together':
                    if (user) {
                        url = `/products/bought-together/${productId}`;
                        response = await api.get(url);
                    } else {
                        url = `/products/similar/${productId}`;
                        response = await api.get(url);
                    }
                    break;
                case 'top-rated':
                    url = '/products/top-rated';
                    response = await api.get(url);
                    break;
                case 'best-sellers':
                    url = '/products/best-sellers';
                    response = await api.get(url);
                    break;
                case 'recently-viewed':
                    if (user) {
                        url = '/products/recently-viewed';
                        response = await api.get(url);
                    } else {
                        setProducts([]);
                        setLoading(false);
                        return;
                    }
                    break;
                default:
                    setLoading(false);
                    return;
            }
            
            if (response && response.data && response.data.success && response.data.products) {
                setProducts(response.data.products.slice(0, limit));
            } else {
                setProducts([]);
            }
        } catch (error) {
            console.error(`Failed to fetch ${type} recommendations:`, error);
            setProducts([]);
        } finally {
            setLoading(false);
        }
    };

    const getIcon = () => {
        switch(type) {
            case 'similar':
                return <FaThumbsUp style={{ marginRight: '10px', color: '#6366f1' }} />;
            case 'best-sellers':
                return <FaFire style={{ marginRight: '10px', color: '#f59e0b' }} />;
            case 'top-rated':
                return <FaStar style={{ marginRight: '10px', color: '#fbbf24' }} />;
            case 'recently-viewed':
                return <FaHistory style={{ marginRight: '10px', color: '#10b981' }} />;
            default:
                return null;
        }
    };

    if (loading) {
        return (
            <div style={styles.loadingContainer}>
                <FaSpinner style={styles.spinner} />
                <p>Loading recommendations...</p>
            </div>
        );
    }

    if (!products || products.length === 0) {
        return null;
    }

    return (
        <div style={styles.container}>
            <div style={styles.header}>
                {getIcon()}
                <h2 style={styles.title}>{title}</h2>
            </div>
            <div style={styles.grid}>
                {products.map(product => (
                    <ProductCard key={product._id} product={product} />
                ))}
            </div>
        </div>
    );
};

const styles = {
    container: {
        marginTop: '50px',
        padding: '30px 0',
        borderTop: '1px solid #e5e7eb',
        backgroundColor: '#f9fafb',
        borderRadius: '1rem',
    },
    header: {
        display: 'flex',
        alignItems: 'center',
        marginBottom: '25px',
        padding: '0 20px',
    },
    title: {
        fontSize: '1.5rem',
        fontWeight: 'bold',
        color: '#1f2937',
        margin: 0,
    },
    grid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
        gap: '25px',
        padding: '0 20px',
    },
    loadingContainer: {
        textAlign: 'center',
        padding: '40px',
    },
    spinner: {
        animation: 'spin 1s linear infinite',
        fontSize: '2rem',
        color: '#6366f1',
        marginBottom: '10px',
    },
};

export default ProductRecommendations;