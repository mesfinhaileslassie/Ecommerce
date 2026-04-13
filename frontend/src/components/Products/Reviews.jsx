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
        return <div className="reviews-center">Loading reviews...</div>;
    }

    return (
        <div className="reviews-container">
            <h3 className="reviews-title">Customer Reviews</h3>
            
            {/* Rating Summary */}
            <div className="reviews-rating-summary">
                <div className="reviews-average-rating">
                    <span className="reviews-average-number">{rating.toFixed(1)}</span>
                    <div className="reviews-stars">
                        {[...Array(5)].map((_, i) => (
                            <FaStar
                                key={i}
                                className="reviews-star-large"
                                color={i < Math.floor(rating) ? '#ffc107' : '#e4e5e9'}
                            />
                        ))}
                    </div>
                    <span className="reviews-review-count-total">Based on {numReviews} reviews</span>
                </div>
            </div>
            
            {/* Review Form */}
            {user && (
                <div className="reviews-form">
                    <h4>Write a Review</h4>
                    <div className="reviews-star-rating">
                        {[...Array(5)].map((_, index) => {
                            const ratingValue = index + 1;
                            return (
                                <label key={index} className="reviews-star-label">
                                    <input
                                        type="radio"
                                        name="rating"
                                        value={ratingValue}
                                        onClick={() => setUserRating(ratingValue)}
                                        className="reviews-radio-input"
                                    />
                                    <FaStar
                                        className="reviews-star-input"
                                        color={ratingValue <= (hover || userRating) ? '#ffc107' : '#e4e5e9'}
                                        onMouseEnter={() => setHover(ratingValue)}
                                        onMouseLeave={() => setHover(0)}
                                    />
                                </label>
                            );
                        })}
                        <span className="reviews-rating-text">{userRating} / 5</span>
                    </div>
                    <textarea
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        placeholder="Share your experience with this product..."
                        rows="4"
                        className="reviews-textarea"
                    />
                    <button
                        onClick={handleSubmitReview}
                        disabled={submitting}
                        className="reviews-submit-btn"
                    >
                        {submitting ? 'Submitting...' : 'Submit Review'}
                    </button>
                </div>
            )}
            
            {/* Reviews List */}
            <div className="reviews-list">
                {!user && reviews.length === 0 && (
                    <p className="reviews-no-reviews">
                        No reviews yet. <a href="/login" className="reviews-login-link">Login</a> to be the first to review!
                    </p>
                )}
                {reviews.length === 0 && user && (
                    <p className="reviews-no-reviews">No reviews yet. Be the first to review!</p>
                )}
                {reviews.map((review, index) => (
                    <div key={index} className="reviews-card">
                        <div className="reviews-card-header">
                            <strong className="reviews-reviewer-name">{review.name}</strong>
                            <div className="reviews-card-rating">
                                {[...Array(5)].map((_, i) => (
                                    <FaStar
                                        key={i}
                                        className="reviews-small-star"
                                        color={i < review.rating ? '#ffc107' : '#e4e5e9'}
                                    />
                                ))}
                            </div>
                            <span className="reviews-review-date">
                                {new Date(review.createdAt).toLocaleDateString()}
                            </span>
                        </div>
                        <p className="reviews-review-comment">{review.comment}</p>
                    </div>
                ))}
            </div>
        </div>
    );
};

