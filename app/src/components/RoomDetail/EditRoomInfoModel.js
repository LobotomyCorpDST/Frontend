import React, { useEffect, useMemo, useState } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, Stack, Button, MenuItem
} from '@mui/material';

// import { updateTenant, updateLease, updateRoomStatus } from '../../api/...';

export default function EditRoomInfoModel({
  open,
  onClose,
  room,           
  onSave,         
  roomIdLabel,     
}) {
  const today = useMemo(() => new Date().toISOString().slice(0,10), []);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');

  const [name, setName] = useState('');
  const [lineId, setLineId] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [roomStatus, setRoomStatus] = useState('room available');
  const [checkInDate, setCheckInDate] = useState('');
  const [checkOutDate, setCheckOutDate] = useState('');

  useEffect(() => {
    if (!open) return;
    setErr('');
    setBusy(false);
    setName(room?.tenantInfo?.name === 'N/A' ? '' : (room?.tenantInfo?.name || ''));
    setLineId(room?.tenantInfo?.lineId === '-' ? '' : (room?.tenantInfo?.lineId || ''));
    setPhoneNumber(room?.tenantInfo?.phoneNumber === '-' ? '' : (room?.tenantInfo?.phoneNumber || ''));
    setRoomStatus(room?.roomStatus || 'room available');
    setCheckInDate(room?.checkInDate && room.checkInDate !== '-' ? room.checkInDate : today);
    setCheckOutDate(room?.checkOutDate && room.checkOutDate !== '-' ? room.checkOutDate : '');
  }, [open, room, today]);

  async function submit() {
    setBusy(true); setErr('');
    try {
      const payload = {
        tenant: {
          name: name.trim() || 'N/A',
          lineId: (lineId || '-').trim(),
          phoneNumber: (phoneNumber || '-').trim(),
        },
        roomStatus,
        checkInDate: checkInDate || null,
        checkOutDate: checkOutDate || null,
        leaseStartDate: checkInDate || null,
        leaseEndDate: checkOutDate || null,
      };

      await onSave?.(payload);

      onClose?.();
    } catch (e) {
      setErr(e?.message || 'Save failed');
    } finally {
      setBusy(false);
    }
  }

  return (
    <Dialog open={open} onClose={busy ? undefined : onClose} maxWidth="sm" fullWidth>
      <DialogTitle>แก้ไขข้อมูลห้อง – ห้อง {roomIdLabel ?? room?.roomNumber}</DialogTitle>
      <DialogContent dividers>
        <Stack spacing={2} sx={{ mt: 1 }}>
          <TextField
            label="ชื่อผู้เช่า"
            value={name}
            onChange={(e)=>setName(e.target.value)}
            placeholder="เช่น นายสมชาย ใจดี"
          />
          <TextField
            label="LINE"
            value={lineId}
            onChange={(e)=>setLineId(e.target.value)}
            placeholder="line_id"
          />
          <TextField
            label="เบอร์โทร"
            value={phoneNumber}
            onChange={(e)=>setPhoneNumber(e.target.value)}
            placeholder="0812345678"
          />
          <TextField
            select
            label="สถานะห้อง"
            value={roomStatus}
            onChange={(e)=>setRoomStatus(e.target.value)}
          >
            <MenuItem value="room available">room available</MenuItem>
            <MenuItem value="rent paid">rent paid</MenuItem>
          </TextField>
          <TextField
            type="date"
            label="วันที่เข้า"
            value={checkInDate}
            onChange={(e)=>setCheckInDate(e.target.value)}
            InputLabelProps={{ shrink: true }}
          />
          <TextField
            type="date"
            label="วันที่ออก"
            value={checkOutDate}
            onChange={(e)=>setCheckOutDate(e.target.value)}
            InputLabelProps={{ shrink: true }}
          />
          {err && <div style={{ color: 'crimson' }}>{err}</div>}
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={busy}>ยกเลิก</Button>
        <Button
          variant="contained"
          onClick={submit}
          disabled={busy /* จะเพิ่ม validate เพิ่มก็ได้ เช่น !name.trim() */}
        >
          บันทึก
        </Button>
      </DialogActions>
    </Dialog>
  );
}
