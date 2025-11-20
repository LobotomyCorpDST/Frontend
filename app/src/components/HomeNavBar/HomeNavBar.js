import React, { useState } from "react";
import {
    Box,
    Button,
    Paper,
    Typography,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";

const HomeNavBar = ({ navigationItems, activeIndex, onTabChange, ...props }) => {
    const [addRoomSignal, setAddRoomSignal] = useState(0);
    const [addInvoiceSignal, setAddInvoiceSignal] = useState(0);
    const [addTenantSignal, setAddTenantSignal] = useState(0);
    const [addMaintenanceSignal, setAddMaintenanceSignal] = useState(0);
    const [leaseHistoryReloadSignal, setLeaseHistoryReloadSignal] = useState(0);
    const [leaseHistoryCreateSignal, setLeaseHistoryCreateSignal] = useState(0);
    const [leaseHistoryLoading, setLeaseHistoryLoading] = useState(false);
    const [userManagementCreateSignal, setUserManagementCreateSignal] = useState(0);
    const [supplyInventoryAddSignal, setSupplyInventoryAddSignal] = useState(0);

    const currentItem = navigationItems[activeIndex] || navigationItems[0] || {};
    const CurrentComponent = currentItem.component;
    const currentPageLabel = currentItem.label || '';
    const isLeaseHistoryPage = currentPageLabel === "ประวัติสัญญาเช่า";
    const isDashboardPage = currentPageLabel === "สรุปภาพรวม";
    const isSummaryPage = currentPageLabel === "รายงานสรุป";
    const signalMap = {
        addRoomSignal,
        addInvoiceSignal,
        addTenantSignal,
        addMaintenanceSignal,
        leaseHistoryReloadSignal,
        leaseHistoryCreateSignal,
        onLeaseHistoryLoadingChange: setLeaseHistoryLoading,
        userManagementCreateSignal,
        supplyInventoryAddSignal,
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
            currentPageLabel === "ผู้เช่าทั้งหมด" ||
            currentPageLabel === "จัดการบัญชีผู้ใช้" ||
            currentPageLabel === "คลังวัสดุ") {
            return userRole === 'ADMIN'; // Only ADMIN for these pages
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
        } else if (currentPageLabel === "จัดการบัญชีผู้ใช้") {
            setUserManagementCreateSignal((s) => s + 1);
        } else if (currentPageLabel === "คลังวัสดุ") {
            setSupplyInventoryAddSignal((s) => s + 1);
        }
    };

    const handleLeaseHistoryReload = () => {
        setLeaseHistoryReloadSignal((s) => s + 1);
    };

    const handleLeaseHistoryCreate = () => {
        setLeaseHistoryCreateSignal((s) => s + 1);
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
            case "ประวัติสัญญาเช่า":
                return "เพิ่มสัญญาเช่า";
            case "คลังวัสดุ":
                return "เพิ่มของ";
            case "จัดการบัญชีผู้ใช้":
                return "สร้างผู้ใช้ใหม่";
            default:
                return "เพิ่มใหม่";
        }
    };

    const getAddButtonDataCy = () => {
        switch (currentPageLabel) {
            case "คลังวัสดุ":
                return "supply-inventory-add-button";
            case "จัดการบัญชีผู้ใช้":
                return "user-management-create-user-button";
            default:
                return "home-nav-bar-add-button";
        }
    };

    const getTitleDataCy = () => {
        switch (currentPageLabel) {
            case "คลังวัสดุ":
                return "supply-inventory-title";
            case "จัดการบัญชีผู้ใช้":
                return "user-management-title";
            case "รายงานสรุป":
                return "summary-report-title"
            case "สรุปภาพรวม":
                return "dashboard-title";
            default:
                return "lease-history-title";
        }
    };

    return (
        <Box
            sx={{ maxWidth: "1800px", margin: "40px auto", px: 3 }}
            {...props}
        >

            <Paper
                elevation={8}
                sx={{ borderRadius: "8px", overflow: "hidden" }}
                data-cy="home-nav-bar-paper-container"
            >
                <Typography
                    variant="h4"
                    gutterBottom
                    sx={{ fontWeight: 'bold', color: 'primary.main', mt: 5 }}
                    data-cy={getTitleDataCy()}
                >
                    {currentPageLabel}
                </Typography>
                <Box
                    sx={{
                        p: isDashboardPage | isSummaryPage ? 0 : 3,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: isLeaseHistoryPage ? "space-between" : "flex-end",
                        flexWrap: isLeaseHistoryPage ? "wrap" : "nowrap",
                        gap: isLeaseHistoryPage ? 2 : 0,
                    }}
                    data-cy="home-nav-bar-actions-toolbar"
                >
                    {!isDashboardPage && !isSummaryPage && (
                        <>
                            {isLeaseHistoryPage && (
                                <>
                                    <Button
                                        variant="contained"
                                        onClick={handleLeaseHistoryReload}
                                        disabled={leaseHistoryLoading}
                                        data-cy="lease-history-reload-button"
                                    >
                                        โหลดทั้งหมด
                                    </Button>
                                    <Button
                                        variant="contained"
                                        onClick={handleLeaseHistoryCreate}
                                        data-cy="lease-history-create-lease-button"
                                    >
                                        + เพิ่มสัญญาเช่า
                                    </Button>
                                </>
                            )}

                            {!isLeaseHistoryPage && showAdd && (
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
                                    data-cy={getAddButtonDataCy()}
                                >
                                    {getButtonLabel()}
                                </Button>
                            )}
                        </>
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
