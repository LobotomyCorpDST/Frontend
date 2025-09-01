import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { placeholderData } from '../../data/placeholderData';
import './RoomDetail.css';

const RoomDetail = () => {
    const { roomNumber } = useParams();
    const navigate = useNavigate();
    const [room, setRoom] = useState(null);
    const [activeTab, setActiveTab] = useState('details');
    const [sortConfig, setSortConfig] = useState({ key: null, direction: 'ascending' });

    useEffect(() => {
        const foundRoom = placeholderData.find(r => r.roomNumber === parseInt(roomNumber));
        if (foundRoom) {
            // Add mock data for invoice and maintenance history
            const mockInvoiceHistory = [
                { date: '2025-08-01', totalBaht: foundRoom.latestUsage.totalBaht, status: 'Not yet paid' },
                { date: '2025-07-01', totalBaht: foundRoom.latestUsage.totalBaht + 50, status: 'Paid' },
                { date: '2025-06-01', totalBaht: foundRoom.latestUsage.totalBaht - 20, status: 'Overdue' },
            ];
            const mockMaintenanceHistory = [
                { date: '2025-07-15', type: 'ซ่อมแอร์', description: 'น้ำหยดจากเครื่องปรับอากาศ', status: 'Completed', technician: 'ช่างเอก' },
                { date: '2025-06-20', type: 'ทำความสะอาด', description: 'ทำความสะอาดห้องน้ำ', status: 'Completed', technician: 'ช่างบี' },
                { date: '2025-05-10', type: 'ไฟเสีย', description: 'ไฟในห้องนอนไม่ติด', status: 'Pending', technician: 'ช่างซี' },
            ];
            setRoom({
                ...foundRoom,
                invoiceHistory: mockInvoiceHistory,
                maintenanceHistory: mockMaintenanceHistory,
            });
        } else {
            console.error('Room not found');
        }
    }, [roomNumber]);

    const handleTabClick = (tab) => {
        setActiveTab(tab);
    };

    const handleSort = (key) => {
        let direction = 'ascending';
        if (sortConfig.key === key && sortConfig.direction === 'ascending') {
            direction = 'descending';
        }
        setSortConfig({ key, direction });
    };

    const getStatusClass = (status) => {
        switch (status.toLowerCase()) {
            case 'paid':
                return 'status-Paid';
            case 'overdue':
                return 'status-Overdue';
            case 'not yet paid':
                return 'status-not-yet-paid';
            case 'completed':
                return 'status-completed';
            case 'pending':
                return 'status-pending';
            default:
                return '';
        }
    };
    
    const sortedInvoices = room?.invoiceHistory ? [...room.invoiceHistory].sort((a, b) => {
        if (sortConfig.key === 'date') {
            const dateA = new Date(a.date);
            const dateB = new Date(b.date);
            return sortConfig.direction === 'ascending' ? dateA - dateB : dateB - dateA;
        }

        if (sortConfig.key === 'status') {
            const order = { 'paid': 1, 'overdue': 2, 'not yet paid': 3 };
            const statusA = order[a.status.toLowerCase()];
            const statusB = order[b.status.toLowerCase()];
            return sortConfig.direction === 'ascending' ? statusA - statusB : statusB - statusA;
        }

        return 0;
    }) : [];

    if (!room) {
        return <div className="loading">Loading room details...</div>;
    }

    return (
        <div className="content-container">
            <div className="detail-header">
                <button onClick={() => navigate('/home')} className="back-btn">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512" width="20" height="20" fill="currentColor">
                        <path d="M9.4 233.4c-12.5 12.5-12.5 32.8 0 45.3l160 160c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3L109.2 288H416c17.7 0 32-14.3 32-32s-14.3-32-32-32H109.2l105.3-105.3c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0l-160 160z"/>
                    </svg>
                </button>
                <h1 className="room-number-heading">ห้อง {room.roomNumber}</h1>
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
                <div className="active-bar"></div>
            </div>
            
            <div className="tab-content-wrapper">
                {activeTab === 'details' && (
                    <div className="tab-content">
                        <div className="details-card">
                            <h2>ข้อมูลผู้เช่า</h2>
                            <div className="profile-section">
                                <img src={room.tenantInfo.profilePic} alt="Profile" className="profile-pic" />
                                <div className="profile-info">
                                    <p><strong>ชื่อ:</strong> {room.tenantInfo.name}</p>
                                    <p><strong>เบอร์:</strong> {room.tenantInfo.phoneNumber}</p>
                                    <p><strong>LINE:</strong> {room.tenantInfo.lineId}</p>
                                </div>
                            </div>
                        </div>

                        <div className="details-card">
                            <h2>รายละเอียดสัญญาเช่า</h2>
                            <div className="contract-info">
                                <div className="info-item">
                                    <p><strong>สถานะเข้าอาศัย:</strong> <span className={`status-${room.roomStatus.replace(/\s+/g, '-')}`}>{room.roomStatus}</span></p>
                                    <p><strong>วันที่เข้าอาศัย:</strong> {room.checkInDate}</p>
                                    <p><strong>วันที่ออก:</strong> {room.checkOutDate}</p>
                                    <p><strong>สัญญาเริ่ม:</strong> {room.leaseStartDate}</p>
                                    <p><strong>สัญญาจบ:</strong> {room.leaseEndDate}</p>
                                </div>
                                <div className="info-item">
                                    <p><strong>สถานะบำรุงรักษา:</strong> <span className={`maintenance-status-${room.maintenanceStatus === '-' ? 'clear' : 'active'}`}>{room.maintenanceStatus === '-' ? 'ไม่มี' : 'ดำเนินการ'}</span></p>
                                </div>
                            </div>
                        </div>

                        <div className="details-card">
                            <h2>ค่าใช้จ่ายล่าสุด</h2>
                            <div className="bill-info">
                                <div className="bill-item">
                                    <p><strong>ค่าไฟฟ้าเดือนที่แล้ว (หน่วย):</strong> {room.latestUsage.electricity.units}</p>
                                    <p><strong>ค่าไฟฟ้าเดือนที่แล้ว (บาท):</strong> {room.latestUsage.electricity.baht}</p>
                                </div>
                                <div className="bill-item">
                                    <p><strong>ค่าน้ำประปาเดือนที่แล้ว (หน่วย):</strong> {room.latestUsage.water.units}</p>
                                    <p><strong>ค่าน้ำประปาเดือนที่แล้ว (บาท):</strong> {room.latestUsage.water.baht}</p>
                                </div>
                                <div className="bill-item">
                                    <p><strong>ค่าค้างชำระ:</strong> {room.latestUsage.overdue.baht}</p>
                                    <p><strong>รวมทั้งสิ้น:</strong> {room.latestUsage.totalBaht}</p>
                                </div>
                            </div>
                        </div>
                        <div className="action-buttons">
                            <button className="action-btn edit-btn">
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="16" height="16" fill="currentColor">
                                    <path d="M410.3 231l13.7-13.7c9.4-9.4 24.6-9.4 33.9 0l35.3 35.3c9.4 9.4 9.4 24.6 0 33.9L403.2 384H320l81.6-81.6zM461.9 146.1l-45.3-45.3c-25-25-65.6-25-90.6 0L102.6 304.7c-3.1 3.1-5.3 6.6-6.8 10.2L74.1 385.9c-2.4 6.7-.1 14.1 6.1 19.3s14.8 6.5 22.1 4.1L187.1 391.1c3.6-1.5 7.1-3.7 10.2-6.8L384 196.6l-24.8-24.8L437.1 121.3c25-25 25-65.6 0-90.6zM128 416H0V288l288-288 128 128L128 416zm128 48H320l-32-32H128V464z" />
                                </svg>
                                แก้ไขข้อมูล
                            </button>
                            <button className="action-btn invoice-btn">
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 384 512" width="16" height="16" fill="currentColor">
                                    <path d="M224 96H48c-8.8 0-16 7.2-16 16V464c0 8.8 7.2 16 16 16h288c8.8 0 16-7.2 16-16V128l-96-96zm-56 56c-4.4 0-8 3.6-8 8v8h128v-8c0-4.4-3.6-8-8-8H168zm212-40.8l-80-80c-4.9-4.9-12.8-4.9-17.7 0L176 168v8c0 4.4 3.6 8 8 8h128c4.4 0 8-3.6 8-8v-8l12.4-12.4c4.9-4.9 4.9-12.8 0-17.7zM368 464c0 17.7-14.3 32-32 32H48c-17.7 0-32-14.3-32-32V48c0-17.7 14.3-32 32-32H208V128c0 17.7 14.3 32 32 32h128v320z" />
                                </svg>
                                Generate Invoice
                            </button>
                        </div>
                    </div>
                )}

                {activeTab === 'invoice' && (
                    <div className="tab-content">
                        <div className="button-container">
                            <button className="action-button add-invoice-btn">
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512" width="16" height="16" fill="currentColor">
                                    <path d="M256 80c0-17.7-14.3-32-32-32s-32 14.3-32 32V224H48c-17.7 0-32 14.3-32 32s14.3 32 32 32H192V432c0 17.7 14.3 32 32 32s32-14.3 32-32V288H400c17.7 0 32-14.3 32-32s-14.3-32-32-32H256V80z" />
                                </svg>
                                สร้างใบแจ้งหนี้
                            </button>
                        </div>
                        
                        <div className="table-container">
                            {sortedInvoices.length > 0 ? (
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
                )}

                {activeTab === 'maintenance' && (
                    <div className="tab-content">
                        <div className="button-container">
                            <button className="action-button add-maintenance-btn">
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512" width="16" height="16" fill="currentColor">
                                    <path d="M256 80c0-17.7-14.3-32-32-32s-32 14.3-32 32V224H48c-17.7 0-32 14.3-32 32s14.3 32 32 32H192V432c0 17.7 14.3 32 32 32s32-14.3 32-32V288H400c17.7 0 32-14.3 32-32s-14.3-32-32-32H256V80z" />
                                </svg>
                                เพิ่มงานบำรุงรักษา
                            </button>
                        </div>
                        
                        <div className="table-container">
                            {room.maintenanceHistory.length > 0 ? (
                                <table className="maintenance-table">
                                    <thead>
                                        <tr>
                                            <th>วันที่แจ้ง</th>
                                            <th>ประเภท</th>
                                            <th>รายละเอียด</th>
                                            <th>สถานะ</th>
                                            <th>ช่าง</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {room.maintenanceHistory.map((log, index) => (
                                            <tr key={index}>
                                                <td>{log.date}</td>
                                                <td>{log.type}</td>
                                                <td>{log.description}</td>
                                                <td>
                                                    <span className={getStatusClass(log.status)}>
                                                        {log.status}
                                                    </span>
                                                </td>
                                                <td>{log.technician}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            ) : (
                                <p className="no-data-message">No maintenance history found for this room.</p>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default RoomDetail;
