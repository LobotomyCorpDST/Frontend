import React from 'react';
import './Header.css';

const Header = ({ title }) => {
    return (
        <header className="app-header">
            <h1 className="header-title">{title}</h1>
            <div className="profile-placeholder">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="profile-icon">
                    <circle cx="12" cy="7" r="4" />
                    <path d="M2 22s1-1 4-1 4 1 4 1h4s1-1 4-1 4 1 4 1" />
                </svg>
            </div>
        </header>
    );
};

export default Header;
