import React, { useEffect, useState } from 'react';
import {
    Dialog, DialogTitle, DialogContent, DialogActions,
    TextField, MenuItem, Button, Alert, CircularProgress, Stack, Divider
} from '@mui/material';
import { getMaintenanceByID, updateMaintenance } from '../../api/maintenance';
import DocumentUploadComponent from '../Common/DocumentUploadComponent';

export default function EditMaintenanceModal({ open, onClose, maintenanceId, onSaved, ...props }) {
    const [maintenance, setMaintenance] = useState(null);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');

    // Check user role - only STAFF and ADMIN can edit responsiblePerson/Phone
    const userRole = (localStorage.getItem('role') || 'GUEST').toUpperCase();
    const canEditResponsible = userRole === 'ADMIN' || userRole === 'STAFF';

    useEffect(() => {
        if (!open || !maintenanceId) return;
        setError('');
        setLoading(true);
        (async () => {
            try {
                const data = await getMaintenanceByID(maintenanceId);
                setMaintenance(data);
            } catch (e) {
                setError(e?.message || 'Failed to load maintenance.');
            } finally {
                setLoading(false);
            }
        })();
    }, [open, maintenanceId]);

    const handleChange = (field) => (e) =>
        setMaintenance((prev) => ({ ...prev, [field]: e.target.value }));

    const handleSave = async () => {
        if (!maintenanceId) return;
        setSaving(true);
        setError('');
        try {
            await updateMaintenance(maintenanceId, {
                status: maintenance.status,
                scheduledDate: maintenance.scheduledDate,
                costBaht: maintenance.costBaht,
                responsiblePerson: maintenance.responsiblePerson,
                responsiblePhone: maintenance.responsiblePhone,
            });
            onSaved?.();
            onClose?.();
        } catch (e) {
            setError(e?.message || 'Update failed.');
        } finally {
            setSaving(false);
        }
    };

    if (!open) return null;

    return (
        <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth {...props}>
            <DialogTitle data-cy="edit-maintenance-modal-title">
                แก้ไขงานบำรุงรักษา
            </DialogTitle>
            <DialogContent dividers>
                {loading ? (
                    <Stack
                        alignItems="center"
                        sx={{ py: 2 }}
                        data-cy="edit-maintenance-modal-loading-state"
                    >
                        <CircularProgress size={24} />
                    </Stack>
                ) : (
                    <>
                        {error && (
                            <Alert
                                severity="error"
                                sx={{ mb: 2 }}
                                data-cy="edit-maintenance-modal-error-alert"
                            >
                                {error}
                            </Alert>
                        )}
                        {maintenance && (
                            <Stack spacing={2}>
                                <TextField
                                    select
                                    label="สถานะ"
                                    value={maintenance.status || ''}
                                    onChange={handleChange('status')}
                                    fullWidth
                                    data-cy="edit-maintenance-status-select"
                                >
                                    <MenuItem
                                        value="PLANNED"
                                        data-cy="edit-maintenance-status-option-planned"
                                    >
                                        วางแผนแล้ว
                                    </MenuItem>
                                    <MenuItem
                                        value="IN_PROGRESS"
                                        data-cy="edit-maintenance-status-option-in-progress"
                                    >
                                        กำลังดำเนินการ
                                    </MenuItem>
                                    <MenuItem
                                        value="COMPLETED"
                                        data-cy="edit-maintenance-status-option-completed"
                                    >
                                        เสร็จสิ้น
                                    </MenuItem>
                                    <MenuItem
                                        value="CANCELED"
                                        data-cy="edit-maintenance-status-option-canceled"
                                    >
                                        ยกเลิก
                                    </MenuItem>
                                </TextField>
                                <TextField
                                    type="date"
                                    label="วันที่นัด"
                                    InputLabelProps={{ shrink: true }}
                                    value={maintenance.scheduledDate || ''}
                                    onChange={handleChange('scheduledDate')}
                                    fullWidth
                                    data-cy="edit-maintenance-date-input"
                                />
                                <TextField
                                    type="number"
                                    label="ค่าใช้จ่าย (บาท)"
                                    value={maintenance.costBaht || ''}
                                    onChange={handleChange('costBaht')}
                                    inputProps={{ step: '0.01', min: '0' }}
                                    fullWidth
                                    data-cy="edit-maintenance-cost-input"
                                />
                                <TextField
                                    label="ผู้รับผิดชอบ"
                                    value={maintenance.responsiblePerson || ''}
                                    onChange={handleChange('responsiblePerson')}
                                    fullWidth
                                    placeholder="ชื่อผู้รับผิดชอบ"
                                    disabled={!canEditResponsible}
                                    helperText={!canEditResponsible ? "เฉพาะ STAFF/ADMIN เท่านั้นที่สามารถแก้ไข" : ""}
                                    data-cy="edit-maintenance-responsible-person-input"
                                />
                                <TextField
                                    label="เบอร์โทรศัพท์"
                                    value={maintenance.responsiblePhone || ''}
                                    onChange={handleChange('responsiblePhone')}
                                    fullWidth
                                    placeholder="เบอร์โทรศัพท์ผู้รับผิดชอบ"
                                    disabled={!canEditResponsible}
                                    helperText={!canEditResponsible ? "เฉพาะ STAFF/ADMIN เท่านั้นที่สามารถแก้ไข" : ""}
                                    data-cy="edit-maintenance-responsible-phone-input"
                                />

                                {/* Document Upload Section */}
                                <Divider sx={{ my: 2 }} />
                                <DocumentUploadComponent
                                    entityType="MAINTENANCE"
                                    entityId={maintenanceId}
                                    readOnly={false}
                                    data-cy="edit-maintenance-document-upload"
                                />
                            </Stack>
                        )}
                    </>
                )}
            </DialogContent>
            <DialogActions>
                <Button
                    onClick={onClose}
                    disabled={saving}
                    data-cy="edit-maintenance-modal-cancel-button"
                >
                    ยกเลิก
                </Button>
                <Button
                    variant="contained"
                    onClick={handleSave}
                    disabled={saving}
                    data-cy="edit-maintenance-modal-save-button"
                >
                    {saving ? 'กำลังบันทึก...' : 'บันทึก'}
                </Button>
            </DialogActions>
        </Dialog>
    );
}