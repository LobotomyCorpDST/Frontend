// src/components/RoomDetail/RoomDetail.js
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
  Chip,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import EditIcon from '@mui/icons-material/Edit';
import AddIcon from '@mui/icons-material/Add';

import RoomInvoiceTable from '../Invoice/RoomInvoiceTable';
import GenerateInvoiceModal from '../Invoice/GenerateInvoiceModal';
import MaintenanceTable from '../Maintenance/MaintenanceTable';
import CreateMaintenanceModal from '../Maintenance/CreateMaintenanceModal';

import RoomEditModal from '../RoomEdit/RoomEditModal';

import { getRoomByNumber } from '../../api/room';
import { getActiveLease, getLeaseHistory } from '../../api/lease';
import { getLatestInvoiceByRoom } from '../../api/invoice';

const actionBtnSx = { borderRadius: 2, textTransform: 'none', fontWeight: 600, px: 2 };
const fmt = (d) => (d ? new Date(d).toISOString().slice(0, 10) : '-');

// Helper functions for invoice status
const getStatusLabel = (status) => {
  const map = { 'PAID': 'ชำระแล้ว', 'PENDING': 'รอชำระ', 'OVERDUE': 'เกินกำหนด' };
  return map[status] || status || 'ไม่มีข้อมูล';
};

const getStatusColor = (status) => {
  const map = { 'PAID': 'success', 'PENDING': 'warning', 'OVERDUE': 'error' };
  return map[status] || 'default';
};

