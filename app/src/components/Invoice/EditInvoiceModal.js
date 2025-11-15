import React, { useEffect, useState } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Grid,
    TextField,
    Button,
    Alert,
    CircularProgress,
    Typography,
    Divider,
} from '@mui/material';
import { getInvoiceById, updateInvoice, deleteInvoice } from '../../api/invoice';
import DocumentUploadComponent from '../Common/DocumentUploadComponent';

export default function EditInvoiceModal({ open, onClose, invoiceId, onSaved, ...props }) {
    const [invoice, setInvoice] = useState(null);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (!invoiceId || !open) return;
        setError('');
        setLoading(true);
        (async () => {
            try {
                const data = await getInvoiceById(invoiceId);
                setInvoice(data);
            } catch (e) {
                setError(e?.message || 'Failed to load invoice.');
            } finally {
                setLoading(false);
            }
        })();
    }, [invoiceId, open]);

    const handleChange = (field) => (e) => {
        setInvoice((prev) => ({ ...prev, [field]: e.target.value }));
    };

    const handleSave = async () => {
        if (!invoiceId || !invoice) return;
        setSaving(true);
        setError('');
        try {
            const payload = {
                billingYear: invoice.billingYear,
                billingMonth: invoice.billingMonth,
                issueDate: invoice.issueDate,
                dueDate: invoice.dueDate,
                electricityUnits: invoice.electricityUnits,
                electricityRate: invoice.electricityRate,
                waterUnits: invoice.waterUnits,
                waterRate: invoice.waterRate,
                otherBaht: invoice.otherBaht,
            };
            const res = await updateInvoice(invoiceId, payload);
            onSaved?.(res);
            onClose?.();
        } catch (e) {
            setError(e?.message || 'Update failed.');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async () => {
        if (!invoiceId) return;
        if (!window.confirm('คุณแน่ใจหรือไม่ว่าต้องการลบใบแจ้งหนี้นี้?')) return;
        setDeleting(true);
        setError('');
        try {
            await deleteInvoice(invoiceId);
            onSaved?.();
            onClose?.();
        } catch (e) {
            console.error(e);
            let msg = e?.message || 'Delete failed.';
            if (
                msg.includes('foreign key constraint fails') ||
                msg.includes('Cannot delete or update a parent row')
            ) {
                msg =
                    'ไม่สามารถลบใบแจ้งหนี้นี้ได้ เนื่องจากมีข้อมูลอื่นที่เกี่ยวข้อง เช่น รายการชำระเงินหรือการบำรุงรักษา';
            }
            setError(msg);
        } finally {
            setDeleting(false);
        }
    };

    if (!open) return null;

    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth {...props}>
            <DialogTitle data-cy="edit-invoice-modal-title">
                Edit Invoice #{invoiceId}
            </DialogTitle>
            <DialogContent dividers>
                {loading && (
                    <Typography
                        align="center"
                        sx={{ py: 2 }}
                        data-cy="edit-invoice-modal-loading-state"
                    >
                        <CircularProgress size={24} /> กำลังโหลดข้อมูล...
                    </Typography>
                )}
                {error && (
                    <Alert
                        severity="error"
                        sx={{ mb: 2 }}
                        data-cy="edit-invoice-modal-error-alert"
                    >
                        {error}
                    </Alert>
                )}
                {!loading && invoice && (
                    <Grid container spacing={2} data-cy="edit-invoice-modal-form-grid">
                        <Grid item xs={6}>
                            <TextField
                                label="Billing Year"
                                type="number"
                                fullWidth
                                value={invoice.billingYear || ''}
                                onChange={handleChange('billingYear')}
                                data-cy="edit-invoice-billingYear-input"
                            />
                        </Grid>
                        <Grid item xs={6}>
                            <TextField
                                label="Billing Month"
                                type="number"
                                fullWidth
                                value={invoice.billingMonth || ''}
                                onChange={handleChange('billingMonth')}
                                data-cy="edit-invoice-billingMonth-input"
                            />
                        </Grid>
                        <Grid item xs={6}>
                            <TextField
                                label="Issue Date"
                                type="date"
                                fullWidth
                                InputLabelProps={{ shrink: true }}
                                value={invoice.issueDate || ''}
                                onChange={handleChange('issueDate')}
                                data-cy="edit-invoice-issueDate-input"
                            />
                        </Grid>
                        <Grid item xs={6}>
                            <TextField
                                label="Due Date"
                                type="date"
                                fullWidth
                                InputLabelProps={{ shrink: true }}
                                value={invoice.dueDate || ''}
                                onChange={handleChange('dueDate')}
                                data-cy="edit-invoice-dueDate-input"
                            />
                        </Grid>
                        <Grid item xs={6}>
                            <TextField
                                label="Electricity Units"
                                type="number"
                                fullWidth
                                value={invoice.electricityUnits || ''}
                                onChange={handleChange('electricityUnits')}
                                data-cy="edit-invoice-electricityUnits-input"
                            />
                        </Grid>
                        <Grid item xs={6}>
                            <TextField
                                label="Electricity Rate"
                                type="number"
                                fullWidth
                                value={invoice.electricityRate || ''}
                                onChange={handleChange('electricityRate')}
                                data-cy="edit-invoice-electricityRate-input"
                            />
                        </Grid>
                        <Grid item xs={6}>
                            <TextField
                                label="Water Units"
                                type="number"
                                fullWidth
                                value={invoice.waterUnits || ''}
                                onChange={handleChange('waterUnits')}
                                data-cy="edit-invoice-waterUnits-input"
                            />
                        </Grid>
                        <Grid item xs={6}>
                            <TextField
                                label="Water Rate"
                                type="number"
                                fullWidth
                                value={invoice.waterRate || ''}
                                onChange={handleChange('waterRate')}
                                data-cy="edit-invoice-waterRate-input"
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                label="Other (Baht)"
                                type="number"
                                fullWidth
                                value={invoice.otherBaht || ''}
                                onChange={handleChange('otherBaht')}
                                data-cy="edit-invoice-otherBaht-input"
                            />
                        </Grid>

                        {/* Document Upload Section */}
                        <Grid item xs={12}>
                            <Divider sx={{ my: 2 }} />
                            <DocumentUploadComponent
                                entityType="INVOICE"
                                entityId={invoiceId}
                                readOnly={false}
                                data-cy="edit-invoice-document-upload"
                            />
                        </Grid>
                    </Grid>
                )}
            </DialogContent>

            <DialogActions>
                <Button
                    onClick={onClose}
                    disabled={saving || deleting}
                    data-cy="edit-invoice-modal-cancel-button"
                >
                    Cancel
                </Button>
                <Button
                    color="error"
                    onClick={handleDelete}
                    disabled={saving || deleting}
                    startIcon={deleting ? <CircularProgress size={18} color="inherit" data-cy="edit-invoice-modal-delete-spinner" /> : null}
                    data-cy="edit-invoice-modal-delete-button"
                >
                    Delete
                </Button>
                <Button
                    variant="contained"
                    onClick={handleSave}
                    disabled={saving || deleting}
                    startIcon={saving ? <CircularProgress size={18} color="inherit" data-cy="edit-invoice-modal-save-spinner" /> : null}
                    data-cy="edit-invoice-modal-save-button"
                >
                    Save Changes
                </Button>
            </DialogActions>
        </Dialog>
    );
}