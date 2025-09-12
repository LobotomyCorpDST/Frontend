import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import Header from '../Header/Header';
import HomeNavBar from '../HomeNavBar/HomeNavBar';
import './Home.css';

import {
  Drawer, Box, List, ListItem, ListItemButton,
  ListItemText, Divider, Toolbar, Typography
} from '@mui/material';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';

import Dashboard from '../Dashboard/Dashboard';
import RoomList from '../RoomList/RoomList';
import InvoiceHistory from '../InvoiceHistory/InvoiceHistory';
import LeaseHistory from '../LeaseHistory/LeaseHistory'; // ✅ เพิ่ม import
import MaintenanceHistory from '../Maintenance/MaintenanceHistory';

const navigationItems = [
  { label: "Dashboard", component: <Dashboard /> },
  { label: "ห้องทั้งหมด", component: <RoomList /> },
  { label: "ใบแจ้งหนี้", component: <InvoiceHistory /> },
  { label: "บำรุงรักษา", component: <MaintenanceHistory /> },
  { label: "ประวัติสัญญาเช่า", component: <LeaseHistory /> }, // ✅ เมนูใหม่
];

function HomePage() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();

  const [activeIndex, setActiveIndex] = useState(() => {
    const currentTab = searchParams.get('tab');
    const initialIndex = navigationItems.findIndex(item => item.label === currentTab);
    // ถ้าไม่เจอ tab ใน URL หรือไม่มีค่า param ให้ใช้ index 0 (Dashboard)
    return initialIndex !== -1 ? initialIndex : 0;
  });

  useEffect(() => {
    // ถ้าใน URL ไม่มี 'tab' parameter ให้ตั้งค่าเริ่มต้นให้
    if (!searchParams.get('tab')) {
      setSearchParams({ tab: navigationItems[activeIndex].label }, { replace: true });
    }
  }, [activeIndex, navigationItems, searchParams, setSearchParams]);

  const handleDrawerToggle = () => setDrawerOpen(!drawerOpen);

  const handleNavigationChange = (index) => {
    setActiveIndex(index);
    const newTabLabel = navigationItems[index].label;

    setSearchParams({ tab: newTabLabel });

  };

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
        <Typography variant="h6" noWrap>กิตติชาติ</Typography>
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
      <Box sx={{ p: '16px' }}>
        <Typography variant="body1">
          ออกจากระบบ
        </Typography>
      </Box>
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

export default HomePage;
