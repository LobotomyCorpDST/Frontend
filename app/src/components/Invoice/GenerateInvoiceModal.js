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

function numOrUndef(v) {
  if (v === '' || v === null || v === undefined) return undefined;
  const n = Number(v);
  return Number.isFinite(n) ? n : undefined;
}

export default function GenerateInvoiceModal({ roomId, onClose, onSuccess }) {
  const today = useMemo(() => new Date(), []);
  const y = today.getFullYear();
  const m = today.getMonth() + 1;

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

  const [openAfter, setOpenAfter] = useState('print'); // 'print' | 'pdf'
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleCreate() {
    setLoading(true);
    setError('');
    try {
      const payload = {
        roomId,
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

      // ลบ key ที่เป็น undefined ออก เพื่อให้ body สะอาด
      Object.keys(payload).forEach((k) => payload[k] === undefined && delete payload[k]);

      const inv = await createInvoice(payload, {
        includeCommonFee,
        includeGarbageFee,
      });

      // เปิดหน้าหลังสร้างสำเร็จ
      openInvoice(inv.id, openAfter);
      onSuccess && onSuccess(inv);
      onClose && onClose();
    } catch (e) {
      setError(e.message || 'Create invoice failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open onClose={loading ? undefined : onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ pb: 1 }}>
        สร้างใบแจ้งหนี้ — <Typography component="span" color="primary">ห้อง {roomId}</Typography>
      </DialogTitle>
      <DialogContent dividers>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
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

        {/* Options */}
        <Stack direction="row" spacing={2} alignItems="center" sx={{ mt: 1 }}>
          <FormControlLabel
            control={
              <Checkbox
                checked={includeCommonFee}
                onChange={(e) => setIncludeCommonFee(e.target.checked)}
              />
            }
            label="Include Common Fee"
          />
          <FormControlLabel
            control={
              <Checkbox
                checked={includeGarbageFee}
                onChange={(e) => setIncludeGarbageFee(e.target.checked)}
              />
            }
            label="Include Garbage Fee"
          />
        </Stack>

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
        <Button onClick={onClose} disabled={loading}>
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