import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { addToCart } from '../../redux/slices/cartSlice';
import { addToWishlist, removeFromWishlist, fetchWishlist } from '../../redux/slices/wishlistSlice';
import { fetchCart } from '../../redux/slices/cartSlice';
import { FaHeart, FaRegHeart, FaShoppingCart, FaStar, FaSpinner } from 'react-icons/fa';
import toast from 'react-hot-toast';

const ProductCard = ({ product, viewMode = 'grid' }) => {
    const dispatch = useDispatch();
    const { user } = useSelector((state) => state.auth);
    const { items: wishlistItems } = useSelector((state) => state.wishlist);
    const [adding, setAdding] = React.useState(false);
    const [imageLoaded, setImageLoaded] = useState(false);
    
    const isInWishlist = wishlistItems?.some(item => item.product?._id === product._id);

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
            <div className="product-card" style={styles.gridCard}>
                <button onClick={handleWishlist} style={styles.wishlistBtn}>
                    {isInWishlist ? <FaHeart color="#ef4444" size={18} /> : <FaRegHeart size={18} />}
                </button>
                
                <Link to={`/products/${product._id}`} style={styles.imageLink}>
                    <div style={styles.imageContainer}>
                        {!imageLoaded && (
                            <div style={styles.imagePlaceholder}>
                                <FaSpinner style={styles.spinnerIcon} />
                            </div>
                        )}
                        <img 
                            src={getProductImage()} 
                            alt={product.name}
                            style={{
                                ...styles.gridImage,
                                opacity: imageLoaded ? 1 : 0
                            }}
                            onLoad={() => setImageLoaded(true)}
                            onError={(e) => {
                                e.target.src = 'https://images.unsplash.com/photo-1472851294608-062f824d29cc?w=400&h=400&fit=crop';
                                setImageLoaded(true);
                            }}
                        />
                        {product.isFeatured && (
                            <span style={styles.featuredBadge}>Featured</span>
                        )}
                    </div>
                </Link>
                
                <div style={styles.gridContent}>
                    <Link to={`/products/${product._id}`} style={styles.titleLink}>
                        <h3 style={styles.title}>{product.name}</h3>
                    </Link>
                    
                    <p style={styles.category}>{product.category}</p>
                    
                    <div style={styles.ratingContainer}>
                        {renderStars(product.rating)}
                        <span style={styles.reviewCount}>({product.numReviews})</span>
                    </div>
                    
                    <div style={styles.priceContainer}>
                        <span style={styles.price}>${product.price.toFixed(2)}</span>
                        <span className={`product-stock ${product.countInStock > 0 ? 'stock-in' : 'stock-out'}`} style={styles.stockBadge}>
                            {product.countInStock > 0 ? `${product.countInStock} left` : 'Out of stock'}
                        </span>
                    </div>
                    
                    <button 
                        onClick={handleAddToCart}
                        disabled={product.countInStock === 0 || adding}
                        style={{
                            ...styles.addToCartBtn,
                            ...(product.countInStock === 0 && styles.disabledBtn)
                        }}
                    >
                        <FaShoppingCart size={14} />
                        <span>{adding ? 'Adding...' : 'Add to Cart'}</span>
                    </button>
                </div>
            </div>
        );
    }

    // List View
    return (
        <div style={styles.listCard}>
            <div style={styles.listImageContainer}>
                <Link to={`/products/${product._id}`}>
                    <div style={styles.listImageWrapper}>
                        <img 
                            src={getProductImage()} 
                            alt={product.name}
                            style={styles.listImage}
                            onError={(e) => {
                                e.target.src = 'https://images.unsplash.com/photo-1472851294608-062f824d29cc?w=100&h=100&fit=crop';
                            }}
                        />
                    </div>
                </Link>
                <button onClick={handleWishlist} style={styles.listWishlistBtn}>
                    {isInWishlist ? <FaHeart color="#ef4444" size={16} /> : <FaRegHeart size={16} />}
                </button>
            </div>
            
            <div style={styles.listContent}>
                <Link to={`/products/${product._id}`} style={styles.titleLink}>
                    <h3 style={styles.listTitle}>{product.name}</h3>
                </Link>
                
                <div style={styles.listMeta}>
                    <span style={styles.listCategory}>{product.category}</span>
                    <div style={styles.ratingContainer}>
                        {renderStars(product.rating)}
                        <span style={styles.reviewCount}>({product.numReviews} reviews)</span>
                    </div>
                </div>
                
                <p style={styles.description}>
                    {product.description.length > 150 
                        ? `${product.description.substring(0, 150)}...` 
                        : product.description}
                </p>
                
                <div style={styles.listFooter}>
                    <div>
                        <span style={styles.listPrice}>${product.price.toFixed(2)}</span>
                        <span style={styles.listStock}>
                            {product.countInStock > 0 ? `✓ In Stock (${product.countInStock})` : '✗ Out of Stock'}
                        </span>
                    </div>
                    <div style={styles.listActions}>
                        <Link to={`/products/${product._id}`} style={styles.viewBtn}>
                            View Details
                        </Link>
                        <button 
                            onClick={handleAddToCart}
                            disabled={product.countInStock === 0 || adding}
                            style={{
                                ...styles.listAddBtn,
                                ...(product.countInStock === 0 && styles.disabledBtn)
                            }}
                        >
                            <FaShoppingCart />
                            <span>{adding ? 'Adding...' : 'Add to Cart'}</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

const styles = {
    // Grid View Styles
    gridCard: {
        backgroundColor: '#fff',
        borderRadius: '1rem',
        overflow: 'hidden',
        boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
        transition: 'transform 0.3s, box-shadow 0.3s',
        position: 'relative',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
    },
    wishlistBtn: {
        position: 'absolute',
        top: '12px',
        right: '12px',
        backgroundColor: '#fff',
        border: 'none',
        borderRadius: '50%',
        width: '34px',
        height: '34px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        zIndex: 10,
        transition: 'transform 0.2s',
    },
    imageLink: {
        display: 'block',
        position: 'relative',
        overflow: 'hidden',
    },
    imageContainer: {
        position: 'relative',
        width: '100%',
        paddingTop: '100%', // 1:1 Aspect Ratio
        backgroundColor: '#f5f5f5',
        overflow: 'hidden',
    },
    imagePlaceholder: {
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#f5f5f5',
    },
    spinnerIcon: {
        animation: 'spin 1s linear infinite',
        fontSize: '24px',
        color: '#6366f1',
    },
    gridImage: {
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        objectFit: 'cover',
        objectPosition: 'center',
        transition: 'transform 0.5s, opacity 0.3s',
    },
    featuredBadge: {
        position: 'absolute',
        top: '12px',
        left: '12px',
        backgroundColor: '#fbbf24',
        color: '#333',
        padding: '4px 10px',
        borderRadius: '20px',
        fontSize: '11px',
        fontWeight: 'bold',
        zIndex: 10,
    },
    gridContent: {
        padding: '1rem',
        display: 'flex',
        flexDirection: 'column',
        flex: 1,
    },
    titleLink: {
        textDecoration: 'none',
    },
    title: {
        fontSize: '1rem',
        fontWeight: '600',
        marginBottom: '0.5rem',
        color: '#333',
        lineHeight: '1.4',
        display: '-webkit-box',
        WebkitLineClamp: 2,
        WebkitBoxOrient: 'vertical',
        overflow: 'hidden',
    },
    category: {
        fontSize: '0.75rem',
        color: '#666',
        marginBottom: '0.5rem',
        textTransform: 'uppercase',
        letterSpacing: '0.5px',
    },
    ratingContainer: {
        display: 'flex',
        alignItems: 'center',
        marginBottom: '0.75rem',
    },
    reviewCount: {
        fontSize: '0.7rem',
        color: '#999',
        marginLeft: '0.5rem',
    },
    priceContainer: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '1rem',
    },
    price: {
        fontSize: '1.25rem',
        fontWeight: 'bold',
        color: '#6366f1',
    },
    stockBadge: {
        fontSize: '0.7rem',
        padding: '3px 8px',
        borderRadius: '20px',
        backgroundColor: '#d1fae5',
        color: '#065f46',
    },
    addToCartBtn: {
        width: '100%',
        padding: '0.6rem',
        backgroundColor: '#6366f1',
        color: '#fff',
        border: 'none',
        borderRadius: '0.5rem',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '8px',
        fontSize: '0.9rem',
        fontWeight: '500',
        transition: 'background-color 0.3s',
    },
    
    // List View Styles
    listCard: {
        backgroundColor: '#fff',
        borderRadius: '1rem',
        padding: '1rem',
        display: 'flex',
        gap: '1.5rem',
        boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
        transition: 'box-shadow 0.3s',
    },
    listImageContainer: {
        position: 'relative',
        flexShrink: 0,
    },
    listImageWrapper: {
        width: '180px',
        height: '180px',
        overflow: 'hidden',
        borderRadius: '0.5rem',
        backgroundColor: '#f5f5f5',
    },
    listImage: {
        width: '100%',
        height: '100%',
        objectFit: 'cover',
        objectPosition: 'center',
        transition: 'transform 0.3s',
    },
    listWishlistBtn: {
        position: 'absolute',
        top: '8px',
        right: '8px',
        backgroundColor: '#fff',
        border: 'none',
        borderRadius: '50%',
        width: '30px',
        height: '30px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    },
    listContent: {
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        gap: '0.75rem',
    },
    listTitle: {
        fontSize: '1.2rem',
        fontWeight: '600',
        color: '#333',
        margin: 0,
    },
    listMeta: {
        display: 'flex',
        alignItems: 'center',
        gap: '1rem',
        flexWrap: 'wrap',
    },
    listCategory: {
        fontSize: '0.8rem',
        color: '#666',
        backgroundColor: '#f0f0f0',
        padding: '3px 10px',
        borderRadius: '20px',
    },
    description: {
        fontSize: '0.9rem',
        color: '#666',
        lineHeight: '1.5',
        margin: 0,
        display: '-webkit-box',
        WebkitLineClamp: 3,
        WebkitBoxOrient: 'vertical',
        overflow: 'hidden',
    },
    listFooter: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '1rem',
        marginTop: '0.5rem',
    },
    listPrice: {
        fontSize: '1.3rem',
        fontWeight: 'bold',
        color: '#6366f1',
        marginRight: '1rem',
    },
    listStock: {
        fontSize: '0.8rem',
        color: '#10b981',
    },
    listActions: {
        display: 'flex',
        gap: '0.75rem',
    },
    viewBtn: {
        padding: '0.5rem 1rem',
        backgroundColor: '#f0f0f0',
        color: '#333',
        textDecoration: 'none',
        borderRadius: '0.5rem',
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        fontSize: '0.85rem',
        transition: 'background-color 0.3s',
    },
    listAddBtn: {
        padding: '0.5rem 1rem',
        backgroundColor: '#6366f1',
        color: '#fff',
        border: 'none',
        borderRadius: '0.5rem',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        fontSize: '0.85rem',
        transition: 'background-color 0.3s',
    },
    disabledBtn: {
        backgroundColor: '#ccc',
        cursor: 'not-allowed',
    },
};

