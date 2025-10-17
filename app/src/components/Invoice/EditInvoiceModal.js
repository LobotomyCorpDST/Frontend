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
} from '@mui/material';
import { getInvoiceById, updateInvoice, deleteInvoice } from '../../api/invoice';

export default function EditInvoiceModal({ open, onClose, invoiceId, onSaved }) {
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
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Edit Invoice #{invoiceId}</DialogTitle>
      <DialogContent dividers>
        {loading && (
          <Typography align="center" sx={{ py: 2 }}>
            <CircularProgress size={24} /> กำลังโหลดข้อมูล...
          </Typography>
        )}
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        {!loading && invoice && (
          <Grid container spacing={2}>
            <Grid item xs={6}>
              <TextField
                label="Billing Year"
                type="number"
                fullWidth
                value={invoice.billingYear || ''}
                onChange={handleChange('billingYear')}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                label="Billing Month"
                type="number"
                fullWidth
                value={invoice.billingMonth || ''}
                onChange={handleChange('billingMonth')}
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
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                label="Electricity Units"
                type="number"
                fullWidth
                value={invoice.electricityUnits || ''}
                onChange={handleChange('electricityUnits')}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                label="Electricity Rate"
                type="number"
                fullWidth
                value={invoice.electricityRate || ''}
                onChange={handleChange('electricityRate')}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                label="Water Units"
                type="number"
                fullWidth
                value={invoice.waterUnits || ''}
                onChange={handleChange('waterUnits')}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                label="Water Rate"
                type="number"
                fullWidth
                value={invoice.waterRate || ''}
                onChange={handleChange('waterRate')}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Other (Baht)"
                type="number"
                fullWidth
                value={invoice.otherBaht || ''}
                onChange={handleChange('otherBaht')}
              />
            </Grid>
          </Grid>
        )}
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose} disabled={saving || deleting}>
          Cancel
        </Button>
        <Button
          color="error"
          onClick={handleDelete}
          disabled={saving || deleting}
          startIcon={deleting ? <CircularProgress size={18} color="inherit" /> : null}
        >
          Delete
        </Button>
        <Button
          variant="contained"
          onClick={handleSave}
          disabled={saving || deleting}
          startIcon={saving ? <CircularProgress size={18} color="inherit" /> : null}
        >
          Save Changes
        </Button>
      </DialogActions>
    </Dialog>
  );
}
