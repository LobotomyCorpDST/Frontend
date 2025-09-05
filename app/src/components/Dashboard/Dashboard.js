import React, { useState, useEffect } from 'react';
import {
    Typography,
    Chip,
    Stack,
    Box
} from "@mui/material";
import { placeholderData } from '../../data/placeholderData';


const Dashboard = () => {
    const [status, setStatus] = useState([]);

    useEffect(() => {
        setStatus(placeholderData);
    }, []);

    const availableRooms = status.filter(room =>
        room.roomStatus.toLowerCase() === 'room available'
    );

    const unavailableRooms = status.filter(room =>
        room.roomStatus.toLowerCase() !== 'room available'
    );

    return (
        <>
            <Box container sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography sx={{ fontSize: '24px', fontWeight: 'bold' }}>ห้องทั้งหมด</Typography>
                <Chip label={status.length} />
                <Typography sx={{ fontSize: '24px', fontWeight: 'bold' }}>ว่าง</Typography>
                <Chip label={availableRooms.length} />
                <Typography sx={{ fontSize: '24px', fontWeight: 'bold' }}>ไม่ว่าง</Typography>
                <Chip label={unavailableRooms.length} />
            </Box>

        </>
    );
}

export default Dashboard