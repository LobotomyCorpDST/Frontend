import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { placeholderData } from '../../data/placeholderData';
import './InvoiceHistory.css';

const InvoiceHistory = ({ searchTerm, sortBy }) => {
  const navigate = useNavigate();
  const [invoices, setInvoices] = useState([]);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'ascending' });

  useEffect(() => {
    // Transform the data to the invoice format
    const transformedInvoices = placeholderData.map(room => ({
      roomNumber: room.roomNumber,
      invoiceId: room.latestInvoice.invoiceId,
      paymentDate: room.latestInvoice.paymentDate,
      paymentAmount: room.latestInvoice.paymentAmount,
      paymentStatus: room.latestInvoice.paymentStatus,
    }));
    setInvoices(transformedInvoices);
  }, []);

  // Apply external sortBy prop if provided
  useEffect(() => {
    if (sortBy) {
      let sortKey = null;
      let direction = 'ascending';
      
      switch(sortBy) {
        case 'เลขห้อง':
          sortKey = 'roomNumber';
          break;
        case 'ชื่อ':
          // The data structure now supports name, but the InvoiceHistory table doesn't have it
          sortKey = 'invoiceId';
          break;
        case 'วันที่':
          sortKey = 'paymentDate';
          break;
        default:
          sortKey = 'roomNumber';
      }
      
      setSortConfig({ key: sortKey, direction });
    }
  }, [sortBy]);

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
      if (sortConfig.direction === 'ascending') {
        return valA - valB;
      }
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
      return sortConfig.direction === 'ascending' ? statusA - statusB : statusB - statusA;
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

  return (
    <>
      <div className="invoice-history-container">
        <table className="invoice-table">
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
                  <button className="print-btn" onClick={() => alert('Print function not yet implemented.')}>
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="20" height="20" fill="currentColor">
                      <path d="M128 0C92.7 0 64 28.7 64 64v96h64V64H354.7L416 125.3V192h64V128L384 0H128zM384 352v96H128V352h256zm64 96V352c0-26.5-21.5-48-48-48H112c-26.5 0-48 21.5-48 48v96H0c0 35.3 28.7 64 64 64h384c35.3 0 64-28.7 64-64h-64zm-55.9-64h-16.1c-13.3 0-24 10.7-24 24s10.7 24 24 24h16.1c13.3 0 24-10.7 24-24s-10.7-24-24-24z" />
                    </svg>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
};

export default InvoiceHistory;
