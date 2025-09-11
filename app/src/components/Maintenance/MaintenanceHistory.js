import React, { useEffect, useState } from 'react';
import { listMaintenance } from '../../api/maintenance';

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
    Box
} from '@mui/material';

// Helper functions (เหมือนเดิม)
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
        default:
            return <Chip label={status} size="small" />;
    }
};

export default function MaintenanceHistory({ searchTerm }) {
    const [loading, setLoading] = useState(true);
    const [allMaintenance, setAllMaintenance] = useState([]);
    const [filteredMaintenance, setFilteredMaintenance] = useState([]);

    useEffect(() => {
        const getMaintenanceList = async () => {
            try {
                const data = await listMaintenance();
                const maintenanceData = data || [];
                setAllMaintenance(maintenanceData);
                setFilteredMaintenance(maintenanceData);
            } catch (error) {
                console.error("Failed to fetch maintenance list:", error);
                setAllMaintenance([]);
            } finally {
                setLoading(false);
            }
        };

        getMaintenanceList();
    }, []);

    useEffect(() => {
        if (!searchTerm) {
            setFilteredMaintenance(allMaintenance);
            return;
        }

        const lowercasedFilter = searchTerm.toLowerCase();
        const filteredData = allMaintenance.filter((item) => {
            const referenceNumber = `c${item.roomNumber}0${item.id}`.toLowerCase();

            return (
                item.roomNumber.toString().includes(lowercasedFilter) ||
                item.id.toString().includes(lowercasedFilter) ||
                referenceNumber.includes(lowercasedFilter) ||
                item.description.toLowerCase().includes(lowercasedFilter) ||
                item.status.toLowerCase().includes(lowercasedFilter)
            );
        });
        setFilteredMaintenance(filteredData);
    }, [searchTerm, allMaintenance]);

    if (loading) {
        return <Typography>Loading...</Typography>;
    }

    return (
        <TableContainer component={Paper} sx={{ mt: 1, fontSize: '1rem' }}>
            <Table sx={{ maxWidth: '96%', margin: 'auto', tableLayout: 'fixed'  }} aria-label="maintenance history table">
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
                    {filteredMaintenance.length > 0 ? (
                        // If we have results, map and show them
                        filteredMaintenance.map((item) => (
                            <TableRow
                                key={item.id}
                                sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                            >
                                {/* ... All your TableCell components ... */}
                                <TableCell component="th" scope="row">
                                    <Link href="#" underline="hover" sx={{ fontWeight: 'bold' }}>{`C${item.roomNumber}0${item.id}`}</Link>
                                </TableCell>
                                <TableCell>
                                    <Box>
                                        <Typography variant="body2">นาย ช่าง หัวมัน</Typography>
                                        <Typography variant="caption" color="text.secondary">0000000008</Typography>
                                    </Box>
                                </TableCell>
                                <TableCell>ประปา</TableCell>
                                <TableCell>{formatDate(item.completedDate)}</TableCell>
                                <TableCell>{renderStatus(item.status)}</TableCell>
                                <TableCell>{item.description}</TableCell>
                            </TableRow>
                        ))
                    ) : (
                        // If results are empty, show a "No data" message
                        <TableRow>
                            <TableCell
                                colSpan={6}
                                sx={{ textAlign: 'center', py: 3, color: 'text.secondary' }}
                            >
                                ไม่พบข้อมูล
                            </TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>
        </TableContainer>
    );
}