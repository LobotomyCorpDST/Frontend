import React, { useState } from "react";
import {
  Box,
  Button,
  InputAdornment,
  TextField,
  Paper,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import AddIcon from "@mui/icons-material/Add";

const HomeNavBar = ({ navigationItems, activeIndex, onTabChange }) => {
    const [searchTerm, setSearchTerm] = useState("");
    const [addRoomSignal, setAddRoomSignal] = useState(0);
    const [addInvoiceSignal, setAddInvoiceSignal] = useState(0);
    const [addTenantSignal, setAddTenantSignal] = useState(0);
    const [addMaintenanceSignal, setAddMaintenanceSignal] = useState(0);

    const CurrentComponent = navigationItems[activeIndex].component;
    const currentPageLabel = navigationItems[activeIndex].label;

    const showSearch =
        currentPageLabel !== "Dashboard" &&
        currentPageLabel !== "ประวัติสัญญาเช่า" &&
        currentPageLabel !== "รายงานสรุป";

    const showAdd =
        currentPageLabel === "ห้องทั้งหมด" ||
        currentPageLabel === "ใบแจ้งหนี้" ||
        currentPageLabel === "ผู้เช่าทั้งหมด" ||
        currentPageLabel === "บำรุงรักษา";

    const handleSearchChange = (event) => setSearchTerm(event.target.value);

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
                                <TextField
                                    size="small"
                                    placeholder="ค้นหา"
                                    value={searchTerm}
                                    onChange={handleSearchChange}
                                    sx={{
                                        backgroundColor: "#f0f4fa",
                                        borderRadius: "8px",
                                        "& .MuiOutlinedInput-notchedOutline": { border: 0 },
                                    }}
                                    InputProps={{
                                        startAdornment: (
                                            <InputAdornment position="start">
                                                <SearchIcon />
                                            </InputAdornment>
                                        ),
                                    }}
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

                {React.cloneElement(CurrentComponent, {
                    searchTerm,
                    addRoomSignal,
                    addInvoiceSignal,
                    addTenantSignal,
                    addMaintenanceSignal,
                })}
            </Paper>
        </Box>
    );
};

export default HomeNavBar;