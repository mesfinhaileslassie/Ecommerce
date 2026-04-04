import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { login } from '../../redux/slices/authSlice';
import { GoogleLogin, GoogleOAuthProvider } from '@react-oauth/google';
import toast from 'react-hot-toast';
import api from '../../services/api';
import { FaGoogle } from 'react-icons/fa';

const LoginPageContent = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const { loading } = useSelector((state) => state.auth);

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!email || !password) {
            toast.error('Please fill in all fields');
            return;
        }

        try {
            await dispatch(login(email, password)).unwrap();
            toast.success('Login successful!');
            navigate('/');
        } catch (error) {
            toast.error(error.message || 'Login failed');
        }
    };

    const handleGoogleSuccess = async (credentialResponse) => {
        console.log('Google login success:', credentialResponse);
        const { credential } = credentialResponse;
        
        try {
            const { data } = await api.post('/auth/google', { token: credential });
            
            if (data.success) {
                // Manually dispatch login success
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
                <form onSubmit={handleSubmit} style={styles.form}>
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
                            placeholder="Enter your password"
                            required
                        />
                    </div>
                    
                    <button 
                        type="submit" 
                        style={styles.button}
                        disabled={loading}
                    >
                        {loading ? 'Logging in...' : 'Login'}
                    </button>
                </form>
                
                {/* Divider */}
                <div style={styles.divider}>
                    <span>OR</span>
                </div>
                
                {/* Google Login Button */}
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

// Wrap with GoogleOAuthProvider
const LoginPage = () => {
    const googleClientId = process.env.REACT_APP_GOOGLE_CLIENT_ID;
    
    if (!googleClientId) {
        console.error("REACT_APP_GOOGLE_CLIENT_ID is not set");
        // Fallback to regular login without Google button
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