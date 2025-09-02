import React, { useState } from "react";
import {
  Box,
  Button,
  InputAdornment,
  Tab,
  Tabs,
  TextField,
  Paper
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import AddIcon from "@mui/icons-material/Add";
import RoomList from "../RoomList/RoomList"; // Assuming this component exists
import InvoiceHistory from "../InvoiceHistory/InvoiceHistory"; // Assuming this component exists

const HomePage = () => {
  const navigationItems = [
    { label: "ห้องทั้งหมด", component: <RoomList /> },
    { label: "ใบแจ้งหนี้", component: <InvoiceHistory /> },
  ];

  const [tabValue, setTabValue] = useState(0);
  const [sortBy, setSortBy] = useState("เลขห้อง"); // State for the new dropdown
  const [searchTerm, setSearchTerm] = useState("");

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };


  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };

  const CurrentComponent = navigationItems[tabValue].component;

  return (
    // Main container to set max-width and center the content on the page
    <Box sx={{ maxWidth: "1200px", margin: "40px auto", px: 3 }}>

      <Paper sx={{ borderRadius: '8px', overflow: 'hidden' }}>

        {/* ส่วนของ Controls ที่จะอยู่ข้างใน Paper */}
        <Box sx={{ p: 3, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Tabs value={tabValue} onChange={handleTabChange}>
            {navigationItems.map((item, index) => (
              <Tab key={index} label={item.label} sx={{ textTransform: "none", fontWeight: 600, fontSize: "1rem" }} />
            ))}
          </Tabs>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            {/* คุณสามารถเปิดใช้งาน SortBy dropdown ตรงนี้ได้ถ้าต้องการ */}
            {/* <FormControl ... /> */}
            <TextField
              size="small"
              placeholder="ค้นหา"
              value={searchTerm}
              onChange={handleSearchChange}
              sx={{ backgroundColor: "#f0f4fa", borderRadius: "8px", "& .MuiOutlinedInput-notchedOutline": { border: 0 } }}
              InputProps={{ startAdornment: (<InputAdornment position="start"><SearchIcon /></InputAdornment>) }}
            />
            <Button variant="contained" startIcon={<AddIcon />} sx={{ textTransform: "none", fontWeight: "bold", borderRadius: "8px", boxShadow: 'none' }}>
              เพิ่มห้อง
            </Button>
          </Box>
        </Box>

        {/* ส่วนของตาราง (ลูก) ที่จะอยู่ข้างใน Paper */}
        {React.cloneElement(CurrentComponent, {
          searchTerm: searchTerm,
          sortBy: sortBy,
        })}
      </Paper>
    </Box>
  );
};

export default HomePage;