import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchProduct } from '../../redux/slices/productSlice';
import { addToCart } from '../../redux/slices/cartSlice';
import { fetchCart } from '../../redux/slices/cartSlice';
import Reviews from '../../components/Products/Reviews';
import SizeSelector from '../../components/Products/SizeSelector';
import toast from 'react-hot-toast';
import { FaStar, FaShoppingCart, FaSpinner } from 'react-icons/fa';

const ProductDetailsPage = () => {
    const { id } = useParams();
    const dispatch = useDispatch();
    const { product, loading } = useSelector((state) => state.products);
    const { user } = useSelector((state) => state.auth);
    const [quantity, setQuantity] = useState(1);
    const [adding, setAdding] = useState(false);
    const [selectedSize, setSelectedSize] = useState(null);

    useEffect(() => {
        if (id) {
            dispatch(fetchProduct(id));
        }
    }, [dispatch, id]);

    // Reset selected size when product changes
    useEffect(() => {
        if (product) {
            console.log('Product data:', product);
            console.log('Has sizes:', product.hasSizes);
            console.log('Sizes array:', product.sizes);
            
            if (product.hasSizes && product.sizes && product.sizes.length > 0) {
                // Find first available size
                const availableSize = product.sizes.find(s => s.countInStock > 0);
                setSelectedSize(availableSize || product.sizes[0]);
            } else {
                setSelectedSize(null);
            }
            // Reset quantity when product changes
            setQuantity(1);
        }
    }, [product]);

    const getProductImage = () => {
        if (product?.imageUrl && product.imageUrl !== 'https://via.placeholder.com/300') {
            return product.imageUrl;
        }
        const categoryImages = {
            'Electronics': 'https://images.unsplash.com/photo-1498049794561-7780e7231661?w=600&h=400&fit=crop',
            'Clothing': 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=600&h=400&fit=crop',
            'Books': 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=600&h=400&fit=crop',
            'Home': 'https://images.unsplash.com/photo-1484154218962-a197022b5858?w=600&h=400&fit=crop',
            'Sports': 'https://images.unsplash.com/photo-1517649763962-0c623066013b?w=600&h=400&fit=crop',
        };
        return categoryImages[product?.category] || 'https://images.unsplash.com/photo-1472851294608-062f824d29cc?w=600&h=400&fit=crop';
    };

    const getCurrentPrice = () => {
        if (product?.hasSizes && selectedSize) {
            return selectedSize.price;
        }
        return product?.price || 0;
    };

    const getCurrentStock = () => {
        if (product?.hasSizes && selectedSize) {
            return selectedSize.countInStock;
        }
        return product?.countInStock || 0;
    };

    const handleAddToCart = async () => {
        if (!user) {
            toast.error('Please login to add items to cart');
            return;
        }
        
        if (product.hasSizes && !selectedSize) {
            toast.error('Please select a size');
            return;
        }
        
        const currentStock = getCurrentStock();
        if (currentStock === 0) {
            toast.error('Selected size is out of stock');
            return;
        }
        
        setAdding(true);
        try {
            // Prepare cart item with size information
            const cartItem = {
                productId: product._id,
                quantity: quantity,
                size: selectedSize?.size || null,
                price: getCurrentPrice()
            };
            
            console.log('Adding to cart:', cartItem);
            
            const result = await dispatch(addToCart(
                product._id, 
                quantity, 
                selectedSize?.size || null,
                getCurrentPrice()
            ));
            
            console.log('Add to cart result:', result);
            
            if (result.error) {
                toast.error(result.error.message || 'Failed to add to cart');
            } else {
                await dispatch(fetchCart());
                toast.success(`${product.name}${selectedSize ? ` (${selectedSize.size})` : ''} added to cart!`);
            }
        } catch (error) {
            console.error('Add to cart error:', error);
            toast.error('Failed to add to cart');
        } finally {
            setAdding(false);
        }
    };

    if (loading) {
        return (
            <div style={styles.center}>
                <FaSpinner style={styles.spinner} />
                <p>Loading product...</p>
            </div>
        );
    }

    if (!product) {
        return <div style={styles.center}>Product not found</div>;
    }

    const currentPrice = getCurrentPrice();
    const currentStock = getCurrentStock();

    return (
        <div style={styles.container}>
            <div style={styles.productContainer}>
                {/* Image Gallery */}
                <div style={styles.imageSection}>
                    <img 
                        src={getProductImage()} 
                        alt={product.name}
                        style={styles.mainImage}
                    />
                </div>
                
                {/* Product Info */}
                <div style={styles.infoSection}>
                    <h1 style={styles.name}>{product.name}</h1>
                    <div style={styles.rating}>
                        {[...Array(5)].map((_, i) => (
                            <FaStar
                                key={i}
                                style={styles.star}
                                color={i < Math.floor(product.rating) ? '#fbbf24' : '#e5e7eb'}
                            />
                        ))}
                        <span style={styles.reviewCount}>({product.numReviews} reviews)</span>
                    </div>
                    <p style={styles.category}>Category: {product.category}</p>
                    
                    {/* Size Selector - Show only if product has sizes */}
                    {product.hasSizes && product.sizes && product.sizes.length > 0 && (
                        <SizeSelector
                            sizes={product.sizes}
                            selectedSize={selectedSize}
                            onSizeChange={setSelectedSize}
                        />
                    )}
                    
                    <p style={styles.description}>{product.description}</p>
                    
                    <div style={styles.priceSection}>
                        <div style={styles.priceContainer}>
                            <label style={styles.priceLabel}>Price:</label>
                            <p style={styles.price}>${currentPrice.toFixed(2)}</p>
                        </div>
                        {product.hasSizes && (
                            <p style={styles.priceNote}>* Price varies by size</p>
                        )}
                    </div>
                    
                    <div style={styles.stockSection}>
                        <p style={currentStock > 0 ? styles.inStock : styles.outOfStock}>
                            {currentStock > 0 ? `✅ In Stock: ${currentStock} units` : '❌ Out of Stock'}
                        </p>
                    </div>
                    
                    {currentStock > 0 && (
                        <div style={styles.quantitySection}>
                            <label style={styles.label}>Quantity:</label>
                            <select 
                                value={quantity} 
                                onChange={(e) => setQuantity(Number(e.target.value))}
                                style={styles.select}
                            >
                                {[...Array(Math.min(10, currentStock))].map((_, i) => (
                                    <option key={i + 1} value={i + 1}>{i + 1}</option>
                                ))}
                            </select>
                        </div>
                    )}
                    
                    <div style={styles.buttonGroup}>
                        <button 
                            onClick={handleAddToCart}
                            disabled={currentStock === 0 || adding}
                            style={{
                                ...styles.addBtn,
                                ...(currentStock === 0 && styles.disabledBtn)
                            }}
                        >
                            <FaShoppingCart /> {adding ? 'Adding...' : 'Add to Cart'}
                        </button>
                    </div>
                    
                    <Link to="/products" style={styles.backBtn}>
                        ← Back to Products
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
        borderRadius: '1rem',
        padding: '30px',
        marginBottom: '30px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    },
    imageSection: {
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem',
    },
    mainImage: {
        width: '100%',
        height: '400px',
        objectFit: 'cover',
        borderRadius: '0.5rem',
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
    description: {
        color: '#555',
        lineHeight: '1.6',
    },
    priceSection: {
        marginTop: '10px',
        padding: '10px 0',
        borderTop: '1px solid #eee',
        borderBottom: '1px solid #eee',
    },
    priceContainer: {
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
    },
    priceLabel: {
        fontWeight: 'bold',
        color: '#333',
    },
    price: {
        fontSize: '1.5rem',
        fontWeight: 'bold',
        color: '#6366f1',
        margin: 0,
    },
    priceNote: {
        fontSize: '0.8rem',
        color: '#999',
        marginTop: '5px',
        fontStyle: 'italic',
    },
    stockSection: {
        marginTop: '5px',
    },
    inStock: {
        fontWeight: 'bold',
        color: '#10b981',
    },
    outOfStock: {
        fontWeight: 'bold',
        color: '#ef4444',
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
    buttonGroup: {
        display: 'flex',
        gap: '1rem',
        marginTop: '0.5rem',
    },
    addBtn: {
        flex: 1,
        padding: '12px',
        backgroundColor: '#6366f1',
        color: '#fff',
        border: 'none',
        borderRadius: '0.5rem',
        cursor: 'pointer',
        fontSize: '16px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '8px',
        transition: 'all 0.3s',
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
        borderRadius: '0.5rem',
        transition: 'all 0.3s',
    },
    center: {
        textAlign: 'center',
        padding: '50px',
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

export default ProductDetailsPage;