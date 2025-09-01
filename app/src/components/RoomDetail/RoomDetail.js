import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { placeholderData } from '../../data/placeholderData';
import './RoomDetail.css';

const RoomDetail = () => {
    const { roomNumber } = useParams();
    const navigate = useNavigate();
    const [room, setRoom] = useState(null);

    useEffect(() => {
        // Find the room data based on the roomNumber from the URL
        const foundRoom = placeholderData.find(r => r.roomNumber === parseInt(roomNumber));
        if (foundRoom) {
            setRoom(foundRoom);
        } else {
            // Handle case where room is not found (e.g., redirect to 404 or a list)
            console.error('Room not found');
            // navigate('/room-list'); // Optional: redirect back to room list
        }
    }, [roomNumber, navigate]);

    if (!room) {
        return <div className="loading">Loading room details...</div>;
    }

    return (
        <div className="room-detail-container">
            <div className="detail-header">
                <button onClick={() => navigate(-1)} className="back-btn">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512" width="20" height="20" fill="currentColor">
                        <path d="M9.4 233.4c-12.5 12.5-12.5 32.8 0 45.3l160 160c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3L109.2 288H416c17.7 0 32-14.3 32-32s-14.3-32-32-32H109.2l105.3-105.3c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0l-160 160z"/>
                    </svg>
                </button>
                <h1 className="room-number-heading">ห้อง {room.roomNumber}</h1>
            </div>
            
            <div className="tab-navigation">
                <button className="tab-btn active">รายละเอียด</button>
                <button className="tab-btn">ใบแจ้งหนี้</button>
                <button className="tab-btn">บำรุงรักษา</button>
            </div>
            
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
                <button className="action-btn maintenance-btn">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="16" height="16" fill="currentColor">
                        <path d="M464 256A208 208 0 1 1 48 256a208 208 0 1 1 416 0zM0 256a256 256 0 1 0 512 0A256 256 0 1 0 0 256zm232-96V272c0 8.8 7.2 16 16 16H352c8.8 0 16-7.2 16-16V160c0-8.8-7.2-16-16-16H248c-8.8 0-16 7.2-16 16z" />
                    </svg>
                    Maintenance Log
                </button>
                <button className="action-btn invoice-btn">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 384 512" width="16" height="16" fill="currentColor">
                        <path d="M224 96H48c-8.8 0-16 7.2-16 16V464c0 8.8 7.2 16 16 16h288c8.8 0 16-7.2 16-16V128l-96-96zm-56 56c-4.4 0-8 3.6-8 8v8h128v-8c0-4.4-3.6-8-8-8H168zm212-40.8l-80-80c-4.9-4.9-12.8-4.9-17.7 0L176 168v8c0 4.4 3.6 8 8 8h128c4.4 0 8-3.6 8-8v-8l12.4-12.4c4.9-4.9 4.9-12.8 0-17.7zM368 464c0 17.7-14.3 32-32 32H48c-17.7 0-32-14.3-32-32V48c0-17.7 14.3-32 32-32H208V128c0 17.7 14.3 32 32 32h128v320z" />
                    </svg>
                    Generate Invoice
                </button>
            </div>
        </div>
    );
};

export default RoomDetail;
