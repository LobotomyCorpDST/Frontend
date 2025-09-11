import React, { useState } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, Button, Grid, Alert, Box
} from '@mui/material';
import { createLease } from '../../api/lease';

const initial = {
  roomNumber: '',
  tenantId: '',
  startDate: '',
  monthlyRent: '',
  depositBaht: '',
  customName: '',
  customIdCard: '',
  customAddress: '',
  customRules: '',
};

const CreateLeaseModal = ({ open, onClose, onSuccess }) => {
  const [form, setForm] = useState(initial);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState('');

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const resetAndClose = () => {
    setForm(initial);
    setErr('');
    onClose?.();
  };

  const submit = async () => {
    setErr('');
    // validate ง่าย ๆ
    if (!form.roomNumber || !form.tenantId || !form.startDate) {
      setErr('กรอก เลขห้อง, Tenant ID และ วันที่เริ่มสัญญา ให้ครบ');
      return;
    }

    const payload = {
      room:   { number: Number(form.roomNumber) },
      tenant: { id: Number(form.tenantId) },
      startDate: form.startDate, // YYYY-MM-DD
      monthlyRent: form.monthlyRent ? Number(form.monthlyRent) : undefined,
      depositBaht: form.depositBaht ? Number(form.depositBaht) : undefined,
      customName: form.customName || undefined,
      customIdCard: form.customIdCard || undefined,
      customAddress: form.customAddress || undefined,
      customRules: form.customRules || undefined,
    };

    try {
      setSaving(true);
      const lease = await createLease(payload);
      onSuccess?.(lease);
      resetAndClose();
    } catch (e) {
      setErr(e?.message || 'สร้างสัญญาเช่าไม่สำเร็จ');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onClose={saving ? undefined : resetAndClose} fullWidth maxWidth="md">
      <DialogTitle>สร้างสัญญาเช่า</DialogTitle>
      <DialogContent dividers>
        {err && <Alert severity="error" sx={{ mb: 2 }}>{err}</Alert>}

        <Grid container spacing={2}>
          <Grid item xs={12} sm={4}>
            <TextField
              label="เลขห้อง *"
              value={form.roomNumber}
              onChange={(e) => setForm(f => ({ ...f, roomNumber: e.target.value.replace(/\D/g, '') }))}
              fullWidth size="small"
              placeholder="เช่น 101"
              disabled={saving}
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <TextField
              label="Tenant ID *"
              value={form.tenantId}
              onChange={(e) => setForm(f => ({ ...f, tenantId: e.target.value.replace(/\D/g, '') }))}
              fullWidth size="small"
              placeholder="เช่น 1"
              disabled={saving}
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <TextField
              label="วันที่เริ่มสัญญา *"
              type="date"
              value={form.startDate}
              onChange={set('startDate')}
              fullWidth size="small"
              InputLabelProps={{ shrink: true }}
              disabled={saving}
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              label="ค่าเช่าต่อเดือน (บาท)"
              value={form.monthlyRent}
              onChange={(e) => setForm(f => ({ ...f, monthlyRent: e.target.value.replace(/[^\d.]/g, '') }))}
              fullWidth size="small"
              placeholder="7000"
              disabled={saving}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              label="เงินมัดจำ (บาท)"
              value={form.depositBaht}
              onChange={(e) => setForm(f => ({ ...f, depositBaht: e.target.value.replace(/[^\d.]/g, '') }))}
              fullWidth size="small"
              placeholder="7000"
              disabled={saving}
            />
          </Grid>

          {/* custom fields สำหรับแบบฟอร์มสัญญา */}
          <Grid item xs={12} sm={6}>
            <TextField
              label="ชื่อ (แสดงบนสัญญา)"
              value={form.customName}
              onChange={set('customName')}
              fullWidth size="small"
              placeholder="ชื่อผู้เช่า (กำหนดเอง)"
              disabled={saving}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              label="บัตรประชาชน"
              value={form.customIdCard}
              onChange={set('customIdCard')}
              fullWidth size="small"
              placeholder="1-2345-67890-12-3"
              disabled={saving}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              label="ที่อยู่"
              value={form.customAddress}
              onChange={set('customAddress')}
              fullWidth size="small"
              placeholder="ที่อยู่ผู้เช่า (ในสัญญา)"
              disabled={saving}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              label="กฎ/เงื่อนไขในสัญญา"
              value={form.customRules}
              onChange={set('customRules')}
              fullWidth size="small"
              placeholder="เช่น ชำระก่อนวันที่ 5 ของเดือน; ห้ามสูบบุหรี่ในห้อง"
              multiline minRows={2}
              disabled={saving}
            />
          </Grid>
        </Grid>

        <Box sx={{ mt: 1 }}>
          <small style={{ color: '#666' }}>
            * ต้องกรอก เลขห้อง, Tenant ID และ วันที่เริ่มสัญญา
          </small>
        </Box>
      </DialogContent>

      <DialogActions>
        <Button onClick={resetAndClose} disabled={saving}>ยกเลิก</Button>
        <Button variant="contained" onClick={submit} disabled={saving}>
          {saving ? 'กำลังบันทึก…' : 'สร้างสัญญา'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CreateLeaseModal;
