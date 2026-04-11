import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { fetchWishlist, removeFromWishlist } from '../../redux/slices/wishlistSlice';
import { addToCart } from '../../redux/slices/cartSlice';
import { fetchCart } from '../../redux/slices/cartSlice';
import { FaHeart, FaShoppingCart, FaTrash, FaSpinner, FaShare, FaFacebook, FaTwitter, FaWhatsapp, FaTelegram, FaEnvelope, FaCopy } from 'react-icons/fa';
import toast from 'react-hot-toast';

const WishlistPage = () => {
    const dispatch = useDispatch();
    const { items, itemCount, loading } = useSelector((state) => state.wishlist);
    const { user } = useSelector((state) => state.auth);
    const [showShareModal, setShowShareModal] = React.useState(false);
    const [copied, setCopied] = React.useState(false);

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

    // Share Wishlist Functionality
    const getShareableLink = () => {
        const wishlistData = {
            items: items.map(item => ({
                name: item.product?.name,
                price: item.product?.price,
                category: item.product?.category
            })),
            user: user?.name,
            totalItems: items.length
        };
        
        // Encode the wishlist data to base64
        const encodedData = btoa(JSON.stringify(wishlistData));
        return `${window.location.origin}/shared-wishlist?data=${encodedData}`;
    };

    const shareOnFacebook = () => {
        const url = getShareableLink();
        const shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
        window.open(shareUrl, '_blank', 'width=600,height=400');
    };


    const shareOnTelegram = () => {
    const url = getShareableLink();
    const text = `Check out my wishlist on Habesha Market! I have ${items.length} items saved.`;
    const shareUrl = `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`;
    window.open(shareUrl, '_blank', 'width=600,height=400');
    };
    





    const shareOnTwitter = () => {
        const url = getShareableLink();
        const text = `Check out my wishlist on Habesha Market! I have ${items.length} items saved.`;
        const shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`;
        window.open(shareUrl, '_blank', 'width=600,height=400');
    };

    const shareOnWhatsApp = () => {
        const url = getShareableLink();
        const text = `Check out my wishlist on Habesha Market! I have ${items.length} items saved. ${url}`;
        const shareUrl = `https://wa.me/?text=${encodeURIComponent(text)}`;
        window.open(shareUrl, '_blank');
    };

    const shareViaEmail = () => {
        const url = getShareableLink();
        const subject = `My Wishlist on Habesha Market`;
        const body = `Check out my wishlist! I have ${items.length} items saved.\n\nView my wishlist here: ${url}`;
        window.location.href = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    };

    const copyToClipboard = async () => {
        const url = getShareableLink();
        await navigator.clipboard.writeText(url);
        setCopied(true);
        toast.success('Wishlist link copied to clipboard!');
        setTimeout(() => setCopied(false), 2000);
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
            <div style={styles.header}>
                <h1 style={styles.title}>My Wishlist</h1>
                <div style={styles.headerActions}>
                    <button onClick={() => setShowShareModal(true)} style={styles.shareBtn}>
                        <FaShare /> Share Wishlist
                    </button>
                </div>
            </div>
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

            {/* Share Modal */}
            {showShareModal && (
                <div style={styles.modal}>
                    <div style={styles.modalContent}>
                        <div style={styles.modalHeader}>
                            <h2>Share Your Wishlist</h2>
                            <button onClick={() => setShowShareModal(false)} style={styles.closeBtn}>×</button>
                        </div>
                        
                        <div style={styles.shareOptions}>
                            <button onClick={shareOnFacebook} style={styles.facebookBtn}>
                                <FaFacebook /> Facebook
                            </button>
                            <button onClick={shareOnTwitter} style={styles.twitterBtn}>
                                <FaTwitter /> Twitter
                            </button>
                            <button onClick={shareOnWhatsApp} style={styles.whatsappBtn}>
                                <FaWhatsapp /> WhatsApp
                            </button>
                            <button onClick={shareViaEmail} style={styles.emailBtn}>
                                <FaEnvelope /> Email
                            </button>

                            <button onClick={shareOnTelegram} style={styles.telegramBtn}>
                                <FaTelegram /> Telegram
                            </button>

                            <button onClick={copyToClipboard} style={styles.copyBtn}>
                                <FaCopy /> {copied ? 'Copied!' : 'Copy Link'}
                            </button>
                        </div>
                        
                        <div style={styles.shareLinkContainer}>
                            <input 
                                type="text" 
                                value={getShareableLink()} 
                                readOnly 
                                style={styles.shareLinkInput}
                            />
                        </div>
                        
                        <p style={styles.shareNote}>
                            Share this link with friends and family to show them your favorite items!
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
};

const styles = {
    container: {
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '20px',
    },
    header: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '10px',
        flexWrap: 'wrap',
        gap: '15px',
    },
    title: {
        fontSize: '2rem',
        color: '#333',
        margin: 0,
    },
    headerActions: {
        display: 'flex',
        gap: '10px',
    },
    shareBtn: {
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        padding: '10px 20px',
        backgroundColor: '#6366f1',
        color: '#fff',
        border: 'none',
        borderRadius: '0.5rem',
        cursor: 'pointer',
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
    modal: {
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.5)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1000,
    },
    modalContent: {
        backgroundColor: '#fff',
        borderRadius: '1rem',
        padding: '30px',
        width: '90%',
        maxWidth: '500px',
    },
    modalHeader: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '20px',
    },
    closeBtn: {
        background: 'none',
        border: 'none',
        fontSize: '28px',
        cursor: 'pointer',
        color: '#999',
    },
    shareOptions: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
        gap: '10px',
        marginBottom: '20px',
    },
    facebookBtn: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '8px',
        padding: '10px',
        backgroundColor: '#1877f2',
        color: '#fff',
        border: 'none',
        borderRadius: '5px',
        cursor: 'pointer',
    },

    telegramBtn: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    padding: '10px',
    backgroundColor: '#0088cc',
    color: '#fff',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
    },

    twitterBtn: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '8px',
        padding: '10px',
        backgroundColor: '#1da1f2',
        color: '#fff',
        border: 'none',
        borderRadius: '5px',
        cursor: 'pointer',
    },
    whatsappBtn: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '8px',
        padding: '10px',
        backgroundColor: '#25d366',
        color: '#fff',
        border: 'none',
        borderRadius: '5px',
        cursor: 'pointer',
    },
    emailBtn: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '8px',
        padding: '10px',
        backgroundColor: '#ea4335',
        color: '#fff',
        border: 'none',
        borderRadius: '5px',
        cursor: 'pointer',
    },
    copyBtn: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '8px',
        padding: '10px',
        backgroundColor: '#6c757d',
        color: '#fff',
        border: 'none',
        borderRadius: '5px',
        cursor: 'pointer',
    },
    shareLinkContainer: {
        marginTop: '20px',
        padding: '15px',
        backgroundColor: '#f8f9fa',
        borderRadius: '8px',
    },
    shareLinkInput: {
        width: '100%',
        padding: '8px',
        border: '1px solid #ddd',
        borderRadius: '5px',
        fontSize: '12px',
        backgroundColor: '#fff',
    },
    shareNote: {
        marginTop: '15px',
        fontSize: '12px',
        color: '#666',
        textAlign: 'center',
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

export default WishlistPage;