import React, { useEffect, useMemo, useState } from 'react';
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

const RoomDetail = () => {
  const { roomNumber } = useParams();
  const navigate = useNavigate();

  const [room, setRoom] = useState(null);
  const [activeRightTab, setActiveRightTab] = useState(0);

  // modal สำหรับสร้าง "ใบแจ้งหนี้"
  const [showCreateInv, setShowCreateInv] = useState(false);

  // modal สำหรับ "เพิ่มงานบำรุงรักษา" + ตัวกระตุ้นรีโหลดตาราง
  const [openCreateMaint, setOpenCreateMaint] = useState(false);
  const [maintTick, setMaintTick] = useState(0);

  // map เลขห้อง -> roomId ของ backend (ตาม seed ปัจจุบัน)
  const backendRoomId = useMemo(() => {
    const map = { 101: 1, 102: 2, 201: 3 };
    const n = Number(roomNumber);
    return map[n] ?? null;
  }, [roomNumber]);

  const handleRightTabChange = (_e, v) => setActiveRightTab(v);

  useEffect(() => {
    const foundRoom = placeholderData.find(r => r.roomNumber === parseInt(roomNumber));
    if (foundRoom) {
      setRoom(foundRoom);
    }
  }, [roomNumber]);

  if (!room) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', my: 5 }}>
        <CircularProgress />
      </Box>
    );
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
                  <Typography textAlign={'left'}>
                    <strong>LINE:</strong>
                    <span style={{ paddingLeft: '28.5px' }}>{room.tenantInfo.lineId}</span>
                  </Typography>
                  <Typography variant="body1" textAlign={'left'}>
                    <strong>เบอร์โทร:</strong> {room.tenantInfo.phoneNumber}
                  </Typography>
                </Box>
              </Grid>

            </Grid>
          </Paper>
          <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
            <Typography variant="h6" gutterBottom>รายละเอียดสัญญาเช่า</Typography>
            <Typography><strong>สถานะ:</strong> {room.roomStatus}</Typography>
            <Grid container spacing={6} alignItems="flex-start" justifyContent={'center'}>

              <Grid item xs={12} sm={4} >
                <Box>
                  <Typography textAlign={'left'}>
                    <strong>วันที่เข้า:</strong>
                    <span style={{ paddingLeft: '10.5px' }}>{room.checkInDate}</span>
                  </Typography>
                  <Typography textAlign={'left'}><strong>วันที่ออก:</strong> {room.checkOutDate}</Typography>
                </Box>
              </Grid>

              <Grid item xs={12} sm={5}>
                <Box>
                  <Typography textAlign={'left'}><strong>สัญญาเริ่ม:</strong> {room.leaseStartDate}</Typography>
                  <Typography textAlign={'left'}>
                    <strong>สัญญาจบ:</strong>
                    <span style={{ paddingLeft: '7.5px' }}>{room.leaseEndDate}</span>
                  </Typography>
                </Box>
              </Grid>

            </Grid>
          </Paper>
          <Paper variant="outlined" sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>ค่าใช้จ่ายล่าสุด</Typography>
            <Grid container spacing={6} alignItems="flex-start" justifyContent={'center'}>

              <Grid item xs={12} sm={4} >
                <Box>
                  <Typography textAlign={'left'}><strong>ค่าไฟ (หน่วย):</strong> {room.latestUsage.electricity.units}</Typography>
                  <Typography textAlign={'left'}>
                    <strong>ค่าไฟ (บาท):</strong>
                    <span style={{ paddingLeft: '14px' }}>{room.latestUsage.electricity.baht}</span>
                  </Typography>
                </Box>
              </Grid>

              <Grid item xs={12} sm={5}>
                <Box>
                  <Typography textAlign={'left'}><strong>ค่าน้ำ (หน่วย):</strong> {room.latestUsage.water.units}</Typography>
                  <Typography textAlign={'left'}>
                    <strong>ค่าน้ำ (บาท):</strong>
                    <span style={{ paddingLeft: '14px' }}>{room.latestUsage.water.baht}</span>
                  </Typography>
                </Box>
              </Grid>

            </Grid>

            <Typography ><strong>รวม:</strong> {room.latestUsage.totalBaht}</Typography>
          </Paper>
        </Box>
        <Box sx={{ pt: 2, mt: 2, borderTop: 1, borderColor: 'divider', display: 'flex', gap: 2 }}>
          <Button variant="outlined" startIcon={<EditIcon />} fullWidth sx={actionBtnSx}>
            แก้ไขข้อมูล
          </Button>
        </Box>
      </Paper>

      {/* RIGHT */}
      <Paper elevation={3} sx={{ flex: '1 1 60%', height: '85vh', display: 'flex', flexDirection: 'column', p: 3 }}>
        <Tabs value={activeRightTab} onChange={handleRightTabChange} sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
          <Tab label="ใบแจ้งหนี้" />
          <Tab label="บำรุงรักษา" />
        </Tabs>

        <Box sx={{ flexGrow: 1, overflow: 'auto' }}>
          {/* TAB: ใบแจ้งหนี้ */}
          {activeRightTab === 0 && (
            <Box>
              {!backendRoomId ? (
                <Alert severity="warning">
                  ยังไม่ทราบ <code>roomId</code> ของ backend สำหรับห้อง {room.roomNumber} – ปุ่มสร้างบิลถูกปิดไว้
                </Alert>
              ) : (
                <>
                  {/* ปุ่มสร้างใบแจ้งหนี้ (อันเดียวในหน้านี้) */}
                  <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
                    <Button
                      variant="contained"
                      color="primary"
                      size="small"
                      startIcon={<AddIcon />}
                      disableElevation
                      sx={actionBtnSx}
                      onClick={() => setShowCreateInv(true)}
                    >
                      สร้างใบแจ้งหนี้
                    </Button>
                  </Box>

                  {/* ตารางใบแจ้งหนี้ (ซ่อนปุ่มภายในตาราง) */}
                  <RoomInvoiceTable roomId={backendRoomId} showCreateButton={false} />

                  {showCreateInv && (
                    <GenerateInvoiceModal
                      roomId={backendRoomId}
                      onClose={() => setShowCreateInv(false)}
                      onSuccess={() => {}}
                    />
                  )}
                </>
              )}
            </Box>
          )}

          {/* TAB: บำรุงรักษา */}
          {activeRightTab === 1 && (
            <Box>
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
                <Button
                  variant="contained"
                  color="primary"
                  size="small"
                  startIcon={<AddIcon />}
                  disableElevation
                  sx={actionBtnSx}
                  onClick={() => setOpenCreateMaint(true)}
                  disabled={!backendRoomId}
                >
                  เพิ่มงานบำรุงรักษา
                </Button>
              </Box>

              {!backendRoomId ? (
                <Paper sx={{ p: 2 }}>ยังไม่ทราบ <code>roomId</code> ของ backend</Paper>
              ) : (
                <>
                  <MaintenanceTable roomId={backendRoomId} reloadSignal={maintTick} />
                  <CreateMaintenanceModal
                    roomId={backendRoomId}
                    open={openCreateMaint}
                    onClose={() => setOpenCreateMaint(false)}
                    onSuccess={() => setMaintTick(t => t + 1)}
                  />
                </>
              )}
            </Box>
          )}
        </Box>
      </Paper>
    </Box>
  );
};

export default RoomDetail;