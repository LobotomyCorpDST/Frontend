import React, { useState, useEffect } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Button,
    Alert,
    Box,
    Typography,
    IconButton,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import { getInvoiceSettings, updateInvoiceSettings, uploadQrCode } from '../../api/invoiceSettings';

const InvoiceSettingsModal = ({ open, onClose, onSuccess, ...props }) => {
    const [paymentDescription, setPaymentDescription] = useState('');
    const [interestRatePerMonth, setInterestRatePerMonth] = useState('2.00');
    const [qrFile, setQrFile] = useState(null);
    const [qrPreview, setQrPreview] = useState(null);
    const [currentQrPath, setCurrentQrPath] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    useEffect(() => {
        if (open) {
            loadSettings();
        }
    }, [open]);

    const loadSettings = async () => {
        try {
            const settings = await getInvoiceSettings();
            setPaymentDescription(settings.paymentDescription || '');
            setInterestRatePerMonth(settings.interestRatePerMonth?.toString() || '2.00');
            setCurrentQrPath(settings.qrCodeImagePath);
        } catch (err) {
            console.error('Failed to load settings:', err);
            // Use defaults if loading fails
        }
    };

    const handleClose = () => {
        setPaymentDescription('');
        setInterestRatePerMonth('2.00');
        setQrFile(null);
        setQrPreview(null);
        setCurrentQrPath(null);
        setError('');
        setSuccess('');
        onClose();
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        if (file.size > 10 * 1024 * 1024) {
            setError('ไฟล์ใหญ่เกิน 10MB');
            return;
        }

        if (!['image/jpeg', 'image/png', 'image/jpg'].includes(file.type)) {
            setError('กรุณาเลือกไฟล์ JPG หรือ PNG เท่านั้น');
            return;
        }

        setQrFile(file);
        setQrPreview(URL.createObjectURL(file));
        setError('');
    };

    const handleSave = async () => {
        // Validate
        const rate = parseFloat(interestRatePerMonth);
        if (isNaN(rate) || rate < 0 || rate > 100) {
            setError('อัตราดอกเบี้ยต้องอยู่ระหว่าง 0-100%');
            return;
        }

        setLoading(true);
        setError('');
        setSuccess('');

        try {
            // 1. Update text settings
            await updateInvoiceSettings({
                paymentDescription: paymentDescription.trim(),
                interestRatePerMonth: rate,
            });

            // 2. Upload QR if new file selected
            if (qrFile) {
                await uploadQrCode(qrFile);
            }

            setSuccess('บันทึกการตั้งค่าสำเร็จ');

            if (onSuccess) onSuccess();

            setTimeout(() => {
                handleClose();
            }, 1500);
        } catch (err) {
            setError(err.message || 'ไม่สามารถบันทึกการตั้งค่าได้');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth {...props}>
            <DialogTitle>
                <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Typography variant="h6" data-cy="invoice-settings-modal-title">
                        ตั้งค่าใบแจ้งหนี้
                    </Typography>
                    <IconButton
                        onClick={handleClose}
                        size="small"
                        data-cy="invoice-settings-modal-close-button"
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
                        data-cy="invoice-settings-modal-error-alert"
                    >
                        {error}
                    </Alert>
                )}

                {success && (
                    <Alert
                        severity="success"
                        sx={{ mb: 2 }}
                        data-cy="invoice-settings-modal-success-alert"
                    >
                        {success}
                    </Alert>
                )}

                {/* Payment Description */}
                <TextField
                    label="รายละเอียดการชำระเงิน (ธนาคาร, เลขบัญชี)"
                    multiline
                    rows={6}
                    fullWidth
                    margin="normal"
                    value={paymentDescription}
                    onChange={(e) => setPaymentDescription(e.target.value)}
                    helperText="จะแสดงในใบแจ้งหนี้สำหรับผู้เช่า (เช่น ธนาคาร, เลขบัญชี, ชื่อบัญชี)"
                    placeholder={`ธนาคารกสิกรไทย\nบัญชีออมทรัพย์\nเลขที่ 123-4-56789-0\nชื่อบัญชี: อพาร์ทเมนต์ABC`}
                    data-cy="invoice-settings-modal-payment-desc-input"
                />

                {/* Interest Rate */}
                <TextField
                    label="อัตราดอกเบี้ยต่อเดือน (%)"
                    type="number"
                    fullWidth
                    margin="normal"
                    value={interestRatePerMonth}
                    onChange={(e) => setInterestRatePerMonth(e.target.value)}
                    inputProps={{ step: 0.01, min: 0, max: 100 }}
                    helperText="สำหรับการชำระล่าช้า (เช่น 2 = 2% ต่อเดือน)"
                    data-cy="invoice-settings-modal-interest-rate-input"
                />

                {/* QR Code Upload */}
                <Box sx={{ mt: 3 }} data-cy="invoice-settings-modal-qr-section">
                    <Typography variant="subtitle1" gutterBottom>
                        QR Code สำหรับชำระเงิน
                    </Typography>

                    <Button
                        variant="outlined"
                        component="label"
                        startIcon={<CloudUploadIcon />}
                        sx={{ mb: 2 }}
                        data-cy="invoice-settings-modal-qr-select-button"
                    >
                        เลือกไฟล์ QR Code
                        <input
                            type="file"
                            hidden
                            accept="image/jpeg,image/png,image/jpg"
                            onChange={handleFileChange}
                            data-cy="invoice-settings-modal-qr-file-input"
                        />
                    </Button>

                    <Typography variant="caption" display="block" color="text.secondary" sx={{ mb: 2 }}>
                        รองรับไฟล์ JPG, PNG สูงสุด 10MB
                    </Typography>

                    {/* QR Preview */}
                    {(qrPreview || currentQrPath) && (
                        <Box
                            sx={{
                                border: '1px solid #ccc',
                                borderRadius: 1,
                                p: 2,
                                textAlign: 'center',
                                backgroundColor: '#f9f9f9',
                            }}
                            data-cy="invoice-settings-modal-qr-preview-container"
                        >
                            <Typography variant="caption" display="block" sx={{ mb: 1 }}>
                                {qrFile ? 'QR Code ใหม่ (ยังไม่ได้บันทึก)' : 'QR Code ปัจจุบัน'}
                            </Typography>
                            <img
                                src={qrPreview || `${process.env.REACT_APP_API || 'https://apt.krentiz.dev/api'}/uploads/${currentQrPath}`}
                                alt="QR Code Preview"
                                style={{ maxWidth: '200px', maxHeight: '200px', border: '1px solid #ddd' }}
                                data-cy="invoice-settings-modal-qr-preview-image"
                            />
                            {qrFile && (
                                <Typography
                                    variant="caption"
                                    display="block"
                                    sx={{ mt: 1 }}
                                    data-cy="invoice-settings-modal-qr-new-file-name"
                                >
                                    {qrFile.name} ({(qrFile.size / 1024).toFixed(2)} KB)
                                </Typography>
                            )}
                        </Box>
                    )}
                </Box>
            </DialogContent>

            <DialogActions>
                <Button
                    onClick={handleClose}
                    disabled={loading}
                    data-cy="invoice-settings-modal-cancel-button"
                >
                    ยกเลิก
                </Button>
                <Button
                    onClick={handleSave}
                    variant="contained"
                    disabled={loading}
                    data-cy="invoice-settings-modal-save-button"
                >
                    {loading ? 'กำลังบันทึก...' : 'บันทึก'}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default InvoiceSettingsModal;