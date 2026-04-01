import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchProduct } from '../../redux/slices/productSlice';
import { addToCart } from '../../redux/slices/cartSlice';
import { fetchCart } from '../../redux/slices/cartSlice';
import Reviews from '../../components/Products/Reviews';
import toast from 'react-hot-toast';
import { FaStar, FaShoppingCart } from 'react-icons/fa';

const ProductDetailsPage = () => {
    const { id } = useParams();
    const dispatch = useDispatch();
    const { product, loading } = useSelector((state) => state.products);
    const { user } = useSelector((state) => state.auth);
    const [quantity, setQuantity] = useState(1);
    const [adding, setAdding] = useState(false);

    useEffect(() => {
        if (id) {
            dispatch(fetchProduct(id));
        }
    }, [dispatch, id]);

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
            await dispatch(addToCart(product._id, quantity));
            await dispatch(fetchCart());
            toast.success(`${product.name} added to cart!`);
        } catch (error) {
            toast.error('Failed to add to cart');
        } finally {
            setAdding(false);
        }
    };

    if (loading) {
        return <div style={styles.center}>Loading product...</div>;
    }

    if (!product) {
        return <div style={styles.center}>Product not found</div>;
    }

    return (
        <div style={styles.container}>
            <div style={styles.productContainer}>
                <div style={styles.imageSection}>
                    <img 
                        src={product.imageUrl || 'https://via.placeholder.com/400'} 
                        alt={product.name}
                        style={styles.image}
                    />
                </div>
                
                <div style={styles.infoSection}>
                    <h1 style={styles.name}>{product.name}</h1>
                    <div style={styles.rating}>
                        {[...Array(5)].map((_, i) => (
                            <FaStar
                                key={i}
                                style={styles.star}
                                color={i < Math.floor(product.rating) ? '#ffc107' : '#e4e5e9'}
                            />
                        ))}
                        <span style={styles.reviewCount}>({product.numReviews} reviews)</span>
                    </div>
                    <p style={styles.category}>Category: {product.category}</p>
                    <p style={styles.price}>${product.price.toFixed(2)}</p>
                    <p style={styles.description}>{product.description}</p>
                    <p style={styles.stock}>
                        {product.countInStock > 0 ? `In Stock: ${product.countInStock}` : 'Out of Stock'}
                    </p>
                    
                    {product.countInStock > 0 && (
                        <div style={styles.quantitySection}>
                            <label style={styles.label}>Quantity:</label>
                            <select 
                                value={quantity} 
                                onChange={(e) => setQuantity(Number(e.target.value))}
                                style={styles.select}
                            >
                                {[...Array(Math.min(10, product.countInStock))].map((_, i) => (
                                    <option key={i + 1} value={i + 1}>{i + 1}</option>
                                ))}
                            </select>
                        </div>
                    )}
                    
                    <button 
                        onClick={handleAddToCart}
                        disabled={product.countInStock === 0 || adding}
                        style={{
                            ...styles.addBtn,
                            ...(product.countInStock === 0 && styles.disabledBtn)
                        }}
                    >
                        <FaShoppingCart /> {adding ? 'Adding...' : 'Add to Cart'}
                    </button>
                    
                    <Link to="/products" style={styles.backBtn}>
                        Back to Products
                    </Link>
                </div>
            </div>
            
            <Reviews productId={product._id} />
        </div>
    );
};

const styles = {
    container: {
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '20px',
    },
    productContainer: {
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '40px',
        backgroundColor: '#fff',
        borderRadius: '8px',
        padding: '30px',
        marginBottom: '30px',
    },
    imageSection: {
        display: 'flex',
        justifyContent: 'center',
    },
    image: {
        maxWidth: '100%',
        height: 'auto',
        borderRadius: '8px',
    },
    infoSection: {
        display: 'flex',
        flexDirection: 'column',
        gap: '15px',
    },
    name: {
        fontSize: '1.8rem',
        color: '#333',
    },
    rating: {
        display: 'flex',
        alignItems: 'center',
        gap: '5px',
    },
    star: {
        fontSize: '18px',
    },
    reviewCount: {
        color: '#666',
        fontSize: '14px',
        marginLeft: '5px',
    },
    category: {
        color: '#666',
    },
    price: {
        fontSize: '1.5rem',
        fontWeight: 'bold',
        color: '#007bff',
    },
    description: {
        color: '#555',
        lineHeight: '1.6',
    },
    stock: {
        fontWeight: 'bold',
        color: '#28a745',
    },
    quantitySection: {
        display: 'flex',
        alignItems: 'center',
        gap: '15px',
    },
    label: {
        fontWeight: 'bold',
    },
    select: {
        padding: '8px',
        border: '1px solid #ddd',
        borderRadius: '5px',
    },
    addBtn: {
        padding: '12px',
        backgroundColor: '#007bff',
        color: '#fff',
        border: 'none',
        borderRadius: '5px',
        cursor: 'pointer',
        fontSize: '16px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '8px',
    },
    disabledBtn: {
        backgroundColor: '#ccc',
        cursor: 'not-allowed',
    },
    backBtn: {
        textAlign: 'center',
        padding: '10px',
        backgroundColor: '#6c757d',
        color: '#fff',
        textDecoration: 'none',
        borderRadius: '5px',
    },
    center: {
        textAlign: 'center',
        padding: '50px',
    },
};

export default ProductDetailsPage;