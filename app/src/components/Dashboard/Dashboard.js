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
    Grid
} from "@mui/material";
import { placeholderData } from '../../data/placeholderData';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
    const navigate = useNavigate();
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

    const filteredRoomsByFloor = status.filter(room => room.floor === floor);


    const handleRoomNumberClick = (roomNumber) => {
        navigate(`/room-details/${roomNumber}`);
    };

    const RoomCard = ({ room }) => {
        const borderColor = room.roomStatus.toLowerCase() === "room available"
            ? 'success.main'
            : 'error.main';

        return (
            <Card
                variant="outlined"
                onClick={() => handleRoomNumberClick(room.roomNumber)}
                sx={{
                    width: 180,
                    border: '2px solid',
                    borderColor: borderColor,
                    borderRadius: 2,
                    '&:hover': {
                        cursor: 'pointer',
                        '& .room-number': {
                            textDecoration: 'underline',
                        }
                    }
                }}
            >
                <CardContent>
                    <Typography
                        variant="h5"
                        component="div"
                        className="room-number"
                        sx={{
                            color: borderColor,
                            fontWeight: 'bold',
                        }}
                    >
                        {room.roomNumber}
                    </Typography>

                    <Grid container justifyContent="center" spacing={3} sx={{ mt: 1 }}>
                        <Grid item xs={8}>
                            <Typography variant="body2" textAlign="left">สำหรับ</Typography>
                            <Typography variant="body2" textAlign="left">ห้องน้ำในตัว</Typography>
                            <Typography variant="body2" textAlign="left">ครัว</Typography>
                        </Grid>
                        <Grid item xs={4}>
                            <Typography variant="body2">1 คน</Typography>
                            <Typography variant="body2">{room.privateBathroom ? 'ใช่' : 'ไม่ใช่'}</Typography>
                            <Typography variant="body2">{room.kitchen ? 'ใช่' : 'ไม่ใช่'}</Typography>
                        </Grid>
                    </Grid>

                    <Typography variant="body1" sx={{ mt: 2, fontWeight: 'medium' }}>
                        {room.price} บาท/เดือน
                    </Typography>
                </CardContent>
            </Card>
        );
    };

    return (
        <>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box sx={{ maxWidth: 130, ml: 3 }}>
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

                <Box sx={{ display: 'flex', justifyContent: 'flex-end', mr: 2, alignItems: 'center', flexWrap: 'wrap' }} gap={2}>
                    <Typography sx={{ fontSize: '24px', fontWeight: 'bold' }}>ห้องทั้งหมด</Typography>
                    <Chip label={status.length} color="primary" sx={{ fontSize: '24px', p: 2, borderRadius: '8px' }} />
                    <Typography sx={{ fontSize: '24px', fontWeight: 'bold' }}>ว่าง</Typography>
                    <Chip label={availableRooms.length} color="success" sx={{ fontSize: '24px', p: 2, borderRadius: '8px' }} />
                    <Typography sx={{ fontSize: '24px', fontWeight: 'bold' }}>ไม่ว่าง</Typography>
                    <Chip label={unavailableRooms.length} color="error" sx={{ fontSize: '24px', p: 2, borderRadius: '8px' }} />
                </Box>
            </Box>


            {/* ส่วนที่แสดงผล Chip ของแต่ละห้อง */}
            <Box sx={{ p: 3 }}>
                <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
                    {filteredRoomsByFloor.map((room) => (
                        <RoomCard key={room.id} room={room} />
                    ))}
                </Stack>
            </Box>
        </>
    );
}

export default Dashboard;