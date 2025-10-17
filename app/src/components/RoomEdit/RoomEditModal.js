// src/components/RoomEdit/RoomEditModal.js
import React, { useEffect, useMemo, useState } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, Button, Stack, MenuItem, Alert, CircularProgress
} from '@mui/material';
import { getRoomById, updateRoom } from '../../api/room';

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

  const [loading, setLoading] = useState(false);     // โหลดข้อมูลห้อง (กรณีดึงจาก id)
  const [saving, setSaving] = useState(false);       // เซฟอยู่
  const [error, setError] = useState('');

  // ถ้าเปิด modal ใหม่ ให้ reset state ตาม props
  useEffect(() => {
    setError('');
    setSaving(false);
    if (!open) return;

    // ถ้ามี roomId และอยาก sync กับ backend ล่าสุด ก็โหลดอีกชั้น
    // (ถ้าอยากใช้ props ตาม RoomDetail อย่างเดียว ก็สามารถคอมเมนต์บล็อคนี้ได้)
    const maybeLoad = async () => {
      if (!roomId) return;
      setLoading(true);
      try {
        const r = await getRoomById(roomId);
        setNumber(r?.number ?? initialNumber ?? '');
        setStatus(r?.status ?? initialStatus ?? 'FREE');
      } catch (e) {
        // ถ้าดึงไม่ได้ ใช้ค่า initial แทน
        setNumber(initialNumber ?? '');
        setStatus(initialStatus ?? 'FREE');
        setError(e?.message || 'โหลดข้อมูลห้องไม่สำเร็จ');
      } finally {
        setLoading(false);
      }
    };
    maybeLoad();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, roomId]);

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
      // NOTE: backend รองรับ PUT /api/rooms/{id}
      await updateRoom(roomId, {
        number: Number(number),
        status: String(status).toUpperCase(),
      });
      onSaved?.();       // ให้ RoomDetail reload
      onClose?.();
    } catch (e) {
      // จัดการเคสเลขห้องซ้ำ (409) หรือ error อื่น ๆ
      setError(e?.message || 'บันทึกไม่สำเร็จ');
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog open={!!open} onClose={saving ? undefined : onClose} maxWidth="xs" fullWidth>
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
        <Button onClick={onClose} disabled={saving}>ยกเลิก</Button>
        <Button variant="contained" onClick={handleSave} disabled={!canSave || saving || loading}>
          บันทึก
        </Button>
      </DialogActions>
    </Dialog>
  );
}
