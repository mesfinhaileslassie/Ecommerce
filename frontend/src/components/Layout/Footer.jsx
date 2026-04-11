import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
    return (
        <footer style={styles.footer}>
            <div style={styles.container}>
                <div style={styles.grid}>
                    <div>
                        <h3 style={styles.logo}>🛍️ Habesha Market</h3>
                        <p style={styles.description}>
                            Your one-stop shop for amazing products at great prices.
                        </p>
                    </div>
                    
                    <div>
                        <h4 style={styles.heading}>Quick Links</h4>
                        <ul style={styles.list}>
                            <li><Link to="/" style={styles.link}>Home</Link></li>
                            <li><Link to="/products" style={styles.link}>Products</Link></li>
                            <li><Link to="/cart" style={styles.link}>Cart</Link></li>
                            <li><Link to="/orders" style={styles.link}>Orders</Link></li>
                        </ul>
                    </div>
                    
                    <div>
                        <h4 style={styles.heading}>Customer Service</h4>
                        <ul style={styles.list}>
                            <li><a href="#" style={styles.link}>Contact Us</a></li>
                            <li><a href="#" style={styles.link}>Shipping Policy</a></li>
                            <li><a href="#" style={styles.link}>Returns</a></li>
                            <li><a href="#" style={styles.link}>FAQ</a></li>
                        </ul>
                    </div>
                    
                    <div>
                        <h4 style={styles.heading}>Newsletter</h4>
                        <p style={styles.newsletterText}>Get exclusive offers</p>
                        <div style={styles.newsletterForm}>
                            <input 
                                type="email" 
                                placeholder="Your email"
                                style={styles.newsletterInput}
                            />
                            <button style={styles.newsletterBtn}>Subscribe</button>
                        </div>
                    </div>
                </div>
                
                <div style={styles.copyright}>
                   <p>&copy; 2026 Habesha Market. All rights reserved. Built with ❤️ for Ethiopia</p>
                </div>
            </div>
        </footer>
    );
};

const styles = {
    footer: {
        background: 'linear-gradient(135deg, #111827 0%, #1f2937 100%)',
        color: '#9ca3af',
        marginTop: '4rem',
    },
    container: {
        maxWidth: '1280px',
        margin: '0 auto',
        padding: '3rem 1.5rem 1.5rem',
    },
    grid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        gap: '2rem',
        marginBottom: '2rem',
    },
    logo: {
        fontSize: '1.5rem',
        marginBottom: '1rem',
        color: 'white',
    },
    description: {
        fontSize: '0.875rem',
        lineHeight: '1.6',
    },
    heading: {
        color: 'white',
        fontSize: '1rem',
        marginBottom: '1rem',
        fontWeight: '600',
    },
    list: {
        listStyle: 'none',
        padding: 0,
    },
    link: {
        color: '#9ca3af',
        textDecoration: 'none',
        fontSize: '0.875rem',
        lineHeight: '2',
        transition: 'color 0.3s',
    },
    newsletterText: {
        fontSize: '0.875rem',
        marginBottom: '0.5rem',
    },
    newsletterForm: {
        display: 'flex',
        gap: '0.5rem',
    },
    newsletterInput: {
        flex: 1,
        padding: '0.5rem',
        borderRadius: '0.5rem',
        border: 'none',
        outline: 'none',
    },
    newsletterBtn: {
        padding: '0.5rem 1rem',
        background: 'linear-gradient(135deg, #6366f1, #4f46e5)',
        color: 'white',
        border: 'none',
        borderRadius: '0.5rem',
        cursor: 'pointer',
        transition: 'transform 0.3s',
    },
    copyright: {
        textAlign: 'center',
        paddingTop: '2rem',
        borderTop: '1px solid #374151',
        fontSize: '0.875rem',
    },
};

export default Footer;