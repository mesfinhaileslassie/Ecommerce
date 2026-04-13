import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { login } from '../../redux/slices/authSlice';
import { GoogleLogin, GoogleOAuthProvider } from '@react-oauth/google';
import toast from 'react-hot-toast';
import api from '../../services/api';

const LoginPageContent = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [errors, setErrors] = useState({});
    const { loading } = useSelector((state) => state.auth);

    const isValidEmail = (email) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    };

    const validateForm = () => {
        const newErrors = {};
        
        if (!email) {
            newErrors.email = 'Email is required';
        } else if (!isValidEmail(email)) {
            newErrors.email = 'Please enter a valid email address';
        }
        
        if (!password) {
            newErrors.password = 'Password is required';
        }
        
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!validateForm()) {
            return;
        }

        try {
            const result = await dispatch(login(email, password));
            
            if (result.error) {
                const errorMessage = result.error.message || 'Login failed';
                if (errorMessage.includes('Invalid credentials')) {
                    toast.error('Invalid email or password. Please try again.');
                    setErrors({ general: 'Invalid email or password' });
                } else {
                    toast.error(errorMessage);
                }
            } else {
                toast.success('Login successful!');
                navigate('/');
            }
        } catch (error) {
            console.error('Login error:', error);
            toast.error(error.message || 'Login failed');
        }
    };

    const handleGoogleSuccess = async (credentialResponse) => {
        console.log('Google login success:', credentialResponse);
        const { credential } = credentialResponse;
        
        try {
            const { data } = await api.post('/auth/google', { token: credential });
            
            if (data.success) {
                dispatch({ type: 'auth/loginSuccess', payload: data });
                toast.success('Google Login successful!');
                navigate('/');
            } else {
                toast.error(data.message || 'Google login failed');
            }
        } catch (error) {
            console.error('Google login error:', error);
            toast.error(error.response?.data?.message || 'Google login failed');
        }
    };

    const handleGoogleFailure = (error) => {
        console.error('Google login failed:', error);
        toast.error('Google login was unsuccessful. Please try again.');
    };

    const googleClientId = process.env.REACT_APP_GOOGLE_CLIENT_ID;
    const isGoogleConfigured = googleClientId && googleClientId !== 'your_google_client_id_here';

    return (
        <div className="login-container">
            <div className="login-form-container">
                <h1 className="login-title">Login</h1>
                
                {errors.general && (
                    <div className="login-general-error">
                        {errors.general}
                    </div>
                )}
                
                <form onSubmit={handleSubmit} className="login-form">
                    <div className="login-input-group">
                        <label className="login-label">Email</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => {
                                setEmail(e.target.value);
                                if (errors.email) setErrors({ ...errors, email: '' });
                                if (errors.general) setErrors({ ...errors, general: '' });
                            }}
                            className={`login-input ${errors.email ? 'login-input-error' : ''}`}
                            placeholder="Enter your email"
                        />
                        {errors.email && <span className="login-error-text">{errors.email}</span>}
                    </div>
                    
                    <div className="login-input-group">
                        <label className="login-label">Password</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => {
                                setPassword(e.target.value);
                                if (errors.password) setErrors({ ...errors, password: '' });
                                if (errors.general) setErrors({ ...errors, general: '' });
                            }}
                            className={`login-input ${errors.password ? 'login-input-error' : ''}`}
                            placeholder="Enter your password"
                        />
                        {errors.password && <span className="login-error-text">{errors.password}</span>}
                    </div>
                    
                    <button 
                        type="submit" 
                        className="login-button"
                        disabled={loading}
                    >
                        {loading ? 'Logging in...' : 'Login'}
                    </button>
                </form>
                
                <div className="login-divider">
                    <span>OR</span>
                </div>
                
                {isGoogleConfigured ? (
                    <div className="login-google-button-wrapper">
                        <GoogleLogin
                            onSuccess={handleGoogleSuccess}
                            onError={handleGoogleFailure}
                            useOneTap={false}
                            theme="outline"
                            size="large"
                            text="continue_with"
                            shape="rectangular"
                            width="100%"
                            logo_alignment="center"
                        />
                    </div>
                ) : (
                    <div className="login-google-unavailable">
                        <p>Google Sign In is not configured. Please contact support.</p>
                    </div>
                )}
                
                <p className="login-register-link">
                    Don't have an account? <Link to="/register">Register here</Link>
                </p>
            </div>
        </div>
    );
};

const LoginPage = () => {
    const googleClientId = process.env.REACT_APP_GOOGLE_CLIENT_ID;
    
    // If Google Client ID is not configured, show login without Google
    if (!googleClientId || googleClientId === 'your_google_client_id_here') {
        console.warn("REACT_APP_GOOGLE_CLIENT_ID is not set. Google login will not be available.");
        return <LoginPageContent />;
    }

    return (
        <GoogleOAuthProvider clientId={googleClientId}>
            <LoginPageContent />
        </GoogleOAuthProvider>
    );
};

