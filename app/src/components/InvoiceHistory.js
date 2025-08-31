import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from './Header';
import './InvoiceHistory.css';

const placeholderInvoices = [
  {
    roomNumber: 101,
    invoiceId: 9876543,
    paymentDate: '2024-09-25',
    paymentAmount: 5000.00,
    paymentStatus: 'Paid',
  },
  {
    roomNumber: 102,
    invoiceId: 1234567,
    paymentDate: '2024-10-01',
    paymentAmount: 5500.50,
    paymentStatus: 'Overdue',
  },
  {
    roomNumber: 103,
    invoiceId: 8765432,
    paymentDate: '2024-10-10',
    paymentAmount: 4800.00,
    paymentStatus: 'Not yet paid',
  },
  {
    roomNumber: 104,
    invoiceId: 2345678,
    paymentDate: '2024-09-30',
    paymentAmount: 5100.00,
    paymentStatus: 'Paid',
  },
  {
    roomNumber: 105,
    invoiceId: 3456789,
    paymentDate: '2024-10-05',
    paymentAmount: 5000.00,
    paymentStatus: 'Paid',
  },
  {
    roomNumber: 106,
    invoiceId: 4567890,
    paymentDate: '2024-09-28',
    paymentAmount: 5200.00,
    paymentStatus: 'Overdue',
  },
  {
    roomNumber: 107,
    invoiceId: 5678901,
    paymentDate: '2024-10-12',
    paymentAmount: 5000.00,
    paymentStatus: 'Not yet paid',
  },
];

const InvoiceHistory = () => {
  const navigate = useNavigate();
  const [invoices, setInvoices] = useState([]);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'ascending' });
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    // In a real app, you would fetch data from your database here.
    setInvoices(placeholderInvoices);
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

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const filteredInvoices = sortedInvoices.filter((invoice) =>
    String(invoice.roomNumber).includes(searchTerm) ||
    String(invoice.invoiceId).includes(searchTerm)
  );

  const handleRoomClick = (roomNumber) => {
    navigate(`/room-details/${roomNumber}`);
  };

  const handleInvoiceClick = (invoiceId) => {
    navigate(`/invoice-details/${invoiceId}`);
  };

  return (
    <>
      <Header title="Invoice History" />
      <div className="invoice-history-container">
        <div className="header-bar">
          <div className="header-buttons">
            <button className="invoice-history-btn" onClick={() => navigate('/invoice-history')}>Invoice History</button>
            <button className="room-list-btn" onClick={() => navigate('/room-list')}>Room List</button>
          </div>
          <div className="search-and-add">
            <div className="search-bar">
              <input
                type="text"
                placeholder="Search by Room or Invoice ID"
                value={searchTerm}
                onChange={handleSearchChange}
              />
            </div>
            <button className="add-invoice-btn">Add Invoice</button>
          </div>
        </div>
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
