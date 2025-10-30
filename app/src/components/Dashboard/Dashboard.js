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

import http from '../../api/http';
import MaintenanceToastPanel from '../Notifications/MaintenanceToastPanel';

const Dashboard = ({ isGuest = false }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Get user role and room for USER role restrictions
  const userRole = (localStorage.getItem('role') || 'GUEST').toUpperCase();
  const userRoomId = localStorage.getItem('room_id');
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

        // USER role: Only show their assigned room
        if (isUserRole && userRoomId) {
          transformed = transformed.filter((room) => room.id === parseInt(userRoomId));
        }

        setRooms(transformed);
      } catch (e) {
        setError(e.message || 'Could not load dashboard data.');
      } finally {
        setLoading(false);
      }
    })();
  }, [location.pathname, isUserRole, userRoomId]);

  const handleRoomNumberClick = (roomNumber) => {
    if (isGuest) return;

    // USER role: Only allow clicking their own room
    if (isUserRole) {
      const clickedRoom = rooms.find(r => r.roomNumber === roomNumber);
      if (clickedRoom && clickedRoom.id === parseInt(userRoomId)) {
        navigate(`/room-details/${roomNumber}`);
      }
      return;
    }

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
    const canClickRoom = !isGuest && (!isUserRole || room.id === parseInt(userRoomId));

    return (
      <Card
        sx={{
          width: 150,
          height: 150,
          cursor: canClickRoom ? 'pointer' : 'default',
          border: '1px solid',
          borderColor: isAvailable ? 'success.main' : 'error.main',
          backgroundColor: isAvailable ? 'success.light' : '#ffebee',
          transition: 'transform 0.15s ease',
          '&:hover': canClickRoom ? { transform: 'scale(1.03)' } : {},
          opacity: canClickRoom ? 1 : 0.6
        }}
        onClick={() => canClickRoom && handleRoomNumberClick(room.roomNumber)}
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

  const availableRooms = rooms.filter(r => r.roomStatus.toLowerCase() === 'room available');
  const unavailableRooms = rooms.filter(r => r.roomStatus.toLowerCase() !== 'room available');

  return (
    <Box sx={{ p: 3 }}>
      {/* แจ้งเตือนงานซ่อมถึงกำหนดวันนี้ */}
      <MaintenanceToastPanel />

      <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold', color: 'primary.main' }}>
        Dashboard
      </Typography>

      <Box sx={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap' }} gap={2}>
          <Typography sx={{ fontSize: '24px', fontWeight: 'bold' }}>จำนวนห้องทั้งหมด</Typography>
          <Chip label={rooms.length} color="primary" sx={{ fontSize: '24px', p: 2, borderRadius: '8px' }} />
          <Typography sx={{ fontSize: '24px', fontWeight: 'bold' }}>ว่าง</Typography>
          <Chip label={availableRooms.length} color="success" sx={{ fontSize: '24px', p: 2, borderRadius: '8px' }} />
          <Typography sx={{ fontSize: '24px', fontWeight: 'bold' }}>ไม่ว่าง</Typography>
          <Chip label={unavailableRooms.length} color="error" sx={{ fontSize: '24px', p: 2, borderRadius: '8px' }} />
        </Box>
      </Box>

      <Box sx={{ p: 3, backgroundColor: '#f5f5f5', borderRadius: '8px' }}>
        {Object.keys(roomsByFloor)
          .map(Number)
          .sort((a, b) => a - b)
          .map(floorNum => (
            <Box key={floorNum} sx={{ mb: 4 }}>
              <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold' }}>
                ชั้น {floorNum}
              </Typography>
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
