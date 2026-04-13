import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { addToCart } from '../../redux/slices/cartSlice';
import { addToWishlist, removeFromWishlist, fetchWishlist } from '../../redux/slices/wishlistSlice';
import { fetchCart } from '../../redux/slices/cartSlice';
import { FaHeart, FaRegHeart, FaShoppingCart, FaStar, FaSpinner, FaInfoCircle } from 'react-icons/fa';
import toast from 'react-hot-toast';

const ProductCard = ({ product, viewMode = 'grid' }) => {
    const dispatch = useDispatch();
    const { user } = useSelector((state) => state.auth);
    const { items: wishlistItems } = useSelector((state) => state.wishlist);
    const [adding, setAdding] = React.useState(false);
    const [imageLoaded, setImageLoaded] = useState(false);
    
    const isInWishlist = wishlistItems?.some(item => item.product?._id === product._id);
    const hasSizes = product.hasSizes && product.sizes && product.sizes.length > 0;

    // Get product image with fallback
    const getProductImage = () => {
        if (product.imageUrl && product.imageUrl !== 'https://via.placeholder.com/300') {
            return product.imageUrl;
        }
        // Category-based placeholder images
        const categoryImages = {
            'Electronics': 'https://images.unsplash.com/photo-1498049794561-7780e7231661?w=400&h=400&fit=crop',
            'Clothing': 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=400&h=400&fit=crop',
            'Books': 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=400&h=400&fit=crop',
            'Home': 'https://images.unsplash.com/photo-1484154218962-a197022b5858?w=400&h=400&fit=crop',
            'Sports': 'https://images.unsplash.com/photo-1517649763962-0c623066013b?w=400&h=400&fit=crop',
        };
        return categoryImages[product.category] || 'https://images.unsplash.com/photo-1472851294608-062f824d29cc?w=400&h=400&fit=crop';
    };

    // Get display price
    const getDisplayPrice = () => {
        if (hasSizes) {
            // Find min and max price from sizes
            const prices = product.sizes.map(s => s.price);
            const minPrice = Math.min(...prices);
            const maxPrice = Math.max(...prices);
            
            if (minPrice === maxPrice) {
                return `$${minPrice.toFixed(2)}`;
            }
            return `$${minPrice.toFixed(2)} - $${maxPrice.toFixed(2)}`;
        }
        return `$${product.price.toFixed(2)}`;
    };

    const handleAddToCart = async () => {
        if (!user) {
            toast.error('Please login to add items to cart');
            return;
        }
        
        if (product.countInStock === 0) {
            toast.error('Product is out of stock');
            return;
        }

        setAdding(true);
        
        try {
            await dispatch(addToCart(product._id, 1));
            await dispatch(fetchCart());
            toast.success(`${product.name} added to cart!`);
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to add to cart');
        } finally {
            setAdding(false);
        }
    };

    const handleWishlist = async () => {
        if (!user) {
            toast.error('Please login to add to wishlist');
            return;
        }
        
        try {
            if (isInWishlist) {
                const result = await dispatch(removeFromWishlist(product._id));
                if (result.error) {
                    toast.error(typeof result.error === 'string' ? result.error : 'Failed to remove from wishlist');
                } else {
                    toast.success('Removed from wishlist');
                }
            } else {
                const result = await dispatch(addToWishlist(product._id));
                if (result.error) {
                    toast.error(typeof result.error === 'string' ? result.error : 'Failed to add to wishlist');
                } else {
                    toast.success('Added to wishlist');
                }
            }
            dispatch(fetchWishlist());
        } catch (error) {
            toast.error('Something went wrong');
        }
    };

    // Render stars for rating
    const renderStars = (rating) => {
        return [...Array(5)].map((_, i) => (
            <FaStar
                key={i}
                size={14}
                color={i < Math.floor(rating) ? '#fbbf24' : '#e5e7eb'}
                style={{ marginRight: '2px' }}
            />
        ));
    };

    // Grid View
    if (viewMode === 'grid') {
        return (
            <div className="product-card-grid">
                <button onClick={handleWishlist} className="product-wishlist-btn">
                    {isInWishlist ? <FaHeart color="#ef4444" size={18} /> : <FaRegHeart size={18} />}
                </button>
                
                <Link to={`/products/${product._id}`} className="product-image-link">
                    <div className="product-image-container">
                        {!imageLoaded && (
                            <div className="product-image-placeholder">
                                <FaSpinner className="product-spinner-icon" />
                            </div>
                        )}
                        <img 
                            src={getProductImage()} 
                            alt={product.name}
                            className="product-grid-image"
                            style={{ opacity: imageLoaded ? 1 : 0 }}
                            onLoad={() => setImageLoaded(true)}
                            onError={(e) => {
                                e.target.src = 'https://images.unsplash.com/photo-1472851294608-062f824d29cc?w=400&h=400&fit=crop';
                                setImageLoaded(true);
                            }}
                        />
                        {product.isFeatured && (
                            <span className="product-featured-badge">Featured</span>
                        )}
                        {hasSizes && (
                            <span className="product-sizes-badge">Multiple Sizes</span>
                        )}
                    </div>
                </Link>
                
                <div className="product-grid-content">
                    <Link to={`/products/${product._id}`} className="product-title-link">
                        <h3 className="product-title">{product.name}</h3>
                    </Link>
                    
                    <p className="product-category">{product.category}</p>
                    
                    <div className="product-rating-container">
                        {renderStars(product.rating)}
                        <span className="product-review-count">({product.numReviews})</span>
                    </div>
                    
                    <div className="product-price-container">
                        <span className="product-price">{getDisplayPrice()}</span>
                        <span className={`product-stock-badge ${hasSizes ? 'product-stock-sizes' : (product.countInStock > 0 ? 'product-stock-in' : 'product-stock-out')}`}>
                            {hasSizes ? 'Sizes available' : (product.countInStock > 0 ? `${product.countInStock} left` : 'Out of stock')}
                        </span>
                    </div>
                    
                    {hasSizes ? (
                        <Link to={`/products/${product._id}`} className="product-select-size-btn">
                            <FaInfoCircle size={14} />
                            <span>Select Size</span>
                        </Link>
                    ) : (
                        <button 
                            onClick={handleAddToCart}
                            disabled={product.countInStock === 0 || adding}
                            className={`product-add-to-cart-btn ${product.countInStock === 0 ? 'product-disabled-btn' : ''}`}
                        >
                            <FaShoppingCart size={14} />
                            <span>{adding ? 'Adding...' : 'Add to Cart'}</span>
                        </button>
                    )}
                </div>
            </div>
        );
    }

    // List View
    return (
        <div className="product-card-list">
            <div className="product-list-image-container">
                <Link to={`/products/${product._id}`}>
                    <div className="product-list-image-wrapper">
                        <img 
                            src={getProductImage()} 
                            alt={product.name}
                            className="product-list-image"
                            onError={(e) => {
                                e.target.src = 'https://images.unsplash.com/photo-1472851294608-062f824d29cc?w=100&h=100&fit=crop';
                            }}
                        />
                        {hasSizes && (
                            <span className="product-list-sizes-badge">Sizes Available</span>
                        )}
                    </div>
                </Link>
                <button onClick={handleWishlist} className="product-list-wishlist-btn">
                    {isInWishlist ? <FaHeart color="#ef4444" size={16} /> : <FaRegHeart size={16} />}
                </button>
            </div>
            
            <div className="product-list-content">
                <Link to={`/products/${product._id}`} className="product-title-link">
                    <h3 className="product-list-title">{product.name}</h3>
                </Link>
                
                <div className="product-list-meta">
                    <span className="product-list-category">{product.category}</span>
                    <div className="product-rating-container">
                        {renderStars(product.rating)}
                        <span className="product-review-count">({product.numReviews} reviews)</span>
                    </div>
                </div>
                
                <p className="product-description">
                    {product.description.length > 150 
                        ? `${product.description.substring(0, 150)}...` 
                        : product.description}
                </p>
                
                <div className="product-list-footer">
                    <div>
                        <span className="product-list-price">{getDisplayPrice()}</span>
                        <span className="product-list-stock">
                            {hasSizes ? 'Multiple sizes available' : (product.countInStock > 0 ? `✓ In Stock (${product.countInStock})` : '✗ Out of Stock')}
                        </span>
                    </div>
                    <div className="product-list-actions">
                        <Link to={`/products/${product._id}`} className="product-view-btn">
                            {hasSizes ? 'Select Size' : 'View Details'}
                        </Link>
                        {!hasSizes && (
                            <button 
                                onClick={handleAddToCart}
                                disabled={product.countInStock === 0 || adding}
                                className={`product-list-add-btn ${product.countInStock === 0 ? 'product-disabled-btn' : ''}`}
                            >
                                <FaShoppingCart />
                                <span>{adding ? 'Adding...' : 'Add to Cart'}</span>
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

// Inject CSS Styles for ProductCard
const styleSheet = document.createElement("style");
styleSheet.textContent = `
    @keyframes productSpin {
        from { transform: rotate(0deg); }
        to { transform: rotate(360deg); }
    }
    
    /* Grid View Styles */
    .product-card-grid {
        background-color: var(--card-bg, #fff);
        border-radius: 1rem;
        overflow: hidden;
        box-shadow: 0 2px 8px rgba(0,0,0,0.08);
        transition: transform 0.3s, box-shadow 0.3s;
        position: relative;
        height: 100%;
        display: flex;
        flex-direction: column;
        border: 1px solid var(--border-color, #e5e7eb);
    }
    
    .product-card-grid:hover {
        transform: translateY(-4px);
        box-shadow: 0 8px 25px rgba(0,0,0,0.1);
    }
    
    .product-wishlist-btn {
        position: absolute;
        top: 12px;
        right: 12px;
        background-color: var(--card-bg, #fff);
        border: 1px solid var(--border-color, #ddd);
        border-radius: 50%;
        width: 34px;
        height: 34px;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        z-index: 10;
        transition: transform 0.2s;
        color: var(--text-primary, #333);
    }
    
    .product-wishlist-btn:hover {
        transform: scale(1.1);
    }
    
    .product-image-link {
        display: block;
        position: relative;
        overflow: hidden;
    }
    
    .product-image-container {
        position: relative;
        width: 100%;
        padding-top: 100%;
        background-color: var(--bg-secondary, #f5f5f5);
        overflow: hidden;
    }
    
    .product-image-placeholder {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
        background-color: var(--bg-secondary, #f5f5f5);
    }
    
    .product-spinner-icon {
        animation: productSpin 1s linear infinite;
        font-size: 24px;
        color: #6366f1;
    }
    
    .product-grid-image {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        object-fit: cover;
        object-position: center;
        transition: transform 0.5s, opacity 0.3s;
    }
    
    .product-card-grid:hover .product-grid-image {
        transform: scale(1.05);
    }
    
    .product-featured-badge {
        position: absolute;
        top: 12px;
        left: 12px;
        background-color: #fbbf24;
        color: #333;
        padding: 4px 10px;
        border-radius: 20px;
        font-size: 11px;
        font-weight: bold;
        z-index: 10;
    }
    
    .product-sizes-badge {
        position: absolute;
        bottom: 12px;
        left: 12px;
        background-color: #6366f1;
        color: #fff;
        padding: 4px 10px;
        border-radius: 20px;
        font-size: 10px;
        font-weight: bold;
        z-index: 10;
    }
    
    .product-grid-content {
        padding: 1rem;
        display: flex;
        flex-direction: column;
        flex: 1;
    }
    
    .product-title-link {
        text-decoration: none;
    }
    
    .product-title {
        font-size: 1rem;
        font-weight: 600;
        margin-bottom: 0.5rem;
        color: var(--text-primary, #333);
        line-height: 1.4;
        display: -webkit-box;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
        overflow: hidden;
    }
    
    .product-category {
        font-size: 0.75rem;
        color: var(--text-secondary, #666);
        margin-bottom: 0.5rem;
        text-transform: uppercase;
        letter-spacing: 0.5px;
    }
    
    .product-rating-container {
        display: flex;
        align-items: center;
        margin-bottom: 0.75rem;
    }
    
    .product-review-count {
        font-size: 0.7rem;
        color: var(--text-secondary, #999);
        margin-left: 0.5rem;
    }
    
    .product-price-container {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 1rem;
    }
    
    .product-price {
        font-size: 1.25rem;
        font-weight: bold;
        color: #6366f1;
    }
    
    .product-stock-badge {
        font-size: 0.7rem;
        padding: 3px 8px;
        border-radius: 20px;
    }
    
    .product-stock-in {
        background-color: #d1fae5;
        color: #065f46;
    }
    
    body.dark-mode .product-stock-in {
        background-color: #064e3b;
        color: #34d399;
    }
    
    .product-stock-out {
        background-color: #fee2e2;
        color: #991b1b;
    }
    
    body.dark-mode .product-stock-out {
        background-color: #7f1d1d;
        color: #fca5a5;
    }
    
    .product-stock-sizes {
        background-color: #dbeafe;
        color: #1e40af;
    }
    
    body.dark-mode .product-stock-sizes {
        background-color: #1e3a5f;
        color: #93c5fd;
    }
    
    .product-add-to-cart-btn {
        width: 100%;
        padding: 0.6rem;
        background: linear-gradient(135deg, #4f46e5, #6366f1);
        color: #fff;
        border: none;
        border-radius: 0.5rem;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
        font-size: 0.9rem;
        font-weight: 500;
        transition: all 0.3s;
    }
    
    .product-add-to-cart-btn:hover:not(:disabled) {
        background: linear-gradient(135deg, #4338ca, #4f46e5);
        transform: translateY(-2px);
    }
    
    .product-select-size-btn {
        width: 100%;
        padding: 0.6rem;
        background: linear-gradient(135deg, #059669, #10b981);
        color: #fff;
        border: none;
        border-radius: 0.5rem;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
        font-size: 0.9rem;
        font-weight: 500;
        text-decoration: none;
        transition: all 0.3s;
    }
    
    .product-select-size-btn:hover {
        background: linear-gradient(135deg, #047857, #059669);
        transform: translateY(-2px);
    }
    
    .product-disabled-btn {
        background-color: #ccc !important;
        cursor: not-allowed !important;
        opacity: 0.6;
    }
    
    body.dark-mode .product-disabled-btn {
        background-color: #374151 !important;
    }
    
    /* List View Styles */
    .product-card-list {
        background-color: var(--card-bg, #fff);
        border-radius: 1rem;
        padding: 1rem;
        display: flex;
        gap: 1.5rem;
        box-shadow: 0 2px 8px rgba(0,0,0,0.08);
        transition: box-shadow 0.3s;
        border: 1px solid var(--border-color, #e5e7eb);
    }
    
    .product-card-list:hover {
        box-shadow: 0 4px 15px rgba(0,0,0,0.12);
    }
    
    .product-list-image-container {
        position: relative;
        flex-shrink: 0;
    }
    
    .product-list-image-wrapper {
        width: 180px;
        height: 180px;
        overflow: hidden;
        border-radius: 0.5rem;
        background-color: var(--bg-secondary, #f5f5f5);
        position: relative;
    }
    
    .product-list-image {
        width: 100%;
        height: 100%;
        object-fit: cover;
        object-position: center;
        transition: transform 0.3s;
    }
    
    .product-card-list:hover .product-list-image {
        transform: scale(1.05);
    }
    
    .product-list-sizes-badge {
        position: absolute;
        bottom: 8px;
        left: 8px;
        background-color: #6366f1;
        color: #fff;
        padding: 2px 8px;
        border-radius: 20px;
        font-size: 9px;
        font-weight: bold;
    }
    
    .product-list-wishlist-btn {
        position: absolute;
        top: 8px;
        right: 8px;
        background-color: var(--card-bg, #fff);
        border: 1px solid var(--border-color, #ddd);
        border-radius: 50%;
        width: 30px;
        height: 30px;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    
    .product-list-content {
        flex: 1;
        display: flex;
        flex-direction: column;
        gap: 0.75rem;
    }
    
    .product-list-title {
        font-size: 1.2rem;
        font-weight: 600;
        color: var(--text-primary, #333);
        margin: 0;
    }
    
    .product-list-meta {
        display: flex;
        align-items: center;
        gap: 1rem;
        flex-wrap: wrap;
    }
    
    .product-list-category {
        font-size: 0.8rem;
        color: var(--text-secondary, #666);
        background-color: var(--bg-secondary, #f0f0f0);
        padding: 3px 10px;
        border-radius: 20px;
    }
    
    body.dark-mode .product-list-category {
        background-color: #1a1a1a;
        color: #aaaaaa;
    }
    
    .product-description {
        font-size: 0.9rem;
        color: var(--text-secondary, #666);
        line-height: 1.5;
        margin: 0;
        display: -webkit-box;
        -webkit-line-clamp: 3;
        -webkit-box-orient: vertical;
        overflow: hidden;
    }
    
    .product-list-footer {
        display: flex;
        justify-content: space-between;
        align-items: center;
        flex-wrap: wrap;
        gap: 1rem;
        margin-top: 0.5rem;
    }
    
    .product-list-price {
        font-size: 1.3rem;
        font-weight: bold;
        color: #6366f1;
        margin-right: 1rem;
    }
    
    .product-list-stock {
        font-size: 0.8rem;
        color: #10b981;
    }
    
    body.dark-mode .product-list-stock {
        color: #34d399;
    }
    
    .product-list-actions {
        display: flex;
        gap: 0.75rem;
    }
    
    .product-view-btn {
        padding: 0.5rem 1rem;
        background-color: var(--bg-secondary, #f0f0f0);
        color: var(--text-primary, #333);
        text-decoration: none;
        border-radius: 0.5rem;
        display: flex;
        align-items: center;
        gap: 6px;
        font-size: 0.85rem;
        transition: all 0.3s;
        border: 1px solid var(--border-color, #ddd);
    }
    
    .product-view-btn:hover {
        background-color: var(--border-color, #e5e7eb);
    }
    
    .product-list-add-btn {
        padding: 0.5rem 1rem;
        background: linear-gradient(135deg, #4f46e5, #6366f1);
        color: #fff;
        border: none;
        border-radius: 0.5rem;
        cursor: pointer;
        display: flex;
        align-items: center;
        gap: 6px;
        font-size: 0.85rem;
        transition: all 0.3s;
    }
    
    .product-list-add-btn:hover:not(:disabled) {
        background: linear-gradient(135deg, #4338ca, #4f46e5);
        transform: translateY(-2px);
    }
    
    /* Responsive */
    @media (max-width: 768px) {
        .product-list-image-wrapper {
            width: 120px;
            height: 120px;
        }
    }
    
    @media (max-width: 480px) {
        .product-card-list {
            flex-direction: column;
        }
        
        .product-list-image-wrapper {
            width: 100%;
            height: 200px;
        }
        
        .product-list-actions {
            flex-direction: column;
        }
        
        .product-view-btn,
        .product-list-add-btn {
            width: 100%;
            justify-content: center;
        }
    }
`;
document.head.appendChild(styleSheet);

export default ProductCard;