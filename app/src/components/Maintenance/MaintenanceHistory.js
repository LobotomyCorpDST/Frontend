import React, { useEffect, useState, useMemo } from 'react';
import { listMaintenance, getMaintenanceByID } from '../../api/maintenance';

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
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
} from '@mui/material';
import Timeline from '@mui/lab/Timeline';
import TimelineItem from '@mui/lab/TimelineItem';
import TimelineSeparator from '@mui/lab/TimelineSeparator';
import TimelineConnector from '@mui/lab/TimelineConnector';
import TimelineContent from '@mui/lab/TimelineContent';
import TimelineDot from '@mui/lab/TimelineDot';
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
    const [openDialog, setOpenDialog] = useState(false);
    const [scroll, setScroll] = React.useState('paper');
    const [selectedMaintenance, setSelectedMaintenance] = useState([]);

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

    const descriptionElementRef = React.useRef(null);
    React.useEffect(() => {
        if (openDialog) {
            const { current: descriptionElement } = descriptionElementRef;
            if (descriptionElement !== null) {
                descriptionElement.focus();
            }
        }
    }, [openDialog]);

    const handleRequestSort = (property) => {
        const isAsc = sortConfig.key === property && sortConfig.direction === 'ascending';
        setSortConfig({ key: property, direction: isAsc ? 'descending' : 'ascending' });
    };

    const handleOpenDialog = (id) => {
        setOpenDialog(true);
        setScroll('body');
        getMaintenance(id);
    };

    const handleCloseDialog = () => {
        setOpenDialog(false);
        setSelectedMaintenance([]);
    };

    const getMaintenance = async (id) => {
        const maintenance = await getMaintenanceByID(id);
        setSelectedMaintenance(maintenance);
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
        <>
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
                                        <Button onClick={() => handleOpenDialog(item.id)}>
                                            <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                                                {`C${item.roomNumber}0${item.id}`}
                                            </Typography>
                                        </Button>
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
            <Dialog
                open={openDialog}
                onClose={handleCloseDialog}
                fullWidth
                maxWidth="md" // Optional: gives the dialog a bit more space
                scroll={scroll}
            >
                {/* The DialogTitle is good for accessibility and clarity */}
                <DialogTitle sx={{ fontWeight: 'bold' }}>
                    รายละเอียดการแจ้งซ่อม
                </DialogTitle>

                {/*
      Place content directly in DialogContent.
      Move the props from DialogContentText here.
    */}
                <DialogContent
                    dividers={scroll === 'paper'}
                    id="scroll-dialog-description"
                    ref={descriptionElementRef}
                    tabIndex={-1}
                >
                    {/* Check if data has been loaded before rendering */}
                    {selectedMaintenance && Object.keys(selectedMaintenance).length > 0 ? (
                        <>
                            {/* 1. Your Header Section */}
                            <Box
                                sx={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    width: '100%',
                                    mb: 2 // Add some margin-bottom
                                }}
                            >
                                <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
                                    {selectedMaintenance.description}
                                </Typography>

                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                    <Typography variant="body1">
                                        สถานะ: {renderStatus(selectedMaintenance.status)}
                                    </Typography>
                                    <Typography variant="body1">
                                        เลขห้อง: {selectedMaintenance.roomNumber}
                                    </Typography>
                                </Box>
                            </Box>

                            {/* 2. Your Timeline Section (Now it will render correctly) */}
                            <Timeline position="alternate">
                                <TimelineItem>
                                    <TimelineSeparator>
                                        <TimelineDot color="primary" />
                                        <TimelineConnector />
                                    </TimelineSeparator>
                                    <TimelineContent>
                                        <Typography sx={{ fontWeight: 'bold' }}>รับแจ้ง</Typography>
                                        <Typography variant="caption">{formatDate(selectedMaintenance.createdDate)}</Typography>
                                    </TimelineContent>
                                </TimelineItem>

                                <TimelineItem>
                                    <TimelineSeparator>
                                        <TimelineDot color="secondary" />
                                        <TimelineConnector />
                                    </TimelineSeparator>
                                    <TimelineContent>
                                        <Typography sx={{ fontWeight: 'bold' }}>มอบหมายงาน</Typography>
                                        {/* You would add a date for this event here */}
                                    </TimelineContent>
                                </TimelineItem>

                                {/* Example of a completed event */}
                                {selectedMaintenance.status === 'COMPLETED' && (
                                    <TimelineItem>
                                        <TimelineSeparator>
                                            <TimelineDot color="success" />
                                        </TimelineSeparator>
                                        <TimelineContent>
                                            <Typography sx={{ fontWeight: 'bold' }}>เสร็จสิ้น</Typography>
                                            <Typography variant="caption">{formatDate(selectedMaintenance.completedDate)}</Typography>
                                        </TimelineContent>
                                    </TimelineItem>
                                )}
                            </Timeline>
                        </>
                    ) : (
                        // Optional: Show a loading indicator while fetching details
                        <Typography>Loading details...</Typography>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseDialog}>ปิด</Button>
                </DialogActions>
            </Dialog>
        </>
    );
}