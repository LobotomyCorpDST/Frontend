import React, { useState, useEffect } from 'react';
import {
    Typography,
    Chip,
    Stack,
    Box,
    InputLabel,
    Select,
    MenuItem,
    FormControl,
} from "@mui/material";
import { placeholderData } from '../../data/placeholderData';

// ไม่จำเป็นต้อง import SelectChangeEvent ถ้าไม่ได้ใช้ type โดยตรง

const Dashboard = () => {
    const [status, setStatus] = useState([]);
    const [floor, setFloor] = useState(1);

    useEffect(() => {
        setStatus(placeholderData);
    }, []);

    const handleChange = (event) => {
        // event.target.value จะเป็น string ต้องแปลงเป็น Number เพื่อเปรียบเทียบ
        setFloor(Number(event.target.value));
    };

    // ทำให้การเช็ค status ไม่ขึ้นกับตัวพิมพ์เล็ก/ใหญ่ (case-insensitive)
    const availableRooms = status.filter(room =>
        room.roomStatus.toLowerCase() === 'room available'
    );

    const unavailableRooms = status.filter(room =>
        room.roomStatus.toLowerCase() !== 'room available'
    );
    
    // กรองห้องตามชั้นที่เลือกไว้ใน state `floor`
    const filteredRoomsByFloor = status.filter(room => room.floor === floor);

    return (
        <>
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mr: 2, alignItems: 'center', flexWrap: 'wrap' }} gap={2}>
                <Typography sx={{ fontSize: '24px', fontWeight: 'bold' }}>ห้องทั้งหมด</Typography>
                <Chip label={status.length} color="primary" sx={{ fontSize: '24px', p: 2, borderRadius: '8px' }} />
                <Typography sx={{ fontSize: '24px', fontWeight: 'bold' }}>ว่าง</Typography>
                <Chip label={availableRooms.length} color="success" sx={{ fontSize: '24px', p: 2, borderRadius: '8px' }} />
                <Typography sx={{ fontSize: '24px', fontWeight: 'bold' }}>ไม่ว่าง</Typography>
                <Chip label={unavailableRooms.length} color="error" sx={{ fontSize: '24px', p: 2, borderRadius: '8px' }} />
            </Box>
            
            <Box sx={{ maxWidth: 120, ml: 3 }}>
                <FormControl fullWidth>
                    <InputLabel id="floor-select-label">ชั้น</InputLabel>
                    <Select
                        labelId="floor-select-label"
                        id="floor-select"
                        value={floor}
                        label="ชั้น"
                        onChange={handleChange}
                    >
                        <MenuItem value={1}>ชั้น 1</MenuItem>
                        <MenuItem value={2}>ชั้น 2</MenuItem>
                    </Select>
                </FormControl>
            </Box>
            
            {/* ส่วนที่แสดงผล Chip ของแต่ละห้อง */}
            <Box sx={{ p: 3 }}>
                <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
                    {filteredRoomsByFloor.map((room) => (
                        <Chip
                            key={room.id} 
                            label={room.roomNumber}
                            color={room.roomStatus.toLowerCase() === "room available" ? "success" : "error"}
                        />
                    ))}
                </Stack>
            </Box>
        </>
    );
}

export default Dashboard;