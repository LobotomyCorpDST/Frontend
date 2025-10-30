// src/components/RoomDetail/RoomDetailUser.js
// Read-only room details for USER role with ability to create maintenance reports
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Paper,
  Grid,
  Typography,
  Button,
  Tabs,
  Tab,
  Box,
  CircularProgress,
  IconButton,
  Alert,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import AddIcon from '@mui/icons-material/Add';

import RoomInvoiceTable from '../Invoice/RoomInvoiceTable';
import MaintenanceTable from '../Maintenance/MaintenanceTable';
import CreateMaintenanceModal from '../Maintenance/CreateMaintenanceModal';

import { getRoomByNumber } from '../../api/room';
import { getActiveLease } from '../../api/lease';
import { getLatestInvoiceByRoom } from '../../api/invoice';
import http from '../../api/http';

const fmt = (d) => (d ? new Date(d).toISOString().slice(0, 10) : '-');

const RoomDetailUser = () => {
  const navigate = useNavigate();
  const [room, setRoom] = useState(null);
  const [roomNumber, setRoomNumber] = useState(null);
  const [backendRoomId, setBackendRoomId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeRightTab, setActiveRightTab] = useState(0);
  const [openCreateMaint, setOpenCreateMaint] = useState(false);
  const [maintTick, setMaintTick] = useState(0);

  const handleRightTabChange = (_e, v) => setActiveRightTab(v);

  useEffect(() => {
    loadUserRoom();
  }, []);

  const loadUserRoom = async () => {
    setLoading(true);
    setError('');
    try {
      // Get current user info to find their roomId
      const token = localStorage.getItem('token') || localStorage.getItem('access_token');
      if (!token) {
        setError('No authentication token found');
        return;
      }

      // Decode JWT to get username (simple base64 decode - for production use proper JWT library)
      const payload = token.split('.')[1];
      const decoded = JSON.parse(atob(payload));
      const username = decoded.sub;

      // Fetch user account to get roomId
      const userResponse = await http.get(`/api/users?username=${username}`);
      const users = userResponse?.data || userResponse || [];
      const currentUser = Array.isArray(users)
        ? users.find(u => u.username === username)
        : null;

      if (!currentUser || !currentUser.roomId) {
        setError('Your account is not linked to a room. Please contact administrator.');
        return;
      }

      // Get room info by roomId
      const roomRes = await getRoomByNumber(currentUser.roomId);
      setBackendRoomId(roomRes?.id ?? null);
      setRoomNumber(currentUser.roomId);

      // Load lease info
      const active = await getActiveLease(Number(currentUser.roomId));

      // Load latest invoice
      let latestInvoice = null;
      try {
        if (roomRes?.id) {
          const invoiceRes = await getLatestInvoiceByRoom(roomRes.id);
          latestInvoice = invoiceRes?.data || invoiceRes || null;
        }
      } catch (e) {
        console.warn('No latest invoice found:', e);
      }

      // Format room data
      const tenant = active?.tenant || null;
      const nameToShow = tenant?.name || 'N/A';
      const formattedRoom = {
        roomNumber: currentUser.roomId,
        roomStatus: active ? 'rent paid' : 'room available',
        tenantInfo: {
          name: nameToShow,
          lineId: tenant?.lineId || '-',
          phoneNumber: tenant?.phone || '-',
        },
        checkInDate: fmt(active?.startDate),
        checkOutDate: fmt(active?.endDate),
        leaseStartDate: fmt(active?.startDate),
        leaseEndDate: fmt(active?.endDate),
        latestUsage: latestInvoice
          ? {
              electricity: {
                units: latestInvoice.electricityUnits || '0',
                baht: latestInvoice.electricityBaht || '0',
              },
              water: {
                units: latestInvoice.waterUnits || '0',
                baht: latestInvoice.waterBaht || '0',
              },
              totalBaht: latestInvoice.totalBaht || '0',
            }
          : {
              electricity: { units: 'ไม่มีข้อมูล', baht: 'ไม่มีข้อมูล' },
              water: { units: 'ไม่มีข้อมูล', baht: 'ไม่มีข้อมูล' },
              totalBaht: 'ไม่มีข้อมูล',
            },
      };
      setRoom(formattedRoom);
    } catch (e) {
      setError(e?.message || 'Failed to load room details');
    } finally {
      setLoading(false);
    }
  };

  if (loading)
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', my: 5 }}>
        <CircularProgress />
      </Box>
    );
  if (error)
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  if (!room) return null;

  return (
    <Box
      sx={{
        display: 'flex',
        gap: 3,
        maxWidth: '1600px',
        mx: 'auto',
        my: 4,
        px: 2,
        alignItems: 'flex-start',
      }}
    >
      {/* Left Paper - Room Details */}
      <Paper
        elevation={3}
        sx={{ flex: '1 1 40%', p: 3, height: '85vh', display: 'flex', flexDirection: 'column' }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <IconButton onClick={() => navigate('/home-user')}>
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h4" component="h1" sx={{ ml: 1 }}>
            ห้อง {room.roomNumber}
          </Typography>
        </Box>

        <Typography
          variant="h6"
          color="primary"
          sx={{ borderBottom: 2, borderColor: 'primary.main', pb: 1, mb: 2 }}
        >
          รายละเอียด
        </Typography>

        <Box sx={{ flexGrow: 1, overflow: 'auto', pr: 1 }}>
          <Paper variant="outlined" sx={{ p: 3, mb: 2 }}>
            <Typography variant="h6" gutterBottom>
              ข้อมูลผู้เช่า
            </Typography>
            <Grid container spacing={6} alignItems="flex-start" justifyContent="center">
              <Grid item xs={12} sm={6}>
                <Typography variant="caption" color="text.secondary" display="block" textAlign="left">
                  ชื่อ
                </Typography>
                <Typography variant="body1" textAlign="left">
                  {room.tenantInfo.name}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="caption" color="text.secondary" display="block" textAlign="left">
                  ช่องทางติดต่อ
                </Typography>
                <Typography textAlign="left">
                  <strong>LINE:</strong>
                  <span style={{ paddingLeft: '10px' }}>{room.tenantInfo.lineId}</span>
                </Typography>
                <Typography variant="body1" textAlign="left">
                  <strong>เบอร์โทร:</strong> {room.tenantInfo.phoneNumber}
                </Typography>
              </Grid>
            </Grid>
          </Paper>

          <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
            <Typography variant="h6" gutterBottom>
              รายละเอียดสัญญาเช่า
            </Typography>
            <Typography>
              <strong>สถานะ:</strong> {room.roomStatus}
            </Typography>
            <Grid container spacing={6} alignItems="flex-start" justifyContent="center">
              <Grid item xs={12} sm={6}>
                <Typography textAlign="left">
                  <strong>วันที่เข้า:</strong> {room.checkInDate}
                </Typography>
                <Typography textAlign="left">
                  <strong>วันที่ออก:</strong> {room.checkOutDate}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography textAlign="left">
                  <strong>สัญญาเริ่ม:</strong> {room.leaseStartDate}
                </Typography>
                <Typography textAlign="left">
                  <strong>สัญญาจบ:</strong> {room.leaseEndDate}
                </Typography>
              </Grid>
            </Grid>
          </Paper>

          <Paper variant="outlined" sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              ค่าใช้จ่ายล่าสุด
            </Typography>
            <Grid container spacing={6} alignItems="flex-start" justifyContent="center">
              <Grid item xs={12} sm={6}>
                <Typography textAlign="left">
                  <strong>ค่าไฟ (หน่วย):</strong> {room.latestUsage.electricity.units}
                </Typography>
                <Typography textAlign="left">
                  <strong>ค่าไฟ (บาท):</strong> {room.latestUsage.electricity.baht}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography textAlign="left">
                  <strong>ค่าน้ำ (หน่วย):</strong> {room.latestUsage.water.units}
                </Typography>
                <Typography textAlign="left">
                  <strong>ค่าน้ำ (บาท):</strong> {room.latestUsage.water.baht}
                </Typography>
              </Grid>
            </Grid>
            <Typography>
              <strong>รวม:</strong> {room.latestUsage.totalBaht}
            </Typography>
          </Paper>
        </Box>

        <Alert severity="info" sx={{ mt: 2 }}>
          คุณสามารถดูข้อมูลห้องและสร้างรายงานการซ่อมบำรุงเท่านั้น
        </Alert>
      </Paper>

      {/* Right Paper - Tabs */}
      <Paper elevation={3} sx={{ flex: '1 1 60%', p: 3, height: '85vh' }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
          <Tabs value={activeRightTab} onChange={handleRightTabChange}>
            <Tab label="Invoices (ดูอย่างเดียว)" />
            <Tab label="Maintenance" />
          </Tabs>
        </Box>

        {activeRightTab === 0 && (
          <Box sx={{ height: 'calc(100% - 100px)', overflow: 'auto' }}>
            {backendRoomId ? (
              <RoomInvoiceTable roomId={backendRoomId} readOnly />
            ) : (
              <Typography>No room data available</Typography>
            )}
          </Box>
        )}

        {activeRightTab === 1 && (
          <Box sx={{ height: 'calc(100% - 100px)', display: 'flex', flexDirection: 'column' }}>
            <Box sx={{ mb: 2 }}>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => setOpenCreateMaint(true)}
                disabled={!backendRoomId}
                sx={{ borderRadius: 2 }}
              >
                สร้างรายงานซ่อมบำรุง
              </Button>
            </Box>
            <Box sx={{ flexGrow: 1, overflow: 'auto' }}>
              {backendRoomId ? (
                <MaintenanceTable
                  roomId={backendRoomId}
                  refreshTrigger={maintTick}
                  readOnly
                />
              ) : (
                <Typography>No room data available</Typography>
              )}
            </Box>
          </Box>
        )}
      </Paper>

      {/* Create Maintenance Modal */}
      {openCreateMaint && (
        <CreateMaintenanceModal
          open={openCreateMaint}
          onClose={() => setOpenCreateMaint(false)}
          roomId={backendRoomId}
          onCreated={() => {
            setMaintTick((t) => t + 1);
            setOpenCreateMaint(false);
          }}
        />
      )}
    </Box>
  );
};

export default RoomDetailUser;
