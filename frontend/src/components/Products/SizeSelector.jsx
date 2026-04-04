import React from 'react';

const SizeSelector = ({ sizes, selectedSize, onSizeChange }) => {
    const availableSizes = sizes || [];

    const handleSizeClick = (size) => {
        if (size.countInStock > 0) {
            onSizeChange(size);
        }
    };

    return (
        <div style={styles.container}>
            <label style={styles.label}>Select Size:</label>
            <div style={styles.sizeGrid}>
                {availableSizes.map((sizeItem) => (
                    <button
                        key={sizeItem.size}
                        onClick={() => handleSizeClick(sizeItem)}
                        disabled={sizeItem.countInStock === 0}
                        style={{
                            ...styles.sizeBtn,
                            ...(selectedSize?.size === sizeItem.size && styles.sizeBtnActive),
                            ...(sizeItem.countInStock === 0 && styles.sizeBtnDisabled)
                        }}
                    >
                        {sizeItem.size}
                        {sizeItem.price !== undefined && sizeItem.price > 0 && (
                            <span style={styles.sizePrice}>${sizeItem.price}</span>
                        )}
                    </button>
                ))}
            </div>
        </div>
    );
};

const styles = {
    container: {
        marginBottom: '20px',
    },
    label: {
        display: 'block',
        fontWeight: '600',
        marginBottom: '10px',
        color: '#333',
    },
    sizeGrid: {
        display: 'flex',
        flexWrap: 'wrap',
        gap: '10px',
    },
    sizeBtn: {
        padding: '10px 16px',
        backgroundColor: '#f3f4f6',
        border: '2px solid #e5e7eb',
        borderRadius: '8px',
        cursor: 'pointer',
        fontSize: '14px',
        fontWeight: '500',
        transition: 'all 0.3s',
        minWidth: '60px',
    },
    sizeBtnActive: {
        backgroundColor: '#6366f1',
        borderColor: '#6366f1',
        color: '#fff',
    },
    sizeBtnDisabled: {
        backgroundColor: '#f3f4f6',
        borderColor: '#e5e7eb',
        color: '#9ca3af',
        cursor: 'not-allowed',
        textDecoration: 'line-through',
    },
    sizePrice: {
        fontSize: '10px',
        display: 'block',
        marginTop: '2px',
    },
};

export default SizeSelector;