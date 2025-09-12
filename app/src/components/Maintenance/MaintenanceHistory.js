import React, { useEffect, useState, useMemo } from 'react';
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
    Box,
    TableSortLabel,
} from '@mui/material';
import { visuallyHidden } from '@mui/utils';

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

const headerCellStyle = {
    backgroundColor: '#1d3e7d',
    fontWeight: 600,
    color: '#f8f9fa',
    padding: '12px',
    textAlign: 'left',
    borderBottom: '1px solid #e0e6eb',
    cursor: 'pointer',
    '&:hover': {
        backgroundColor: '#173262',
    }
};

const headCells = [
    { id: 'id', label: 'หมายเลขอ้างอิง' },
    { id: 'responsiblePerson', label: 'ผู้รับผิดชอบ', disableSorting: true },
    { id: 'type', label: 'ประเภท', disableSorting: true },
    { id: 'completedDate', label: 'กำหนดการ' },
    { id: 'status', label: 'สถานะ' },
    { id: 'description', label: 'รายละเอียด' },
];

export default function MaintenanceHistory({ searchTerm }) {
    const [loading, setLoading] = useState(true);
    const [allMaintenance, setAllMaintenance] = useState([]);
    const [filteredMaintenance, setFilteredMaintenance] = useState([]);
    const [sortConfig, setSortConfig] = useState({ key: 'id', direction: 'descending' });

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

    const handleRequestSort = (property) => {
        const isAsc = sortConfig.key === property && sortConfig.direction === 'ascending';
        setSortConfig({ key: property, direction: isAsc ? 'descending' : 'ascending' });
    };

    const sortedItems = useMemo(() => {
        let sortableItems = [...filteredMaintenance];
        if (sortConfig.key !== null) {
            sortableItems.sort((a, b) => {
                let aValue = a[sortConfig.key];
                let bValue = b[sortConfig.key];

                if (sortConfig.key === 'completedDate') {
                    aValue = new Date(aValue);
                    bValue = new Date(bValue);
                }

                if (bValue < aValue) {
                    return sortConfig.direction === 'ascending' ? 1 : -1;
                }
                if (bValue > aValue) {
                    return sortConfig.direction === 'ascending' ? -1 : 1;
                }
                return 0;
            });
        }
        return sortableItems;
    }, [filteredMaintenance, sortConfig]);


    if (loading) {
        return <Typography>Loading...</Typography>;
    }

    return (
        <TableContainer
            component={Paper}
            sx={{
                marginTop: '20px',
                borderRadius: '8px',
                boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)',
                overflowX: 'auto',
            }}
        >
            <Table sx={{ minWidth: 650, maxWidth: '96%', mx: 'auto', mb: 2 }} aria-label="maintenance history table">
                <TableHead>
                    <TableRow>
                        {headCells.map((headCell) => (
                            <TableCell
                                key={headCell.id}
                                sx={headerCellStyle}
                                sortDirection={sortConfig.key === headCell.id ? sortConfig.direction : false}
                                onClick={() => !headCell.disableSorting && handleRequestSort(headCell.id)}
                            >
                                <TableSortLabel
                                    active={sortConfig.key === headCell.id}
                                    direction={sortConfig.key === headCell.id ? sortConfig.direction : 'asc'}
                                    sx={{
                                        color: '#f8f9fa',
                                        '&:hover': { color: '#f0f4fa' },
                                        '&.Mui-active': {
                                            color: '#f8f9fa',
                                            '& .MuiTableSortLabel-icon': {
                                                transform: sortConfig.direction === 'ascending'
                                                    ? 'rotate(180deg)' // Point up for ascending
                                                    : 'rotate(0deg)',   // Point down for descending
                                            },
                                        },
                                        '& .MuiTableSortLabel-icon': {
                                            color: 'inherit !important',
                                        },
                                    }}
                                >
                                    {headCell.label}
                                    {sortConfig.key === headCell.id ? (
                                        <Box component="span" sx={visuallyHidden}>
                                            {sortConfig.direction === 'descending' ? 'sorted descending' : 'sorted ascending'}
                                        </Box>
                                    ) : null}
                                </TableSortLabel>
                            </TableCell>
                        ))}
                    </TableRow>
                </TableHead>
                <TableBody>
                    {sortedItems.length > 0 ? (
                        sortedItems.map((item) => (
                            <TableRow
                                key={item.id}
                                sx={{
                                    '&:hover': { backgroundColor: '#f1f3f5' },
                                    '&:last-child td, &:last-child th': { border: 0 },
                                }}
                            >
                                {/* Table cells remain the same */}
                                <TableCell component="th" scope="row" sx={{ padding: '12px', borderBottom: '1px solid #e0e6eb' }}>
                                    <Link href="#" underline="hover" sx={{ fontWeight: 'bold' }}>
                                        {`C${item.roomNumber}0${item.id}`}
                                    </Link>
                                </TableCell>
                                <TableCell sx={{ padding: '12px', borderBottom: '1px solid #e0e6eb' }}>
                                    <Box>
                                        <Typography variant="body2">นาย ช่าง หัวมัน</Typography>
                                        <Typography variant="caption" color="text.secondary">0000000008</Typography>
                                    </Box>
                                </TableCell>
                                <TableCell sx={{ padding: '12px', borderBottom: '1px solid #e0e6eb' }}>ประปา</TableCell>
                                <TableCell sx={{ padding: '12px', borderBottom: '1px solid #e0e6eb' }}>{formatDate(item.completedDate)}</TableCell>
                                <TableCell sx={{ padding: '12px', borderBottom: '1px solid #e0e6eb' }}>{renderStatus(item.status)}</TableCell>
                                <TableCell sx={{ padding: '12px', borderBottom: '1px solid #e0e6eb' }}>{item.description}</TableCell>
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