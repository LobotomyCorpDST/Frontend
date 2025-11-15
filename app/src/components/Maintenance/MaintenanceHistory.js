import React, { useEffect, useState, useMemo } from 'react';
import {
    Table, TableBody, TableCell, TableContainer, TableRow,
    Paper, Typography, Chip, Box, Button, CircularProgress
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import { useNavigate } from 'react-router-dom';
import { listMaintenance } from '../../api/maintenance';
import { getRoomByNumber } from '../../api/room';
import EditMaintenanceModal from '../Maintenance/EditMaintenanceModal';
import CreateMaintenanceModal from '../Maintenance/CreateMaintenanceModal';
import EnhancedSearchBar from '../Common/EnhancedSearchBar';
import StandardTableHeader from '../Common/StandardTableHeader';
import StandardPagination from '../Common/StandardPagination';

const formatDate = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;
};

const renderStatus = (status, id) => {
    const chipProps = { size: 'small', 'data-cy': `maintenance-history-status-chip-${id}` };
    switch (status) {
        case 'COMPLETED':
            return <Chip label="เสร็จสิ้น" color="success" {...chipProps} />;
        case 'IN_PROGRESS':
            return <Chip label="กำลังดำเนินการ" color="warning" {...chipProps} />;
        case 'PLANNED':
            return <Chip label="วางแผนแล้ว" color="info" {...chipProps} />;
        default:
            return <Chip label={status || '-'} {...chipProps} />;
    }
};

const headCells = [
    { id: 'id', label: 'หมายเลขอ้างอิง' },
    { id: 'responsiblePerson', label: 'ผู้รับผิดชอบ', disableSorting: true },
    { id: 'costBaht', label: 'ราคา (บาท)', disableSorting: true },
    { id: 'scheduledDate', label: 'กำหนดการ' },
    { id: 'status', label: 'สถานะบำรุง' },
    { id: 'description', label: 'รายละเอียด' },
    { id: 'actions', label: 'การดำเนินการ', disableSorting: true },
];

