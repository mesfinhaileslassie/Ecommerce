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
                            onChange={(e) => {
                                setName(e.target.value);
                                if (errors.name) setErrors({ ...errors, name: '' });
                            }}
                            style={{
                                ...styles.input,
                                ...(errors.name && styles.inputError)
                            }}
                            placeholder="Enter your full name"
                        />
                        {errors.name && <span style={styles.errorText}>{errors.name}</span>}
                    </div>
                    
                    <div style={styles.inputGroup}>
                        <label style={styles.label}>Email</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => {
                                setEmail(e.target.value);
                                if (errors.email) setErrors({ ...errors, email: '' });
                            }}
                            style={{
                                ...styles.input,
                                ...(errors.email && styles.inputError)
                            }}
                            placeholder="Enter your email"
                        />
                        {errors.email && <span style={styles.errorText}>{errors.email}</span>}
                        <small style={styles.hintText}>Enter a valid email address (e.g., name@example.com)</small>
                    </div>
                    
                    <div style={styles.inputGroup}>
                        <label style={styles.label}>Password</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => {
                                setPassword(e.target.value);
                                if (errors.password) setErrors({ ...errors, password: '' });
                            }}
                            style={{
                                ...styles.input,
                                ...(errors.password && styles.inputError)
                            }}
                            placeholder="Create a password (min 6 characters)"
                        />
                        {errors.password && <span style={styles.errorText}>{errors.password}</span>}
                    </div>
                    
                    <div style={styles.inputGroup}>
                        <label style={styles.label}>Confirm Password</label>
                        <input
                            type="password"
                            value={confirmPassword}
                            onChange={(e) => {
                                setConfirmPassword(e.target.value);
                                if (errors.confirmPassword) setErrors({ ...errors, confirmPassword: '' });
                            }}
                            style={{
                                ...styles.input,
                                ...(errors.confirmPassword && styles.inputError)
                            }}
                            placeholder="Confirm your password"
                        />
                        {errors.confirmPassword && <span style={styles.errorText}>{errors.confirmPassword}</span>}
                    </div>
                    
                    <button 
                        type="submit" 
                        style={styles.button}
                        disabled={loading}
                    >
                        {loading ? 'Creating Account...' : 'Sign Up'}
                    </button>
                </form>
                
                <div style={styles.divider}>
                    <span>OR</span>
                </div>
                
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

const RegisterPage = () => {
    const googleClientId = process.env.REACT_APP_GOOGLE_CLIENT_ID;
    
    if (!googleClientId) {
        console.error("REACT_APP_GOOGLE_CLIENT_ID is not set");
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
        maxWidth: '450px',
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
    inputError: {
        borderColor: '#dc3545',
        backgroundColor: '#fff8f8',
    },
    errorText: {
        color: '#dc3545',
        fontSize: '0.75rem',
        marginTop: '3px',
    },
    hintText: {
        color: '#999',
        fontSize: '0.7rem',
        marginTop: '3px',
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

export default RegisterPage;