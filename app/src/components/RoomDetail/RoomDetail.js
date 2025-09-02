import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { placeholderData } from '../../data/placeholderData';
import {
    Paper,
    Grid,
    Typography,
    Button,
    Tabs,
    Tab,
    Box,
    Avatar,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TableSortLabel,
    Chip,
    CircularProgress,
    IconButton
} from '@mui/material';
// ICON IMPORTS
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import EditIcon from '@mui/icons-material/Edit';
import ReceiptIcon from '@mui/icons-material/Receipt';
import AddIcon from '@mui/icons-material/Add';
import PrintIcon from '@mui/icons-material/Print';


const RoomDetail = () => {
    const { roomNumber } = useParams();
    const navigate = useNavigate();
    const [room, setRoom] = useState(null);
    const [sortConfig, setSortConfig] = useState({ key: 'date', direction: 'descending' });
    const [activeRightTab, setActiveRightTab] = useState(0);

    const handleRightTabChange = (event, newValue) => {
        setActiveRightTab(newValue);
    };

    useEffect(() => {
        const foundRoom = placeholderData.find(r => r.roomNumber === parseInt(roomNumber));
        if (foundRoom) {
            const mockInvoiceHistory = [
                { id: 1, date: '2025-08-01', totalBaht: foundRoom.latestUsage.totalBaht, status: 'Not yet paid' },
                { id: 2, date: '2025-07-01', totalBaht: foundRoom.latestUsage.totalBaht + 50, status: 'Paid' },
                { id: 3, date: '2025-06-01', totalBaht: foundRoom.latestUsage.totalBaht - 20, status: 'Overdue' },
            ];
            const mockMaintenanceHistory = [
                { id: 1, date: '2025-07-15', type: 'ซ่อมแอร์', description: 'น้ำหยดจากเครื่องปรับอากาศ', status: 'Completed', technician: 'ช่างเอก' },
                { id: 2, date: '2025-06-20', type: 'ทำความสะอาด', description: 'ทำความสะอาดห้องน้ำ', status: 'Completed', technician: 'ช่างบี' },
                { id: 3, date: '2025-05-10', type: 'ไฟเสีย', description: 'ไฟในห้องนอนไม่ติด', status: 'Pending', technician: 'ช่างซี' },
            ];
            setRoom({
                ...foundRoom,
                invoiceHistory: mockInvoiceHistory,
                maintenanceHistory: mockMaintenanceHistory,
            });
        } else {
            console.error('Room not found');
        }
    }, [roomNumber]);

    // ADDED THIS MISSING FUNCTION
    const getStatusChip = (status) => {
        const colorMap = {
            paid: 'success',
            overdue: 'error',
            'not yet paid': 'warning',
            completed: 'success',
            pending: 'info',
        };
        return <Chip label={status} color={colorMap[status.toLowerCase()] || 'default'} size="small" />;
    };


    const handleSort = (key) => {
        const isAsc = sortConfig.key === key && sortConfig.direction === 'ascending';
        setSortConfig({ key, direction: isAsc ? 'descending' : 'ascending' });
    };

    const sortedInvoices = React.useMemo(() => {
        if (!room?.invoiceHistory) return [];
        const sorted = [...room.invoiceHistory];
        sorted.sort((a, b) => {
            if (a[sortConfig.key] < b[sortConfig.key]) {
                return sortConfig.direction === 'ascending' ? -1 : 1;
            }
            if (a[sortConfig.key] > b[sortConfig.key]) {
                return sortConfig.direction === 'ascending' ? 1 : -1;
            }
            return 0;
        });
        return sorted;
    }, [room?.invoiceHistory, sortConfig]);

    if (!room) {
        return <Box sx={{ display: 'flex', justifyContent: 'center', my: 5 }}><CircularProgress /></Box>;
    }

    return (
        <Box sx={{
            display: 'flex',
            gap: 3,
            maxWidth: '1600px',
            mx: 'auto',
            my: 4,
            px: 2,
            alignItems: 'flex-start' // Align columns to the top
        }}>
            {/* Left Paper */}
            <Paper
                elevation={3}
                sx={{
                    flex: '1 1 40%', // Flex properties for sizing
                    p: 3,
                    height: '85vh',
                    display: 'flex',
                    flexDirection: 'column'
                }}
            >
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <IconButton onClick={() => navigate('/home')}>
                        <ArrowBackIcon />
                    </IconButton>
                    <Typography variant="h4" component="h1" sx={{ ml: 1 }}>
                        ห้อง {room.roomNumber}
                    </Typography>
                </Box>
                <Typography variant="h6" color="primary" sx={{ borderBottom: 2, borderColor: 'primary.main', pb: 1, mb: 2 }}>
                    รายละเอียด
                </Typography>

                <Box sx={{ flexGrow: 1, overflow: 'auto', pr: 1 }}>
                    <Paper variant="outlined" sx={{ p: 3, mb: 2 }}>
                        <Typography variant="h6" gutterBottom sx={{ mb: 2 }}>
                            ข้อมูลผู้เช่า
                        </Typography>

                        <Grid container spacing={6} alignItems="flex-start" justifyContent={'center'}>

                            {/* Column 1: Avatar */}
                            <Grid item xs={12} sm={3} sx={{ display: 'flex', justifyContent: 'center' }}>
                                <Avatar
                                    src={room.tenantInfo.profilePic}
                                    sx={{ width: 80, height: 80 }}
                                />
                            </Grid>

                            {/* Column 2: Name */}
                            <Grid item xs={12} sm={4}>
                                <Box>
                                    <Typography variant="caption" color="text.secondary" display="block" textAlign={'left'}>
                                        ชื่อ
                                    </Typography>
                                    <Typography variant="body1" textAlign={'left'}>
                                        {room.tenantInfo.name}
                                    </Typography>
                                </Box>
                            </Grid>

                            {/* Column 3: Contact Info */}
                            <Grid item xs={12} sm={5}>
                                <Box>
                                    <Typography variant="caption" color="text.secondary" display="block" textAlign={'left'}>
                                        ช่องทางติดต่อ
                                    </Typography>
                                    <Typography variant="body1" textAlign={'left'}>
                                        <strong>LINE:</strong> {room.tenantInfo.lineId}
                                    </Typography>
                                    <Typography variant="body1" textAlign={'left'}>
                                        <strong>เบอร์:</strong> {room.tenantInfo.phoneNumber}
                                    </Typography>
                                </Box>
                            </Grid>

                        </Grid>
                    </Paper>
                    <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
                        <Typography variant="h6" gutterBottom>รายละเอียดสัญญาเช่า</Typography>
                        <Typography><strong>สถานะ:</strong> {room.roomStatus}</Typography>
                        <Grid container spacing={6} alignItems="flex-start" justifyContent={'center'}>

                            {/* Column 2: Name */}
                            <Grid item xs={12} sm={4} >
                                <Box>
                                    <Typography textAlign={'left'}><strong>วันที่เข้า:</strong> {room.checkInDate}</Typography>
                                    <Typography textAlign={'left'}><strong>วันที่ออก:</strong> {room.checkOutDate}</Typography>
                                </Box>
                            </Grid>

                            {/* Column 3: Contact Info */}
                            <Grid item xs={12} sm={5}>
                                <Box>
                                    <Typography textAlign={'left'}><strong>สัญญาเริ่ม:</strong> {room.leaseStartDate}</Typography>
                                    <Typography textAlign={'left'}><strong>สัญญาจบ:</strong> {room.leaseEndDate}</Typography>
                                </Box>
                            </Grid>

                        </Grid>


                    </Paper>
                    <Paper variant="outlined" sx={{ p: 2 }}>
                        <Typography variant="h6" gutterBottom>ค่าใช้จ่ายล่าสุด</Typography>
                        <Typography><strong>ค่าไฟ (หน่วย):</strong> {room.latestUsage.electricity.units}</Typography>
                        <Typography><strong>ค่าไฟ (บาท):</strong> {room.latestUsage.electricity.baht}</Typography>
                        <Typography><strong>ค่าน้ำ (หน่วย):</strong> {room.latestUsage.water.units}</Typography>
                        <Typography><strong>ค่าน้ำ (บาท):</strong> {room.latestUsage.water.baht}</Typography>
                        <Typography><strong>รวม:</strong> {room.latestUsage.totalBaht}</Typography>
                    </Paper>
                </Box>
                <Box sx={{ pt: 2, mt: 2, borderTop: 1, borderColor: 'divider', display: 'flex', gap: 2 }}>
                    <Button variant="outlined" startIcon={<EditIcon />} fullWidth>
                        แก้ไขข้อมูล
                    </Button>
                    <Button variant="contained" startIcon={<ReceiptIcon />} fullWidth>
                        Generate Invoice
                    </Button>
                </Box>
            </Paper>

            {/* Right Paper */}
            <Paper
                elevation={3}
                sx={{
                    flex: '1 1 60%', // Flex properties for sizing
                    height: '85vh',
                    display: 'flex',
                    flexDirection: 'column',
                    p: 3
                }}
            >
                <Tabs value={activeRightTab} onChange={handleRightTabChange} sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
                    <Tab label="ใบแจ้งหนี้" />
                    <Tab label="บำรุงรักษา" />
                </Tabs>
                <Box sx={{ flexGrow: 1, overflow: 'auto' }}>
                    {activeRightTab === 0 && (
                        <Box>
                            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
                                <Button variant="contained" startIcon={<AddIcon />}>สร้างใบแจ้งหนี้</Button>
                            </Box>
                            <TableContainer component={Paper} variant="outlined">
                                <Table stickyHeader size="small">
                                    <TableHead>
                                        <TableRow>
                                            <TableCell sortDirection={sortConfig.key === 'date' ? sortConfig.direction : false}>
                                                <TableSortLabel active={sortConfig.key === 'date'} direction={sortConfig.key === 'date' ? sortConfig.direction : 'asc'} onClick={() => handleSort('date')}>วันที่</TableSortLabel>
                                            </TableCell>
                                            <TableCell>ยอดรวม (บาท)</TableCell>
                                            <TableCell>สถานะ</TableCell>
                                            <TableCell align="right">Actions</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {sortedInvoices.map((invoice) => (
                                            <TableRow key={invoice.id}>
                                                <TableCell>{invoice.date}</TableCell>
                                                <TableCell>{invoice.totalBaht.toLocaleString()}</TableCell>
                                                <TableCell>{getStatusChip(invoice.status)}</TableCell>
                                                <TableCell align="right"><IconButton size="small"><PrintIcon /></IconButton></TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        </Box>
                    )}
                    {activeRightTab === 1 && (
                        <Box>
                            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
                                <Button variant="contained" startIcon={<AddIcon />}>เพิ่มงานบำรุงรักษา</Button>
                            </Box>
                            <TableContainer component={Paper} variant="outlined">
                                <Table stickyHeader size="small">
                                    <TableHead>
                                        <TableRow>
                                            <TableCell>วันที่แจ้ง</TableCell>
                                            <TableCell>ประเภท</TableCell>
                                            <TableCell>รายละเอียด</TableCell>
                                            <TableCell>สถานะ</TableCell>
                                            <TableCell>ช่าง</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {room.maintenanceHistory.map((log) => (
                                            <TableRow key={log.id}>
                                                <TableCell>{log.date}</TableCell>
                                                <TableCell>{log.type}</TableCell>
                                                <TableCell>{log.description}</TableCell>
                                                <TableCell>{getStatusChip(log.status)}</TableCell>
                                                <TableCell>{log.technician}</TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        </Box>
                    )}
                </Box>
            </Paper>
        </Box>
    );
};

export default RoomDetail;