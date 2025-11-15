import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Alert,
  Box,
  Typography,
  IconButton,
  Paper,
  List,
  ListItem,
  ListItemText,
  Collapse,
  Chip,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import { importInvoicesFromCsv } from '../../api/invoice';

const CsvImportModal = ({ open, onClose, onSuccess, ...props}) => {
  const [file, setFile] = useState(null);
  const [importing, setImporting] = useState(false);
  const [result, setResult] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const [showInstructions, setShowInstructions] = useState(true);
  const [showErrors, setShowErrors] = useState(false);
  const [error, setError] = useState('');

  const handleClose = () => {
    setFile(null);
    setImporting(false);
    setResult(null);
    setDragActive(false);
    setError('');
    onClose();
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleFileSelect = (selectedFile) => {
    if (!selectedFile.name.endsWith('.csv')) {
      setError('กรุณาเลือกไฟล์ CSV เท่านั้น');
      return;
    }

    if (selectedFile.size > 5 * 1024 * 1024) {
      setError('ไฟล์ใหญ่เกิน 5MB');
      return;
    }

    setFile(selectedFile);
    setError('');
    setResult(null);
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleFileSelect(e.target.files[0]);
    }
  };

  const handleImport = async () => {
    if (!file) {
      setError('กรุณาเลือกไฟล์ CSV');
      return;
    }

    setImporting(true);
    setError('');

    try {
      const importResult = await importInvoicesFromCsv(file);
      setResult(importResult);

      // If all succeeded, close after 2 seconds
      if (importResult.failureCount === 0) {
        setTimeout(() => {
          if (onSuccess) onSuccess();
          handleClose();
        }, 2000);
      }
    } catch (err) {
      setError(err.message || 'ไม่สามารถนำเข้าข้อมูลได้');
    } finally {
      setImporting(false);
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth {...props}>
        <DialogTitle>
            <Box display="flex" justifyContent="space-between" alignItems="center">
                <Typography variant="h6" data-cy="csv-import-modal-title">
                    นำเข้าใบแจ้งหนี้จาก CSV
                </Typography>
                <IconButton
                    onClick={handleClose}
                    size="small"
                    disabled={importing}
                    data-cy="csv-import-modal-close-button"
                >
                    <CloseIcon />
                </IconButton>
            </Box>
        </DialogTitle>

        <DialogContent>
            {error && (
                <Alert
                    severity="error"
                    onClose={() => setError('')}
                    sx={{ mb: 2 }}
                    data-cy="csv-import-modal-error-alert"
                >
                    {error}
                </Alert>
            )}

            {/* Instructions */}
            <Paper
                variant="outlined"
                sx={{ mb: 3, p: 2, backgroundColor: '#f5f5f5', cursor: 'pointer' }}
                onClick={() => setShowInstructions(!showInstructions)}
                data-cy="csv-import-modal-instructions-toggle"
            >
                <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Typography variant="subtitle2" color="primary">
                        รูปแบบไฟล์ CSV
                    </Typography>
                    {showInstructions ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                </Box>

                <Collapse in={showInstructions} data-cy="csv-import-modal-instructions-content">
                    <Box sx={{ mt: 2 }}>
                        <Typography variant="body2" gutterBottom>
                            ไฟล์ CSV ต้องมีคอลัมน์ดังนี้ (ตามลำดับ):
                        </Typography>
                        <Typography
                            variant="body2"
                            component="pre"
                            sx={{
                                backgroundColor: '#fff',
                                p: 1,
                                borderRadius: 1,
                                fontSize: '0.85rem',
                                overflowX: 'auto',
                            }}
                            data-cy="csv-import-modal-instructions-example"
                        >
                            {`Room Number, Electricity Units, Water Units, Billing Month, Billing Year, Electricity Rate, Water Rate
101, 150, 10, 11, 2025, 8.00, 18.00
102, 120, 8, 11, 2025, 8.00, 18.00`}
                        </Typography>
                        <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 1 }}>
                            • ห้องที่ไม่มีในระบบจะถูกข้าม<br />
                            • ใบแจ้งหนี้ที่มีอยู่แล้วจะถูกข้าม<br />
                            • วันออกใบแจ้งหนี้: วันที่ 1 ของเดือน<br />
                            • วันครบกำหนด: วันที่ 1 + 7 วัน
                        </Typography>
                    </Box>
                </Collapse>
            </Paper>

            {/* Drag & Drop Zone */}
            {!result && (
                <Paper
                    variant="outlined"
                    onDragEnter={handleDrag}
                    onDragLeave={handleDrag}
                    onDragOver={handleDrag}
                    onDrop={handleDrop}
                    sx={{
                        p: 4,
                        textAlign: 'center',
                        border: dragActive ? '2px dashed #1976d2' : '2px dashed #ccc',
                        backgroundColor: dragActive ? '#e3f2fd' : '#fafafa',
                        cursor: 'pointer',
                        transition: 'all 0.3s',
                    }}
                    data-cy="csv-import-modal-dropzone"
                >
                    <CloudUploadIcon sx={{ fontSize: 48, color: dragActive ? '#1976d2' : '#999', mb: 2 }} />
                    <Typography variant="body1" gutterBottom>
                        ลากไฟล์มาที่นี่ หรือ
                    </Typography>
                    <Button
                        variant="contained"
                        component="label"
                        disabled={importing}
                        sx={{ mt: 1 }}
                        data-cy="csv-import-modal-select-file-button"
                    >
                        เลือกไฟล์
                        <input
                            type="file"
                            hidden
                            accept=".csv"
                            onChange={handleFileChange}
                            data-cy="csv-import-modal-file-input"
                        />
                    </Button>
                </Paper>
            )}

            {/* Selected File Info */}
            {file && !result && (
                <Box sx={{ mt: 2 }}>
                    <Alert severity="info" data-cy="csv-import-modal-selected-file-alert">
                        <strong>ไฟล์ที่เลือก:</strong> {file.name} ({(file.size / 1024).toFixed(2)} KB)
                        <Button
                            size="small"
                            onClick={() => setFile(null)}
                            sx={{ ml: 2 }}
                            data-cy="csv-import-modal-remove-file-button"
                        >
                            เปลี่ยน
                        </Button>
                    </Alert>
                </Box>
            )}

            {/* Import Result */}
            {result && (
                <Box sx={{ mt: 2 }} data-cy="csv-import-modal-result-summary">
                    <Alert
                        severity={result.failureCount === 0 ? 'success' : 'warning'}
                        icon={result.failureCount === 0 ? <CheckCircleIcon /> : <ErrorIcon />}
                        data-cy="csv-import-modal-result-alert"
                    >
                        <Typography variant="subtitle2" gutterBottom>
                            การนำเข้าเสร็จสิ้น
                        </Typography>
                        <Box sx={{ display: 'flex', gap: 2, mt: 1 }}>
                            <Chip
                                label={`สำเร็จ: ${result.successCount}`}
                                color="success"
                                size="small"
                                data-cy="csv-import-modal-result-success-chip"
                            />
                            <Chip
                                label={`ล้มเหลว: ${result.failureCount}`}
                                color="error"
                                size="small"
                                data-cy="csv-import-modal-result-failure-chip"
                            />
                            <Chip
                                label={`ทั้งหมด: ${result.totalProcessed}`}
                                size="small"
                                data-cy="csv-import-modal-result-total-chip"
                            />
                        </Box>
                    </Alert>

                    {result.errors && result.errors.length > 0 && (
                        <Paper
                            variant="outlined"
                            sx={{ mt: 2, p: 2 }}
                            data-cy="csv-import-modal-result-errors-container"
                        >
                            <Box
                                display="flex"
                                justifyContent="space-between"
                                alignItems="center"
                                sx={{ cursor: 'pointer' }}
                                onClick={() => setShowErrors(!showErrors)}
                                data-cy="csv-import-modal-result-errors-toggle"
                            >
                                <Typography variant="subtitle2" color="error">
                                    รายละเอียดข้อผิดพลาด ({result.errors.length})
                                </Typography>
                                {showErrors ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                            </Box>

                            <Collapse in={showErrors}>
                                <List
                                    dense
                                    sx={{ mt: 1, maxHeight: 200, overflow: 'auto' }}
                                    data-cy="csv-import-modal-result-errors-list"
                                >
                                    {result.errors.map((err, index) => (
                                        <ListItem key={index} data-cy={`csv-import-modal-result-error-item-${index}`}>
                                            <ListItemText
                                                primary={err}
                                                primaryTypographyProps={{ variant: 'caption', color: 'error' }}
                                            />
                                        </ListItem>
                                    ))}
                                </List>
                            </Collapse>
                        </Paper>
                    )}
                </Box>
            )}
        </DialogContent>

        <DialogActions>
            <Button
                onClick={handleClose}
                disabled={importing}
                data-cy="csv-import-modal-cancel-button"
            >
                {result ? 'ปิด' : 'ยกเลิก'}
            </Button>
            {!result && (
                <Button
                    onClick={handleImport}
                    variant="contained"
                    disabled={!file || importing}
                    data-cy="csv-import-modal-submit-button"
                >
                    {importing ? 'กำลังนำเข้า...' : 'นำเข้าข้อมูล'}
                </Button>
            )}
        </DialogActions>
    </Dialog>
  );
};

export default CsvImportModal;