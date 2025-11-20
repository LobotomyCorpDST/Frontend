import React from 'react';
import {
    ResponsiveContainer,
    BarChart,
    Bar,
    CartesianGrid,
    XAxis,
    YAxis,
    Tooltip,
    Legend,
} from 'recharts';
import { Paper, Typography, Box } from '@mui/material';

const MonthRoomsUsageChart = ({
    data = [],
    metric = 'units',
    selectedFloor = null,
    height = 420,
    year,
    month,
}) => {
    const filteredData = selectedFloor != null
        ? data.filter((room) => Math.floor(room.roomNumber / 100) === Number(selectedFloor))
        : data;

    const chartData = filteredData.map((room) => ({
        name: `ห้อง ${room.roomNumber}`,
        electricity: metric === 'units'
            ? Number(room.electricityUnits || 0)
            : Number(room.electricityBaht || 0),
        water: metric === 'units'
            ? Number(room.waterUnits || 0)
            : Number(room.waterBaht || 0),
    }));

    const metricLabel = metric === 'units' ? 'หน่วย' : 'บาท';

    if (chartData.length === 0) {
        return (
            <Paper sx={{ p: 3 }} data-cy="month-rooms-chart-no-data">
                <Typography variant="h6" gutterBottom>
                    ยังไม่มีข้อมูลสำหรับชั้นที่เลือก
                </Typography>
                <Typography color="text.secondary">
                    กรุณาเลือกชั้นอื่น หรือเลือก "ทุกชั้น"
                </Typography>
            </Paper>
        );
    }

    return (
        <Paper sx={{ p: 3 }} data-cy="month-rooms-chart-container">
            <Typography variant="h6" gutterBottom>
                การใช้ไฟฟ้าและน้ำ - เดือน {month} / {year} {selectedFloor != null ? `(ชั้น ${selectedFloor})` : '(ทุกชั้น)'}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                แสดงเปรียบเทียบไฟฟ้าและน้ำของแต่ละห้องในเดือนที่เลือก ({metricLabel})
            </Typography>
            <Box sx={{ width: '100%', height }}>
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                        data={chartData}
                        margin={{ top: 10, right: 30, left: 0, bottom: 20 }}
                    >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" angle={-20} textAnchor="end" height={70} />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="electricity" name={`ไฟฟ้า (${metricLabel})`} fill="#42a5f5" />
                        <Bar dataKey="water" name={`น้ำ (${metricLabel})`} fill="#26c6da" />
                    </BarChart>
                </ResponsiveContainer>
            </Box>
        </Paper>
    );
};

export default MonthRoomsUsageChart;
