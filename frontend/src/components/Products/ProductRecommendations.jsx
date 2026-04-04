import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import ProductCard from './ProductCard';
import api from '../../services/api';
import { FaSpinner } from 'react-icons/fa';

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
            
            switch(type) {
                case 'similar':
                    response = await api.get(`/products/similar/${productId}`);
                    break;
                case 'bought-together':
                    if (user) {
                        response = await api.get(`/products/bought-together/${productId}`);
                    } else {
                        response = await api.get(`/products/similar/${productId}`);
                    }
                    break;
                case 'top-rated':
                    response = await api.get('/products/top-rated');
                    break;
                case 'best-sellers':
                    response = await api.get('/products/best-sellers');
                    break;
                case 'recently-viewed':
                    if (user) {
                        response = await api.get('/products/recently-viewed');
                    } else {
                        setProducts([]);
                        setLoading(false);
                        return;
                    }
                    break;
                default:
                    return;
            }
            
            if (response.data.success) {
                setProducts(response.data.products.slice(0, limit));
            }
        } catch (error) {
            console.error(`Failed to fetch ${type} recommendations:`, error);
        } finally {
            setLoading(false);
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

    if (products.length === 0) {
        return null;
    }

    return (
        <div style={styles.container}>
            <h2 style={styles.title}>{title}</h2>
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
        marginTop: '40px',
        padding: '20px 0',
        borderTop: '1px solid #eee',
    },
    title: {
        fontSize: '1.5rem',
        marginBottom: '20px',
        color: '#333',
    },
    grid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
        gap: '20px',
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