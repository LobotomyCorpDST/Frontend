import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Button, Stack, Box, Table, TableBody, TableCell, TableContainer, TableRow, Paper,
    CircularProgress, Typography, Dialog, DialogTitle, DialogContent, DialogActions, IconButton,
    Tooltip
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import CreateTenantModal from './CreateTenantModal';
import EditTenantModal from '../TenantDetail/EditTenantModal';
import { listTenantsWithRooms, deleteTenant } from '../../api/tenant';
import EnhancedSearchBar from '../Common/EnhancedSearchBar';
import StandardTableHeader from '../Common/StandardTableHeader';
import StandardPagination from '../Common/StandardPagination';

const TenantList = ({ addTenantSignal, ...props }) => {
    const navigate = useNavigate();
    const [tenants, setTenants] = useState([]);

    // Unified search state
    const [searchTerm, setSearchTerm] = useState('');
    const [searchType, setSearchType] = useState('');

    // Sorting state (default: ID descending)
    const [sortConfig, setSortConfig] = useState({ key: 'id', direction: 'descending' });

    // Pagination state
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(50);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [openCreate, setOpenCreate] = useState(false);
    const [selectedTenantId, setSelectedTenantId] = useState(null);

    // Delete confirmation dialog
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [tenantToDelete, setTenantToDelete] = useState(null);

    useEffect(() => {
        if (addTenantSignal) setOpenCreate(true);
    }, [addTenantSignal]);

    const loadTenants = async () => {
        setLoading(true);
        setError('');
        try {
            const tenantData = await listTenantsWithRooms();
            setTenants(tenantData);
        } catch (e) {
            setError(e.message || 'Failed to load tenants');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadTenants();
    }, []);

    const handleRequestSort = (property) => {
        const isAsc = sortConfig.key === property && sortConfig.direction === 'ascending';
        setSortConfig({ key: property, direction: isAsc ? 'descending' : 'ascending' });
        setPage(0); // Reset to first page when sorting changes
    };

    const sortedTenants = useMemo(() => {
        const list = [...tenants];
        if (!sortConfig.key) return list;
        const dir = sortConfig.direction === 'ascending' ? 1 : -1;

        return list.sort((a, b) => {
            const valA = a[sortConfig.key] || '';
            const valB = b[sortConfig.key] || '';

            if (typeof valA === 'string' && typeof valB === 'string') {
                return dir * valA.localeCompare(valB);
            }
            if (valA < valB) return -1 * dir;
            if (valA > valB) return 1 * dir;
            return 0;
        });
    }, [tenants, sortConfig]);

    // Convert tenants to searchable options for smart search
    const searchOptions = useMemo(() => {
        return sortedTenants.map((tenant) => ({
            id: tenant.id,
            label: `${tenant.name} (${tenant.phone})`,
            value: tenant.id,
            searchText: `${tenant.id} ${tenant.name} ${tenant.phone} ${tenant.lineId || ''} ${tenant.roomNumbers?.join(' ') || ''}`,
        }));
    }, [sortedTenants]);

    // Filter tenants based on unified search
    const filteredTenants = useMemo(() => {
        let result = sortedTenants;

        if (!searchTerm) return result;

        if (searchType === 'exact') {
            result = result.filter((tenant) => tenant.id === searchTerm);
        } else if (searchType === 'partial') {
            const searchLower = searchTerm.toLowerCase();
            result = result.filter((tenant) => {
                const tenantId = String(tenant.id || '');
                const tenantName = String(tenant.name || '');
                const phone = String(tenant.phone || '');
                const lineId = String(tenant.lineId || '');
                const rooms = tenant.roomNumbers?.join(' ') || '';
                return (
                    tenantId.includes(searchLower) ||
                    tenantName.toLowerCase().includes(searchLower) ||
                    phone.includes(searchLower) ||
                    lineId.toLowerCase().includes(searchLower) ||
                    rooms.includes(searchLower)
                );
            });
        }

        return result;
    }, [sortedTenants, searchTerm, searchType]);

    // Paginated tenants (apply after filtering and sorting)
    const paginatedTenants = useMemo(() => {
        const start = page * rowsPerPage;
        return filteredTenants.slice(start, start + rowsPerPage);
    }, [filteredTenants, page, rowsPerPage]);

    const handleRowClick = (tenantId) => {
        navigate(`/tenant-details/${tenantId}`);
    };

    const handleEditClick = (tenantId, e) => {
        e.stopPropagation(); // prevent row click navigation
        setSelectedTenantId(tenantId);
    };

    const handleDeleteClick = (tenant, e) => {
        e.stopPropagation();
        setTenantToDelete(tenant);
        setDeleteDialogOpen(true);
    };

    const confirmDelete = async () => {
        if (!tenantToDelete) return;
        try {
            await deleteTenant(tenantToDelete.id);
            setDeleteDialogOpen(false);
            setTenantToDelete(null);
            await loadTenants();
        } catch (e) {
            alert(e.message || 'ลบผู้เช่าไม่สำเร็จ');
        }
    };

    if (loading) {
        return (
            <Box
                sx={{ p: 3, display: 'flex', justifyContent: 'center', alignItems: 'center' }}
                data-cy="tenant-list-loading-state"
            >
                <CircularProgress /> <Typography sx={{ ml: 2 }}>กำลังโหลดข้อมูลผู้เช่า...</Typography>
            </Box>
        );
    }

    if (error) {
        return (
            <Box sx={{ p: 3, textAlign: 'center' }} data-cy="tenant-list-error-state">
                <Typography color="error" data-cy="tenant-list-error-message">
                    เกิดข้อผิดพลาด: {error}
                </Typography>
            </Box>
        );
    }

    return (
        <Box sx={{ p: 3 }} {...props} data-cy="tenant-list-page">
            {/* Unified Search Bar */}
            <EnhancedSearchBar
                onSearch={({ type, value }) => {
                    setSearchTerm(value);
                    setSearchType(type);
                    setPage(0);
                }}
                searchOptions={searchOptions}
                searchLabel="ค้นหาผู้เช่า"
                searchPlaceholder="พิมพ์ชื่อ, เบอร์โทร, หรือเลขห้อง (กด Enter เพื่อค้นหา หรือเลือกจากรายการ)"
                data-cy="tenant-list-search-bar"
            />

            <TableContainer
                component={Paper}
                sx={{
                    marginTop: '20px', borderRadius: '8px',
                    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)', overflowX: 'auto',
                }}
                data-cy="tenant-list-table-container"
            >
                <Table sx={{ minWidth: 650 }} aria-label="tenant list table" data-cy="tenant-list-table">
                    <StandardTableHeader
                        columns={[
                            { id: 'id', label: 'ID ผู้เช่า' },
                            { id: 'name', label: 'ชื่อผู้เช่า' },
                            { id: 'phone', label: 'เบอร์โทร' },
                            { id: 'lineId', label: 'LINE ID' },
                            { id: 'roomNumbers', label: 'เลขห้อง', disableSorting: true },
                            { id: 'actions', label: 'การดำเนินการ', disableSorting: true, align: 'right' },
                        ]}
                        sortConfig={sortConfig}
                        onRequestSort={handleRequestSort}
                        data-cy="tenant-list-table-header"
                    />
                    <TableBody data-cy="tenant-list-table-body">
                        {paginatedTenants.length > 0 ? (
                            paginatedTenants.map((tenant) => (
                                <TableRow
                                    key={tenant.id}
                                    onClick={() => handleRowClick(tenant.id)}
                                    sx={{
                                        cursor: 'pointer',
                                        '&:hover': { backgroundColor: '#f1f3f5' },
                                        '&:last-child td, &:last-child th': { border: 0 },
                                    }}
                                    data-cy={`tenant-list-row-${tenant.id}`}
                                >
                                    <TableCell
                                        sx={{ padding: '12px', borderBottom: '1px solid #e0e6eb' }}
                                        data-cy={`tenant-list-cell-id-${tenant.id}`}
                                    >
                                        {tenant.id}
                                    </TableCell>
                                    <TableCell
                                        sx={{ padding: '12px', borderBottom: '1px solid #e0e6eb' }}
                                        data-cy={`tenant-list-cell-name-${tenant.id}`}
                                    >
                                        {tenant.name}
                                    </TableCell>
                                    <TableCell
                                        sx={{ padding: '12px', borderBottom: '1px solid #e0e6eb' }}
                                        data-cy={`tenant-list-cell-phone-${tenant.id}`}
                                    >
                                        {tenant.phone}
                                    </TableCell>
                                    <TableCell
                                        sx={{ padding: '12px', borderBottom: '1px solid #e0e6eb' }}
                                        data-cy={`tenant-list-cell-line-${tenant.id}`}
                                    >
                                        {tenant.lineId || '-'}
                                    </TableCell>
                                    <TableCell
                                        sx={{
                                            padding: '12px',
                                            borderBottom: '1px solid #e0e6eb',
                                            whiteSpace: 'normal',
                                            wordWrap: 'break-word',
                                            maxWidth: '200px'
                                        }}
                                        data-cy={`tenant-list-cell-rooms-${tenant.id}`}
                                    >
                                        {tenant.roomNumbers && tenant.roomNumbers.length > 0
                                            ? tenant.roomNumbers.map((num) => `ห้อง ${num}`).join(', ')
                                            : 'ไม่มีห้อง'}
                                    </TableCell>
                                    <TableCell
                                        align="right"
                                        sx={{ padding: '12px', borderBottom: '1px solid #e0e6eb' }}
                                        onClick={(e) => e.stopPropagation()} // Prevent row click on actions
                                        data-cy={`tenant-list-cell-actions-${tenant.id}`}
                                    >
                                        <Stack direction="row" spacing={1} >
                                            <Tooltip title="แก้ไขข้อมูลผู้เช่า">
                                                <IconButton
                                                    size="small"
                                                    color="primary"
                                                    onClick={(e) => handleEditClick(tenant.id, e)}
                                                    data-cy={`tenant-list-edit-button-${tenant.id}`}
                                                    aria-label="edit tenant"
                                                >
                                                    <EditIcon fontSize="inherit" />
                                                </IconButton>
                                            </Tooltip>
                                            <Tooltip title="ลบข้อมูลผู้เช่า">
                                                <IconButton
                                                    size="small"
                                                    color="error"
                                                    onClick={(e) => handleDeleteClick(tenant, e)}
                                                    data-cy={`tenant-list-delete-button-${tenant.id}`}
                                                    aria-label="delete tenant"
                                                >
                                                    <DeleteIcon fontSize="inherit" />
                                                </IconButton>
                                            </Tooltip>
                                        </Stack>
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow data-cy="tenant-list-no-data-row">
                                <TableCell colSpan={6} sx={{ textAlign: 'center', py: 3 }}>
                                    ไม่พบข้อมูลผู้เช่า
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>

                {/* Pagination */}
                {filteredTenants.length > 0 && (
                    <StandardPagination
                        count={filteredTenants.length}
                        page={page}
                        rowsPerPage={rowsPerPage}
                        onPageChange={(event, newPage) => setPage(newPage)}
                        onRowsPerPageChange={(event) => {
                            setRowsPerPage(parseInt(event.target.value, 10));
                            setPage(0);
                        }}
                        data-cy="tenant-list-pagination"
                    />
                )}
            </TableContainer>

            {/* Delete Confirmation Dialog */}
            <Dialog
                open={deleteDialogOpen}
                onClose={() => setDeleteDialogOpen(false)}
                maxWidth="xs"
                fullWidth
                data-cy="tenant-list-delete-confirm-dialog"
            >
                <DialogTitle data-cy="tenant-list-delete-confirm-title">
                    ยืนยันการลบผู้เช่า
                </DialogTitle>
                <DialogContent>
                    <Typography data-cy="tenant-list-delete-confirm-text">
                        คุณแน่ใจหรือไม่ที่จะลบผู้เช่า <strong>{tenantToDelete?.name}</strong>?
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                        การดำเนินการนี้ไม่สามารถย้อนกลับได้
                    </Typography>
                </DialogContent>
                <DialogActions>
                    <Button
                        onClick={() => setDeleteDialogOpen(false)}
                        data-cy="tenant-list-delete-confirm-cancel-button"
                    >
                        ยกเลิก
                    </Button>
                    <Button
                        onClick={confirmDelete}
                        color="error"
                        variant="contained"
                        data-cy="tenant-list-delete-confirm-submit-button"
                    >
                        ลบ
                    </Button>
                </DialogActions>
            </Dialog>

            {openCreate && (
                <CreateTenantModal
                    open={openCreate}
                    onClose={() => setOpenCreate(false)}
                    onCreated={loadTenants}
                    data-cy="tenant-list-create-modal"
                />
            )}

            {selectedTenantId && (
                <EditTenantModal
                    open={!!selectedTenantId}
                    tenantId={selectedTenantId}
                    onClose={() => setSelectedTenantId(null)}
                    onUpdated={loadTenants}
                    data-cy="tenant-list-edit-modal"
                />
            )}
        </Box>
    );
};

export default TenantList;
