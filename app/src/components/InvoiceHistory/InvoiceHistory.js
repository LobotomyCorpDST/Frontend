import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  // MUI Table Components
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, TableSortLabel,
  // Other MUI Components
  Dialog, DialogTitle, DialogActions, Button, DialogContent, Typography,
  Grid, CircularProgress, Box, Tooltip, IconButton, Chip, Link, Checkbox, Toolbar, Alert,
} from '@mui/material';
import { visuallyHidden } from '@mui/utils';
import PrintIcon from '@mui/icons-material/Print';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import EditIcon from '@mui/icons-material/Edit';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import SettingsIcon from '@mui/icons-material/Settings';
import EditInvoiceModal from '../Invoice/EditInvoiceModal';
import SmartSearchAutocomplete from '../Common/SmartSearchAutocomplete';

import { listInvoices, openInvoice, computeDisplayStatus, bulkPrintInvoices, getCurrentMonthInvoices } from '../../api/invoice';
import GenerateInvoiceModal from '../Invoice/GenerateInvoiceModal';
import CsvImportModal from './CsvImportModal';
import InvoiceSettingsModal from './InvoiceSettingsModal';

// Style object copied from MaintenanceHistory
const headerCellStyle = {
  backgroundColor: '#1d3e7d', fontWeight: 600, color: '#f8f9fa', padding: '12px',
  textAlign: 'left', borderBottom: '1px solid #e0e6eb', cursor: 'pointer',
  '&:hover': { backgroundColor: '#173262' }
};

