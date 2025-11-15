import React, { useState } from 'react';
import {
    Dialog, DialogTitle, DialogContent, DialogActions,
    TextField, Button, Alert, Box, MenuItem
} from '@mui/material';
import { createRoom } from '../../api/room';

const DEFAULT_STATUS = 'FREE';
const STATUS_OPTIONS = ['FREE', 'OCCUPIED'];

const CreateRoomModal = ({ open, onClose, onCreated, ...props }) => {
    const [number, setNumber] = useState('');
    const [status, setStatus] = useState(DEFAULT_STATUS);
    const [saving, setSaving] = useState(false);
    const [err, setErr] = useState('');

    const reset = () => {
        setNumber('');
        setStatus(DEFAULT_STATUS);
        setErr('');
    };

    const onSubmit = async () => {
        if (!number) {
            setErr('กรอกเลขห้อง');
            return;
        }
        setSaving(true);
        setErr('');
        try {
            await createRoom({ number: Number(number), status });
            reset();
            onCreated?.();
            onClose?.();
        } catch (e){
        setErr(e?.message || 'Create room failed');
    } finally {
        setSaving(false);
    }
};

return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm" {...props}>
        <DialogTitle data-cy="create-room-modal-title">
            เพิ่มห้อง
        </DialogTitle>
        <DialogContent dividers>
            {err && (
                <Alert
                    severity="error"
                    sx={{ mb: 2 }}
                    data-cy="create-room-modal-error-alert"
                >
                    {err}
                </Alert>
            )}
            <Box sx={{ display: 'grid', gap: 2 }}>
                <TextField
                    label="เลขห้อง *"
                    value={number}
                    onChange={(e) => setNumber(e.target.value.replace(/\D/g, ''))}
                    placeholder="เช่น 101"
                    autoFocus
                    data-cy="create-room-modal-number-input"
                />
                <TextField
                    select
                    label="สถานะ"
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    data-cy="create-room-modal-status-select"
                >
                    {STATUS_OPTIONS.map(op => (
                        <MenuItem
                            key={op}
                            value={op}
                            data-cy={`create-room-modal-status-option-${op.toLowerCase()}`}
                        >
                            {op}
                        </MenuItem>
                    ))}
                </TextField>
            </Box>
        </DialogContent>
        <DialogActions>
            <Button
                onClick={onClose}
                data-cy="create-room-modal-cancel-button"
            >
                ยกเลิก
            </Button>
            <Button
                variant="contained"
                onClick={onSubmit}
                disabled={saving}
                data-cy="create-room-modal-submit-button"
            >
                {saving ? 'กำลังบันทึก...' : 'สร้างห้อง'}
            </Button>
        </DialogActions>
    </Dialog>
    );
};

export default CreateRoomModal;