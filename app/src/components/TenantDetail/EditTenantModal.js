import React, { useState, useEffect } from 'react';
import {
    Dialog, DialogTitle, DialogContent, DialogActions,
    TextField, Button, Alert, Box
} from '@mui/material';
import { updateTenant } from '../../api/tenant';

const EditTenantModal = ({ open, onClose, onUpdated, tenant }) => {
    const [formData, setFormData] = useState({ name: '', idCardNumber: '', phone: '', email: '' });
    const [saving, setSaving] = useState(false);
    const [err, setErr] = useState('');

    useEffect(() => {
        // Pre-fill form when tenant data is available
        if (tenant) {
            setFormData({
                name: tenant.name || '',
                idCardNumber: tenant.idCardNumber || '',
                phone: tenant.phone || '',
                email: tenant.email || '',
            });
        }
    }, [tenant]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const onSubmit = async () => {
        if (!formData.name || !formData.phone) {
            setErr('Please fill in at least Name and Phone Number.');
            return;
        }
        setSaving(true);
        setErr('');
        try {
            await updateTenant(tenant.id, formData);
            onUpdated?.(); // This function reloads the details
            onClose?.();
        } catch (e) {
            setErr(e?.message || 'Failed to update tenant.');
        } finally {
            setSaving(false);
        }
    };

    return (
        <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
            <DialogTitle>Edit Tenant Details</DialogTitle>
            <DialogContent dividers>
                {err && <Alert severity="error" sx={{ mb: 2 }}>{err}</Alert>}
                <Box component="form" sx={{ display: 'grid', gap: 2, mt: 1 }}>
                    <TextField
                        label="Full Name *"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        autoFocus
                    />
                    <TextField
                        label="ID Card Number"
                        name="idCardNumber"
                        value={formData.idCardNumber}
                        onChange={handleChange}
                    />
                    <TextField
                        label="Phone Number *"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                    />
                    <TextField
                        label="Email Address"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleChange}
                    />
                </Box>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>Cancel</Button>
                <Button variant="contained" onClick={onSubmit} disabled={saving}>
                    {saving ? 'Saving...' : 'Save Changes'}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default EditTenantModal;