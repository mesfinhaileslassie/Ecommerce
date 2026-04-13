import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { fetchProducts } from '../../redux/slices/productSlice';
import ProductCard from '../../components/Products/ProductCard';
import ProductRecommendations from '../../components/Products/ProductRecommendations';
import HelmetSEO from '../../components/SEO/HelmetSEO';
import { FaArrowRight } from 'react-icons/fa';

const HomePage = () => {
    const dispatch = useDispatch();
    const { products, loading } = useSelector((state) => state.products);
    const { user } = useSelector((state) => state.auth);
    
    // Get different product categories
    const featuredProducts = products.filter(p => p.isFeatured).slice(0, 4);
    const electronicsProducts = products.filter(p => p.category === 'Electronics').slice(0, 4);
    const clothingProducts = products.filter(p => p.category === 'Clothing').slice(0, 4);
    const homeProducts = products.filter(p => p.category === 'Home').slice(0, 4);
    const booksProducts = products.filter(p => p.category === 'Books').slice(0, 4);
    const sportsProducts = products.filter(p => p.category === 'Sports').slice(0, 4);

    useEffect(() => {
        dispatch(fetchProducts());
    }, [dispatch]);

    if (loading) {
        return (
            <div className="home-loading-container">
                <div className="spinner"></div>
                <p>Loading amazing products...</p>
            </div>
        );
    }

    // Section Component for reusability
    const ProductSection = ({ title, products, viewAllLink, isAlt = false }) => {
        if (products.length === 0) return null;
        
        return (
            <div className={`home-section ${isAlt ? 'home-section-alt' : ''}`}>
                <div className="container">
                    <div className="home-section-header">
                        <div>
                            <h2 className="home-section-title">{title}</h2>
                            <p className="home-section-subtitle">Discover our best selection</p>
                        </div>
                        {viewAllLink && (
                            <Link to={viewAllLink} className="home-view-all-btn">
                                View More <FaArrowRight style={{ marginLeft: '5px' }} />
                            </Link>
                        )}
                    </div>
                    <div className="products-grid">
                        {products.map(product => (
                            <ProductCard key={product._id} product={product} />
                        ))}
                    </div>
                </div>
            </div>
        );
    };

    return (
        <>
            <HelmetSEO 
                title="Habesha Gebeya - Best Online Shopping Store in Ethiopia"
                description="Shop the latest electronics, fashion, books, home goods and more at Habesha Gebeya. ✓ Free shipping on orders over $50 ✓ Secure payment ✓ Best prices ✓ Fast delivery in Ethiopia"
                keywords="online shopping Ethiopia, buy online, electronics, clothing, books, home goods, best deals, Ethiopian e-commerce"
                type="website"
            />
            
            <div>
                {/* Full Width Hero Section */}
                <div className="home-hero-fullwidth">
                    <div className="home-hero-fullwidth-overlay"></div>
                    <div className="home-hero-fullwidth-content">
                        <h1 className="home-hero-fullwidth-title">Welcome to Habesha Gebeya</h1>
                        <p className="home-hero-fullwidth-subtitle">Discover amazing products at unbeatable prices</p>
                        <Link to="/products" className="home-hero-fullwidth-btn">
                            Shop Now →
                        </Link>
                    </div>
                </div>

                {/* Features Section */}
                <div className="home-features">
                    <div className="container">
                        <div className="home-features-grid">
                            <div className="home-feature-card">
                                <div className="home-feature-icon">🚚</div>
                                <h3 className="home-feature-title">Free Shipping</h3>
                                <p className="home-feature-desc">On orders over $50</p>
                            </div>
                            <div className="home-feature-card">
                                <div className="home-feature-icon">⚡</div>
                                <h3 className="home-feature-title">Fast Delivery</h3>
                                <p className="home-feature-desc">Within 3-5 days</p>
                            </div>
                            <div className="home-feature-card">
                                <div className="home-feature-icon">🔒</div>
                                <h3 className="home-feature-title">Secure Payment</h3>
                                <p className="home-feature-desc">100% secure transactions</p>
                            </div>
                            <div className="home-feature-card">
                                <div className="home-feature-icon">💬</div>
                                <h3 className="home-feature-title">24/7 Support</h3>
                                <p className="home-feature-desc">Dedicated customer service</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Best Sellers Section */}
                <ProductRecommendations 
                    type="best-sellers" 
                    title="Best Sellers" 
                    limit={4} 
                />

                {/* Featured Products Section */}
                {featuredProducts.length > 0 && (
                    <ProductSection 
                        title="Featured Products" 
                        products={featuredProducts} 
                        viewAllLink="/products?category=All"
                    />
                )}

                {/* Electronics Section */}
                {electronicsProducts.length > 0 && (
                    <ProductSection 
                        title="Electronics" 
                        products={electronicsProducts} 
                        viewAllLink="/products?category=Electronics"
                        isAlt={true}
                    />
                )}

                {/* Clothing Section */}
                {clothingProducts.length > 0 && (
                    <ProductSection 
                        title="Clothing & Fashion" 
                        products={clothingProducts} 
                        viewAllLink="/products?category=Clothing"
                    />
                )}

                {/* Home & Living Section */}
                {homeProducts.length > 0 && (
                    <ProductSection 
                        title="Home & Living" 
                        products={homeProducts} 
                        viewAllLink="/products?category=Home"
                        isAlt={true}
                    />
                )}

                {/* Books Section */}
                {booksProducts.length > 0 && (
                    <ProductSection 
                        title="Books" 
                        products={booksProducts} 
                        viewAllLink="/products?category=Books"
                    />
                )}

                {/* Sports Section */}
                {sportsProducts.length > 0 && (
                    <ProductSection 
                        title="Sports & Outdoors" 
                        products={sportsProducts} 
                        viewAllLink="/products?category=Sports"
                        isAlt={true}
                    />
                )}

                {/* Top Rated Products Section */}
                <ProductRecommendations 
                    type="top-rated" 
                    title="Top Rated Products" 
                    limit={4} 
                />

                {/* Recently Viewed Products (only for logged in users) */}
                {user && (
                    <ProductRecommendations 
                        type="recently-viewed" 
                        title="Recently Viewed" 
                        limit={4} 
                    />
                )}
            </div>
        </>
    );
};

