// src/components/LeaseHistory/LeaseHistory.js
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
    Box, Paper, Typography, Button, Table, TableBody, CircularProgress, Alert, Stack, Checkbox, Toolbar, Tooltip, TableRow, TableCell
} from '@mui/material';
import PrintIcon from '@mui/icons-material/Print';
import { getAllLeases, settleLease, openLease, bulkPrintLeases, updateLease } from '../../api/lease';
import CreateLeaseModal from '../Lease/CreateLeaseModal';
import LeaseEditModal from './LeaseEditModal';
import EnhancedSearchBar from '../Common/EnhancedSearchBar';
import StandardTableHeader from '../Common/StandardTableHeader';
import StandardPagination from '../Common/StandardPagination';

const fmt = (d) => {
    if (!d) return '-';
    try { return new Date(d).toISOString().slice(0, 10); } catch { return d; }
};

// Thai status translation
const translateStatus = (status) => {
    const statusMap = {
        'ACTIVE': 'อยู่ในระยะสัญญา',
        'ENDED': 'ครบกำหนดสัญญา'
    };
    return statusMap[status?.toUpperCase()] || status || '-';
};

// Thai settled translation
const translateSettled = (settled, settledDate) => {
    if (settled) {
        return `คืนแล้ว (${fmt(settledDate)})`;
    }
    return 'ยังไม่คืนเงิน';
};

