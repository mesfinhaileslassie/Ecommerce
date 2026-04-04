import React from 'react';
import { FaCheck } from 'react-icons/fa';

// Helper function to get color code from color name
const getColorCode = (colorName) => {
    const colorMap = {
        'Red': '#ef4444',
        'Blue': '#3b82f6',
        'Green': '#10b981',
        'Yellow': '#fbbf24',
        'Purple': '#8b5cf6',
        'Pink': '#ec489a',
        'Black': '#1f2937',
        'White': '#f9fafb',
        'Gray': '#6b7280',
        'Brown': '#78350f',
        'Navy': '#1e3a8a',
        'Teal': '#14b8a6',
        'Orange': '#f97316',
        'Coral': '#f43f5e',
        'Lavender': '#a855f7',
        'Mint': '#34d399',
        'Beige': '#f5f5dc',
        'Gold': '#fbbf24',
        'Silver': '#9ca3af',
        'Cyan': '#06b6d4',
        'Indigo': '#4f46e5',
        'Rose': '#f43f5e',
        'Sky': '#0ea5e9',
        'Emerald': '#059669',
        'Amber': '#d97706',
        'Default': '#6366f1'
    };
    return colorMap[colorName] || '#6366f1';
};

const ColorSelector = ({ variants = [], selectedColor, onColorChange, availableSizes = [] }) => {
    // If no variants or variants is not an array, return null
    if (!variants || !Array.isArray(variants) || variants.length === 0) {
        return null;
    }

    // Get unique colors from variants
    const uniqueColors = variants.reduce((acc, variant) => {
        if (!variant || !variant.color) return acc;
        if (!acc.find(c => c.name === variant.color)) {
            acc.push({
                name: variant.color,
                code: variant.colorCode || getColorCode(variant.color)
            });
        }
        return acc;
    }, []);

    // If no unique colors, return null
    if (uniqueColors.length === 0) {
        return null;
    }

    const handleColorClick = (color) => {
        // Check if this color has any available sizes
        const hasAvailableSizes = availableSizes.some(
            variant => variant && variant.color === color.name && variant.countInStock > 0
        );
        
        if (hasAvailableSizes && onColorChange) {
            onColorChange(color);
        }
    };

    return (
        <div style={styles.container}>
            <label style={styles.label}>Color:</label>
            <div style={styles.colorGrid}>
                {uniqueColors.map((color) => {
                    const isSelected = selectedColor?.name === color.name;
                    const hasStock = availableSizes.some(
                        variant => variant && variant.color === color.name && variant.countInStock > 0
                    );
                    
                    return (
                        <button
                            key={color.name}
                            onClick={() => handleColorClick(color)}
                            disabled={!hasStock}
                            style={{
                                ...styles.colorBtn,
                                backgroundColor: color.code,
                                border: isSelected ? '3px solid #1f2937' : '2px solid #e5e7eb',
                                opacity: hasStock ? 1 : 0.4,
                                cursor: hasStock ? 'pointer' : 'not-allowed',
                            }}
                            title={color.name}
                        >
                            {isSelected && <FaCheck style={styles.checkIcon} />}
                        </button>
                    );
                })}
            </div>
        </div>
    );
};

const styles = {
    container: {
        marginBottom: '15px',
    },
    label: {
        display: 'block',
        fontWeight: '600',
        marginBottom: '10px',
        color: '#333',
    },
    colorGrid: {
        display: 'flex',
        flexWrap: 'wrap',
        gap: '12px',
    },
    colorBtn: {
        width: '36px',
        height: '36px',
        borderRadius: '50%',
        border: '2px solid #e5e7eb',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        transition: 'all 0.3s',
        position: 'relative',
    },
    checkIcon: {
        color: '#fff',
        fontSize: '14px',
        textShadow: '0 0 2px rgba(0,0,0,0.5)',
    },
};

export default ColorSelector;