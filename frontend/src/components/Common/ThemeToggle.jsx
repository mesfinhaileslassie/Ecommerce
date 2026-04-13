import React from 'react';
import { useTheme } from '../../context/ThemeContext';
import { FaSun, FaMoon } from 'react-icons/fa';

const ThemeToggle = () => {
    const { darkMode, toggleDarkMode } = useTheme();

    return (
        <button
            onClick={toggleDarkMode}
            className="theme-toggle-btn"
            aria-label="Toggle dark mode"
        >
            {darkMode ? <FaSun size={18} /> : <FaMoon size={18} />}
        </button>
    );
};

// Add CSS for the toggle button
const styleSheet = document.createElement("style");
styleSheet.textContent = `
    .theme-toggle-btn {
        background: #e5e7eb;
        border: none;
        cursor: pointer;
        color: #4f46e5;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 8px;
        border-radius: 50%;
        transition: all 0.3s;
        width: 36px;
        height: 36px;
    }
    
    body.dark-mode .theme-toggle-btn {
        background: #374151;
        color: #fbbf24;
    }
    
    .theme-toggle-btn:hover {
        transform: scale(1.05);
    }
`;
document.head.appendChild(styleSheet);

export default ThemeToggle;