const LeaseHistory = ({
    leaseHistoryReloadSignal,
    leaseHistoryCreateSignal,
    onLeaseHistoryLoadingChange = () => {},
    ...props
}) => {
    const [allRows, setAllRows] = useState([]);
    const [loading, setLoading] = useState(false);
    const [err, setErr] = useState('');
    const [markingId, setMarkingId] = useState(null);
    const [printingId, setPrintingId] = useState(null);
    const [togglingId, setTogglingId] = useState(null);

    // Unified search state
    const [searchTerm, setSearchTerm] = useState('');
    const [searchType, setSearchType] = useState('');

    // Sorting state (default: ID descending)
    const [sortConfig, setSortConfig] = useState({ key: 'id', direction: 'descending' });

    // Pagination state
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(50);

    // create modal
    const [openCreate, setOpenCreate] = useState(false);

    // edit modal
    const [openEdit, setOpenEdit] = useState(false);
    const [editLeaseId, setEditLeaseId] = useState(null);

    // Bulk selection state
    const [selectedIds, setSelectedIds] = useState(new Set());
    const [bulkPrinting, setBulkPrinting] = useState(false);
    const [bulkError, setBulkError] = useState('');

    const loadAll = useCallback(async () => {
        setLoading(true);
        onLeaseHistoryLoadingChange(true);
        setErr('');
        try {
            const data = await getAllLeases();
            setAllRows(Array.isArray(data) ? data : []);
        } catch (e) {
            setErr(e?.message || 'Load leases failed');
        } finally {
            setLoading(false);
            onLeaseHistoryLoadingChange(false);
        }
    }, [onLeaseHistoryLoadingChange]);

    useEffect(() => { loadAll(); }, [loadAll]);

    const reloadSignalRef = useRef(leaseHistoryReloadSignal);
    useEffect(() => {
        if (leaseHistoryReloadSignal == null) return;
        if (reloadSignalRef.current !== leaseHistoryReloadSignal) {
            reloadSignalRef.current = leaseHistoryReloadSignal;
            loadAll();
        }
    }, [leaseHistoryReloadSignal, loadAll]);

    const createSignalRef = useRef(leaseHistoryCreateSignal);
    useEffect(() => {
        if (leaseHistoryCreateSignal == null) return;
        if (createSignalRef.current !== leaseHistoryCreateSignal) {
            createSignalRef.current = leaseHistoryCreateSignal;
            setOpenCreate(true);
        }
    }, [leaseHistoryCreateSignal]);

    // Sorting logic
    const handleRequestSort = (property) => {
        const isAsc = sortConfig.key === property && sortConfig.direction === 'ascending';
        setSortConfig({ key: property, direction: isAsc ? 'descending' : 'ascending' });
        setPage(0); // Reset to first page when sorting changes
    };

    const sortedLeases = useMemo(() => {
        const list = [...allRows];
        if (!sortConfig.key) return list;

        return list.sort((a, b) => {
            const dir = sortConfig.direction === 'ascending' ? 1 : -1;
            const aVal = sortConfig.key === 'roomNumber' ? a.room?.number : a[sortConfig.key];
            const bVal = sortConfig.key === 'roomNumber' ? b.room?.number : b[sortConfig.key];

            if (aVal == null && bVal == null) return 0;
            if (aVal == null) return 1;
            if (bVal == null) return -1;

            if (typeof aVal === 'string' && typeof bVal === 'string') {
                return dir * aVal.localeCompare(bVal);
            }
            if (aVal < bVal) return -1 * dir;
            if (aVal > bVal) return 1 * dir;
            return 0;
        });
    }, [allRows, sortConfig]);

    // Convert leases to searchable options for smart search
    const searchOptions = useMemo(() => {
        return sortedLeases.map((lease) => ({
            id: lease.id,
            label: `สัญญาเช่า #${lease.id} - ห้อง ${lease.room?.number ?? '-'} - ${lease.tenant?.name ?? '-'}`,
            value: lease.id,
            searchText: `${lease.id} ${lease.room?.number ?? ''} ${lease.tenant?.name ?? ''}`,
        }));
    }, [sortedLeases]);

    // Filter leases based on unified search
    const filteredLeases = useMemo(() => {
        let result = sortedLeases;

        if (searchTerm) {
            if (searchType === 'exact') {
                // Exact match (from SmartSearch autocomplete)
                result = result.filter(l => l.id === searchTerm);
            } else if (searchType === 'partial') {
                // Partial match (from QuickSearch text input)
                const searchLower = String(searchTerm).toLowerCase();
                result = result.filter((l) => {
                    const roomNum = String(l.room?.number || '');
                    const leaseId = String(l.id || '');
                    const tenantName = String(l.tenant?.name || '');
                    return (
                        roomNum.includes(searchLower) ||
                        leaseId.includes(searchLower) ||
                        tenantName.toLowerCase().includes(searchLower)
                    );
                });
            }
        }

        return result;
    }, [sortedLeases, searchTerm, searchType]);

    // Paginated leases (apply after filtering and sorting)
    const paginatedLeases = useMemo(() => {
        const start = page * rowsPerPage;
        return filteredLeases.slice(start, start + rowsPerPage);
    }, [filteredLeases, page, rowsPerPage]);

    const onMarkSettled = async (id, e) => {
        if (e) e.stopPropagation();
        try {
            setMarkingId(id);
            await settleLease(id, fmt(new Date()));
            await loadAll();
        } catch (e) {
            setErr(e?.message || 'Mark settled failed');
        } finally {
            setMarkingId(null);
        }
    };

    const onPrint = async (id, e) => {
        if (e) e.stopPropagation();
        try {
            setPrintingId(id);
            await openLease(id);
        } catch (e) {
            setErr(e?.message || 'เปิดสัญญาเพื่อพิมพ์ไม่สำเร็จ');
        } finally {
            setPrintingId(null);
        }
    };

    const openForEdit = (id) => {
        setEditLeaseId(id);
        setOpenEdit(true);
    };

    const handleToggleLeaseStatus = async (id, currentStatus, e) => {
        if (e) e.stopPropagation();
        try {
            setTogglingId(id);
            const newStatus = currentStatus === 'ACTIVE' ? 'ENDED' : 'ACTIVE';
            await updateLease(id, { status: newStatus });
            await loadAll();
        } catch (e) {
            setErr(e?.message || 'Toggle lease status failed');
        } finally {
            setTogglingId(null);
        }
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
        if (paginatedLeases.every(l => selectedIds.has(l.id))) {
            // Deselect all on current page
            setSelectedIds((prev) => {
                const newSet = new Set(prev);
                paginatedLeases.forEach(l => newSet.delete(l.id));
                return newSet;
            });
        } else {
            // Select all on current page
            setSelectedIds((prev) => {
                const newSet = new Set(prev);
                paginatedLeases.forEach(l => newSet.add(l.id));
                return newSet;
            });
        }
    };

    const handleSelectAllFiltered = () => {
        // Select all filtered results (across all pages)
        setSelectedIds(new Set(filteredLeases.map((l) => l.id)));
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
            await bulkPrintLeases(Array.from(selectedIds));
            handleClearSelection();
        } catch (error) {
            setBulkError(error?.message || 'Failed to print leases');
        } finally {
            setBulkPrinting(false);
        }
    };

    return (
        <Box sx={{ p: 3 }} {...props} data-cy="lease-history-page">
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
                    data-cy="lease-history-bulk-toolbar"
                >
                    <Typography
                        sx={{ flex: '1 1 100%' }}
                        variant="subtitle1"
                        component="div"
                        data-cy="lease-history-bulk-selected-count"
                    >
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
                            data-cy="lease-history-bulk-print-button"
                        >
                            {bulkPrinting ? 'กำลังพิมพ์...' : `พิมพ์ (${selectedIds.size})`}
                        </Button>
                    </Tooltip>
                    <Button
                        variant="outlined"
                        color="inherit"
                        onClick={handleClearSelection}
                        sx={{ mr: 1 }}
                        data-cy="lease-history-bulk-clear-button"
                    >
                        ล้างการเลือก
                    </Button>
                    {filteredLeases.length > selectedIds.size && (
                        <Button
                            variant="outlined"
                            color="inherit"
                            onClick={handleSelectAllFiltered}
                            data-cy="lease-history-bulk-select-all-filtered-button"
                        >
                            เลือกทั้งหมด ({filteredLeases.length})
                        </Button>
                    )}
                </Toolbar>
            )}

            {/* Bulk error message */}
            {bulkError && (
                <Alert
                    severity="error"
                    onClose={() => setBulkError('')}
                    sx={{ mb: 2 }}
                    data-cy="lease-history-bulk-error-alert"
                >
                    {bulkError}
                </Alert>
            )}

            {loading && (
                <Box
                    sx={{ display: 'flex', justifyContent: 'center', my: 4 }}
                    data-cy="lease-history-loading-state"
                >
                    <CircularProgress />
                    <Typography
                        sx={{ ml: 2 }}
                        data-cy="lease-history-loading-text"
                    >
                        กำลังโหลดสัญญาเช่า...
                    </Typography>
                </Box>
            )}
            {err && (
                <Alert
                    severity="error"
                    sx={{ mb: 2 }}
                    data-cy="lease-history-error-alert"
                >
                    {err}
                </Alert>
            )}

            {/* Enhanced Search (Unified Quick + Smart) */}
            {!loading && (
                <EnhancedSearchBar
                    onSearch={({ type, value }) => {
                        setSearchTerm(value);
                        setSearchType(type);
                        setPage(0);
                    }}
                    searchOptions={searchOptions}
                    searchLabel="ค้นหาสัญญาเช่าแบบเฉพาะเจาะจง"
                    searchPlaceholder="พิมพ์เลขห้อง, เลข Lease, หรือชื่อผู้เช่า แล้วกด Enter..."
                    data-cy="lease-history-search-bar"
                />
            )}

            {!loading && paginatedLeases.length > 0 && (
                <Paper data-cy="lease-history-table-container">
                    <Table>
                        <StandardTableHeader
                            data-cy="lease-history-table-header"
                            columns={[
                                { id: 'select', label: '', disableSorting: true, renderHeader: () => (
                                        <Checkbox
                                            indeterminate={selectedIds.size > 0 && !paginatedLeases.every(l => selectedIds.has(l.id))}
                                            checked={paginatedLeases.length > 0 && paginatedLeases.every(l => selectedIds.has(l.id))}
                                            onChange={handleSelectAll}
                                            sx={{ color: '#f8f9fa', '&.Mui-checked': { color: '#f8f9fa' } }}
                                            data-cy="lease-history-header-select-all-checkbox"
                                        />
                                    )},
                                { id: 'roomNumber', label: 'ห้อง' },
                                { id: 'tenant', label: 'ผู้เช่าอาศัย' },
                                { id: 'startDate', label: 'เริ่ม' },
                                { id: 'endDate', label: 'สิ้นสุด' },
                                { id: 'status', label: 'สถานะ' },
                                { id: 'settled', label: 'เงินมัดจำ' },
                                { id: 'actions', label: 'การดำเนินการ', disableSorting: true, align: 'right' },
                            ]}
                            sortConfig={sortConfig}
                            onRequestSort={handleRequestSort}
                        />
                        <TableBody>
                            {paginatedLeases.map((l) => (
                                <TableRow
                                    key={l.id}
                                    hover
                                    sx={{
                                        cursor: 'pointer',
                                        backgroundColor: selectedIds.has(l.id) ? 'rgba(25, 118, 210, 0.08)' : 'inherit',
                                    }}
                                    onClick={() => openForEdit(l.id)}
                                    data-cy={`lease-history-row-${l.id}`}
                                >
                                    <TableCell padding="checkbox" onClick={(e) => e.stopPropagation()}>
                                        <Checkbox
                                            checked={selectedIds.has(l.id)}
                                            onChange={() => handleToggleSelect(l.id)}
                                            data-cy={`lease-history-row-select-checkbox-${l.id}`}
                                        />
                                    </TableCell>
                                    <TableCell data-cy={`lease-history-row-room-${l.id}`}>{l.room?.number ?? '-'}</TableCell>
                                    <TableCell data-cy={`lease-history-row-tenant-${l.id}`}>{l.tenant?.name || '-'}</TableCell>
                                    <TableCell data-cy={`lease-history-row-start-date-${l.id}`}>{fmt(l.startDate)}</TableCell>
                                    <TableCell data-cy={`lease-history-row-end-date-${l.id}`}>{fmt(l.endDate)}</TableCell>
                                    <TableCell data-cy={`lease-history-row-status-${l.id}`}>{translateStatus(l.status)}</TableCell>
                                    <TableCell data-cy={`lease-history-row-settled-${l.id}`}>
                                        <Typography variant="body2">
                                            {translateSettled(l.settled, l.settledDate)}
                                        </Typography>
                                    </TableCell>
                                    <TableCell
                                        align="right"
                                        onClick={(e) => e.stopPropagation()}
                                        data-cy={`lease-history-row-actions-${l.id}`}
                                    >
                                        <Stack direction="row" spacing={1} justifyContent="flex-end">
                                            <Button
                                                size="small"
                                                onClick={(e) => onPrint(l.id, e)}
                                                disabled={printingId === l.id}
                                                data-cy={`lease-history-row-print-button-${l.id}`}
                                            >
                                                {printingId === l.id ? 'กำลังเปิด' : 'พิมพ์'}
                                            </Button>

                                            <Button
                                                size="small"
                                                variant="outlined"
                                                color="primary"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    openForEdit(l.id);
                                                }}
                                                data-cy={`lease-history-row-edit-button-${l.id}`}
                                            >
                                                แก้ไข
                                            </Button>
                                        </Stack>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>

                    {/* Pagination */}
                    {filteredLeases.length > 0 && (
                        <StandardPagination
                            count={filteredLeases.length}
                            page={page}
                            rowsPerPage={rowsPerPage}
                            onPageChange={(event, newPage) => setPage(newPage)}
                            onRowsPerPageChange={(event) => {
                                setRowsPerPage(parseInt(event.target.value, 10));
                                setPage(0);
                            }}
                            data-cy="lease-history-pagination"
                        />
                    )}
                </Paper>
            )}

            {!loading && !err && filteredLeases.length === 0 && (
                <Typography
                    color="text.secondary"
                    sx={{ mt: 2, textAlign: 'center' }}
                    data-cy="lease-history-no-data-message"
                >
                    ไม่พบข้อมูล
                </Typography>
            )}

            <CreateLeaseModal
                open={openCreate}
                onClose={() => setOpenCreate(false)}
                onSuccess={async () => {
                    setOpenCreate(false);
                    await loadAll();
                }}
                data-cy="lease-history-create-lease-modal"
            />

            <LeaseEditModal
                open={openEdit}
                leaseId={editLeaseId}
                onClose={() => { setOpenEdit(false); setEditLeaseId(null); }}
                onSaved={async () => { setOpenEdit(false); setEditLeaseId(null); await loadAll(); }}
                data-cy="lease-history-edit-lease-modal"
            />
        </Box>
    );
};

export default LeaseHistory;
