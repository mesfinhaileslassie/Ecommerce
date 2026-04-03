import React, { useState } from 'react';
import { FaSearch, FaSlidersH, FaTimes, FaFilter, FaCheck } from 'react-icons/fa';

const ProductFilters = ({ filters, onFilterChange, onClose, isMobile }) => {
    const [localFilters, setLocalFilters] = useState(filters);
    const [priceRange, setPriceRange] = useState({
        min: filters.minPrice || '',
        max: filters.maxPrice || ''
    });
    const [hasChanges, setHasChanges] = useState(false);

    const categories = ['All', 'Electronics', 'Clothing', 'Books', 'Home', 'Sports', 'Other'];
    const sortOptions = [
        { value: 'createdAt_desc', label: 'Newest First' },
        { value: 'createdAt_asc', label: 'Oldest First' },
        { value: 'price_asc', label: 'Price: Low to High' },
        { value: 'price_desc', label: 'Price: High to Low' },
        { value: 'rating_desc', label: 'Highest Rated' },
        { value: 'name_asc', label: 'Name A-Z' },
    ];

    const handleLocalChange = (key, value) => {
        const newFilters = { ...localFilters, [key]: value };
        setLocalFilters(newFilters);
        setHasChanges(true);
    };

    const handlePriceChange = () => {
        const newFilters = { 
            ...localFilters, 
            minPrice: priceRange.min, 
            maxPrice: priceRange.max 
        };
        setLocalFilters(newFilters);
        setHasChanges(true);
    };

    const handleApplyFilters = () => {
        onFilterChange(localFilters);
        setHasChanges(false);
        if (onClose) onClose();
    };

    const handleResetFilters = () => {
        const clearedFilters = {
            keyword: '',
            category: 'All',
            minPrice: '',
            maxPrice: '',
            rating: '',
            sortBy: 'createdAt',
            order: 'desc'
        };
        setLocalFilters(clearedFilters);
        setPriceRange({ min: '', max: '' });
        setHasChanges(true);
    };

    const handleClearAndApply = () => {
        const clearedFilters = {
            keyword: '',
            category: 'All',
            minPrice: '',
            maxPrice: '',
            rating: '',
            sortBy: 'createdAt',
            order: 'desc'
        };
        setLocalFilters(clearedFilters);
        setPriceRange({ min: '', max: '' });
        onFilterChange(clearedFilters);
        setHasChanges(false);
        if (onClose) onClose();
    };

    const getActiveFiltersCount = () => {
        let count = 0;
        if (localFilters.keyword) count++;
        if (localFilters.category !== 'All') count++;
        if (localFilters.minPrice || localFilters.maxPrice) count++;
        if (localFilters.rating) count++;
        if (localFilters.sortBy !== 'createdAt' || localFilters.order !== 'desc') count++;
        return count;
    };

    const activeCount = getActiveFiltersCount();

    return (
        <div style={styles.container}>
            <div style={styles.header}>
                <h3 style={styles.title}>
                    <FaSlidersH /> Filters
                    {activeCount > 0 && <span style={styles.badge}>{activeCount}</span>}
                </h3>
                {onClose && (
                    <button onClick={onClose} style={styles.closeBtn}>
                        <FaTimes />
                    </button>
                )}
            </div>

            {/* Search Input */}
            <div style={styles.filterSection}>
                <label style={styles.label}>Search Products</label>
                <div style={styles.searchContainer}>
                    <FaSearch style={styles.searchIcon} />
                    <input
                        type="text"
                        placeholder="Search by name or description..."
                        value={localFilters.keyword || ''}
                        onChange={(e) => handleLocalChange('keyword', e.target.value)}
                        style={styles.searchInput}
                    />
                </div>
            </div>

            {/* Category Filter */}
            <div style={styles.filterSection}>
                <label style={styles.label}>Category</label>
                <select
                    value={localFilters.category || 'All'}
                    onChange={(e) => handleLocalChange('category', e.target.value)}
                    style={styles.select}
                >
                    {categories.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                    ))}
                </select>
            </div>

            {/* Price Range */}
            <div style={styles.filterSection}>
                <label style={styles.label}>Price Range</label>
                <div style={styles.priceContainer}>
                    <input
                        type="number"
                        placeholder="Min"
                        value={priceRange.min}
                        onChange={(e) => setPriceRange({ ...priceRange, min: e.target.value })}
                        onBlur={handlePriceChange}
                        style={styles.priceInput}
                    />
                    <span style={styles.priceSeparator}>-</span>
                    <input
                        type="number"
                        placeholder="Max"
                        value={priceRange.max}
                        onChange={(e) => setPriceRange({ ...priceRange, max: e.target.value })}
                        onBlur={handlePriceChange}
                        style={styles.priceInput}
                    />
                </div>
            </div>

            {/* Rating Filter */}
            <div style={styles.filterSection}>
                <label style={styles.label}>Minimum Rating</label>
                <select
                    value={localFilters.rating || ''}
                    onChange={(e) => handleLocalChange('rating', e.target.value)}
                    style={styles.select}
                >
                    <option value="">All Ratings</option>
                    <option value="4">4★ & above</option>
                    <option value="3">3★ & above</option>
                    <option value="2">2★ & above</option>
                    <option value="1">1★ & above</option>
                </select>
            </div>

            {/* Sort By */}
            <div style={styles.filterSection}>
                <label style={styles.label}>Sort By</label>
                <select
                    value={`${localFilters.sortBy}_${localFilters.order}`}
                    onChange={(e) => {
                        const [sortBy, order] = e.target.value.split('_');
                        handleLocalChange('sortBy', sortBy);
                        handleLocalChange('order', order);
                    }}
                    style={styles.select}
                >
                    {sortOptions.map(option => (
                        <option key={option.value} value={option.value}>{option.label}</option>
                    ))}
                </select>
            </div>

            {/* Action Buttons */}
            <div style={styles.actionButtons}>
                <button onClick={handleApplyFilters} style={styles.applyBtn}>
                    <FaCheck /> Apply Filters
                </button>
                <button onClick={handleClearAndApply} style={styles.clearBtn}>
                    Clear All Filters
                </button>
            </div>

            {/* Reset Button (only if changes pending) */}
            {hasChanges && (
                <button onClick={handleResetFilters} style={styles.resetBtn}>
                    Reset Changes
                </button>
            )}
        </div>
    );
};

