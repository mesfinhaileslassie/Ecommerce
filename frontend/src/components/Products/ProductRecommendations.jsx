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
            <div className="recommendations-loading-container">
                <FaSpinner className="recommendations-spinner" />
                <p>Loading recommendations...</p>
            </div>
        );
    }

    if (!products || products.length === 0) {
        return null;
    }

    return (
        <div className="recommendations-container">
            <div className="recommendations-header">
                {getIcon()}
                <h2 className="recommendations-title">{title}</h2>
            </div>
            <div className="recommendations-grid">
                {products.map(product => (
                    <ProductCard key={product._id} product={product} />
                ))}
            </div>
        </div>
    );
};

// Inject CSS Styles for ProductRecommendations
const styleSheet = document.createElement("style");
styleSheet.textContent = `
    @keyframes recommendationsSpin {
        from { transform: rotate(0deg); }
        to { transform: rotate(360deg); }
    }
    
    .recommendations-loading-container {
        text-align: center;
        padding: 40px;
        background-color: var(--card-bg, transparent);
        border-radius: 1rem;
    }
    
    .recommendations-loading-container p {
        color: var(--text-secondary, #666);
    }
    
    .recommendations-spinner {
        animation: recommendationsSpin 1s linear infinite;
        font-size: 2rem;
        color: #6366f1;
        margin-bottom: 10px;
    }
    
    .recommendations-container {
        margin-top: 50px;
        padding: 30px 0;
        border-top: 1px solid var(--border-color, #e5e7eb);
        background-color: var(--bg-secondary, #f9fafb);
        border-radius: 1rem;
    }
    
    body.dark-mode .recommendations-container {
        background-color: #0a0a0a;
        border-top-color: #333333;
    }
    
    .recommendations-header {
        display: flex;
        align-items: center;
        margin-bottom: 25px;
        padding: 0 20px;
    }
    
    .recommendations-title {
        font-size: 1.5rem;
        font-weight: bold;
        color: var(--text-primary, #1f2937);
        margin: 0;
    }
    
    body.dark-mode .recommendations-title {
        color: #ffffff;
    }
    
    .recommendations-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
        gap: 25px;
        padding: 0 20px;
    }
    
    /* Responsive */
    @media (max-width: 768px) {
        .recommendations-container {
            margin-top: 30px;
            padding: 20px 0;
        }
        
        .recommendations-title {
            font-size: 1.2rem;
        }
        
        .recommendations-grid {
            gap: 15px;
            padding: 0 15px;
        }
    }
    
    @media (max-width: 480px) {
        .recommendations-container {
            margin-top: 20px;
            padding: 15px 0;
        }
        
        .recommendations-title {
            font-size: 1rem;
        }
        
        .recommendations-header {
            padding: 0 15px;
            margin-bottom: 15px;
        }
        
        .recommendations-grid {
            gap: 12px;
            padding: 0 12px;
            grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
        }
    }
`;
document.head.appendChild(styleSheet);

export default ProductRecommendations;