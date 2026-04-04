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
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!name || !email || !password) {
            toast.error('Please fill in all fields');
            return;
        }

        if (password !== confirmPassword) {
            toast.error('Passwords do not match');
            return;
        }

        if (password.length < 6) {
            toast.error('Password must be at least 6 characters');
            return;
        }

        setLoading(true);

        try {
            await dispatch(register(name, email, password)).unwrap();
            toast.success('Registration successful! Please login');
            navigate('/login');
        } catch (error) {
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
                // Dispatch login success to log the user in immediately
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

    return (
        <div style={styles.container}>
            <div style={styles.formContainer}>
                <h1 style={styles.title}>Create Account</h1>
                <form onSubmit={handleSubmit} style={styles.form}>
                    <div style={styles.inputGroup}>
                        <label style={styles.label}>Full Name</label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            style={styles.input}
                            placeholder="Enter your full name"
                            required
                        />
                    </div>
                    
                    <div style={styles.inputGroup}>
                        <label style={styles.label}>Email</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            style={styles.input}
                            placeholder="Enter your email"
                            required
                        />
                    </div>
                    
                    <div style={styles.inputGroup}>
                        <label style={styles.label}>Password</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            style={styles.input}
                            placeholder="Create a password (min 6 characters)"
                            required
                        />
                    </div>
                    
                    <div style={styles.inputGroup}>
                        <label style={styles.label}>Confirm Password</label>
                        <input
                            type="password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            style={styles.input}
                            placeholder="Confirm your password"
                            required
                        />
                    </div>
                    
                    <button 
                        type="submit" 
                        style={styles.button}
                        disabled={loading}
                    >
                        {loading ? 'Creating Account...' : 'Sign Up'}
                    </button>
                </form>
                
                {/* Divider */}
                <div style={styles.divider}>
                    <span>OR</span>
                </div>
                
                {/* Google Sign Up Button */}
                <div style={styles.googleButtonWrapper}>
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
                
                <p style={styles.loginLink}>
                    Already have an account? <Link to="/login">Login here</Link>
                </p>
            </div>
        </div>
    );
};

// Wrap with GoogleOAuthProvider
const RegisterPage = () => {
    const googleClientId = process.env.REACT_APP_GOOGLE_CLIENT_ID;
    
    if (!googleClientId) {
        console.error("REACT_APP_GOOGLE_CLIENT_ID is not set");
        // Fallback to regular registration without Google button
        return <RegisterPageContent />;
    }

    return (
        <GoogleOAuthProvider clientId={googleClientId}>
            <RegisterPageContent />
        </GoogleOAuthProvider>
    );
};

const styles = {
    container: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: 'calc(100vh - 100px)',
        padding: '20px',
    },
    formContainer: {
        backgroundColor: '#fff',
        padding: '40px',
        borderRadius: '8px',
        boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
        width: '100%',
        maxWidth: '400px',
    },
    title: {
        textAlign: 'center',
        marginBottom: '30px',
        color: '#333',
        fontSize: '1.8rem',
    },
    form: {
        display: 'flex',
        flexDirection: 'column',
        gap: '20px',
    },
    inputGroup: {
        display: 'flex',
        flexDirection: 'column',
        gap: '5px',
    },
    label: {
        fontWeight: '500',
        color: '#555',
        fontSize: '0.9rem',
    },
    input: {
        padding: '10px',
        border: '1px solid #ddd',
        borderRadius: '5px',
        fontSize: '16px',
        transition: 'border-color 0.3s',
    },
    button: {
        padding: '12px',
        backgroundColor: '#28a745',
        color: '#fff',
        border: 'none',
        borderRadius: '5px',
        fontSize: '16px',
        cursor: 'pointer',
        marginTop: '10px',
        transition: 'background-color 0.3s',
    },
    divider: {
        textAlign: 'center',
        margin: '25px 0 20px',
        color: '#999',
        position: 'relative',
        fontSize: '0.9rem',
    },
    googleButtonWrapper: {
        marginTop: '10px',
        display: 'flex',
        justifyContent: 'center',
        width: '100%',
    },
    loginLink: {
        textAlign: 'center',
        marginTop: '20px',
        color: '#666',
        fontSize: '0.9rem',
    },
};

// Add input focus styles
const styleSheet = document.createElement("style");
styleSheet.textContent = `
    input:focus {
        outline: none;
        border-color: #28a745;
        box-shadow: 0 0 0 2px rgba(40, 167, 69, 0.1);
    }
    
    button:hover {
        opacity: 0.9;
        transform: translateY(-1px);
    }
    
    .google-button {
        width: 100% !important;
    }
`;
document.head.appendChild(styleSheet);

export default RegisterPage;