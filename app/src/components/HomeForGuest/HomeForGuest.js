import React, { useState, useCallback } from 'react';
import Header from '../Header/Header';
import HomeNavBar from '../HomeNavBar/HomeNavBar';
// import './Home.css';

import {
    Drawer, Box, List, ListItem, ListItemButton,
    ListItemText, Divider, Toolbar, Typography
} from '@mui/material';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import { useNavigate } from 'react-router-dom';

import Dashboard from '../Dashboard/Dashboard';

import http from '../../api/http'; // ใช้ยิง logout ถ้ามี

const navigationItems = [
    { label: "Dashboard", component: Dashboard, props: { isGuest: true } },
];
function HomePageForGuest() {
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [activeIndex, setActiveIndex] = useState(0);
    const navigate = useNavigate();

    // Get username from localStorage
    const username = localStorage.getItem('username') || 'Guest';

    const handleDrawerToggle = () => setDrawerOpen(!drawerOpen);

    const handleNavigationChange = (index) => {
        setActiveIndex(index);
    };

    // ---- NEW: logout handler ----
    const handleLogout = useCallback(async () => {
        // best-effort: ถ้ามี endpoint logout ก็เรียก, แต่ไม่ต้องรอ result
        try {
            await http.post('/api/auth/logout', {}); // ถ้า backend ไม่มี endpoint นี้ จะ throw แต่เราจะ ignore
        } catch (_) {
            // ignore errors
        }

        // throw away token, role, and username
        try {
            ['token', 'access_token', 'jwt', 'role', 'room_id', 'username'].forEach((k) => localStorage.removeItem(k));
        } catch (_) { }

        // เผื่อมี state อะไรผูกกับหน้าเก่า
        setActiveIndex(0);
        setDrawerOpen(false);

        // กลับไปหน้า login
        navigate('/login', { replace: true });
    }, [navigate]);

    const drawerContent = (
        <Box
            sx={{
                width: 250,
                display: 'flex',
                flexDirection: 'column',
                height: '100%'
            }}
            role="presentation"
        >
            <Toolbar sx={{ p: '16px' }}>
                <AccountCircleIcon sx={{ mr: 2, fontSize: '2rem', color: "#13438B" }} />
                <Typography variant="h6" noWrap>{username}</Typography>
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
                        >
                            <ListItemText primary={item.label} />
                        </ListItemButton>
                    </ListItem>
                ))}
            </List>

            <Box sx={{ flexGrow: 1 }} />

            <Divider />
            {/* ---- NEW: ปุ่มออกจากระบบ ---- */}
            <List>
                <ListItem disablePadding>
                    <ListItemButton onClick={handleLogout}>
                        <ListItemText primary="ออกจากระบบ" />
                    </ListItemButton>
                </ListItem>
            </List>
        </Box>
    );

    return (
        <>
            <Header onMenuClick={handleDrawerToggle} />

            <Drawer anchor="left" open={drawerOpen} onClose={handleDrawerToggle}>
                {drawerContent}
            </Drawer>

            <HomeNavBar
                navigationItems={navigationItems}
                activeIndex={activeIndex}
                onTabChange={handleNavigationChange}
            />
        </>
    );
}

export default HomePageForGuest;
