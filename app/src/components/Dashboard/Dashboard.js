// src/components/Dashboard/Dashboard.js
import React, { useState, useEffect, useMemo } from 'react';
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
  CircularProgress,
  Divider,
} from "@mui/material";
import { useNavigate } from 'react-router-dom';
import http from '../../api/http';

const Dashboard = () => {
  const navigate = useNavigate();
  const [rooms, setRooms] = useState([]);
  const [floor, setFloor] = useState('ALL'); // << default เป็น All floors
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // โหลดห้องทั้งหมด
  useEffect(() => {
    (async () => {
      setLoading(true);
      setError('');
      try {
        const roomsData = await http.get('/api/rooms');

        const transformed = (Array.isArray(roomsData) ? roomsData : []).map((room) => {
          const number = Number(room.number);
          const fl = Math.floor(number / 100) || 0;
          const occupied = String(room.status || '').toUpperCase() === 'OCCUPIED';
          return {
            id: room.id,
            roomNumber: room.number,
            floor: fl,
            roomStatus: occupied ? 'Not Available' : 'room available',
            tenantInfo: { name: room.tenant?.name || '-' },
            rawStatus: room.status || 'FREE',
          };
        });

                setRooms(transformed);
            } catch (e) {
                setError(e.message || 'Could not load dashboard data.');
            } finally {
                setLoading(false);
            }
        })();
    }, []);

  const handleChange = (event) => setFloor(event.target.value);

  // ตัวเลือกชั้นแบบไดนามิก + ALL
  const floorOptions = useMemo(() => {
    const unique = Array.from(new Set(rooms.map(r => r.floor))).sort((a, b) => a - b);
    return ['ALL', ...unique];
  }, [rooms]);

  // ห้องที่กำลังแสดง (สำหรับการ์ดและตัวเลขสรุป)
  const visibleRooms = useMemo(() => {
    if (floor === 'ALL') return rooms;
    return rooms.filter(r => String(r.floor) === String(floor));
  }, [rooms, floor]);

  const totalRooms = visibleRooms.length;
  const availableRooms = visibleRooms.filter(r => r.roomStatus.toLowerCase() === 'room available');
  const unavailableRooms = visibleRooms.filter(r => r.roomStatus.toLowerCase() !== 'room available');

  // group by floor (ใช้ตอนโหมด ALL)
  const groupedByFloor = useMemo(() => {
    return visibleRooms.reduce((acc, r) => {
      const key = r.floor ?? 'N/A';
      (acc[key] ||= []).push(r);
      return acc;
    }, {});
  }, [visibleRooms]);


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
                            {isAvailable ? 'ว่าง' : 'ไม่ว่าง'}
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

      {/* Header: เลือกชั้น + สรุปตัวเลข (อิง visibleRooms) */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <FormControl sx={{ minWidth: 160 }}>
            <InputLabel>Floor</InputLabel>
            <Select value={floor} label="Floor" onChange={handleChange}>
              {floorOptions.map(opt => (
                <MenuItem key={opt} value={opt}>
                  {opt === 'ALL' ? 'All floors' : `Floor ${opt}`}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap' }} gap={2}>
          <Typography sx={{ fontSize: '24px', fontWeight: 'bold' }}>Total Rooms</Typography>
          <Chip label={totalRooms} color="primary" sx={{ fontSize: '24px', p: 2, borderRadius: '8px' }} />
          <Typography sx={{ fontSize: '24px', fontWeight: 'bold' }}>Available</Typography>
          <Chip label={availableRooms.length} color="success" sx={{ fontSize: '24px', p: 2, borderRadius: '8px' }} />
          <Typography sx={{ fontSize: '24px', fontWeight: 'bold' }}>Occupied</Typography>
          <Chip label={unavailableRooms.length} color="error" sx={{ fontSize: '24px', p: 2, borderRadius: '8px' }} />
        </Box>
      </Box>

      {/* Content */}
      {floor === 'ALL' ? (
        // โหมด All floors: แสดงเป็นกลุ่มชั้น
        Object.entries(groupedByFloor)
          .sort(([a], [b]) => Number(a) - Number(b))
          .map(([fl, items], idx) => (
            <Box key={fl} sx={{ mb: 4 }}>
              {idx !== 0 && <Divider sx={{ mb: 2 }} />}
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
                Floor {fl}
              </Typography>
              <Box sx={{ p: 3, backgroundColor: '#f5f5f5', borderRadius: '8px' }}>
                <Stack direction="row" spacing={2} useFlexGap flexWrap="wrap">
                  {items.map((room) => (
                    <RoomCard key={room.id} room={room} />
                  ))}
                </Stack>
              </Box>
            </Box>
          ))
      ) : (
        // โหมดชั้นเดียว
        <Box sx={{ p: 3, backgroundColor: '#f5f5f5', borderRadius: '8px' }}>
          <Stack direction="row" spacing={2} useFlexGap flexWrap="wrap">
            {visibleRooms.map((room) => (
              <RoomCard key={room.id} room={room} />
            ))}
          </Stack>
        </Box>
      )}
    </Box>
  );
};

export default Dashboard;