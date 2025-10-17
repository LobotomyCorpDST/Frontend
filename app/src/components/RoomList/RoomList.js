import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, TableSortLabel,
  Box, Link, Typography,
} from '@mui/material';
import { visuallyHidden } from '@mui/utils';
import CreateRoomModal from './CreateRoomModal';

import http from '../../api/http';
import { listMaintenanceByRoomNumber } from '../../api/maintenance';

const headCells = [
  { id: 'roomNumber',        label: 'เลขห้อง' },
  { id: 'occupantName',      label: 'ผู้เช่าอาศัย' },
  { id: 'leaseEndDate',      label: 'วันสิ้นสุดสัญญา' },
  { id: 'roomStatus',        label: 'สถานะห้อง' },
  { id: 'maintenanceStatus', label: 'สถานะบำรุงรักษา' },
];

const headerCellStyle = {
  backgroundColor: '#13438B',
  color: '#f8f9fa',
  fontWeight: 'bold',
  padding: '12px',
};

const RoomList = ({ searchTerm, addRoomSignal }) => {
  const navigate = useNavigate();
  const [rooms, setRooms] = useState([]);
  const [sortConfig, setSortConfig] = useState({ key: 'roomNumber', direction: 'ascending' });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [openCreate, setOpenCreate] = useState(false);

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
              
              // Show status and scheduled date
              maintenanceStatus = `${latest.status} ในวันที่ ${latest.scheduledDate || '-'}`;
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
  };

  const filteredRooms = useMemo(() => {
    const term = (searchTerm || '').toLowerCase();
    if (!term) return sortedRooms;
    return sortedRooms.filter(
      (room) =>
        String(room.roomNumber).includes(term) ||
        (room.tenantInfo.name || '').toLowerCase().includes(term)
    );
  }, [sortedRooms, searchTerm]);

  const handleRowClick = (roomNumber) => {
    navigate(`/room-details/${roomNumber}`);
  };

  if (loading) return <div className="room-table">Loading rooms…</div>;
  if (error) return <div className="room-table">Error: {error}</div>;

  return (
    <>
      <TableContainer
        component={Paper}
        sx={{
          marginTop: '20px', borderRadius: '8px',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)', overflowX: 'auto',
        }}
      >
        <Table sx={{ minWidth: 650, maxWidth: '96%', mx: 'auto', mb: 2 }} aria-label="room list table">
          <TableHead>
            <TableRow>
              {headCells.map((headCell) => (
                <TableCell
                  key={headCell.id}
                  sx={headerCellStyle}
                  sortDirection={sortConfig.key === headCell.id ? sortConfig.direction : false}
                  onClick={() => handleRequestSort(headCell.id)}
                >
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
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredRooms.length > 0 ? (
              filteredRooms.map((room) => (
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
                <TableCell colSpan={headCells.length} sx={{ textAlign: 'center', py: 3 }}>
                  ไม่พบห้อง
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {openCreate && (
        <CreateRoomModal
          open={openCreate}
          onClose={() => setOpenCreate(false)}
          onCreated={loadRooms}
        />
      )}
    </>
  );
};

export default RoomList;