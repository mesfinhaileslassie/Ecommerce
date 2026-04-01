import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchProducts } from '../../redux/slices/productSlice';
import ProductCard from '../../components/Products/ProductCard';

const HomePage = () => {
    const dispatch = useDispatch();
    const { products, loading, error } = useSelector((state) => state.products);
    const featuredProducts = products.filter(p => p.isFeatured).slice(0, 4);

    useEffect(() => {
        dispatch(fetchProducts());
    }, [dispatch]);

    if (loading) {
        return <div style={styles.center}>Loading products...</div>;
    }

    if (error) {
        return <div style={styles.center}>Error: {error}</div>;
    }

    return (
        <div>
            <div style={styles.hero}>
                <h1 style={styles.heroTitle}>Welcome to E-Shop</h1>
                <p style={styles.heroSubtitle}>Discover amazing products at great prices</p>
            </div>
            
            {featuredProducts.length > 0 && (
                <div style={styles.featuredSection}>
                    <h2 style={styles.sectionTitle}>Featured Products</h2>
                    <div style={styles.productsGrid}>
                        {featuredProducts.map((product) => (
                            <ProductCard key={product._id} product={product} />
                        ))}
                    </div>
                </div>
            )}
            
            <div style={styles.allProductsSection}>
                <h2 style={styles.sectionTitle}>All Products</h2>
                <div style={styles.productsGrid}>
                    {products.map((product) => (
                        <ProductCard key={product._id} product={product} />
                    ))}
                </div>
            </div>
        </div>
    );
};

const styles = {
    hero: {
        textAlign: 'center',
        padding: '60px 20px',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: '#fff',
        borderRadius: '10px',
        marginBottom: '40px',
    },
    heroTitle: {
        fontSize: '3rem',
        marginBottom: '1rem',
    },
    heroSubtitle: {
        fontSize: '1.2rem',
    },
    featuredSection: {
        marginBottom: '40px',
    },
    allProductsSection: {
        marginBottom: '40px',
    },
    sectionTitle: {
        fontSize: '1.8rem',
        marginBottom: '20px',
        color: '#333',
    },
    productsGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
        gap: '2rem',
    },
    center: {
        textAlign: 'center',
        padding: '50px',
        fontSize: '1.2rem',
    },
};

export default HomePage;