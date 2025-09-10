import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Dialog,
  DialogTitle,
  DialogActions,
  Button,
  DialogContent,
  Typography,
  Grid,
  CircularProgress,
  Box,
  Tooltip,
  IconButton,
  Chip,
} from '@mui/material';
import PrintIcon from '@mui/icons-material/Print';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';

import { listInvoices, openInvoice, computeDisplayStatus } from '../../api/invoice';
import GenerateInvoiceModal from '../Invoice/GenerateInvoiceModal';

import './InvoiceHistory.css';

// ---------- helpers ----------
function formatCurrency(n) {
  if (n == null) return '-';
  return Number(n).toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function renderStatusChip(inv) {
  const label = computeDisplayStatus(inv); // 'Paid' | 'Overdue' | 'Not yet paid'
  const colorMap = { paid: 'success', overdue: 'error', 'not yet paid': 'warning' };
  const key = (label || '').toLowerCase();
  return <Chip size="small" label={label} color={colorMap[key] || 'default'} />;
}

// ---------- component ----------
const InvoiceHistory = ({ searchTerm, addInvoiceSignal }) => {
  const navigate = useNavigate();
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: 'issueDate', direction: 'descending' });
  const [invoiceToPrint, setInvoiceToPrint] = useState(null);

  const [openCreate, setOpenCreate] = useState(false);
  const prevSignal = useRef(addInvoiceSignal);
  useEffect(() => {
    if (prevSignal.current !== addInvoiceSignal) {
      prevSignal.current = addInvoiceSignal;
      setOpenCreate(true);
    }
  }, [addInvoiceSignal]);

  const loadInvoices = async () => {
    setLoading(true);
    setError('');
    try {
      const invoiceData = await listInvoices();
      setInvoices(invoiceData || []);
    } catch (e) {
      setError(e?.message || 'Failed to load invoice history.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInvoices();
  }, []);

  const handleSort = (key) => {
    setSortConfig((prev) => ({
      key,
      direction:
        prev.key === key && prev.direction === 'ascending' ? 'descending' : 'ascending',
    }));
  };

  const sortedInvoices = useMemo(() => {
    const list = [...invoices];
    if (!sortConfig.key) return list;

    return list.sort((a, b) => {
      const dir = sortConfig.direction === 'ascending' ? 1 : -1;

      if (sortConfig.key === 'roomNumber') {
        const va = a.room?.number ?? 0;
        const vb = b.room?.number ?? 0;
        return (va - vb) * dir;
      }
      if (sortConfig.key === 'status') {
        const va = (computeDisplayStatus(a) || '').toLowerCase();
        const vb = (computeDisplayStatus(b) || '').toLowerCase();
        return va.localeCompare(vb) * dir;
      }

      let va = a[sortConfig.key];
      let vb = b[sortConfig.key];

      if (va == null && vb == null) return 0;
      if (va == null) return -1 * dir;
      if (vb == null) return 1 * dir;

      if (va < vb) return -1 * dir;
      if (va > vb) return 1 * dir;
      return 0;
    });
  }, [invoices, sortConfig]);

  const filteredInvoices = useMemo(() => {
    const term = (searchTerm || '').toLowerCase();
    if (!term) return sortedInvoices;
    return sortedInvoices.filter(
      (inv) =>
        String(inv.room?.number ?? '').includes(term) ||
        String(inv.id ?? '').includes(term)
    );
  }, [sortedInvoices, searchTerm]);

  const handleRoomClick = (roomNumber) => {
    if (roomNumber) navigate(`/room-details/${roomNumber}`);
  };

  const handleInvoiceClick = (invoiceId) => {
    if (invoiceId) navigate(`/invoice-details/${invoiceId}`);
  };

  const handlePrint = () => {
    if (invoiceToPrint) openInvoice(invoiceToPrint.id, 'print');
    setInvoiceToPrint(null);
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', my: 5 }}>
        <CircularProgress /> <Typography sx={{ ml: 2 }}>Loading Invoices...</Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography color="error">Error: {error}</Typography>
      </Box>
    );
  }

  return (
    <>
      <div className="invoice-table-container">
        <table className="room-table">
          <thead>
            <tr>
              <th onClick={() => handleSort('roomNumber')} className="sortable">Room No.</th>
              <th onClick={() => handleSort('id')} className="sortable">Invoice ID</th>
              <th onClick={() => handleSort('issueDate')} className="sortable">Issue Date</th>
              <th onClick={() => handleSort('dueDate')} className="sortable">Due Date</th>
              <th onClick={() => handleSort('totalBaht')} className="sortable">Amount</th>
              <th onClick={() => handleSort('status')} className="sortable">Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredInvoices.map((invoice) => (
              <tr key={invoice.id}>
                <td className="link-text" onClick={() => handleRoomClick(invoice.room?.number)}>
                  {invoice.room?.number || 'N/A'}
                </td>
                <td className="link-text" onClick={() => handleInvoiceClick(invoice.id)}>
                  {invoice.id}
                </td>
                <td>{invoice.issueDate}</td>
                <td>{invoice.dueDate}</td>
                <td>{formatCurrency(invoice.totalBaht)}</td>
                <td>{renderStatusChip(invoice)}</td>
                <td className="print-icon-cell">
                  <Box sx={{ display: 'flex', justifyContent: 'center', gap: 0.5 }}>
                    <Tooltip title="Print Preview">
                      <IconButton onClick={() => setInvoiceToPrint(invoice)} size="small">
                        <PrintIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Download PDF">
                      <IconButton onClick={() => openInvoice(invoice.id, 'pdf')} size="small">
                        <PictureAsPdfIcon />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Dialog open={Boolean(invoiceToPrint)} onClose={() => setInvoiceToPrint(null)} maxWidth="xs" fullWidth>
        {invoiceToPrint && (
          <>
            <DialogTitle sx={{ textAlign: 'center', fontWeight: 'bold' }}>
              Invoice Details
            </DialogTitle>
            <DialogContent>
              <Grid container spacing={1}>
                <Grid item xs={6}><Typography><strong>Room No.:</strong></Typography></Grid>
                <Grid item xs={6}><Typography>{invoiceToPrint.room?.number}</Typography></Grid>
                <Grid item xs={6}><Typography><strong>Invoice ID:</strong></Typography></Grid>
                <Grid item xs={6}><Typography>{invoiceToPrint.id}</Typography></Grid>
                <Grid item xs={6}><Typography><strong>Issue Date:</strong></Typography></Grid>
                <Grid item xs={6}><Typography>{invoiceToPrint.issueDate}</Typography></Grid>
                <Grid item xs={6}><Typography><strong>Due Date:</strong></Typography></Grid>
                <Grid item xs={6}><Typography>{invoiceToPrint.dueDate}</Typography></Grid>
                <Grid item xs={6}><Typography><strong>Amount:</strong></Typography></Grid>
                <Grid item xs={6}><Typography>{formatCurrency(invoiceToPrint.totalBaht)}</Typography></Grid>
                <Grid item xs={6}><Typography><strong>Status:</strong></Typography></Grid>
                <Grid item xs={6}>{renderStatusChip(invoiceToPrint)}</Grid>
              </Grid>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setInvoiceToPrint(null)}>Cancel</Button>
              <Button onClick={handlePrint} variant="contained">Print</Button>
            </DialogActions>
          </>
        )}
      </Dialog>

      <GenerateInvoiceModal
        open={openCreate}
        onClose={() => setOpenCreate(false)}
        onCreated={() => {
          setOpenCreate(false);
          loadInvoices();
        }}
      />
    </>
  );
};

export default InvoiceHistory;
