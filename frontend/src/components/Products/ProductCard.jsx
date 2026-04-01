import React from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { addToCart } from '../../redux/slices/cartSlice';
import { fetchCart } from '../../redux/slices/cartSlice';
import toast from 'react-hot-toast';

const ProductCard = ({ product }) => {
    const dispatch = useDispatch();
    const { user } = useSelector((state) => state.auth);
    const [adding, setAdding] = React.useState(false);

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
            console.log('Adding to cart - Product ID:', product._id);
            const result = await dispatch(addToCart(product._id, 1));
            console.log('Add to cart result:', result);
            
            if (result.error) {
                toast.error(result.error.message || 'Failed to add to cart');
            } else {
                toast.success(`${product.name} added to cart!`);
                // Force refresh the cart to update the count in navbar and cart page
                await dispatch(fetchCart());
            }
        } catch (error) {
            console.error('Add to cart error:', error);
            toast.error(error.response?.data?.message || 'Failed to add to cart');
        } finally {
            setAdding(false);
        }
    };

    return (
        <div style={styles.card}>
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
                    {adding ? 'Adding...' : 'Add to Cart'}
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
    },
    buttonDisabled: {
        backgroundColor: '#ccc',
        cursor: 'not-allowed',
    },
};

export default ProductCard;