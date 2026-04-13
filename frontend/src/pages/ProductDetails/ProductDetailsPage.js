import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchProduct } from '../../redux/slices/productSlice';
import { addToCart } from '../../redux/slices/cartSlice';
import { fetchCart } from '../../redux/slices/cartSlice';
import Reviews from '../../components/Products/Reviews';
import SizeSelector from '../../components/Products/SizeSelector';
import ProductRecommendations from '../../components/Products/ProductRecommendations';
import HelmetSEO from '../../components/SEO/HelmetSEO';
import toast from 'react-hot-toast';
import { FaStar, FaShoppingCart, FaSpinner, FaArrowLeft } from 'react-icons/fa';
import api from '../../services/api';

const ProductDetailsPage = () => {
    const { id } = useParams();
    const dispatch = useDispatch();
    const { product, loading } = useSelector((state) => state.products);
    const { user } = useSelector((state) => state.auth);
    const [quantity, setQuantity] = useState(1);
    const [adding, setAdding] = useState(false);
    const [selectedSize, setSelectedSize] = useState(null);
    const [selectedImage, setSelectedImage] = useState(0);

    useEffect(() => {
        if (id) {
            dispatch(fetchProduct(id));
        }
    }, [dispatch, id]);

    // Reset selected size when product changes
    useEffect(() => {
        if (product) {
            if (product.hasSizes && product.sizes && product.sizes.length > 0) {
                const availableSize = product.sizes.find(s => s.countInStock > 0);
                setSelectedSize(availableSize || product.sizes[0]);
            } else {
                setSelectedSize(null);
            }
            setQuantity(1);
        }
    }, [product]);

    // Track recently viewed product
    useEffect(() => {
        if (product && user) {
            api.post('/products/recently-viewed', { productId: product._id })
                .catch(err => console.error('Failed to track view:', err));
        }
    }, [product, user]);

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
            await dispatch(addToCart(product._id, quantity, selectedSize?.size || null, getCurrentPrice()));
            await dispatch(fetchCart());
            toast.success(`${product.name}${selectedSize ? ` (${selectedSize.size})` : ''} added to cart!`);
        } catch (error) {
            toast.error('Failed to add to cart');
        } finally {
            setAdding(false);
        }
    };

    if (loading) {
        return (
            <div className="product-details-center">
                <FaSpinner className="product-details-spinner" />
                <p>Loading product...</p>
            </div>
        );
    }

    if (!product) {
        return <div className="product-details-center">Product not found</div>;
    }

    const currentPrice = getCurrentPrice();
    const currentStock = getCurrentStock();

    return (
        <>
            <HelmetSEO 
                title={product.name}
                description={product.description?.substring(0, 160) || `Buy ${product.name} online at best price. Shop now for quality ${product.category} products with fast delivery.`}
                keywords={`${product.name}, buy ${product.name}, ${product.category}, online shopping, best price ${product.name}`}
                image={product.imageUrl}
                type="product"
                price={currentPrice}
                currency="USD"
                availability={currentStock > 0 ? 'in_stock' : 'out_of_stock'}
                tags={[product.category, product.name]}
                url={`https://yourshop.com/products/${product._id}`}
            />
            
            <div className="product-details-container">
                <Link to="/products" className="product-details-back-link">
                    <FaArrowLeft /> Back to Products
                </Link>
                
                <div className="product-details-main">
                    {/* Image Gallery */}
                    <div className="product-details-image-section">
                        <img 
                            src={getProductImage()} 
                            alt={product.name}
                            className="product-details-main-image"
                        />
                    </div>
                    
                    {/* Product Info */}
                    <div className="product-details-info-section">
                        <h1 className="product-details-name">{product.name}</h1>
                        <div className="product-details-rating">
                            {[...Array(5)].map((_, i) => (
                                <FaStar
                                    key={i}
                                    className="product-details-star"
                                    color={i < Math.floor(product.rating) ? '#fbbf24' : '#e5e7eb'}
                                />
                            ))}
                            <span className="product-details-review-count">({product.numReviews} reviews)</span>
                        </div>
                        <p className="product-details-category">Category: {product.category}</p>
                        
                        {/* Size Selector */}
                        {product.hasSizes && product.sizes && product.sizes.length > 0 && (
                            <SizeSelector
                                sizes={product.sizes}
                                selectedSize={selectedSize}
                                onSizeChange={setSelectedSize}
                            />
                        )}
                        
                        <p className="product-details-description">{product.description}</p>
                        
                        <div className="product-details-price-section">
                            <div className="product-details-price-container">
                                <label className="product-details-price-label">Price:</label>
                                <p className="product-details-price">${currentPrice.toFixed(2)}</p>
                            </div>
                            {product.hasSizes && (
                                <p className="product-details-price-note">* Price varies by size</p>
                            )}
                        </div>
                        
                        <div className="product-details-stock-section">
                            <p className={currentStock > 0 ? "product-details-in-stock" : "product-details-out-of-stock"}>
                                {currentStock > 0 ? `✅ In Stock: ${currentStock} units` : '❌ Out of Stock'}
                            </p>
                        </div>
                        
                        {currentStock > 0 && (
                            <div className="product-details-quantity-section">
                                <label className="product-details-label">Quantity:</label>
                                <select 
                                    value={quantity} 
                                    onChange={(e) => setQuantity(Number(e.target.value))}
                                    className="product-details-select"
                                >
                                    {[...Array(Math.min(10, currentStock))].map((_, i) => (
                                        <option key={i + 1} value={i + 1}>{i + 1}</option>
                                    ))}
                                </select>
                            </div>
                        )}
                        
                        <div className="product-details-button-group">
                            <button 
                                onClick={handleAddToCart}
                                disabled={currentStock === 0 || adding}
                                className={`product-details-add-btn ${currentStock === 0 ? 'product-details-disabled-btn' : ''}`}
                            >
                                <FaShoppingCart /> {adding ? 'Adding...' : 'Add to Cart'}
                            </button>
                        </div>
                    </div>
                </div>
                
                {/* Reviews Section */}
                <Reviews productId={product._id} />
                
                {/* Product Recommendations */}
                <ProductRecommendations 
                    type="similar" 
                    productId={product._id} 
                    title="You Might Also Like" 
                    limit={4} 
                />
                
                <ProductRecommendations 
                    type="bought-together" 
                    productId={product._id} 
                    title="Frequently Bought Together" 
                    limit={4} 
                />
            </div>
        </>
    );
};