// Add keyframes for spinner animation
const styleSheet = document.createElement("style");
styleSheet.textContent = `
    @keyframes spin {
        from { transform: rotate(0deg); }
        to { transform: rotate(360deg); }
    }
    
    .product-card:hover .grid-image {
        transform: scale(1.05);
    }
    
    .product-card:hover .list-image {
        transform: scale(1.05);
    }
    
    .wishlist-btn:hover {
        transform: scale(1.1);
    }
    
    .add-to-cart-btn:hover {
        background-color: #4f46e5;
    }
    
    .list-card:hover {
        box-shadow: 0 4px 15px rgba(0,0,0,0.12);
    }
    
    .view-btn:hover {
        background-color: #e5e7eb;
    }
    
    .list-add-btn:hover {
        background-color: #4f46e5;
    }
    
    @media (max-width: 768px) {
        .list-image-wrapper {
            width: 120px;
            height: 120px;
        }
    }
    
    @media (max-width: 480px) {
        .list-card {
            flex-direction: column;
        }
        
        .list-image-wrapper {
            width: 100%;
            height: 200px;
        }
        
        .list-actions {
            flex-direction: column;
        }
        
        .view-btn, .list-add-btn {
            width: 100%;
            justify-content: center;
        }
    }
`;
document.head.appendChild(styleSheet);

export default ProductCard;