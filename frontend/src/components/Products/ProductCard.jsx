import React from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { addToCart } from '../../redux/slices/cartSlice';
import { addToWishlist, removeFromWishlist, fetchWishlist } from '../../redux/slices/wishlistSlice';
import { fetchCart } from '../../redux/slices/cartSlice';
import { FaHeart, FaRegHeart, FaShoppingCart, FaStar } from 'react-icons/fa';
import toast from 'react-hot-toast';

const ProductCard = ({ product }) => {
    const dispatch = useDispatch();
    const { user } = useSelector((state) => state.auth);
    const { items: wishlistItems } = useSelector((state) => state.wishlist);
    const [adding, setAdding] = React.useState(false);
    
    const isInWishlist = wishlistItems?.some(item => item.product?._id === product._id);

    // Get product image with fallback
    const getProductImage = () => {
        if (product.imageUrl && product.imageUrl !== 'https://via.placeholder.com/300') {
            return product.imageUrl;
        }
        // Category-based placeholder images
        const categoryImages = {
            'Electronics': 'https://images.unsplash.com/photo-1498049794561-7780e7231661?w=300&h=200&fit=crop',
            'Clothing': 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=300&h=200&fit=crop',
            'Books': 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=300&h=200&fit=crop',
            'Home': 'https://images.unsplash.com/photo-1484154218962-a197022b5858?w=300&h=200&fit=crop',
            'Sports': 'https://images.unsplash.com/photo-1517649763962-0c623066013b?w=300&h=200&fit=crop',
        };
        return categoryImages[product.category] || 'https://images.unsplash.com/photo-1472851294608-062f824d29cc?w=300&h=200&fit=crop';
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

    return (
        <div className="product-card">
            <button className="wishlist-btn" onClick={handleWishlist}>
                {isInWishlist ? <FaHeart color="#ef4444" size={18} /> : <FaRegHeart size={18} />}
            </button>
            <Link to={`/products/${product._id}`}>
                <img 
                    src={getProductImage()} 
                    alt={product.name}
                    className="product-image"
                    onError={(e) => {
                        e.target.src = 'https://images.unsplash.com/photo-1472851294608-062f824d29cc?w=300&h=200&fit=crop';
                    }}
                />
            </Link>
            <div className="product-content">
                <Link to={`/products/${product._id}`} style={{ textDecoration: 'none' }}>
                    <h3 className="product-title">{product.name}</h3>
                </Link>
                <p className="product-category">{product.category}</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                    <div style={{ display: 'flex', gap: '2px' }}>
                        {[...Array(5)].map((_, i) => (
                            <FaStar key={i} size={12} color={i < Math.floor(product.rating) ? '#fbbf24' : '#e5e7eb'} />
                        ))}
                    </div>
                    <span style={{ fontSize: '0.75rem', color: '#6b7280' }}>({product.numReviews})</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                    <span className="product-price">${product.price.toFixed(2)}</span>
                    <span className={`product-stock ${product.countInStock > 0 ? 'stock-in' : 'stock-out'}`}>
                        {product.countInStock > 0 ? `${product.countInStock} in stock` : 'Out of stock'}
                    </span>
                </div>
                <button 
                    onClick={handleAddToCart}
                    disabled={product.countInStock === 0 || adding}
                    className="btn-primary"
                    style={{ width: '100%', padding: '0.5rem' }}
                >
                    <FaShoppingCart size={14} />
                    <span>{adding ? 'Adding...' : 'Add to Cart'}</span>
                </button>
            </div>
        </div>
    );
};

export default ProductCard;