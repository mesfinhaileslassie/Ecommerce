import React from 'react';
import { useTheme } from '../../context/ThemeContext';
import { FaSun, FaMoon } from 'react-icons/fa';

const ThemeToggle = () => {
    const { darkMode, toggleDarkMode } = useTheme();

    return (
        <button
            onClick={toggleDarkMode}
            style={styles.button}
            aria-label="Toggle dark mode"
        >
            {darkMode ? <FaSun size={18} /> : <FaMoon size={18} />}
        </button>
    );
};

const styles = {
    button: {
        background: 'none',
        border: 'none',
        cursor: 'pointer',
        color: '#fff',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '8px',
        borderRadius: '50%',
        transition: 'background-color 0.3s',
    },
};

export default ThemeToggle;