import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchProducts } from '../../redux/slices/productSlice';
import ProductCard from '../../components/Products/ProductCard';
import ProductFilters from '../../components/Products/ProductFilters';
import { FaFilter, FaTh, FaThLarge, FaSearch } from 'react-icons/fa';

const ProductsPage = () => {
    const dispatch = useDispatch();
    const { products, loading, error } = useSelector((state) => state.products);
    const [showFilters, setShowFilters] = useState(false);
    const [viewMode, setViewMode] = useState('grid');
    const [searchTerm, setSearchTerm] = useState('');
    const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
    const [activeCategory, setActiveCategory] = useState('All');
    const [filters, setFilters] = useState({
        keyword: '',
        category: 'All',
        minPrice: '',
        maxPrice: '',
        rating: '',
        sortBy: 'createdAt',
        order: 'desc'
    });

    // Category options
    const categories = ['All', 'Electronics', 'Clothing', 'Books', 'Home', 'Sports', 'Other'];

    // Debounce search term for real-time searching
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearchTerm(searchTerm);
            setFilters(prev => ({ ...prev, keyword: searchTerm }));
        }, 500);

        return () => clearTimeout(timer);
    }, [searchTerm]);

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

    const handleCategoryClick = (category) => {
        setActiveCategory(category);
        setFilters(prev => ({ ...prev, category: category }));
        setShowFilters(false);
    };

    const handleFilterChange = (newFilters) => {
        setFilters(newFilters);
        setActiveCategory(newFilters.category || 'All');
        setSearchTerm(newFilters.keyword || '');
        setShowFilters(false);
    };

    const handleSearchChange = (e) => {
        const value = e.target.value;
        setSearchTerm(value);
    };

    const handleClearSearch = () => {
        setSearchTerm('');
        setDebouncedSearchTerm('');
        setFilters(prev => ({ ...prev, keyword: '' }));
    };

    // FIXED: Only show badge for non-category filters
    const getActiveFiltersCount = () => {
        let count = 0;
        if (filters.keyword) count++;
        if (filters.minPrice || filters.maxPrice) count++;
        if (filters.rating) count++;
        // Category filter doesn't add to badge count
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

            {/* Real-Time Search Bar */}
            <div style={styles.searchSection}>
                <div style={styles.searchContainer}>
                    <FaSearch style={styles.searchIcon} />
                    <input
                        type="text"
                        placeholder="Search products in real-time..."
                        value={searchTerm}
                        onChange={handleSearchChange}
                        style={styles.searchInput}
                    />
                    {searchTerm && (
                        <button onClick={handleClearSearch} style={styles.clearSearchBtn}>
                            ×
                        </button>
                    )}
                </div>
                {searchTerm && (
                    <div style={styles.searchingIndicator}>
                        Searching for: <strong>"{searchTerm}"</strong>
                    </div>
                )}
            </div>

            {/* Category Tabs */}
            <div style={styles.categoryTabs}>
                {categories.map((category) => (
                    <button
                        key={category}
                        onClick={() => handleCategoryClick(category)}
                        style={{
                            ...styles.categoryTab,
                            ...(activeCategory === category && styles.categoryTabActive)
                        }}
                    >
                        {category}
                        {category !== 'All' && (
                            <span style={styles.categoryCount}>
                                {products.filter(p => p.category === category).length}
                            </span>
                        )}
                    </button>
                ))}
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
                        {activeCategory !== 'All' && (
                            <span style={styles.activeFilter}>
                                Category: {activeCategory}
                                <button onClick={() => handleCategoryClick('All')} style={styles.removeFilter}>×</button>
                            </span>
                        )}
                        {filters.minPrice || filters.maxPrice ? (
                            <span style={styles.activeFilter}>
                                Price: ${filters.minPrice || 0} - ${filters.maxPrice || '∞'}
                                <button onClick={() => handleFilterChange({ ...filters, minPrice: '', maxPrice: '' })} style={styles.removeFilter}>×</button>
                            </span>
                        ) : null}
                        {filters.rating && (
                            <span style={styles.activeFilter}>
                                Rating: {filters.rating}★ & above
                                <button onClick={() => handleFilterChange({ ...filters, rating: '' })} style={styles.removeFilter}>×</button>
                            </span>
                        )}
                        {filters.keyword && (
                            <span style={styles.activeFilter}>
                                Search: "{filters.keyword}"
                                <button onClick={() => handleFilterChange({ ...filters, keyword: '' })} style={styles.removeFilter}>×</button>
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
                            <p>Try adjusting your search or filters</p>
                            <button onClick={handleClearSearch} style={styles.resetBtn}>
                                Clear Search
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
    // Real-Time Search Styles
    searchSection: {
        marginBottom: '20px',
    },
    searchContainer: {
        position: 'relative',
        width: '100%',
        maxWidth: '500px',
    },
    searchIcon: {
        position: 'absolute',
        left: '15px',
        top: '50%',
        transform: 'translateY(-50%)',
        color: '#999',
        fontSize: '18px',
    },
    searchInput: {
        width: '100%',
        padding: '14px 45px 14px 45px',
        border: '2px solid #e5e7eb',
        borderRadius: '0.75rem',
        fontSize: '1rem',
        transition: 'all 0.3s',
        backgroundColor: '#fff',
    },
    clearSearchBtn: {
        position: 'absolute',
        right: '15px',
        top: '50%',
        transform: 'translateY(-50%)',
        background: 'none',
        border: 'none',
        fontSize: '20px',
        cursor: 'pointer',
        color: '#999',
        padding: '0 5px',
    },
    searchingIndicator: {
        marginTop: '10px',
        fontSize: '0.85rem',
        color: '#666',
        paddingLeft: '5px',
    },
    // Category Tabs Styles
    categoryTabs: {
        display: 'flex',
        flexWrap: 'wrap',
        gap: '10px',
        marginBottom: '30px',
        paddingBottom: '10px',
        borderBottom: '2px solid #f0f0f0',
    },
    categoryTab: {
        padding: '10px 24px',
        backgroundColor: 'transparent',
        border: 'none',
        borderRadius: '30px',
        cursor: 'pointer',
        fontSize: '0.95rem',
        fontWeight: '500',
        color: '#666',
        transition: 'all 0.3s',
        position: 'relative',
    },
    categoryTabActive: {
        backgroundColor: '#6366f1',
        color: '#fff',
        boxShadow: '0 2px 8px rgba(99, 102, 241, 0.3)',
    },
    categoryCount: {
        display: 'inline-block',
        marginLeft: '8px',
        padding: '2px 6px',
        backgroundColor: 'rgba(0,0,0,0.1)',
        borderRadius: '20px',
        fontSize: '0.7rem',
        fontWeight: 'normal',
    },
    content: {
        display: 'flex',
        gap: '30px',
    },
    filtersDesktop: {
        width: '280px',
        flexShrink: 0,
    },
    productsSection: {
        flex: 1,
    },
    productsSectionWithFilters: {
        width: 'calc(100% - 310px)',
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