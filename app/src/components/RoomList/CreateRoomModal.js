import React, { useState } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, Button, Alert, Box, MenuItem
} from '@mui/material';
import { createRoom } from '../../api/room';

const DEFAULT_STATUS = 'FREE';
const STATUS_OPTIONS = ['FREE', 'OCCUPIED'];

const CreateRoomModal = ({ open, onClose, onCreated }) => {
  const [number, setNumber] = useState('');
  const [status, setStatus] = useState(DEFAULT_STATUS);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState('');

  const reset = () => {
    setNumber('');
    setStatus(DEFAULT_STATUS);
    setErr('');
  };

  const onSubmit = async () => {
    if (!number) {
      setErr('กรอกเลขห้อง');
      return;
    }
    setSaving(true);
    setErr('');
    try {
      await createRoom({ number: Number(number), status });
      reset();
      onCreated?.();
      onClose?.();
    } catch (e) {
      setErr(e?.message || 'Create room failed');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>เพิ่มห้อง</DialogTitle>
      <DialogContent dividers>
        {err && <Alert severity="error" sx={{ mb: 2 }}>{err}</Alert>}
        <Box sx={{ display: 'grid', gap: 2 }}>
          <TextField
            label="เลขห้อง *"
            value={number}
            onChange={(e) => setNumber(e.target.value.replace(/\D/g, ''))}
            placeholder="เช่น 101"
            autoFocus
          />
          <TextField
            select
            label="สถานะ"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
          >
            {STATUS_OPTIONS.map(op => (
              <MenuItem key={op} value={op}>{op}</MenuItem>
            ))}
          </TextField>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>ยกเลิก</Button>
        <Button variant="contained" onClick={onSubmit} disabled={saving}>
          {saving ? 'กำลังบันทึก...' : 'สร้างห้อง'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CreateRoomModal;
