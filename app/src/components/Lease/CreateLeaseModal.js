// src/components/LeaseHistory/CreateLeaseModal.js
import React, { useState } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, Button, Grid, Alert, Box, CircularProgress,
  InputAdornment, IconButton, Typography, Paper, Stack
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import { createLease } from '../../api/lease';
import { getTenantById } from '../../api/tenant';

// ให้ startDate เป็นวันนี้โดยอัตโนมัติ
const today = new Date().toISOString().slice(0, 10);

const initial = {
  roomNumber: '',
  tenantId: '',
  startDate: today,
  monthlyRent: '',
  depositBaht: '',
};

const CreateLeaseModal = ({ open, onClose, onSuccess }) => {
  const [form, setForm] = useState(initial);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState('');

  // preview ผู้เช่า (อ่านอย่างเดียว)
  const [tenantLoading, setTenantLoading] = useState(false);
  const [tenantErr, setTenantErr] = useState('');
  const [tenantPreview, setTenantPreview] = useState(null);

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const resetAndClose = () => {
    setForm(initial);
    setErr('');
    setTenantErr('');
    setTenantLoading(false);
    setTenantPreview(null);
    onClose?.();
  };

  async function fetchTenant() {
    const id = Number((form.tenantId || '').trim());
    if (!id) {
      setTenantErr('กรอก Tenant ID ก่อน');
      setTenantPreview(null);
      return;
    }
    try {
      setTenantLoading(true);
      setTenantErr('');
      // Network: GET /api/tenants/{id}
      const t = await getTenantById(id);
      setTenantPreview(t || null);
      if (!t) setTenantErr('ไม่พบผู้เช่าตาม Tenant ID นี้');
    } catch (e) {
      setTenantErr('ไม่พบผู้เช่าตาม Tenant ID นี้');
      setTenantPreview(null);
    } finally {
      setTenantLoading(false);
    }
  }

  const submit = async () => {
    setErr('');

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
      // ไม่ส่ง custom fields อื่น ๆ ตามที่ตกลง
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
              onChange={(e) =>
                setForm(f => ({ ...f, roomNumber: e.target.value.replace(/\D/g, '') }))
              }
              fullWidth size="small"
              placeholder="เช่น 101"
              disabled={saving}
            />
          </Grid>

          <Grid item xs={12} sm={4}>
            <TextField
              label="Tenant ID *"
              value={form.tenantId}
              onChange={(e) =>
                setForm(f => ({ ...f, tenantId: e.target.value.replace(/\D/g, '') }))
              }
              onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); fetchTenant(); } }}
              onBlur={() => { if (!tenantPreview) fetchTenant(); }}
              fullWidth size="small"
              placeholder="เช่น 1"
              disabled={saving}
              helperText={
                tenantLoading
                  ? 'กำลังดึงข้อมูลผู้เช่า...'
                  : tenantErr
                  ? tenantErr
                  : tenantPreview
                  ? `พบผู้เช่า: ${tenantPreview.name || '-'}`
                  : 'กรอก Tenant ID แล้วกด Enter / คลิกไอคอนแว่น / หรือเลื่อนโฟกัสออกเพื่อเช็คผู้เช่า'
              }
              FormHelperTextProps={{ sx: { minHeight: 20 } }}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    {tenantLoading ? (
                      <CircularProgress size={18} />
                    ) : (
                      <IconButton onClick={fetchTenant} edge="end" aria-label="fetch-tenant">
                        <SearchIcon />
                      </IconButton>
                    )}
                  </InputAdornment>
                ),
              }}
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
              onChange={(e) =>
                setForm(f => ({ ...f, monthlyRent: e.target.value.replace(/[^\d.]/g, '') }))
              }
              fullWidth size="small"
              placeholder="7000"
              disabled={saving}
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              label="เงินมัดจำ (บาท)"
              value={form.depositBaht}
              onChange={(e) =>
                setForm(f => ({ ...f, depositBaht: e.target.value.replace(/[^\d.]/g, '') }))
              }
              fullWidth size="small"
              placeholder="7000"
              disabled={saving}
            />
          </Grid>

          {/* แสดง preview ผู้เช่า (อ่านอย่างเดียว) */}
          {tenantPreview && (
            <Grid item xs={12}>
              <Paper variant="outlined" sx={{ p: 2, bgcolor: '#fafafa' }}>
                <Typography variant="subtitle2" sx={{ mb: 1 }}>ข้อมูลผู้เช่า</Typography>
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={3}>
                  <Typography variant="body2">ชื่อ: <b>{tenantPreview.name || '-'}</b></Typography>
                  <Typography variant="body2">เบอร์: <b>{tenantPreview.phone || '-'}</b></Typography>
                  <Typography variant="body2">LINE: <b>{tenantPreview.lineId || '-'}</b></Typography>
                </Stack>
              </Paper>
            </Grid>
          )}
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
