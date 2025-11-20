// src/components/LeaseHistory/CreateLeaseModal.js
import React, { useState } from 'react';
import {
    Dialog, DialogTitle, DialogContent, DialogActions,
    TextField, Button, Grid, Alert, Box, CircularProgress,
    InputAdornment, IconButton, Typography, Paper, Stack, Divider
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import { createLease } from '../../api/lease';
import { getTenantById } from '../../api/tenant';

const today = new Date().toISOString().slice(0, 10);

const initial = {
    roomNumber: '',
    tenantId: '',
    startDate: today,
    endDate: '',
    monthlyRent: '',
    depositBaht: '',
    customIdCard: '',
    customAddress: '',
    customRules: '',
};

const CreateLeaseModal = ({ open, onClose, onSuccess, ...props }) => {
    const [form, setForm] = useState(initial);
    const [saving, setSaving] = useState(false);
    const [err, setErr] = useState('');

    // tenant preview
    const [tenantLoading, setTenantLoading] = useState(false);
    const [tenantErr, setTenantErr] = useState('');
    const [tenantPreview, setTenantPreview] = useState(null);

    const setField = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

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
            room: { number: Number(form.roomNumber) },
            tenant: { id: Number(form.tenantId) },
            startDate: form.startDate ? form.startDate : undefined,
            endDate:
                form.endDate && form.endDate.trim() !== ''
                    ? form.endDate
                    : null,
            monthlyRent: form.monthlyRent ? Number(form.monthlyRent) : undefined,
            depositBaht: form.depositBaht ? Number(form.depositBaht) : undefined,
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
        <Dialog open={open} onClose={saving ? undefined : resetAndClose} fullWidth maxWidth="md" {...props}>
            <DialogTitle data-cy="create-lease-modal-title">
                สร้างสัญญาเช่า
            </DialogTitle>

            <DialogContent dividers>
                {err && (
                    <Alert severity="error" sx={{ mb: 2 }} data-cy="create-lease-modal-error-alert">
                        {err}
                    </Alert>
                )}

                <Grid container spacing={2} sx={{ mt: 0 }}>
                    {/* --- Row 1: ข้อมูลหลัก (เลขห้อง + ผู้เช่า) --- */}
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
                            data-cy="create-lease-room-number-input"
                        />
                    </Grid>

                    <Grid item xs={12} sm={8}>
                        <TextField
                            label="Tenant ID *"
                            value={form.tenantId}
                            onChange={(e) =>
                                setForm(f => ({ ...f, tenantId: e.target.value.replace(/\D/g, '') }))
                            }
                            onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); fetchTenant(); } }}
                            onBlur={() => { if (!tenantPreview && form.tenantId) fetchTenant(); }}
                            fullWidth size="small"
                            placeholder="เช่น 1"
                            disabled={saving}
                            data-cy="create-lease-tenant-id-input"
                            InputProps={{
                                endAdornment: (
                                    <InputAdornment position="end">
                                        {tenantLoading ? (
                                            <CircularProgress size={18} data-cy="create-lease-fetch-tenant-spinner" />
                                        ) : (
                                            <IconButton
                                                onClick={fetchTenant}
                                                edge="end"
                                                aria-label="fetch-tenant"
                                                data-cy="create-lease-fetch-tenant-button"
                                            >
                                                <SearchIcon />
                                            </IconButton>
                                        )}
                                    </InputAdornment>
                                ),
                            }}
                            helperText={
                                tenantErr ? (
                                    <span style={{ color: '#d32f2f' }}>{tenantErr}</span>
                                ) : tenantLoading ? (
                                    'กำลังค้นหา...'
                                ) : (
                                    'พิมพ์ ID แล้วกด Enter หรือคลิกแว่นขยาย'
                                )
                            }
                        />
                    </Grid>

                    {/* Tenant Preview Section (แทรกตรงนี้เพื่อให้เห็นผลลัพธ์ทันที) */}
                    {tenantPreview && (
                        <Grid item xs={12}>
                            <Paper
                                variant="outlined"
                                sx={{ p: 2, bgcolor: '#f5f5f5', borderColor: '#e0e0e0', borderRadius: 2 }}
                                data-cy="create-lease-tenant-preview-container"
                            >
                                <Typography variant="subtitle2" color="primary" gutterBottom>
                                    ข้อมูลผู้เช่าที่พบ:
                                </Typography>
                                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={3} alignItems="center">
                                    <Typography variant="body2" data-cy="create-lease-tenant-preview-name">
                                        ชื่อ: <b>{tenantPreview.name || '-'}</b>
                                    </Typography>
                                    <Divider orientation="vertical" flexItem sx={{ display: { xs: 'none', sm: 'block' } }} />
                                    <Typography variant="body2" data-cy="create-lease-tenant-preview-phone">
                                        เบอร์: <b>{tenantPreview.phone || '-'}</b>
                                    </Typography>
                                    <Divider orientation="vertical" flexItem sx={{ display: { xs: 'none', sm: 'block' } }} />
                                    <Typography variant="body2" data-cy="create-lease-tenant-preview-line">
                                        LINE: <b>{tenantPreview.lineId || '-'}</b>
                                    </Typography>
                                </Stack>
                            </Paper>
                        </Grid>
                    )}

                    {/* --- Row 2: ระยะเวลาสัญญา --- */}
                    <Grid item xs={12} sm={6}>
                        <TextField
                            label="วันที่เริ่มสัญญา *"
                            type="date"
                            value={form.startDate}
                            onChange={(e) => setForm(f => ({ ...f, startDate: e.target.value }))}
                            fullWidth size="small"
                            InputLabelProps={{ shrink: true }}
                            disabled={saving}
                            data-cy="create-lease-start-date-input"
                        />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <TextField
                            label="วันที่สิ้นสุดสัญญา"
                            type="date"
                            value={form.endDate}
                            onChange={(e) => setForm(f => ({ ...f, endDate: e.target.value }))}
                            fullWidth size="small"
                            InputLabelProps={{ shrink: true }}
                            disabled={saving}
                            data-cy="create-lease-end-date-input"
                        />
                    </Grid>

                    {/* --- Row 3: ข้อมูลการเงิน --- */}
                    <Grid item xs={12} sm={6}>
                        <TextField
                            label="ค่าเช่าต่อเดือน (บาท)"
                            value={form.monthlyRent}
                            onChange={(e) =>
                                setForm(f => ({ ...f, monthlyRent: e.target.value.replace(/[^\d.]/g, '') }))
                            }
                            fullWidth size="small"
                            placeholder="เช่น 7000"
                            disabled={saving}
                            data-cy="create-lease-monthly-rent-input"
                        />
                    </Grid>
                    <Grid item xs={12} sm={6} sx={{ minWidth: 247 }}>
                        <TextField
                            label="เงินมัดจำ (บาท)"
                            value={form.depositBaht}
                            onChange={(e) =>
                                setForm(f => ({ ...f, depositBaht: e.target.value.replace(/[^\d.]/g, '') }))
                            }
                            fullWidth size="small"
                            placeholder="เช่น 14000"
                            disabled={saving}
                            data-cy="create-lease-deposit-input"
                        />
                    </Grid>

                    {/* --- Row 4-6: ข้อมูลเพิ่มเติม --- */}
                    <Grid item xs={12} sx={{ minWidth: 356 }}>
                        <TextField
                            label="เลขบัตรประชาชน (ระบุเฉพาะสัญญานี้)"
                            value={form.customIdCard}
                            onChange={setField('customIdCard')}
                            fullWidth size="small"
                            disabled={saving}
                            data-cy="create-lease-custom-id-card-input"
                        />
                    </Grid>


                </Grid>

                <Grid item xs={12} sm={6} sx={{ my: 2 }}>
                    <TextField
                        label="ที่อยู่อาศัยผู้เช่า"
                        value={form.customAddress}
                        onChange={setField('customAddress')}
                        fullWidth size="small"
                        multiline
                        rows={3}
                        disabled={saving}
                        data-cy="create-lease-custom-address-input"
                    />
                </Grid>

                <Grid item xs={12} sm={6}>
                    <TextField
                        label="กฏระเบียบเพิ่มเติม"
                        value={form.customRules}
                        onChange={setField('customRules')}
                        fullWidth size="small"
                        multiline
                        rows={3}
                        disabled={saving}
                        data-cy="create-lease-custom-rules-input"
                    />
                </Grid>

                <Box sx={{ mt: 2 }}>
                    <Typography variant="caption" color="textSecondary">
                        * จำเป็นต้องกรอก: เลขห้อง, Tenant ID และ วันที่เริ่มสัญญา
                    </Typography>
                </Box>
            </DialogContent>

            <DialogActions>
                <Button
                    onClick={resetAndClose}
                    disabled={saving}
                    color="inherit"
                    data-cy="create-lease-modal-cancel-button"
                >
                    ยกเลิก
                </Button>
                <Button
                    variant="contained"
                    onClick={submit}
                    disabled={saving}
                    data-cy="create-lease-modal-submit-button"
                >
                    {saving ? 'กำลังบันทึก...' : 'สร้างสัญญา'}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default CreateLeaseModal;