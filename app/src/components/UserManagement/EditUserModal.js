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
    Divider,
    Typography,
    Autocomplete,
} from '@mui/material';
import { getUserById, updateUser, changePassword } from '../../api/user';
import { listRooms } from '../../api/room';

const EditUserModal = ({ open, userId, onClose, onUpdated, ...props }) => {
    const [formData, setFormData] = useState({
        username: '',
        role: 'STAFF',
        roomNumber: null,
    });
    const [rooms, setRooms] = useState([]);
    const [passwordData, setPasswordData] = useState({
        newPassword: '',
        confirmPassword: '',
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [loadingPassword, setLoadingPassword] = useState(false);
    const [loadingUser, setLoadingUser] = useState(true);
    const [loadingRooms, setLoadingRooms] = useState(false);
    const [showPasswordSection, setShowPasswordSection] = useState(false);

    useEffect(() => {
        if (open) {
            fetchRooms();
        }
    }, [open]);

    useEffect(() => {
        if (userId) {
            loadUser();
        }
    }, [userId]);

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

    const loadUser = async () => {
        setLoadingUser(true);
        setError('');
        try {
            const response = await getUserById(userId);
            const user = response?.data || response;
            setFormData({
                username: user.username || '',
                role: user.role || 'STAFF',
                roomNumbers: user.roomNumbers || '',
            });
        } catch (e) {
            setError(e?.response?.data?.error || e.message || 'Failed to load user');
        } finally {
            setLoadingUser(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
        setError('');
    };

    const handlePasswordChange = (e) => {
        const { name, value } = e.target;
        setPasswordData((prev) => ({ ...prev, [name]: value }));
        setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (!formData.username.trim()) {
            setError('Username is required');
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
                role: formData.role,
                roomNumbers: formData.role === 'USER' && formData.roomNumbers ? formData.roomNumbers.trim() : null,
            };

            await updateUser(userId, payload);
            onUpdated();
        } catch (e) {
            const errorMsg = e?.response?.data?.error || e.message || 'Failed to update user';
            setError(errorMsg);
        } finally {
            setLoading(false);
        }
    };

    const handlePasswordSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (passwordData.newPassword.length < 4) {
            setError('Password must be at least 4 characters');
            return;
        }
        if (passwordData.newPassword !== passwordData.confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        setLoadingPassword(true);
        try {
            await changePassword(userId, passwordData.newPassword);
            setPasswordData({ newPassword: '', confirmPassword: '' });
            setShowPasswordSection(false);
            alert('Password changed successfully');
        } catch (e) {
            const errorMsg = e?.response?.data?.error || e.message || 'Failed to change password';
            setError(errorMsg);
        } finally {
            setLoadingPassword(false);
        }
    };

    const handleClose = () => {
        if (!loading && !loadingPassword) {
            setFormData({ username: '', role: 'STAFF', roomNumber: null });
            setPasswordData({ newPassword: '', confirmPassword: '' });
            setError('');
            setShowPasswordSection(false);
            onClose();
        }
    };

    return (
        <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth {...props}>
            <DialogTitle data-cy="edit-user-modal-title">
                แก้ไขผู้ใช้
            </DialogTitle>

            {loadingUser ? (
                <DialogContent data-cy="edit-user-modal-loading-state">
                    <Typography>Loading...</Typography>
                </DialogContent>
            ) : (
                <>
                    <form onSubmit={handleSubmit}>
                        <DialogContent>
                            {error && (
                                <Alert
                                    severity="error"
                                    sx={{ mb: 2 }}
                                    data-cy="edit-user-modal-error-alert"
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
                                data-cy="edit-user-modal-username-input"
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
                                data-cy="edit-user-modal-role-select"
                            >
                                <MenuItem
                                    value="ADMIN"
                                    data-cy="edit-user-modal-role-option-admin"
                                >
                                    ADMIN - Full access + User Management
                                </MenuItem>
                                <MenuItem
                                    value="STAFF"
                                    data-cy="edit-user-modal-role-option-staff"
                                >
                                    STAFF - Dashboard + Maintenance only
                                </MenuItem>
                                <MenuItem
                                    value="USER"
                                    data-cy="edit-user-modal-role-option-user"
                                >
                                    USER - Own room view + Create maintenance
                                </MenuItem>
                            </TextField>

                            {formData.role === 'USER' && (
                                <Box sx={{ mt: 2 }}>
                                    <Alert
                                        severity="info"
                                        sx={{ mb: 2 }}
                                        data-cy="edit-user-modal-room-info-alert"
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
                                        data-cy="edit-user-modal-room-numbers-input"
                                    />
                                </Box>
                            )}

                            <Divider sx={{ my: 3 }} />

                            <Box sx={{ mb: 2 }}>
                                <Button
                                    variant="outlined"
                                    fullWidth
                                    onClick={() => setShowPasswordSection(!showPasswordSection)}
                                    data-cy="edit-user-modal-toggle-password-section-button"
                                >
                                    {showPasswordSection ? 'ซ่อนการเปลี่ยนรหัสผ่าน' : 'เปลี่ยนรหัสผ่าน'}
                                </Button>
                            </Box>

                            {showPasswordSection && (
                                <Box
                                    component="form"
                                    onSubmit={handlePasswordSubmit}
                                    sx={{ mt: 2 }}
                                    data-cy="edit-user-modal-password-section"
                                >
                                    <Typography variant="subtitle2" sx={{ mb: 1 }}>
                                        Change Password
                                    </Typography>
                                    <TextField
                                        fullWidth
                                        label="New Password"
                                        name="newPassword"
                                        type="password"
                                        value={passwordData.newPassword}
                                        onChange={handlePasswordChange}
                                        margin="normal"
                                        helperText="At least 4 characters"
                                        data-cy="edit-user-modal-new-password-input"
                                    />
                                    <TextField
                                        fullWidth
                                        label="Confirm New Password"
                                        name="confirmPassword"
                                        type="password"
                                        value={passwordData.confirmPassword}
                                        onChange={handlePasswordChange}
                                        margin="normal"
                                        data-cy="edit-user-modal-confirm-password-input"
                                    />
                                    <Button
                                        fullWidth
                                        variant="contained"
                                        color="secondary"
                                        onClick={handlePasswordSubmit}
                                        disabled={loadingPassword}
                                        sx={{ mt: 2 }}
                                        data-cy="edit-user-modal-password-submit-button"
                                    >
                                        {loadingPassword ? 'Changing...' : 'เปลี่ยนรหัสผ่าน'}
                                    </Button>
                                </Box>
                            )}
                        </DialogContent>

                        <DialogActions>
                            <Button
                                onClick={handleClose}
                                disabled={loading || loadingPassword}
                                data-cy="edit-user-modal-cancel-button"
                            >
                                ยกเลิก
                            </Button>
                            <Button
                                type="submit"
                                variant="contained"
                                disabled={loading || loadingPassword}
                                data-cy="edit-user-modal-save-button"
                            >
                                {loading ? 'Saving...' : 'บันทึก'}
                            </Button>
                        </DialogActions>
                    </form>
                </>
            )}
        </Dialog>
    );
};

export default EditUserModal;