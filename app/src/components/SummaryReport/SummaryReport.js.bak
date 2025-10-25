import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress,
  Chip,
  Divider,
} from '@mui/material';
import { getSummaryByRoomNumber, getSummaryByRoomNumberAndMonth, getSummaryByTenant, getSummaryByMonth } from '../../api/report';
import http from '../../api/http';

const SummaryReport = () => {
  // Filter state
  const [filterType, setFilterType] = useState('room'); // 'room', 'tenant', 'month'
  const [selectedRoom, setSelectedRoom] = useState('');
  const [selectedTenant, setSelectedTenant] = useState('');
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [includeMonthFilter, setIncludeMonthFilter] = useState(false);

  // Data state
  const [rooms, setRooms] = useState([]);
  const [tenants, setTenants] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Load rooms and tenants on mount
  useEffect(() => {
    loadRoomsAndTenants();
  }, []);

  // Auto-load summary when filters change
  useEffect(() => {
    if (filterType === 'room' && selectedRoom) {
      loadSummary();
    } else if (filterType === 'tenant' && selectedTenant) {
      loadSummary();
    } else if (filterType === 'month' && selectedYear && selectedMonth) {
      loadSummary();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterType, selectedRoom, selectedTenant, selectedYear, selectedMonth, includeMonthFilter]);

  const loadRoomsAndTenants = async () => {
    try {
      const [roomsData, tenantsData] = await Promise.all([
        http.get('/api/rooms'),
        http.get('/api/tenants')
      ]);
      setRooms(roomsData || []);
      setTenants(tenantsData || []);
    } catch (e) {
      setError('Failed to load rooms and tenants');
    }
  };

  const loadSummary = async () => {
    setLoading(true);
    setError('');
    setSummary(null);

    try {
      let data;
      if (filterType === 'room') {
        if (includeMonthFilter) {
          data = await getSummaryByRoomNumberAndMonth(selectedRoom, selectedYear, selectedMonth);
        } else {
          data = await getSummaryByRoomNumber(selectedRoom);
        }
      } else if (filterType === 'tenant') {
        data = await getSummaryByTenant(selectedTenant);
      } else if (filterType === 'month') {
        data = await getSummaryByMonth(selectedYear, selectedMonth);
      }
      setSummary(data);
    } catch (e) {
      setError(e?.message || 'Failed to load summary');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterTypeChange = (e) => {
    setFilterType(e.target.value);
    setSummary(null);
    setSelectedRoom('');
    setSelectedTenant('');
    setIncludeMonthFilter(false);
  };

  const formatCurrency = (n) => {
    if (n == null) return '0.00';
    return Number(n).toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  const renderSummaryCards = () => {
    if (!summary) return null;

    const cards = [
      { label: 'จำนวนใบแจ้งหนี้', value: summary.totalInvoices, color: '#1976d2' },
      { label: 'ค่าเช่ารวม (บาท)', value: formatCurrency(summary.totalRentBaht), color: '#2e7d32' },
      { label: 'ค่าไฟรวม (หน่วย)', value: formatCurrency(summary.totalElectricityUnits), color: '#ed6c02' },
      { label: 'ค่าไฟรวม (บาท)', value: formatCurrency(summary.totalElectricityBaht), color: '#ed6c02' },
      { label: 'ค่าน้ำรวม (หน่วย)', value: formatCurrency(summary.totalWaterUnits), color: '#0288d1' },
      { label: 'ค่าน้ำรวม (บาท)', value: formatCurrency(summary.totalWaterBaht), color: '#0288d1' },
      { label: 'ค่าบำรุงรักษา (บาท)', value: formatCurrency(summary.totalMaintenanceBaht), color: '#d32f2f' },
      { label: 'ค่าส่วนกลาง (บาท)', value: formatCurrency(summary.totalCommonFeeBaht), color: '#7b1fa2' },
      { label: 'ค่าขยะ (บาท)', value: formatCurrency(summary.totalGarbageFeeBaht), color: '#616161' },
      { label: 'ค่าอื่นๆ (บาท)', value: formatCurrency(summary.totalOtherBaht), color: '#455a64' },
      { label: 'รวมทั้งหมด (บาท)', value: formatCurrency(summary.grandTotalBaht), color: '#1565c0', highlight: true },
    ];

    return (
      <Grid container spacing={2} sx={{ mb: 3 }}>
        {cards.map((card, idx) => (
          <Grid item xs={12} sm={6} md={4} key={idx}>
            <Card
              sx={{
                borderLeft: `4px solid ${card.color}`,
                backgroundColor: card.highlight ? '#e3f2fd' : 'white',
              }}
            >
              <CardContent>
                <Typography variant="subtitle2" color="text.secondary">
                  {card.label}
                </Typography>
                <Typography variant="h5" sx={{ fontWeight: 'bold', color: card.color }}>
                  {card.value}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    );
  };

  const renderInvoicesTable = () => {
    if (!summary || !summary.invoices || summary.invoices.length === 0) {
      return (
        <Typography sx={{ textAlign: 'center', py: 3 }}>
          ไม่มีข้อมูลใบแจ้งหนี้
        </Typography>
      );
    }

    return (
      <TableContainer component={Paper} sx={{ mt: 3 }}>
        <Table>
          <TableHead>
            <TableRow sx={{ backgroundColor: '#1d3e7d' }}>
              <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>ห้อง</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>ผู้เช่า</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>เดือน/ปี</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>วันมอบหมาย</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>ค่าไฟ (หน่วย)</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>ค่าน้ำ (หน่วย)</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>ยอดรวม (บาท)</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>สถานะ</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {summary.invoices.map((invoice) => (
              <TableRow key={invoice.id} sx={{ '&:hover': { backgroundColor: '#f5f5f5' } }}>
                <TableCell>{invoice.room?.number || 'N/A'}</TableCell>
                <TableCell>{invoice.tenant?.name || 'N/A'}</TableCell>
                <TableCell>
                  {invoice.billingMonth}/{invoice.billingYear}
                </TableCell>
                <TableCell>{invoice.issueDate}</TableCell>
                <TableCell>{formatCurrency(invoice.electricityUnits)}</TableCell>
                <TableCell>{formatCurrency(invoice.waterUnits)}</TableCell>
                <TableCell>{formatCurrency(invoice.totalBaht)}</TableCell>
                <TableCell>
                  <Chip
                    size="small"
                    label={invoice.status === 'PAID' ? 'ชำระแล้ว' : 'ยังไม่ชำระ'}
                    color={invoice.status === 'PAID' ? 'success' : 'warning'}
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    );
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold', color: 'primary.main', mb: 3 }}>
        รายงานสรุป
      </Typography>

      {/* Filter Controls */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          ตัวกรอง
        </Typography>
        <Grid container spacing={2}>
          {/* Filter Type */}
          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth>
              <InputLabel>ประเภทการกรอง</InputLabel>
              <Select value={filterType} onChange={handleFilterTypeChange} label="ประเภทการกรอง">
                <MenuItem value="room">ตามห้อง</MenuItem>
                <MenuItem value="tenant">ตามผู้เช่า</MenuItem>
                <MenuItem value="month">ตามเดือน</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          {/* Room Selector */}
          {filterType === 'room' && (
            <>
              <Grid item xs={12} sm={6} md={3}>
                <FormControl fullWidth>
                  <InputLabel>เลือกห้อง</InputLabel>
                  <Select
                    value={selectedRoom}
                    onChange={(e) => setSelectedRoom(e.target.value)}
                    label="เลือกห้อง"
                  >
                    {rooms.map((room) => (
                      <MenuItem key={room.id} value={room.number}>
                        ห้อง {room.number}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              {/* Month filter for room */}
              <Grid item xs={12} sm={6} md={3}>
                <FormControl fullWidth>
                  <InputLabel>กรองตามเดือน</InputLabel>
                  <Select
                    value={includeMonthFilter ? 'yes' : 'no'}
                    onChange={(e) => setIncludeMonthFilter(e.target.value === 'yes')}
                    label="กรองตามเดือน"
                  >
                    <MenuItem value="no">ทั้งหมด</MenuItem>
                    <MenuItem value="yes">เฉพาะเดือนที่เลือก</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              {includeMonthFilter && (
                <>
                  <Grid item xs={6} sm={3} md={1.5}>
                    <FormControl fullWidth>
                      <InputLabel>เดือน</InputLabel>
                      <Select
                        value={selectedMonth}
                        onChange={(e) => setSelectedMonth(e.target.value)}
                        label="เดือน"
                      >
                        {[...Array(12)].map((_, i) => (
                          <MenuItem key={i + 1} value={i + 1}>
                            {i + 1}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={6} sm={3} md={1.5}>
                    <FormControl fullWidth>
                      <InputLabel>ปี</InputLabel>
                      <Select
                        value={selectedYear}
                        onChange={(e) => setSelectedYear(e.target.value)}
                        label="ปี"
                      >
                        {[...Array(5)].map((_, i) => {
                          const year = new Date().getFullYear() - i;
                          return (
                            <MenuItem key={year} value={year}>
                              {year}
                            </MenuItem>
                          );
                        })}
                      </Select>
                    </FormControl>
                  </Grid>
                </>
              )}
            </>
          )}

          {/* Tenant Selector */}
          {filterType === 'tenant' && (
            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth>
                <InputLabel>เลือกผู้เช่า</InputLabel>
                <Select
                  value={selectedTenant}
                  onChange={(e) => setSelectedTenant(e.target.value)}
                  label="เลือกผู้เช่า"
                >
                  {tenants.map((tenant) => (
                    <MenuItem key={tenant.id} value={tenant.id}>
                      {tenant.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          )}

          {/* Month/Year Selector */}
          {filterType === 'month' && (
            <>
              <Grid item xs={6} sm={3} md={2}>
                <FormControl fullWidth>
                  <InputLabel>เดือน</InputLabel>
                  <Select
                    value={selectedMonth}
                    onChange={(e) => setSelectedMonth(e.target.value)}
                    label="เดือน"
                  >
                    {[...Array(12)].map((_, i) => (
                      <MenuItem key={i + 1} value={i + 1}>
                        {i + 1}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={6} sm={3} md={2}>
                <FormControl fullWidth>
                  <InputLabel>ปี</InputLabel>
                  <Select
                    value={selectedYear}
                    onChange={(e) => setSelectedYear(e.target.value)}
                    label="ปี"
                  >
                    {[...Array(5)].map((_, i) => {
                      const year = new Date().getFullYear() - i;
                      return (
                        <MenuItem key={year} value={year}>
                          {year}
                        </MenuItem>
                      );
                    })}
                  </Select>
                </FormControl>
              </Grid>
            </>
          )}
        </Grid>
      </Paper>

      {/* Loading State */}
      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 5 }}>
          <CircularProgress />
          <Typography sx={{ ml: 2 }}>กำลังโหลดข้อมูล...</Typography>
        </Box>
      )}

      {/* Error State */}
      {error && (
        <Paper sx={{ p: 3, backgroundColor: '#ffebee' }}>
          <Typography color="error">{error}</Typography>
        </Paper>
      )}

      {/* Summary Display */}
      {!loading && !error && summary && (
        <>
          {/* Summary Header */}
          <Paper sx={{ p: 2, mb: 3, backgroundColor: '#e3f2fd' }}>
            <Typography variant="h6">
              {filterType === 'room' && `ห้อง ${summary.roomNumber}`}
              {filterType === 'tenant' && `ผู้เช่า: ${summary.tenantName}`}
              {filterType === 'month' && `เดือน ${summary.month}/${summary.year}`}
              {includeMonthFilter && filterType === 'room' && ` - เดือน ${summary.month}/${summary.year}`}
            </Typography>
          </Paper>

          {/* Summary Cards */}
          {renderSummaryCards()}

          <Divider sx={{ my: 3 }} />

          {/* Invoices Table */}
          <Typography variant="h6" gutterBottom>
            รายละเอียดใบแจ้งหนี้
          </Typography>
          {renderInvoicesTable()}
        </>
      )}

      {/* No data state */}
      {!loading && !error && !summary && (
        <Paper sx={{ p: 5, textAlign: 'center' }}>
          <Typography color="text.secondary">
            เลือกตัวกรองเพื่อดูรายงานสรุป
          </Typography>
        </Paper>
      )}
    </Box>
  );
};

export default SummaryReport;
