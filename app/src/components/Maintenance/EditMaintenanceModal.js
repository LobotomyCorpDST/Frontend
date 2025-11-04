import React, { useEffect, useState } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, MenuItem, Button, Alert, CircularProgress, Stack, Divider
} from '@mui/material';
import { getMaintenanceByID, updateMaintenance } from '../../api/maintenance';
import DocumentUploadComponent from '../Common/DocumentUploadComponent';

export default function EditMaintenanceModal({ open, onClose, maintenanceId, onSaved }) {
  const [maintenance, setMaintenance] = useState(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

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
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle>แก้ไขงานบำรุงรักษา</DialogTitle>
      <DialogContent dividers>
        {loading ? (
          <Stack alignItems="center" sx={{ py: 2 }}>
            <CircularProgress size={24} />
          </Stack>
        ) : (
          <>
            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
            {maintenance && (
              <Stack spacing={2}>
                <TextField
                  select
                  label="สถานะ"
                  value={maintenance.status || ''}
                  onChange={handleChange('status')}
                  fullWidth
                >
                  <MenuItem value="PLANNED">วางแผนแล้ว</MenuItem>
                  <MenuItem value="IN_PROGRESS">กำลังดำเนินการ</MenuItem>
                  <MenuItem value="COMPLETED">เสร็จสิ้น</MenuItem>
                  <MenuItem value="CANCELED">ยกเลิก</MenuItem>
                </TextField>
                <TextField
                  type="date"
                  label="วันที่นัด"
                  InputLabelProps={{ shrink: true }}
                  value={maintenance.scheduledDate || ''}
                  onChange={handleChange('scheduledDate')}
                  fullWidth
                />
                <TextField
                  type="number"
                  label="ค่าใช้จ่าย (บาท)"
                  value={maintenance.costBaht || ''}
                  onChange={handleChange('costBaht')}
                  inputProps={{ step: '0.01', min: '0' }}
                  fullWidth
                />
                <TextField
                  label="ผู้รับผิดชอบ"
                  value={maintenance.responsiblePerson || ''}
                  onChange={handleChange('responsiblePerson')}
                  fullWidth
                  placeholder="ชื่อผู้รับผิดชอบ"
                />
                <TextField
                  label="เบอร์โทรศัพท์"
                  value={maintenance.responsiblePhone || ''}
                  onChange={handleChange('responsiblePhone')}
                  fullWidth
                  placeholder="เบอร์โทรศัพท์ผู้รับผิดชอบ"
                />

                {/* Document Upload Section */}
                <Divider sx={{ my: 2 }} />
                <DocumentUploadComponent
                  entityType="MAINTENANCE"
                  entityId={maintenanceId}
                  readOnly={false}
                />
              </Stack>
            )}
          </>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={saving}>ยกเลิก</Button>
        <Button variant="contained" onClick={handleSave} disabled={saving}>
          {saving ? 'กำลังบันทึก...' : 'บันทึก'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
