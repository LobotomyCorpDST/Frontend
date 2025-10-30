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
  ToggleButtonGroup,
  ToggleButton,
  Checkbox,
  FormControlLabel,
} from '@mui/material';
import {
  getSummaryByRoomNumber,
  getSummaryByRoomNumberAndMonth,
  getSummaryByTenant,
  getSummaryByMonth,
  getMonthlyTrend,
  getFloorRoomsComparison,
} from '../../api/report';
import http from '../../api/http';
import ElectricityTrendChart from '../Charts/ElectricityTrendChart';
import WaterTrendChart from '../Charts/WaterTrendChart';
import FloorComparisonPieChart from '../Charts/FloorComparisonPieChart';
import SmartSearchAutocomplete from '../Common/SmartSearchAutocomplete';

const SummaryReport = () => {
  // Filter state
  const [filterType, setFilterType] = useState('room');
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

  // Chart state (independent from summary)
  const [chartMetric, setChartMetric] = useState('units');
  const [trendData, setTrendData] = useState([]);
  const [trendMonths, setTrendMonths] = useState(6);
  const [chartLoading, setChartLoading] = useState(false);

  // Floor comparison state (pie chart)
  const [floorComparisonData, setFloorComparisonData] = useState([]);
  const [floorComparisonLoading, setFloorComparisonLoading] = useState(false);

  // View mode state (summary or graph)
  const [viewMode, setViewMode] = useState('summary');

  useEffect(() => {
    loadRoomsAndTenants();
  }, []);

  // Load summary table data (right side)
  useEffect(() => {
    if (filterType === 'room' && selectedRoom) {
      loadSummary();
    } else if (filterType === 'tenant' && selectedTenant) {
      loadSummary();
    } else if (filterType === 'month' && selectedYear && selectedMonth) {
      loadSummary();
    } else {
      setSummary(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterType, selectedRoom, selectedTenant, selectedYear, selectedMonth, includeMonthFilter]);

  // Load chart data (left side) - ONLY for room selection
  useEffect(() => {
    if (filterType === 'room' && selectedRoom) {
      loadChartData();
      loadFloorComparisonData();
    } else {
      setTrendData([]);
      setFloorComparisonData([]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedRoom, trendMonths, filterType]);

  const loadRoomsAndTenants = async () => {
    try {
      const [roomsData, tenantsData] = await Promise.all([
        http.get('/api/rooms'),
        http.get('/api/tenants'),
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

  const loadChartData = async () => {
    if (!selectedRoom) {
      setTrendData([]);
      return;
    }

    setChartLoading(true);
    try {
      const data = await getMonthlyTrend(selectedRoom, trendMonths);
      setTrendData(data || []);
    } catch (e) {
      console.error('Failed to load chart data:', e);
      setTrendData([]);
    } finally {
      setChartLoading(false);
    }
  };

  const loadFloorComparisonData = async () => {
    if (!selectedRoom) {
      setFloorComparisonData([]);
      return;
    }

    setFloorComparisonLoading(true);
    try {
      const data = await getFloorRoomsComparison(selectedRoom);
      setFloorComparisonData(data || []);
    } catch (e) {
      console.error('Failed to load floor comparison data:', e);
      setFloorComparisonData([]);
    } finally {
      setFloorComparisonLoading(false);
    }
  };

  const handleFilterTypeChange = (e) => {
    setFilterType(e.target.value);
    setSummary(null);
    setSelectedRoom('');
    setSelectedTenant('');
    setIncludeMonthFilter(false);
    setTrendData([]);
    setFloorComparisonData([]);
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
          <Grid item xs={12} sm={6} key={idx}>
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
                <Typography variant="h6" sx={{ fontWeight: 'bold', color: card.color }}>
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

  const renderChartSection = () => {
    // Only show charts when room is selected
    if (filterType !== 'room' || !selectedRoom) {
      return (
        <Paper sx={{ p: 5, textAlign: 'center', height: '100%' }}>
          <Typography color="text.secondary" variant="h6">
            เลือกห้องเพื่อดูกราฟแนวโน้มการใช้งาน
          </Typography>
          <Typography color="text.secondary" variant="body2" sx={{ mt: 2 }}>
            กราฟจะแสดงการใช้ไฟฟ้าและน้ำประปาตามเดือน
          </Typography>
        </Paper>
      );
    }

    if (chartLoading) {
      return (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}>
          <CircularProgress />
        </Box>
      );
    }

    return (
      <Box>
        {/* Metric Toggle */}
        <Box sx={{ mb: 3, display: 'flex', justifyContent: 'center', gap: 2, alignItems: 'center' }}>
          <ToggleButtonGroup
            value={chartMetric}
            exclusive
            onChange={(e, value) => value && setChartMetric(value)}
            size="small"
          >
            <ToggleButton value="units">หน่วย</ToggleButton>
            <ToggleButton value="baht">บาท</ToggleButton>
          </ToggleButtonGroup>

          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>ช่วงเวลา</InputLabel>
            <Select
              value={trendMonths}
              onChange={(e) => setTrendMonths(e.target.value)}
              label="ช่วงเวลา"
            >
              <MenuItem value={3}>3 เดือน</MenuItem>
              <MenuItem value={6}>6 เดือน</MenuItem>
              <MenuItem value={12}>12 เดือน</MenuItem>
              <MenuItem value={24}>24 เดือน</MenuItem>
            </Select>
          </FormControl>
        </Box>

        {/* Charts in Horizontal Layout - Full Width */}
        <Box sx={{
          display: 'flex',
          gap: 2,
          flexDirection: { xs: 'column', md: 'row' },
          width: '100%'
        }}>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            {/* Electricity Chart */}
            <ElectricityTrendChart
              data={trendData}
              metric={chartMetric}
              height={400}
              roomNumber={selectedRoom}
            />
          </Box>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            {/* Water Chart */}
            <WaterTrendChart
              data={trendData}
              metric={chartMetric}
              height={400}
              roomNumber={selectedRoom}
            />
          </Box>
        </Box>

        {/* Floor Comparison Pie Chart - Full Width Below */}
        <Box sx={{ mt: 3, width: '100%' }}>
          {floorComparisonLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 5 }}>
              <CircularProgress />
            </Box>
          ) : (
            <FloorComparisonPieChart
              data={floorComparisonData}
              metric={chartMetric}
              height={450}
              roomNumber={selectedRoom}
            />
          )}
        </Box>
      </Box>
    );
  };

  return (
    <Box sx={{ p: 2 }}>
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

          {/* Room Selector with Smart Search */}
          {filterType === 'room' && (
            <>
              <Grid item xs={12} sm={9} md={9}>
                <SmartSearchAutocomplete
                  options={rooms.map((r) => ({
                    id: r.id,
                    label: `ห้อง ${r.number}${r.tenantName ? ` - ${r.tenantName}` : ''}`,
                    value: r.number,
                    searchText: `${r.number} ${r.tenantName || ''}`,
                  }))}
                  label="เลือกห้อง"
                  value={selectedRoom}
                  onChange={(value) => setSelectedRoom(value)}
                  placeholder="พิมพ์เพื่อค้นหา..."
                />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={includeMonthFilter}
                      onChange={(e) => setIncludeMonthFilter(e.target.checked)}
                    />
                  }
                  label="กรองตามเดือน"
                />
              </Grid>
            </>
          )}

          {/* Tenant Selector with Smart Search */}
          {filterType === 'tenant' && (
            <Grid item xs={12} sm={9} md={9}>
              <SmartSearchAutocomplete
                options={tenants.map((t) => ({
                  id: t.id,
                  label: t.name,
                  value: t.id,
                  searchText: t.name,
                }))}
                label="เลือกผู้เช่า"
                value={selectedTenant}
                onChange={(value) => setSelectedTenant(value)}
                placeholder="พิมพ์ชื่อผู้เช่า..."
              />
            </Grid>
          )}

          {/* Month/Year Selectors */}
          {(filterType === 'month' || (filterType === 'room' && includeMonthFilter)) && (
            <>
              <Grid item xs={12} sm={6} md={3}>
                <FormControl fullWidth>
                  <InputLabel>ปี</InputLabel>
                  <Select
                    value={selectedYear}
                    onChange={(e) => setSelectedYear(e.target.value)}
                    label="ปี"
                  >
                    {[2024, 2025, 2026].map((y) => (
                      <MenuItem key={y} value={y}>
                        {y}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <FormControl fullWidth>
                  <InputLabel>เดือน</InputLabel>
                  <Select
                    value={selectedMonth}
                    onChange={(e) => setSelectedMonth(e.target.value)}
                    label="เดือน"
                  >
                    {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                      <MenuItem key={m} value={m}>
                        {m}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            </>
          )}
        </Grid>
      </Paper>

      <Divider sx={{ my: 3 }} />

      {/* View Mode Toggle */}
      <Paper sx={{ p: 2, mb: 3, display: 'flex', justifyContent: 'center' }}>
        <ToggleButtonGroup
          value={viewMode}
          exclusive
          onChange={(e, value) => value && setViewMode(value)}
          aria-label="view mode"
        >
          <ToggleButton value="summary" aria-label="summary view">
            สรุป
          </ToggleButton>
          <ToggleButton value="graph" aria-label="graph view">
            กราฟ
          </ToggleButton>
        </ToggleButtonGroup>
      </Paper>

      {/* Main Content - Full Width */}
      {/* Summary View */}
      {viewMode === 'summary' && (
        <>
          {loading && (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 5 }}>
              <CircularProgress />
            </Box>
          )}

          {error && !loading && (
            <Typography color="error" sx={{ textAlign: 'center', py: 3 }}>
              {error}
            </Typography>
          )}

          {!loading && !error && summary && (
            <>
              {renderSummaryCards()}
              {renderInvoicesTable()}
            </>
          )}

          {!loading && !error && !summary && (
            <Paper sx={{ p: 5, textAlign: 'center' }}>
              <Typography color="text.secondary">
                เลือกตัวกรองเพื่อแสดงข้อมูลสรุป
              </Typography>
            </Paper>
          )}
        </>
      )}

      {/* Graph View */}
      {viewMode === 'graph' && renderChartSection()}
    </Box>
  );
};

export default SummaryReport;
