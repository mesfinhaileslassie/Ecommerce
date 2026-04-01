import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchProduct } from '../../redux/slices/productSlice';
import { addToCart } from '../../redux/slices/cartSlice';
import { fetchCart } from '../../redux/slices/cartSlice';
import Reviews from '../../components/Products/Reviews';
import toast from 'react-hot-toast';
import { FaStar, FaShoppingCart, FaHeart, FaRegHeart } from 'react-icons/fa';

const ProductDetailsPage = () => {
    const { id } = useParams();
    const dispatch = useDispatch();
    const { product, loading } = useSelector((state) => state.products);
    const { user } = useSelector((state) => state.auth);
    const [quantity, setQuantity] = useState(1);
    const [adding, setAdding] = useState(false);
    const [selectedImage, setSelectedImage] = useState(0);

    useEffect(() => {
        if (id) {
            dispatch(fetchProduct(id));
        }
    }, [dispatch, id]);

    // Get product image with fallback
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

    // Sample product images gallery
    const getGalleryImages = () => {
        const mainImage = getProductImage();
        return [
            mainImage,
            mainImage.replace('w=600', 'w=600&sat=-50'),
            mainImage.replace('w=600', 'w=600&bright=-20'),
        ];
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
        return (
            <div style={styles.center}>
                <div className="spinner"></div>
                <p>Loading product...</p>
            </div>
        );
    }

    if (!product) {
        return <div style={styles.center}>Product not found</div>;
    }

    const galleryImages = getGalleryImages();

    return (
        <div style={styles.container}>
            <div style={styles.productContainer}>
                {/* Image Gallery */}
                <div style={styles.imageSection}>
                    <img 
                        src={galleryImages[selectedImage]} 
                        alt={product.name}
                        style={styles.mainImage}
                    />
                    <div style={styles.thumbnailContainer}>
                        {galleryImages.map((img, index) => (
                            <img
                                key={index}
                                src={img}
                                alt={`${product.name} ${index + 1}`}
                                style={{
                                    ...styles.thumbnail,
                                    border: selectedImage === index ? '2px solid var(--primary)' : '2px solid transparent',
                                }}
                                onMouseEnter={() => setSelectedImage(index)}
                                onClick={() => setSelectedImage(index)}
                            />
                        ))}
                    </div>
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
                    <p style={styles.price}>${product.price.toFixed(2)}</p>
                    <p style={styles.description}>{product.description}</p>
                    <p style={styles.stock}>
                        {product.countInStock > 0 ? `✅ In Stock: ${product.countInStock} units` : '❌ Out of Stock'}
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
                    
                    <div style={styles.buttonGroup}>
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
        boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
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
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    },
    thumbnailContainer: {
        display: 'flex',
        gap: '0.5rem',
        justifyContent: 'center',
    },
    thumbnail: {
        width: '80px',
        height: '80px',
        objectFit: 'cover',
        borderRadius: '0.5rem',
        cursor: 'pointer',
        transition: 'all 0.3s',
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
        color: '#6366f1',
    },
    description: {
        color: '#555',
        lineHeight: '1.6',
    },
    stock: {
        fontWeight: 'bold',
        color: '#10b981',
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
};

export default ProductDetailsPage;