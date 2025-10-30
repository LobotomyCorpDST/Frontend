import React, { useEffect, useState, useMemo } from 'react';
import {
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Paper, Typography, Chip, Box, TableSortLabel, Button
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import AddIcon from '@mui/icons-material/Add';
import { visuallyHidden } from '@mui/utils';
import { useNavigate } from 'react-router-dom';
import { listMaintenance } from '../../api/maintenance';
import { getRoomByNumber } from '../../api/room';
import EditMaintenanceModal from '../Maintenance/EditMaintenanceModal';
import CreateMaintenanceModal from '../Maintenance/CreateMaintenanceModal';
import SmartSearchAutocomplete from '../Common/SmartSearchAutocomplete';

const formatDate = (dateString) => {
  if (!dateString) return '-';
  const date = new Date(dateString);
  return `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;
};

const renderStatus = (status) => {
  switch (status) {
    case 'COMPLETED':
      return <Chip label="เสร็จสิ้น" color="success" size="small" />;
    case 'IN_PROGRESS':
      return <Chip label="กำลังดำเนินการ" color="warning" size="small" />;
    case 'PLANNED':
      return <Chip label="วางแผนแล้ว" color="info" size="small" />;
    default:
      return <Chip label={status || '-'} size="small" />;
  }
};

const headerCellStyle = {
  backgroundColor: '#1d3e7d',
  fontWeight: 600,
  color: '#f8f9fa',
  padding: '12px',
  textAlign: 'left',
  borderBottom: '1px solid #e0e6eb',
  cursor: 'pointer',
  '&:hover': { backgroundColor: '#173262' },
};

const headCells = [
  { id: 'id', label: 'หมายเลขอ้างอิง' },
  { id: 'responsiblePerson', label: 'ผู้รับผิดชอบ', disableSorting: true },
  { id: 'costBaht', label: 'ราคา (บาท)', disableSorting: true },
  { id: 'scheduledDate', label: 'กำหนดการ' },
  { id: 'status', label: 'สถานะบำรุง' },
  { id: 'description', label: 'รายละเอียด' },
  { id: 'actions', label: 'Actions', disableSorting: true },
];

export default function MaintenanceHistory({ searchTerm: externalSearchTerm, addMaintenanceSignal, userRole }) {
  const [loading, setLoading] = useState(true);
  const [allMaintenance, setAllMaintenance] = useState([]);
  const [sortConfig, setSortConfig] = useState({ key: 'id', direction: 'descending' });
  const [openEdit, setOpenEdit] = useState(false);
  const [selectedId, setSelectedId] = useState(null);
  const [openCreate, setOpenCreate] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
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
        searchText: `${ref} ${item.roomNumber} ${item.id} ${item.description || ''} ${item.status || ''}`,
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

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter((item) => item.id === searchTerm);
    }

    return filtered;
  }, [allMaintenance, searchTerm, currentUserRole, currentUserRoomId]);

  // --- Sorting ---
  const handleRequestSort = (property) => {
    const isAsc = sortConfig.key === property && sortConfig.direction === 'ascending';
    setSortConfig({ key: property, direction: isAsc ? 'descending' : 'ascending' });
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

  if (loading) return <Typography align="center">Loading...</Typography>;

  return (
    <>
      {/* Smart Search */}
      <Box sx={{ mb: 3, maxWidth: 600 }}>
        <SmartSearchAutocomplete
          options={searchOptions}
          label="ค้นหาบำรุงรักษา"
          value={searchTerm}
          onChange={(value) => setSearchTerm(value)}
          placeholder="พิมพ์หมายเลขอ้างอิง, ห้อง, หรือคำอธิบาย..."
        />
      </Box>

      <TableContainer
        component={Paper}
        sx={{
          borderRadius: '8px',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)',
          overflowX: 'auto',
        }}
      >
        <Table sx={{ minWidth: 650, maxWidth: '96%', mx: 'auto', mb: 2 }}>
          <TableHead>
            <TableRow>
              {headCells.map((h) => (
                <TableCell
                  key={h.id}
                  sx={headerCellStyle}
                  sortDirection={sortConfig.key === h.id ? sortConfig.direction : false}
                  onClick={() => !h.disableSorting && handleRequestSort(h.id)}
                >
                  <TableSortLabel
                    active={sortConfig.key === h.id}
                    direction={sortConfig.key === h.id ? sortConfig.direction : 'asc'}
                    sx={{
                      color: '#f8f9fa',
                      '&:hover': { color: '#f0f4fa' },
                      '&.Mui-active': {
                        color: '#f8f9fa',
                        '& .MuiTableSortLabel-icon': { color: 'inherit !important' },
                      },
                    }}
                  >
                    {h.label}
                    {sortConfig.key === h.id && (
                      <Box component="span" sx={visuallyHidden}>
                        {sortConfig.direction === 'descending'
                          ? 'sorted descending'
                          : 'sorted ascending'}
                      </Box>
                    )}
                  </TableSortLabel>
                </TableCell>
              ))}
            </TableRow>
          </TableHead>

          <TableBody>
            {sortedItems.length > 0 ? (
              sortedItems.map((item) => (
                <TableRow
                  key={item.id}
                  sx={{
                    '&:hover': { backgroundColor: '#f9fafb' },
                    '&:last-child td, &:last-child th': { border: 0 },
                  }}
                >
                  <TableCell>
                    <Button onClick={() => handleNavigateToRoom(item.roomNumber)}>
                      {`C${item.roomNumber}0${item.id}`}
                    </Button>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">นาย ช่าง หัวมัน</Typography>
                    <Typography variant="caption" color="text.secondary">0000000008</Typography>
                  </TableCell>
                  <TableCell>{item.costBaht ? item.costBaht.toLocaleString() : '-'}</TableCell>
                  <TableCell>{formatDate(item.scheduledDate)}</TableCell>
                  <TableCell>{renderStatus(item.status)}</TableCell>
                  <TableCell>{item.description}</TableCell>
                  <TableCell>
                    {canEdit && (
                      <Button
                        size="small"
                        variant="outlined"
                        startIcon={<EditIcon />}
                        onClick={() => handleEdit(item.id)}
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
              <TableRow>
                <TableCell colSpan={7} align="center" sx={{ py: 3, color: 'text.secondary' }}>
                  ไม่พบข้อมูล
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
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
        />
      )}
    </>
  );
}
