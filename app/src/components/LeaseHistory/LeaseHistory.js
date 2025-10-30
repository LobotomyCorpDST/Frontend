// src/components/LeaseHistory/LeaseHistory.js
import React, { useEffect, useMemo, useState } from 'react';
import {
  Box, Paper, Typography, TextField, Button, Table, TableHead,
  TableRow, TableCell, TableBody, CircularProgress, Alert, Stack, Checkbox, Toolbar, Tooltip
} from '@mui/material';
import PrintIcon from '@mui/icons-material/Print';
import { getAllLeases, settleLease, openLease, bulkPrintLeases } from '../../api/lease';
import CreateLeaseModal from '../Lease/CreateLeaseModal';
import LeaseEditModal from './LeaseEditModal'; // new
import SmartSearchAutocomplete from '../Common/SmartSearchAutocomplete';

const fmt = (d) => {
  if (!d) return '-';
  try { return new Date(d).toISOString().slice(0, 10); } catch { return d; }
};

const LeaseHistory = () => {
  const [allRows, setAllRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState('');
  const [markingId, setMarkingId] = useState(null);
  const [printingId, setPrintingId] = useState(null);

  const [searchTerm, setSearchTerm] = useState('');

  // create modal
  const [openCreate, setOpenCreate] = useState(false);

  // edit modal
  const [openEdit, setOpenEdit] = useState(false);
  const [editLeaseId, setEditLeaseId] = useState(null);

  // Bulk selection state
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [bulkPrinting, setBulkPrinting] = useState(false);
  const [bulkError, setBulkError] = useState('');

  const loadAll = async () => {
    setLoading(true);
    setErr('');
    try {
      const data = await getAllLeases();
      setAllRows(Array.isArray(data) ? data : []);
    } catch (e) {
      setErr(e?.message || 'Load leases failed');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadAll(); }, []);

  // Convert leases to searchable options
  const searchOptions = useMemo(() => {
    return allRows.map((lease) => ({
      id: lease.id,
      label: `Lease #${lease.id} - ห้อง ${lease.room?.number ?? '-'} - ${lease.tenant?.name ?? '-'}`,
      value: lease.id,
      searchText: `${lease.id} ${lease.room?.number ?? ''} ${lease.tenant?.name ?? ''}`,
    }));
  }, [allRows]);

  // Filter leases based on search
  const rows = useMemo(() => {
    if (!searchTerm) return allRows;
    return allRows.filter(l => l.id === searchTerm);
  }, [allRows, searchTerm]);

  const onMarkSettled = async (id, e) => {
    if (e) e.stopPropagation();
    try {
      setMarkingId(id);
      await settleLease(id, fmt(new Date()));
      await loadAll();
    } catch (e) {
      setErr(e?.message || 'Mark settled failed');
    } finally {
      setMarkingId(null);
    }
  };

  const onPrint = async (id, e) => {
    if (e) e.stopPropagation();
    try {
      setPrintingId(id);
      await openLease(id);
    } catch (e) {
      setErr(e?.message || 'เปิดสัญญาเพื่อพิมพ์ไม่สำเร็จ');
    } finally {
      setPrintingId(null);
    }
  };

  const openForEdit = (id) => {
    setEditLeaseId(id);
    setOpenEdit(true);
  };

  // Bulk selection handlers
  const handleToggleSelect = (id) => {
    setSelectedIds((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const handleSelectAll = () => {
    if (selectedIds.size === rows.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(rows.map((l) => l.id)));
    }
  };

  const handleClearSelection = () => {
    setSelectedIds(new Set());
    setBulkError('');
  };

  const handleBulkPrint = async () => {
    if (selectedIds.size === 0) return;

    setBulkPrinting(true);
    setBulkError('');
    try {
      await bulkPrintLeases(Array.from(selectedIds));
      handleClearSelection();
    } catch (error) {
      setBulkError(error?.message || 'Failed to print leases');
    } finally {
      setBulkPrinting(false);
    }
  };

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto', p: 3 }}>
      <Typography variant="h4" sx={{ mb: 2 }}>ประวัติสัญญาเช่า</Typography>

      <Paper sx={{ p: 2, mb: 3 }}>
        <Box
          sx={{
            display: 'flex',
            gap: 2,
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap'
          }}
        >
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexGrow: 1, maxWidth: 600 }}>
            <SmartSearchAutocomplete
              options={searchOptions}
              label="ค้นหาสัญญาเช่า"
              value={searchTerm}
              onChange={(value) => setSearchTerm(value)}
              placeholder="พิมพ์เลข Lease, ห้อง, หรือชื่อผู้เช่า..."
            />
            <Button variant="contained" onClick={loadAll} disabled={loading}>
              โหลดทั้งหมด
            </Button>
          </Box>

          <Button variant="contained" onClick={() => setOpenCreate(true)}>
            + เพิ่มสัญญาเช่า
          </Button>
        </Box>
      </Paper>

      {/* Bulk action toolbar */}
      {selectedIds.size > 0 && (
        <Toolbar
          sx={{
            pl: { sm: 2 },
            pr: { xs: 1, sm: 1 },
            bgcolor: 'primary.light',
            color: 'primary.contrastText',
            borderRadius: 1,
            mb: 2,
          }}
        >
          <Typography sx={{ flex: '1 1 100%' }} variant="subtitle1" component="div">
            {selectedIds.size} selected
          </Typography>
          <Tooltip title="Print Selected">
            <Button
              variant="contained"
              color="secondary"
              startIcon={<PrintIcon />}
              onClick={handleBulkPrint}
              disabled={bulkPrinting}
              sx={{ mr: 1 }}
            >
              {bulkPrinting ? 'กำลังปริ้น...' : `ปริ้น (${selectedIds.size})`}
            </Button>
          </Tooltip>
          <Button variant="outlined" color="inherit" onClick={handleClearSelection}>
            ล้าง
          </Button>
        </Toolbar>
      )}

      {/* Bulk error message */}
      {bulkError && (
        <Alert severity="error" onClose={() => setBulkError('')} sx={{ mb: 2 }}>
          {bulkError}
        </Alert>
      )}

      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
          <CircularProgress />
        </Box>
      )}
      {err && <Alert severity="error" sx={{ mb: 2 }}>{err}</Alert>}

      {!loading && rows.length > 0 && (
        <Paper>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell padding="checkbox">
                  <Checkbox
                    indeterminate={selectedIds.size > 0 && selectedIds.size < rows.length}
                    checked={rows.length > 0 && selectedIds.size === rows.length}
                    onChange={handleSelectAll}
                  />
                </TableCell>
                <TableCell>ห้อง</TableCell>
                <TableCell>ผู้เช่าอาศัย</TableCell>
                <TableCell>เริ่ม</TableCell>
                <TableCell>สิ้นสุด</TableCell>
                <TableCell>สถานะ</TableCell>
                <TableCell>Settled</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {rows.map((l) => (
                <TableRow
                  key={l.id}
                  hover
                  sx={{
                    cursor: 'pointer',
                    backgroundColor: selectedIds.has(l.id) ? 'rgba(25, 118, 210, 0.08)' : 'inherit',
                  }}
                  onClick={() => openForEdit(l.id)}
                >
                  <TableCell padding="checkbox" onClick={(e) => e.stopPropagation()}>
                    <Checkbox
                      checked={selectedIds.has(l.id)}
                      onChange={() => handleToggleSelect(l.id)}
                    />
                  </TableCell>
                  <TableCell>{l.room?.number ?? '-'}</TableCell>
                  <TableCell>{l.tenant?.name || '-'}</TableCell>
                  <TableCell>{fmt(l.startDate)}</TableCell>
                  <TableCell>{fmt(l.endDate)}</TableCell>
                  <TableCell>{l.status || '-'}</TableCell>
                  <TableCell>{l.settled ? `Yes (${fmt(l.settledDate)})` : 'No'}</TableCell>
                  <TableCell align="right">
                  <Stack direction="row" spacing={1} justifyContent="flex-end">
                    <Button
                      size="small"
                      onClick={(e) => onPrint(l.id, e)}
                      disabled={printingId === l.id}
                    >
                      {printingId === l.id ? 'กำลังเปิด' : 'ปริ้น'}
                    </Button>

                    {/* ✅ New Edit button */}
                    <Button
                      size="small"
                      variant="outlined"
                     color="primary"
                      onClick={(e) => {
                        e.stopPropagation();
                        openForEdit(l.id);
                     }}
                   >
                     แก้ไข
                    </Button>

                    <Button
                      size="small"
                      variant="outlined"
                      onClick={(e) => onMarkSettled(l.id, e)}
                      disabled={!!l.settled || markingId === l.id}
                    >
                      {markingId === l.id ? 'กำลังบันทึก' : 'ตั้งค่าครบกำหนด'}
                   </Button>
                  </Stack>
                  </TableCell>

                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Paper>
      )}

      {!loading && !err && rows.length === 0 && (
        <Typography color="text.secondary" sx={{ mt: 2 }}>
          ไม่พบข้อมูล
        </Typography>
      )}

      <CreateLeaseModal
        open={openCreate}
        onClose={() => setOpenCreate(false)}
        onSuccess={async () => {
          setOpenCreate(false);
          await loadAll();
        }}
      />

      <LeaseEditModal
        open={openEdit}
        leaseId={editLeaseId}
        onClose={() => { setOpenEdit(false); setEditLeaseId(null); }}
        onSaved={async () => { setOpenEdit(false); setEditLeaseId(null); await loadAll(); }}
      />
    </Box>
  );
};

export default LeaseHistory;
