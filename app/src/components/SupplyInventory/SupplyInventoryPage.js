import React, { useState, useEffect, useMemo } from 'react';
import {
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
  TextField,
  Button,
  IconButton,
  Typography,
  Chip,
  Alert,
  CircularProgress,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import { getAllSupplies, incrementSupply, decrementSupply, deleteSupply, updateSupply } from '../../api/supply';
import AddSupplyModal from './AddSupplyModal';
import EnhancedSearchBar from '../Common/EnhancedSearchBar';
import StandardTableHeader from '../Common/StandardTableHeader';
import StandardPagination from '../Common/StandardPagination';

const headCells = [
  { id: 'supplyName', label: 'ชื่อของ' },
  { id: 'supplyAmount', label: 'จำนวน', align: 'center' },
  { id: 'actions', label: 'การจัดการ', disableSorting: true, align: 'center' },
];

const SupplyInventoryPage = () => {
  const [allSupplies, setAllSupplies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [openAddModal, setOpenAddModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState('');
  const [editAmount, setEditAmount] = useState('');

  // Unified search state
  const [searchTerm, setSearchTerm] = useState('');
  const [searchType, setSearchType] = useState('');

  // Sorting state (default: ID descending)
  const [sortConfig, setSortConfig] = useState({ key: 'id', direction: 'descending' });

  // Pagination state
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(50);

  const loadSupplies = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await getAllSupplies('');
      setAllSupplies(data);
    } catch (err) {
      setError(err.message || 'Failed to load supplies');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSupplies();
  }, []);

  const handleIncrement = async (id) => {
    try {
      await incrementSupply(id);
      loadSupplies();
    } catch (err) {
      setError(err.message || 'Failed to increment');
    }
  };

  const handleDecrement = async (id) => {
    try {
      await decrementSupply(id);
      loadSupplies();
    } catch (err) {
      setError(err.message || 'Failed to decrement');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('ต้องการลบรายการนี้?')) return;
    try {
      await deleteSupply(id);
      loadSupplies();
    } catch (err) {
      setError(err.message || 'Failed to delete');
    }
  };

  const startEditing = (supply) => {
    setEditingId(supply.id);
    setEditName(supply.supplyName);
    setEditAmount(supply.supplyAmount.toString());
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditName('');
    setEditAmount('');
  };

  const saveEditing = async () => {
    if (!editName.trim()) {
      alert('ชื่อของไม่สามารถเว้นว่าง');
      return;
    }
    const amount = parseInt(editAmount, 10);
    if (isNaN(amount) || amount < 0) {
      alert('จำนวนต้องเป็นตัวเลขที่ไม่ติดลบ');
      return;
    }

    try {
      await updateSupply(editingId, {
        supplyName: editName.trim(),
        supplyAmount: amount,
      });
      loadSupplies();
      cancelEditing();
    } catch (err) {
      setError(err.message || 'Failed to update');
    }
  };

  const isLowStock = (amount) => amount < 3;

  // Sorting logic
  const handleRequestSort = (property) => {
    const isAsc = sortConfig.key === property && sortConfig.direction === 'ascending';
    setSortConfig({ key: property, direction: isAsc ? 'descending' : 'ascending' });
    setPage(0); // Reset to first page when sorting changes
  };

  const sortedSupplies = useMemo(() => {
    const list = [...allSupplies];
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
  }, [allSupplies, sortConfig]);

  // Convert supplies to searchable options for smart search
  const searchOptions = useMemo(() => {
    return sortedSupplies.map((supply) => ({
      id: supply.id,
      label: `${supply.supplyName} (${supply.supplyAmount} ชิ้น)`,
      value: supply.id,
      searchText: `${supply.supplyName} ${supply.supplyAmount}`,
    }));
  }, [sortedSupplies]);

  // Filter supplies based on unified search
  const filteredSupplies = useMemo(() => {
    let result = sortedSupplies;

    if (searchTerm) {
      if (searchType === 'exact') {
        // Exact match (from SmartSearch autocomplete)
        result = result.filter((supply) => supply.id === searchTerm);
      } else if (searchType === 'partial') {
        // Partial match (from QuickSearch text input)
        const searchLower = String(searchTerm).toLowerCase();
        result = result.filter((supply) => {
          const name = String(supply.supplyName || '');
          const amount = String(supply.supplyAmount || '');
          return (
            name.toLowerCase().includes(searchLower) ||
            amount.includes(searchLower)
          );
        });
      }
    }

    return result;
  }, [sortedSupplies, searchTerm, searchType]);

  // Paginated supplies (apply after filtering and sorting)
  const paginatedSupplies = useMemo(() => {
    const start = page * rowsPerPage;
    return filteredSupplies.slice(start, start + rowsPerPage);
  }, [filteredSupplies, page, rowsPerPage]);

  if (loading) {
    return (
      <Box sx={{ p: 3, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <CircularProgress /> <Typography sx={{ ml: 2 }}>กำลังโหลดคลังวัสดุ...</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        คลังอพาร์ทเมนต์
      </Typography>

      {error && (
        <Alert severity="error" onClose={() => setError('')} sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Box sx={{ display: 'flex', gap: 2, mb: 3, alignItems: 'flex-start' }}>
        <Box sx={{ flex: 1 }}>
          <EnhancedSearchBar
            onSearch={({ type, value }) => {
              setSearchTerm(value);
              setSearchType(type);
              setPage(0);
            }}
            searchOptions={searchOptions}
            searchLabel="ค้นหาวัสดุแบบเฉพาะเจาะจง"
            searchPlaceholder="พิมพ์ชื่อวัสดุหรือจำนวน แล้วกด Enter..."
          />
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setOpenAddModal(true)}
        >
          เพิ่มของ
        </Button>
      </Box>

      <TableContainer
        component={Paper}
        sx={{
          borderRadius: '8px',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)',
          overflowX: 'auto',
        }}
      >
        <Table sx={{ minWidth: 650 }} aria-label="supply inventory table">
          <StandardTableHeader
            columns={headCells}
            sortConfig={sortConfig}
            onRequestSort={handleRequestSort}
          />
          <TableBody>
            {paginatedSupplies.length > 0 ? (
              paginatedSupplies.map((supply) => (
                <TableRow
                  key={supply.id}
                  sx={{
                    backgroundColor: isLowStock(supply.supplyAmount)
                      ? '#ffebee'
                      : 'inherit',
                  }}
                >
                  <TableCell>
                    {editingId === supply.id ? (
                      <TextField
                        size="small"
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        fullWidth
                      />
                    ) : (
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        {supply.supplyName}
                        {isLowStock(supply.supplyAmount) && (
                          <Chip label="สินค้าใกล้หมด" color="error" size="small" />
                        )}
                      </Box>
                    )}
                  </TableCell>
                  <TableCell align="center">
                    {editingId === supply.id ? (
                      <TextField
                        size="small"
                        type="number"
                        value={editAmount}
                        onChange={(e) => setEditAmount(e.target.value)}
                        sx={{ width: 100 }}
                      />
                    ) : (
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
                        <IconButton
                          size="small"
                          onClick={() => handleDecrement(supply.id)}
                          disabled={supply.supplyAmount === 0}
                        >
                          <RemoveIcon />
                        </IconButton>
                        <Typography sx={{ minWidth: 40, textAlign: 'center' }}>
                          {supply.supplyAmount}
                        </Typography>
                        <IconButton size="small" onClick={() => handleIncrement(supply.id)}>
                          <AddIcon />
                        </IconButton>
                      </Box>
                    )}
                  </TableCell>
                  <TableCell align="center">
                    {editingId === supply.id ? (
                      <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
                        <Button size="small" variant="contained" onClick={saveEditing}>
                          บันทึก
                        </Button>
                        <Button size="small" variant="outlined" onClick={cancelEditing}>
                          ยกเลิก
                        </Button>
                      </Box>
                    ) : (
                      <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
                        <IconButton size="small" onClick={() => startEditing(supply)}>
                          <EditIcon />
                        </IconButton>
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => handleDelete(supply.id)}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Box>
                    )}
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={3} align="center" sx={{ py: 3, color: 'text.secondary' }}>
                  ไม่พบข้อมูล
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>

        {/* Pagination */}
        {filteredSupplies.length > 0 && (
          <StandardPagination
            count={filteredSupplies.length}
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

      <AddSupplyModal
        open={openAddModal}
        onClose={() => setOpenAddModal(false)}
        onSuccess={loadSupplies}
      />
    </Box>
  );
};

export default SupplyInventoryPage;
