import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { fetchWishlist, removeFromWishlist } from '../../redux/slices/wishlistSlice';
import { addToCart } from '../../redux/slices/cartSlice';
import { fetchCart } from '../../redux/slices/cartSlice';
import { FaHeart, FaShoppingCart, FaTrash, FaSpinner } from 'react-icons/fa';
import toast from 'react-hot-toast';

const WishlistPage = () => {
    const dispatch = useDispatch();
    const { items, itemCount, loading } = useSelector((state) => state.wishlist);
    const { user } = useSelector((state) => state.auth);

    useEffect(() => {
        if (user) {
            dispatch(fetchWishlist());
        }
    }, [dispatch, user]);

    const handleRemoveFromWishlist = async (productId, productName) => {
        const result = await dispatch(removeFromWishlist(productId));
        if (result.error) {
            toast.error(result.error);
        } else {
            toast.success(`${productName} removed from wishlist`);
        }
    };

    const handleAddToCart = async (product) => {
        if (!product) {
            toast.error('Product not available');
            return;
        }
        
        try {
            // Check if product has sizes
            if (product.hasSizes && product.sizes && product.sizes.length > 0) {
                toast.error('Please select a size from product page');
                return;
            }
            
            await dispatch(addToCart(product._id, 1));
            await dispatch(fetchCart());
            toast.success(`${product.name} added to cart!`);
        } catch (error) {
            toast.error('Failed to add to cart');
        }
    };

    if (!user) {
        return (
            <div style={styles.center}>
                <FaHeart size={48} color="#ccc" />
                <h2>Please login to view your wishlist</h2>
                <Link to="/login" style={styles.loginBtn}>Login</Link>
            </div>
        );
    }

    if (loading) {
        return (
            <div style={styles.center}>
                <FaSpinner style={styles.spinner} />
                <p>Loading wishlist...</p>
            </div>
        );
    }

    // Filter out any null or undefined items
    const validItems = items?.filter(item => item && item.product) || [];

    if (validItems.length === 0) {
        return (
            <div style={styles.center}>
                <FaHeart size={48} color="#ccc" />
                <h2>Your wishlist is empty</h2>
                <p>Save your favorite items here!</p>
                <Link to="/products" style={styles.shopBtn}>Browse Products</Link>
            </div>
        );
    }

    return (
        <div style={styles.container}>
            <h1 style={styles.title}>My Wishlist</h1>
            <p style={styles.subtitle}>{validItems.length} item{validItems.length !== 1 ? 's' : ''} saved</p>
            
            <div style={styles.wishlistGrid}>
                {validItems.map((item) => {
                    const product = item.product;
                    if (!product) return null;
                    
                    return (
                        <div key={product._id} style={styles.wishlistCard}>
                            <Link to={`/products/${product._id}`}>
                                <img 
                                    src={product.imageUrl || 'https://via.placeholder.com/200'} 
                                    alt={product.name}
                                    style={styles.productImage}
                                />
                            </Link>
                            <div style={styles.productInfo}>
                                <Link to={`/products/${product._id}`} style={styles.productName}>
                                    {product.name}
                                </Link>
                                <p style={styles.productCategory}>{product.category}</p>
                                <p style={styles.productPrice}>${product.price?.toFixed(2) || '0.00'}</p>
                                <div style={styles.buttonGroup}>
                                    <button 
                                        onClick={() => handleAddToCart(product)}
                                        disabled={product.countInStock === 0}
                                        style={{
                                            ...styles.cartBtn,
                                            ...(product.countInStock === 0 && styles.disabledBtn)
                                        }}
                                    >
                                        <FaShoppingCart /> Add to Cart
                                    </button>
                                    <button 
                                        onClick={() => handleRemoveFromWishlist(product._id, product.name)}
                                        style={styles.removeBtn}
                                    >
                                        <FaTrash /> Remove
                                    </button>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
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
        fontSize: '2rem',
        marginBottom: '10px',
        color: '#333',
    },
    subtitle: {
        color: '#666',
        marginBottom: '30px',
    },
    wishlistGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
        gap: '20px',
    },
    wishlistCard: {
        backgroundColor: '#fff',
        borderRadius: '8px',
        overflow: 'hidden',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        display: 'flex',
        flexDirection: 'column',
        transition: 'transform 0.3s',
    },
    productImage: {
        width: '100%',
        height: '200px',
        objectFit: 'cover',
    },
    productInfo: {
        padding: '15px',
    },
    productName: {
        fontSize: '1rem',
        fontWeight: 'bold',
        color: '#333',
        textDecoration: 'none',
        display: 'block',
        marginBottom: '8px',
    },
    productCategory: {
        fontSize: '0.85rem',
        color: '#666',
        marginBottom: '8px',
    },
    productPrice: {
        fontSize: '1.2rem',
        fontWeight: 'bold',
        color: '#6366f1',
        marginBottom: '12px',
    },
    buttonGroup: {
        display: 'flex',
        gap: '10px',
    },
    cartBtn: {
        flex: 1,
        padding: '8px',
        backgroundColor: '#28a745',
        color: '#fff',
        border: 'none',
        borderRadius: '5px',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '5px',
        fontSize: '12px',
    },
    removeBtn: {
        flex: 1,
        padding: '8px',
        backgroundColor: '#dc3545',
        color: '#fff',
        border: 'none',
        borderRadius: '5px',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '5px',
        fontSize: '12px',
    },
    disabledBtn: {
        backgroundColor: '#ccc',
        cursor: 'not-allowed',
    },
    center: {
        textAlign: 'center',
        padding: '50px',
    },
    loginBtn: {
        display: 'inline-block',
        marginTop: '20px',
        padding: '10px 30px',
        backgroundColor: '#6366f1',
        color: '#fff',
        textDecoration: 'none',
        borderRadius: '5px',
    },
    shopBtn: {
        display: 'inline-block',
        marginTop: '20px',
        padding: '10px 30px',
        backgroundColor: '#6366f1',
        color: '#fff',
        textDecoration: 'none',
        borderRadius: '5px',
    },
    spinner: {
        animation: 'spin 1s linear infinite',
        fontSize: '2rem',
        color: '#6366f1',
        marginBottom: '1rem',
    },
};

// Add keyframes for spinner
const styleSheet = document.createElement("style");
styleSheet.textContent = `
    @keyframes spin {
        from { transform: rotate(0deg); }
        to { transform: rotate(360deg); }
    }
`;
document.head.appendChild(styleSheet);

export default WishlistPage;