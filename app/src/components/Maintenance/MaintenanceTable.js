import React, { useEffect, useMemo, useState } from 'react';
import {
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    Box,
    Button,
    Chip,
    CircularProgress,
    IconButton,
    Stack,
    Tooltip,
    TableRow,
} from '@mui/material';
// นำเข้าไอคอนใหม่
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import RefreshIcon from '@mui/icons-material/Refresh';
import EditIcon from '@mui/icons-material/Edit';
import { listMaintenanceByRoomNumber, completeMaintenance } from '../../api/maintenance';
import EditMaintenanceModal from './EditMaintenanceModal';
import StandardTableHeader from '../Common/StandardTableHeader';

function statusChip(status, id) {
    const s = (status || '').toUpperCase();

    // Thai translation map
    const statusMap = {
        'PLANNED': 'วางแผน',
        'IN_PROGRESS': 'กำลังดำเนินการ',
        'COMPLETED': 'เสร็จสิ้น',
        'DONE': 'เสร็จสิ้น',
        'CANCELED': 'ยกเลิก',
    };

    const colorMap = {
        PLANNED: 'info',
        IN_PROGRESS: 'warning',
        COMPLETED: 'success',
        DONE: 'success',
        CANCELED: 'default',
    };

    const label = statusMap[s] || status || '-';
    return (
        <Chip
            label={label}
            color={colorMap[s] || 'default'}
            size="small"
            data-cy={`maintenance-table-status-chip-${id}`} // <-- Added data-cy
        />
    );
}

function money(n) {
    if (n == null) return '-';
    return Number(n).toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    });
}

const headCells = [
    { id: 'scheduledDate', label: 'วันที่นัด' },
    { id: 'description', label: 'รายละเอียด' },
    { id: 'status', label: 'สถานะ' },
    // จัดชิดขวา
    { id: 'costBaht', label: 'ค่าใช้จ่าย (บาท)', align: 'right' },
    // เปลี่ยนจาก right เป็น left
    { id: 'completedDate', label: 'เสร็จเมื่อ', align: 'left' },
    // เอา align: 'right' ออก เพราะจะใช้ Stack จัดชิดขวาใน Cell
    { id: 'actions', label: 'การดำเนินการ', disableSorting: true },
];

