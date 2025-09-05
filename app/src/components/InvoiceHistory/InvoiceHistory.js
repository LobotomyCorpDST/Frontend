import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { placeholderData } from '../../data/placeholderData';
import './InvoiceHistory.css';
import PrintIcon from '@mui/icons-material/Print';
import {
  Dialog,
  DialogTitle,
  DialogActions,
  Button,
  DialogContent,
  Typography, // Import Typography for better text styling
  Grid,       // Import Grid for layout
} from '@mui/material';


const InvoiceHistory = ({ searchTerm, sortBy }) => {
  const navigate = useNavigate();
  const [invoices, setInvoices] = useState([]);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'ascending' });
  const [invoiceToPrint, setInvoiceToPrint] = useState(null);

  useEffect(() => {
    const transformedInvoices = placeholderData.map(room => ({
      roomNumber: room.roomNumber,
      invoiceId: room.latestInvoice.invoiceId,
      paymentDate: room.latestInvoice.paymentDate,
      paymentAmount: room.latestInvoice.paymentAmount,
      paymentStatus: room.latestInvoice.paymentStatus,
    }));
    setInvoices(transformedInvoices);
  }, []);

  const handleSort = (key) => {
    let direction = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };
 
  const sortedInvoices = [...invoices].sort((a, b) => {
    if (sortConfig.key === 'roomNumber' || sortConfig.key === 'invoiceId' || sortConfig.key === 'paymentAmount') {
      const valA = a[sortConfig.key];
      const valB = b[sortConfig.key];
      if (sortConfig.direction === 'ascending') { return valA - valB; }
      return valB - valA;
    }
    if (sortConfig.key === 'paymentDate') {
      const dateA = new Date(a.paymentDate);
      const dateB = new Date(b.paymentDate);
      return sortConfig.direction === 'ascending' ? dateA - dateB : dateB - dateA;
    }
    if (sortConfig.key === 'paymentStatus') {
      const order = { 'Overdue': 1, 'Not yet paid': 2, 'Paid': 3 };
      const statusA = order[a.paymentStatus];
      const statusB = order[b.paymentStatus];
      return sortConfig.direction === 'ascending' ? statusA - statusB : statusB - a;
    }
    return 0;
  });

  const filteredInvoices = sortedInvoices.filter((invoice) =>
    String(invoice.roomNumber).includes(searchTerm || '') ||
    String(invoice.invoiceId).includes(searchTerm || '')
  );

  const handleRoomClick = (roomNumber) => {
    navigate(`/room-details/${roomNumber}`);
  };

  const handleInvoiceClick = (invoiceId) => {
    navigate(`/invoice-details/${invoiceId}`);
  };

  const handlePrint = () => {
    window.print(); 
    setInvoiceToPrint(null); 
  };

  return (
    <>
      <div className="invoice-table-container">
        <table className="room-table">
          <thead>
            <tr>
              <th onClick={() => handleSort('roomNumber')} className="sortable">Room No.</th>
              <th onClick={() => handleSort('invoiceId')} className="sortable">Invoice ID No.</th>
              <th onClick={() => handleSort('paymentDate')} className="sortable">Date of Payment</th>
              <th onClick={() => handleSort('paymentAmount')} className="sortable">Payment Amount</th>
              <th onClick={() => handleSort('paymentStatus')} className="sortable">Payment Status</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {filteredInvoices.map((invoice) => (
              <tr key={invoice.invoiceId}>
                <td className="link-text" onClick={() => handleRoomClick(invoice.roomNumber)}>{invoice.roomNumber}</td>
                <td className="link-text" onClick={() => handleInvoiceClick(invoice.invoiceId)}>{invoice.invoiceId}</td>
                <td>{invoice.paymentDate}</td>
                <td>${invoice.paymentAmount.toFixed(2)}</td>
                <td className={`status-${invoice.paymentStatus.replace(/\s+/g, '-')}`}>
                  {invoice.paymentStatus}
                </td>
                <td className="print-icon-cell">
                  <button className="print-btn" onClick={() => setInvoiceToPrint(invoice)}>
                    <PrintIcon />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Dialog 
        open={Boolean(invoiceToPrint)} 
        onClose={() => setInvoiceToPrint(null)} 
        maxWidth="xs" 
        fullWidth
        className="invoice-dialog" 
      >
        {invoiceToPrint && ( 
          <>
            <DialogTitle sx={{ textAlign: 'center', fontWeight: 'bold' }}>
              Invoice Details
            </DialogTitle>
            <DialogContent>
              <Grid container spacing={1}>
                <Grid item xs={6}>
                  <Typography variant="body1"><strong>Room No.:</strong></Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body1">{invoiceToPrint.roomNumber}</Typography>
                </Grid>
                
                <Grid item xs={6}>
                  <Typography variant="body1"><strong>Invoice ID:</strong></Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body1">{invoiceToPrint.invoiceId}</Typography>
                </Grid>

                <Grid item xs={6}>
                  <Typography variant="body1"><strong>Date of Payment:</strong></Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body1">{invoiceToPrint.paymentDate}</Typography>
                </Grid>

                <Grid item xs={6}>
                  <Typography variant="body1"><strong>Payment Amount:</strong></Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body1">${invoiceToPrint.paymentAmount.toFixed(2)}</Typography>
                </Grid>

                <Grid item xs={6}>
                  <Typography variant="body1"><strong>Status:</strong></Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body1" className={`status-${invoiceToPrint.paymentStatus.replace(/\s+/g, '-')}`}>
                    {invoiceToPrint.paymentStatus}
                  </Typography>
                </Grid>
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