// Headers defined for MUI Table
const headCells = [
  { id: 'select', label: '', disableSorting: true },
  { id: 'roomNumber', label: 'ห้อง' },
  { id: 'id', label: 'ID ใบแจ้งหนี้' },
  { id: 'issueDate', label: 'วันมอบหมาย' },
  { id: 'dueDate', label: 'วันกำหนดชำระ' },
  { id: 'totalBaht', label: 'จำนวน (บาท)' },
  { id: 'status', label: 'สถานะ' },
  { id: 'actions', label: 'Actions', disableSorting: true },
];

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
const InvoiceHistory = ({ addInvoiceSignal }) => {
  const navigate = useNavigate();
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: 'issueDate', direction: 'descending' });
  const [invoiceToPrint, setInvoiceToPrint] = useState(null);
  const [openCreate, setOpenCreate] = useState(false);
  const prevSignal = useRef(addInvoiceSignal);
  const [openEdit, setOpenEdit] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Bulk selection state
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [bulkPrinting, setBulkPrinting] = useState(false);
  const [bulkError, setBulkError] = useState('');

  // Modal state for CSV import and settings
  const [openCsvImport, setOpenCsvImport] = useState(false);
  const [openSettings, setOpenSettings] = useState(false);

  const handleEdit = (invoice) => {
    setSelectedInvoice(invoice);
    setOpenEdit(true);
  };


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

  const handleRequestSort = (property) => {
    const isAsc = sortConfig.key === property && sortConfig.direction === 'ascending';
    setSortConfig({ key: property, direction: isAsc ? 'descending' : 'ascending' });
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

  // Convert invoices to searchable options for SmartSearch
  const searchOptions = useMemo(() => {
    return sortedInvoices.map((inv) => ({
      id: inv.id,
      label: `Invoice #${inv.id} - ห้อง ${inv.room?.number ?? '-'} - ${formatCurrency(inv.totalBaht)} บาท`,
      value: inv.id,
      searchText: `${inv.id} ${inv.room?.number ?? ''} ${inv.totalBaht ?? ''}`,
    }));
  }, [sortedInvoices]);

  // Filter invoices based on selected search value
  const filteredInvoices = useMemo(() => {
    if (!searchTerm) return sortedInvoices;
    return sortedInvoices.filter((inv) => inv.id === searchTerm);
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

  // Bulk selection handlers
  const handleToggleSelect = (id) => {
    setSelectedIds((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const handleSelectAll = () => {
    if (selectedIds.size === filteredInvoices.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredInvoices.map((inv) => inv.id)));
    }
  };

  const handleClearSelection = () => {
    setSelectedIds(new Set());
    setBulkError('');
  };

  const handleBulkPrint = async () => {
    if (selectedIds.size === 0) return;

    setBulkPrinting(true);
    setBulkError('');
    try {
      await bulkPrintInvoices(Array.from(selectedIds));
      handleClearSelection();
    } catch (err) {
      setBulkError(err?.message || 'Failed to print invoices');
    } finally {
      setBulkPrinting(false);
    }
  };

  const handleSelectCurrentMonth = async () => {
    try {
      const currentMonthInvoices = await getCurrentMonthInvoices();
      const currentMonthIds = currentMonthInvoices.map((inv) => inv.id);
      setSelectedIds(new Set(currentMonthIds));
      setBulkError('');
    } catch (err) {
      setBulkError(err?.message || 'Failed to get current month invoices');
    }
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
      {/* Main action toolbar */}
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mb: 2 }}>
        <Button
          variant="outlined"
          startIcon={<UploadFileIcon />}
          onClick={() => setOpenCsvImport(true)}
        >
          นำเข้า CSV
        </Button>
        <Button
          variant="outlined"
          startIcon={<SettingsIcon />}
          onClick={() => setOpenSettings(true)}
        >
          ตั้งค่าใบแจ้งหนี้
        </Button>
      </Box>

      {/* Bulk action toolbar */}
      {selectedIds.size > 0 && (
        <Toolbar
          sx={{
            pl: { sm: 2 },
            pr: { xs: 1, sm: 1 },
            bgcolor: 'primary.light',
            color: 'primary.contrastText',
            borderRadius: 1,
            mb: 2,
          }}
        >
          <Typography sx={{ flex: '1 1 100%' }} variant="subtitle1" component="div">
            {selectedIds.size} selected
          </Typography>
          <Tooltip title="Print Selected">
            <Button
              variant="contained"
              color="secondary"
              startIcon={<PrintIcon />}
              onClick={handleBulkPrint}
              disabled={bulkPrinting}
              sx={{ mr: 1 }}
            >
              {bulkPrinting ? 'Printing...' : `Print (${selectedIds.size})`}
            </Button>
          </Tooltip>
          <Button variant="outlined" color="inherit" onClick={handleClearSelection} sx={{ mr: 1 }}>
            Clear
          </Button>
          <Button variant="outlined" color="inherit" onClick={handleSelectCurrentMonth}>
            เลือกเฉพาะเดือนปัจจุบัน
          </Button>
        </Toolbar>
      )}

      {/* Bulk error message */}
      {bulkError && (
        <Alert severity="error" onClose={() => setBulkError('')} sx={{ mb: 2 }}>
          {bulkError}
        </Alert>
      )}

      {/* Smart Search */}
      <Box sx={{ mb: 3, maxWidth: 600 }}>
        <SmartSearchAutocomplete
          options={searchOptions}
          label="ค้นหาใบแจ้งหนี้"
          value={searchTerm}
          onChange={(value) => setSearchTerm(value)}
          placeholder="พิมพ์เลขห้อง, เลข Invoice, หรือจำนวนเงิน..."
        />
      </Box>

      <TableContainer
        component={Paper}
        sx={{
          marginTop: '20px', borderRadius: '8px',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)', overflowX: 'auto',
        }}
      >
        <Table sx={{ minWidth: 650, maxWidth: '96%', mx: 'auto', mb: 2 }} aria-label="invoice history table">
          <TableHead>
            <TableRow>
              {headCells.map((headCell) => (
                <TableCell
                  key={headCell.id}
                  sx={headerCellStyle}
                  sortDirection={sortConfig.key === headCell.id ? sortConfig.direction : false}
                  onClick={() => !headCell.disableSorting && handleRequestSort(headCell.id)}
                >
                  {headCell.id === 'select' ? (
                    <Checkbox
                      indeterminate={selectedIds.size > 0 && selectedIds.size < filteredInvoices.length}
                      checked={filteredInvoices.length > 0 && selectedIds.size === filteredInvoices.length}
                      onChange={handleSelectAll}
                      sx={{ color: '#f8f9fa', '&.Mui-checked': { color: '#f8f9fa' } }}
                    />
                  ) : headCell.disableSorting ? (
                    headCell.label
                  ) : (
                    <TableSortLabel
                      active={sortConfig.key === headCell.id}
                      direction={sortConfig.key === headCell.id ? sortConfig.direction : 'asc'}
                      sx={{
                        color: '#f8f9fa', '&:hover': { color: '#f0f4fa' }, '&.Mui-active': {
                          color: '#f8f9fa',
                          '& .MuiTableSortLabel-icon': {
                            transform: sortConfig.direction === 'ascending' ? 'rotate(180deg)' : 'rotate(0deg)',
                          }
                        },
                        '& .MuiTableSortLabel-icon': { color: 'inherit !important' },
                      }}
                    >
                      {headCell.label}
                      {sortConfig.key === headCell.id ? (
                        <Box component="span" sx={visuallyHidden}>
                          {sortConfig.direction === 'descending' ? 'sorted descending' : 'sorted ascending'}
                        </Box>
                      ) : null}
                    </TableSortLabel>
                  )}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredInvoices.length > 0 ? (
              filteredInvoices.map((invoice) => (
                <TableRow
                  key={invoice.id}
                  sx={{
                    '&:hover': { backgroundColor: '#f1f3f5' },
                    '&:last-child td, &:last-child th': { border: 0 },
                    backgroundColor: selectedIds.has(invoice.id) ? 'rgba(25, 118, 210, 0.08)' : 'inherit',
                  }}
                >
                  <TableCell padding="checkbox" sx={{ borderBottom: '1px solid #e0e6eb' }}>
                    <Checkbox
                      checked={selectedIds.has(invoice.id)}
                      onChange={() => handleToggleSelect(invoice.id)}
                    />
                  </TableCell>
                  <TableCell sx={{ padding: '12px', borderBottom: '1px solid #e0e6eb' }}>
                    <Link component="button" variant="body2" sx={{ fontWeight: 'bold' }} onClick={() => handleRoomClick(invoice.room?.number)}>
                      {invoice.room?.number || 'N/A'}
                    </Link>
                  </TableCell>
                  <TableCell sx={{ padding: '12px', borderBottom: '1px solid #e0e6eb' }}>
                    <Link component="button" variant="body2" sx={{ fontWeight: 'bold' }} onClick={() => handleInvoiceClick(invoice.id)}>
                      {invoice.id}
                    </Link>
                  </TableCell>
                  <TableCell sx={{ padding: '12px', borderBottom: '1px solid #e0e6eb' }}>{invoice.issueDate}</TableCell>
                  <TableCell sx={{ padding: '12px', borderBottom: '1px solid #e0e6eb' }}>{invoice.dueDate}</TableCell>
                  <TableCell sx={{ padding: '12px', borderBottom: '1px solid #e0e6eb' }}>{formatCurrency(invoice.totalBaht)}</TableCell>
                  <TableCell sx={{ padding: '12px', borderBottom: '1px solid #e0e6eb' }}>{renderStatusChip(invoice)}</TableCell>
                  <TableCell sx={{ padding: '12px', borderBottom: '1px solid #e0e6eb' }}>
                    <Box sx={{ display: 'flex', justifyContent: 'center', gap: 0.5 }}>
                      <Tooltip title="Edit Invoice">
                        <IconButton onClick={() => handleEdit(invoice)} size="small">
                          <EditIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Print Preview">
                        <IconButton onClick={() => setInvoiceToPrint(invoice)} size="small"><PrintIcon /></IconButton>
                      </Tooltip>
                      <Tooltip title="Download PDF">
                         <IconButton onClick={() => openInvoice(invoice.id, 'pdf')} size="small"><PictureAsPdfIcon /></IconButton>
                      </Tooltip>
                    </Box>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={headCells.length} sx={{ textAlign: 'center', py: 3 }}>
                  No invoices found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

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
      <EditInvoiceModal
        open={openEdit}
        onClose={() => setOpenEdit(false)}
        invoiceId={selectedInvoice?.id}
        onSaved={() => {
        setOpenEdit(false);
        loadInvoices();
        }}
      />

      <CsvImportModal
        open={openCsvImport}
        onClose={() => setOpenCsvImport(false)}
        onSuccess={() => {
          setOpenCsvImport(false);
          loadInvoices();
        }}
      />

      <InvoiceSettingsModal
        open={openSettings}
        onClose={() => setOpenSettings(false)}
        onSuccess={() => {
          setOpenSettings(false);
        }}
      />

    </>
  );
};

export default InvoiceHistory;
