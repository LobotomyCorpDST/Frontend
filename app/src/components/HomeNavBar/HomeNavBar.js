import React, { useState } from "react";
import {
    Box,
    Button,
    Paper,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";

const HomeNavBar = ({ navigationItems, activeIndex, onTabChange, ...props }) => {
    const [addRoomSignal, setAddRoomSignal] = useState(0);
    const [addInvoiceSignal, setAddInvoiceSignal] = useState(0);
    const [addTenantSignal, setAddTenantSignal] = useState(0);
    const [addMaintenanceSignal, setAddMaintenanceSignal] = useState(0);

    const currentItem = navigationItems[activeIndex] || navigationItems[0] || {};
    const CurrentComponent = currentItem.component;
    const currentPageLabel = currentItem.label || '';
    const signalMap = {
        addRoomSignal,
        addInvoiceSignal,
        addTenantSignal,
        addMaintenanceSignal,
    };
    const signalKeys = currentItem.signalKeys || [];
    const injectedProps = signalKeys.reduce((acc, key) => {
        if (Object.prototype.hasOwnProperty.call(signalMap, key)) {
            acc[key] = signalMap[key];
        }
        return acc;
    }, {});

    // Get user role for permission checks
    const userRole = (localStorage.getItem('role') || 'GUEST').toUpperCase();
    const canCreateMaintenance = ['ADMIN', 'USER'].includes(userRole);

    // Show Add button based on page AND permissions
    const showAdd = (() => {
        if (currentPageLabel === "บำรุงรักษา") {
            return canCreateMaintenance; // Only ADMIN and USER can create maintenance
        }
        if (currentPageLabel === "ห้องทั้งหมด" ||
            currentPageLabel === "ใบแจ้งหนี้" ||
            currentPageLabel === "ผู้เช่าทั้งหมด") {
            return userRole === 'ADMIN'; // Only ADMIN for other pages
        }
        return false;
    })();

    const handleAddClick = () => {
        if (currentPageLabel === "ห้องทั้งหมด") {
            setAddRoomSignal((s) => s + 1);
        } else if (currentPageLabel === "ใบแจ้งหนี้") {
            setAddInvoiceSignal((s) => s + 1);
        } else if (currentPageLabel === "ผู้เช่าทั้งหมด") {
            setAddTenantSignal((s) => s + 1);
        } else if (currentPageLabel === "บำรุงรักษา") {
            setAddMaintenanceSignal((s) => s + 1);
        }
    };

    const getButtonLabel = () => {
        switch (currentPageLabel) {
            case "ห้องทั้งหมด":
                return "เพิ่มห้อง";
            case "ใบแจ้งหนี้":
                return "เพิ่มใบแจ้งหนี้";
            case "ผู้เช่าทั้งหมด":
                return "เพิ่มผู้เช่า";
            case "บำรุงรักษา":
                return "เพิ่มรายการแจ้งซ่อม";
            default:
                return "Add";
        }
    };

    return (
        <Box
            sx={{ maxWidth: "1800px", margin: "40px auto", px: 3 }}
            {...props}
        >
            <Paper
                sx={{ borderRadius: "8px", overflow: "hidden" }}
                data-cy="home-nav-bar-paper-container" 
            >
                <Box
                    sx={{
                        p: 3,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "end",
                    }}
                    data-cy="home-nav-bar-actions-toolbar" 
                >
                    {showAdd && (
                        <Button
                            variant="contained"
                            startIcon={<AddIcon />}
                            onClick={handleAddClick}
                            sx={{
                                textTransform: "none",
                                fontWeight: "bold",
                                borderRadius: "8px",
                                boxShadow: "none",
                            }}
                            data-cy="home-nav-bar-add-button" 
                        >
                            {getButtonLabel()}
                        </Button>
                    )}
                </Box>

                {/* This box will wrap the currently active component */}
                <Box data-cy="home-nav-bar-active-component-container">
                    {CurrentComponent ? React.cloneElement(CurrentComponent, injectedProps) : null}
                </Box>
            </Paper>
        </Box>
    );
};

export default HomeNavBar;
