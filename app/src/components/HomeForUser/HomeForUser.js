import React, { useState, useCallback } from 'react';
import Header from '../Header/Header';
import HomeNavBar from '../HomeNavBar/HomeNavBar';

import {
    Drawer,
    Box,
    List,
    ListItem,
    ListItemButton,
    ListItemText,
    Divider,
    Toolbar,
    Typography,
} from '@mui/material';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import { useNavigate } from 'react-router-dom';

import Dashboard from '../Dashboard/Dashboard';
import RoomDetailUser from '../RoomDetail/RoomDetailUser';

import http from '../../api/http';

const navigationItems = [
    { label: 'Dashboard', component: <Dashboard isGuest={true} /> },
    { label: 'ห้องของฉัน', component: <RoomDetailUser /> },
];

function HomeForUser() {
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [activeIndex, setActiveIndex] = useState(0);
    const navigate = useNavigate();

    const handleDrawerToggle = () => setDrawerOpen(!drawerOpen);

    const handleNavigationChange = (index) => {
        setActiveIndex(index);
    };

    const handleLogout = useCallback(async () => {
        try {
            await http.post('/api/auth/logout', {});
        } catch (_) {
            // ignore errors
        }

        try {
            ['token', 'access_token', 'jwt', 'role'].forEach((k) => localStorage.removeItem(k));
        } catch (_) {}

        setActiveIndex(0);
        setDrawerOpen(false);

        navigate('/login', { replace: true });
    }, [navigate]);

    const drawerContent = (
        <Box
            sx={{
                width: 250,
                display: 'flex',
                flexDirection: 'column',
                height: '100%',
            }}
            role="presentation"
            data-cy="user-home-page-drawer-content" 
        >
            <Toolbar sx={{ p: '16px' }}>
                <AccountCircleIcon sx={{ mr: 2, fontSize: '2rem', color: '#13438B' }} />
                <Typography
                    variant="h6"
                    noWrap
                    data-cy="user-home-page-drawer-username" 
                >
                    User
                </Typography>
            </Toolbar>
            <Divider />

            <List>
                {navigationItems.map((item, index) => (
                    <ListItem key={item.label} disablePadding>
                        <ListItemButton
                            selected={activeIndex === index}
                            onClick={() => {
                                handleNavigationChange(index);
                                setDrawerOpen(false);
                            }}
                            data-cy={`user-home-page-drawer-nav-item-${index}`} 
                        >
                            <ListItemText primary={item.label} />
                        </ListItemButton>
                    </ListItem>
                ))}
            </List>

            <Box sx={{ flexGrow: 1 }} />

            <Divider />
            <List>
                <ListItem disablePadding>
                    <ListItemButton
                        onClick={handleLogout}
                        data-cy="user-home-page-drawer-logout-button" 
                    >
                        <ListItemText primary="ออกจากระบบ" />
                    </ListItemButton>
                </ListItem>
            </List>
        </Box>
    );

    return (
        <>
            <Header
                onMenuClick={handleDrawerToggle}
                data-cy="user-home-page-header" 
            />

            <Drawer
                anchor="left"
                open={drawerOpen}
                onClose={handleDrawerToggle}
                data-cy="user-home-page-drawer" 
            >
                {drawerContent}
            </Drawer>

            <HomeNavBar
                navigationItems={navigationItems}
                activeIndex={activeIndex}
                onTabChange={handleNavigationChange}
                data-cy="user-home-page-nav-bar" 
            />
        </>
    );
}

export default HomeForUser;