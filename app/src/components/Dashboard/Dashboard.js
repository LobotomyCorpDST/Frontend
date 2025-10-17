// src/components/Dashboard/Dashboard.js
import React, { useState, useEffect } from 'react';
import {
    Typography,
    Chip,
    Stack,
    Box,
    Card,
    CardContent,
    CircularProgress
} from "@mui/material";
import { useNavigate, useLocation } from 'react-router-dom';

import http from '../../api/http'; // << ใช้ตัวห่อที่ใส่ Authorization ให้



const Dashboard = ({ isGuest = false }) => {
    const navigate = useNavigate();
    const location = useLocation();
    const [rooms, setRooms] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
    (async () => {
        setLoading(true);
        setError('');
        try {
            // Call via http.js to include the Authorization header
            const roomsData = await http.get('/api/rooms');

            const transformed = (Array.isArray(roomsData) ? roomsData : []).map((room) => ({
                id: room.id,
                roomNumber: room.number,
                floor: Math.floor(Number(room.number) / 100) || 0,
                roomStatus: room.status === 'OCCUPIED' ? 'Not Available' : 'room available',
                tenantInfo: { name: room.tenant?.name || '' },
            }));

            setRooms(transformed);
        } catch (e) {
            setError(e.message || 'Could not load dashboard data.');
        } finally {
            setLoading(false);
        }
    })();
    }, [location.pathname]);

    const handleRoomNumberClick = (roomNumber) => {
        if (isGuest) return;
        navigate(`/room-details/${roomNumber}`);
    };

    // Group rooms by floor using the reduce method
    const roomsByFloor = rooms.reduce((acc, room) => {
        const floor = room.floor;
        // If the floor key doesn't exist in the accumulator, create it
        if (!acc[floor]) {
            acc[floor] = [];
        }
        // Push the current room into the correct floor's array
        acc[floor].push(room);
        return acc;
    }, {});


    const RoomCard = ({ room }) => {
        const isAvailable = room.roomStatus.toLowerCase() === 'room available';
        return (
            <Card
                sx={{
                    width: 150,
                    height: 150,
                    cursor: 'pointer',
                    border: '1px solid',
                    borderColor: isAvailable ? 'success.main' : 'error.main',
                    backgroundColor: isAvailable ? 'success.light' : '#ffebee'
                }}
                onClick={() => !isGuest && handleRoomNumberClick(room.roomNumber)}
            >
                <CardContent sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', height: '100%' }}>
                    <Typography variant="h5" component="div" sx={{ fontWeight: 'bold' }}>
                        {room.roomNumber}
                    </Typography>
                    <Box>
                        <Typography sx={{ mb: 1.5 }} color="text.secondary">
                            {isAvailable ? 'ว่าง' : 'ไม่ว่าง'}
                        </Typography>
                        <Typography variant="body2">
                            {isAvailable ? '' : room.tenantInfo.name}
                        </Typography>
                    </Box>
                </CardContent>
            </Card>
        );
    };

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
                <CircularProgress />
                <Typography sx={{ ml: 2 }}>กำลังโหลด Dashboard...</Typography>
            </Box>
        );
    }

    if (error) {
        return (
            <Box sx={{ p: 3, textAlign: 'center' }}>
                <Typography color="error">Error: {error}</Typography>
            </Box>
        );
    }

    // --- Calculate statistics ---
    const availableRooms = rooms.filter(r => r.roomStatus.toLowerCase() === 'room available');
    const unavailableRooms = rooms.filter(r => r.roomStatus.toLowerCase() !== 'room available');

    return (
        <Box sx={{ p: 3 }}>
            <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                Dashboard
            </Typography>

            <Box sx={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
                {/* The floor selector dropdown has been removed */}
                <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap' }} gap={2}>
                    <Typography sx={{ fontSize: '24px', fontWeight: 'bold' }}>จำนวนห้องทั้งหมด</Typography>
                    <Chip label={rooms.length} color="primary" sx={{ fontSize: '24px', p: 2, borderRadius: '8px' }} />
                    <Typography sx={{ fontSize: '24px', fontWeight: 'bold' }}>ว่าง</Typography>
                    <Chip label={availableRooms.length} color="success" sx={{ fontSize: '24px', p: 2, borderRadius: '8px' }} />
                    <Typography sx={{ fontSize: '24px', fontWeight: 'bold' }}>ไม่ว่าง</Typography>
                    <Chip label={unavailableRooms.length} color="error" sx={{ fontSize: '24px', p: 2, borderRadius: '8px' }} />
                </Box>
            </Box>

            {/* Main content area to display rooms */}
            <Box sx={{ p: 3, backgroundColor: '#f5f5f5', borderRadius: '8px' }}>
                {/* Map over the grouped floors */}
                {Object.keys(roomsByFloor).sort((a, b) => a - b).map(floorNum => (
                    <Box key={floorNum} sx={{ mb: 4 }}>
                        {/* Display a heading for each floor */}
                        <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold' }}>
                            ชั้น {floorNum}
                        </Typography>
                        {/* Display the room cards for the current floor */}
                        <Stack direction="row" spacing={2} useFlexGap flexWrap="wrap">
                            {roomsByFloor[floorNum].map((room) => (
                                <RoomCard key={room.id} room={room} />
                            ))}
                        </Stack>
                    </Box>
                ))}
            </Box>
        </Box>
    );
};

export default Dashboard;