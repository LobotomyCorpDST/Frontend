import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip, Legend, Cell } from 'recharts';
import { Paper, Typography, Box } from '@mui/material';

const FloorComparisonPieChart = ({ data, metric, height = 400, roomNumber }) => {
  if (!data || data.length === 0) {
    return (
      <Paper sx={{ p: 3, height }}>
        <Typography variant="h6" gutterBottom>
          การเปรียบเทียบห้องในชั้นเดียวกัน
        </Typography>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80%' }}>
          <Typography color="text.secondary">ไม่มีข้อมูลสำหรับชั้นนี้</Typography>
        </Box>
      </Paper>
    );
  }

  const metricLabel = metric === 'units' ? 'หน่วย' : 'บาท';

  // Prepare data for bar chart - include BOTH electricity AND water
  const chartData = data.map(room => ({
    name: `ห้อง ${room.roomNumber}`,
    electricity: metric === 'units'
      ? parseFloat(room.electricityUnits || 0)
      : parseFloat(room.electricityBaht || 0),
    water: metric === 'units'
      ? parseFloat(room.waterUnits || 0)
      : parseFloat(room.waterBaht || 0),
    isSelected: room.isSelected,
    roomNumber: room.roomNumber
  }));

  // Custom tooltip
  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <Paper sx={{ p: 1.5, bgcolor: 'rgba(255, 255, 255, 0.95)' }}>
          <Typography variant="body2" sx={{ fontWeight: 'bold', color: data.isSelected ? '#FF9800' : '#1976D2' }}>
            {data.name}
            {data.isSelected && ' (เลือก)'}
          </Typography>
          <Typography variant="body2" sx={{ color: '#42a5f5' }}>
            ค่าไฟ: {data.electricity.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} {metricLabel}
          </Typography>
          <Typography variant="body2" sx={{ color: '#26c6da' }}>
            ค่าน้ำ: {data.water.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} {metricLabel}
          </Typography>
        </Paper>
      );
    }
    return null;
  };

  // Extract floor number from room number
  const floor = Math.floor(roomNumber / 100);

  return (
    <Paper sx={{ p: 3, height }}>
      <Typography variant="h6" gutterBottom sx={{ textAlign: 'center' }}>
        การเปรียบเทียบการใช้งานในชั้น {floor}
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', mb: 2 }}>
        {metric === 'units' ? 'การใช้ไฟฟ้าและน้ำ (หน่วย)' : 'ค่าไฟฟ้าและน้ำ (บาท)'}
      </Typography>

      <ResponsiveContainer width="100%" height={height - 100}>
        <BarChart
          data={chartData}
          layout="vertical"
          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            type="number"
            label={{ value: metricLabel, position: 'insideBottom', offset: -5 }}
          />
          <YAxis
            type="category"
            dataKey="name"
            width={80}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend />
          <Bar dataKey="electricity" name="ค่าไฟ" fill="#42a5f5">
            {chartData.map((entry, index) => (
              <Cell
                key={`cell-elec-${index}`}
                fill={entry.isSelected ? '#FF9800' : '#42a5f5'}
                stroke={entry.isSelected ? '#F57C00' : '#1976D2'}
                strokeWidth={entry.isSelected ? 3 : 1}
              />
            ))}
          </Bar>
          <Bar dataKey="water" name="ค่าน้ำ" fill="#26c6da">
            {chartData.map((entry, index) => (
              <Cell
                key={`cell-water-${index}`}
                fill={entry.isSelected ? '#FFB74D' : '#26c6da'}
                stroke={entry.isSelected ? '#F57C00' : '#0097A7'}
                strokeWidth={entry.isSelected ? 3 : 1}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </Paper>
  );
};

export default FloorComparisonPieChart;
