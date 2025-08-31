import React, { useState } from "react";
import {
  AppBar,
  Toolbar,
  Tabs,
  Tab,
  Box,
  Button,
  TextField,
  InputAdornment,
  MenuItem,
  Select,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import AddIcon from "@mui/icons-material/Add";
import RoomList from "../RoomList/RoomList"; // Import your components
import InvoiceHistory from "../InvoiceHistory/InvoiceHistory"; // Import your components

const HomeNavBar = () => {
  const navigationItems = [
    { label: "ห้องทั้งหมด", path: "room-list", component: <RoomList /> },
    { label: "ใบแจ้งหนี้", path: "invoice-history", component: <InvoiceHistory /> },
  ];

  const [tabValue, setTabValue] = useState(0);
  const [sortBy, setSortBy] = useState("เลขห้อง");
  const [searchTerm, setSearchTerm] = useState("");

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };

  const CurrentComponent = navigationItems[tabValue].component;

  return (
    <div>
      <AppBar position="static" color="transparent" elevation={0}>
        <Toolbar>
          {/* Tabs */}
          <Tabs
            value={tabValue}
            onChange={handleTabChange}
            textColor="primary"
            indicatorColor="primary"
          >
            {navigationItems.map((item) => (
              <Tab key={item.path} label={item.label} />
            ))}
          </Tabs>

          {/* ช่องว่างดันไปขวา */}
          <Box sx={{ flexGrow: 1 }} />

          {/* Dropdown เรียงลำดับ */}
          <Select
            size="small"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            sx={{ mr: 2 }}
          >
            <MenuItem value="เลขห้อง">เลขห้อง</MenuItem>
            <MenuItem value="ชื่อ">ชื่อ</MenuItem>
            <MenuItem value="วันที่">วันที่</MenuItem>
          </Select>

          {/* ค้นหา */}
          <TextField
            size="small"
            placeholder="ค้นหา"
            value={searchTerm}
            onChange={handleSearchChange}
            sx={{ mr: 2, bgcolor: "#f0f4fa", borderRadius: 2 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
          />

          {/* ปุ่มเพิ่มห้อง */}
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
          >
            เพิ่มห้อง
          </Button>
        </Toolbar>
      </AppBar>

      {/* Render the current component */}
      <div>
        {React.cloneElement(CurrentComponent, { 
          searchTerm: searchTerm,
          sortBy: sortBy 
        })}
      </div>
    </div>
  );
};

export default HomeNavBar;