// Inject CSS Styles for LoginPage
const styleSheet = document.createElement("style");
styleSheet.textContent = `
    /* Login Page Styles - Dark Mode Compatible */
    
    .login-container {
        display: flex;
        justify-content: center;
        align-items: center;
        min-height: calc(100vh - 100px);
        padding: 20px;
        background-color: var(--bg-body, #f5f7fa);
    }
    
    body.dark-mode .login-container {
        background-color: #0a0a0a;
    }
    
    .login-form-container {
        background-color: var(--card-bg, #fff);
        padding: 40px;
        border-radius: 8px;
        box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        width: 100%;
        max-width: 400px;
        border: 1px solid var(--border-color, #e5e7eb);
    }
    
    body.dark-mode .login-form-container {
        background-color: #1a1a1a;
        border-color: #333333;
    }
    
    .login-title {
        text-align: center;
        margin-bottom: 30px;
        color: var(--text-primary, #333);
    }
    
    body.dark-mode .login-title {
        color: #ffffff;
    }
    
    .login-general-error {
        background-color: #f8d7da;
        color: #721c24;
        padding: 10px;
        border-radius: 5px;
        margin-bottom: 20px;
        text-align: center;
        font-size: 14px;
    }
    
    body.dark-mode .login-general-error {
        background-color: #7f1d1d;
        color: #fca5a5;
    }
    
    .login-form {
        display: flex;
        flex-direction: column;
        gap: 20px;
    }
    
    .login-input-group {
        display: flex;
        flex-direction: column;
        gap: 5px;
    }
    
    .login-label {
        font-weight: 500;
        color: var(--text-primary, #555);
    }
    
    body.dark-mode .login-label {
        color: #d1d5db;
    }
    
    .login-input {
        padding: 10px;
        border: 1px solid var(--border-color, #ddd);
        border-radius: 5px;
        font-size: 16px;
        background-color: var(--input-bg, #fff);
        color: var(--text-primary, #333);
        transition: border-color 0.3s, box-shadow 0.3s;
    }
    
    .login-input:focus {
        outline: none;
        border-color: #6366f1;
        box-shadow: 0 0 0 2px rgba(99, 102, 241, 0.1);
    }
    
    body.dark-mode .login-input {
        background-color: #0a0a0a;
        border-color: #444444;
        color: #ffffff;
    }
    
    .login-input-error {
        border-color: #dc3545;
        background-color: #fff8f8;
    }
    
    body.dark-mode .login-input-error {
        border-color: #ef4444;
        background-color: rgba(239, 68, 68, 0.1);
    }
    
    .login-error-text {
        color: #dc3545;
        font-size: 0.75rem;
    }
    
    body.dark-mode .login-error-text {
        color: #f87171;
    }
    
    .login-button {
        padding: 12px;
        background: linear-gradient(135deg, #4f46e5, #6366f1);
        color: #fff;
        border: none;
        border-radius: 5px;
        font-size: 16px;
        cursor: pointer;
        margin-top: 10px;
        transition: all 0.3s;
    }
    
    .login-button:hover:not(:disabled) {
        transform: translateY(-2px);
        background: linear-gradient(135deg, #4338ca, #4f46e5);
        box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3);
    }
    
    .login-button:disabled {
        opacity: 0.6;
        cursor: not-allowed;
    }
    
    .login-divider {
        text-align: center;
        margin: 20px 0;
        color: var(--text-secondary, #999);
        position: relative;
    }
    
    body.dark-mode .login-divider {
        color: #888888;
    }
    
    .login-divider::before,
    .login-divider::after {
        content: '';
        position: absolute;
        top: 50%;
        width: 45%;
        height: 1px;
        background-color: var(--border-color, #ddd);
    }
    
    .login-divider::before {
        left: 0;
    }
    
    .login-divider::after {
        right: 0;
    }
    
    body.dark-mode .login-divider::before,
    body.dark-mode .login-divider::after {
        background-color: #333333;
    }
    
    .login-google-button-wrapper {
        margin-top: 10px;
        display: flex;
        justify-content: center;
        width: 100%;
    }
    
    .login-google-unavailable {
        text-align: center;
        padding: 12px;
        background-color: #fef3c7;
        color: #92400e;
        border-radius: 5px;
        font-size: 0.8rem;
        margin-top: 10px;
    }
    
    body.dark-mode .login-google-unavailable {
        background-color: #7f5f00;
        color: #ffd966;
    }
    
    /* Style Google button for dark mode */
    body.dark-mode .login-google-button-wrapper div[role="button"] {
        background-color: #1a1a1a !important;
        border-color: #333333 !important;
    }
    
    body.dark-mode .login-google-button-wrapper span {
        color: #ffffff !important;
    }
    
    .login-register-link {
        text-align: center;
        margin-top: 20px;
        color: var(--text-secondary, #666);
    }
    
    body.dark-mode .login-register-link {
        color: #a0a0a0;
    }
    
    .login-register-link a {
        color: #6366f1;
        text-decoration: none;
        transition: color 0.3s;
    }
    
    .login-register-link a:hover {
        color: #4f46e5;
        text-decoration: underline;
    }
    
    body.dark-mode .login-register-link a {
        color: #a5b4fc;
    }
    
    body.dark-mode .login-register-link a:hover {
        color: #c7d2fe;
    }
    
    /* Responsive */
    @media (max-width: 480px) {
        .login-form-container {
            padding: 25px 20px;
        }
        
        .login-title {
            font-size: 1.5rem;
            margin-bottom: 20px;
        }
        
        .login-button {
            padding: 10px;
            font-size: 14px;
        }
        
        .login-input {
            font-size: 14px;
            padding: 8px;
        }
    }
`;
document.head.appendChild(styleSheet);

export default LoginPage;