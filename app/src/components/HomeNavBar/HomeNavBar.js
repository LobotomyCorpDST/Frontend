import React, { useState, useCallback } from "react";
import {
  Box,
  Button,
  Paper,
  InputAdornment,
  Autocomplete,
  TextField,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import SearchIcon from "@mui/icons-material/Search";
import { fuzzyFilter } from '../../utils/fuzzySearch';

const HomeNavBar = ({ navigationItems, activeIndex, onTabChange }) => {
    const [addRoomSignal, setAddRoomSignal] = useState(0);
    const [addInvoiceSignal, setAddInvoiceSignal] = useState(0);
    const [addTenantSignal, setAddTenantSignal] = useState(0);
    const [addMaintenanceSignal, setAddMaintenanceSignal] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [searchOptions, setSearchOptions] = useState([]);

    const CurrentComponent = navigationItems[activeIndex].component;
    const currentPageLabel = navigationItems[activeIndex].label;
    const currentProps = navigationItems[activeIndex].props || {};

    // Get user role for permission checks
    const userRole = (localStorage.getItem('role') || 'GUEST').toUpperCase();
    const canCreateMaintenance = ['ADMIN', 'USER'].includes(userRole);

    // Show search bar based on current page (exclude certain pages)
    const showSearch = ![
        "หน้าหลัก",
        "รายงานการเงิน",
        "ประวัติสัญญาเช่า",
        "คลังอพาร์ทเมนต์"
    ].includes(currentPageLabel);

    // Search handlers
    const handleSearchOptionsUpdate = useCallback((options) => {
        setSearchOptions(options || []);
    }, []);

    const handleSearchInputChange = (_event, newInputValue) => {
        setSearchTerm(newInputValue);
    };

    const handleSearchChange = (_event, newValue) => {
        if (typeof newValue === 'string') {
            // User typed and pressed Enter (freeSolo behavior)
            setSearchTerm(newValue);
        } else if (newValue && typeof newValue === 'object') {
            // User selected from dropdown
            const selectedValue = newValue.label || newValue.value || String(newValue.id || '');
            setSearchTerm(selectedValue);
        } else {
            // Cleared
            setSearchTerm('');
        }
    };

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
            setAddMaintenanceSignal(Date.now());
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
        <Box sx={{ maxWidth: "1800px", margin: "40px auto", px: 3 }}>
            <Paper sx={{ borderRadius: "8px", overflow: "hidden" }}>
                <Box
                    sx={{
                        p: 3,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "end",
                    }}
                >
                    {(showSearch || showAdd) && (
                        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                            {showSearch && (
                                <Autocomplete
                                    size="small"
                                    freeSolo
                                    options={searchOptions}
                                    inputValue={searchTerm}
                                    onInputChange={handleSearchInputChange}
                                    onChange={handleSearchChange}
                                    getOptionLabel={(option) => {
                                        if (typeof option === 'string') return option;
                                        return option?.label || String(option?.value || option?.id || '');
                                    }}
                                    filterOptions={(options, { inputValue }) => {
                                        // Use fuzzy search for filtering
                                        return fuzzyFilter(options, inputValue, 10);
                                    }}
                                    sx={{ minWidth: 300 }}
                                    renderInput={(params) => (
                                        <TextField
                                            {...params}
                                            placeholder="ค้นหา"
                                            sx={{
                                                backgroundColor: "#f0f4fa",
                                                borderRadius: "8px",
                                                "& .MuiOutlinedInput-notchedOutline": { border: 0 },
                                            }}
                                            InputProps={{
                                                ...params.InputProps,
                                                startAdornment: (
                                                    <>
                                                        <InputAdornment position="start">
                                                            <SearchIcon />
                                                        </InputAdornment>
                                                        {params.InputProps.startAdornment}
                                                    </>
                                                ),
                                            }}
                                        />
                                    )}
                                />
                            )}

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
                                >
                                    {getButtonLabel()}
                                </Button>
                            )}
                        </Box>
                    )}
                </Box>

                <CurrentComponent
                    {...currentProps}
                    searchTerm={searchTerm}
                    onSearchOptionsUpdate={handleSearchOptionsUpdate}
                    addRoomSignal={addRoomSignal}
                    addInvoiceSignal={addInvoiceSignal}
                    addTenantSignal={addTenantSignal}
                    addMaintenanceSignal={addMaintenanceSignal}
                />
            </Paper>
        </Box>
    );
};

export default HomeNavBar;