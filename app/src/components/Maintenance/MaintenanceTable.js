import React, { useEffect, useMemo, useState } from 'react';
import {
  Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Box, Button, Chip, CircularProgress, IconButton, Stack, Tooltip
} from '@mui/material';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import RefreshIcon from '@mui/icons-material/Refresh';
import { listMaintenanceByRoom, completeMaintenance } from '../../api/maintenance';

function statusChip(status) {
  const s = (status || '').toUpperCase();
  const map = {
    PLANNED: 'info',
    IN_PROGRESS: 'warning',
    COMPLETED: 'success',
    DONE: 'success',        // กันกรณี enum เป็น DONE
    CANCELED: 'default',
  };
  return <Chip label={status} color={map[s] || 'default'} size="small" />;
}

function money(n) {
  if (n == null) return '-';
  return Number(n).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export default function MaintenanceTable({ roomId, reloadSignal = 0 }) {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);

  const canComplete = useMemo(
    () => (st) => {
      const s = (st || '').toUpperCase();
      return s !== 'COMPLETED' && s !== 'DONE' && s !== 'CANCELED';
    },
    []
  );

  async function load() {
    if (!roomId) return;
    setLoading(true);
    try {
      const data = await listMaintenanceByRoom(roomId);
      setRows(data);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); /* eslint-disable-next-line */ }, [roomId, reloadSignal]);

  async function doComplete(id) {
    const today = new Date().toISOString().slice(0, 10);
    await completeMaintenance(id, today);
    await load();
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
        <Stack direction="row" alignItems="center" spacing={1}>
          <Tooltip title="รีเฟรช">
            <IconButton onClick={load} size="small"><RefreshIcon /></IconButton>
          </Tooltip>
        </Stack>
      </Box>

      <TableContainer component={Paper} variant="outlined">
        <Table stickyHeader size="small">
          <TableHead>
            <TableRow>
              <TableCell>วันที่นัด</TableCell>
              <TableCell>รายละเอียด</TableCell>
              <TableCell>สถานะ</TableCell>
              <TableCell align="right">ค่าใช้จ่าย (บาท)</TableCell>
              <TableCell align="right">เสร็จเมื่อ</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {loading ? (
              <TableRow><TableCell colSpan={6} align="center"><CircularProgress size={22} /></TableCell></TableRow>
            ) : rows.length === 0 ? (
              <TableRow><TableCell colSpan={6} align="center">ยังไม่มีงานบำรุงรักษา</TableCell></TableRow>
            ) : rows.map(r => (
              <TableRow key={r.id}>
                <TableCell>{r.scheduledDate || '-'}</TableCell>
                <TableCell>{r.description || '-'}</TableCell>
                <TableCell>{statusChip(r.status)}</TableCell>
                <TableCell align="right">{money(r.costBaht)}</TableCell>
                <TableCell align="right">{r.completedDate || '-'}</TableCell>
                <TableCell align="right">
                  {canComplete(r.status) && (
                    <Button size="small" variant="outlined" startIcon={<CheckCircleOutlineIcon />} onClick={() => doComplete(r.id)}>
                      ทำเสร็จ
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}
