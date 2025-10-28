import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Alert,
} from '@mui/material';
import { createSupply } from '../../api/supply';

const AddSupplyModal = ({ open, onClose, onSuccess }) => {
  const [supplyName, setSupplyName] = useState('');
  const [supplyAmount, setSupplyAmount] = useState('0');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleClose = () => {
    setSupplyName('');
    setSupplyAmount('0');
    setError('');
    onClose();
  };

  const handleSubmit = async () => {
    if (!supplyName.trim()) {
      setError('กรุณากรอกชื่อของ');
      return;
    }

    const amount = parseInt(supplyAmount, 10);
    if (isNaN(amount) || amount < 0) {
      setError('จำนวนต้องเป็นตัวเลขที่ไม่ติดลบ');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      await createSupply({
        supplyName: supplyName.trim(),
        supplyAmount: amount,
      });

      if (onSuccess) onSuccess();
      handleClose();
    } catch (err) {
      setError(err.message || 'Failed to create supply');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>เพิ่มของ</DialogTitle>
      <DialogContent>
        {error && (
          <Alert severity="error" onClose={() => setError('')} sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <TextField
          label="ชื่อของ"
          fullWidth
          margin="normal"
          value={supplyName}
          onChange={(e) => setSupplyName(e.target.value)}
          required
        />

        <TextField
          label="จำนวนเริ่มต้น"
          type="number"
          fullWidth
          margin="normal"
          value={supplyAmount}
          onChange={(e) => setSupplyAmount(e.target.value)}
          inputProps={{ min: 0 }}
          required
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} disabled={submitting}>
          ยกเลิก
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={submitting}
        >
          {submitting ? 'กำลังบันทึก...' : 'บันทึก'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AddSupplyModal;
