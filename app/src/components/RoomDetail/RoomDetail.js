import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Paper,
  Grid,
  Typography,
  Button,
  Tabs,
  Tab,
  Box,
  Avatar,
  CircularProgress,
  IconButton,
  Alert,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import EditIcon from '@mui/icons-material/Edit';
import AddIcon from '@mui/icons-material/Add';

import RoomInvoiceTable from '../Invoice/RoomInvoiceTable';
import GenerateInvoiceModal from '../Invoice/GenerateInvoiceModal';
import MaintenanceTable from '../Maintenance/MaintenanceTable';
import CreateMaintenanceModal from '../Maintenance/CreateMaintenanceModal';

const actionBtnSx = { borderRadius: 2, textTransform: 'none', fontWeight: 600, px: 2 };

// API base URL
const API_BASE =
  (process.env.REACT_APP_API && process.env.REACT_APP_API.replace(/\/+$/, '')) ||
  'http://localhost:8080/api';

const RoomDetail = () => {
  const { roomNumber } = useParams();
  const navigate = useNavigate();

  const [room, setRoom] = useState(null);
  const [backendRoomId, setBackendRoomId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeRightTab, setActiveRightTab] = useState(0);
  const [showCreateInv, setShowCreateInv] = useState(false);
  const [openCreateMaint, setOpenCreateMaint] = useState(false);
  const [maintTick, setMaintTick] = useState(0);

  const handleRightTabChange = (_e, v) => setActiveRightTab(v);

  useEffect(() => {
    if (!roomNumber) return;

    const fetchRoomDetails = async () => {
      setLoading(true);
      setError('');
      try {
        // Step 1: Fetch the entire list of rooms to find the one we need.
        const roomsRes = await fetch(`${API_BASE}/rooms`);
        if (!roomsRes.ok) throw new Error("Could not fetch room list to find the correct ID.");
        const roomsList = await roomsRes.json();
        
        // Step 2: Find our specific room in the list by its number.
        const currentRoomData = roomsList.find(r => r.number === parseInt(roomNumber));
        if (!currentRoomData) {
          throw new Error(`Room ${roomNumber} could not be found in the API response.`);
        }
        
        const internalId = currentRoomData.id;
        setBackendRoomId(internalId);

        // Step 3: Fetch the active lease for this room using its backend ID.
        let activeLease = null;
        if (internalId) {
            const leaseRes = await fetch(`${API_BASE}/leases/by-room/${internalId}?activeOnly=true`);
            if (leaseRes.ok) {
                const leases = await leaseRes.json();
                if (Array.isArray(leases) && leases.length > 0) activeLease = leases[0];
            }
        }
        
        // Step 4: Format all the data for rendering.
        const formattedRoom = {
          roomNumber: currentRoomData.number,
          roomStatus: currentRoomData.status === 'OCCUPIED' ? 'rent paid' : 'room available',
          tenantInfo: {
            name: currentRoomData.tenant?.name || 'N/A',
            profilePic: '', // Placeholder for profile picture
            lineId: currentRoomData.tenant?.lineId || '-',
            phoneNumber: currentRoomData.tenant?.phone || '-',
          },
          checkInDate: activeLease?.startDate || '-',
          checkOutDate: activeLease?.endDate || '-',
          leaseStartDate: activeLease?.startDate || '-',
          leaseEndDate: activeLease?.endDate || '-',
          latestUsage: { electricity: { units: 'N/A', baht: 'N/A' }, water: { units: 'N/A', baht: 'N/A' }, totalBaht: 'N/A' },
        };
        setRoom(formattedRoom);

      } catch (e) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    };

    fetchRoomDetails();
  }, [roomNumber]);

  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', my: 5 }}><CircularProgress /></Box>;
  if (error) return <Box sx={{ p: 3 }}><Alert severity="error">{error}</Alert></Box>;
  if (!room) return null;

  return (
    <Box sx={{ display: 'flex', gap: 3, maxWidth: '1600px', mx: 'auto', my: 4, px: 2, alignItems: 'flex-start' }}>
      {/* Left Paper (UI Structure is Preserved) */}
      <Paper elevation={3} sx={{ flex: '1 1 40%', p: 3, height: '85vh', display: 'flex', flexDirection: 'column' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <IconButton onClick={() => navigate('/home')}><ArrowBackIcon /></IconButton>
          <Typography variant="h4" component="h1" sx={{ ml: 1 }}>ห้อง {room.roomNumber}</Typography>
        </Box>
        <Typography variant="h6" color="primary" sx={{ borderBottom: 2, borderColor: 'primary.main', pb: 1, mb: 2 }}>รายละเอียด</Typography>
        <Box sx={{ flexGrow: 1, overflow: 'auto', pr: 1 }}>
          <Paper variant="outlined" sx={{ p: 3, mb: 2 }}>
            <Typography variant="h6" gutterBottom>ข้อมูลผู้เช่า</Typography>
            <Grid container spacing={6} alignItems="flex-start" justifyContent="center">
              <Grid item xs={12} sm={3} sx={{ display: 'flex', justifyContent: 'center' }}><Avatar src={room.tenantInfo.profilePic} sx={{ width: 80, height: 80 }} /></Grid>
              <Grid item xs={12} sm={4}><Typography variant="caption" color="text.secondary" display="block" textAlign="left">ชื่อ</Typography><Typography variant="body1" textAlign="left">{room.tenantInfo.name}</Typography></Grid>
              <Grid item xs={12} sm={5}><Typography variant="caption" color="text.secondary" display="block" textAlign="left">ช่องทางติดต่อ</Typography><Typography textAlign="left"><strong>LINE:</strong><span style={{ paddingLeft: '28.5px' }}>{room.tenantInfo.lineId}</span></Typography><Typography variant="body1" textAlign="left"><strong>เบอร์โทร:</strong> {room.tenantInfo.phoneNumber}</Typography></Grid>
            </Grid>
          </Paper>
          <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
            <Typography variant="h6" gutterBottom>รายละเอียดสัญญาเช่า</Typography>
            <Typography><strong>สถานะ:</strong> {room.roomStatus}</Typography>
            <Grid container spacing={6} alignItems="flex-start" justifyContent="center">
              <Grid item xs={12} sm={4}><Typography textAlign="left"><strong>วันที่เข้า:</strong><span style={{ paddingLeft: '10.5px' }}>{room.checkInDate}</span></Typography><Typography textAlign="left"><strong>วันที่ออก:</strong> {room.checkOutDate}</Typography></Grid>
              <Grid item xs={12} sm={5}><Typography textAlign="left"><strong>สัญญาเริ่ม:</strong> {room.leaseStartDate}</Typography><Typography textAlign="left"><strong>สัญญาจบ:</strong><span style={{ paddingLeft: '7.5px' }}>{room.leaseEndDate}</span></Typography></Grid>
            </Grid>
          </Paper>
          <Paper variant="outlined" sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>ค่าใช้จ่ายล่าสุด</Typography>
            <Grid container spacing={6} alignItems="flex-start" justifyContent="center">
              <Grid item xs={12} sm={4}><Typography textAlign="left"><strong>ค่าไฟ (หน่วย):</strong> {room.latestUsage.electricity.units}</Typography><Typography textAlign="left"><strong>ค่าไฟ (บาท):</strong><span style={{ paddingLeft: '14px' }}>{room.latestUsage.electricity.baht}</span></Typography></Grid>
              <Grid item xs={12} sm={5}><Typography textAlign="left"><strong>ค่าน้ำ (หน่วย):</strong> {room.latestUsage.water.units}</Typography><Typography textAlign="left"><strong>ค่าน้ำ (บาท):</strong><span style={{ paddingLeft: '14px' }}>{room.latestUsage.water.baht}</span></Typography></Grid>
            </Grid>
            <Typography><strong>รวม:</strong> {room.latestUsage.totalBaht}</Typography>
          </Paper>
        </Box>
        <Box sx={{ pt: 2, mt: 'auto', borderTop: 1, borderColor: 'divider' }}><Button variant="outlined" startIcon={<EditIcon />} fullWidth sx={actionBtnSx}>แก้ไขข้อมูล</Button></Box>
      </Paper>
      
      {/* Right Paper */}
      <Paper elevation={3} sx={{ flex: '1 1 60%', height: '85vh', display: 'flex', flexDirection: 'column', p: 3 }}>
        <Tabs value={activeRightTab} onChange={handleRightTabChange} sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
          <Tab label="ใบแจ้งหนี้" />
          <Tab label="บำรุงรักษา" />
        </Tabs>
        <Box sx={{ flexGrow: 1, overflow: 'auto' }}>
          {activeRightTab === 0 && (
            <Box>
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}><Button variant="contained" startIcon={<AddIcon />} sx={actionBtnSx} onClick={() => setShowCreateInv(true)} disabled={!backendRoomId}>สร้างใบแจ้งหนี้</Button></Box>
              {backendRoomId && <RoomInvoiceTable roomId={backendRoomId} showCreateButton={false} />}
              {showCreateInv && backendRoomId && <GenerateInvoiceModal roomId={backendRoomId} onClose={() => setShowCreateInv(false)} onSuccess={() => {}} />}
            </Box>
          )}
          {activeRightTab === 1 && (
            <Box>
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}><Button variant="contained" startIcon={<AddIcon />} sx={actionBtnSx} onClick={() => setOpenCreateMaint(true)} disabled={!backendRoomId}>เพิ่มงานบำรุงรักษา</Button></Box>
              {backendRoomId && <MaintenanceTable roomId={backendRoomId} reloadSignal={maintTick} />}
              {backendRoomId && <CreateMaintenanceModal roomId={backendRoomId} open={openCreateMaint} onClose={() => setOpenCreateMaint(false)} onSuccess={() => setMaintTick(t => t + 1)} />}
            </Box>
          )}
        </Box>
      </Paper>
    </Box>
  );
};

export default RoomDetail;