// Inject CSS Styles for ProductDetailsPage
const styleSheet = document.createElement("style");
styleSheet.textContent = `
    @keyframes productDetailsSpin {
        from { transform: rotate(0deg); }
        to { transform: rotate(360deg); }
    }
    
    .product-details-center {
        text-align: center;
        padding: 50px;
        color: var(--text-primary, #333);
    }
    
    .product-details-spinner {
        animation: productDetailsSpin 1s linear infinite;
        font-size: 2rem;
        color: #6366f1;
        margin-bottom: 1rem;
    }
    
    .product-details-container {
        max-width: 1200px;
        margin: 0 auto;
        padding: 20px;
    }
    
    .product-details-back-link {
        display: inline-flex;
        align-items: center;
        gap: 8px;
        color: var(--text-secondary, #666);
        text-decoration: none;
        margin-bottom: 20px;
        transition: color 0.3s;
    }
    
    .product-details-back-link:hover {
        color: #6366f1;
    }
    
    body.dark-mode .product-details-back-link {
        color: #a0a0a0;
    }
    
    body.dark-mode .product-details-back-link:hover {
        color: #a5b4fc;
    }
    
    .product-details-main {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 40px;
        background-color: var(--card-bg, #fff);
        border-radius: 1rem;
        padding: 30px;
        margin-bottom: 30px;
        box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        border: 1px solid var(--border-color, #e5e7eb);
    }
    
    .product-details-image-section {
        display: flex;
        flex-direction: column;
        gap: 1rem;
    }
    
    .product-details-main-image {
        width: 100%;
        height: 400px;
        object-fit: cover;
        border-radius: 0.5rem;
    }
    
    .product-details-info-section {
        display: flex;
        flex-direction: column;
        gap: 15px;
    }
    
    .product-details-name {
        font-size: 1.8rem;
        color: var(--text-primary, #333);
        margin: 0;
    }
    
    .product-details-rating {
        display: flex;
        align-items: center;
        gap: 5px;
    }
    
    .product-details-star {
        font-size: 18px;
    }
    
    .product-details-review-count {
        color: var(--text-secondary, #666);
        font-size: 14px;
        margin-left: 5px;
    }
    
    .product-details-category {
        color: var(--text-secondary, #666);
    }
    
    .product-details-description {
        color: var(--text-primary, #555);
        line-height: 1.6;
    }
    
    body.dark-mode .product-details-description {
        color: #d1d5db;
    }
    
    .product-details-price-section {
        margin-top: 10px;
        padding: 10px 0;
        border-top: 1px solid var(--border-color, #eee);
        border-bottom: 1px solid var(--border-color, #eee);
    }
    
    .product-details-price-container {
        display: flex;
        align-items: center;
        gap: 10px;
    }
    
    .product-details-price-label {
        font-weight: bold;
        color: var(--text-primary, #333);
    }
    
    .product-details-price {
        font-size: 1.5rem;
        font-weight: bold;
        color: #6366f1;
        margin: 0;
    }
    
    .product-details-price-note {
        font-size: 0.8rem;
        color: var(--text-secondary, #999);
        margin-top: 5px;
        font-style: italic;
    }
    
    .product-details-stock-section {
        margin-top: 5px;
    }
    
    .product-details-in-stock {
        font-weight: bold;
        color: #10b981;
    }
    
    .product-details-out-of-stock {
        font-weight: bold;
        color: #ef4444;
    }
    
    .product-details-quantity-section {
        display: flex;
        align-items: center;
        gap: 15px;
    }
    
    .product-details-label {
        font-weight: bold;
        color: var(--text-primary, #333);
    }
    
    .product-details-select {
        padding: 8px;
        border: 1px solid var(--border-color, #ddd);
        border-radius: 5px;
        background-color: var(--input-bg, #fff);
        color: var(--text-primary, #333);
    }
    
    .product-details-button-group {
        display: flex;
        gap: 1rem;
        margin-top: 0.5rem;
    }
    
    .product-details-add-btn {
        flex: 1;
        padding: 12px;
        background: linear-gradient(135deg, #4f46e5, #6366f1);
        color: #fff;
        border: none;
        border-radius: 0.5rem;
        cursor: pointer;
        font-size: 16px;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
        transition: all 0.3s;
    }
    
    .product-details-add-btn:hover:not(:disabled) {
        background: linear-gradient(135deg, #4338ca, #4f46e5);
        transform: translateY(-2px);
    }
    
    .product-details-disabled-btn {
        background-color: #ccc !important;
        cursor: not-allowed !important;
        opacity: 0.6;
    }
    
    body.dark-mode .product-details-disabled-btn {
        background-color: #374151 !important;
    }
    
    /* Responsive */
    @media (max-width: 768px) {
        .product-details-main {
            grid-template-columns: 1fr;
            gap: 20px;
            padding: 20px;
        }
        
        .product-details-name {
            font-size: 1.4rem;
        }
        
        .product-details-main-image {
            height: 300px;
        }
        
        .product-details-container {
            padding: 15px;
        }
    }
    
    @media (max-width: 480px) {
        .product-details-main-image {
            height: 250px;
        }
        
        .product-details-name {
            font-size: 1.2rem;
        }
        
        .product-details-price {
            font-size: 1.2rem;
        }
        
        .product-details-quantity-section {
            flex-wrap: wrap;
        }
    }
`;
document.head.appendChild(styleSheet);

export default ProductDetailsPage;