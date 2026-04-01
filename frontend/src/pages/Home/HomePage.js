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
            {/* Hero Section */}
            <div className="hero">
                <div className="hero-overlay"></div>
                <div className="hero-content">
                    <h1 className="hero-title">Welcome to E-Shop</h1>
                    <p className="hero-subtitle">Discover amazing products at unbeatable prices</p>
                    <Link to="/products" className="hero-btn">
                        Shop Now →
                    </Link>
                </div>
            </div>

            {/* Features */}
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

export default HomePage;