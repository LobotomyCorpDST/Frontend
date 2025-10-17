import React, { useMemo, useState } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, Stack, Button
} from '@mui/material';
import { createMaintenance } from '../../api/maintenance';

export default function CreateMaintenanceModal({
  roomNumber,            // ✅ ใช้ roomNumber เป็นหลัก
  roomId,                // (fallback ชั่วคราว ถ้า parent ยังส่งมา)
  open,
  onClose,
  onSuccess
}) {
  const today = useMemo(() => new Date().toISOString().slice(0, 10), []);
  const [scheduledDate, setScheduledDate] = useState(today);
  const [description, setDescription] = useState('');
  const [costBaht, setCostBaht] = useState('');
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');

  // รองรับช่วงเปลี่ยนผ่าน: ถ้าไม่มี roomNumber ให้ลองใช้ roomId ที่ส่งมาแทน (แต่จะส่งเป็น roomNumber ไปให้ BE)
  const effectiveRoomNumber = roomNumber ?? roomId ?? null;

  async function submit() {
    if (!effectiveRoomNumber) {
      setErr('ไม่พบหมายเลขห้อง (roomNumber)'); 
      return;
    }
    if (!description.trim()) {
      setErr('กรุณากรอกรายละเอียดงาน');
      return;
    }
    if (!scheduledDate) {
      setErr('กรุณาเลือกวันที่นัด');
      return;
    }

    setBusy(true); setErr('');
    try {
      const payload = {
        roomNumber: Number(effectiveRoomNumber),
        description: description.trim(),
        scheduledDate, // YYYY-MM-DD
        costBaht: costBaht === '' ? null : Number(costBaht)
      };
      await createMaintenance(payload);
      onSuccess?.();
      onClose?.();
    } catch (e) {
      // http.js จะโยน err.body.message ถ้ามี
      const msg = (e?.body && (e.body.error || e.body.message)) || e?.message || 'Create failed';
      setErr(msg);
    } finally {
      setBusy(false);
    }
  }

  return (
    <Dialog open={open} onClose={busy ? undefined : onClose} maxWidth="xs" fullWidth>
      <DialogTitle>เพิ่มงานบำรุงรักษา – ห้อง {effectiveRoomNumber ?? '-'}</DialogTitle>
      <DialogContent dividers>
        <Stack spacing={2} sx={{ mt: 1 }}>
          <TextField
            type="date"
            label="วันที่นัด"
            InputLabelProps={{ shrink: true }}
            value={scheduledDate}
            onChange={(e) => setScheduledDate(e.target.value)}
            fullWidth
          />
          <TextField
            label="รายละเอียด"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="เช่น เปลี่ยนหลอดไฟ, เช็คแอร์..."
            multiline
            minRows={2}
            fullWidth
          />
          <TextField
            type="number"
            label="ค่าใช้จ่าย (บาท)"
            value={costBaht}
            onChange={(e) => setCostBaht(e.target.value)}
            inputProps={{ step: '0.01', min: '0' }}
            fullWidth
          />
          {err && <div style={{ color: 'crimson' }}>{err}</div>}
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={busy}>ยกเลิก</Button>
        <Button variant="contained" onClick={submit} disabled={busy || !effectiveRoomNumber || !description.trim()}>
          บันทึก
        </Button>
      </DialogActions>
    </Dialog>
  );
}
