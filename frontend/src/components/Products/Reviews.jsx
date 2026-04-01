import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { FaStar } from 'react-icons/fa';
import toast from 'react-hot-toast';
import { fetchProductReviews, addProductReview } from '../../redux/slices/reviewSlice';

const Reviews = ({ productId }) => {
    const dispatch = useDispatch();
    const { user } = useSelector((state) => state.auth);
    const { reviews, rating, numReviews, loading } = useSelector((state) => state.reviews);
    const [userRating, setUserRating] = useState(0);
    const [comment, setComment] = useState('');
    const [hover, setHover] = useState(0);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        if (productId) {
            dispatch(fetchProductReviews(productId));
        }
    }, [dispatch, productId]);

    const handleSubmitReview = async (e) => {
        e.preventDefault();
        
        if (!user) {
            toast.error('Please login to leave a review');
            return;
        }
        
        if (userRating === 0) {
            toast.error('Please select a rating');
            return;
        }
        
        if (!comment.trim()) {
            toast.error('Please write a comment');
            return;
        }
        
        setSubmitting(true);
        
        try {
            const result = await dispatch(addProductReview(productId, userRating, comment));
            if (result.error) {
                toast.error(result.error.message);
            } else {
                toast.success('Review submitted successfully!');
                setUserRating(0);
                setComment('');
                // Refresh reviews
                dispatch(fetchProductReviews(productId));
            }
        } catch (error) {
            toast.error('Failed to submit review');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return <div style={styles.center}>Loading reviews...</div>;
    }

    return (
        <div style={styles.container}>
            <h3 style={styles.title}>Customer Reviews</h3>
            
            {/* Rating Summary */}
            <div style={styles.ratingSummary}>
                <div style={styles.averageRating}>
                    <span style={styles.averageNumber}>{rating.toFixed(1)}</span>
                    <div style={styles.stars}>
                        {[...Array(5)].map((_, i) => (
                            <FaStar
                                key={i}
                                style={styles.starLarge}
                                color={i < Math.floor(rating) ? '#ffc107' : '#e4e5e9'}
                            />
                        ))}
                    </div>
                    <span style={styles.reviewCountTotal}>Based on {numReviews} reviews</span>
                </div>
            </div>
            
            {/* Review Form */}
            {user && (
                <div style={styles.reviewForm}>
                    <h4>Write a Review</h4>
                    <div style={styles.starRating}>
                        {[...Array(5)].map((_, index) => {
                            const ratingValue = index + 1;
                            return (
                                <label key={index} style={styles.starLabel}>
                                    <input
                                        type="radio"
                                        name="rating"
                                        value={ratingValue}
                                        onClick={() => setUserRating(ratingValue)}
                                        style={styles.radioInput}
                                    />
                                    <FaStar
                                        style={styles.starInput}
                                        color={ratingValue <= (hover || userRating) ? '#ffc107' : '#e4e5e9'}
                                        onMouseEnter={() => setHover(ratingValue)}
                                        onMouseLeave={() => setHover(0)}
                                    />
                                </label>
                            );
                        })}
                        <span style={styles.ratingText}>{userRating} / 5</span>
                    </div>
                    <textarea
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        placeholder="Share your experience with this product..."
                        rows="4"
                        style={styles.textarea}
                    />
                    <button
                        onClick={handleSubmitReview}
                        disabled={submitting}
                        style={styles.submitBtn}
                    >
                        {submitting ? 'Submitting...' : 'Submit Review'}
                    </button>
                </div>
            )}
            
            {/* Reviews List */}
            <div style={styles.reviewsList}>
                {!user && reviews.length === 0 && (
                    <p style={styles.noReviews}>No reviews yet. <a href="/login">Login</a> to be the first to review!</p>
                )}
                {reviews.length === 0 && user && (
                    <p style={styles.noReviews}>No reviews yet. Be the first to review!</p>
                )}
                {reviews.map((review, index) => (
                    <div key={index} style={styles.reviewCard}>
                        <div style={styles.reviewHeader}>
                            <strong style={styles.reviewerName}>{review.name}</strong>
                            <div style={styles.reviewRating}>
                                {[...Array(5)].map((_, i) => (
                                    <FaStar
                                        key={i}
                                        style={styles.smallStar}
                                        color={i < review.rating ? '#ffc107' : '#e4e5e9'}
                                    />
                                ))}
                            </div>
                            <span style={styles.reviewDate}>
                                {new Date(review.createdAt).toLocaleDateString()}
                            </span>
                        </div>
                        <p style={styles.reviewComment}>{review.comment}</p>
                    </div>
                ))}
            </div>
        </div>
    );
};

const styles = {
    container: {
        marginTop: '40px',
        padding: '20px',
        backgroundColor: '#fff',
        borderRadius: '8px',
    },
    title: {
        marginBottom: '20px',
        fontSize: '1.5rem',
        color: '#333',
    },
    ratingSummary: {
        backgroundColor: '#f8f9fa',
        padding: '20px',
        borderRadius: '8px',
        marginBottom: '30px',
        textAlign: 'center',
    },
    averageRating: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '10px',
    },
    averageNumber: {
        fontSize: '3rem',
        fontWeight: 'bold',
        color: '#333',
    },
    stars: {
        display: 'flex',
        gap: '5px',
    },
    starLarge: {
        fontSize: '24px',
    },
    reviewCountTotal: {
        color: '#666',
        fontSize: '14px',
    },
    reviewForm: {
        backgroundColor: '#f8f9fa',
        padding: '20px',
        borderRadius: '8px',
        marginBottom: '30px',
    },
    starRating: {
        display: 'flex',
        alignItems: 'center',
        gap: '5px',
        marginBottom: '15px',
    },
    starLabel: {
        cursor: 'pointer',
    },
    radioInput: {
        display: 'none',
    },
    starInput: {
        fontSize: '28px',
        cursor: 'pointer',
        transition: 'color 0.2s',
    },
    ratingText: {
        marginLeft: '10px',
        color: '#666',
    },
    textarea: {
        width: '100%',
        padding: '12px',
        border: '1px solid #ddd',
        borderRadius: '5px',
        fontSize: '14px',
        marginBottom: '15px',
        fontFamily: 'inherit',
        resize: 'vertical',
    },
    submitBtn: {
        padding: '10px 24px',
        backgroundColor: '#007bff',
        color: '#fff',
        border: 'none',
        borderRadius: '5px',
        cursor: 'pointer',
        fontSize: '14px',
        transition: 'background-color 0.3s',
    },
    reviewsList: {
        marginTop: '20px',
    },
    reviewCard: {
        borderBottom: '1px solid #eee',
        padding: '20px 0',
    },
    reviewHeader: {
        display: 'flex',
        alignItems: 'center',
        gap: '15px',
        marginBottom: '10px',
        flexWrap: 'wrap',
    },
    reviewerName: {
        fontSize: '16px',
        color: '#333',
    },
    reviewRating: {
        display: 'flex',
        gap: '2px',
    },
    smallStar: {
        fontSize: '14px',
    },
    reviewDate: {
        color: '#999',
        fontSize: '12px',
    },
    reviewComment: {
        color: '#555',
        lineHeight: '1.6',
        marginTop: '8px',
    },
    noReviews: {
        color: '#999',
        textAlign: 'center',
        padding: '20px',
    },
    center: {
        textAlign: 'center',
        padding: '20px',
    },
};

export default Reviews;