import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { register } from '../../redux/slices/authSlice';
import { GoogleLogin, GoogleOAuthProvider } from '@react-oauth/google';
import toast from 'react-hot-toast';
import api from '../../services/api';

const RegisterPageContent = () => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});
    const dispatch = useDispatch();
    const navigate = useNavigate();

    // Email validation function
    const isValidEmail = (email) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    };

    const validateForm = () => {
        const newErrors = {};
        
        if (!name.trim()) {
            newErrors.name = 'Full name is required';
        } else if (name.length < 2) {
            newErrors.name = 'Name must be at least 2 characters';
        }
        
        if (!email) {
            newErrors.email = 'Email is required';
        } else if (!isValidEmail(email)) {
            newErrors.email = 'Please enter a valid email address (e.g., name@example.com)';
        }
        
        if (!password) {
            newErrors.password = 'Password is required';
        } else if (password.length < 6) {
            newErrors.password = 'Password must be at least 6 characters';
        }
        
        if (!confirmPassword) {
            newErrors.confirmPassword = 'Please confirm your password';
        } else if (password !== confirmPassword) {
            newErrors.confirmPassword = 'Passwords do not match';
        }
        
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!validateForm()) {
            return;
        }

        setLoading(true);

        try {
            const result = await dispatch(register(name, email, password));
            
            if (result.error) {
                const errorMessage = result.error.message || 'Registration failed';
                if (errorMessage.includes('already exists')) {
                    toast.error('An account with this email already exists. Please login instead.');
                    setErrors({ email: 'An account with this email already exists' });
                } else if (errorMessage.includes('valid email')) {
                    toast.error('Please enter a valid email address');
                    setErrors({ email: 'Please enter a valid email address' });
                } else {
                    toast.error(errorMessage);
                }
            } else {
                toast.success('Registration successful! Please login');
                navigate('/login');
            }
        } catch (error) {
            console.error('Registration error:', error);
            toast.error(error.message || 'Registration failed');
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleSuccess = async (credentialResponse) => {
        console.log('Google signup success:', credentialResponse);
        const { credential } = credentialResponse;
        
        try {
            const { data } = await api.post('/auth/google', { token: credential });
            
            if (data.success) {
                dispatch({ type: 'auth/loginSuccess', payload: data });
                toast.success('Registration and login successful!');
                navigate('/');
            } else {
                toast.error(data.message || 'Google registration failed');
            }
        } catch (error) {
            console.error('Google registration error:', error);
            toast.error(error.response?.data?.message || 'Google registration failed');
        }
    };

    const handleGoogleFailure = (error) => {
        console.error('Google registration failed:', error);
        toast.error('Google registration was unsuccessful. Please try again.');
    };

    const googleClientId = process.env.REACT_APP_GOOGLE_CLIENT_ID;
    const isGoogleConfigured = googleClientId && googleClientId !== 'your_google_client_id_here';

    return (
        <div className="register-container">
            <div className="register-form-container">
                <h1 className="register-title">Create Account</h1>
                
                <form onSubmit={handleSubmit} className="register-form">
                    <div className="register-input-group">
                        <label className="register-label">Full Name</label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => {
                                setName(e.target.value);
                                if (errors.name) setErrors({ ...errors, name: '' });
                            }}
                            className={`register-input ${errors.name ? 'register-input-error' : ''}`}
                            placeholder="Enter your full name"
                        />
                        {errors.name && <span className="register-error-text">{errors.name}</span>}
                    </div>
                    
                    <div className="register-input-group">
                        <label className="register-label">Email</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => {
                                setEmail(e.target.value);
                                if (errors.email) setErrors({ ...errors, email: '' });
                            }}
                            className={`register-input ${errors.email ? 'register-input-error' : ''}`}
                            placeholder="Enter your email"
                        />
                        {errors.email && <span className="register-error-text">{errors.email}</span>}
                        <small className="register-hint-text">Enter a valid email address (e.g., name@example.com)</small>
                    </div>
                    
                    <div className="register-input-group">
                        <label className="register-label">Password</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => {
                                setPassword(e.target.value);
                                if (errors.password) setErrors({ ...errors, password: '' });
                            }}
                            className={`register-input ${errors.password ? 'register-input-error' : ''}`}
                            placeholder="Create a password (min 6 characters)"
                        />
                        {errors.password && <span className="register-error-text">{errors.password}</span>}
                    </div>
                    
                    <div className="register-input-group">
                        <label className="register-label">Confirm Password</label>
                        <input
                            type="password"
                            value={confirmPassword}
                            onChange={(e) => {
                                setConfirmPassword(e.target.value);
                                if (errors.confirmPassword) setErrors({ ...errors, confirmPassword: '' });
                            }}
                            className={`register-input ${errors.confirmPassword ? 'register-input-error' : ''}`}
                            placeholder="Confirm your password"
                        />
                        {errors.confirmPassword && <span className="register-error-text">{errors.confirmPassword}</span>}
                    </div>
                    
                    <button 
                        type="submit" 
                        className="register-button"
                        disabled={loading}
                    >
                        {loading ? 'Creating Account...' : 'Sign Up'}
                    </button>
                </form>
                
                <div className="register-divider">
                    <span>OR</span>
                </div>
                
                {isGoogleConfigured ? (
                    <div className="register-google-button-wrapper">
                        <GoogleLogin
                            onSuccess={handleGoogleSuccess}
                            onError={handleGoogleFailure}
                            useOneTap={false}
                            theme="outline"
                            size="large"
                            text="signup_with"
                            shape="rectangular"
                            width="100%"
                            logo_alignment="center"
                        />
                    </div>
                ) : (
                    <div className="register-google-unavailable">
                        <p>Google Sign Up is not configured. Please contact support.</p>
                    </div>
                )}
                
                <p className="register-login-link">
                    Already have an account? <Link to="/login">Login here</Link>
                </p>
            </div>
        </div>
    );
};

