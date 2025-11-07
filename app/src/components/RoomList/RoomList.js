import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Table, TableBody, TableCell, TableContainer, TableRow, Paper,
  Box, Link
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

const RoomList = ({ addRoomSignal }) => {
  const navigate = useNavigate();
  const [rooms, setRooms] = useState([]);
  const [sortConfig, setSortConfig] = useState({ key: 'roomNumber', direction: 'descending' }); // Changed default
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
              // Find the most recent maintenance record
              const sortedByDate = [...maintenanceList].sort((a, b) => {
                const dateA = new Date(a.scheduledDate || 0);
                const dateB = new Date(b.scheduledDate || 0);
                return dateB - dateA;
              });
              const latest = sortedByDate[0];

              // Show status and scheduled date (with Thai translation)
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
    setPage(0); // Reset to first page when sorting changes
  };

  // Convert rooms to searchable options for smart search
  const searchOptions = useMemo(() => {
    return sortedRooms.map((room) => ({
      id: room.roomId,
      label: `ห้อง ${room.roomNumber}${room.tenantInfo.name !== '-' ? ` - ${room.tenantInfo.name}` : ''}`,
      value: room.roomNumber,
      searchText: `${room.roomNumber} ${room.tenantInfo.name || ''}`,
    }));
  }, [sortedRooms]);

  // Filter rooms based on unified search
  const filteredRooms = useMemo(() => {
    let result = sortedRooms;

    if (searchTerm) {
      if (searchType === 'exact') {
        // Exact match (from SmartSearch autocomplete)
        result = result.filter((room) => room.roomNumber === searchTerm);
      } else if (searchType === 'partial') {
        // Partial match (from QuickSearch text input)
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

  // Paginated rooms (apply after filtering and sorting)
  const paginatedRooms = useMemo(() => {
    const start = page * rowsPerPage;
    return filteredRooms.slice(start, start + rowsPerPage);
  }, [filteredRooms, page, rowsPerPage]);

  const handleRowClick = (roomNumber) => {
    navigate(`/room-details/${roomNumber}`);
  };

  if (loading) return <Box sx={{ p: 3, textAlign: 'center' }}>กำลังโหลดห้อง…</Box>;
  if (error) return <Box sx={{ p: 3, textAlign: 'center', color: 'error.main' }}>เกิดข้อผิดพลาด: {error}</Box>;

  return (
    <Box sx={{ p: 3 }}>
      {/* Enhanced Search (Unified Quick + Smart) */}
      <EnhancedSearchBar
        onSearch={({ type, value }) => {
          setSearchTerm(value);
          setSearchType(type);
          setPage(0);
        }}
        searchOptions={searchOptions}
        searchLabel="ค้นหาห้องแบบเฉพาะเจาะจง"
        searchPlaceholder="พิมพ์เลขห้องหรือชื่อผู้เช่า แล้วกด Enter..."
      />

      <TableContainer
        component={Paper}
        sx={{
          marginTop: '20px', borderRadius: '8px',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)', overflowX: 'auto',
        }}
      >
        <Table sx={{ minWidth: 650 }} aria-label="room list table">
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
          />
          <TableBody>
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
                >
                  <TableCell sx={{ padding: '12px', borderBottom: '1px solid #e0e6eb' }}>
                    <Link component="button" variant="body2" sx={{ fontWeight: 'bold' }}>{room.roomNumber}</Link>
                  </TableCell>
                  <TableCell sx={{ padding: '12px', borderBottom: '1px solid #e0e6eb' }}>{room.tenantInfo.name}</TableCell>
                  <TableCell sx={{ padding: '12px', borderBottom: '1px solid #e0e6eb' }}>{room.leaseEndDate}</TableCell>
                  <TableCell sx={{ padding: '12px', borderBottom: '1px solid #e0e6eb' }}>{room.roomStatus}</TableCell>
                  <TableCell sx={{ padding: '12px', borderBottom: '1px solid #e0e6eb' }}>{room.maintenanceStatus}</TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} sx={{ textAlign: 'center', py: 3 }}>
                  ไม่พบห้อง
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>

        {/* Pagination */}
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
          />
        )}
      </TableContainer>

      {openCreate && (
        <CreateRoomModal
          open={openCreate}
          onClose={() => setOpenCreate(false)}
          onCreated={loadRooms}
        />
      )}
    </Box>
  );
};

export default RoomList;