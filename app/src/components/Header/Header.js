import React from 'react';
import './Header.css';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';

const Header = ({ title }) => {
    return (
        <header className="app-header">
            <h1 className="header-title">{title}</h1>
            <div className="profile-placeholder">
                <AccountCircleIcon className="profile-icon" />
            </div>
        </header>
    );
};

export default Header;