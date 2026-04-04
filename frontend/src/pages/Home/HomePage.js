import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { fetchProducts } from '../../redux/slices/productSlice';
import ProductCard from '../../components/Products/ProductCard';

const HomePage = () => {
    const dispatch = useDispatch();
    const { products, loading } = useSelector((state) => state.products);
    const featuredProducts = products.filter(p => p.isFeatured).slice(0, 4);

    useEffect(() => {
        dispatch(fetchProducts());
    }, [dispatch]);

    if (loading) {
        return (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '400px', gap: '1rem' }}>
                <div className="spinner"></div>
                <p>Loading amazing products...</p>
            </div>
        );
    }

    return (
        <div>
            {/* Full Width Hero Section */}
            <div className="home-hero-fullwidth">
                <div className="home-hero-fullwidth-overlay"></div>
                <div className="home-hero-fullwidth-content">
                    <h1 className="home-hero-fullwidth-title">Welcome to E-Shop</h1>
                    <p className="home-hero-fullwidth-subtitle">Discover amazing products at unbeatable prices</p>
                    <Link to="/products" className="home-hero-fullwidth-btn">
                        Shop Now →
                    </Link>
                </div>
            </div>

            {/* Features Section */}
            <div className="features">
                <div className="container">
                    <div className="features-grid">
                        <div className="feature-card">
                            <div className="feature-icon">🚚</div>
                            <h3 className="feature-title">Free Shipping</h3>
                            <p className="feature-desc">On orders over $50</p>
                        </div>
                        <div className="feature-card">
                            <div className="feature-icon">⚡</div>
                            <h3 className="feature-title">Fast Delivery</h3>
                            <p className="feature-desc">Within 3-5 days</p>
                        </div>
                        <div className="feature-card">
                            <div className="feature-icon">🔒</div>
                            <h3 className="feature-title">Secure Payment</h3>
                            <p className="feature-desc">100% secure transactions</p>
                        </div>
                        <div className="feature-card">
                            <div className="feature-icon">💬</div>
                            <h3 className="feature-title">24/7 Support</h3>
                            <p className="feature-desc">Dedicated customer service</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Featured Products */}
            {featuredProducts.length > 0 && (
                <div className="section">
                    <div className="container">
                        <h2 className="section-title">Featured Products</h2>
                        <p className="section-subtitle">Our handpicked selection just for you</p>
                        <div className="products-grid">
                            {featuredProducts.map(product => (
                                <ProductCard key={product._id} product={product} />
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* All Products */}
            <div className="section">
                <div className="container">
                    <h2 className="section-title">All Products</h2>
                    <p className="section-subtitle">Browse our complete collection</p>
                    <div className="products-grid">
                        {products.map(product => (
                            <ProductCard key={product._id} product={product} />
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

// Inject CSS Styles for Full Width Hero
const styleSheet = document.createElement("style");
styleSheet.textContent = `
    /* FULL WIDTH HERO SECTION - NO WHITE SPACE */
    .home-hero-fullwidth {
        position: relative;
        width: 100%;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        min-height: 500px;
        display: flex;
        align-items: center;
        justify-content: center;
        text-align: center;
        overflow: hidden;
        margin: 0;
        padding: 0;
    }
    
    .home-hero-fullwidth-overlay {
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: radial-gradient(circle at center, rgba(0,0,0,0.2) 0%, rgba(0,0,0,0.3) 100%);
        pointer-events: none;
    }
    
    .home-hero-fullwidth-content {
        position: relative;
        z-index: 1;
        color: white;
        padding: 2rem;
        max-width: 1200px;
        width: 100%;
        margin: 0 auto;
    }
    
    .home-hero-fullwidth-title {
        font-size: 3.5rem;
        font-weight: bold;
        margin-bottom: 1rem;
        animation: fadeIn 0.6s ease-out;
    }
    
    .home-hero-fullwidth-subtitle {
        font-size: 1.2rem;
        margin-bottom: 2rem;
        opacity: 0.9;
    }
    
    .home-hero-fullwidth-btn {
        display: inline-block;
        padding: 1rem 2rem;
        background: white;
        color: #667eea;
        text-decoration: none;
        border-radius: 50px;
        font-weight: bold;
        font-size: 1rem;
        transition: all 0.3s ease;
        box-shadow: 0 4px 15px rgba(0,0,0,0.2);
    }
    
    .home-hero-fullwidth-btn:hover {
        transform: translateY(-2px);
        box-shadow: 0 6px 20px rgba(0,0,0,0.3);
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
    
    /* Responsive Styles */
    @media (max-width: 768px) {
        .home-hero-fullwidth {
            min-height: 400px;
        }
        
        .home-hero-fullwidth-title {
            font-size: 2rem;
        }
        
        .home-hero-fullwidth-subtitle {
            font-size: 1rem;
        }
        
        .home-hero-fullwidth-btn {
            padding: 0.8rem 1.5rem;
            font-size: 0.9rem;
        }
    }
    
    @media (max-width: 480px) {
        .home-hero-fullwidth {
            min-height: 350px;
        }
        
        .home-hero-fullwidth-title {
            font-size: 1.5rem;
        }
        
        .home-hero-fullwidth-subtitle {
            font-size: 0.85rem;
        }
        
        .home-hero-fullwidth-btn {
            padding: 0.6rem 1.2rem;
            font-size: 0.8rem;
        }
    }
`;
document.head.appendChild(styleSheet);

export default HomePage;