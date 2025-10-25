import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Box, Typography, Paper } from '@mui/material';

/**
 * Line chart showing ONLY electricity usage trend over time
 */
const ElectricityTrendChart = ({ data, metric = 'units', height = 300, roomNumber }) => {
  if (!data || data.length === 0) {
    return (
      <Paper sx={{ p: 3, mb: 2 }}>
        <Typography variant="h6" sx={{ mb: 2, color: 'primary.main' }}>
          ค่าไฟฟ้า
        </Typography>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height }}>
          <Typography color="text.secondary">ไม่มีข้อมูลค่าไฟฟ้า</Typography>
        </Box>
      </Paper>
    );
  }

  // Format data for the chart
  const chartData = data.map(item => {
    const [year, month] = item.month.split('-');
    const monthNames = ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.',
                        'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'];
    const monthIndex = parseInt(month, 10) - 1;
    const monthLabel = monthNames[monthIndex] || month;

    return {
      name: `${monthLabel} ${parseInt(year) + 543}`, // Buddhist Era
      value: metric === 'units'
        ? parseFloat(item.electricityUnits || 0)
        : parseFloat(item.electricityBaht || 0),
      month: item.month
    };
  });

  const unit = metric === 'units' ? 'หน่วย' : 'บาท';

  // Custom tooltip
  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <Box
          sx={{
            backgroundColor: 'rgba(0, 0, 0, 0.87)',
            color: 'white',
            padding: 2,
            borderRadius: 1,
            boxShadow: 3,
          }}
        >
          <Typography variant="body2" sx={{ fontWeight: 'bold', mb: 0.5 }}>
            {data.name}
          </Typography>
          <Typography variant="body2" sx={{ color: '#42a5f5' }}>
            ค่าไฟ: {data.value.toLocaleString()} {unit}
          </Typography>
        </Box>
      );
    }
    return null;
  };

  return (
    <Paper sx={{ p: 2, mb: 2, width: '100%' }}>
      <Typography variant="h6" sx={{ mb: 2, color: 'primary.main' }}>
        ค่าไฟฟ้า{roomNumber ? ` - ห้อง ${roomNumber}` : ''}
      </Typography>
      <ResponsiveContainer width="100%" height={height}>
        <LineChart data={chartData} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis label={{ value: unit, angle: -90, position: 'insideLeft' }} />
          <Tooltip content={<CustomTooltip />} />
          <Legend />
          <Line
            type="monotone"
            dataKey="value"
            stroke="#42a5f5"
            strokeWidth={3}
            name="ค่าไฟ"
            dot={{ r: 5, fill: '#42a5f5' }}
            activeDot={{ r: 7 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </Paper>
  );
};

export default ElectricityTrendChart;