// Inject CSS Styles for HomePage
const styleSheet = document.createElement("style");
styleSheet.textContent = `
    /* HomePage Loading */
    .home-loading-container {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        min-height: 400px;
        gap: 1rem;
    }
    
    /* Hero Section */
    .home-hero-fullwidth {
        position: relative;
        width: 100%;
        background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%);
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
        animation: homeFadeIn 0.6s ease-out;
        color: white !important;
    }
    
    .home-hero-fullwidth-subtitle {
        font-size: 1.2rem;
        margin-bottom: 2rem;
        opacity: 0.9;
        color: white !important;
    }
    
    .home-hero-fullwidth-btn {
        display: inline-block;
        padding: 1rem 2rem;
        background: white;
        color: #6366f1 !important;
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
    
    @keyframes homeFadeIn {
        from {
            opacity: 0;
            transform: translateY(20px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }
    
    /* Features Section */
    .home-features {
        padding: 4rem 0;
        background-color: var(--bg-primary, #ffffff);
    }
    
    body.dark-mode .home-features {
        background-color: #0a0a0a !important;
    }
    
    .home-features-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
        gap: 2rem;
    }
    
    .home-feature-card {
        text-align: center;
        padding: 2rem;
        background-color: var(--card-bg, #ffffff);
        border-radius: 1rem;
        box-shadow: 0 2px 4px rgba(0,0,0,0.05);
        transition: transform 0.3s;
        border: 1px solid var(--border-color, #e5e7eb);
    }
    
    body.dark-mode .home-feature-card {
        background-color: #1a1a1a !important;
        border-color: #333333 !important;
    }
    
    .home-feature-card:hover {
        transform: translateY(-4px);
    }
    
    .home-feature-icon {
        font-size: 2.5rem;
        margin-bottom: 1rem;
    }
    
    .home-feature-title {
        font-size: 1.2rem;
        font-weight: bold;
        margin-bottom: 0.5rem;
        color: var(--text-primary, #1f2937);
    }
    
    .home-feature-desc {
        color: var(--text-secondary, #6b7280);
        font-size: 0.875rem;
    }
    
    /* Sections */
    .home-section {
        padding: 4rem 0;
        background-color: var(--bg-primary, #ffffff);
    }
    
    .home-section-alt {
        background-color: var(--bg-secondary, #f8fafc);
    }
    
    body.dark-mode .home-section {
        background-color: #0a0a0a !important;
    }
    
    body.dark-mode .home-section-alt {
        background-color: #0a0a0a !important;
    }
    
    .home-section-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 30px;
        flex-wrap: wrap;
        gap: 15px;
    }
    
    .home-section-title {
        font-size: 2rem;
        text-align: left;
        margin-bottom: 0;
        color: var(--text-primary, #1f2937);
    }
    
    .home-section-subtitle {
        text-align: left;
        margin-top: 5px;
        color: var(--text-secondary, #6b7280);
    }
    
    .home-view-all-btn {
        display: inline-flex;
        align-items: center;
        padding: 10px 20px;
        background: linear-gradient(135deg, #4f46e5, #6366f1);
        color: #fff !important;
        text-decoration: none;
        border-radius: 8px;
        font-size: 14px;
        font-weight: 500;
        transition: all 0.3s;
    }
    
    .home-view-all-btn:hover {
        transform: translateY(-2px);
        background: linear-gradient(135deg, #4338ca, #4f46e5);
    }
    
    /* Container */
    .container {
        max-width: 1280px;
        margin: 0 auto;
        padding: 0 1.5rem;
    }
    
    /* Products Grid */
    .products-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
        gap: 2rem;
    }
    
    /* Spinner */
    .spinner {
        width: 40px;
        height: 40px;
        border: 4px solid #f3f4f6;
        border-top-color: #6366f1;
        border-radius: 50%;
        animation: homeSpin 1s linear infinite;
        margin: 0 auto;
    }
    
    @keyframes homeSpin {
        to { transform: rotate(360deg); }
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
        
        .home-features {
            padding: 2rem 0;
        }
        
        .home-section {
            padding: 2rem 0;
        }
        
        .home-section-title {
            font-size: 1.5rem;
        }
        
        .products-grid {
            gap: 1rem;
        }
        
        .home-section-header {
            flex-direction: column;
            text-align: center;
        }
        
        .home-section-title,
        .home-section-subtitle {
            text-align: center;
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
        
        .products-grid {
            gap: 1rem;
        }
        
        .home-features-grid {
            grid-template-columns: 1fr;
            gap: 1rem;
        }
    }
`;
document.head.appendChild(styleSheet);

export default HomePage;