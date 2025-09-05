import React, { useEffect, useState } from 'react';
import {
  Box,
  Paper,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  Tooltip,
  CircularProgress,
} from '@mui/material';

import AddIcon from '@mui/icons-material/Add';
import PrintIcon from '@mui/icons-material/Print';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import TaskAltIcon from '@mui/icons-material/TaskAlt';
import UndoIcon from '@mui/icons-material/Undo';

import {
  listInvoicesByRoom,
  openInvoice,
  markPaid,
  markUnpaid,
  computeDisplayStatus,
} from '../../api/invoice';

function fmt(n) {
  if (n == null) return '-';
  return Number(n).toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export default function RoomInvoiceTable({
  roomId,
  onCreateClick,
  showCreateButton = true, // <- ใช้ควบคุมการแสดงปุ่มสร้างใบแจ้งหนี้เดิม
}) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    if (!roomId) return;
    setLoading(true);
    try {
      const data = await listInvoicesByRoom(roomId);
      setItems(data);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roomId]);

  async function doMarkPaid(id) {
    const today = new Date().toISOString().slice(0, 10);
    await markPaid(id, today);
    await load();
  }

  async function doUnpaid(id) {
    await markUnpaid(id);
    await load();
  }

  function renderStatusChip(inv) {
    const label = computeDisplayStatus(inv); // e.g. 'Paid' | 'Overdue' | 'Not yet paid'
    const colorMap = {
      paid: 'success',
      overdue: 'error',
      'not yet paid': 'warning',
    };
    const key = (label || '').toLowerCase();
    return <Chip size="small" label={label} color={colorMap[key] || 'default'} />;
  }

  const actionBtnSx = { borderRadius: 2, textTransform: 'none', fontWeight: 600, px: 2 };

  return (
    <Box>
      {/* ปุ่มสร้างใบแจ้งหนี้ส่วนหัว (ซ่อน/แสดงได้ด้วยพร็อพ) */}
      {showCreateButton && (
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
          <Button
            variant="contained"
            color="primary"
            size="small"
            startIcon={<AddIcon />}
            disableElevation
            sx={actionBtnSx}
            onClick={onCreateClick}
          >
            สร้างใบแจ้งหนี้
          </Button>
        </Box>
      )}

      <TableContainer component={Paper} variant="outlined">
        <Table stickyHeader size="small">
          <TableHead>
            <TableRow>
              <TableCell>วันที่ออกบิล</TableCell>
              <TableCell>ยอดรวม (บาท)</TableCell>
              <TableCell>สถานะ</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={4} align="center">
                  <CircularProgress size={22} />
                </TableCell>
              </TableRow>
            ) : items.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} align="center">
                  ยังไม่มีใบแจ้งหนี้
                </TableCell>
              </TableRow>
            ) : (
              items.map((inv) => (
                <TableRow key={inv.id}>
                  <TableCell>{inv.issueDate}</TableCell>
                  <TableCell>{fmt(inv.totalBaht)}</TableCell>
                  <TableCell>{renderStatusChip(inv)}</TableCell>
                  <TableCell align="right">
                    <Tooltip title="เปิดหน้าพิมพ์">
                      <IconButton size="small" onClick={() => openInvoice(inv.id, 'print')}>
                        <PrintIcon fontSize="inherit" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="เปิดไฟล์ PDF">
                      <IconButton
                        size="small"
                        sx={{ ml: 0.5 }}
                        onClick={() => openInvoice(inv.id, 'pdf')}
                      >
                        <PictureAsPdfIcon fontSize="inherit" />
                      </IconButton>
                    </Tooltip>

                    {inv.status === 'PAID' ? (
                      <Tooltip title="เปลี่ยนเป็นยังไม่ชำระ">
                        <Button
                          size="small"
                          variant="outlined"
                          color="warning"
                          sx={{ ml: 1, ...actionBtnSx, px: 1.5 }}
                          startIcon={<UndoIcon />}
                          onClick={() => doUnpaid(inv.id)}
                        >
                          Mark Unpaid
                        </Button>
                      </Tooltip>
                    ) : (
                      <Tooltip title="ทำเครื่องหมายว่าชำระแล้ว">
                        <Button
                          size="small"
                          variant="contained"
                          color="success"
                          sx={{ ml: 1, ...actionBtnSx, px: 1.5 }}
                          startIcon={<TaskAltIcon />}
                          onClick={() => doMarkPaid(inv.id)}
                        >
                          Mark Paid
                        </Button>
                      </Tooltip>
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}
