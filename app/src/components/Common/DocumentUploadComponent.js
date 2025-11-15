import React, { useState, useEffect } from 'react';
import {
    Box,
    Paper,
    Typography,
    Button,
    IconButton,
    List,
    ListItem,
    ListItemText,
    ListItemSecondaryAction,
    Chip,
    Alert,
    CircularProgress,
} from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import DownloadIcon from '@mui/icons-material/Download';
import DeleteIcon from '@mui/icons-material/Delete';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import ImageIcon from '@mui/icons-material/Image';

import {
    uploadDocument,
    getDocuments,
    downloadDocument,
    deleteDocument,
} from '../../api/document';

/**
 * Reusable document upload component for Lease, Maintenance, and Invoice entities
 *
 * @param {Object} props
 * @param {string} props.entityType - LEASE, MAINTENANCE, or INVOICE
 * @param {number} props.entityId - ID of the entity
 * @param {boolean} props.readOnly - If true, hide upload/delete buttons (default: false)
 * @param {function} props.onUploadSuccess - Optional callback after successful upload
 * @param {function} props.onDeleteSuccess - Optional callback after successful delete
 */
const DocumentUploadComponent = ({
                                     entityType,
                                     entityId,
                                     readOnly = false,
                                     onUploadSuccess,
                                     onDeleteSuccess,
                                     ...props
                                 }) => {
    const [documents, setDocuments] = useState([]);
    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState('');
    const [dragActive, setDragActive] = useState(false);

    useEffect(() => {
        if (entityType && entityId) {
            loadDocuments();
        }
    }, [entityType, entityId]);

    const loadDocuments = async () => {
        if (!entityType || !entityId) return;

        setLoading(true);
        setError('');
        try {
            const docs = await getDocuments(entityType, entityId);
            setDocuments(docs || []);
        } catch (err) {
            setError(err?.message || 'Failed to load documents');
        } finally {
            setLoading(false);
        }
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

    const handleDrop = async (e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);

        if (readOnly) return;

        const files = e.dataTransfer?.files;
        if (files && files.length > 0) {
            await handleFileUpload(files[0]);
        }
    };

    const handleFileChange = async (e) => {
        if (readOnly) return;

        const files = e.target?.files;
        if (files && files.length > 0) {
            await handleFileUpload(files[0]);
        }
        // Reset input value so same file can be uploaded again
        e.target.value = '';
    };

    const handleFileUpload = async (file) => {
        if (!file) return;

        // Validate file size (10MB)
        if (file.size > 10 * 1024 * 1024) {
            setError('ไฟล์มีขนาดใหญ่เกิน 10MB');
            return;
        }

        // Validate file type
        const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'];
        if (!allowedTypes.includes(file.type)) {
            setError('รองรับเฉพาะไฟล์ .jpg, .png, .pdf เท่านั้น');
            return;
        }

        setUploading(true);
        setError('');
        try {
            // Ensure entityType matches backend enum and entityId is passed as number/string id
            const normalizedType = String(entityType || '').toUpperCase();
            await uploadDocument(file, normalizedType, entityId);
            await loadDocuments();
            if (onUploadSuccess) onUploadSuccess();
        } catch (err) {
            setError(err?.message || 'Failed to upload document');
        } finally {
            setUploading(false);
        }
    };

    const handleDownload = async (doc) => {
        try {
            const blob = await downloadDocument(doc.id);
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = doc.fileName || `document-${doc.id}`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        } catch (err) {
            setError(err?.message || 'Failed to download document');
        }
    };

    const handleDelete = async (docId) => {
        if (readOnly) return;

        if (!window.confirm('คุณแน่ใจหรือไม่ว่าต้องการลบเอกสารนี้?')) {
            return;
        }

        try {
            await deleteDocument(docId);
            await loadDocuments();
            if (onDeleteSuccess) onDeleteSuccess();
        } catch (err) {
            setError(err?.message || 'Failed to delete document');
        }
    };

    const getFileIcon = (mimeType) => {
        let icon;
        if (mimeType === 'application/pdf') {
            icon = <PictureAsPdfIcon color="error" />;
        } else if (mimeType?.startsWith('image/')) {
            icon = <ImageIcon color="primary" />;
        } else {
            icon = <InsertDriveFileIcon />;
        }
        return <Box data-cy="doc-upload-list-item-icon">{icon}</Box>;
    };

    const formatFileSize = (bytes) => {
        if (!bytes) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
    };

    if (!entityType || !entityId) {
        return (
            <Box sx={{ p: 2 }} data-cy="doc-upload-uninitialized-state">
                <Typography variant="body2" color="text.secondary">
                    กรุณาบันทึกข้อมูลก่อนอัปโหลดเอกสาร
                </Typography>
            </Box>
        );
    }

    return (
        // <-- 2. Pass props to root element
        <Box sx={{ width: '100%' }} {...props}>
            <Typography
                variant="subtitle2"
                sx={{ mb: 1, fontWeight: 'bold' }}
                data-cy="doc-upload-title"
            >
                เอกสารแนบ
            </Typography>

            {/* Upload Area */}
            {!readOnly && (
                <Paper
                    sx={{
                        p: 3,
                        mb: 2,
                        textAlign: 'center',
                        border: dragActive ? '2px dashed #1976d2' : '2px dashed #ccc',
                        backgroundColor: dragActive ? 'rgba(25, 118, 210, 0.05)' : 'transparent',
                        cursor: 'pointer',
                        transition: 'all 0.3s ease',
                        '&:hover': {
                            borderColor: '#1976d2',
                            backgroundColor: 'rgba(25, 118, 210, 0.02)',
                        },
                    }}
                    onDragEnter={handleDrag}
                    onDragLeave={handleDrag}
                    onDragOver={handleDrag}
                    onDrop={handleDrop}
                    data-cy="doc-upload-dropzone"
                >
                    {uploading ? (
                        <Box
                            sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 2 }}
                            data-cy="doc-upload-uploading-state"
                        >
                            <CircularProgress size={24} />
                            <Typography>กำลังอัปโหลด...</Typography>
                        </Box>
                    ) : (
                        <>
                            <CloudUploadIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 1 }} data-cy="doc-upload-dropzone-icon" />
                            <Typography variant="body1" sx={{ mb: 1 }}>
                                ลากไฟล์มาวางที่นี่ หรือ คลิกเพื่อเลือกไฟล์
                            </Typography>
                            <Typography variant="caption" color="text.secondary" sx={{ mb: 2, display: 'block' }}>
                                รองรับ: .jpg, .png, .pdf (สูงสุด 10MB)
                            </Typography>
                            <Button
                                component="label"
                                variant="outlined"
                                startIcon={<CloudUploadIcon />}
                                disabled={uploading}
                                data-cy="doc-upload-select-file-button"
                            >
                                เลือกไฟล์
                                <input
                                    type="file"
                                    hidden
                                    accept=".jpg,.jpeg,.png,.pdf"
                                    onChange={handleFileChange}
                                    data-cy="doc-upload-file-input"
                                />
                            </Button>
                        </>
                    )}
                </Paper>
            )}

            {/* Error Message */}
            {error && (
                <Alert
                    severity="error"
                    onClose={() => setError('')}
                    sx={{ mb: 2 }}
                    data-cy="doc-upload-error-alert"
                >
                    {error}
                </Alert>
            )}

            {/* Document List */}
            {loading ? (
                <Box
                    sx={{ display: 'flex', justifyContent: 'center', p: 2 }}
                    data-cy="doc-upload-list-loading"
                >
                    <CircularProgress size={24} />
                </Box>
            ) : documents.length > 0 ? (
                <Paper
                    variant="outlined"
                    sx={{ maxHeight: 300, overflow: 'auto' }}
                    data-cy="doc-upload-list-container"
                >
                    <List dense>
                        {documents.map((doc, index) => (
                            <ListItem
                                key={doc.id}
                                divider={index < documents.length - 1}
                                sx={{
                                    '&:hover': { backgroundColor: 'rgba(0, 0, 0, 0.02)' },
                                }}
                                data-cy={`doc-upload-list-item-${doc.id}`}
                            >
                                {getFileIcon(doc.mimeType)}
                                <ListItemText
                                    primary={doc.fileName}
                                    secondary={
                                        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', mt: 0.5 }}>
                                            <Chip
                                                label={formatFileSize(doc.fileSize)}
                                                size="small"
                                                data-cy={`doc-upload-list-item-size-${doc.id}`}
                                            />
                                            <Typography
                                                variant="caption"
                                                color="text.secondary"
                                                data-cy={`doc-upload-list-item-date-${doc.id}`}
                                            >
                                                {new Date(doc.uploadedAt).toLocaleDateString('th-TH', {
                                                    year: 'numeric',
                                                    month: 'short',
                                                    day: 'numeric',
                                                    hour: '2-digit',
                                                    minute: '2-digit',
                                                })}
                                            </Typography>
                                        </Box>
                                    }
                                    sx={{ ml: 2 }}
                                    data-cy={`doc-upload-list-item-name-${doc.id}`}
                                />
                                <ListItemSecondaryAction>
                                    <IconButton
                                        edge="end"
                                        aria-label="download"
                                        onClick={() => handleDownload(doc)}
                                        size="small"
                                        sx={{ mr: 1 }}
                                        data-cy={`doc-upload-list-item-download-button-${doc.id}`}
                                    >
                                        <DownloadIcon />
                                    </IconButton>
                                    {!readOnly && (
                                        <IconButton
                                            edge="end"
                                            aria-label="delete"
                                            onClick={() => handleDelete(doc.id)}
                                            size="small"
                                            color="error"
                                            data-cy={`doc-upload-list-item-delete-button-${doc.id}`}
                                        >
                                            <DeleteIcon />
                                        </IconButton>
                                    )}
                                </ListItemSecondaryAction>
                            </ListItem>
                        ))}
                    </List>
                </Paper>
            ) : (
                <Paper
                    variant="outlined"
                    sx={{ p: 2, textAlign: 'center' }}
                    data-cy="doc-upload-no-documents-message"
                >
                    <Typography variant="body2" color="text.secondary">
                        ยังไม่มีเอกสารแนบ
                    </Typography>
                </Paper>
            )}
        </Box>
    );
};

export default DocumentUploadComponent;