export default function MaintenanceTable({ roomNumber, reloadSignal = 0, ...props }) {
    const [rows, setRows] = useState([]);
    const [loading, setLoading] = useState(true);
    const [openEdit, setOpenEdit] = useState(false);
    const [selectedId, setSelectedId] = useState(null);
    const [sortConfig, setSortConfig] = useState({ key: 'scheduledDate', direction: 'descending' });

    const canComplete = useMemo(
        () => (st) => {
            const s = (st || '').toUpperCase();
            return s !== 'COMPLETED' && s !== 'DONE' && s !== 'CANCELED';
        },
        []
    );

    async function load() {
        if (!roomNumber) return;
        setLoading(true);
        try {
            const data = await listMaintenanceByRoomNumber(roomNumber);
            setRows(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error('Failed to fetch maintenance list:', err);
            setRows([]);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        load();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [roomNumber, reloadSignal]);

    const handleRequestSort = (property) => {
        const isAsc = sortConfig.key === property && sortConfig.direction === 'ascending';
        setSortConfig({ key: property, direction: isAsc ? 'descending' : 'ascending' });
    };

    const sortedRows = useMemo(() => {
        if (!sortConfig.key) return rows;

        return [...rows].sort((a, b) => {
            let aVal = a[sortConfig.key];
            let bVal = b[sortConfig.key];

            // Handle null/undefined
            if (bVal == null) bVal = '';

            // Compare
            if (aVal < bVal) return sortConfig.direction === 'ascending' ? -1 : 1;
            if (aVal > bVal) return sortConfig.direction === 'ascending' ? 1 : -1;
            return 0;
        });
    }, [rows, sortConfig]);

    async function doComplete(id) {
        const today = new Date().toISOString().slice(0, 10);
        try {
            await completeMaintenance(id, today);
            await load();
        } catch (err) {
            console.error('Failed to complete maintenance:', err);
        }
    }

    const handleEdit = (id) => {
        setSelectedId(id);
        setOpenEdit(true);
    };

    return (
        <Box {...props} data-cy="maintenance-table">
            <Box
                sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}
                data-cy="maintenance-table-toolbar"
            >
                <Stack direction="row" alignItems="center" spacing={1}>
                    <Tooltip title="รีเฟรช">
                        <IconButton
                            onClick={load}
                            size="small"
                            data-cy="maintenance-table-refresh-button"
                        >
                            <RefreshIcon />
                        </IconButton>
                    </Tooltip>
                </Stack>
            </Box>

            <TableContainer
                component={Paper}
                variant="outlined"
                data-cy="maintenance-table-container"
            >
                <Table stickyHeader size="small">
                    <StandardTableHeader
                        columns={headCells}
                        sortConfig={sortConfig}
                        onRequestSort={handleRequestSort}
                        data-cy="maintenance-table-header"
                    />
                    <TableBody data-cy="maintenance-table-body">
                        {loading ? (
                            <TableRow data-cy="maintenance-table-loading-state">
                                <TableCell colSpan={6} align="center">
                                    <CircularProgress size={22} />
                                </TableCell>
                            </TableRow>
                        ) : rows.length === 0 ? (
                            <TableRow data-cy="maintenance-table-no-data-state">
                                <TableCell colSpan={6} align="center">
                                    ยังไม่มีงานบำรุงรักษา
                                </TableCell>
                            </TableRow>
                        ) : (
                            sortedRows.map((r) => (
                                <TableRow key={r.id} data-cy={`maintenance-table-row-${r.id}`}>
                                    <TableCell data-cy={`maintenance-table-cell-date-${r.id}`}>{r.scheduledDate || '-'}</TableCell>
                                    <TableCell data-cy={`maintenance-table-cell-desc-${r.id}`}>{r.description || '-'}</TableCell>
                                    <TableCell data-cy={`maintenance-table-cell-status-${r.id}`}>
                                        {statusChip(r.status, r.id)}
                                    </TableCell>
                                    {/* จัดชิดขวา */}
                                    <TableCell align="right" data-cy={`maintenance-table-cell-cost-${r.id}`}>{money(r.costBaht)}</TableCell>
                                    {/* จัดชิดซ้าย */}
                                    <TableCell align="left" data-cy={`maintenance-table-cell-completed-date-${r.id}`}>{r.completedDate || '-'}</TableCell>
                                    {/* การดำเนินการ จัดชิดขวา */}
                                    <TableCell align="right" data-cy={`maintenance-table-cell-actions-${r.id}`}>
                                        {/* ใช้ Stack จัดกลุ่มปุ่มให้อยู่ชิดขวา (flex-end) */}
                                        <Stack direction="row" justifyContent="flex-end" spacing={0.5}>
                                            {canComplete(r.status) && (
                                                <Tooltip title="ทำเสร็จ">
                                                    <IconButton
                                                        size="small"
                                                        onClick={() => doComplete(r.id)}
                                                        data-cy={`maintenance-table-complete-button-${r.id}`}
                                                    >
                                                        <CheckCircleOutlineIcon color="primary" fontSize="small" />
                                                    </IconButton>
                                                </Tooltip>
                                            )}
                                            <Tooltip title="แก้ไข">
                                                <IconButton
                                                    size="small"
                                                    onClick={() => handleEdit(r.id)}
                                                    data-cy={`maintenance-table-edit-button-${r.id}`}
                                                >
                                                    <EditIcon color="action" fontSize="small" />
                                                </IconButton>
                                            </Tooltip>
                                        </Stack>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </TableContainer>

            {openEdit && (
                <EditMaintenanceModal
                    open={openEdit}
                    maintenanceId={selectedId}
                    onClose={() => setOpenEdit(false)}
                    onSaved={() => {
                        setOpenEdit(false);
                        load();
                    }}
                    data-cy="maintenance-table-edit-modal"
                />
            )}
        </Box>
    );
}
