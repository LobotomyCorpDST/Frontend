import React, { useState, useEffect } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Button,
    MenuItem,
    Alert,
    Box,
    Autocomplete,
} from '@mui/material';
import { createUser } from '../../api/user';
import { listRooms } from '../../api/room';

const CreateUserModal = ({ open, onClose, onCreated, ...props }) => {
    const [formData, setFormData] = useState({
        username: '',
        password: '',
        confirmPassword: '',
        role: 'STAFF',
        roomNumbers: '',
    });
    const [rooms, setRooms] = useState([]);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [loadingRooms, setLoadingRooms] = useState(false);

    // Fetch rooms when modal opens
    useEffect(() => {
        if (open) {
            fetchRooms();
        }
    }, [open]);

    const fetchRooms = async () => {
        setLoadingRooms(true);
        try {
            const data = await listRooms();
            setRooms(data || []);
        } catch (err) {
            console.error('Failed to load rooms:', err);
        } finally {
            setLoadingRooms(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
        setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        // Validation
        if (!formData.username.trim()) {
            setError('Username is required');
            return;
        }
        if (formData.password.length < 4) {
            setError('Password must be at least 4 characters');
            return;
        }
        if (formData.password !== formData.confirmPassword) {
            setError('Passwords do not match');
            return;
        }
        if (formData.role === 'USER' && !formData.roomNumbers) {
            setError('Room Numbers are required for USER role');
            return;
        }

        setLoading(true);
        try {
            const payload = {
                username: formData.username.trim(),
                password: formData.password,
                role: formData.role,
                roomNumbers: formData.role === 'USER' && formData.roomNumbers ? formData.roomNumbers.trim() : null,
            };

            await createUser(payload);
            onCreated();
        } catch (e) {
            const errorMsg = e?.response?.data?.error || e.message || 'Failed to create user';
            setError(errorMsg);
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
        if (!loading) {
            setFormData({
                username: '',
                password: '',
                confirmPassword: '',
                role: 'STAFF',
                roomNumbers: '',
            });
            setError('');
            onClose();
        }
    };

    return (
        <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth {...props}>
            <DialogTitle data-cy="create-user-modal-title">
                สร้างผู้ใช้ใหม่
            </DialogTitle>
            <form onSubmit={handleSubmit}>
                <DialogContent>
                    {error && (
                        <Alert
                            severity="error"
                            sx={{ mb: 2 }}
                            data-cy="create-user-modal-error-alert"
                        >
                            {error}
                        </Alert>
                    )}

                    <TextField
                        fullWidth
                        label="Username"
                        name="username"
                        value={formData.username}
                        onChange={handleChange}
                        required
                        margin="normal"
                        autoFocus
                        data-cy="create-user-modal-username-input"
                    />

                    <TextField
                        fullWidth
                        label="Password"
                        name="password"
                        type="password"
                        value={formData.password}
                        onChange={handleChange}
                        required
                        margin="normal"
                        helperText="At least 4 characters"
                        data-cy="create-user-modal-password-input"
                    />

                    <TextField
                        fullWidth
                        label="Confirm Password"
                        name="confirmPassword"
                        type="password"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        required
                        margin="normal"
                        data-cy="create-user-modal-confirm-password-input"
                    />

                    <TextField
                        fullWidth
                        select
                        label="Role"
                        name="role"
                        value={formData.role}
                        onChange={handleChange}
                        required
                        margin="normal"
                        data-cy="create-user-modal-role-select"
                    >
                        <MenuItem
                            value="ADMIN"
                            data-cy="create-user-modal-role-option-admin"
                        >
                            ADMIN - Full access + User Management
                        </MenuItem>
                        <MenuItem
                            value="STAFF"
                            data-cy="create-user-modal-role-option-staff"
                        >
                            STAFF - Dashboard + Maintenance only
                        </MenuItem>
                        <MenuItem
                            value="USER"
                            data-cy="create-user-modal-role-option-user"
                        >
                            USER - Own room view + Create maintenance
                        </MenuItem>
                    </TextField>

                    {formData.role === 'USER' && (
                        <Box sx={{ mt: 2 }}>
                            <Alert
                                severity="info"
                                sx={{ mb: 2 }}
                                data-cy="create-user-modal-room-info-alert"
                            >
                                USER role requires Room Numbers (comma-separated for multiple rooms)
                            </Alert>
                            <TextField
                                fullWidth
                                label="เลขห้อง (Room Numbers)"
                                name="roomNumbers"
                                value={formData.roomNumbers || ''}
                                onChange={(e) => {
                                    setFormData((prev) => ({ ...prev, roomNumbers: e.target.value }));
                                    setError('');
                                }}
                                required={formData.role === 'USER'}
                                helperText="ใส่เลขห้องคั่นด้วยจุลภาค เช่น 201, 305, 412"
                                placeholder="201, 305, 412"
                                data-cy="create-user-modal-room-numbers-input"
                            />
                        </Box>
                    )}
                </DialogContent>

                <DialogActions>
                    <Button
                        onClick={handleClose}
                        disabled={loading}
                        data-cy="create-user-modal-cancel-button"
                    >
                        ยกเลิก
                    </Button>
                    <Button
                        type="submit"
                        variant="contained"
                        disabled={loading}
                        data-cy="create-user-modal-submit-button"
                    >
                        {loading ? 'Creating...' : 'สร้าง'}
                    </Button>
                </DialogActions>
            </form>
        </Dialog>
    );
};

export default CreateUserModal;