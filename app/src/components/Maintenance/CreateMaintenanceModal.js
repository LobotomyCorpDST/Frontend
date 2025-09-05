import React, { useMemo, useState } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, Stack, Button
} from '@mui/material';
import { createMaintenance } from '../../api/maintenance';

export default function CreateMaintenanceModal({ roomId, open, onClose, onSuccess }) {
  const today = useMemo(() => new Date().toISOString().slice(0,10), []);
  const [scheduledDate, setScheduledDate] = useState(today);
  const [description, setDescription] = useState('');
  const [costBaht, setCostBaht] = useState('');
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');

  async function submit() {
    setBusy(true); setErr('');
    try {
      const payload = {
        roomId,
        description: description?.trim() || '',
        scheduledDate,
        costBaht: costBaht === '' ? null : Number(costBaht),
      };
      await createMaintenance(payload);
      onSuccess?.();
      onClose?.();
    } catch (e) {
      setErr(e.message || 'Create failed');
    } finally {
      setBusy(false);
    }
  }

  return (
    <Dialog open={open} onClose={busy ? undefined : onClose} maxWidth="xs" fullWidth>
      <DialogTitle>เพิ่มงานบำรุงรักษา – ห้อง {roomId}</DialogTitle>
      <DialogContent dividers>
        <Stack spacing={2} sx={{ mt: 1 }}>
          <TextField
            type="date" label="วันที่นัด" InputLabelProps={{ shrink: true }}
            value={scheduledDate} onChange={e=>setScheduledDate(e.target.value)}
          />
          <TextField
            label="รายละเอียด" value={description} onChange={e=>setDescription(e.target.value)}
            placeholder="เช่น เปลี่ยนหลอดไฟ, เช็คแอร์..."
            multiline minRows={2}
          />
          <TextField
            type="number" label="ค่าใช้จ่าย (บาท)" value={costBaht}
            onChange={e=>setCostBaht(e.target.value)}
            inputProps={{ step: '0.01' }}
          />
          {err && <div style={{ color: 'crimson' }}>{err}</div>}
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={busy}>ยกเลิก</Button>
        <Button variant="contained" onClick={submit} disabled={busy || !description.trim()}>
          บันทึก
        </Button>
      </DialogActions>
    </Dialog>
  );
}