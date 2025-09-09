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
    Grid,
    CircularProgress
} from "@mui/material";
import { useNavigate } from 'react-router-dom';

// API base URL, inferred from your other files
const API_BASE =
  (process.env.REACT_APP_API && process.env.REACT_APP_API.replace(/\/+$/, '')) ||
  'http://localhost:8080/api';

const Dashboard = () => {
    const navigate = useNavigate();
    const [rooms, setRooms] = useState([]);
    const [floor, setFloor] = useState(1);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        async function fetchData() {
            setLoading(true);
            setError('');
            try {
                const res = await fetch(`${API_BASE}/rooms`);
                if (!res.ok) {
                    throw new Error(`Failed to fetch rooms: ${res.status}`);
                }
                const roomsData = await res.json();

                // Transform API data to match the structure the component expects
                const transformedData = roomsData.map(room => ({
                    id: room.id,
                    roomNumber: room.number,
                    // Derive floor from room number (e.g., 101 -> floor 1)
                    floor: Math.floor(room.number / 100),
                    // Translate API status to display status
                    roomStatus: room.status === 'OCCUPIED' ? 'Not Available' : 'room available',
                    tenantInfo: {
                        // Use tenant name or "-" if missing
                        name: room.tenant?.name || '-',
                    },
                }));
                setRooms(transformedData);
            } catch (e) {
                setError(e.message || 'Could not load dashboard data.');
            } finally {
                setLoading(false);
            }
        }
        fetchData();
    }, []);

    const handleChange = (event) => {
        setFloor(Number(event.target.value));
    };

    // Logic to calculate room availability based on the new data
    const availableRooms = rooms.filter(room =>
        room.roomStatus.toLowerCase() === 'room available'
    );

    const unavailableRooms = rooms.filter(room =>
        room.roomStatus.toLowerCase() !== 'room available'
    );

    const filteredRoomsByFloor = rooms.filter(room => room.floor === floor);

    const handleRoomNumberClick = (roomNumber) => {
        navigate(`/room-details/${roomNumber}`);
    };

    // This is the RoomCard component from your original file, kept intact
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
