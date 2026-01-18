import React, { useState } from 'react';
import { FiPalette, FiCheck } from 'react-icons/fi';
import './ThemeSelector.css';

const ThemeSelector = ({ currentTheme, onThemeChange }) => {
  const [isOpen, setIsOpen] = useState(false);

  const themes = [
    { id: 'default', name: 'Default', color: '#3390ec' },
    { id: 'dark', name: 'Dark', color: '#1a1a1a' },
    { id: 'blue', name: 'Blue', color: '#2196F3' },
    { id: 'green', name: 'Green', color: '#4CAF50' },
    { id: 'purple', name: 'Purple', color: '#9C27B0' },
    { id: 'red', name: 'Red', color: '#F44336' }
  ];

  const handleThemeSelect = (themeId) => {
    onThemeChange(themeId);
    setIsOpen(false);
  };

  return (
    <div className="theme-selector">
      <button 
        className="theme-selector-btn"
        onClick={() => setIsOpen(!isOpen)}
      >
        <FiPalette />
        <span>Theme</span>
      </button>

      {isOpen && (
        <div className="theme-dropdown">
          <div className="theme-dropdown-header">
            <h4>Choose Theme</h4>
          </div>
          <div className="theme-options">
            {themes.map(theme => (
              <div
                key={theme.id}
                className={`theme-option ${currentTheme === theme.id ? 'active' : ''}`}
                onClick={() => handleThemeSelect(theme.id)}
              >
                <div 
                  className="theme-color"
                  style={{ backgroundColor: theme.color }}
                />
                <span className="theme-name">{theme.name}</span>
                {currentTheme === theme.id && (
                  <FiCheck className="theme-check" />
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ThemeSelector;