export default function MaintenanceHistory({ searchTerm: externalSearchTerm, addMaintenanceSignal, userRole, ...props }) {
    const [loading, setLoading] = useState(true);
    const [allMaintenance, setAllMaintenance] = useState([]);
    const [sortConfig, setSortConfig] = useState({ key: 'id', direction: 'descending' });
    const [openEdit, setOpenEdit] = useState(false);
    const [selectedId, setSelectedId] = useState(null);
    const [openCreate, setOpenCreate] = useState(false);

    // Unified search state
    const [searchTerm, setSearchTerm] = useState('');
    const [searchType, setSearchType] = useState('');

    // Pagination state
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(50);

    const navigate = useNavigate();

    // Get user role and room (for USER role filtering)
    const currentUserRole = userRole || (localStorage.getItem('role') || 'GUEST').toUpperCase();
    const currentUserRoomId = localStorage.getItem('room_id'); // For USER role filtering

    // Permission checks
    const canCreate = ['ADMIN', 'USER'].includes(currentUserRole);
    const canEdit = ['ADMIN', 'STAFF'].includes(currentUserRole);
    const canDelete = currentUserRole === 'ADMIN';
    const isGuest = currentUserRole === 'GUEST';

    // --- Load maintenance list ---
    async function loadData() {
        setLoading(true);
        try {
            const data = await listMaintenance();
            setAllMaintenance(data || []);
        } catch (error) {
            console.error('Failed to fetch maintenance list:', error);
            setAllMaintenance([]);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => { loadData(); }, []);

    // ✅ Auto-open CreateModal when HomeNavBar triggers (only if user has permission)
    useEffect(() => {
        if (addMaintenanceSignal > 0 && canCreate) {
            setOpenCreate(true);
        }
    }, [addMaintenanceSignal, canCreate]);

    // --- Convert to searchable options ---
    const searchOptions = useMemo(() => {
        return allMaintenance.map((item) => {
            const ref = `C${item.roomNumber}0${item.id}`;
            return {
                id: item.id,
                label: `${ref} - ห้อง ${item.roomNumber} - ${item.description || 'ไม่มีคำอธิบาย'}`,
                value: item.id,
                searchText: `${ref} ${item.roomNumber} ${item.id} ${item.description || ''} ${item.status || ''} ${item.responsiblePerson || ''} ${item.responsiblePhone || ''}`,
            };
        });
    }, [allMaintenance]);

    // --- Filter maintenance based on search and user role ---
    const filteredMaintenance = useMemo(() => {
        let filtered = allMaintenance;

        // USER role: Only show maintenance for their assigned room
        if (currentUserRole === 'USER' && currentUserRoomId) {
            filtered = filtered.filter((item) => item.roomId === parseInt(currentUserRoomId));
        }

        if (searchTerm) {
            if (searchType === 'exact') {
                // Exact match (from SmartSearch autocomplete)
                filtered = filtered.filter((item) => item.id === searchTerm);
            } else if (searchType === 'partial') {
                // Partial match (from QuickSearch text input)
                const searchLower = String(searchTerm).toLowerCase();
                filtered = filtered.filter((item) => {
                    const ref = `C${item.roomNumber}0${item.id}`;
                    const itemId = String(item.id || '');
                    const roomNum = String(item.roomNumber || '');
                    const desc = String(item.description || '');
                    const person = String(item.responsiblePerson || '');
                    const phone = String(item.responsiblePhone || '');
                    const status = String(item.status || '');
                    return (
                        ref.toLowerCase().includes(searchLower) ||
                        itemId.includes(searchLower) ||
                        roomNum.includes(searchLower) ||
                        desc.toLowerCase().includes(searchLower) ||
                        person.toLowerCase().includes(searchLower) ||
                        phone.includes(searchLower) ||
                        status.toLowerCase().includes(searchLower)
                    );
                });
            }
        }

        return filtered;
    }, [allMaintenance, searchTerm, searchType, currentUserRole, currentUserRoomId]);

    // --- Sorting ---
    const handleRequestSort = (property) => {
        const isAsc = sortConfig.key === property && sortConfig.direction === 'ascending';
        setSortConfig({ key: property, direction: isAsc ? 'descending' : 'ascending' });
        setPage(0); // Reset to first page when sorting changes
    };

    const sortedItems = useMemo(() => {
        let sortableItems = [...filteredMaintenance];
        if (sortConfig.key) {
            sortableItems.sort((a, b) => {
                let aValue = a[sortConfig.key];
                let bValue = b[sortConfig.key];
                if (sortConfig.key === 'scheduledDate') {
                    aValue = new Date(aValue);
                    bValue = new Date(bValue);
                }
                if (bValue < aValue) return sortConfig.direction === 'ascending' ? 1 : -1;
                if (bValue > aValue) return sortConfig.direction === 'ascending' ? -1 : 1;
                return 0;
            });
        }
        return sortableItems;
    }, [filteredMaintenance, sortConfig]);

    // Paginated maintenance (apply after filtering and sorting)
    const paginatedItems = useMemo(() => {
        const start = page * rowsPerPage;
        return sortedItems.slice(start, start + rowsPerPage);
    }, [sortedItems, page, rowsPerPage]);

    // --- Handlers ---
    const handleEdit = (id) => {
        setSelectedId(id);
        setOpenEdit(true);
    };

    const handleNavigateToRoom = async (roomNumber) => {
        try {
            const room = await getRoomByNumber(roomNumber);
            if (room?.id) navigate(`/rooms/${room.id}`);
        } catch (err) {
            console.error('Failed to navigate to room:', err);
        }
    };

    if (loading) return (
        <Box
            sx={{ p: 3, display: 'flex', justifyContent: 'center', alignItems: 'center' }}
            data-cy="maintenance-history-loading-state"
        >
            <CircularProgress /> <Typography sx={{ ml: 2 }}>กำลังโหลดข้อมูลบำรุงรักษา...</Typography>
        </Box>
    );

    return (
        <Box sx={{ p: 3 }} {...props} data-cy="maintenance-history-page">
            {/* Enhanced Search (Unified Quick + Smart) */}
            <EnhancedSearchBar
                onSearch={({ type, value }) => {
                    setSearchTerm(value);
                    setSearchType(type);
                    setPage(0);
                }}
                searchOptions={searchOptions}
                searchLabel="ค้นหาบำรุงรักษาแบบเฉพาะเจาะจง"
                searchPlaceholder="พิมพ์หมายเลขอ้างอิง, ห้อง, หรือคำอธิบาย แล้วกด Enter..."
                data-cy="maintenance-history-search-bar"
            />

            <TableContainer
                component={Paper}
                sx={{
                    marginTop: '20px',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)',
                    overflowX: 'auto',
                }}
                data-cy="maintenance-history-table-container"
            >
                <Table sx={{ minWidth: 650 }} aria-label="maintenance history table">
                    <StandardTableHeader
                        columns={headCells}
                        sortConfig={sortConfig}
                        onRequestSort={handleRequestSort}
                        data-cy="maintenance-history-table-header"
                    />

                    <TableBody data-cy="maintenance-history-table-body">
                        {paginatedItems.length > 0 ? (
                            paginatedItems.map((item) => (
                                <TableRow
                                    key={item.id}
                                    sx={{
                                        '&:hover': { backgroundColor: '#f9fafb' },
                                        '&:last-child td, &:last-child th': { border: 0 },
                                    }}
                                    data-cy={`maintenance-history-row-${item.id}`}
                                >
                                    <TableCell data-cy={`maintenance-history-cell-ref-${item.id}`}>
                                        <Button
                                            onClick={() => handleNavigateToRoom(item.roomNumber)}
                                            data-cy={`maintenance-history-room-link-button-${item.id}`}
                                        >
                                            {`C${item.roomNumber}0${item.id}`}
                                        </Button>
                                    </TableCell>
                                    <TableCell data-cy={`maintenance-history-cell-responsible-${item.id}`}>
                                        {item.responsiblePerson ? (
                                            <>
                                                <Typography variant="body2">{item.responsiblePerson}</Typography>
                                                {item.responsiblePhone && (
                                                    <Typography variant="caption" color="text.secondary">
                                                        {item.responsiblePhone}
                                                    </Typography>
                                                )}
                                            </>
                                        ) : (
                                            <Typography variant="body2" color="text.secondary">-</Typography>
                                        )}
                                    </TableCell>
                                    <TableCell data-cy={`maintenance-history-cell-cost-${item.id}`}>
                                        {item.costBaht ? item.costBaht.toLocaleString() : '-'}
                                    </TableCell>
                                    <TableCell data-cy={`maintenance-history-cell-date-${item.id}`}>
                                        {formatDate(item.scheduledDate)}
                                    </TableCell>
                                    <TableCell data-cy={`maintenance-history-cell-status-${item.id}`}>
                                        {renderStatus(item.status, item.id)} {/* Updated call */}
                                    </TableCell>
                                    <TableCell data-cy={`maintenance-history-cell-desc-${item.id}`}>
                                        {item.description}
                                    </TableCell>
                                    <TableCell data-cy={`maintenance-history-cell-actions-${item.id}`}>
                                        {canEdit && (
                                            <Button
                                                size="small"
                                                variant="outlined"
                                                startIcon={<EditIcon />}
                                                onClick={() => handleEdit(item.id)}
                                                data-cy={`maintenance-history-edit-button-${item.id}`}
                                            >
                                                แก้ไข
                                            </Button>
                                        )}
                                        {!canEdit && !isGuest && (
                                            <Typography variant="caption" color="text.secondary">
                                                ไม่มีสิทธิ์แก้ไข
                                            </Typography>
                                        )}
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow data-cy="maintenance-history-no-data-row">
                                <TableCell colSpan={7} align="center" sx={{ py: 3, color: 'text.secondary' }}>
                                    ไม่พบข้อมูล
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>

                {/* Pagination */}
                {sortedItems.length > 0 && (
                    <StandardPagination
                        count={sortedItems.length}
                        page={page}
                        rowsPerPage={rowsPerPage}
                        onPageChange={(event, newPage) => setPage(newPage)}
                        onRowsPerPageChange={(event) => {
                            setRowsPerPage(parseInt(event.target.value, 10));
                            setPage(0);
                        }}
                        data-cy="maintenance-history-pagination"
                    />
                )}
            </TableContainer>

            {/* Edit Modal */}
            {openEdit && (
                <EditMaintenanceModal
                    open={openEdit}
                    maintenanceId={selectedId}
                    onClose={() => setOpenEdit(false)}
                    onSaved={() => {
                        setOpenEdit(false);
                        loadData();
                    }}
                    data-cy="maintenance-history-edit-modal"
                />
            )}

            {/* Create Modal - Only for ADMIN and USER */}
            {openCreate && canCreate && (
                <CreateMaintenanceModal
                    open={openCreate}
                    onClose={() => setOpenCreate(false)}
                    onSuccess={() => {
                        setOpenCreate(false);
                        loadData();
                    }}
                    data-cy="maintenance-history-create-modal"
                />
            )}
        </Box>
    );
}