import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    Paper, Grid, Typography, Button, Box, CircularProgress, IconButton, Alert, Card, CardContent
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import EditIcon from '@mui/icons-material/Edit';
import { getTenantById } from '../../api/tenant';
import { getActiveLeaseByTenantId } from '../../api/lease';
import MaintenanceTable from '../../components/Maintenance/MaintenanceTable'; // Assuming path
import EditTenantModal from './EditTenantModal';
import './TenantDetail.css';

const actionBtnSx = { borderRadius: 2, textTransform: 'none', fontWeight: 600, px: 2 };
const fmt = (d) => (d ? new Date(d).toISOString().slice(0, 10) : '-');

// Re-using the RoomCard component from the Dashboard
const RoomCard = ({ room }) => {
    const navigate = useNavigate();
    const isAvailable = room.status?.toLowerCase() !== 'occupied';
    return (
        <Card
            sx={{
                width: 150,
                height: 150,
                cursor: 'pointer',
                border: '1px solid',
                borderColor: isAvailable ? 'success.main' : 'error.main',
                backgroundColor: isAvailable ? 'success.light' : '#ffebee'
            }}
            onClick={() => navigate(`/room-details/${room.number}`)}
        >
            <CardContent sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', height: '100%' }}>
                <Typography variant="h5" component="div" sx={{ fontWeight: 'bold' }}>
                    {room.number}
                </Typography>
                <Box>
                    <Typography sx={{ mb: 1.5 }} color="text.secondary">
                        {isAvailable ? 'Available' : 'Occupied'}
                    </Typography>
                </Box>
            </CardContent>
        </Card>
    );
};


const TenantDetail = () => {
    const { tenantId } = useParams();
    const navigate = useNavigate();

    const [tenant, setTenant] = useState(null);
    const [lease, setLease] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [isEditModalOpen, setEditModalOpen] = useState(false);

    const loadData = useCallback(async () => {
        if (!tenantId) return;
        setLoading(true);
        setError('');
        try {
            const tenantData = await getTenantById(tenantId);
            setTenant(tenantData);

            // Fetch the active lease for this tenant
            const activeLease = await getActiveLeaseByTenantId(tenantId);
            setLease(activeLease); // Can be null if no active lease

        } catch (e) {
            setError(e?.message || `Failed to load details for tenant ID ${tenantId}`);
        } finally {
            setLoading(false);
        }
    }, [tenantId]);

    useEffect(() => {
        loadData();
    }, [loadData]);

    if (loading) return (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 5 }}><CircularProgress /></Box>
    );
    if (error) return (
        <Box sx={{ p: 3 }}><Alert severity="error">{error}</Alert></Box>
    );
    if (!tenant) return <Box sx={{ p: 3 }}><Alert severity="warning">Tenant not found.</Alert></Box>;

    return (
        <Box className="detail-page-container">
            {/* Left Panel: Tenant & Lease Info */}
            <Paper elevation={3} className="left-panel">
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <IconButton onClick={() => navigate(-1)}>
                        <ArrowBackIcon />
                    </IconButton>
                    <Typography variant="h4" component="h1" sx={{ ml: 1 }}>
                        {tenant.name}
                    </Typography>
                </Box>

                <Typography variant="h6" color="primary" className="section-header">
                    รายละเอียด
                </Typography>

                <Box className="scrollable-content">
                    {/* Tenant Info */}
                    <Paper variant="outlined" sx={{ p: 3, mb: 2 }}>
                        <Typography variant="h6" gutterBottom>ข้อมูลผู้เช่า</Typography>
                        <Grid container spacing={2}>
                            <Grid item xs={12} sm={6}>
                                <Typography variant="caption" display="block">ชื่อ</Typography>
                                <Typography>{tenant.name}</Typography>
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <Typography variant="caption" display="block">ช่องทางติดต่อ</Typography>
                                <Typography><strong>LINE:</strong> -</Typography>
                                <Typography><strong>เบอร์โทร:</strong> {tenant.phone}</Typography>
                            </Grid>
                        </Grid>
                    </Paper>

                    {/* Lease Info */}
                    <Paper variant="outlined" sx={{ p: 3, mb: 2 }}>
                        <Typography variant="h6" gutterBottom>รายละเอียดสัญญาเช่า</Typography>
                        <Typography><strong>สถานะ:</strong> {lease ? 'rent paid' : 'No Active Lease'}</Typography>
                        <Grid container spacing={2}>
                            <Grid item xs={12} sm={6}>
                                <Typography><strong>วันที่เข้า:</strong> {fmt(lease?.startDate)}</Typography>
                                <Typography><strong>วันที่ออก:</strong> {fmt(lease?.endDate)}</Typography>
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <Typography><strong>สัญญาเริ่ม:</strong> {fmt(lease?.startDate)}</Typography>
                                <Typography><strong>สัญญาจบ:</strong> {fmt(lease?.endDate)}</Typography>
                            </Grid>
                        </Grid>
                    </Paper>

                    {/* Latest Usage */}
                    <Paper variant="outlined" sx={{ p: 2 }}>
                        <Typography variant="h6" gutterBottom>ค่าใช้จ่ายล่าสุด</Typography>
                        <Grid container spacing={2}>
                            <Grid item xs={12} sm={6}>
                                <Typography><strong>ค่าไฟ (หน่วย):</strong> N/A</Typography>
                                <Typography><strong>ค่าไฟ (บาท):</strong> N/A</Typography>
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <Typography><strong>ค่าน้ำ (หน่วย):</strong> N/A</Typography>
                                <Typography><strong>ค่าน้ำ (บาท):</strong> N/A</Typography>
                            </Grid>
                        </Grid>
                    </Paper>
                </Box>

                <Box className="action-footer">
                    <Button
                        variant="outlined"
                        startIcon={<EditIcon />}
                        fullWidth
                        sx={actionBtnSx}
                        onClick={() => setEditModalOpen(true)}
                    >
                        แก้ไขข้อมูล
                    </Button>
                </Box>
            </Paper>

            {/* Right Panel: Assigned Room & Maintenance */}
            <Paper elevation={3} className="right-panel">
                <Typography variant="h6" color="primary" className="section-header">
                    Assigned Room
                </Typography>
                <Box sx={{ p: 2, display: 'flex', gap: 2 }}>
                    {lease && lease.room ? (
                        <RoomCard room={lease.room} />
                    ) : (
                        <Typography>No room assigned.</Typography>
                    )}
                </Box>

                <Typography variant="h6" color="primary" className="section-header" sx={{ mt: 2 }}>
                    Maintenance History
                </Typography>
                <Box className="scrollable-content" sx={{ p: 2 }}>
                    {lease && lease.room ? (
                        <MaintenanceTable roomId={lease.room.id} />
                    ) : (
                        <Typography>No maintenance records to show.</Typography>
                    )}
                </Box>
            </Paper>

            {isEditModalOpen && (
                <EditTenantModal
                    open={isEditModalOpen}
                    onClose={() => setEditModalOpen(false)}
                    onUpdated={loadData}
                    tenant={tenant}
                />
            )}
        </Box>
    );
};

export default TenantDetail;