// src/components/LeaseHistory/LeaseHistory.js
import React, { useEffect, useMemo, useState } from 'react';
import {
  Box, Paper, Typography, TextField, Button, Table, TableHead,
  TableRow, TableCell, TableBody, CircularProgress, Alert, Stack
} from '@mui/material';
import { getAllLeases, settleLease, openLease } from '../../api/lease';
import CreateLeaseModal from '../Lease/CreateLeaseModal'; // ใช้ modal ใหม่

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

  const [roomFilter, setRoomFilter] = useState('');

  // ใช้ CreateLeaseModal แทน dialog ภายในไฟล์
  const [openCreate, setOpenCreate] = useState(false);

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

  const onPrint = async (id) => {
    try {
      setPrintingId(id);
      await openLease(id);              // ใช้ http.getBlob เปิดไฟล์พร้อม token
    } catch (e) {
      setErr(e?.message || 'เปิดสัญญาเพื่อพิมพ์ไม่สำเร็จ');
    } finally {
      setPrintingId(null);
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
          <Button variant="contained" onClick={() => setOpenCreate(true)}>
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
                      <Button
                        size="small"
                        onClick={() => onPrint(l.id)}
                        disabled={printingId === l.id}
                      >
                        {printingId === l.id ? 'Opening…' : 'Print'}
                      </Button>
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

      {/* ใช้ CreateLeaseModal ตัวใหม่ */}
      <CreateLeaseModal
        open={openCreate}
        onClose={() => setOpenCreate(false)}
        onSuccess={async () => {
          setOpenCreate(false);
          await loadAll();
        }}
      />
    </Box>
  );
};

export default LeaseHistory;