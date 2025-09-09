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

    const handleSearchChange = (event) => {
        setSearchTerm(event.target.value);
    };

    const CurrentComponent = navigationItems[activeIndex].component;
    const currentPageLabel = navigationItems[activeIndex].label;

    return (
        <Box sx={{ maxWidth: "1200px", margin: "40px auto", px: 3 }}>
            <Paper sx={{ borderRadius: '8px', overflow: 'hidden' }}>
                <Box
                    sx={{
                        p: 3,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'end'
                    }}
                >
                    {currentPageLabel !== "Dashboard" && (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <TextField
                                size="small"
                                placeholder="ค้นหา"
                                value={searchTerm}
                                onChange={handleSearchChange}
                                sx={{ backgroundColor: "#f0f4fa", borderRadius: "8px", "& .MuiOutlinedInput-notchedOutline": { border: 0 } }}
                                InputProps={{ startAdornment: (<InputAdornment position="start"><SearchIcon /></InputAdornment>) }}
                            />
                            <Button variant="contained" startIcon={<AddIcon />} sx={{ textTransform: "none", fontWeight: "bold", borderRadius: "8px", boxShadow: 'none' }}>
                                {currentPageLabel === "ห้องทั้งหมด" ? "เพิ่มห้อง" : "เพิ่มใบแจ้งหนี้"}
                            </Button>
                        </Box>
                    )}
                </Box>

                {
                    React.cloneElement(CurrentComponent, {
                        searchTerm: searchTerm,
                    })
                }
            </Paper >
        </Box >
    );
};

export default HomeNavBar;