import React, { useState } from 'react';
import {
    Dialog, DialogTitle, DialogContent, DialogActions,
    TextField, Button, Alert, Box
} from '@mui/material';
import { createTenant } from '../../api/tenant';

const CreateTenantModal = ({ open, onClose, onCreated, ...props }) => {
    const [tenant, setTenant] = useState({
        name: '',
        idCardNumber: '',
        phone: '',
        lineId: '',
        email: '',
    });
    const [saving, setSaving] = useState(false);
    const [err, setErr] = useState('');

    const reset = () => {
        setTenant({ name: '', idCardNumber: '', phone: '', lineId: '', email: '' });
        setErr('');
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setTenant((prev) => ({ ...prev, [name]: value }));
    };

    const onSubmit = async () => {
        if (!tenant.name.trim() || !tenant.phone.trim()) {
            setErr('Please fill in at least Name and Phone Number.');
            return;
        }

        setSaving(true);
        setErr('');
        try {
            await createTenant(tenant);
            reset();
            onCreated?.(); // reload list
            onClose?.();
        } catch (e) {
            setErr(e?.message || 'Failed to create tenant.');
        } finally {
            setSaving(false);
        }
    };

    return (
        <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm" {...props}>
            <DialogTitle data-cy="create-tenant-modal-title">
                Create New Tenant
            </DialogTitle>
            <DialogContent dividers>
                {err && (
                    <Alert
                        severity="error"
                        sx={{ mb: 2 }}
                        data-cy="create-tenant-modal-error-alert"
                    >
                        {err}
                    </Alert>
                )}
                <Box component="form" sx={{ display: 'grid', gap: 2, mt: 1 }}>
                    <TextField
                        label="Full Name *"
                        name="name"
                        value={tenant.name}
                        onChange={handleChange}
                        autoFocus
                        data-cy="create-tenant-modal-name-input"
                    />
                    <TextField
                        label="ID Card Number"
                        name="idCardNumber"
                        value={tenant.idCardNumber}
                        onChange={handleChange}
                        data-cy="create-tenant-modal-id-card-input"
                    />
                    <TextField
                        label="Phone Number *"
                        name="phone"
                        value={tenant.phone}
                        onChange={handleChange}
                        data-cy="create-tenant-modal-phone-input"
                    />
                    <TextField
                        label="LINE ID"
                        name="lineId"
                        value={tenant.lineId}
                        onChange={handleChange}
                        data-cy="create-tenant-modal-line-id-input"
                    />
                    <TextField
                        label="Email Address"
                        name="email"
                        type="email"
                        value={tenant.email}
                        onChange={handleChange}
                        data-cy="create-tenant-modal-email-input"
                    />
                </Box>
            </DialogContent>
            <DialogActions>
                <Button
                    onClick={onClose}
                    data-cy="create-tenant-modal-cancel-button"
                >
                    Cancel
                </Button>
                <Button
                    variant="contained"
                    onClick={onSubmit}
                    disabled={saving}
                    data-cy="create-tenant-modal-submit-button"
                >
                    {saving ? 'Saving...' : 'Create Tenant'}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default CreateTenantModal;