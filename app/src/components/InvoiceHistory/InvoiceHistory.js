import React, { useState, useEffect, useMemo } from 'react';
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
  Chip
} from '@mui/material';
import PrintIcon from '@mui/icons-material/Print';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';

// Corrected API import based on your error message
import { listInvoices, openInvoice, computeDisplayStatus } from '../../api/invoice';
import './InvoiceHistory.css';

// Helper to format currency
function formatCurrency(n) {
  if (n == null) return '-';
  return Number(n).toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

// CORRECTED: This function now correctly renders the status chip,
// using the exact logic from your RoomInvoiceTable.js file.
function renderStatusChip(inv) {
  const label = computeDisplayStatus(inv); // e.g. 'Paid' | 'Overdue' | 'Not yet paid'
  const colorMap = {
    paid: 'success',
    overdue: 'error',
    'not yet paid': 'warning',
  };
  const key = (label || '').toLowerCase();
  return <Chip size="small" label={label} color={colorMap[key] || 'default'} />;
}

const InvoiceHistory = ({ searchTerm }) => {
  const navigate = useNavigate();
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: 'issueDate', direction: 'descending' });
  const [invoiceToPrint, setInvoiceToPrint] = useState(null);

  useEffect(() => {
    let cancelled = false;
    async function fetchData() {
      setLoading(true);
      setError('');
      try {
        // Fetch ALL invoices using the correct API function from your file
        const invoiceData = await listInvoices();
        if (!cancelled) {
          setInvoices(invoiceData);
        }
      } catch (e) {
        if (!cancelled) {
          setError(e.message || 'Failed to load invoice history.');
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }
    fetchData();
    return () => { cancelled = true; };
  }, []);

  const handleSort = (key) => {
    setSortConfig((prev) => ({
      key,
      direction: prev.key === key && prev.direction === 'ascending' ? 'descending' : 'ascending',
    }));
  };

  const sortedInvoices = useMemo(() => {
    const list = [...invoices];
    if (!sortConfig.key) return list;
    
    return list.sort((a, b) => {
      const dir = sortConfig.direction === 'ascending' ? 1 : -1;
      let valA = a[sortConfig.key];
      let valB = b[sortConfig.key];

      if (sortConfig.key === 'roomNumber') {
        valA = a.room?.number || 0;
        valB = b.room?.number || 0;
      }
      
      if (valA < valB) return -1 * dir;
      if (valA > valB) return 1 * dir;
      return 0;
    });
  }, [invoices, sortConfig]);
  
  const filteredInvoices = useMemo(() => {
    const term = (searchTerm || '').toLowerCase();
    if (!term) return sortedInvoices;
    return sortedInvoices.filter(
      (inv) =>
        String(inv.room?.number).includes(term) ||
        String(inv.id).includes(term)
    );
  }, [sortedInvoices, searchTerm]);

  const handleRoomClick = (roomNumber) => {
    if (roomNumber) navigate(`/room-details/${roomNumber}`);
  };

  const handleInvoiceClick = (invoiceId) => {
    if (invoiceId) navigate(`/invoice-details/${invoiceId}`);
  };

  const handlePrint = () => {
    // This uses the openInvoice API function for consistency
    if (invoiceToPrint) openInvoice(invoiceToPrint.id, 'print');
    setInvoiceToPrint(null);
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', my: 5 }}>
        <CircularProgress /> <Typography sx={{ml: 2}}>Loading Invoices...</Typography>
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
            {filteredInvoices.map((invoice) => {
              // const displayStatus = computeDisplayStatus(invoice); // No longer needed
              return (
                <tr key={invoice.id}>
                  <td className="link-text" onClick={() => handleRoomClick(invoice.room?.number)}>{invoice.room?.number || 'N/A'}</td>
                  <td className="link-text" onClick={() => handleInvoiceClick(invoice.id)}>{invoice.id}</td>
                  <td>{invoice.issueDate}</td>
                  <td>{invoice.dueDate}</td>
                  <td>{formatCurrency(invoice.totalBaht)}</td>
                  {/* CORRECTED: Now calling the render function */}
                  <td>{renderStatusChip(invoice)}</td>
                  <td className="print-icon-cell">
                    <Box sx={{ display: 'flex', justifyContent: 'center', gap: 0.5 }}>
                      <Tooltip title="Print Preview"><IconButton onClick={() => setInvoiceToPrint(invoice)} size="small"><PrintIcon /></IconButton></Tooltip>
                      <Tooltip title="Download PDF"><IconButton onClick={() => openInvoice(invoice.id, 'pdf')} size="small"><PictureAsPdfIcon /></IconButton></Tooltip>
                    </Box>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      <Dialog open={Boolean(invoiceToPrint)} onClose={() => setInvoiceToPrint(null)} maxWidth="xs" fullWidth>
        {invoiceToPrint && ( 
          <>
            <DialogTitle sx={{ textAlign: 'center', fontWeight: 'bold' }}>Invoice Details</DialogTitle>
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
                {/* CORRECTED: Also calling the render function in the dialog */}
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
    </>
  );
};

export default InvoiceHistory;

