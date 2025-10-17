import React, { useEffect, useState } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, Button, Alert, CircularProgress, Stack
} from '@mui/material';
import { getTenantById, updateTenant, deleteTenant } from '../../api/tenant';

const EditTenantModal = ({ open, onClose, tenantId, onUpdated }) => {
  const [tenant, setTenant] = useState({
    name: '',
    idCardNumber: '',
    phone: '',
    lineId: '',
    email: '',
  });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [err, setErr] = useState('');

  // ✅ Load tenant data when modal opens
  useEffect(() => {
    if (!open || !tenantId) return;
    setErr('');
    setLoading(true);

    getTenantById(tenantId)
      .then((res) => {
        setTenant({
          name: res.name || '',
          phone: res.phone || '',
          lineId: res.lineId || '', // frontend-only fallback
          idCardNumber: res.idCardNumber || '', // frontend-only fallback
          email: res.email || '',
        });
      })
      .catch((e) => setErr(e?.message || 'Failed to load tenant'))
      .finally(() => setLoading(false));
  }, [open, tenantId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setTenant((prev) => ({ ...prev, [name]: value }));
  };

  // ✅ Save changes
  const handleSave = async () => {
    if (!tenant.name.trim() || !tenant.phone.trim()) {
      setErr('Please fill in at least Name and Phone Number.');
      return;
    }

    setSaving(true);
    setErr('');
    try {
      await updateTenant(tenantId, {
        name: tenant.name,
        phone: tenant.phone,
        lineId: tenant.lineId,
        idCardNumber: tenant.idCardNumber,
        email: tenant.email,
      });
      onUpdated?.();
      onClose?.();
    } catch (e) {
      setErr(e?.message || 'Failed to save tenant.');
    } finally {
      setSaving(false);
    }
  };

  // ✅ Delete tenant
  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this tenant?')) return;
    setDeleting(true);
    setErr('');
    try {
      await deleteTenant(tenantId);
      onUpdated?.();
      onClose?.();
    } catch (e) {
      let msg = e?.message || 'Failed to delete tenant.';
      if (
        msg.includes('foreign key constraint fails') ||
        msg.includes('Cannot delete or update a parent row')
      ) {
        msg = 'Cannot delete tenant: this tenant is linked to a lease or invoice.';
      }
      setErr(msg);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <Dialog open={open} onClose={saving || deleting ? undefined : onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Edit Tenant</DialogTitle>
      <DialogContent dividers>
        {loading ? (
          <Stack direction="row" spacing={2} alignItems="center">
            <CircularProgress size={22} /> <span>Loading tenant...</span>
          </Stack>
        ) : (
          <>
            {err && <Alert severity="error" sx={{ mb: 2 }}>{err}</Alert>}
            <Stack spacing={2}>
              <TextField label="Full Name *" name="name" value={tenant.name} onChange={handleChange} />
              <TextField label="Phone Number *" name="phone" value={tenant.phone} onChange={handleChange} />
              <TextField label="LINE ID" name="lineId" value={tenant.lineId} onChange={handleChange} />
              <TextField label="ID Card Number" name="idCardNumber" value={tenant.idCardNumber} onChange={handleChange} />
              <TextField label="Email Address" name="email" type="email" value={tenant.email} onChange={handleChange} />
            </Stack>
          </>
        )}
      </DialogContent>
      <DialogActions>
        <Button color="error" onClick={handleDelete} disabled={saving || deleting || loading}>
          Delete
        </Button>
        <Button onClick={onClose} disabled={saving || deleting}>Cancel</Button>
        <Button variant="contained" onClick={handleSave} disabled={saving || deleting || loading}>
          {saving ? 'Saving...' : 'Save Changes'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default EditTenantModal;
