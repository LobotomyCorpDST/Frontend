import React, { useState, useEffect } from 'react';
import {
    Typography,
    Chip,
    Stack,
    Box,
    Card,
    CardContent,
    CircularProgress,
    Alert
} from "@mui/material";
import { useNavigate, useLocation } from 'react-router-dom';

import http from '../../api/http';
import MaintenanceToastPanel from '../Notifications/MaintenanceToastPanel';

const Dashboard = ({ isGuest = false, ...props }) => {
    const navigate = useNavigate();
    const location = useLocation();
    const [rooms, setRooms] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // Get user role and room(s) for USER role restrictions
    const userRole = (localStorage.getItem('role') || 'GUEST').toUpperCase();
    const userRoomIds = localStorage.getItem('room_ids'); // Comma-separated room numbers (e.g., "201,305,412")
    const isUserRole = userRole === 'USER';

    useEffect(() => {
        (async () => {
            setLoading(true);
            setError('');
            try {
                // ✅ ใช้ /api/rooms เพื่อให้ตรงกับ back-end รอบนี้
                const roomsData = await http.get('/api/rooms');

                let transformed = (Array.isArray(roomsData) ? roomsData : []).map((room) => ({
                    id: room.id,
                    roomNumber: room.number,
                    floor: Math.floor(Number(room.number) / 100) || 0,
                    roomStatus: room.status === 'OCCUPIED' ? 'Not Available' : 'room available',
                    tenantInfo: { name: room.tenant?.name || '' },
                }));

                // USER role: Only show their assigned rooms (comma-separated)
                if (isUserRole && userRoomIds) {
                    const roomNumbersArray = userRoomIds.split(',').map(num => parseInt(num.trim(), 10));
                    transformed = transformed.filter((room) => {
                        const roomNum = typeof room.roomNumber === 'number' ? room.roomNumber : parseInt(room.roomNumber, 10);
                        return roomNumbersArray.includes(roomNum);
                    });
                }

                setRooms(transformed);
            } catch (e) {
                // Log error for debugging
                console.error('ข้อผิดพลาดในการแสดงผลหน้าสรุปภาพรวม:', e);
                setError(e.message || 'ไม่สามารถโหลดข้อมูลได้');
                setRooms([]); // Set to empty on any error
            } finally{
                setLoading(false);
            }
        })();
    }, [location.pathname, isUserRole, userRoomIds, isGuest]);

    const handleRoomNumberClick = (roomNumber) => {
        if (isGuest) return;

        // For USER role, filter already ensures rooms array only contains their room
        // So we can navigate directly
        navigate(`/room-details/${roomNumber}`);
    };

    const roomsByFloor = rooms.reduce((acc, room) => {
        const floor = room.floor;
        if (!acc[floor]) acc[floor] = [];
        acc[floor].push(room);
        return acc;
    }, {});

    const RoomCard = ({ room }) => {
        const isAvailable = room.roomStatus.toLowerCase() === 'room available';
        // For USER role, filter already ensures this room is clickable
        const canClickRoom = !isGuest;

        return (
            <Card
                sx={{
                    width: 150,
                    height: 150,
                    cursor: canClickRoom ? 'pointer' : 'default',
                    border: '5px solid',
                    borderColor: '#FFFFFF',
                    backgroundColor: isAvailable ? '#00A441' : '#A41E00',
                    transition: 'transform 0.15s ease',
                    '&:hover': canClickRoom ? { transform: 'scale(1.03)' } : {},
                    // opacity: canClickRoom ? 1 : 0.6
                }}
                onClick={() => canClickRoom && handleRoomNumberClick(room.roomNumber)}
                data-cy={`dashboard-room-card-${room.roomNumber}`}
            >
                <CardContent sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', height: '100%' }}>
                    <Typography
                        variant="h5"
                        component="div"
                        sx={{ fontWeight: 'bold' }}
                        color={'#FFFFFF'}
                        data-cy={`dashboard-room-card-number-${room.roomNumber}`}
                    >
                        {room.roomNumber}
                    </Typography>
                    <Box>
                        <Typography
                            sx={{ mb: 1.5 }}
                            color={"#FFFFFF"}
                            opacity={0.8}
                            data-cy={`dashboard-room-card-status-${room.roomNumber}`}
                        >
                            {isAvailable ? 'ว่าง' : 'ไม่ว่าง'}
                        </Typography>
                        <Typography
                            variant="body2"
                            data-cy={`dashboard-room-card-tenant-${room.roomNumber}`}
                        >
                            {isAvailable ? '' : room.tenantInfo.name}
                        </Typography>
                    </Box>
                </CardContent>
            </Card>
        );
    };

    if (loading) {
        return (
            <Box
                sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}
                data-cy="dashboard-loading-state"
            >
                <CircularProgress />
                <Typography
                    sx={{ ml: 2 }}
                    data-cy="dashboard-loading-text"
                >
                    กำลังโหลด หน้าสรุปภาพรวม...
                </Typography>
            </Box>
        );
    }

    if (error) {
        return (
            <Box
                sx={{ p: 3, textAlign: 'center' }}
                data-cy="dashboard-error-state"
            >
                <Typography
                    color="error"
                    data-cy="dashboard-error-message"
                >
                    Error: {error}
                </Typography>
            </Box>
        );
    }

    const availableRooms = rooms.filter(r => r.roomStatus.toLowerCase() === 'room available');
    const unavailableRooms = rooms.filter(r => r.roomStatus.toLowerCase() !== 'room available');

    return (
        <Box sx={{ p: 3 }} {...props} data-cy="dashboard-page">
            {/* แจ้งเตือนงานซ่อมถึงกำหนดวันนี้ - Hide for GUEST */}
            {!isGuest && <MaintenanceToastPanel data-cy="dashboard-maintenance-toast" />}

            {/* Guest welcome message */}
            {isGuest && rooms.length === 0 && (
                <Alert
                    severity="info"
                    sx={{ mb: 3 }}
                    data-cy="dashboard-guest-welcome-alert"
                >
                    ยินดีต้อนรับ! คุณกำลังใช้งานในโหมดผู้เยี่ยมชม แสดงภาพรวมการจัดการห้องเช่า
                </Alert>
            )}

            <Box
                sx={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}
                data-cy="dashboard-stats-container"
            >
                <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap' }} gap={2}>
                    <Typography sx={{ fontSize: '24px', fontWeight: 'bold' }}>จำนวนห้องทั้งหมด</Typography>
                    <Chip
                        label={rooms.length}
                        color="primary"
                        sx={{ fontSize: '24px', p: 2, borderRadius: '8px' }}
                        data-cy="dashboard-stats-total-rooms"
                    />
                    <Typography sx={{ fontSize: '24px', fontWeight: 'bold' }}>ว่าง</Typography>
                    <Chip
                        label={availableRooms.length}
                        color="success"
                        sx={{ fontSize: '24px', p: 2, borderRadius: '8px' }}
                        data-cy="dashboard-stats-available-rooms"
                    />
                    <Typography sx={{ fontSize: '24px', fontWeight: 'bold' }}>ไม่ว่าง</Typography>
                    <Chip
                        label={unavailableRooms.length}
                        color="error"
                        sx={{ fontSize: '24px', p: 2, borderRadius: '8px' }}
                        data-cy="dashboard-stats-unavailable-rooms"
                    />
                </Box>
            </Box>

            {/*<Box sx={{ p: 3, backgroundColor: '#f5f5f5', borderRadius: '8px' }}>*/}
            <Box
                sx={{ p: 3, borderRadius: '8px' }}
                data-cy="dashboard-floors-container"
            >
                {Object.keys(roomsByFloor)
                    .map(Number)
                    .sort((a, b) => a - b)
                    .map(floorNum => (
                        <Box
                            key={floorNum}
                            sx={{ mb: 4 }}
                            data-cy={`dashboard-floor-section-${floorNum}`}
                        >
                            <Typography
                                variant="h5"
                                gutterBottom
                                sx={{ fontWeight: 'bold' }}
                                data-cy={`dashboard-floor-title-${floorNum}`}
                            >
                                ชั้น {floorNum}
                            </Typography>
                            <Stack
                                direction="row"
                                spacing={2}
                                useFlexGap
                                flexWrap="wrap"
                                sx={{backgroundColor: '#f5f5f5',p: 2,borderRadius: 2}}
                                data-cy={`dashboard-floor-stack-${floorNum}`}
                            >
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