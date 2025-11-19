import React, { useState, useCallback } from 'react';
import Header from '../Header/Header';
import HomeNavBar from '../HomeNavBar/HomeNavBar';
import './Home.css';

import {
    Drawer, Box, List, ListItem, ListItemButton,
    ListItemText, Divider, Toolbar, Typography
} from '@mui/material';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import { useNavigate } from 'react-router-dom';

import Dashboard from '../Dashboard/Dashboard';
import RoomList from '../RoomList/RoomList';
import InvoiceHistory from '../InvoiceHistory/InvoiceHistory';
import LeaseHistory from '../LeaseHistory/LeaseHistory';
import MaintenanceHistory from '../Maintenance/MaintenanceHistory';
import TenantList from '../TenantList/TenantList';
import SummaryReport from '../SummaryReport/SummaryReport';
import SupplyInventoryPage from '../SupplyInventory/SupplyInventoryPage';
import UserManagement from '../UserManagement/UserManagement';

import http from '../../api/http'; // ใช้ยิง logout ถ้ามี

function HomePage() {
    const [drawerOpen, setDrawerOpen] = new useState(false);
    const [activeIndex, setActiveIndex] = new useState(0);
    const navigate = new useNavigate();

    // Get user role from localStorage
    const userRole = (localStorage.getItem('role') || 'STAFF').toUpperCase();
    const isGuest = userRole === 'GUEST';

    // Role-based navigation: ADMIN sees all pages, STAFF sees Dashboard + Maintenance, USER/GUEST sees Dashboard only
    const navigationItems = userRole === 'ADMIN' ? [
        { label: "สรุปภาพรวม", component: <Dashboard isGuest={false} /> },
        { label: "บำรุงรักษา", component: <MaintenanceHistory userRole={userRole} />, signalKeys: ['addMaintenanceSignal'] },
        { label: "ห้องทั้งหมด", component: <RoomList />, signalKeys: ['addRoomSignal'] },
        { label: "ใบแจ้งหนี้", component: <InvoiceHistory />, signalKeys: ['addInvoiceSignal'] },
        {
            label: "ประวัติสัญญาเช่า",
            component: <LeaseHistory />,
            signalKeys: ['leaseHistoryReloadSignal', 'leaseHistoryCreateSignal', 'onLeaseHistoryLoadingChange'],
        },
        { label: "ผู้เช่าทั้งหมด", component: <TenantList />, signalKeys: ['addTenantSignal'] },
        { label: "รายงานสรุป", component: <SummaryReport /> },
        { label: "คลังวัสดุ", component: <SupplyInventoryPage /> },
        {
            label: "จัดการบัญชีผู้ใช้",
            component: <UserManagement />,
            signalKeys: ['userManagementCreateSignal'],
        },
    ] : userRole === 'STAFF' ? [
        // STAFF: Dashboard + Maintenance
        { label: "สรุปภาพรวม", component: <Dashboard isGuest={false} /> },
        { label: "บำรุงรักษา", component: <MaintenanceHistory userRole={userRole} />, signalKeys: ['addMaintenanceSignal'] },
    ] : [
        // USER, GUEST: Dashboard only
        { label: "สรุปภาพรวม", component: <Dashboard isGuest={isGuest} /> },
    ];

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

        // throw away token and role
        try {
            ['token', 'access_token', 'jwt', 'role'].forEach((k) => localStorage.removeItem(k));
        } catch (_) {}

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
            data-cy="home-page-drawer-content"
        >
            <Toolbar sx={{ p: '16px' }}>
                <AccountCircleIcon sx={{ mr: 2, fontSize: '2rem', color: "#13438B" }} />
                <Typography
                    variant="h6"
                    noWrap
                    data-cy="home-page-drawer-username"
                >
                    {localStorage.getItem('username') || 'ผู้ใช้'}
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
                            data-cy={`home-page-drawer-nav-item-${index}`}
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
                    <ListItemButton
                        onClick={handleLogout}
                        data-cy="home-page-drawer-logout-button"
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
                data-cy="home-page-header"
            />

            <Drawer
                anchor="left"
                open={drawerOpen}
                onClose={handleDrawerToggle}
                data-cy="home-page-drawer"
            >
                {drawerContent}
            </Drawer>

            <HomeNavBar
                navigationItems={navigationItems}
                activeIndex={activeIndex}
                onTabChange={handleNavigationChange}
                data-cy="home-page-nav-bar"
            />
        </>
    );
}

export default HomePage;
