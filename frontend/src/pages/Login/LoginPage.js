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

    return (
        <div style={styles.container}>
            <div style={styles.formContainer}>
                <h1 style={styles.title}>Login</h1>
                
                {errors.general && (
                    <div style={styles.generalError}>
                        {errors.general}
                    </div>
                )}
                
                <form onSubmit={handleSubmit} style={styles.form}>
                    <div style={styles.inputGroup}>
                        <label style={styles.label}>Email</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => {
                                setEmail(e.target.value);
                                if (errors.email) setErrors({ ...errors, email: '' });
                                if (errors.general) setErrors({ ...errors, general: '' });
                            }}
                            style={{
                                ...styles.input,
                                ...(errors.email && styles.inputError)
                            }}
                            placeholder="Enter your email"
                        />
                        {errors.email && <span style={styles.errorText}>{errors.email}</span>}
                    </div>
                    
                    <div style={styles.inputGroup}>
                        <label style={styles.label}>Password</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => {
                                setPassword(e.target.value);
                                if (errors.password) setErrors({ ...errors, password: '' });
                                if (errors.general) setErrors({ ...errors, general: '' });
                            }}
                            style={{
                                ...styles.input,
                                ...(errors.password && styles.inputError)
                            }}
                            placeholder="Enter your password"
                        />
                        {errors.password && <span style={styles.errorText}>{errors.password}</span>}
                    </div>
                    
                    <button 
                        type="submit" 
                        style={styles.button}
                        disabled={loading}
                    >
                        {loading ? 'Logging in...' : 'Login'}
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
                        text="continue_with"
                        shape="rectangular"
                        width="100%"
                        logo_alignment="center"
                    />
                </div>
                
                <p style={styles.registerLink}>
                    Don't have an account? <Link to="/register">Register here</Link>
                </p>
            </div>
        </div>
    );
};

const LoginPage = () => {
    const googleClientId = process.env.REACT_APP_GOOGLE_CLIENT_ID;
    
    if (!googleClientId) {
        console.error("REACT_APP_GOOGLE_CLIENT_ID is not set");
        return <LoginPageContent />;
    }

    return (
        <GoogleOAuthProvider clientId={googleClientId}>
            <LoginPageContent />
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
    },
    generalError: {
        backgroundColor: '#f8d7da',
        color: '#721c24',
        padding: '10px',
        borderRadius: '5px',
        marginBottom: '20px',
        textAlign: 'center',
        fontSize: '14px',
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
    },
    input: {
        padding: '10px',
        border: '1px solid #ddd',
        borderRadius: '5px',
        fontSize: '16px',
    },
    inputError: {
        borderColor: '#dc3545',
        backgroundColor: '#fff8f8',
    },
    errorText: {
        color: '#dc3545',
        fontSize: '0.75rem',
    },
    button: {
        padding: '12px',
        backgroundColor: '#007bff',
        color: '#fff',
        border: 'none',
        borderRadius: '5px',
        fontSize: '16px',
        cursor: 'pointer',
        marginTop: '10px',
    },
    divider: {
        textAlign: 'center',
        margin: '20px 0',
        color: '#999',
        position: 'relative',
    },
    googleButtonWrapper: {
        marginTop: '10px',
        display: 'flex',
        justifyContent: 'center',
        width: '100%',
    },
    registerLink: {
        textAlign: 'center',
        marginTop: '20px',
        color: '#666',
    },
};

export default LoginPage;