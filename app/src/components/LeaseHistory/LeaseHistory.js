import React, { useEffect, useMemo, useState } from 'react';
import {
  Box, Paper, Typography, TextField, Button, Table, TableHead,
  TableRow, TableCell, TableBody, CircularProgress, Alert, Stack,
  Dialog, DialogTitle, DialogContent, DialogActions
} from '@mui/material';
import { getAllLeases, settleLease, openLease, createLease } from '../../api/lease';

const fmt = (d) => {
  if (!d) return '-';
  try { return new Date(d).toISOString().slice(0, 10); } catch { return d; }
};

const LeaseHistory = () => {
  const [allRows, setAllRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState('');
  const [markingId, setMarkingId] = useState(null);

  const [roomFilter, setRoomFilter] = useState('');

  // ----- Create Lease dialog state -----
  const [openCreate, setOpenCreate] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    roomNumber: '',
    tenantId: '',
    startDate: fmt(new Date()),
    monthlyRent: '',
    depositBaht: '',
    customName: '',
    customIdCard: '',
    customAddress: '',
    customRules: '',
  });
  const [createErr, setCreateErr] = useState('');

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

  const rows = useMemo(() => {
    const q = roomFilter.trim();
    if (!q) return allRows;
    return allRows.filter(l => String(l?.room?.number ?? '').includes(q));
  }, [allRows, roomFilter]);

  const onMarkSettled = async (id) => {
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

  // ----- Create Lease handlers -----
  const openCreateDialog = () => {
    setCreateErr('');
    setForm((f) => ({ ...f, startDate: fmt(new Date()) }));
    setOpenCreate(true);
  };
  const closeCreateDialog = () => {
    setOpenCreate(false);
    setSaving(false);
    setCreateErr('');
  };
  const setF = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const onSubmitCreate = async () => {
    if (!form.roomNumber || !form.tenantId || !form.startDate) {
      setCreateErr('กรอก เลขห้อง, Tenant ID และ วันที่เริ่มสัญญา');
      return;
    }
    setSaving(true);
    setCreateErr('');
    try {
      const payload = {
        room: { number: Number(form.roomNumber) },
        tenant: { id: Number(form.tenantId) },
        startDate: form.startDate,
        monthlyRent: form.monthlyRent ? Number(form.monthlyRent) : null,
        depositBaht: form.depositBaht ? Number(form.depositBaht) : null,
        customName: form.customName || null,
        customIdCard: form.customIdCard || null,
        customAddress: form.customAddress || null,
        customRules: form.customRules || null,
      };
      await createLease(payload);
      closeCreateDialog();
      await loadAll();
    } catch (e) {
      setCreateErr(e?.message || 'Create lease failed');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto', p: 3 }}>
      <Typography variant="h4" sx={{ mb: 2 }}>ประวัติสัญญาเช่า</Typography>

      <Paper sx={{ p: 2, mb: 3 }}>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap' }}>
          {/* ซ้าย: กรองเลขห้อง + โหลดทั้งหมด */}
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
            <TextField
              label="เลขห้อง (กรอง)"
              size="small"
              value={roomFilter}
              onChange={(e) => setRoomFilter(e.target.value.replace(/\D/g, ''))}
              placeholder="เช่น 101"
            />
            <Button variant="contained" onClick={loadAll} disabled={loading}>
              โหลดทั้งหมด
            </Button>
            <Button variant="outlined" onClick={() => setRoomFilter('')} disabled={!roomFilter}>
              ล้างตัวกรอง
            </Button>
          </Box>

          {/* ขวา: ปุ่มเพิ่มสัญญาเช่า */}
          <Button variant="contained" onClick={openCreateDialog}>
            + เพิ่มสัญญาเช่า
          </Button>
        </Box>
      </Paper>

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
                <TableCell>ห้อง</TableCell>
                <TableCell>Tenant</TableCell>
                <TableCell>Custom Name</TableCell>
                <TableCell>เริ่ม</TableCell>
                <TableCell>สิ้นสุด</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Settled</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {rows.map((l) => (
                <TableRow key={l.id} hover>
                  <TableCell>{l.room?.number ?? '-'}</TableCell>
                  <TableCell>{l.tenant?.name || '-'}</TableCell>
                  <TableCell>{l.customName || '-'}</TableCell>
                  <TableCell>{fmt(l.startDate)}</TableCell>
                  <TableCell>{fmt(l.endDate)}</TableCell>
                  <TableCell>{l.status || '-'}</TableCell>
                  <TableCell>
                    {l.settled ? `Yes (${fmt(l.settledDate)})` : 'No'}
                  </TableCell>
                  <TableCell align="right">
                    <Stack direction="row" spacing={1} justifyContent="flex-end">
                      <Button size="small" onClick={() => openLease(l.id)}>Print</Button>
                      <Button
                        size="small"
                        variant="outlined"
                        onClick={() => onMarkSettled(l.id)}
                        disabled={!!l.settled || markingId === l.id}
                      >
                        {markingId === l.id ? 'Saving...' : 'Mark Settled'}
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

      {/* Create Lease Dialog */}
      <Dialog open={openCreate} onClose={closeCreateDialog} fullWidth maxWidth="md">
        <DialogTitle>สร้างสัญญาเช่า</DialogTitle>
        <DialogContent dividers>
          {createErr && <Alert severity="error" sx={{ mb: 2 }}>{createErr}</Alert>}
          <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 2 }}>
            <TextField label="เลขห้อง *" value={form.roomNumber}
              onChange={setF('roomNumber')} placeholder="เช่น 101" />
            <TextField label="Tenant ID *" value={form.tenantId}
              onChange={setF('tenantId')} placeholder="เช่น 1" />
            <TextField label="วันที่เริ่มสัญญา *" type="date" value={form.startDate}
              onChange={setF('startDate')} InputLabelProps={{ shrink: true }} />
            <TextField label="ค่าเช่าต่อเดือน (บาท)" value={form.monthlyRent}
              onChange={setF('monthlyRent')} placeholder="เช่น 7000" />
            <TextField label="เงินมัดจำ (บาท)" value={form.depositBaht}
              onChange={setF('depositBaht')} placeholder="เช่น 7000" />
            <TextField label="ชื่อ (แสดงบนสัญญา)" value={form.customName}
              onChange={setF('customName')} />
            <TextField label="บัตรประชาชน" value={form.customIdCard}
              onChange={setF('customIdCard')} />
            <TextField label="ที่อยู่" value={form.customAddress}
              onChange={setF('customAddress')} />
            <TextField label="กฎ/ข้อบังคับในสัญญา" value={form.customRules}
              onChange={setF('customRules')} multiline minRows={2} sx={{ gridColumn: '1 / -1' }} />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeCreateDialog}>ยกเลิก</Button>
          <Button variant="contained" onClick={onSubmitCreate} disabled={saving}>
            {saving ? 'กำลังบันทึก...' : 'สร้างสัญญา'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default LeaseHistory;
