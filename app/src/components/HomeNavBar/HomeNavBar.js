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

  const CurrentComponent = navigationItems[activeIndex].component;
  const currentPageLabel = navigationItems[activeIndex].label;

  const showSearch =
    currentPageLabel !== "Dashboard" &&
    currentPageLabel !== "ประวัติสัญญาเช่า";

  const showAdd =
    currentPageLabel === "ห้องทั้งหมด" ||
    currentPageLabel === "ใบแจ้งหนี้" ||
    currentPageLabel === "บำรุงรักษา";

  const handleSearchChange = (event) => setSearchTerm(event.target.value);

  const handleAddClick = () => {
    if (currentPageLabel === "ห้องทั้งหมด") {
      setAddRoomSignal((s) => s + 1);
    } else if (currentPageLabel === "ใบแจ้งหนี้") {
      setAddInvoiceSignal((s) => s + 1);
    }
  };

  return (
    <Box sx={{ maxWidth: "1200px", margin: "40px auto", px: 3 }}>
      <Paper sx={{ borderRadius: "8px", overflow: "hidden" }}>
        <Box
          sx={{
            mt: 2,
            p: 2,
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
                  {
                    currentPageLabel === "ห้องทั้งหมด"
                      ? "เพิ่มห้อง"
                      : currentPageLabel === "บำรุงรักษา"
                        ? "เพิ่มรายการแจ้งซ่อม"
                        : "เพิ่มใบแจ้งหนี้"
                  }
                </Button>
              )}
            </Box>
          )}
        </Box>

        {React.cloneElement(CurrentComponent, {
          searchTerm,
          addRoomSignal,
          addInvoiceSignal,
        })}
      </Paper>
    </Box>
  );
};

export default HomeNavBar;
