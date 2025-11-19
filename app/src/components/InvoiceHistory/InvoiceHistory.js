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
import EnhancedSearchBar from '../Common/EnhancedSearchBar';
import StandardPagination from '../Common/StandardPagination';

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
    { id: 'actions', label: 'การดำเนินการ', disableSorting: true },
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
    const statusEn = computeDisplayStatus(inv); // 'Paid' | 'Overdue' | 'Not yet paid'
    const statusMap = {
        'paid': { label: 'ชำระแล้ว', color: 'success' },
        'overdue': { label: 'เกินกำหนด', color: 'error' },
        'not yet paid': { label: 'รอชำระ', color: 'warning' }
    };
    const key = (statusEn || '').toLowerCase();
    const status = statusMap[key] || { label: statusEn, color: 'default' };
    // Add data-cy tag to the chip for status assertion
    return <Chip size="small" label={status.label} color={status.color} data-cy={`invoice-history-row-status-chip-${inv.id}`} />;
}

// ---------- component ----------
const InvoiceHistory = ({ addInvoiceSignal }) => {
    const navigate = useNavigate();
    const [invoices, setInvoices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [sortConfig, setSortConfig] = useState({ key: 'id', direction: 'descending' }); // Default: newest first
    const [invoiceToPrint, setInvoiceToPrint] = useState(null);
    const [openCreate, setOpenCreate] = useState(false);
    const prevSignal = useRef(addInvoiceSignal);
    const [openEdit, setOpenEdit] = useState(false);
    const [selectedInvoice, setSelectedInvoice] = useState(null);

    // Unified search state
    const [searchTerm, setSearchTerm] = useState('');
    const [searchType, setSearchType] = useState('');

    // Pagination state
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(50);

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
        setPage(0); // Reset to first page when sorting changes
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
            label: `ใบแจ้งหนี้ #${inv.id} - ห้อง ${inv.room?.number ?? '-'} - ${formatCurrency(inv.totalBaht)} บาท`,
            value: inv.id,
            searchText: `${inv.id} ${inv.room?.number ?? ''} ${inv.totalBaht ?? ''}`,
        }));
    }, [sortedInvoices]);

    // Filter invoices based on unified search
    const filteredInvoices = useMemo(() => {
        let result = sortedInvoices;

        if (searchTerm) {
            if (searchType === 'exact') {
                // Exact match (from SmartSearch autocomplete)
                result = result.filter((inv) => inv.id === searchTerm);
            } else if (searchType === 'partial') {
                // Partial match (from QuickSearch text input)
                const searchLower = String(searchTerm).toLowerCase();
                result = result.filter((inv) => {
                    const roomNum = String(inv.room?.number || '');
                    const invId = String(inv.id || '');
                    const total = String(inv.totalBaht || '');
                    const tenantName = String(inv.tenant?.name || '');
                    return (
                        roomNum.includes(searchLower) ||
                        invId.includes(searchLower) ||
                        total.includes(searchLower) ||
                        tenantName.toLowerCase().includes(searchLower)
                    );
                });
            }
        }

        return result;
    }, [sortedInvoices, searchTerm, searchType]);

    // Paginated invoices (apply after filtering and sorting)
    const paginatedInvoices = useMemo(() => {
        const start = page * rowsPerPage;
        return filteredInvoices.slice(start, start + rowsPerPage);
    }, [filteredInvoices, page, rowsPerPage]);

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
        // Select all on current page only
        if (selectedIds.size === paginatedInvoices.length && paginatedInvoices.every(inv => selectedIds.has(inv.id))) {
            // Deselect all on current page
            setSelectedIds((prev) => {
                const newSet = new Set(prev);
                paginatedInvoices.forEach(inv => newSet.delete(inv.id));
                return newSet;
            });
        } else {
            // Select all on current page
            setSelectedIds((prev) => {
                const newSet = new Set(prev);
                paginatedInvoices.forEach(inv => newSet.add(inv.id));
                return newSet;
            });
        }
    };

    const handleSelectAllFiltered = () => {
        // Select all filtered results (across all pages)
        setSelectedIds(new Set(filteredInvoices.map((inv) => inv.id)));
        setBulkError('');
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
            <Box sx={{ display: 'flex', justifyContent: 'center', my: 5 }} data-cy="invoice-history-loading-state">
                <CircularProgress data-cy="invoice-history-loading-spinner" /> <Typography sx={{ ml: 2 }}>กำลังโหลดใบแจ้งหนี้...</Typography>
            </Box>
        );
    }

    if (error) {
        return (
            <Box sx={{ p: 3, textAlign: 'center' }} data-cy="invoice-history-error-state">
                <Typography color="error" data-cy="invoice-history-error-message">เกิดข้อผิดพลาด: {error}</Typography>
            </Box>
        );
    }

    return (
        <Box sx={{ p: 3 }} data-cy="invoice-history-page">
            {/* Main action toolbar */}
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mb: 2 }}>
                <Button
                    variant="outlined"
                    startIcon={<UploadFileIcon />}
                    onClick={() => setOpenCsvImport(true)}
                    data-cy="invoice-history-import-csv-button"
                >
                    นำเข้า CSV
                </Button>
                <Button
                    variant="outlined"
                    startIcon={<SettingsIcon />}
                    onClick={() => setOpenSettings(true)}
                    data-cy="invoice-history-settings-button"
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
                    data-cy="invoice-history-bulk-toolbar"
                >
                    <Typography sx={{ flex: '1 1 100%' }} variant="subtitle1" component="div" data-cy="invoice-history-bulk-selected-count">
                        เลือกแล้ว {selectedIds.size} รายการ
                    </Typography>
                    <Tooltip title="พิมพ์ที่เลือก">
                        <Button
                            variant="contained"
                            color="secondary"
                            startIcon={<PrintIcon />}
                            onClick={handleBulkPrint}
                            disabled={bulkPrinting}
                            sx={{ mr: 1 }}
                            data-cy="invoice-history-bulk-print-button"
                        >
                            {bulkPrinting ? 'กำลังพิมพ์...' : `พิมพ์ (${selectedIds.size})`}
                        </Button>
                    </Tooltip>
                    <Button variant="outlined" color="inherit" onClick={handleClearSelection} sx={{ mr: 1 }} data-cy="invoice-history-bulk-clear-button">
                        ล้างการเลือก
                    </Button>
                    <Button variant="outlined" color="inherit" onClick={handleSelectCurrentMonth} data-cy="invoice-history-bulk-select-month-button">
                        เลือกเดือนปัจจุบัน
                    </Button>
                    {filteredInvoices.length > selectedIds.size && (
                        <Button variant="outlined" color="inherit" onClick={handleSelectAllFiltered} sx={{ ml: 1 }} data-cy="invoice-history-bulk-select-all-filtered-button">
                            เลือกทั้งหมด ({filteredInvoices.length})
                        </Button>
                    )}
                </Toolbar>
            )}

            {/* Bulk error message */}
            {bulkError && (
                <Alert severity="error" onClose={() => setBulkError('')} sx={{ mb: 2 }} data-cy="invoice-history-bulk-error-alert">
                    {bulkError}
                </Alert>
            )}

            {/* Enhanced Search (Unified Quick + Smart) */}
            <EnhancedSearchBar
                onSearch={({ type, value }) => {
                    setSearchTerm(value);
                    setSearchType(type);
                    setPage(0);
                }}
                searchOptions={searchOptions}
                searchLabel="ค้นหาใบแจ้งหนี้แบบเฉพาะเจาะจง"
                searchPlaceholder="พิมพ์เลขห้อง, เลข Invoice, หรือจำนวนเงิน แล้วกด Enter..."
                data-cy="invoice-history-search-bar"
            />

            <TableContainer
                component={Paper}
                sx={{
                    marginTop: '20px', borderRadius: '8px',
                    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)', overflowX: 'auto',
                }}
                data-cy="invoice-history-table-container"
            >
                <Table sx={{ minWidth: 650, maxWidth: '96%', mx: 'auto', mb: 2 }} aria-label="invoice history table" data-cy="invoice-history-table">
                    <TableHead>
                        <TableRow>
                            {headCells.map((headCell) => (
                                <TableCell
                                    key={headCell.id}
                                    sx={headerCellStyle}
                                    sortDirection={sortConfig.key === headCell.id ? sortConfig.direction : false}
                                    onClick={() => !headCell.disableSorting && handleRequestSort(headCell.id)}
                                    data-cy={`invoice-history-header-cell-${headCell.id}`}
                                >
                                    {headCell.id === 'select' ? (
                                        <Checkbox
                                            indeterminate={selectedIds.size > 0 && !paginatedInvoices.every(inv => selectedIds.has(inv.id))}
                                            checked={paginatedInvoices.length > 0 && paginatedInvoices.every(inv => selectedIds.has(inv.id))}
                                            onChange={handleSelectAll}
                                            sx={{ color: '#f8f9fa', '&.Mui-checked': { color: '#f8f9fa' } }}
                                            data-cy="invoice-history-header-select-all-checkbox"
                                            inputProps={{ 'aria-label': 'select all invoices on this page' }}
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
                                            data-cy={`invoice-history-header-sort-label-${headCell.id}`}
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
                        {paginatedInvoices.length > 0 ? (
                            paginatedInvoices.map((invoice) => (
                                <TableRow
                                    key={invoice.id}
                                    sx={{
                                        '&:hover': { backgroundColor: '#f1f3f5' },
                                        '&:last-child td, &:last-child th': { border: 0 },
                                        backgroundColor: selectedIds.has(invoice.id) ? 'rgba(25, 118, 210, 0.08)' : 'inherit',
                                    }}
                                    data-cy={`invoice-history-row-${invoice.id}`}
                                >
                                    <TableCell padding="checkbox" sx={{ borderBottom: '1px solid #e0e6eb' }}>
                                        <Checkbox
                                            checked={selectedIds.has(invoice.id)}
                                            onChange={() => handleToggleSelect(invoice.id)}
                                            data-cy={`invoice-history-row-select-checkbox-${invoice.id}`}
                                            inputProps={{ 'aria-label': `select invoice ${invoice.id}` }}
                                        />
                                    </TableCell>
                                    <TableCell sx={{ padding: '12px', borderBottom: '1px solid #e0e6eb' }} data-cy={`invoice-history-row-room-${invoice.id}`}>
                                        <Link component="button" variant="body2" sx={{ fontWeight: 'bold' }} onClick={() => handleRoomClick(invoice.room?.number)} data-cy={`invoice-history-row-room-link-${invoice.id}`}>
                                            {invoice.room?.number || 'N/A'}
                                        </Link>
                                    </TableCell>
                                    <TableCell sx={{ padding: '12px', borderBottom: '1px solid #e0e6eb' }} data-cy={`invoice-history-row-id-${invoice.id}`}>
                                        <Link component="button" variant="body2" sx={{ fontWeight: 'bold' }} onClick={() => handleInvoiceClick(invoice.id)} data-cy={`invoice-history-row-invoice-link-${invoice.id}`}>
                                            {invoice.id}
                                        </Link>
                                    </TableCell>
                                    <TableCell sx={{ padding: '12px', borderBottom: '1px solid #e0e6eb' }} data-cy={`invoice-history-row-issue-date-${invoice.id}`}>{invoice.issueDate}</TableCell>
                                    <TableCell sx={{ padding: '12px', borderBottom: '1px solid #e0e6eb' }} data-cy={`invoice-history-row-due-date-${invoice.id}`}>{invoice.dueDate}</TableCell>
                                    <TableCell sx={{ padding: '12px', borderBottom: '1px solid #e0e6eb' }} data-cy={`invoice-history-row-total-${invoice.id}`}>{formatCurrency(invoice.totalBaht)}</TableCell>
                                    <TableCell sx={{ padding: '12px', borderBottom: '1px solid #e0e6eb' }} data-cy={`invoice-history-row-status-${invoice.id}`}>{renderStatusChip(invoice)}</TableCell>
                                    <TableCell sx={{ padding: '12px', borderBottom: '1px solid #e0e6eb' }} data-cy={`invoice-history-row-actions-${invoice.id}`}>
                                        <Box sx={{ display: 'flex', gap: 0.5 }}>
                                            <Tooltip title="แก้ไขใบแจ้งหนี้">
                                                <IconButton onClick={() => handleEdit(invoice)} size="small" data-cy={`invoice-history-row-edit-button-${invoice.id}`}>
                                                    <EditIcon />
                                                </IconButton>
                                            </Tooltip>
                                            <Tooltip title="พิมพ์">
                                                <IconButton onClick={() => setInvoiceToPrint(invoice)} size="small" data-cy={`invoice-history-row-print-button-${invoice.id}`}><PrintIcon /></IconButton>
                                            </Tooltip>
                                            <Tooltip title="ดาวน์โหลด PDF">
                                                <IconButton onClick={() => openInvoice(invoice.id, 'pdf')} size="small" data-cy={`invoice-history-row-pdf-button-${invoice.id}`}><PictureAsPdfIcon /></IconButton>
                                            </Tooltip>
                                        </Box>
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={headCells.length} sx={{ textAlign: 'center', py: 3 }} data-cy="invoice-history-no-invoices-message">
                                    ไม่พบใบแจ้งหนี้
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>

                {/* Pagination */}
                {filteredInvoices.length > 0 && (
                    <StandardPagination
                        count={filteredInvoices.length}
                        page={page}
                        rowsPerPage={rowsPerPage}
                        onPageChange={(event, newPage) => setPage(newPage)}
                        onRowsPerPageChange={(event) => {
                            setRowsPerPage(parseInt(event.target.value, 10));
                            setPage(0);
                        }}
                        data-cy="invoice-history-pagination"
                    />
                )}
            </TableContainer>

      <Dialog open={Boolean(invoiceToPrint)} onClose={() => setInvoiceToPrint(null)} maxWidth="xs" fullWidth>
        {invoiceToPrint && (
          <>
            <DialogTitle sx={{ textAlign: 'center', fontWeight: 'bold' }}>
              รายละเอียดใบแจ้งหนี้
            </DialogTitle>
            <DialogContent>
              <Grid container spacing={1}>
                <Grid item xs={6}><Typography><strong>เลขห้อง:</strong></Typography></Grid>
                <Grid item xs={6}><Typography data-cy="invoice-history-print-confirm-room">{invoiceToPrint.room?.number}</Typography></Grid>
                <Grid item xs={6}><Typography><strong>ID ใบแจ้งหนี้:</strong></Typography></Grid>
                <Grid item xs={6}><Typography data-cy="invoice-history-print-confirm-id">{invoiceToPrint.id}</Typography></Grid>
                <Grid item xs={6}><Typography><strong>วันออกใบ:</strong></Typography></Grid>
                <Grid item xs={6}><Typography data-cy="invoice-history-print-confirm-issue-date">{invoiceToPrint.issueDate}</Typography></Grid>
                <Grid item xs={6}><Typography><strong>วันกำหนดชำระ:</strong></Typography></Grid>
                <Grid item xs={6}><Typography data-cy="invoice-history-print-confirm-due-date">{invoiceToPrint.dueDate}</Typography></Grid>
                <Grid item xs={6}><Typography><strong>จำนวนเงิน:</strong></Typography></Grid>
                <Grid item xs={6}><Typography data-cy="invoice-history-print-confirm-total-baht">{formatCurrency(invoiceToPrint.totalBaht)} บาท</Typography></Grid>
                <Grid item xs={6}><Typography><strong>สถานะ:</strong></Typography></Grid>
                <Grid item xs={6}>{renderStatusChip(invoiceToPrint)}</Grid>
              </Grid>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setInvoiceToPrint(null)}
                      data-cy="invoice-history-print-confirm-cancel-button">ยกเลิก</Button>
              <Button onClick={handlePrint}
                      variant="contained"
                      data-cy="invoice-history-print-confirm-submit-button">พิมพ์</Button>
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
        data-cy="invoice-history-generate-invoice-modal"
      />
      <EditInvoiceModal
        open={openEdit}
        onClose={() => setOpenEdit(false)}
        invoiceId={selectedInvoice?.id}
        onSaved={() => {
        setOpenEdit(false);
        loadInvoices();
        }}
        data-cy="invoice-history-edit-invoice-modal"
      />

      <CsvImportModal
        open={openCsvImport}
        onClose={() => setOpenCsvImport(false)}
        onSuccess={() => {
          setOpenCsvImport(false);
          loadInvoices();
        }}
        data-cy="invoice-history-csv-import-modal"
      />

      <InvoiceSettingsModal
        open={openSettings}
        onClose={() => setOpenSettings(false)}
        onSuccess={() => {
          setOpenSettings(false);
        }}
        data-cy="invoice-history-settings-modal"
      />
    </Box>
  );
};

export default InvoiceHistory;
