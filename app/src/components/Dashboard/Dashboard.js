// src/components/Dashboard/Dashboard.js
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
  Card,
  CardContent,
  CircularProgress
} from "@mui/material";
import { useNavigate } from 'react-router-dom';
import http from '../../api/http'; // << ใช้ตัวห่อที่ใส่ Authorization ให้

const Dashboard = () => {
  const navigate = useNavigate();
  const [rooms, setRooms] = useState([]);
  const [floor, setFloor] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    (async () => {
      setLoading(true);
      setError('');
      try {
        // เรียกผ่าน http.js เสมอ เพื่อให้มี Authorization header
        const roomsData = await http.get('/api/rooms');

        const transformed = (Array.isArray(roomsData) ? roomsData : []).map((room) => ({
          id: room.id,
          roomNumber: room.number,
          floor: Math.floor(Number(room.number) / 100) || 0,
          roomStatus: room.status === 'OCCUPIED' ? 'Not Available' : 'room available',
          tenantInfo: { name: room.tenant?.name || '-' },
        }));

        setRooms(transformed);
      } catch (e) {
        setError(e.message || 'Could not load dashboard data.');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const handleChange = (event) => setFloor(Number(event.target.value));

  const availableRooms = rooms.filter(r => r.roomStatus.toLowerCase() === 'room available');
  const unavailableRooms = rooms.filter(r => r.roomStatus.toLowerCase() !== 'room available');
  const filteredRoomsByFloor = rooms.filter(r => r.floor === floor);

  const handleRoomNumberClick = (roomNumber) => {
    navigate(`/room-details/${roomNumber}`);
  };

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
        onClick={() => handleRoomNumberClick(room.roomNumber)}
      >
        <CardContent sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', height: '100%' }}>
          <Typography variant="h5" component="div" sx={{ fontWeight: 'bold' }}>
            {room.roomNumber}
          </Typography>
          <Box>
            <Typography sx={{ mb: 1.5 }} color="text.secondary">
              {isAvailable ? 'Available' : 'Occupied'}
            </Typography>
            <Typography variant="body2">
              {isAvailable ? '-' : room.tenantInfo.name}
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
        <Typography sx={{ ml: 2 }}>Loading Dashboard...</Typography>
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

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold', color: 'primary.main' }}>
        Dashboard
      </Typography>

      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <FormControl sx={{ minWidth: 120 }}>
            <InputLabel>Floor</InputLabel>
            <Select value={floor} label="Floor" onChange={handleChange}>
              <MenuItem value={1}>Floor 1</MenuItem>
              <MenuItem value={2}>Floor 2</MenuItem>
            </Select>
          </FormControl>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap' }} gap={2}>
          <Typography sx={{ fontSize: '24px', fontWeight: 'bold' }}>Total Rooms</Typography>
          <Chip label={rooms.length} color="primary" sx={{ fontSize: '24px', p: 2, borderRadius: '8px' }} />
          <Typography sx={{ fontSize: '24px', fontWeight: 'bold' }}>Available</Typography>
          <Chip label={availableRooms.length} color="success" sx={{ fontSize: '24px', p: 2, borderRadius: '8px' }} />
          <Typography sx={{ fontSize: '24px', fontWeight: 'bold' }}>Occupied</Typography>
          <Chip label={unavailableRooms.length} color="error" sx={{ fontSize: '24px', p: 2, borderRadius: '8px' }} />
        </Box>
      </Box>

      <Box sx={{ p: 3, backgroundColor: '#f5f5f5', borderRadius: '8px' }}>
        <Stack direction="row" spacing={2} useFlexGap flexWrap="wrap">
          {filteredRoomsByFloor.map((room) => (
            <RoomCard key={room.id} room={room} />
          ))}
        </Stack>
      </Box>
    </Box>
  );
};

export default Dashboard;
