import React, { useEffect, useState } from 'react';
import { listMaintenanceByRoomNumber } from '../../api/maintenance';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Link,
  Typography,
  Chip,
  Box,
} from '@mui/material';

// ---------- Helper functions ----------
const formatDate = (dateString) => {
  if (!dateString) return '';
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
    case 'CANCELED':
      return <Chip label="ยกเลิก" color="default" size="small" />;
    default:
      return <Chip label={status || '-'} size="small" />;
  }
};

// ---------- Main Component ----------
export default function MaintenanceHistory({ roomNumber, searchTerm }) {
  const [loading, setLoading] = useState(true);
  const [maintenanceList, setMaintenanceList] = useState([]);
  const [filtered, setFiltered] = useState([]);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        if (!roomNumber) {
          console.warn('roomNumber is missing — fetching skipped');
          setMaintenanceList([]);
          return;
        }

        const data = await listMaintenanceByRoomNumber(roomNumber);
        const list = data || [];
        setMaintenanceList(list);
        setFiltered(list);
      } catch (err) {
        console.error('Failed to fetch maintenance list:', err);
        setMaintenanceList([]);
        setFiltered([]);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [roomNumber]);

  // ---------- Filter ----------
  useEffect(() => {
    if (!searchTerm) {
      setFiltered(maintenanceList);
      return;
    }

    const lower = searchTerm.toLowerCase();
    const filteredData = maintenanceList.filter((item) => {
      const referenceNumber = `C${item.roomNumber}0${item.id}`.toLowerCase();
      return (
        item.roomNumber.toString().includes(lower) ||
        item.id.toString().includes(lower) ||
        referenceNumber.includes(lower) ||
        item.description.toLowerCase().includes(lower) ||
        item.status.toLowerCase().includes(lower)
      );
    });
    setFiltered(filteredData);
  }, [searchTerm, maintenanceList]);

  // ---------- Render ----------
  if (loading) {
    return <Typography>Loading...</Typography>;
  }

  return (
    <TableContainer component={Paper} sx={{ mt: 1 }}>
      <Table sx={{ maxWidth: '96%', margin: 'auto', tableLayout: 'fixed' }} aria-label="maintenance history table">
        <TableHead sx={{ backgroundColor: '#13438B' }}>
          <TableRow>
            <TableCell sx={{ fontWeight: 'bold', color: '#FFFFFF' }}>หมายเลขอ้างอิง</TableCell>
            <TableCell sx={{ fontWeight: 'bold', color: '#FFFFFF' }}>ผู้รับผิดชอบ</TableCell>
            <TableCell sx={{ fontWeight: 'bold', color: '#FFFFFF' }}>ประเภท</TableCell>
            <TableCell sx={{ fontWeight: 'bold', color: '#FFFFFF' }}>กำหนดการ</TableCell>
            <TableCell sx={{ fontWeight: 'bold', color: '#FFFFFF' }}>สถานะ</TableCell>
            <TableCell sx={{ fontWeight: 'bold', color: '#FFFFFF' }}>รายละเอียด</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {filtered.length > 0 ? (
            filtered.map((item) => (
              <TableRow key={item.id} sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                <TableCell component="th" scope="row">
                  <Link href="#" underline="hover" sx={{ fontWeight: 'bold' }}>
                    {`C${item.roomNumber}0${item.id}`}
                  </Link>
                </TableCell>
                <TableCell>
                  <Box>
                    <Typography variant="body2">นาย ช่าง หัวมัน</Typography>
                    <Typography variant="caption" color="text.secondary">
                      0000000008
                    </Typography>
                  </Box>
                </TableCell>
                <TableCell>ประปา</TableCell>
                <TableCell>{formatDate(item.completedDate || item.scheduledDate)}</TableCell>
                <TableCell>{renderStatus(item.status)}</TableCell>
                <TableCell>{item.description}</TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={6} sx={{ textAlign: 'center', py: 3, color: 'text.secondary' }}>
                ไม่พบข้อมูล
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
