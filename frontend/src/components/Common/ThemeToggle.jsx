import React from 'react';
import { useTheme } from '../../context/ThemeContext';
import { FaSun, FaMoon } from 'react-icons/fa';

const ThemeToggle = () => {
    const { darkMode, toggleDarkMode } = useTheme();

    return (
        <button
            onClick={toggleDarkMode}
            style={{
                background: darkMode ? '#374151' : '#e5e7eb',
                border: 'none',
                cursor: 'pointer',
                color: darkMode ? '#fbbf24' : '#4f46e5',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '8px',
                borderRadius: '50%',
                transition: 'all 0.3s',
                width: '36px',
                height: '36px',
            }}
            aria-label="Toggle dark mode"
        >
            {darkMode ? <FaSun size={18} /> : <FaMoon size={18} />}
        </button>
    );
};

export default ThemeToggle;