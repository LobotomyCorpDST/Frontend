import React, { useState, useEffect, useMemo } from 'react';
import {
    Box,
    Paper,
    Typography,
    Button,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableRow,
    IconButton,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogContentText,
    DialogActions,
    Alert,
    CircularProgress,
    Chip,
    Stack,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';

import { getAllUsers, deleteUser } from '../../api/user';
import CreateUserModal from './CreateUserModal';
import EditUserModal from './EditUserModal';
import EnhancedSearchBar from '../Common/EnhancedSearchBar';
import StandardTableHeader from '../Common/StandardTableHeader';
import StandardPagination from '../Common/StandardPagination';

const headCells = [
    { id: 'id', label: 'ID' },
    { id: 'username', label: 'Username' },
    { id: 'role', label: 'Role' },
    { id: 'roomNumber', label: 'เลขห้อง', disableSorting: true },
    { id: 'actions', label: 'การดำเนินการ', disableSorting: true, align: 'center' },
];

const UserManagement = (props) => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [openCreate, setOpenCreate] = useState(false);
    const [selectedUserId, setSelectedUserId] = useState(null);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [userToDelete, setUserToDelete] = useState(null);

    // Unified search state
    const [searchTerm, setSearchTerm] = useState('');
    const [searchType, setSearchType] = useState(''); // 'partial' or 'exact'

    // Sorting state (default: ID descending)
    const [sortConfig, setSortConfig] = useState({ key: 'id', direction: 'descending' });

    // Pagination state
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(50);

    const loadUsers = async () => {
        setLoading(true);
        setError('');
        try {
            const response = await getAllUsers();
            const userData = response?.data || response || [];
            setUsers(Array.isArray(userData) ? userData : []);
        } catch (e) {
            setError(e?.response?.data?.error || e.message || 'Failed to load users');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadUsers();
    }, []);

    const handleDeleteClick = (user) => {
        setUserToDelete(user);
        setDeleteDialogOpen(true);
    };

    const handleDeleteConfirm = async () => {
        if (!userToDelete) return;

        try {
            await deleteUser(userToDelete.id);
            setDeleteDialogOpen(false);
            setUserToDelete(null);
            await loadUsers();
        } catch (e) {
            const errorMsg = e?.response?.data?.error || e.message || 'Failed to delete user';
            setError(errorMsg);
            setDeleteDialogOpen(false);
        }
    };

    const getRoleColor = (role) => {
        switch (role?.toUpperCase()) {
            case 'ADMIN':
                return 'error';
            case 'STAFF':
                return 'warning';
            case 'USER':
                return 'info';
            case 'GUEST':
                return 'success';
            default:
                return 'default';
        }
    };

    // Sorting logic
    const handleRequestSort = (property) => {
        const isAsc = sortConfig.key === property && sortConfig.direction === 'ascending';
        setSortConfig({ key: property, direction: isAsc ? 'descending' : 'ascending' });
        setPage(0); // Reset to first page when sorting changes
    };

    const sortedUsers = useMemo(() => {
        const list = [...users];
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
    }, [users, sortConfig]);

    // Convert users to searchable options for smart search
    const searchOptions = useMemo(() => {
        return sortedUsers.map((user) => ({
            id: user.id,
            label: `${user.username} (${user.role})${user.roomNumber ? ` - ห้อง ${user.roomNumber}` : ''}`,
            value: user.id,
            searchText: `${user.id} ${user.username} ${user.role} ${user.roomNumber || ''}`,
        }));
    }, [sortedUsers]);

    // Filter users based on unified search
    const filteredUsers = useMemo(() => {
        let result = sortedUsers;

        if (!searchTerm) return result;

        // Exact match (selected from dropdown)
        if (searchType === 'exact') {
            result = result.filter((user) => user.id === searchTerm);
        }
        // Partial match (Enter key - search across multiple fields)
        else if (searchType === 'partial') {
            const searchLower = searchTerm.toLowerCase();
            result = result.filter((user) => {
                const userId = String(user.id || '');
                const username = String(user.username || '');
                const role = String(user.role || '');
                const roomNumber = String(user.roomNumber || '');
                return (
                    userId.includes(searchLower) ||
                    username.toLowerCase().includes(searchLower) ||
                    role.toLowerCase().includes(searchLower) ||
                    roomNumber.includes(searchLower)
                );
            });
        }

        return result;
    }, [sortedUsers, searchTerm, searchType]);

    // Paginated users (apply after filtering and sorting)
    const paginatedUsers = useMemo(() => {
        const start = page * rowsPerPage;
        return filteredUsers.slice(start, start + rowsPerPage);
    }, [filteredUsers, page, rowsPerPage]);

    if (loading) {
        return (
            <Box
                sx={{ p: 3, display: 'flex', justifyContent: 'center', alignItems: 'center' }}
                data-cy="user-management-loading-state"
            >
                <CircularProgress /> <Typography sx={{ ml: 2 }}>กำลังโหลดข้อมูลผู้ใช้...</Typography>
            </Box>
        );
    }

    return (
        <Box sx={{ p: 3 }} {...props} data-cy="user-management-page">
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography
                    variant="h5"
                    component="h2"
                    data-cy="user-management-title"
                >
                    จัดการผู้ใช้
                </Typography>
                <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={() => setOpenCreate(true)}
                    sx={{ borderRadius: 2 }}
                    data-cy="user-management-create-user-button"
                >
                    สร้างผู้ใช้ใหม่
                </Button>
            </Box>

            {error && (
                <Alert
                    severity="error"
                    sx={{ mb: 2 }}
                    onClose={() => setError('')}
                    data-cy="user-management-error-alert"
                >
                    {error}
                </Alert>
            )}

            {/* Unified Search Bar */}
            <EnhancedSearchBar
                onSearch={({ type, value }) => {
                    setSearchTerm(value);
                    setSearchType(type);
                    setPage(0); // Reset to first page
                }}
                searchOptions={searchOptions}
                searchLabel="ค้นหาผู้ใช้"
                searchPlaceholder="พิมพ์ username, role, หรือเลขห้อง (กด Enter เพื่อค้นหา หรือเลือกจากรายการ)"
                data-cy="user-management-search-bar"
            />

            <TableContainer
                component={Paper}
                sx={{
                    marginTop: '20px',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)',
                    overflowX: 'auto',
                }}
                data-cy="user-management-table-container"
            >
                <Table sx={{ minWidth: 650 }} aria-label="user management table" data-cy="user-management-table">
                    <StandardTableHeader
                        columns={headCells}
                        sortConfig={sortConfig}
                        onRequestSort={handleRequestSort}
                        data-cy="user-management-table-header"
                    />
                    <TableBody data-cy="user-management-table-body">
                        {paginatedUsers.length > 0 ? (
                            paginatedUsers.map((user) => (
                                <TableRow
                                    key={user.id}
                                    sx={{
                                        '&:hover': { backgroundColor: '#f1f3f5' },
                                        '&:last-child td, &:last-child th': { border: 0 },
                                    }}
                                    data-cy={`user-management-row-${user.id}`}
                                >
                                    <TableCell
                                        sx={{ padding: '12px', borderBottom: '1px solid #e0e6eb' }}
                                        data-cy={`user-management-cell-id-${user.id}`}
                                    >
                                        {user.id}
                                    </TableCell>
                                    <TableCell
                                        sx={{ padding: '12px', borderBottom: '1px solid #e0e6eb' }}
                                        data-cy={`user-management-cell-username-${user.id}`}
                                    >
                                        <Typography variant="body2" fontWeight={500}>
                                            {user.username}
                                        </Typography>
                                    </TableCell>
                                    <TableCell
                                        sx={{ padding: '12px', borderBottom: '1px solid #e0e6eb' }}
                                        data-cy={`user-management-cell-role-${user.id}`}
                                    >
                                        <Chip
                                            label={user.role}
                                            color={getRoleColor(user.role)}
                                            size="small"
                                            data-cy={`user-management-role-chip-${user.id}`}
                                        />
                                    </TableCell>
                                    <TableCell
                                        sx={{ padding: '12px', borderBottom: '1px solid #e0e6eb' }}
                                        data-cy={`user-management-cell-room-${user.id}`}
                                    >
                                        {user.roomNumbers ? (
                                            <Chip
                                                label={`ห้อง ${user.roomNumbers}`}
                                                size="small"
                                                variant="outlined"
                                                data-cy={`user-management-room-chip-${user.id}`}
                                            />
                                        ) : (
                                            <Typography variant="body2" color="text.secondary">
                                                -
                                            </Typography>
                                        )}
                                    </TableCell>
                                    <TableCell
                                        align="center"
                                        sx={{ padding: '12px', borderBottom: '1px solid #e0e6eb' }}
                                        data-cy={`user-management-cell-actions-${user.id}`}
                                    >
                                        <Stack direction="row" spacing={1} justifyContent="center">
                                            <IconButton
                                                size="small"
                                                color="primary"
                                                onClick={() => setSelectedUserId(user.id)}
                                                title="แก้ไขผู้ใช้"
                                                data-cy={`user-management-edit-button-${user.id}`}
                                            >
                                                <EditIcon fontSize="small" />
                                            </IconButton>
                                            <IconButton
                                                size="small"
                                                color="error"
                                                onClick={() => handleDeleteClick(user)}
                                                title="ลบผู้ใช้"
                                                data-cy={`user-management-delete-button-${user.id}`}
                                            >
                                                <DeleteIcon fontSize="small" />
                                            </IconButton>
                                        </Stack>
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow data-cy="user-management-no-data-row">
                                <TableCell colSpan={5} align="center" sx={{ py: 3, color: 'text.secondary' }}>
                                    ไม่พบข้อมูลผู้ใช้
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>

                {/* Pagination */}
                {filteredUsers.length > 0 && (
                    <StandardPagination
                        count={filteredUsers.length}
                        page={page}
                        rowsPerPage={rowsPerPage}
                        onPageChange={(event, newPage) => setPage(newPage)}
                        onRowsPerPageChange={(event) => {
                            setRowsPerPage(parseInt(event.target.value, 10));
                            setPage(0);
                        }}
                        data-cy="user-management-pagination"
                    />
                )}
            </TableContainer>

            {/* Create User Modal */}
            {openCreate && (
                <CreateUserModal
                    open={openCreate}
                    onClose={() => setOpenCreate(false)}
                    onCreated={() => {
                        setOpenCreate(false);
                        loadUsers();
                    }}
                    data-cy="user-management-create-modal"
                />
            )}

            {/* Edit User Modal */}
            {selectedUserId && (
                <EditUserModal
                    open={!!selectedUserId}
                    userId={selectedUserId}
                    onClose={() => setSelectedUserId(null)}
                    onUpdated={() => {
                        setSelectedUserId(null);
                        loadUsers();
                    }}
                    data-cy="user-management-edit-modal"
                />
            )}

            {/* Delete Confirmation Dialog */}
            <Dialog
                open={deleteDialogOpen}
                onClose={() => setDeleteDialogOpen(false)}
                data-cy="user-management-delete-confirm-dialog"
            >
                <DialogTitle data-cy="user-management-delete-confirm-title">
                    ยืนยันการลบผู้ใช้
                </DialogTitle>
                <DialogContent>
                    <DialogContentText data-cy="user-management-delete-confirm-text">
                        คุณแน่ใจหรือไม่ว่าต้องการลบผู้ใช้{' '}
                        <strong>{userToDelete?.username}</strong> ({userToDelete?.role})?
                        <br />
                        <br />
                        การดำเนินการนี้ไม่สามารถย้อนกลับได้
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button
                        onClick={() => setDeleteDialogOpen(false)}
                        data-cy="user-management-delete-confirm-cancel-button"
                    >
                        ยกเลิก
                    </Button>
                    <Button
                        onClick={handleDeleteConfirm}
                        color="error"
                        variant="contained"
                        data-cy="user-management-delete-confirm-submit-button"
                    >
                        ลบ
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default UserManagement;