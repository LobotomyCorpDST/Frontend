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
    getTenantRoomsTrend,
    getMonthAllRoomsComparison,
} from '../../api/report';
import http from '../../api/http';
import ElectricityTrendChart from '../Charts/ElectricityTrendChart';
import WaterTrendChart from '../Charts/WaterTrendChart';
import FloorComparisonPieChart from '../Charts/FloorComparisonPieChart';
import MonthRoomsUsageChart from '../Charts/MonthRoomsUsageChart';
import SmartSearchAutocomplete from '../Common/SmartSearchAutocomplete';

const SummaryReport = (props) => {
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

    // Feature 4A: Tenant room trends state
    const [tenantRoomTrends, setTenantRoomTrends] = useState([]);
    const [tenantTrendLoading, setTenantTrendLoading] = useState(false);

    // Feature 4B: Month all rooms comparison state
    const [monthRoomsData, setMonthRoomsData] = useState([]);
    const [monthRoomsLoading, setMonthRoomsLoading] = useState(false);
    const [selectedFloor, setSelectedFloor] = useState(null);

    useEffect(() => {
        loadRoomsAndTenants();
    }, []);

    // Load summary table data
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

    // Load chart data
    useEffect(() => {
        if (filterType === 'room' && selectedRoom) {
            loadChartData();
            loadFloorComparisonData();
            setTenantRoomTrends([]);
            setMonthRoomsData([]);
        } else if (filterType === 'tenant' && selectedTenant) {
            loadTenantRoomTrends();
            setTrendData([]);
            setFloorComparisonData([]);
            setMonthRoomsData([]);
        } else if (filterType === 'month' && selectedYear && selectedMonth) {
            loadMonthAllRoomsData();
            setTrendData([]);
            setFloorComparisonData([]);
            setTenantRoomTrends([]);
        } else {
            setTrendData([]);
            setFloorComparisonData([]);
            setTenantRoomTrends([]);
            setMonthRoomsData([]);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedRoom, selectedTenant, selectedYear, selectedMonth, trendMonths, filterType]);

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

    const loadTenantRoomTrends = async () => {
        if (!selectedTenant) {
            setTenantRoomTrends([]);
            return;
        }

        setTenantTrendLoading(true);
        try {
            const data = await getTenantRoomsTrend(selectedTenant, trendMonths);
            setTenantRoomTrends(data || []);
        } catch (e) {
            console.error('Failed to load tenant room trends:', e);
            setTenantRoomTrends([]);
        } finally {
            setTenantTrendLoading(false);
        }
    };

    const loadMonthAllRoomsData = async () => {
        if (!selectedYear || !selectedMonth) {
            setMonthRoomsData([]);
            return;
        }

        setMonthRoomsLoading(true);
        try {
            const data = await getMonthAllRoomsComparison(selectedYear, selectedMonth);
            setMonthRoomsData(data || []);
        } catch (e) {
            console.error('Failed to load month all rooms data:', e);
            setMonthRoomsData([]);
        } finally {
            setMonthRoomsLoading(false);
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
            { label: 'จำนวนใบแจ้งหนี้', value: summary.totalInvoices, color: '#1976d2', dataCyKey: 'total-invoices' },
            { label: 'ค่าเช่ารวม (บาท)', value: formatCurrency(summary.totalRentBaht), color: '#2e7d32', dataCyKey: 'total-rent' },
            { label: 'ค่าไฟรวม (หน่วย)', value: formatCurrency(summary.totalElectricityUnits), color: '#ed6c02', dataCyKey: 'total-elec-units' },
            { label: 'ค่าไฟรวม (บาท)', value: formatCurrency(summary.totalElectricityBaht), color: '#ed6c02', dataCyKey: 'total-elec-baht' },
            { label: 'ค่าน้ำรวม (หน่วย)', value: formatCurrency(summary.totalWaterUnits), color: '#0288d1', dataCyKey: 'total-water-units' },
            { label: 'ค่าน้ำรวม (บาท)', value: formatCurrency(summary.totalWaterBaht), color: '#0288d1', dataCyKey: 'total-water-baht' },
            { label: 'ค่าบำรุงรักษา (บาท)', value: formatCurrency(summary.totalMaintenanceBaht), color: '#d32f2f', dataCyKey: 'total-maintenance' },
            { label: 'ค่าส่วนกลาง (บาท)', value: formatCurrency(summary.totalCommonFeeBaht), color: '#7b1fa2', dataCyKey: 'total-common-fee' },
            { label: 'ค่าขยะ (บาท)', value: formatCurrency(summary.totalGarbageFeeBaht), color: '#616161', dataCyKey: 'total-garbage-fee' },
            { label: 'ค่าอื่นๆ (บาท)', value: formatCurrency(summary.totalOtherBaht), color: '#455a64', dataCyKey: 'total-other' },
            { label: 'รวมทั้งหมด (บาท)', value: formatCurrency(summary.grandTotalBaht), color: '#1565c0', highlight: true, dataCyKey: 'grand-total' },
        ];

        return (
            <Grid container spacing={2} sx={{ mb: 3 }} data-cy="summary-report-cards-container">
                {cards.map((card, idx) => (
                    <Grid item xs={12} sm={6} key={idx} data-cy={`summary-report-card-${card.dataCyKey}`}>
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
                                <Typography
                                    variant="h6"
                                    sx={{ fontWeight: 'bold', color: card.color }}
                                    data-cy={`summary-report-card-value-${card.dataCyKey}`}
                                >
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
                <Typography
                    sx={{ textAlign: 'center', py: 3 }}
                    data-cy="summary-report-invoice-table-no-data-message"
                >
                    ไม่มีข้อมูลใบแจ้งหนี้
                </Typography>
            );
        }

        return (
            <TableContainer
                component={Paper}
                sx={{ mt: 3 }}
                data-cy="summary-report-invoice-table-container"
            >
                <Table data-cy="summary-report-invoice-table">
                    <TableHead data-cy="summary-report-invoice-table-header">
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
                    <TableBody data-cy="summary-report-invoice-table-body">
                        {summary.invoices.map((invoice) => (
                            <TableRow
                                key={invoice.id}
                                sx={{ '&:hover': { backgroundColor: '#f5f5f5' } }}
                                data-cy={`summary-report-invoice-row-${invoice.id}`}
                            >
                                <TableCell data-cy={`summary-report-invoice-cell-room-${invoice.id}`}>{invoice.room?.number || 'N/A'}</TableCell>
                                <TableCell data-cy={`summary-report-invoice-cell-tenant-${invoice.id}`}>{invoice.tenant?.name || 'N/A'}</TableCell>
                                <TableCell data-cy={`summary-report-invoice-cell-monthyear-${invoice.id}`}>
                                    {invoice.billingMonth}/{invoice.billingYear}
                                </TableCell>
                                <TableCell data-cy={`summary-report-invoice-cell-issue-date-${invoice.id}`}>{invoice.issueDate}</TableCell>
                                <TableCell data-cy={`summary-report-invoice-cell-elec-units-${invoice.id}`}>{formatCurrency(invoice.electricityUnits)}</TableCell>
                                <TableCell data-cy={`summary-report-invoice-cell-water-units-${invoice.id}`}>{formatCurrency(invoice.waterUnits)}</TableCell>
                                <TableCell data-cy={`summary-report-invoice-cell-total-${invoice.id}`}>{formatCurrency(invoice.totalBaht)}</TableCell>
                                <TableCell>
                                    <Chip
                                        size="small"
                                        label={invoice.status === 'PAID' ? 'ชำระแล้ว' : 'ยังไม่ชำระ'}
                                        color={invoice.status === 'PAID' ? 'success' : 'warning'}
                                        data-cy={`summary-report-invoice-cell-status-chip-${invoice.id}`}
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
        // Show appropriate message when no filter is selected
        if (!selectedRoom && !selectedTenant && (!selectedYear || !selectedMonth)) {
            return (
                <Paper
                    sx={{ p: 5, textAlign: 'center', height: '100%' }}
                    data-cy="summary-report-graph-no-filter-state"
                >
                    <Typography color="text.secondary" variant="h6">
                        เลือกตัวกรองเพื่อดูกราฟ
                    </Typography>
                    <Typography color="text.secondary" variant="body2" sx={{ mt: 2 }}>
                        กราฟจะแสดงการใช้ไฟฟ้าและน้ำประปาตามประเภทที่เลือก
                    </Typography>
                </Paper>
            );
        }

        // ROOM VIEW
        if (filterType === 'room' && selectedRoom) {
            if (chartLoading) {
                return (
                    <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}>
                        <CircularProgress />
                    </Box>
                );
            }

            return (
                <Box>
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

                    <Box sx={{ display: 'flex', gap: 2, flexDirection: { xs: 'column', md: 'row' }, width: '100%' }}>
                        <Box sx={{ flex: 1, minWidth: 0 }}>
                            <ElectricityTrendChart
                                data={trendData}
                                metric={chartMetric}
                                height={400}
                                roomNumber={selectedRoom}
                            />
                        </Box>
                        <Box sx={{ flex: 1, minWidth: 0 }}>
                            <WaterTrendChart
                                data={trendData}
                                metric={chartMetric}
                                height={400}
                                roomNumber={selectedRoom}
                            />
                        </Box>
                    </Box>

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
        }

        // TENANT VIEW
        if (filterType === 'tenant' && selectedTenant) {
            if (tenantTrendLoading) {
                return (
                    <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}>
                        <CircularProgress />
                    </Box>
                );
            }

            return (
                <Box>
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

                    {tenantRoomTrends.length === 0 ? (
                        <Typography sx={{ textAlign: 'center', py: 3 }}>
                            ไม่พบห้องที่เช่าโดยผู้เช่านี้
                        </Typography>
                    ) : (
                        tenantRoomTrends.map((roomTrend) => (
                            <Box key={roomTrend.roomId} sx={{ mb: 4 }}>
                                <Typography variant="h6" gutterBottom>
                                    ห้อง {roomTrend.roomNumber}
                                </Typography>
                                <Box sx={{ display: 'flex', gap: 2, flexDirection: { xs: 'column', md: 'row' }, width: '100%' }}>
                                    <Box sx={{ flex: 1, minWidth: 0 }}>
                                        <ElectricityTrendChart
                                            data={roomTrend.monthlyTrends}
                                            metric={chartMetric}
                                            height={300}
                                            roomNumber={roomTrend.roomNumber}
                                        />
                                    </Box>
                                    <Box sx={{ flex: 1, minWidth: 0 }}>
                                        <WaterTrendChart
                                            data={roomTrend.monthlyTrends}
                                            metric={chartMetric}
                                            height={300}
                                            roomNumber={roomTrend.roomNumber}
                                        />
                                    </Box>
                                </Box>
                                <Divider sx={{ mt: 3 }} />
                            </Box>
                        ))
                    )}
                </Box>
            );
        }

        // MONTH VIEW
        if (filterType === 'month' && selectedYear && selectedMonth) {
            if (monthRoomsLoading) {
                return (
                    <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}>
                        <CircularProgress />
                    </Box>
                );
            }

            const floors = [...new Set(monthRoomsData.map(r => Math.floor(r.roomNumber / 100)))].sort();
            const filteredRooms = selectedFloor != null
                ? monthRoomsData.filter((room) => Math.floor(room.roomNumber / 100) === Number(selectedFloor))
                : monthRoomsData;

            return (
                <Box>
                    <Box sx={{ mb: 3, display: 'flex', justifyContent: 'center', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
                        <ToggleButtonGroup
                            value={chartMetric}
                            exclusive
                            onChange={(e, value) => value && setChartMetric(value)}
                            size="small"
                        >
                            <ToggleButton value="units">หน่วย</ToggleButton>
                            <ToggleButton value="baht">บาท</ToggleButton>
                        </ToggleButtonGroup>

                        <FormControl size="small" sx={{ minWidth: 150 }}>
                            <InputLabel>กรองตามชั้น</InputLabel>
                            <Select
                                value={selectedFloor || ''}
                                onChange={(e) => setSelectedFloor(e.target.value || null)}
                                label="กรองตามชั้น"
                            >
                                <MenuItem value="">ทุกชั้น</MenuItem>
                                {floors.map((floor) => (
                                    <MenuItem key={floor} value={floor}>
                                        ชั้น {floor}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </Box>

                    {monthRoomsData.length === 0 ? (
                        <Typography sx={{ textAlign: 'center', py: 3 }}>
                            ไม่พบข้อมูลห้องสำหรับเดือนที่เลือก
                        </Typography>
                    ) : (
                        <>
                            <MonthRoomsUsageChart
                                data={monthRoomsData}
                                metric={chartMetric}
                                selectedFloor={selectedFloor}
                                year={selectedYear}
                                month={selectedMonth}
                            />

                            {filteredRooms.length === 0 ? (
                                <Typography sx={{ textAlign: 'center', py: 3 }}>
                                    ไม่พบข้อมูลสำหรับชั้นที่เลือก
                                </Typography>
                            ) : (
                                <TableContainer component={Paper} sx={{ mt: 3 }}>
                                    <Table>
                                        <TableHead>
                                            <TableRow sx={{ backgroundColor: '#1d3e7d' }}>
                                                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>ห้อง</TableCell>
                                                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>ไฟฟ้า (หน่วย)</TableCell>
                                                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>ไฟฟ้า (บาท)</TableCell>
                                                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>น้ำ (หน่วย)</TableCell>
                                                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>น้ำ (บาท)</TableCell>
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {filteredRooms.map((room) => (
                                                <TableRow key={room.roomNumber} sx={{ '&:hover': { backgroundColor: '#f5f5f5' } }}>
                                                    <TableCell>ห้อง {room.roomNumber}</TableCell>
                                                    <TableCell>{formatCurrency(room.electricityUnits)}</TableCell>
                                                    <TableCell>{formatCurrency(room.electricityBaht)}</TableCell>
                                                    <TableCell>{formatCurrency(room.waterUnits)}</TableCell>
                                                    <TableCell>{formatCurrency(room.waterBaht)}</TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </TableContainer>
                            )}
                        </>
                    )}
                </Box>
            );
        }

        return null;
    };

    return (
        <Box sx={{ p: 2 }} {...props} data-cy="summary-report-page">

            {/* Filter Controls */}
            <Paper sx={{ p: 3, mb: 3 }} data-cy="summary-report-filters-container">

                <Typography variant="h6" gutterBottom>ตัวกรอง</Typography>

                {/* Container บรรทัดที่ 1: ใช้ justifyContent="space-between" เพื่อดันซ้าย-ขวา */}
                <Grid container spacing={2} alignItems="center" justifyContent="space-between">

                    {/* 1. กลุ่มซ้าย: Filter Type */}
                    <Grid item xs={12} md={4}>
                        <FormControl fullWidth size="small" sx={{ minWidth: 150 }}>
                            <InputLabel>ประเภทการกรอง</InputLabel>
                            <Select
                                value={filterType}
                                onChange={handleFilterTypeChange}
                                label="ประเภทการกรอง"
                                data-cy="summary-report-filter-type-select"
                            >
                                <MenuItem value="room" data-cy="summary-report-filter-room">ตามห้อง</MenuItem>
                                <MenuItem value="tenant" data-cy="summary-report-filter-tenant">ตามผู้เช่า</MenuItem>
                                <MenuItem value="month" data-cy="summary-report-filter-month">ตามเดือน</MenuItem>
                            </Select>
                        </FormControl>
                    </Grid>

                    {/* 2. กลุ่มขวา: Checkbox + Year + Month */}
                    {/* ใช้ Grid Item แล้วข้างในใช้ Box Flex จัดชิดขวา */}
                    <Grid item xs={12} md={8}>
                        <Box sx={{ 
                            display: 'flex', 
                            justifyContent: { xs: 'flex-start', md: 'flex-end' }, // จอเล็กชิดซ้าย จอใหญ่ชิดขวา
                            alignItems: 'center', 
                            gap: 2,
                            flexWrap: 'wrap' 
                        }}>

                            {/* Year & Month Selectors (แสดงเมื่อเลือก 'month' หรือ 'room' และติ๊ก checkbox) */}
                            {(filterType === 'month' || (filterType === 'room' && includeMonthFilter)) && (
                                <>
                                    <FormControl size="small" sx={{ minWidth: 100 }}>
                                        <InputLabel>ปี</InputLabel>
                                        <Select
                                            value={selectedYear}
                                            onChange={(e) => setSelectedYear(e.target.value)}
                                            label="ปี"
                                            data-cy="summary-report-year-select"
                                        >
                                            {[2024, 2025, 2026].map((y) => <MenuItem key={y} value={y}>{y}</MenuItem>)}
                                        </Select>
                                    </FormControl>

                                    <FormControl size="small" sx={{ minWidth: 100 }}>
                                        <InputLabel>เดือน</InputLabel>
                                        <Select
                                            value={selectedMonth}
                                            onChange={(e) => setSelectedMonth(e.target.value)}
                                            label="เดือน"
                                            data-cy="summary-report-month-select"
                                        >
                                            {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => <MenuItem key={m} value={m}>{m}</MenuItem>)}
                                        </Select>
                                    </FormControl>
                                </>
                            )}

                            {/* Checkbox (แสดงเฉพาะตอนเลือก 'room') */}
                            {filterType === 'room' && (
                                <FormControlLabel
                                    control={
                                        <Checkbox
                                            checked={includeMonthFilter}
                                            onChange={(e) => setIncludeMonthFilter(e.target.checked)}
                                            color="primary"
                                            data-cy="summary-report-room-month-filter-checkbox"
                                        />
                                    }
                                    label="กรองตามเดือน"
                                    sx={{ whiteSpace: 'nowrap', mr: 1 }}
                                />
                            )}

                        </Box>
                    </Grid>
                </Grid>

                {/* Search Box: แยกออกมาอยู่บรรทัดล่าง และเต็มความกว้าง */}
                {(filterType === 'room' || filterType === 'tenant') && (
                    <Box sx={{ mt: 2, width: '100%' }}>
                         <SmartSearchAutocomplete
                            options={
                                filterType === 'room' 
                                ? rooms.map((r) => ({
                                    id: r.id,
                                    label: `ห้อง ${r.number}${r.tenantName ? ` - ${r.tenantName}` : ''}`,
                                    value: r.number,
                                    searchText: `${r.number} ${r.tenantName || ''}`,
                                }))
                                : tenants.map((t) => ({
                                    id: t.id,
                                    label: t.name,
                                    value: t.id,
                                    searchText: t.name,
                                }))
                            }
                            label={filterType === 'room' ? "เลือกห้อง" : "เลือกผู้เช่า"}
                            value={filterType === 'room' ? selectedRoom : selectedTenant}
                            onChange={(value) => filterType === 'room' ? setSelectedRoom(value) : setSelectedTenant(value)}
                            placeholder={filterType === 'room' ? "พิมพ์เพื่อค้นหา..." : "พิมพ์ชื่อผู้เช่า..."}
                            fullWidth
                            data-cy={filterType === 'room' ? "summary-report-room-search" : "summary-report-tenant-search"}
                        />
                    </Box>
                )}

            </Paper>

            <Divider sx={{ my: 3 }} />

            {/* ... View Toggle & Content ... */}
            <Paper
                sx={{ p: 2, mb: 3, display: 'flex', justifyContent: 'center' }}
                data-cy="summary-report-view-toggle-container"
            >
                <ToggleButtonGroup
                    value={viewMode}
                    exclusive
                    onChange={(e, value) => value && setViewMode(value)}
                    aria-label="view mode"
                    data-cy="summary-report-view-toggle-group"
                >
                    <ToggleButton value="summary" data-cy="summary-report-view-toggle-summary-button">สรุป</ToggleButton>
                    <ToggleButton value="graph" data-cy="summary-report-view-toggle-graph-button">กราฟ</ToggleButton>
                </ToggleButtonGroup>
            </Paper>

            {viewMode === 'summary' && (
                <>
                    {loading && (
                        <Box sx={{ display: 'flex', justifyContent: 'center', py: 5 }}>
                            <CircularProgress />
                        </Box>
                    )}
                    {error && !loading && (
                        <Typography color="error" sx={{ textAlign: 'center', py: 3 }}>{error}</Typography>
                    )}
                    {!loading && !error && summary && (
                        <>
                            {renderSummaryCards()}
                            {renderInvoicesTable()}
                        </>
                    )}
                    {!loading && !error && !summary && (
                        <Paper sx={{ p: 5, textAlign: 'center' }}>
                            <Typography color="text.secondary">เลือกตัวกรองเพื่อแสดงข้อมูลสรุป</Typography>
                        </Paper>
                    )}
                </>
            )}

            {viewMode === 'graph' && renderChartSection()}
        </Box>
    );
};

export default SummaryReport;
