import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { placeholderData } from '../../data/placeholderData'; // Changed to placeholderData
import './RoomInvoiceHistory.css';
import '../RoomDetail/RoomDetail.css';

const RoomInvoiceHistory = () => {
    const { roomNumber } = useParams();
    const navigate = useNavigate();
    const [invoiceHistory, setInvoiceHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('invoice');
    const [sortConfig, setSortConfig] = useState({ key: null, direction: 'ascending' });

    useEffect(() => {
        // Find the room data from placeholderData
        const room = placeholderData.find(r => r.roomNumber === parseInt(roomNumber));
        if (room) {
            // Create a mock invoice history since the data doesn't have a history array
            const mockInvoiceHistory = [
                {
                    date: '2025-08-01',
                    totalBaht: room.latestUsage.totalBaht,
                    status: 'not-yet-paid',
                },
                {
                    date: '2025-07-01',
                    totalBaht: room.latestUsage.totalBaht + 50,
                    status: 'paid',
                },
                {
                    date: '2025-06-01',
                    totalBaht: room.latestUsage.totalBaht - 20,
                    status: 'overdue',
                },
            ];
            setInvoiceHistory(mockInvoiceHistory);
        } else {
            setInvoiceHistory([]);
        }
        setLoading(false);
    }, [roomNumber]);

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

    const sortedInvoices = [...invoiceHistory].sort((a, b) => {
        if (sortConfig.key === 'date') {
            const dateA = new Date(a.date);
            const dateB = new Date(b.date);
            return sortConfig.direction === 'ascending' ? dateA - dateB : dateB - dateA;
        }

        if (sortConfig.key === 'status') {
            const order = { 'paid': 1, 'overdue': 2, 'not-yet-paid': 3 };
            const statusA = order[a.status.toLowerCase()];
            const statusB = order[b.status.toLowerCase()];
            return sortConfig.direction === 'ascending' ? statusA - statusB : statusB - statusA;
        }

        return 0;
    });

    const getStatusClass = (status) => {
        switch (status.toLowerCase()) {
            case 'paid':
                return 'status-Paid';
            case 'overdue':
                return 'status-Overdue';
            case 'not-yet-paid':
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
                <h1 className="header-title">ใบแจ้งหนี้ ห้อง {roomNumber}</h1>
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
                <button className="action-button add-invoice-btn">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512" width="16" height="16" fill="currentColor">
                        <path d="M256 80c0-17.7-14.3-32-32-32s-32 14.3-32 32V224H48c-17.7 0-32 14.3-32 32s14.3 32 32 32H192V432c0 17.7 14.3 32 32 32s32-14.3 32-32V288H400c17.7 0 32-14.3 32-32s-14.3-32-32-32H256V80z" />
                    </svg>
                    สร้างใบแจ้งหนี้
                </button>
            </div>
            
            <div className="table-container">
                {loading ? (
                    <div className="loading">Loading invoice history...</div>
                ) : sortedInvoices.length > 0 ? (
                    <table className="invoice-table">
                        <thead>
                            <tr>
                                <th onClick={() => handleSort('date')} className="sortable">วันที่ออกบิล</th>
                                <th>ยอดรวม (บาท)</th>
                                <th onClick={() => handleSort('status')} className="sortable">สถานะ</th>
                                <th></th>
                            </tr>
                        </thead>
                        <tbody>
                            {sortedInvoices.map((invoice, index) => (
                                <tr key={index}>
                                    <td>{invoice.date}</td>
                                    <td>{invoice.totalBaht}</td>
                                    <td>
                                        <span className={getStatusClass(invoice.status)}>
                                            {invoice.status}
                                        </span>
                                    </td>
                                    <td>
                                        <button className="action-button print-button">
                                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="16" height="16" fill="currentColor">
                                                <path d="M128 0C92.7 0 64 28.7 64 64v96h64V64h144V0H128zm0 352H64v96c0 35.3 28.7 64 64 64h224c35.3 0 64-28.7 64-64V352h-64V448H128V352zM480 160H352V128h96V64h-96V32c0-17.7-14.3-32-32-32H160c-17.7 0-32 14.3-32 32v32H32c-17.7 0-32 14.3-32 32v96c0 17.7 14.3 32 32 32h96v48H32c-17.7 0-32 14.3-32 32v96c0 17.7 14.3 32 32 32h96v-48h192v48h96c17.7 0 32-14.3 32-32v-96c0-17.7-14.3-32-32-32h-96v-48h96c17.7 0 32-14.3 32-32v-96c0-17.7-14.3-32-32-32zm0 128h-96v-64h96v64z" />
                                            </svg>
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                ) : (
                    <p className="no-data-message">No invoice history found for this room.</p>
                )}
            </div>
        </div>
    );
};

export default RoomInvoiceHistory;
