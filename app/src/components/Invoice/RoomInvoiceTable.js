import React, { useEffect, useState, useMemo } from 'react';
import {
    Box,
    Paper,
    Button,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableRow,
    Chip,
    IconButton,
    Tooltip,
    CircularProgress,
} from '@mui/material';

import AddIcon from '@mui/icons-material/Add';
import PrintIcon from '@mui/icons-material/Print';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import TaskAltIcon from '@mui/icons-material/TaskAlt';
import UndoIcon from '@mui/icons-material/Undo';

import {
    listInvoicesByRoom,
    markPaid,
    markUnpaid,
    computeDisplayStatus,
    openInvoice,
} from '../../api/invoice';
import StandardTableHeader from '../Common/StandardTableHeader';

function fmt(n) {
    if (n == null) return '-';
    return Number(n).toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    });
}

const headCells = [
    { id: 'issueDate', label: 'วันที่ออกบิล' },
    { id: 'totalBaht', label: 'ยอดรวม (บาท)' },
    { id: 'status', label: 'สถานะ' },
    { id: 'actions', label: 'การดำเนินการ', disableSorting: true, align: 'right' },
];

export default function RoomInvoiceTable({
                                             roomId,
                                             onCreateClick,
                                             showCreateButton = true,
                                             userRole: propUserRole,
                                             ...props
                                         }) {
    // Get user role for permission checks (use prop if provided, otherwise get from localStorage)
    const userRole = propUserRole || (localStorage.getItem('role') || 'GUEST').toUpperCase();
    const isAdmin = userRole === 'ADMIN';
    const isStaff = userRole === 'STAFF';
    const canTakeActions = isAdmin || isStaff;

    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [sortConfig, setSortConfig] = useState({ key: 'issueDate', direction: 'descending' });

    async function load() {
        if (!roomId) return;
        setLoading(true);
        try {
            const data = await listInvoicesByRoom(roomId);
            setItems(data);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        load();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [roomId]);

    const handleRequestSort = (property) => {
        const isAsc = sortConfig.key === property && sortConfig.direction === 'ascending';
        setSortConfig({ key: property, direction: isAsc ? 'descending' : 'ascending' });
    };

    const sortedItems = useMemo(() => {
        if (!sortConfig.key) return items;

        return [...items].sort((a, b) => {
            let aVal = a[sortConfig.key];
            let bVal = b[sortConfig.key];

            // Handle status sorting with Thai labels
            if (sortConfig.key === 'status') {
                aVal = computeDisplayStatus(a);
                bVal = computeDisplayStatus(b);
            }

            // Handle null/undefined
            if (aVal == null) aVal = '';
            if (bVal == null) bVal = '';

            // Compare
            if (aVal < bVal) return sortConfig.direction === 'ascending' ? -1 : 1;
            if (aVal > bVal) return sortConfig.direction === 'ascending' ? 1 : -1;
            return 0;
        });
    }, [items, sortConfig]);

    async function doMarkPaid(id) {
        const today = new Date().toISOString().slice(0, 10);
        await markPaid(id, today);
        await load();
    }

    async function doUnpaid(id) {
        await markUnpaid(id);
        await load();
    }

    function renderStatusChip(inv) {
        const label = computeDisplayStatus(inv); // 'ชำระแล้ว' | 'ค้างชำระ' | 'ยังไม่ชำระ'
        const colorMap = {
            'ชำระแล้ว': 'success',
            'ค้างชำระ': 'error',
            'ยังไม่ชำระ': 'warning',
        };
        return (
            <Chip
                size="small"
                label={label}
                color={colorMap[label] || 'default'}
                data-cy={`room-invoice-table-chip-status-${inv.id}`}
            />
        );
    }

    const actionBtnSx = { borderRadius: 2, textTransform: 'none', fontWeight: 600, px: 2 };

    return (
        <Box {...props} data-cy="room-invoice-table-container">
            {showCreateButton && (
                <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
                    <Button
                        variant="contained"
                        color="primary"
                        size="small"
                        startIcon={<AddIcon />}
                        disableElevation
                        sx={actionBtnSx}
                        onClick={onCreateClick}
                        data-cy="room-invoice-table-create-button"
                    >
                        สร้างใบแจ้งหนี้
                    </Button>
                </Box>
            )}

            <TableContainer
                component={Paper}
                variant="outlined"
                data-cy="room-invoice-table-paper-container"
            >
                <Table stickyHeader size="small">
                    <StandardTableHeader
                        columns={headCells}
                        sortConfig={sortConfig}
                        onRequestSort={handleRequestSort}
                        data-cy="room-invoice-table-header"
                    />

                    <TableBody>
                        {loading ? (
                            <TableRow data-cy="room-invoice-table-loading-state">
                                <TableCell colSpan={4} align="center">
                                    <CircularProgress size={22} />
                                </TableCell>
                            </TableRow>
                        ) : items.length === 0 ? (
                            <TableRow data-cy="room-invoice-table-no-data-state">
                                <TableCell colSpan={4} align="center">
                                    ยังไม่มีใบแจ้งหนี้
                                </TableCell>
                            </TableRow>
                        ) : (
                            sortedItems.map((inv) => (
                                <TableRow
                                    key={inv.id}
                                    data-cy={`room-invoice-table-row-${inv.id}`}
                                >
                                    <TableCell data-cy={`room-invoice-table-cell-issueDate-${inv.id}`}>{inv.issueDate}</TableCell>
                                    <TableCell data-cy={`room-invoice-table-cell-total-${inv.id}`}>{fmt(inv.totalBaht)}</TableCell>
                                    <TableCell data-cy={`room-invoice-table-cell-status-${inv.id}`}>{renderStatusChip(inv)}</TableCell>
                                    <TableCell align="right" data-cy={`room-invoice-table-cell-actions-${inv.id}`}>
                                        {/* Print/PDF buttons - ADMIN/STAFF only, hidden for USER */}
                                        {canTakeActions && (
                                            <>
                                                <Tooltip title="เปิดหน้าพิมพ์ (PDF)">
                                                    <IconButton
                                                        size="small"
                                                        onClick={() => openInvoice(inv.id, 'print')}
                                                        data-cy={`room-invoice-table-print-button-${inv.id}`}
                                                    >
                                                        <PrintIcon fontSize="inherit" />
                                                    </IconButton>
                                                </Tooltip>
                                                <Tooltip title="เปิดไฟล์ PDF">
                                                    <IconButton
                                                        size="small"
                                                        sx={{ ml: 0.5 }}
                                                        onClick={() => openInvoice(inv.id, 'pdf')}
                                                        data-cy={`room-invoice-table-pdf-button-${inv.id}`}
                                                    >
                                                        <PictureAsPdfIcon fontSize="inherit" />
                                                    </IconButton>
                                                </Tooltip>
                                            </>
                                        )}

                                        {/* Mark Paid/Unpaid buttons - ADMIN only */}
                                        {isAdmin && (
                                            inv.status === 'PAID' ? (
                                                <Tooltip title="เปลี่ยนเป็นยังไม่ชำระ">
                                                    <Button
                                                        size="small"
                                                        variant="outlined"
                                                        color="warning"
                                                        sx={{ ml: 1, ...actionBtnSx, px: 1.5 }}
                                                        startIcon={<UndoIcon />}
                                                        onClick={() => doUnpaid(inv.id)}
                                                        data-cy={`room-invoice-table-mark-unpaid-button-${inv.id}`}
                                                    >
                                                        ยังไม่ชำระ
                                                    </Button>
                                                </Tooltip>
                                            ) : (
                                                <Tooltip title="ทำเครื่องหมายว่าชำระแล้ว">
                                                    <Button
                                                        size="small"
                                                        variant="contained"
                                                        color="success"
                                                        sx={{ ml: 1, ...actionBtnSx, px: 1.5 }}
                                                        startIcon={<TaskAltIcon />}
                                                        onClick={() => doMarkPaid(inv.id)}
                                                        data-cy={`room-invoice-table-mark-paid-button-${inv.id}`}
                                                    >
                                                        ชำระแล้ว
                                                    </Button>
                                                </Tooltip>
                                            )
                                        )}
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </TableContainer>
        </Box>
    );
}