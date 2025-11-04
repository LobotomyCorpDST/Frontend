import React, { useMemo, useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  TextField,
  FormControlLabel,
  Checkbox,
  ToggleButtonGroup,
  ToggleButton,
  Stack,
  Typography,
  Divider,
  Alert,
  Button,
  CircularProgress,
} from '@mui/material';
import { createInvoice, openInvoice } from '../../api/invoice';
import http from '../../api/http';

function numOrUndef(v) {
  if (v === '' || v === null || v === undefined) return undefined;
  const n = Number(v);
  return Number.isFinite(n) ? n : undefined;
}

/**
 * Props:
 * - open: boolean                 -> คุมเปิด/ปิด Dialog
 * - onClose: () => void
 * - onCreated?: (inv) => void     -> เรียกตอนสร้างสำเร็จ
 * - roomId?: number               -> ถ้าส่งมา จะซ่อนช่องกรอกเลขห้อง
 */
export default function GenerateInvoiceModal({ open, onClose, onCreated, roomId }) {
  const today = useMemo(() => new Date(), []);
  const y = today.getFullYear();
  const m = today.getMonth() + 1;

  const [roomNumber, setRoomNumber] = useState('');

  const [billingYear, setBillingYear] = useState(y);
  const [billingMonth, setBillingMonth] = useState(m);
  const [issueDate, setIssueDate] = useState(today.toISOString().slice(0, 10));
  const [dueDate, setDueDate] = useState(
    new Date(today.getTime() + 7 * 86400000).toISOString().slice(0, 10)
  );

  const [electricityUnits, setElectricityUnits] = useState('');
  const [electricityRate, setElectricityRate] = useState('');
  const [waterUnits, setWaterUnits] = useState('');
  const [waterRate, setWaterRate] = useState('');
  const [otherBaht, setOtherBaht] = useState('');

  const [includeCommonFee, setIncludeCommonFee] = useState(true);
  const [includeGarbageFee, setIncludeGarbageFee] = useState(false);
  const [customCommonFee, setCustomCommonFee] = useState('');
  const [customGarbageFee, setCustomGarbageFee] = useState('');

  const [openAfter, setOpenAfter] = useState('print'); // 'print' | 'pdf'
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function resolveRoomId() {
    if (roomId) return roomId;
    const n = Number(roomNumber);
    if (!Number.isFinite(n) || n <= 0) {
      throw new Error('กรุณากรอกเลขห้องให้ถูกต้อง');
    }
    try {
      const room = await http.get(`/api/rooms/by-number/${encodeURIComponent(n)}`);
      if (!room?.id) throw new Error('ข้อมูลห้องไม่ถูกต้อง');
      return room.id;
    } catch (error) {
      throw new Error('ไม่พบห้องตามเลขที่ระบุ');
    }
  }

  async function handleCreate() {
    setLoading(true);
    setError('');
    try {
      const resolvedRoomId = await resolveRoomId();

      const payload = {
        roomId: resolvedRoomId,
        billingYear: numOrUndef(billingYear),
        billingMonth: numOrUndef(billingMonth),
        issueDate,
        dueDate,
        electricityUnits: numOrUndef(electricityUnits),
        electricityRate: numOrUndef(electricityRate),
        waterUnits: numOrUndef(waterUnits),
        waterRate: numOrUndef(waterRate),
        otherBaht: numOrUndef(otherBaht),
      };

      // Add custom fees if checkboxes are unchecked
      if (!includeCommonFee && customCommonFee) {
        payload.commonFeeBaht = numOrUndef(customCommonFee);
      }
      if (!includeGarbageFee && customGarbageFee) {
        payload.garbageFeeBaht = numOrUndef(customGarbageFee);
      }

      Object.keys(payload).forEach((k) => payload[k] === undefined && delete payload[k]);

      const inv = await createInvoice(payload, {
        includeCommonFee,
        includeGarbageFee,
      });

      openInvoice(inv.id, openAfter);
      onCreated && onCreated(inv);
      onClose && onClose();
    } catch (e) {
      setError(e?.message || 'Create invoice failed');
    } finally {
      setLoading(false);
    }
  }

  function handleClose() {
    if (loading) return;
    setError('');
    onClose && onClose();
  }

  return (
    <Dialog open={!!open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ pb: 1 }}>
        สร้างใบแจ้งหนี้{' '}
        {!roomId && (
          <Typography component="span" sx={{ ml: 1 }} color="text.secondary">
            (เลือกเลขห้องก่อนสร้าง)
          </Typography>
        )}
      </DialogTitle>

      <DialogContent dividers>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {/* Room number selector (ถ้าไม่ได้ส่ง roomId มา) */}
        {!roomId && (
          <Grid container spacing={2} sx={{ mb: 2 }}>
            <Grid item xs={12}>
              <TextField
                label="เลขห้อง"
                fullWidth
                value={roomNumber}
                onChange={(e) => setRoomNumber(e.target.value.replace(/\D/g, ''))}
                placeholder="เช่น 101"
              />
            </Grid>
          </Grid>
        )}

        {/* Billing period */}
        <Typography variant="subtitle2" sx={{ color: 'text.secondary', mb: 1 }}>
          Billing Year / Month
        </Typography>
        <Grid container spacing={2} sx={{ mb: 2 }}>
          <Grid item xs={7}>
            <TextField
              label="Year"
              type="number"
              fullWidth
              value={billingYear}
              onChange={(e) => setBillingYear(e.target.value)}
              inputProps={{ min: 1900 }}
            />
          </Grid>
          <Grid item xs={5}>
            <TextField
              label="Month"
              type="number"
              fullWidth
              value={billingMonth}
              onChange={(e) => setBillingMonth(e.target.value)}
              inputProps={{ min: 1, max: 12 }}
            />
          </Grid>
        </Grid>

        {/* Dates */}
        <Grid container spacing={2} sx={{ mb: 2 }}>
          <Grid item xs={12} sm={6}>
            <TextField
              label="Issue Date"
              type="date"
              fullWidth
              value={issueDate}
              onChange={(e) => setIssueDate(e.target.value)}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              label="Due Date"
              type="date"
              fullWidth
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
        </Grid>

        <Divider sx={{ my: 2 }} />

        {/* Electricity */}
        <Typography variant="subtitle2" sx={{ color: 'text.secondary', mb: 1 }}>
          Electricity
        </Typography>
        <Grid container spacing={2} sx={{ mb: 2 }}>
          <Grid item xs={6}>
            <TextField
              label="Units"
              type="number"
              fullWidth
              value={electricityUnits}
              onChange={(e) => setElectricityUnits(e.target.value)}
              inputProps={{ step: '0.01' }}
            />
          </Grid>
          <Grid item xs={6}>
            <TextField
              label="Rate (฿/unit)"
              type="number"
              fullWidth
              value={electricityRate}
              onChange={(e) => setElectricityRate(e.target.value)}
              inputProps={{ step: '0.01' }}
            />
          </Grid>
        </Grid>

        {/* Water */}
        <Typography variant="subtitle2" sx={{ color: 'text.secondary', mb: 1 }}>
          Water
        </Typography>
        <Grid container spacing={2} sx={{ mb: 2 }}>
          <Grid item xs={6}>
            <TextField
              label="Units"
              type="number"
              fullWidth
              value={waterUnits}
              onChange={(e) => setWaterUnits(e.target.value)}
              inputProps={{ step: '0.01' }}
            />
          </Grid>
          <Grid item xs={6}>
            <TextField
              label="Rate (฿/unit)"
              type="number"
              fullWidth
              value={waterRate}
              onChange={(e) => setWaterRate(e.target.value)}
              inputProps={{ step: '0.01' }}
            />
          </Grid>
        </Grid>

        {/* Other */}
        <Grid container spacing={2} sx={{ mb: 1 }}>
          <Grid item xs={12}>
            <TextField
              label="Other (Baht)"
              type="number"
              fullWidth
              value={otherBaht}
              onChange={(e) => setOtherBaht(e.target.value)}
              inputProps={{ step: '0.01' }}
            />
          </Grid>
        </Grid>

        {/* Fee Options */}
        <Divider sx={{ my: 2 }} />
        <Typography variant="subtitle2" sx={{ mb: 1 }}>
          ค่าธรรมเนียมเพิ่มเติม
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={includeCommonFee}
                  onChange={(e) => setIncludeCommonFee(e.target.checked)}
                />
              }
              label="ใช้ค่าส่วนกลางจากห้อง"
            />
            {!includeCommonFee && (
              <TextField
                fullWidth
                size="small"
                label="ค่าส่วนกลาง (บาท)"
                type="number"
                value={customCommonFee}
                onChange={(e) => setCustomCommonFee(e.target.value)}
                inputProps={{ step: '0.01', min: '0' }}
                sx={{ mt: 1 }}
              />
            )}
          </Grid>
          <Grid item xs={12} sm={6}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={includeGarbageFee}
                  onChange={(e) => setIncludeGarbageFee(e.target.checked)}
                />
              }
              label="ใช้ค่าขยะจากห้อง"
            />
            {!includeGarbageFee && (
              <TextField
                fullWidth
                size="small"
                label="ค่าขยะ (บาท)"
                type="number"
                value={customGarbageFee}
                onChange={(e) => setCustomGarbageFee(e.target.value)}
                inputProps={{ step: '0.01', min: '0' }}
                sx={{ mt: 1 }}
              />
            )}
          </Grid>
        </Grid>

        {/* Open after create */}
        <Stack spacing={1} sx={{ mt: 2 }}>
          <Typography variant="subtitle2" sx={{ color: 'text.secondary' }}>
            Open after create
          </Typography>
          <ToggleButtonGroup
            color="primary"
            exclusive
            value={openAfter}
            onChange={(_e, v) => v && setOpenAfter(v)}
            size="small"
          >
            <ToggleButton value="print">Print View</ToggleButton>
            <ToggleButton value="pdf">PDF</ToggleButton>
          </ToggleButtonGroup>
        </Stack>
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button onClick={handleClose} disabled={loading}>
          Cancel
        </Button>
        <Button
          variant="contained"
          onClick={handleCreate}
          disabled={loading}
          startIcon={loading ? <CircularProgress size={18} color="inherit" /> : null}
        >
          Create
        </Button>
      </DialogActions>
    </Dialog>
  );
}
