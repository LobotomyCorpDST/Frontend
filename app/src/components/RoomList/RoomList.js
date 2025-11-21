import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Table, TableBody, TableCell, TableContainer, TableRow, Paper,
    Box, Link, Chip // <--- 1. Added Chip Import
} from '@mui/material';
import CreateRoomModal from './CreateRoomModal';
import EnhancedSearchBar from '../Common/EnhancedSearchBar';
import StandardTableHeader from '../Common/StandardTableHeader';
import StandardPagination from '../Common/StandardPagination';

import http from '../../api/http';
import { listMaintenanceByRoomNumber } from '../../api/maintenance';

// Thai maintenance status translation
const translateMaintenanceStatus = (status) => {
    const statusMap = {
        'PLANNED': 'วางแผน',
        'IN_PROGRESS': 'กำลังดำเนินการ',
        'COMPLETED': 'เสร็จสิ้น',
        'CANCELED': 'ยกเลิก'
    };
    return statusMap[status?.toUpperCase()] || status || '-';
};

const RoomList = ({ addRoomSignal, ...props }) => {
    const navigate = useNavigate();
    const [rooms, setRooms] = useState([]);
    const [sortConfig, setSortConfig] = useState({ key: 'roomNumber', direction: 'descending' });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [openCreate, setOpenCreate] = useState(false);

    // Unified search state
    const [searchTerm, setSearchTerm] = useState('');
    const [searchType, setSearchType] = useState('');

    // Pagination state
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(50);

    const prevSignal = useRef(addRoomSignal);
    useEffect(() => {
        if (prevSignal.current !== addRoomSignal) {
            prevSignal.current = addRoomSignal;
            setOpenCreate(true);
        }
    }, [addRoomSignal]);

    const loadRooms = async () => {
        setLoading(true);
        setError('');
        try {
            const roomsJson = await http.get('/api/rooms');

            const withLeaseAndMaintenance = await Promise.all(
                roomsJson.map(async (r) => {
                    let leaseEndDate = '-';
                    let occupantName = r.tenant?.name || '-';
                    let roomStatus = r.status === 'OCCUPIED' ? 'มีผู้เช่า' : 'ว่าง';
                    let maintenanceStatus = '-';

                    try {
                        const lease = await http.get('/api/leases/active', {
                            params: { roomNumber: r.number }
                        });

                        if (lease && typeof lease === 'object') {
                            occupantName =
                                (lease.tenant?.name && lease.tenant.name.trim()) ||
                                r.tenant?.name ||
                                '-';

                            leaseEndDate = lease.endDate || '-';
                            roomStatus = 'มีผู้เช่า';
                        }
                    } catch {
                        // continue
                    }

                    // Fetch maintenance status
                    try {
                        const maintenanceList = await listMaintenanceByRoomNumber(r.number);
                        if (maintenanceList && maintenanceList.length > 0) {
                            const sortedByDate = [...maintenanceList].sort((a, b) => {
                                const dateA = new Date(a.scheduledDate || 0);
                                const dateB = new Date(b.scheduledDate || 0);
                                return dateB - dateA;
                            });
                            const latest = sortedByDate[0];
                            maintenanceStatus = `${translateMaintenanceStatus(latest.status)} ในวันที่ ${latest.scheduledDate || '-'}`;
                        }
                    } catch {
                        // If no maintenance found, keep as '-'
                    }

                    return {
                        roomId: r.id,
                        roomNumber: r.number,
                        tenantInfo: { name: occupantName },
                        leaseEndDate,
                        roomStatus,
                        maintenanceStatus,
                    };
                })
            );

            setRooms(withLeaseAndMaintenance);
        } catch (e) {
            setError(e.message || 'Failed to load rooms');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        let cancelled = false;
        (async () => {
            if (!cancelled) await loadRooms();
        })();
        return () => { cancelled = true; };
    }, []);

    const sortedRooms = useMemo(() => {
        const list = [...rooms];
        if (!sortConfig.key) return list;
        const dir = sortConfig.direction === 'ascending' ? 1 : -1;

        return list.sort((a, b) => {
            if (sortConfig.key === 'roomNumber') return (a.roomNumber - b.roomNumber) * dir;
            if (sortConfig.key === 'occupantName')
                return (a.tenantInfo.name || '').localeCompare(b.tenantInfo.name || '') * dir;
            if (sortConfig.key === 'leaseEndDate') {
                const da = a.leaseEndDate && a.leaseEndDate !== '-' ? a.leaseEndDate : '';
                const db = b.leaseEndDate && b.leaseEndDate !== '-' ? b.leaseEndDate : '';
                return da.localeCompare(db) * dir;
            }
            if (sortConfig.key === 'roomStatus')
                return a.roomStatus.localeCompare(b.roomStatus) * dir;
            if (sortConfig.key === 'maintenanceStatus')
                return (a.maintenanceStatus || '').localeCompare(b.maintenanceStatus || '') * dir;
            return 0;
        });
    }, [rooms, sortConfig]);

    const handleRequestSort = (property) => {
        const isAsc = sortConfig.key === property && sortConfig.direction === 'ascending';
        setSortConfig({ key: property, direction: isAsc ? 'descending' : 'ascending' });
        setPage(0);
    };

    const searchOptions = useMemo(() => {
        return sortedRooms.map((room) => ({
            id: room.roomId,
            label: `ห้อง ${room.roomNumber}${room.tenantInfo.name !== '-' ? ` - ${room.tenantInfo.name}` : ''}`,
            value: room.roomNumber,
            searchText: `${room.roomNumber} ${room.tenantInfo.name || ''}`,
        }));
    }, [sortedRooms]);

    const filteredRooms = useMemo(() => {
        let result = sortedRooms;

        if (searchTerm) {
            if (searchType === 'exact') {
                result = result.filter((room) => room.roomNumber === searchTerm);
            } else if (searchType === 'partial') {
                const searchLower = String(searchTerm).toLowerCase();
                result = result.filter((room) => {
                    const roomNum = String(room.roomNumber || '');
                    const tenantName = String(room.tenantInfo.name || '');
                    return (
                        roomNum.includes(searchLower) ||
                        tenantName.toLowerCase().includes(searchLower)
                    );
                });
            }
        }

        return result;
    }, [sortedRooms, searchTerm, searchType]);

    const paginatedRooms = useMemo(() => {
        const start = page * rowsPerPage;
        return filteredRooms.slice(start, start + rowsPerPage);
    }, [filteredRooms, page, rowsPerPage]);

    const handleRowClick = (roomNumber) => {
        navigate(`/room-details/${roomNumber}`);
    };

    if (loading) return (
        <Box sx={{ p: 3, textAlign: 'center' }} data-cy="room-list-loading-state">
            กำลังโหลดห้อง…
        </Box>
    );
    if (error) return (
        <Box sx={{ p: 3, textAlign: 'center', color: 'error.main' }} data-cy="room-list-error-state">
            เกิดข้อผิดพลาด: {error}
        </Box>
    );

    return (
        <Box sx={{ p: 3 }} {...props} data-cy="room-list-page">
            <EnhancedSearchBar
                onSearch={({ type, value }) => {
                    setSearchTerm(value);
                    setSearchType(type);
                    setPage(0);
                }}
                searchOptions={searchOptions}
                searchLabel="ค้นหาห้องแบบเฉพาะเจาะจง"
                searchPlaceholder="พิมพ์เลขห้องหรือชื่อผู้เช่า แล้วกด Enter..."
                data-cy="room-list-search-bar"
            />

            <TableContainer
                component={Paper}
                sx={{
                    marginTop: '20px', borderRadius: '8px',
                    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)', overflowX: 'auto',
                }}
                data-cy="room-list-table-container"
            >
                <Table sx={{ minWidth: 650 }} aria-label="room list table" data-cy="room-list-table">
                    <StandardTableHeader
                        columns={[
                            { id: 'roomNumber', label: 'เลขห้อง' },
                            { id: 'occupantName', label: 'ผู้เช่าอาศัย' },
                            { id: 'leaseEndDate', label: 'วันสิ้นสุดสัญญา' },
                            { id: 'roomStatus', label: 'สถานะห้อง' },
                            { id: 'maintenanceStatus', label: 'สถานะบำรุงรักษา' },
                        ]}
                        sortConfig={sortConfig}
                        onRequestSort={handleRequestSort}
                        data-cy="room-list-table-header"
                    />
                    <TableBody data-cy="room-list-table-body">
                        {paginatedRooms.length > 0 ? (
                            paginatedRooms.map((room) => (
                                <TableRow
                                    key={room.roomId}
                                    onClick={() => handleRowClick(room.roomNumber)}
                                    sx={{
                                        cursor: 'pointer',
                                        '&:hover': { backgroundColor: '#f1f3f5' },
                                        '&:last-child td, &:last-child th': { border: 0 },
                                    }}
                                    data-cy={`room-list-row-${room.roomId}`}
                                >
                                    <TableCell
                                        sx={{ padding: '12px', borderBottom: '1px solid #e0e6eb' }}
                                        data-cy={`room-list-cell-number-${room.roomId}`}
                                    >
                                        <Link
                                            component="button"
                                            variant="body2"
                                            sx={{ fontWeight: 'bold' }}
                                            data-cy={`room-list-room-link-${room.roomId}`}
                                        >
                                            {room.roomNumber}
                                        </Link>
                                    </TableCell>
                                    <TableCell
                                        sx={{ padding: '12px', borderBottom: '1px solid #e0e6eb' }}
                                        data-cy={`room-list-cell-tenant-${room.roomId}`}
                                    >
                                        {room.tenantInfo.name}
                                    </TableCell>
                                    <TableCell
                                        sx={{ padding: '12px', borderBottom: '1px solid #e0e6eb' }}
                                        data-cy={`room-list-cell-lease-end-${room.roomId}`}
                                    >
                                        {room.leaseEndDate}
                                    </TableCell>
                                    <TableCell
                                        sx={{ padding: '12px', borderBottom: '1px solid #e0e6eb' }}
                                        data-cy={`room-list-cell-status-${room.roomId}`}
                                    >
                                        {/* 2. Implemented Chip with Logic */}
                                        <Chip 
                                            label={room.roomStatus}
                                            color={room.roomStatus === 'มีผู้เช่า' ? 'error' : 'success'}
                                            size="small"
                                        />
                                    </TableCell>
                                    <TableCell
                                        sx={{ padding: '12px', borderBottom: '1px solid #e0e6eb' }}
                                        data-cy={`room-list-cell-maintenance-${room.roomId}`}
                                    >
                                        {room.maintenanceStatus}
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow data-cy="room-list-no-data-row">
                                <TableCell colSpan={5} sx={{ textAlign: 'center', py: 3 }}>
                                    ไม่พบห้อง
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>

                {filteredRooms.length > 0 && (
                    <StandardPagination
                        count={filteredRooms.length}
                        page={page}
                        rowsPerPage={rowsPerPage}
                        onPageChange={(event, newPage) => setPage(newPage)}
                        onRowsPerPageChange={(event) => {
                            setRowsPerPage(parseInt(event.target.value, 10));
                            setPage(0);
                        }}
                        data-cy="room-list-pagination"
                    />
                )}
            </TableContainer>

            {openCreate && (
                <CreateRoomModal
                    open={openCreate}
                    onClose={() => setOpenCreate(false)}
                    onCreated={loadRooms}
                    data-cy="room-list-create-room-modal"
                />
            )}
        </Box>
    );
};

export default RoomList;