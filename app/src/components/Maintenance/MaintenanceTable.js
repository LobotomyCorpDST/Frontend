import React, { useEffect, useMemo, useState } from 'react';
import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  Box,
  Button,
  Chip,
  CircularProgress,
  IconButton,
  Stack,
  Tooltip,
  TableRow,
} from '@mui/material';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import RefreshIcon from '@mui/icons-material/Refresh';
import EditIcon from '@mui/icons-material/Edit';
import { listMaintenanceByRoomNumber, completeMaintenance } from '../../api/maintenance';
import EditMaintenanceModal from './EditMaintenanceModal';
import StandardTableHeader from '../Common/StandardTableHeader';

function statusChip(status) {
  const s = (status || '').toUpperCase();

  // Thai translation map
  const statusMap = {
    'PLANNED': 'วางแผน',
    'IN_PROGRESS': 'กำลังดำเนินการ',
    'COMPLETED': 'เสร็จสิ้น',
    'DONE': 'เสร็จสิ้น',
    'CANCELED': 'ยกเลิก',
  };

  const colorMap = {
    PLANNED: 'info',
    IN_PROGRESS: 'warning',
    COMPLETED: 'success',
    DONE: 'success',
    CANCELED: 'default',
  };

  const label = statusMap[s] || status || '-';
  return <Chip label={label} color={colorMap[s] || 'default'} size="small" />;
}

function money(n) {
  if (n == null) return '-';
  return Number(n).toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

const headCells = [
  { id: 'scheduledDate', label: 'วันที่นัด' },
  { id: 'description', label: 'รายละเอียด' },
  { id: 'status', label: 'สถานะ' },
  { id: 'costBaht', label: 'ค่าใช้จ่าย (บาท)', align: 'right' },
  { id: 'completedDate', label: 'เสร็จเมื่อ', align: 'right' },
  { id: 'actions', label: 'การดำเนินการ', disableSorting: true, align: 'right' },
];

export default function MaintenanceTable({ roomNumber, reloadSignal = 0 }) {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openEdit, setOpenEdit] = useState(false);
  const [selectedId, setSelectedId] = useState(null);
  const [sortConfig, setSortConfig] = useState({ key: 'scheduledDate', direction: 'descending' });

  const canComplete = useMemo(
    () => (st) => {
      const s = (st || '').toUpperCase();
      return s !== 'COMPLETED' && s !== 'DONE' && s !== 'CANCELED';
    },
    []
  );

  async function load() {
    if (!roomNumber) return;
    setLoading(true);
    try {
      const data = await listMaintenanceByRoomNumber(roomNumber);
      setRows(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to fetch maintenance list:', err);
      setRows([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roomNumber, reloadSignal]);

  const handleRequestSort = (property) => {
    const isAsc = sortConfig.key === property && sortConfig.direction === 'ascending';
    setSortConfig({ key: property, direction: isAsc ? 'descending' : 'ascending' });
  };

  const sortedRows = useMemo(() => {
    if (!sortConfig.key) return rows;

    return [...rows].sort((a, b) => {
      let aVal = a[sortConfig.key];
      let bVal = b[sortConfig.key];

      // Handle null/undefined
      if (aVal == null) aVal = '';
      if (bVal == null) bVal = '';

      // Compare
      if (aVal < bVal) return sortConfig.direction === 'ascending' ? -1 : 1;
      if (aVal > bVal) return sortConfig.direction === 'ascending' ? 1 : -1;
      return 0;
    });
  }, [rows, sortConfig]);

  async function doComplete(id) {
    const today = new Date().toISOString().slice(0, 10);
    try {
      await completeMaintenance(id, today);
      await load();
    } catch (err) {
      console.error('Failed to complete maintenance:', err);
    }
  }

  const handleEdit = (id) => {
    setSelectedId(id);
    setOpenEdit(true);
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
        <Stack direction="row" alignItems="center" spacing={1}>
          <Tooltip title="รีเฟรช">
            <IconButton onClick={load} size="small">
              <RefreshIcon />
            </IconButton>
          </Tooltip>
        </Stack>
      </Box>

      <TableContainer component={Paper} variant="outlined">
        <Table stickyHeader size="small">
          <StandardTableHeader columns={headCells} sortConfig={sortConfig} onRequestSort={handleRequestSort} />
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} align="center">
                  <CircularProgress size={22} />
                </TableCell>
              </TableRow>
            ) : rows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} align="center">
                  ยังไม่มีงานบำรุงรักษา
                </TableCell>
              </TableRow>
            ) : (
              sortedRows.map((r) => (
                <TableRow key={r.id}>
                  <TableCell>{r.scheduledDate || '-'}</TableCell>
                  <TableCell>{r.description || '-'}</TableCell>
                  <TableCell>{statusChip(r.status)}</TableCell>
                  <TableCell align="right">{money(r.costBaht)}</TableCell>
                  <TableCell align="right">{r.completedDate || '-'}</TableCell>
                  <TableCell align="right">
                    <Stack direction="row" justifyContent="flex-end" spacing={1}>
                      {canComplete(r.status) && (
                        <Button
                          size="small"
                          variant="outlined"
                          startIcon={<CheckCircleOutlineIcon />}
                          onClick={() => doComplete(r.id)}
                        >
                          ทำเสร็จ
                        </Button>
                      )}
                      <Button
                        size="small"
                        variant="outlined"
                        startIcon={<EditIcon />}
                        onClick={() => handleEdit(r.id)}
                      >
                        แก้ไข
                      </Button>
                    </Stack>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {openEdit && (
        <EditMaintenanceModal
          open={openEdit}
          maintenanceId={selectedId}
          onClose={() => setOpenEdit(false)}
          onSaved={() => {
            setOpenEdit(false);
            load();
          }}
        />
      )}
    </Box>
  );
}
