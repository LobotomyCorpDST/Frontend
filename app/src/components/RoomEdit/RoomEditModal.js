// src/components/RoomEdit/RoomEditModal.js
import React, { useEffect, useMemo, useState } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, Button, Stack, MenuItem, Alert, CircularProgress
} from '@mui/material';
import { getRoomById, updateRoom, deleteRoom } from '../../api/room'; // ✅ added deleteRoom

const STATUS_OPTIONS = [
  { value: 'FREE', label: 'FREE (ว่าง)' },
  { value: 'OCCUPIED', label: 'OCCUPIED (มีผู้เช่า)' },
];

export default function RoomEditModal({
  open,
  onClose,
  roomId,
  initialNumber,
  initialStatus = 'FREE',
  onSaved,            // callback ให้หน้า RoomDetail reload ข้อมูล
}) {
  const [number, setNumber] = useState(initialNumber ?? '');
  const [status, setStatus] = useState(initialStatus ?? 'FREE');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false); // ✅ new state
  const [error, setError] = useState('');

  // โหลดข้อมูลห้องเมื่อ modal เปิด
  useEffect(() => {
    setError('');
    setSaving(false);
    if (!open) return;

    const maybeLoad = async () => {
      if (!roomId) return;
      setLoading(true);
      try {
        const r = await getRoomById(roomId);
        setNumber(r?.number ?? initialNumber ?? '');
        setStatus(r?.status ?? initialStatus ?? 'FREE');
      } catch (e) {
        setNumber(initialNumber ?? '');
        setStatus(initialStatus ?? 'FREE');
        setError(e?.message || 'โหลดข้อมูลห้องไม่สำเร็จ');
      } finally {
        setLoading(false);
      }
    };
    maybeLoad();
  }, [open, roomId, initialNumber, initialStatus]);

  const canSave = useMemo(() => {
    if (!number && number !== 0) return false;
    const n = Number(number);
    if (!Number.isInteger(n) || n <= 0) return false;
    if (!status) return false;
    return true;
  }, [number, status]);

  async function handleSave() {
    if (!canSave || !roomId) return;
    setSaving(true);
    setError('');
    try {
      await updateRoom(roomId, {
        number: Number(number),
        status: String(status).toUpperCase(),
      });
      onSaved?.();
      onClose?.();
    } catch (e) {
      setError(e?.message || 'บันทึกไม่สำเร็จ');
    } finally {
      setSaving(false);
    }
  }

  // ✅ Handle Delete
  async function handleDelete() {
    if (!roomId) return;
    if (!window.confirm('คุณแน่ใจหรือไม่ว่าต้องการลบห้องนี้?')) return;

    setDeleting(true);
    setError('');
    try {
      await deleteRoom(roomId);
      onSaved?.(); // reload list after delete
      onClose?.();
    } catch (e) {
      setError(e?.message || 'ลบห้องไม่สำเร็จ');
    } finally {
      setDeleting(false);
    }
  }

  return (
    <Dialog open={!!open} onClose={saving || deleting ? undefined : onClose} maxWidth="xs" fullWidth>
      <DialogTitle>แก้ไขข้อมูลห้อง</DialogTitle>
      <DialogContent dividers>
        <Stack spacing={2} sx={{ mt: 1 }}>
          {loading ? (
            <Stack direction="row" alignItems="center" spacing={2}>
              <CircularProgress size={22} />
              กำลังโหลดข้อมูลห้อง...
            </Stack>
          ) : (
            <>
              <TextField
                label="หมายเลขห้อง"
                type="number"
                value={number}
                onChange={(e) => setNumber(e.target.value)}
                inputProps={{ step: 1, min: 1 }}
                required
                fullWidth
              />
              <TextField
                select
                label="สถานะ"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                required
                fullWidth
              >
                {STATUS_OPTIONS.map(opt => (
                  <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>
                ))}
              </TextField>

              {error && <Alert severity="error">{error}</Alert>}
            </>
          )}
        </Stack>
      </DialogContent>
      <DialogActions>
        {/* ✅ New Delete button on the left */}
        <Button
          color="error"
          onClick={handleDelete}
          disabled={saving || deleting || loading}
        >
          ลบห้อง
        </Button>

        <Button onClick={onClose} disabled={saving || deleting}>ยกเลิก</Button>
        <Button
          variant="contained"
          onClick={handleSave}
          disabled={!canSave || saving || loading || deleting}
        >
          {saving ? 'กำลังบันทึก...' : 'บันทึก'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
