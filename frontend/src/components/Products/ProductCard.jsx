import React from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { addToCart } from '../../redux/slices/cartSlice';
import { addToWishlist, removeFromWishlist, fetchWishlist } from '../../redux/slices/wishlistSlice';
import { fetchCart } from '../../redux/slices/cartSlice';
import { FaHeart, FaRegHeart, FaShoppingCart } from 'react-icons/fa';
import toast from 'react-hot-toast';

const ProductCard = ({ product }) => {
    const dispatch = useDispatch();
    const { user } = useSelector((state) => state.auth);
    const { items: wishlistItems } = useSelector((state) => state.wishlist);
    const [adding, setAdding] = React.useState(false);
    
    const isInWishlist = wishlistItems?.some(item => item.product?._id === product._id);

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
            const errorMessage = error.response?.data?.message || 'Failed to add to cart';
            toast.error(errorMessage);
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
            const errorMessage = error.message || 'Something went wrong';
            toast.error(errorMessage);
        }
    };

    return (
        <div style={styles.card}>
            <button onClick={handleWishlist} style={styles.wishlistBtn}>
                {isInWishlist ? <FaHeart color="#dc3545" size={20} /> : <FaRegHeart size={20} />}
            </button>
            <Link to={`/products/${product._id}`}>
                <img 
                    src={product.imageUrl || 'https://via.placeholder.com/300'} 
                    alt={product.name}
                    style={styles.image}
                />
            </Link>
            <div style={styles.content}>
                <Link to={`/products/${product._id}`} style={styles.titleLink}>
                    <h3 style={styles.title}>{product.name}</h3>
                </Link>
                <p style={styles.category}>{product.category}</p>
                <p style={styles.price}>${product.price.toFixed(2)}</p>
                <p style={styles.stock}>
                    {product.countInStock > 0 ? `In Stock: ${product.countInStock}` : 'Out of Stock'}
                </p>
                <button 
                    onClick={handleAddToCart}
                    disabled={product.countInStock === 0 || adding}
                    style={{
                        ...styles.button,
                        ...(product.countInStock === 0 && styles.buttonDisabled)
                    }}
                >
                    <FaShoppingCart /> {adding ? 'Adding...' : 'Add to Cart'}
                </button>
            </div>
        </div>
    );
};

const styles = {
    card: {
        backgroundColor: '#fff',
        borderRadius: '8px',
        overflow: 'hidden',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        transition: 'transform 0.3s, box-shadow 0.3s',
        position: 'relative',
    },
    wishlistBtn: {
        position: 'absolute',
        top: '10px',
        right: '10px',
        backgroundColor: '#fff',
        border: 'none',
        borderRadius: '50%',
        width: '32px',
        height: '32px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        zIndex: 1,
    },
    image: {
        width: '100%',
        height: '200px',
        objectFit: 'cover',
    },
    content: {
        padding: '1rem',
    },
    titleLink: {
        textDecoration: 'none',
    },
    title: {
        fontSize: '1rem',
        marginBottom: '0.5rem',
        color: '#333',
    },
    category: {
        fontSize: '0.85rem',
        color: '#666',
        marginBottom: '0.5rem',
    },
    price: {
        fontSize: '1.25rem',
        fontWeight: 'bold',
        color: '#007bff',
        marginBottom: '0.5rem',
    },
    stock: {
        fontSize: '0.85rem',
        color: '#28a745',
        marginBottom: '1rem',
    },
    button: {
        width: '100%',
        padding: '0.5rem',
        backgroundColor: '#007bff',
        color: '#fff',
        border: 'none',
        borderRadius: '4px',
        cursor: 'pointer',
        fontSize: '1rem',
        transition: 'background-color 0.3s',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '8px',
    },
    buttonDisabled: {
        backgroundColor: '#ccc',
        cursor: 'not-allowed',
    },
};

export default ProductCard;