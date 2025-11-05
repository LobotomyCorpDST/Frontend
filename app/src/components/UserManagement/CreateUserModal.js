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

const CreateUserModal = ({ open, onClose, onCreated }) => {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    confirmPassword: '',
    role: 'STAFF',
    roomNumber: null,
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
    if (formData.role === 'USER' && !formData.roomNumber) {
      setError('Room Number is required for USER role');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        username: formData.username.trim(),
        password: formData.password,
        role: formData.role,
        roomNumber: formData.role === 'USER' && formData.roomNumber ? formData.roomNumber : null,
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
        roomNumber: null,
      });
      setError('');
      onClose();
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>สร้างผู้ใช้ใหม่</DialogTitle>
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
            autoFocus
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
                USER role requires a Room Number to link the account to a specific room
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
        </DialogContent>

        <DialogActions>
          <Button onClick={handleClose} disabled={loading}>
            ยกเลิก
          </Button>
          <Button type="submit" variant="contained" disabled={loading}>
            {loading ? 'Creating...' : 'สร้าง'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default CreateUserModal;
