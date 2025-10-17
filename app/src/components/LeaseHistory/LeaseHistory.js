// src/components/LeaseHistory/LeaseHistory.js
import React, { useEffect, useMemo, useState } from 'react';
import {
  Box, Paper, Typography, TextField, Button, Table, TableHead,
  TableRow, TableCell, TableBody, CircularProgress, Alert, Stack
} from '@mui/material';
import { getAllLeases, settleLease, openLease } from '../../api/lease';
import CreateLeaseModal from '../Lease/CreateLeaseModal';
import LeaseEditModal from './LeaseEditModal'; // new

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

  // create modal
  const [openCreate, setOpenCreate] = useState(false);

  // edit modal
  const [openEdit, setOpenEdit] = useState(false);
  const [editLeaseId, setEditLeaseId] = useState(null);

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
                  sx={{ cursor: 'pointer' }}
                  onClick={() => openForEdit(l.id)}
                >
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
