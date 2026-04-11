import React, { createContext, useState, useEffect, useContext } from 'react';

const ThemeContext = createContext();

export const useTheme = () => {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
};

// Function to apply dark mode styles directly
const applyDarkMode = (isDark) => {
    if (isDark) {
        document.body.classList.add('dark-mode');
        
        const style = document.getElementById('dark-mode-styles');
        if (style) style.remove();
        
        const darkStyles = document.createElement('style');
        darkStyles.id = 'dark-mode-styles';
        darkStyles.textContent = `
            /* Dark Mode Backgrounds */
            body.dark-mode {
                background-color: #0a0a0a !important;
            }
            
            body.dark-mode .container,
            body.dark-mode main,
            body.dark-mode section {
                background-color: #0a0a0a !important;
            }
            
            /* Cards and Components */
            body.dark-mode .product-card,
            body.dark-mode .card,
            body.dark-mode .stat-card,
            body.dark-mode .feature-card,
            body.dark-mode .wishlist-card,
            body.dark-mode .order-card,
            body.dark-mode .profile-card,
            body.dark-mode .edit-card,
            body.dark-mode .modal-content,
            body.dark-mode .cart-item,
            body.dark-mode .order-item,
            body.dark-mode .summary-section,
            body.dark-mode .filter-section {
                background-color: #1a1a1a !important;
                border: 1px solid #333333 !important;
            }
            
            /* Text Colors */
            body.dark-mode,
            body.dark-mode p,
            body.dark-mode h1,
            body.dark-mode h2,
            body.dark-mode h3,
            body.dark-mode h4,
            body.dark-mode span,
            body.dark-mode div,
            body.dark-mode li,
            body.dark-mode label,
            body.dark-mode strong,
            body.dark-mode b {
                color: #ffffff !important;
            }
            
            /* Links */
            body.dark-mode a {
                color: #a5b4fc !important;
            }
            
            body.dark-mode a:hover {
                color: #c7d2fe !important;
            }
            
            /* Navbar */
            body.dark-mode nav,
            body.dark-mode .navbar {
                background-color: #0a0a0a !important;
                border-bottom: 1px solid #333333 !important;
            }
            
            body.dark-mode .navbar a,
            body.dark-mode .navbar span {
                color: #e5e7eb !important;
            }
            
            /* Hero Sections */
            body.dark-mode .home-hero-fullwidth,
            body.dark-mode .admin-hero-fullwidth {
                background: linear-gradient(135deg, #1e1b4b 0%, #312e81 100%) !important;
            }
            
            body.dark-mode .home-hero-fullwidth *,
            body.dark-mode .admin-hero-fullwidth * {
                color: white !important;
            }
            
            /* Inputs */
            body.dark-mode input,
            body.dark-mode textarea,
            body.dark-mode select {
                background-color: #1a1a1a !important;
                border: 1px solid #444444 !important;
                color: #ffffff !important;
            }
            
            body.dark-mode input::placeholder {
                color: #888888 !important;
            }
            
            /* Buttons */
            body.dark-mode .btn-primary {
                background: linear-gradient(135deg, #4f46e5, #6366f1) !important;
                color: white !important;
            }
            
            body.dark-mode .btn-secondary {
                background-color: #333333 !important;
                color: white !important;
                border: 1px solid #555555 !important;
            }
            
            /* Tables */
            body.dark-mode table {
                background-color: #1a1a1a !important;
            }
            
            body.dark-mode th {
                background-color: #0a0a0a !important;
                color: #ffffff !important;
                border-bottom: 1px solid #333333 !important;
            }
            
            body.dark-mode td {
                color: #cccccc !important;
                border-bottom: 1px solid #333333 !important;
            }
            
            /* Category Tabs */
            body.dark-mode .category-tab {
                color: #aaaaaa !important;
            }
            
            body.dark-mode .category-tab-active {
                background-color: #6366f1 !important;
                color: white !important;
            }
            
            /* Footer */
            body.dark-mode footer {
                background-color: #0a0a0a !important;
                border-top: 1px solid #333333 !important;
            }
            
            body.dark-mode footer p,
            body.dark-mode footer span {
                color: #aaaaaa !important;
            }
            
            /* Prices */
            body.dark-mode .price,
            body.dark-mode .product-price,
            body.dark-mode .item-price {
                color: #a5b4fc !important;
            }
            
            /* Stock Badges */
            body.dark-mode .stock-in {
                background-color: #064e3b !important;
                color: #34d399 !important;
            }
            
            body.dark-mode .stock-out {
                background-color: #7f1d1d !important;
                color: #fca5a5 !important;
            }
            
            /* Features */
            body.dark-mode .features {
                background-color: #0a0a0a !important;
            }
            
            /* Scrollbar */
            body.dark-mode ::-webkit-scrollbar-track {
                background: #1a1a1a !important;
            }
            
            body.dark-mode ::-webkit-scrollbar-thumb {
                background: #444444 !important;
            }
        `;
        document.head.appendChild(darkStyles);
    } else {
        document.body.classList.remove('dark-mode');
        const style = document.getElementById('dark-mode-styles');
        if (style) style.remove();
    }
};

export const ThemeProvider = ({ children }) => {
    const [darkMode, setDarkMode] = useState(() => {
        const savedTheme = localStorage.getItem('darkMode');
        return savedTheme === 'true' || false;
    });

    useEffect(() => {
        localStorage.setItem('darkMode', darkMode);
        applyDarkMode(darkMode);
    }, [darkMode]);

    const toggleDarkMode = () => {
        setDarkMode(prev => !prev);
    };

    return (
        <ThemeContext.Provider value={{ darkMode, toggleDarkMode }}>
            {children}
        </ThemeContext.Provider>
    );
};