const RegisterPage = () => {
    const googleClientId = process.env.REACT_APP_GOOGLE_CLIENT_ID;
    
    // If Google Client ID is not configured, show register without Google
    if (!googleClientId || googleClientId === 'your_google_client_id_here') {
        console.warn("REACT_APP_GOOGLE_CLIENT_ID is not set. Google registration will not be available.");
        return <RegisterPageContent />;
    }

    return (
        <GoogleOAuthProvider clientId={googleClientId}>
            <RegisterPageContent />
        </GoogleOAuthProvider>
    );
};

// Inject CSS Styles for RegisterPage
const styleSheet = document.createElement("style");
styleSheet.textContent = `
    /* Register Page Styles - Dark Mode Compatible */
    
    .register-container {
        display: flex;
        justify-content: center;
        align-items: center;
        min-height: calc(100vh - 100px);
        padding: 20px;
        background-color: var(--bg-body, #f5f7fa);
    }
    
    body.dark-mode .register-container {
        background-color: #0a0a0a;
    }
    
    .register-form-container {
        background-color: var(--card-bg, #fff);
        padding: 40px;
        border-radius: 8px;
        box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        width: 100%;
        max-width: 450px;
        border: 1px solid var(--border-color, #e5e7eb);
    }
    
    body.dark-mode .register-form-container {
        background-color: #1a1a1a;
        border-color: #333333;
    }
    
    .register-title {
        text-align: center;
        margin-bottom: 30px;
        color: var(--text-primary, #333);
        font-size: 1.8rem;
    }
    
    body.dark-mode .register-title {
        color: #ffffff;
    }
    
    .register-form {
        display: flex;
        flex-direction: column;
        gap: 20px;
    }
    
    .register-input-group {
        display: flex;
        flex-direction: column;
        gap: 5px;
    }
    
    .register-label {
        font-weight: 500;
        color: var(--text-primary, #555);
        font-size: 0.9rem;
    }
    
    body.dark-mode .register-label {
        color: #d1d5db;
    }
    
    .register-input {
        padding: 10px;
        border: 1px solid var(--border-color, #ddd);
        border-radius: 5px;
        font-size: 16px;
        transition: border-color 0.3s, box-shadow 0.3s;
        background-color: var(--input-bg, #fff);
        color: var(--text-primary, #333);
    }
    
    .register-input:focus {
        outline: none;
        border-color: #6366f1;
        box-shadow: 0 0 0 2px rgba(99, 102, 241, 0.1);
    }
    
    body.dark-mode .register-input {
        background-color: #0a0a0a;
        border-color: #444444;
        color: #ffffff;
    }
    
    .register-input-error {
        border-color: #dc3545;
        background-color: #fff8f8;
    }
    
    body.dark-mode .register-input-error {
        border-color: #ef4444;
        background-color: rgba(239, 68, 68, 0.1);
    }
    
    .register-error-text {
        color: #dc3545;
        font-size: 0.75rem;
        margin-top: 3px;
    }
    
    body.dark-mode .register-error-text {
        color: #f87171;
    }
    
    .register-hint-text {
        color: var(--text-secondary, #999);
        font-size: 0.7rem;
        margin-top: 3px;
    }
    
    body.dark-mode .register-hint-text {
        color: #888888;
    }
    
    .register-button {
        padding: 12px;
        background: linear-gradient(135deg, #059669, #10b981);
        color: #fff;
        border: none;
        border-radius: 5px;
        font-size: 16px;
        cursor: pointer;
        margin-top: 10px;
        transition: all 0.3s;
    }
    
    .register-button:hover:not(:disabled) {
        transform: translateY(-2px);
        background: linear-gradient(135deg, #047857, #059669);
        box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
    }
    
    .register-button:disabled {
        opacity: 0.6;
        cursor: not-allowed;
    }
    
    .register-divider {
        text-align: center;
        margin: 25px 0 20px;
        color: var(--text-secondary, #999);
        position: relative;
        font-size: 0.9rem;
    }
    
    body.dark-mode .register-divider {
        color: #888888;
    }
    
    .register-divider::before,
    .register-divider::after {
        content: '';
        position: absolute;
        top: 50%;
        width: 45%;
        height: 1px;
        background-color: var(--border-color, #ddd);
    }
    
    .register-divider::before {
        left: 0;
    }
    
    .register-divider::after {
        right: 0;
    }
    
    body.dark-mode .register-divider::before,
    body.dark-mode .register-divider::after {
        background-color: #333333;
    }
    
    .register-google-button-wrapper {
        margin-top: 10px;
        display: flex;
        justify-content: center;
        width: 100%;
    }
    
    .register-google-unavailable {
        text-align: center;
        padding: 12px;
        background-color: #fef3c7;
        color: #92400e;
        border-radius: 5px;
        font-size: 0.8rem;
        margin-top: 10px;
    }
    
    body.dark-mode .register-google-unavailable {
        background-color: #7f5f00;
        color: #ffd966;
    }
    
    /* Style Google button for dark mode */
    body.dark-mode .register-google-button-wrapper div[role="button"] {
        background-color: #1a1a1a !important;
        border-color: #333333 !important;
    }
    
    body.dark-mode .register-google-button-wrapper span {
        color: #ffffff !important;
    }
    
    .register-login-link {
        text-align: center;
        margin-top: 20px;
        color: var(--text-secondary, #666);
        font-size: 0.9rem;
    }
    
    body.dark-mode .register-login-link {
        color: #a0a0a0;
    }
    
    .register-login-link a {
        color: #6366f1;
        text-decoration: none;
        transition: color 0.3s;
    }
    
    .register-login-link a:hover {
        color: #4f46e5;
        text-decoration: underline;
    }
    
    body.dark-mode .register-login-link a {
        color: #a5b4fc;
    }
    
    body.dark-mode .register-login-link a:hover {
        color: #c7d2fe;
    }
    
    /* Responsive */
    @media (max-width: 480px) {
        .register-form-container {
            padding: 25px 20px;
        }
        
        .register-title {
            font-size: 1.5rem;
            margin-bottom: 20px;
        }
        
        .register-button {
            padding: 10px;
            font-size: 14px;
        }
        
        .register-input {
            font-size: 14px;
            padding: 8px;
        }
    }
`;
document.head.appendChild(styleSheet);

export default RegisterPage;