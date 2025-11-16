import React from 'react';
import {
    AppBar, Toolbar, Typography, IconButton,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';

const Header = ({ onMenuClick, ...props }) => {

    return (
        <>
            <AppBar
                position="fixed"
                data-cy="header-app-bar"
                {...props}
            >
                <Toolbar>
                    <IconButton
                        size="large"
                        edge="start"
                        color="inherit"
                        aria-label="open drawer"
                        sx={{ mr: 2 }}
                        onClick={onMenuClick}
                        data-cy="header-menu-button"
                    >
                        <MenuIcon />
                    </IconButton>

                    <Typography
                        variant="h6"
                        component="div"
                        sx={{ flexGrow: 1, ml: -6.75 }}
                        data-cy="header-title"
                    >
                        ระบบบริหารจัดการอพาร์ตเมนต์
                    </Typography>

                </Toolbar>
            </AppBar>
            <Toolbar />
        </>
    );
};

export default Header;