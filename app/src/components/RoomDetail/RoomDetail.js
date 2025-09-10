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

import { getRoomByNumber } from '../../api/room';
import { getActiveLease, getLeaseHistory } from '../../api/lease';

const actionBtnSx = { borderRadius: 2, textTransform: 'none', fontWeight: 600, px: 2 };
const fmt = (d) => (d ? new Date(d).toISOString().slice(0, 10) : '-');

const RoomDetail = () => {
  const { roomNumber } = useParams();
  const navigate = useNavigate();

  const [room, setRoom] = useState(null);
  const [backendRoomId, setBackendRoomId] = useState(null);
  const [leaseHistory, setLeaseHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeRightTab, setActiveRightTab] = useState(0);
  const [showCreateInv, setShowCreateInv] = useState(false);
  const [openCreateMaint, setOpenCreateMaint] = useState(false);
  const [maintTick, setMaintTick] = useState(0);

  const handleRightTabChange = (_e, v) => setActiveRightTab(v);

  useEffect(() => {
    if (!roomNumber) return;

    const load = async () => {
      setLoading(true);
      setError('');
      try {
        // 1) เอา roomId จาก backend ด้วย "เลขห้อง"
        const roomRes = await getRoomByNumber(Number(roomNumber));
        setBackendRoomId(roomRes?.id ?? null);

        // 2) โหลดสัญญา ACTIVE ของห้องนี้ + ประวัติ
        const active = await getActiveLease(Number(roomNumber)); // can be null
        const history = await getLeaseHistory(Number(roomNumber));
        setLeaseHistory(Array.isArray(history) ? history : []);

        // 3) จัดรูปข้อมูลสำหรับแสดงผลฝั่งซ้าย
        const tenant = active?.tenant || null;
        const nameToShow = active?.customName || tenant?.name || 'N/A';
        const formattedRoom = {
          roomNumber: roomNumber,
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
          latestUsage: {
            electricity: { units: 'N/A', baht: 'N/A' },
            water: { units: 'N/A', baht: 'N/A' },
            totalBaht: 'N/A',
          },
        };
        setRoom(formattedRoom);
      } catch (e) {
        setError(e?.message || 'Load room failed');
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [roomNumber]);

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
      {/* Left Paper */}
      <Paper
        elevation={3}
        sx={{ flex: '1 1 40%', p: 3, height: '85vh', display: 'flex', flexDirection: 'column' }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <IconButton onClick={() => navigate('/home')}>
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

        <Box sx={{ pt: 2, mt: 'auto', borderTop: 1, borderColor: 'divider' }}>
          <Button variant="outlined" startIcon={<EditIcon />} fullWidth sx={actionBtnSx}>
            แก้ไขข้อมูล
          </Button>
        </Box>
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
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  sx={actionBtnSx}
                  onClick={() => setShowCreateInv(true)}
                  disabled={!backendRoomId}
                >
                  สร้างใบแจ้งหนี้
                </Button>
              </Box>

              {backendRoomId && <RoomInvoiceTable roomId={backendRoomId} showCreateButton={false} />}
              {showCreateInv && backendRoomId && (
                <GenerateInvoiceModal
                  roomId={backendRoomId}
                  onClose={() => setShowCreateInv(false)}
                  onSuccess={() => {}}
                />
              )}
            </Box>
          )}

          {activeRightTab === 1 && (
            <Box>
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  sx={actionBtnSx}
                  onClick={() => setOpenCreateMaint(true)}
                  disabled={!backendRoomId}
                >
                  เพิ่มงานบำรุงรักษา
                </Button>
              </Box>

              {backendRoomId && <MaintenanceTable roomId={backendRoomId} reloadSignal={maintTick} />}
              {backendRoomId && (
                <CreateMaintenanceModal
                  roomId={backendRoomId}
                  open={openCreateMaint}
                  onClose={() => setOpenCreateMaint(false)}
                  onSuccess={() => setMaintTick((t) => t + 1)}
                />
              )}
            </Box>
          )}
        </Box>
      </Paper>
    </Box>
  );
};

export default RoomDetail;