const RoomDetail = () => {
  const { roomNumber } = useParams();
  const navigate = useNavigate();

  // Get user role for permission checks
  const userRole = (localStorage.getItem('role') || 'GUEST').toUpperCase();
  const isAdmin = userRole === 'ADMIN';

  const [room, setRoom] = useState(null);
  const [backendRoomId, setBackendRoomId] = useState(null);
  const [leaseHistory, setLeaseHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeRightTab, setActiveRightTab] = useState(0);
  const [showCreateInv, setShowCreateInv] = useState(false);
  const [openCreateMaint, setOpenCreateMaint] = useState(false);
  const [maintTick, setMaintTick] = useState(0);

  // NEW: modal แก้ไขห้อง + trigger reload
  const [showEdit, setShowEdit] = useState(false);
  const [reloadTick, setReloadTick] = useState(0);

  const handleRightTabChange = (_e, v) => setActiveRightTab(v);

  useEffect(() => {
    if (!roomNumber) return;

    const load = async () => {
      setLoading(true);
      setError('');
      try {
        // 1) หา roomId จากเลขห้อง
        const roomRes = await getRoomByNumber(Number(roomNumber));
        setBackendRoomId(roomRes?.id ?? null);

        // 2) โหลด lease ปัจจุบัน + ประวัติ (เก็บไว้เผื่อใช้)
        const active = await getActiveLease(Number(roomNumber)); // อาจเป็น null
        const history = await getLeaseHistory(Number(roomNumber));
        setLeaseHistory(Array.isArray(history) ? history : []);

        // 3) โหลดใบแจ้งหนี้ล่าสุด (ถ้ามี)
        let latestInvoice = null;
        try {
          if (roomRes?.id) {
            const invoiceRes = await getLatestInvoiceByRoom(roomRes.id);
            latestInvoice = invoiceRes?.data || invoiceRes || null;
          }
        } catch (e) {
          // ไม่มีใบแจ้งหนี้ หรือ error -> ใช้ N/A
          console.warn('No latest invoice found:', e);
        }

        // 4) จัดข้อมูลฝั่งซ้าย
        const tenant = active?.tenant || null;
        const nameToShow = tenant?.name || 'N/A';
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
          latestInvoiceStatus: latestInvoice?.status || null, // Store invoice status
          latestUsage: latestInvoice ? {
            electricity: {
              units: latestInvoice.electricityUnits || '0',
              baht: latestInvoice.electricityBaht || '0'
            },
            water: {
              units: latestInvoice.waterUnits || '0',
              baht: latestInvoice.waterBaht || '0'
            },
            totalBaht: latestInvoice.totalBaht || '0',
          } : {
            electricity: { units: 'ไม่มีข้อมูล', baht: 'ไม่มีข้อมูล' },
            water: { units: 'ไม่มีข้อมูล', baht: 'ไม่มีข้อมูล' },
            totalBaht: 'ไม่มีข้อมูล',
          },
        };
        setRoom(formattedRoom);
      } catch (e) {
        setError(e?.message || 'Load room failed');
      } finally {
        setLoading(false);
      }
    };

    // NOTE: ผูก reloadTick เพื่อรีเฟรชข้อมูลหลังบันทึกจาก modal
    load();
  }, [roomNumber, reloadTick]);

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

  // map สถานะฝั่ง UI -> สถานะ backend สำหรับ initial ของ modal
  const initialStatusForModal =
    room?.roomStatus === 'room available' ? 'FREE' : 'OCCUPIED';

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
          <IconButton onClick={() => navigate('/home?tab=ห้องทั้งหมด')}>
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

            {/* Invoice Payment Status */}
            <Box sx={{ mb: 2 }}>
              <Typography component="span" sx={{ fontWeight: 600, mr: 1 }}>สถานะการชำระ:</Typography>
              <Chip
                size="small"
                label={getStatusLabel(room.latestInvoiceStatus)}
                color={getStatusColor(room.latestInvoiceStatus)}
              />
            </Box>

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

        {/* Edit Room Button - ADMIN only */}
        {isAdmin && (
          <Box sx={{ pt: 2, mt: 'auto', borderTop: 1, borderColor: 'divider' }}>
            <Button
              variant="outlined"
              startIcon={<EditIcon />}
              fullWidth
              sx={actionBtnSx}
              onClick={() => setShowEdit(true)}
              disabled={!backendRoomId}
            >
              แก้ไขข้อมูล
            </Button>
          </Box>
        )}
      </Paper>

      {/* Right Paper */}
      <Paper
        elevation={3}
        sx={{ flex: '1 1 60%', height: '85vh', display: 'flex', flexDirection: 'column', p: 3 }}
      >
        <Tabs
          value={activeRightTab}
          onChange={handleRightTabChange}
          sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}
        >
          <Tab label="ใบแจ้งหนี้" />
          <Tab label="บำรุงรักษา" />
        </Tabs>

        <Box sx={{ flexGrow: 1, overflow: 'auto' }}>
          {activeRightTab === 0 && (
            <Box>
              {/* Invoice Tab - GUEST cannot see, USER can view only, ADMIN/STAFF full access */}
              {userRole === 'GUEST' ? (
                <Alert severity="info">
                  เฉพาะผู้ใช้ที่ลงทะเบียนเท่านั้นที่สามารถดูใบแจ้งหนี้ได้
                </Alert>
              ) : (
                <>
                  {/* Create button - ADMIN/STAFF only */}
                  {isAdmin && (
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
                  )}

                  {backendRoomId && (
                    <RoomInvoiceTable roomId={backendRoomId} showCreateButton={false} userRole={userRole} />
                  )}
                </>
              )}

              {backendRoomId && isAdmin && (
                <GenerateInvoiceModal
                  open={showCreateInv}
                  roomId={backendRoomId}
                  onClose={() => setShowCreateInv(false)}
                  onSuccess={() => setShowCreateInv(false)}
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
                  disabled={!roomNumber}
                >
                  เพิ่มงานบำรุงรักษา
                </Button>
              </Box>

              {roomNumber && (
                <MaintenanceTable roomNumber={Number(roomNumber)} reloadSignal={maintTick} />
              )}

              {roomNumber && (
                <CreateMaintenanceModal
                  roomNumber={Number(roomNumber)}
                  open={openCreateMaint}
                  onClose={() => setOpenCreateMaint(false)}
                  onSuccess={() => setMaintTick((t) => t + 1)}
                />
              )}
            </Box>
          )}
        </Box>
      </Paper>

      {/* Modal แก้ไขห้อง */}
      {backendRoomId && (
        <RoomEditModal
          open={showEdit}
          onClose={() => setShowEdit(false)}
          roomId={backendRoomId}
          initialNumber={Number(roomNumber)}
          initialStatus={initialStatusForModal}
          onSaved={() => setReloadTick((t) => t + 1)}
        />
      )}
    </Box>
  );
};

export default RoomDetail;