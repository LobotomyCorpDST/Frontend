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

const EditUserModal = ({ open, userId, onClose, onUpdated }) => {
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
        roomNumber: user.roomNumber || null,
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
    if (formData.role === 'USER' && !formData.roomNumber) {
      setError('Room Number is required for USER role');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        username: formData.username.trim(),
        role: formData.role,
        roomNumber: formData.role === 'USER' && formData.roomNumber ? formData.roomNumber : null,
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
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>แก้ไขผู้ใช้</DialogTitle>

      {loadingUser ? (
        <DialogContent>
          <Typography>Loading...</Typography>
        </DialogContent>
      ) : (
        <>
          <form onSubmit={handleSubmit}>
            <DialogContent>
              {error && (
                <Alert severity="error" sx={{ mb: 2 }}>
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
              >
                <MenuItem value="ADMIN">ADMIN - Full access + User Management</MenuItem>
                <MenuItem value="STAFF">STAFF - Dashboard + Maintenance only</MenuItem>
                <MenuItem value="USER">USER - Own room view + Create maintenance</MenuItem>
              </TextField>

              {formData.role === 'USER' && (
                <Box sx={{ mt: 2 }}>
                  <Alert severity="info" sx={{ mb: 2 }}>
                    USER role requires a Room Number
                  </Alert>
                  <Autocomplete
                    fullWidth
                    options={rooms}
                    getOptionLabel={(option) => `ห้อง ${option.number} - ${option.status === 'OCCUPIED' ? 'มีผู้เช่า' : 'ว่าง'}`}
                    value={rooms.find((r) => r.number === formData.roomNumber) || null}
                    onChange={(event, newValue) => {
                      setFormData((prev) => ({ ...prev, roomNumber: newValue ? newValue.number : null }));
                      setError('');
                    }}
                    loading={loadingRooms}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="เลขห้อง (Room Number)"
                        required={formData.role === 'USER'}
                        helperText="เลือกเลขห้องที่ผู้ใช้จะดูแล"
                      />
                    )}
                    isOptionEqualToValue={(option, value) => option.number === value.number}
                  />
                </Box>
              )}

              <Divider sx={{ my: 3 }} />

              <Box sx={{ mb: 2 }}>
                <Button
                  variant="outlined"
                  fullWidth
                  onClick={() => setShowPasswordSection(!showPasswordSection)}
                >
                  {showPasswordSection ? 'ซ่อนการเปลี่ยนรหัสผ่าน' : 'เปลี่ยนรหัสผ่าน'}
                </Button>
              </Box>

              {showPasswordSection && (
                <Box component="form" onSubmit={handlePasswordSubmit} sx={{ mt: 2 }}>
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
                  />
                  <TextField
                    fullWidth
                    label="Confirm New Password"
                    name="confirmPassword"
                    type="password"
                    value={passwordData.confirmPassword}
                    onChange={handlePasswordChange}
                    margin="normal"
                  />
                  <Button
                    fullWidth
                    variant="contained"
                    color="secondary"
                    onClick={handlePasswordSubmit}
                    disabled={loadingPassword}
                    sx={{ mt: 2 }}
                  >
                    {loadingPassword ? 'Changing...' : 'เปลี่ยนรหัสผ่าน'}
                  </Button>
                </Box>
              )}
            </DialogContent>

            <DialogActions>
              <Button onClick={handleClose} disabled={loading || loadingPassword}>
                ยกเลิก
              </Button>
              <Button type="submit" variant="contained" disabled={loading || loadingPassword}>
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