// Inject CSS Styles for Reviews
const styleSheet = document.createElement("style");
styleSheet.textContent = `
    /* Reviews Component Styles - Dark Mode Compatible */
    
    .reviews-center {
        text-align: center;
        padding: 20px;
        color: var(--text-secondary, #666);
    }
    
    .reviews-container {
        margin-top: 40px;
        padding: 20px;
        background-color: var(--card-bg, #fff);
        border-radius: 8px;
        border: 1px solid var(--border-color, #e5e7eb);
    }
    
    .reviews-title {
        margin-bottom: 20px;
        font-size: 1.5rem;
        color: var(--text-primary, #333);
    }
    
    .reviews-rating-summary {
        background-color: var(--bg-secondary, #f8f9fa);
        padding: 20px;
        border-radius: 8px;
        margin-bottom: 30px;
        text-align: center;
        border: 1px solid var(--border-color, #e5e7eb);
    }
    
    body.dark-mode .reviews-rating-summary {
        background-color: #1a1a1a;
        border-color: #333333;
    }
    
    .reviews-average-rating {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 10px;
    }
    
    .reviews-average-number {
        font-size: 3rem;
        font-weight: bold;
        color: var(--text-primary, #333);
    }
    
    body.dark-mode .reviews-average-number {
        color: #ffffff;
    }
    
    .reviews-stars {
        display: flex;
        gap: 5px;
    }
    
    .reviews-star-large {
        font-size: 24px;
    }
    
    .reviews-review-count-total {
        color: var(--text-secondary, #666);
        font-size: 14px;
    }
    
    .reviews-form {
        background-color: var(--bg-secondary, #f8f9fa);
        padding: 20px;
        border-radius: 8px;
        margin-bottom: 30px;
        border: 1px solid var(--border-color, #e5e7eb);
    }
    
    body.dark-mode .reviews-form {
        background-color: #1a1a1a;
        border-color: #333333;
    }
    
    .reviews-form h4 {
        color: var(--text-primary, #333);
        margin-bottom: 15px;
    }
    
    body.dark-mode .reviews-form h4 {
        color: #ffffff;
    }
    
    .reviews-star-rating {
        display: flex;
        align-items: center;
        gap: 5px;
        margin-bottom: 15px;
        flex-wrap: wrap;
    }
    
    .reviews-star-label {
        cursor: pointer;
    }
    
    .reviews-radio-input {
        display: none;
    }
    
    .reviews-star-input {
        font-size: 28px;
        cursor: pointer;
        transition: color 0.2s;
    }
    
    .reviews-star-input:hover {
        transform: scale(1.1);
    }
    
    .reviews-rating-text {
        margin-left: 10px;
        color: var(--text-secondary, #666);
    }
    
    .reviews-textarea {
        width: 100%;
        padding: 12px;
        border: 1px solid var(--border-color, #ddd);
        border-radius: 5px;
        font-size: 14px;
        margin-bottom: 15px;
        font-family: inherit;
        resize: vertical;
        background-color: var(--input-bg, #fff);
        color: var(--text-primary, #333);
    }
    
    .reviews-textarea:focus {
        outline: none;
        border-color: #6366f1;
    }
    
    .reviews-submit-btn {
        padding: 10px 24px;
        background: linear-gradient(135deg, #4f46e5, #6366f1);
        color: #fff;
        border: none;
        border-radius: 5px;
        cursor: pointer;
        font-size: 14px;
        transition: all 0.3s;
    }
    
    .reviews-submit-btn:hover:not(:disabled) {
        transform: translateY(-2px);
        background: linear-gradient(135deg, #4338ca, #4f46e5);
    }
    
    .reviews-submit-btn:disabled {
        opacity: 0.6;
        cursor: not-allowed;
    }
    
    .reviews-list {
        margin-top: 20px;
    }
    
    .reviews-card {
        border-bottom: 1px solid var(--border-color, #eee);
        padding: 20px 0;
    }
    
    body.dark-mode .reviews-card {
        border-bottom-color: #333333;
    }
    
    .reviews-card:last-child {
        border-bottom: none;
    }
    
    .reviews-card-header {
        display: flex;
        align-items: center;
        gap: 15px;
        margin-bottom: 10px;
        flex-wrap: wrap;
    }
    
    .reviews-reviewer-name {
        font-size: 16px;
        color: var(--text-primary, #333);
    }
    
    body.dark-mode .reviews-reviewer-name {
        color: #ffffff;
    }
    
    .reviews-card-rating {
        display: flex;
        gap: 2px;
    }
    
    .reviews-small-star {
        font-size: 14px;
    }
    
    .reviews-review-date {
        color: var(--text-secondary, #999);
        font-size: 12px;
    }
    
    .reviews-review-comment {
        color: var(--text-primary, #555);
        line-height: 1.6;
        margin-top: 8px;
    }
    
    body.dark-mode .reviews-review-comment {
        color: #d1d5db;
    }
    
    .reviews-no-reviews {
        color: var(--text-secondary, #999);
        text-align: center;
        padding: 20px;
    }
    
    .reviews-login-link {
        color: #6366f1;
        text-decoration: none;
    }
    
    .reviews-login-link:hover {
        text-decoration: underline;
    }
    
    /* Responsive */
    @media (max-width: 768px) {
        .reviews-container {
            padding: 15px;
            margin-top: 30px;
        }
        
        .reviews-title {
            font-size: 1.2rem;
        }
        
        .reviews-average-number {
            font-size: 2rem;
        }
        
        .reviews-star-large {
            font-size: 18px;
        }
        
        .reviews-star-input {
            font-size: 22px;
        }
        
        .reviews-card-header {
            gap: 10px;
        }
    }
    
    @media (max-width: 480px) {
        .reviews-container {
            padding: 12px;
            margin-top: 20px;
        }
        
        .reviews-rating-summary,
        .reviews-form {
            padding: 15px;
        }
        
        .reviews-card-header {
            flex-direction: column;
            align-items: flex-start;
        }
    }
`;
document.head.appendChild(styleSheet);

export default Reviews;