const styles = {
    container: {
        backgroundColor: '#fff',
        borderRadius: '1rem',
        padding: '1.5rem',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    },
    header: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '1.5rem',
        paddingBottom: '0.5rem',
        borderBottom: '2px solid #f0f0f0',
    },
    title: {
        fontSize: '1.2rem',
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        margin: 0,
    },
    badge: {
        backgroundColor: '#6366f1',
        color: '#fff',
        fontSize: '0.7rem',
        padding: '2px 6px',
        borderRadius: '10px',
    },
    closeBtn: {
        background: 'none',
        border: 'none',
        fontSize: '1.2rem',
        cursor: 'pointer',
        color: '#999',
    },
    filterSection: {
        marginBottom: '1.5rem',
    },
    label: {
        display: 'block',
        fontSize: '0.9rem',
        fontWeight: '600',
        marginBottom: '0.5rem',
        color: '#555',
    },
    searchContainer: {
        position: 'relative',
    },
    searchIcon: {
        position: 'absolute',
        left: '0.75rem',
        top: '50%',
        transform: 'translateY(-50%)',
        color: '#999',
    },
    searchInput: {
        width: '100%',
        padding: '0.6rem 0.6rem 0.6rem 2.2rem',
        border: '1px solid #ddd',
        borderRadius: '0.5rem',
        fontSize: '0.9rem',
    },
    select: {
        width: '100%',
        padding: '0.6rem',
        border: '1px solid #ddd',
        borderRadius: '0.5rem',
        fontSize: '0.9rem',
        backgroundColor: '#fff',
    },
    priceContainer: {
        display: 'flex',
        gap: '0.5rem',
        alignItems: 'center',
    },
    priceInput: {
        flex: 1,
        padding: '0.6rem',
        border: '1px solid #ddd',
        borderRadius: '0.5rem',
        fontSize: '0.9rem',
    },
    priceSeparator: {
        color: '#999',
    },
    actionButtons: {
        display: 'flex',
        gap: '0.75rem',
        marginTop: '1rem',
    },
    applyBtn: {
        flex: 1,
        padding: '0.6rem',
        backgroundColor: '#28a745',
        color: '#fff',
        border: 'none',
        borderRadius: '0.5rem',
        cursor: 'pointer',
        fontSize: '0.9rem',
        fontWeight: '500',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '0.5rem',
        transition: 'background-color 0.3s',
    },
    clearBtn: {
        flex: 1,
        padding: '0.6rem',
        backgroundColor: '#dc3545',
        color: '#fff',
        border: 'none',
        borderRadius: '0.5rem',
        cursor: 'pointer',
        fontSize: '0.9rem',
        fontWeight: '500',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '0.5rem',
        transition: 'background-color 0.3s',
    },
    resetBtn: {
        width: '100%',
        padding: '0.6rem',
        backgroundColor: '#6c757d',
        color: '#fff',
        border: 'none',
        borderRadius: '0.5rem',
        cursor: 'pointer',
        marginTop: '0.75rem',
        fontSize: '0.8rem',
        transition: 'background-color 0.3s',
    },
};

export default ProductFilters;