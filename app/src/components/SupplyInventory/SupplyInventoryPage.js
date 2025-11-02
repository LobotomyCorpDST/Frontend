import React, { useState, useEffect, useMemo } from 'react';
import {
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Button,
  IconButton,
  Typography,
  Chip,
  Alert,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import { getAllSupplies, incrementSupply, decrementSupply, deleteSupply, updateSupply } from '../../api/supply';
import AddSupplyModal from './AddSupplyModal';
import SmartSearchAutocomplete from '../Common/SmartSearchAutocomplete';

const headerCellStyle = {
  backgroundColor: '#13438B',
  color: '#f8f9fa',
  fontWeight: 'bold',
  padding: '12px',
};

const SupplyInventoryPage = () => {
  const [allSupplies, setAllSupplies] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [openAddModal, setOpenAddModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState('');
  const [editAmount, setEditAmount] = useState('');

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

  // Convert supplies to searchable options for SmartSearch
  const searchOptions = useMemo(() => {
    return allSupplies.map((supply) => ({
      id: supply.id,
      label: `${supply.supplyName} (${supply.supplyAmount} ชิ้น)`,
      value: supply.id,
      searchText: `${supply.supplyName} ${supply.supplyAmount}`,
    }));
  }, [allSupplies]);

  // Filter supplies based on selected search value
  const filteredSupplies = useMemo(() => {
    if (!searchTerm) return allSupplies;
    return allSupplies.filter((supply) => supply.id === searchTerm);
  }, [allSupplies, searchTerm]);

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
        <Box sx={{ flex: 1, maxWidth: 400 }}>
          <SmartSearchAutocomplete
            options={searchOptions}
            label="ค้นหาวัสดุ"
            value={searchTerm}
            onChange={(value) => setSearchTerm(value)}
            placeholder="พิมพ์ชื่อวัสดุหรือจำนวน..."
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

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell sx={headerCellStyle}>ชื่อของ</TableCell>
              <TableCell sx={headerCellStyle} align="center">
                จำนวน
              </TableCell>
              <TableCell sx={headerCellStyle} align="center">
                การจัดการ
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={3} align="center">
                  กำลังโหลด...
                </TableCell>
              </TableRow>
            ) : filteredSupplies.length === 0 ? (
              <TableRow>
                <TableCell colSpan={3} align="center">
                  ไม่พบข้อมูล
                </TableCell>
              </TableRow>
            ) : (
              filteredSupplies.map((supply) => (
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
            )}
          </TableBody>
        </Table>
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
