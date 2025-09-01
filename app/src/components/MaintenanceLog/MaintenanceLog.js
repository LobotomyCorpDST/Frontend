import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { maintenanceData } from '../../data/maintenanceData';
import './MaintenanceLog.css';
import '../RoomDetail/RoomDetail.css';

const MaintenanceLog = () => {
    const { roomNumber } = useParams();
    const navigate = useNavigate();
    const [maintenanceLogs, setMaintenanceLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('maintenance');
    const [sortConfig, setSortConfig] = useState({ key: null, direction: 'ascending' });

    useEffect(() => {
        const logs = maintenanceData.find(log => log.roomNumber === parseInt(roomNumber));
        if (logs) {
            setMaintenanceLogs(logs.history);
        } else {
            setMaintenanceLogs([]);
        }
        setLoading(false);
    }, [roomNumber]);

    const handleAddClick = () => {
        console.log("Add button clicked. This functionality would be connected to a database.");
        const newLog = {
            id: Date.now(),
            description: 'New maintenance log added (placeholder)',
            status: 'planned',
            date: '2025-09-01',
        };
        setMaintenanceLogs([newLog, ...maintenanceLogs]);
    };

    const handleDeleteClick = (id) => {
        console.log(`Delete button clicked for log ID: ${id}`);
        setMaintenanceLogs(maintenanceLogs.filter(log => log.id !== id));
    };
    
    const handleSort = (key) => {
        let direction = 'ascending';
        if (sortConfig.key === key && sortConfig.direction === 'ascending') {
            direction = 'descending';
        }
        setSortConfig({ key, direction });
    };

    const handleTabClick = (tab) => {
        setActiveTab(tab);
        if (tab === 'details') {
            navigate(`/room-details/${roomNumber}`);
        } else if (tab === 'invoice') {
            navigate(`/room-details/${roomNumber}/invoice`);
        } else if (tab === 'maintenance') {
            navigate(`/room-details/${roomNumber}/maintenance`);
        }
    };

    const sortedLogs = [...maintenanceLogs].sort((a, b) => {
        if (sortConfig.key === 'date') {
            const dateA = new Date(a.date);
            const dateB = new Date(b.date);
            return sortConfig.direction === 'ascending' ? dateA - dateB : dateB - dateA;
        }

        if (sortConfig.key === 'status') {
            const order = { 'on-going': 1, 'planned': 2, 'done': 3 };
            const statusA = order[a.status.toLowerCase()];
            const statusB = order[b.status.toLowerCase()];
            return sortConfig.direction === 'ascending' ? statusA - statusB : statusB - statusA;
        }

        return 0;
    });

    const isFutureDate = (date) => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const logDate = new Date(date);
        return logDate > today;
    };

    const getStatusClass = (status) => {
        switch (status.toLowerCase()) {
            case 'done':
                return 'status-Paid';
            case 'on-going':
                return 'status-Overdue';
            case 'planned':
                return 'status-not-yet-paid';
            default:
                return '';
        }
    };

    return (
        <div className="content-container">
            <div className="invoice-header">
                <button onClick={() => navigate('/home')} className="back-btn">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512" width="20" height="20" fill="currentColor">
                        <path d="M9.4 233.4c-12.5 12.5-12.5 32.8 0 45.3l160 160c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3L109.2 288H416c17.7 0 32-14.3 32-32s-14.3-32-32-32H109.2l105.3-105.3c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0l-160 160z"/>
                    </svg>
                </button>
                <h1 className="header-title">บำรุงรักษา ห้อง {roomNumber}</h1>
            </div>
            
            <div className="tab-navigation">
                <button 
                    className={`tab-btn ${activeTab === 'details' ? 'active' : ''}`}
                    onClick={() => handleTabClick('details')}
                >
                    รายละเอียด
                </button>
                <button 
                    className={`tab-btn ${activeTab === 'invoice' ? 'active' : ''}`}
                    onClick={() => handleTabClick('invoice')}
                >
                    ใบแจ้งหนี้
                </button>
                <button 
                    className={`tab-btn ${activeTab === 'maintenance' ? 'active' : ''}`}
                    onClick={() => handleTabClick('maintenance')}
                >
                    บำรุงรักษา
                </button>
            </div>
            
            <div className="button-container">
                <button onClick={handleAddClick} className="action-button add-invoice-btn">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512" width="16" height="16" fill="currentColor">
                        <path d="M256 80c0-17.7-14.3-32-32-32s-32 14.3-32 32V224H48c-17.7 0-32 14.3-32 32s14.3 32 32 32H192V432c0 17.7 14.3 32 32 32s32-14.3 32-32V288H400c17.7 0 32-14.3 32-32s-14.3-32-32-32H256V80z" />
                    </svg>
                    เพิ่มข้อมูล
                </button>
            </div>
            <div className="table-container">
                {loading ? (
                    <div className="loading">Loading maintenance logs...</div>
                ) : sortedLogs.length > 0 ? (
                    <table className="invoice-table">
                        <thead>
                            <tr>
                                <th>คำอธิบาย</th>
                                <th onClick={() => handleSort('status')} className="sortable">สถานะ</th>
                                <th onClick={() => handleSort('date')} className="sortable">วันที่</th>
                                <th></th>
                            </tr>
                        </thead>
                        <tbody>
                            {sortedLogs.map((log) => (
                                <tr key={log.id}>
                                    <td>{log.description}</td>
                                    <td>
                                        <span className={getStatusClass(log.status)}>
                                            {log.status}
                                            {isFutureDate(log.date) && (
                                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="12" height="12" fill="currentColor" className="future-icon">
                                                    <path d="M464 256A208 208 0 1 1 48 256a208 208 0 1 1 416 0zM0 256a256 256 0 1 0 512 0A256 256 0 1 0 0 256zM232 120V256c0 8 4 15.5 10.7 20.3l72 56c11.8 9.2 28.4 6.9 37.6-4.9s6.9-28.4-4.9-37.6L280 232V120c0-13.3-10.7-24-24-24s-24 10.7-24 24z"/>
                                                </svg>
                                            )}
                                        </span>
                                    </td>
                                    <td>{log.date}</td>
                                    <td>
                                        <button onClick={() => handleDeleteClick(log.id)} className="action-button delete-button">
                                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512" width="16" height="16" fill="currentColor">
                                                <path d="M135.2 17.7L128 32H32C14.3 32 0 46.3 0 64S14.3 96 32 96H416c17.7 0 32-14.3 32-32s-14.3-32-32-32H320l-7.2-14.7C307.4 6.8 296.3 0 284.2 0H163.8c-12.1 0-23.2 6.8-28.6 17.7zM416 128H32L53.2 467c1.6 25.3 22.6 45 47.7 45H347.1c25.1 0 46.1-19.7 47.7-45L416 128z"/>
                                            </svg>
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                ) : (
                    <p className="no-data-message">No maintenance logs found for this room.</p>
                )}
            </div>
        </div>
    );
};

export default MaintenanceLog;
