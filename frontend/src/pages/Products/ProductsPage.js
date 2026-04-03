import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchProducts } from '../../redux/slices/productSlice';
import ProductCard from '../../components/Products/ProductCard';
import ProductFilters from '../../components/Products/ProductFilters';
import { FaFilter, FaTh, FaThLarge } from 'react-icons/fa';

const ProductsPage = () => {
    const dispatch = useDispatch();
    const { products, loading, error } = useSelector((state) => state.products);
    const [showFilters, setShowFilters] = useState(false);
    const [viewMode, setViewMode] = useState('grid');
    const [filters, setFilters] = useState({
        keyword: '',
        category: 'All',
        minPrice: '',
        maxPrice: '',
        rating: '',
        sortBy: 'createdAt',
        order: 'desc'
    });

    useEffect(() => {
        // Build query string from filters
        const queryParams = new URLSearchParams();
        if (filters.keyword) queryParams.append('keyword', filters.keyword);
        if (filters.category && filters.category !== 'All') queryParams.append('category', filters.category);
        if (filters.minPrice) queryParams.append('minPrice', filters.minPrice);
        if (filters.maxPrice) queryParams.append('maxPrice', filters.maxPrice);
        if (filters.rating) queryParams.append('rating', filters.rating);
        if (filters.sortBy) queryParams.append('sortBy', filters.sortBy);
        if (filters.order) queryParams.append('order', filters.order);
        
        dispatch(fetchProducts(queryParams.toString()));
    }, [dispatch, filters]);

    const handleFilterChange = (newFilters) => {
        // This will be called when Apply button is clicked
        setFilters(newFilters);
        setShowFilters(false); // Close filter modal on mobile after apply
    };

    const getActiveFiltersCount = () => {
    let count = 0;
    if (filters.keyword) count++;
    if (filters.category !== 'All') count++;
    if (filters.minPrice || filters.maxPrice) count++;
    if (filters.rating) count++;
    if (filters.sortBy !== 'createdAt' || filters.order !== 'desc') count++;
    return count;
};
    if (loading) {
        return (
            <div style={styles.center}>
                <div className="spinner"></div>
                <p>Loading products...</p>
            </div>
        );
    }

    if (error) {
        return <div style={styles.center}>Error: {error}</div>;
    }

    return (
        <div style={styles.container}>
            <div style={styles.header}>
                <h1 style={styles.title}>Our Products</h1>
                <div style={styles.headerActions}>
                    <div style={styles.viewToggle}>
                        <button
                            onClick={() => setViewMode('grid')}
                            style={{
                                ...styles.viewBtn,
                                ...(viewMode === 'grid' && styles.viewBtnActive)
                            }}
                        >
                            <FaTh />
                        </button>
                        <button
                            onClick={() => setViewMode('list')}
                            style={{
                                ...styles.viewBtn,
                                ...(viewMode === 'list' && styles.viewBtnActive)
                            }}
                        >
                            <FaThLarge />
                        </button>
                    </div>
                    <button
                        onClick={() => setShowFilters(!showFilters)}
                        style={styles.filterBtn}
                    >
                        <FaFilter />
                        Filters
                        {getActiveFiltersCount() > 0 && (
                            <span style={styles.filterBadge}>{getActiveFiltersCount()}</span>
                        )}
                    </button>
                </div>
            </div>

            <div style={styles.content}>
                {/* Filters Sidebar - Desktop */}
                <div style={{
                    ...styles.filtersDesktop,
                    display: showFilters ? 'block' : 'none'
                }}>
                    <ProductFilters
                        filters={filters}
                        onFilterChange={handleFilterChange}
                    />
                </div>

                {/* Mobile Filters Modal */}
                {showFilters && (
                    <div style={styles.modal}>
                        <div style={styles.modalContent}>
                            <ProductFilters
                                filters={filters}
                                onFilterChange={handleFilterChange}
                                onClose={() => setShowFilters(false)}
                                isMobile={true}
                            />
                        </div>
                    </div>
                )}

                {/* Products Grid */}
                <div style={{
                    ...styles.productsSection,
                    ...(showFilters && styles.productsSectionWithFilters)
                }}>
                    <div style={styles.resultsInfo}>
                        <p>{products.length} products found</p>
                        {filters.keyword && (
                            <span style={styles.activeFilter}>
                                Search: "{filters.keyword}"
                                <button onClick={() => handleFilterChange({ ...filters, keyword: '' })} style={styles.removeFilter}>×</button>
                            </span>
                        )}
                        {filters.category !== 'All' && (
                            <span style={styles.activeFilter}>
                                Category: {filters.category}
                                <button onClick={() => handleFilterChange({ ...filters, category: 'All' })} style={styles.removeFilter}>×</button>
                            </span>
                        )}
                    </div>

                    <div style={{
                        ...styles.productsGrid,
                        ...(viewMode === 'list' && styles.productsList)
                    }}>
                        {products.map((product) => (
                            <ProductCard key={product._id} product={product} viewMode={viewMode} />
                        ))}
                    </div>

                    {products.length === 0 && (
                        <div style={styles.noResults}>
                            <h3>No products found</h3>
                            <p>Try adjusting your filters or search term</p>
                            <button onClick={() => handleFilterChange({
                                keyword: '',
                                category: 'All',
                                minPrice: '',
                                maxPrice: '',
                                rating: '',
                                sortBy: 'createdAt',
                                order: 'desc'
                            })} style={styles.resetBtn}>
                                Clear All Filters
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

const styles = {
    container: {
        maxWidth: '1400px',
        margin: '0 auto',
        padding: '20px',
    },
    header: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '30px',
        flexWrap: 'wrap',
        gap: '15px',
    },
    title: {
        fontSize: '2rem',
        color: '#333',
        margin: 0,
    },
    headerActions: {
        display: 'flex',
        gap: '15px',
        alignItems: 'center',
    },
    viewToggle: {
        display: 'flex',
        gap: '5px',
        backgroundColor: '#f0f0f0',
        borderRadius: '0.5rem',
        padding: '0.25rem',
    },
    viewBtn: {
        padding: '0.5rem',
        backgroundColor: 'transparent',
        border: 'none',
        borderRadius: '0.3rem',
        cursor: 'pointer',
        fontSize: '1rem',
    },
    viewBtnActive: {
        backgroundColor: '#6366f1',
        color: '#fff',
    },
    filterBtn: {
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        padding: '0.6rem 1.2rem',
        backgroundColor: '#6366f1',
        color: '#fff',
        border: 'none',
        borderRadius: '0.5rem',
        cursor: 'pointer',
        position: 'relative',
    },
    filterBadge: {
        position: 'absolute',
        top: '-8px',
        right: '-8px',
        backgroundColor: '#dc3545',
        color: '#fff',
        borderRadius: '50%',
        width: '20px',
        height: '20px',
        fontSize: '12px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
    },
    content: {
        display: 'flex',
        gap: '30px',
    },
    filtersDesktop: {
        width: '280px',
        flexShrink: 0,
        '@media (max-width: 768px)': {
            display: 'none',
        },
    },
    productsSection: {
        flex: 1,
    },
    productsSectionWithFilters: {
        '@media (min-width: 769px)': {
            width: 'calc(100% - 310px)',
        },
    },
    resultsInfo: {
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        gap: '10px',
        marginBottom: '20px',
        paddingBottom: '15px',
        borderBottom: '1px solid #eee',
    },
    activeFilter: {
        display: 'inline-flex',
        alignItems: 'center',
        gap: '8px',
        backgroundColor: '#e5e7eb',
        padding: '4px 8px',
        borderRadius: '1rem',
        fontSize: '0.8rem',
    },
    removeFilter: {
        background: 'none',
        border: 'none',
        cursor: 'pointer',
        fontSize: '1rem',
        fontWeight: 'bold',
        color: '#666',
    },
    productsGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
        gap: '1.5rem',
    },
    productsList: {
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem',
    },
    noResults: {
        textAlign: 'center',
        padding: '60px 20px',
        backgroundColor: '#fff',
        borderRadius: '1rem',
    },
    resetBtn: {
        marginTop: '20px',
        padding: '10px 20px',
        backgroundColor: '#6366f1',
        color: '#fff',
        border: 'none',
        borderRadius: '0.5rem',
        cursor: 'pointer',
    },
    modal: {
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.5)',
        zIndex: 1000,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContent: {
        width: '90%',
        maxWidth: '400px',
        maxHeight: '90vh',
        overflow: 'auto',
        borderRadius: '1rem',
    },
    center: {
        textAlign: 'center',
        padding: '50px',
    },
};

export default ProductsPage;