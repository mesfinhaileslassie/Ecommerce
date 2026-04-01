import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchProducts } from '../../redux/slices/productSlice';
import ProductCard from '../../components/Products/ProductCard';

const ProductsPage = () => {
    const dispatch = useDispatch();
    const { products, loading, error } = useSelector((state) => state.products);
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        dispatch(fetchProducts());
    }, [dispatch]);

    const categories = ['All', 'Electronics', 'Clothing', 'Books', 'Home', 'Sports', 'Other'];

    const filteredProducts = products.filter(product => {
        const matchesCategory = selectedCategory === 'All' || product.category === selectedCategory;
        const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                              product.description.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesCategory && matchesSearch;
    });

    if (loading) {
        return <div style={styles.center}>Loading products...</div>;
    }

    if (error) {
        return <div style={styles.center}>Error: {error}</div>;
    }

    return (
        <div style={styles.container}>
            <h1 style={styles.title}>Our Products</h1>
            
            <div style={styles.filters}>
                <input
                    type="text"
                    placeholder="Search products..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    style={styles.searchInput}
                />
                
                <div style={styles.categoryFilters}>
                    {categories.map(category => (
                        <button
                            key={category}
                            onClick={() => setSelectedCategory(category)}
                            style={{
                                ...styles.categoryBtn,
                                ...(selectedCategory === category ? styles.activeCategory : {})
                            }}
                        >
                            {category}
                        </button>
                    ))}
                </div>
            </div>
            
            <div style={styles.productsGrid}>
                {filteredProducts.map((product) => (
                    <ProductCard key={product._id} product={product} />
                ))}
            </div>
            
            {filteredProducts.length === 0 && (
                <div style={styles.center}>
                    <p>No products found</p>
                </div>
            )}
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
        marginBottom: '30px',
    },
    filters: {
        marginBottom: '30px',
    },
    searchInput: {
        width: '100%',
        padding: '12px',
        border: '1px solid #ddd',
        borderRadius: '5px',
        fontSize: '16px',
        marginBottom: '15px',
    },
    categoryFilters: {
        display: 'flex',
        flexWrap: 'wrap',
        gap: '10px',
    },
    categoryBtn: {
        padding: '8px 16px',
        backgroundColor: '#f0f0f0',
        border: 'none',
        borderRadius: '5px',
        cursor: 'pointer',
        transition: 'all 0.3s',
    },
    activeCategory: {
        backgroundColor: '#007bff',
        color: '#fff',
    },
    productsGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
        gap: '2rem',
    },
    center: {
        textAlign: 'center',
        padding: '50px',
    },
};

export default ProductsPage;