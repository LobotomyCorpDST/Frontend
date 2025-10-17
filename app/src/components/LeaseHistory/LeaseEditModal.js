// src/components/LeaseHistory/LeaseEditModal.js
import React, { useEffect, useState } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, Button, Grid, Alert, Box, CircularProgress,
  InputAdornment, IconButton, Typography, Paper, Stack
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import { getLeaseById, updateLease, deleteLease } from '../../api/lease';
import { getTenantById } from '../../api/tenant';

// default date helper
const today = new Date().toISOString().slice(0, 10);

const LeaseEditModal = ({ open, onClose, leaseId, onSaved }) => {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [err, setErr] = useState('');

  const [form, setForm] = useState({
    id: null,
    roomNumber: '',
    roomId: null,
    tenantId: '',
    startDate: today,
    endDate: '',
    monthlyRent: '',
    depositBaht: '',
    customName: '',
    customIdCard: '',
    customAddress: '',
    customRules: '',
    settled: false,
    settledDate: null,
  });

  // tenant preview similar to CreateLeaseModal
  const [tenantLoading, setTenantLoading] = useState(false);
  const [tenantErr, setTenantErr] = useState('');
  const [tenantPreview, setTenantPreview] = useState(null);

  useEffect(() => {
    setErr('');
    setTenantErr('');
    setTenantPreview(null);
    setSaving(false);
    setDeleting(false);
    if (!open) return;

    if (!leaseId) {
      setErr('Missing lease id');
      return;
    }

    const load = async () => {
      setLoading(true);
      try {
        const l = await getLeaseById(leaseId);
        // Map lease view to form fields
        setForm({
          id: l.id,
          roomNumber: l.room?.number ?? '',
          roomId: l.room?.id ?? null,
          tenantId: l.tenant?.id ?? '',
          startDate: l.startDate ?? today,
          endDate: l.endDate ?? '',
          monthlyRent: l.monthlyRent ?? '',
          depositBaht: l.depositBaht ?? '',
          customName: l.customName ?? '',
          customIdCard: l.customIdCard ?? '',
          customAddress: l.customAddress ?? '',
          customRules: l.customRules ?? '',
          settled: !!l.settled,
          settledDate: l.settledDate ?? null,
        });
        if (l.tenant?.id) {
          // warm preview
          try {
            setTenantLoading(true);
            const t = await getTenantById(l.tenant.id);
            setTenantPreview(t || null);
          } catch (e) {
            setTenantPreview(null);
          } finally {
            setTenantLoading(false);
          }
        }
      } catch (e) {
        setErr(e?.message || 'โหลดสัญญาไม่สำเร็จ');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [open, leaseId]);

  const setField = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }));

  async function fetchTenant() {
    const id = Number((form.tenantId || '').toString().trim());
    if (!id) {
      setTenantErr('กรอก Tenant ID ก่อน');
      setTenantPreview(null);
      return;
    }
    try {
      setTenantLoading(true);
      setTenantErr('');
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

  const handleSave = async () => {
    setErr('');
    if (!form.tenantId || (!form.roomId && !form.roomNumber) || !form.startDate) {
      setErr('กรุณากรอก Tenant ID, Room (ID or number) และวันที่เริ่ม ให้ครบ');
      return;
    }

    const payload = {
      // room: allow number or id
      room: form.roomId ? { id: form.roomId, number: form.roomNumber ? Number(form.roomNumber) : null } : { number: form.roomNumber ? Number(form.roomNumber) : null },
      tenant: { id: Number(form.tenantId) },
      startDate: form.startDate || undefined,
      endDate: form.endDate || undefined,
      monthlyRent: form.monthlyRent ? Number(form.monthlyRent) : undefined,
      depositBaht: form.depositBaht ? Number(form.depositBaht) : undefined,
      customName: form.customName || undefined,
      customIdCard: form.customIdCard || undefined,
      customAddress: form.customAddress || undefined,
      customRules: form.customRules || undefined,
      settled: form.settled,
      settledDate: form.settledDate || undefined,
    };

    try {
      setSaving(true);
      await updateLease(form.id, payload);
      onSaved?.();
      onClose?.();
    } catch (e) {
      setErr(e?.message || 'บันทึกไม่สำเร็จ');
    } finally {
      setSaving(false);
    }
  };

  async function handleDelete() {
    if (!form.id) return;
    if (!window.confirm('คุณแน่ใจหรือไม่ว่าต้องการลบสัญญาเช่านี้?')) return;

    try {
      setDeleting(true);
      setErr('');
      await deleteLease(form.id);
      onSaved?.();
      onClose?.();
    } catch (e) {
      setErr(e?.message || 'ลบสัญญาไม่สำเร็จ');
    } finally {
      setDeleting(false);
    }
  }

  return (
    <Dialog open={!!open} onClose={saving || deleting ? undefined : onClose} fullWidth maxWidth="md">
      <DialogTitle>แก้ไขสัญญาเช่า</DialogTitle>
      <DialogContent dividers>
        {err && <Alert severity="error" sx={{ mb: 2 }}>{err}</Alert>}

        <Box sx={{ mt: 1 }}>
          {loading ? (
            <Stack direction="row" spacing={2} alignItems="center">
              <CircularProgress size={22} /> กำลังโหลดสัญญา...
            </Stack>
          ) : (
            <Grid container spacing={2}>
              <Grid item xs={12} sm={4}>
                <TextField
                  label="เลขห้อง"
                  value={form.roomNumber}
                  onChange={(e) => setForm(f => ({ ...f, roomNumber: e.target.value.replace(/\D/g, '') }))}
                  fullWidth size="small"
                  placeholder="เช่น 101"
                  disabled={saving || deleting}
                />
              </Grid>



              <Grid item xs={12} sm={4}>
                <TextField
                  label="Tenant ID *"
                  value={form.tenantId}
                  onChange={(e) => setForm(f => ({ ...f, tenantId: e.target.value.replace(/\D/g, '') }))}
                  onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); fetchTenant(); } }}
                  onBlur={() => { if (!tenantPreview) fetchTenant(); }}
                  helperText={tenantLoading ? 'กำลังดึงข้อมูลผู้เช่า...' : tenantErr ? tenantErr : tenantPreview ? `พบผู้เช่า: ${tenantPreview.name || '-'}` : 'กรอก Tenant ID แล้วกด Enter / คลิกไอคอนแว่น / หรือละโฟกัสออก'}
                  FormHelperTextProps={{ sx: { minHeight: 20 } }}
                  fullWidth size="small"
                  disabled={saving || deleting}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        {tenantLoading ? <CircularProgress size={18} /> :
                          <IconButton onClick={fetchTenant} edge="end" aria-label="fetch-tenant"><SearchIcon /></IconButton>}
                      </InputAdornment>
                    )
                  }}
                />
              </Grid>

              <Grid item xs={12} sm={4}>
                <TextField
                  label="วันที่เริ่มสัญญา *"
                  type="date"
                  value={form.startDate}
                  onChange={(e) => setForm(f => ({ ...f, startDate: e.target.value }))}
                  fullWidth size="small"
                  InputLabelProps={{ shrink: true }}
                  disabled={saving || deleting}
                />
              </Grid>

              <Grid item xs={12} sm={4}>
                <TextField
                  label="วันที่สิ้นสุดสัญญา"
                  type="date"
                  value={form.endDate}
                  onChange={(e) => setForm(f => ({ ...f, endDate: e.target.value }))}
                  fullWidth size="small"
                  InputLabelProps={{ shrink: true }}
                  disabled={saving || deleting}
                />
              </Grid>

              <Grid item xs={12} sm={4}>
                <TextField
                  label="ค่าเช่าต่อเดือน (บาท)"
                  value={form.monthlyRent}
                  onChange={(e) => setForm(f => ({ ...f, monthlyRent: e.target.value.replace(/[^\d.]/g, '') }))}
                  fullWidth size="small"
                  placeholder="7000"
                  disabled={saving || deleting}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  label="เงินมัดจำ (บาท)"
                  value={form.depositBaht}
                  onChange={(e) => setForm(f => ({ ...f, depositBaht: e.target.value.replace(/[^\d.]/g, '') }))}
                  fullWidth size="small"
                  placeholder="7000"
                  disabled={saving || deleting}
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  label="Custom Rules"
                  value={form.customRules}
                  onChange={setField('customRules')}
                  fullWidth size="small"
                  multiline
                  rows={3}
                  disabled={saving || deleting}
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  label="Address"
                  value={form.customAddress}
                  onChange={setField('customAddress')}
                  fullWidth size="small"
                  multiline
                  rows={3}
                  disabled={saving || deleting}
                />
              </Grid>

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
          )}
        </Box>
      </DialogContent>

      <DialogActions>
        <Button color="error" onClick={handleDelete} disabled={saving || deleting || loading}>
          ลบสัญญา
        </Button>

        <Button onClick={onClose} disabled={saving || deleting}>ยกเลิก</Button>
        <Button variant="contained" onClick={handleSave} disabled={saving || loading || deleting}>
          {saving ? 'กำลังบันทึก...' : 'บันทึก'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default LeaseEditModal;