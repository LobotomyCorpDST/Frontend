import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import './RoomList.css';

const API_BASE =
  (process.env.REACT_APP_API && process.env.REACT_APP_API.replace(/\/+$/, '')) ||
  'http://localhost:8080/api';

const RoomList = ({ searchTerm, sortBy }) => {
  const navigate = useNavigate();
  const [rooms, setRooms] = useState([]);
  const [sortConfig, setSortConfig] = useState({ key: 'roomNumber', direction: 'ascending' });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // โหลดข้อมูลจาก backend
  useEffect(() => {
    let cancelled = false;

    async function fetchData() {
      setLoading(true);
      setError('');

      try {
        // 1) ดึงรายการห้อง
        const res = await fetch(`${API_BASE}/rooms`);
        if (!res.ok) throw new Error(`Fetch rooms failed: ${res.status}`);
        const roomsJson = await res.json(); // [{id, number, status, tenant?}]

        // 2) ดึง lease active ของแต่ละห้องแบบขนาน
        const withLease = await Promise.all(
          roomsJson.map(async (r) => {
            try {
              const leaseRes = await fetch(`${API_BASE}/leases/by-room/${r.id}?activeOnly=true`);
              if (!leaseRes.ok) throw new Error(`Fetch lease failed ${leaseRes.status}`);
              const leases = await leaseRes.json(); // [] หรือ [lease]
              const lease = Array.isArray(leases) && leases.length > 0 ? leases[0] : null;

              // แปลงเป็นรูปแบบที่ตารางต้องใช้
              return {
                roomId: r.id,
                roomNumber: r.number,
                tenantInfo: {
                  name: r.tenant?.name || '-',
                },
                leaseEndDate: lease?.endDate || '-', // ถ้าไม่มีสัญญาแสดง '-'
                // แปลงสถานะให้เข้ากับ CSS/ข้อความเดิม
                roomStatus:
                  r.status === 'OCCUPIED'
                    ? 'rent paid' // ถ้ายังว่างใจ ใช้คำนี้ให้สอดคล้องของเดิม
                    : 'room available',
                maintenanceStatus: '-', // ตอนนี้ยังไม่มีระบบ maintenance ใส่ '-' ไว้ก่อน
              };
            } catch {
              return {
                roomId: r.id,
                roomNumber: r.number,
                tenantInfo: {
                  name: r.tenant?.name || '-',
                },
                leaseEndDate: '-',
                roomStatus: r.status === 'OCCUPIED' ? 'rent paid' : 'room available',
                maintenanceStatus: '-',
              };
            }
          })
        );

        if (!cancelled) setRooms(withLease);
      } catch (e) {
        if (!cancelled) setError(e.message || 'Failed to load rooms');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchData();
    return () => {
      cancelled = true;
    };
  }, []);

  // รับค่า sortBy จาก parent (ปุ่มเรียงของหน้า Home)
  useEffect(() => {
    if (!sortBy) return;
    let key = 'roomNumber';
    let direction = 'ascending';

    switch (sortBy) {
      case 'เลขห้อง':
        key = 'roomNumber';
        break;
      case 'ชื่อ':
        key = 'occupantName'; // map ต่อใน sort ด้านล่าง
        break;
      case 'วันที่':
        key = 'leaseEndDate';
        break;
      default:
        key = 'roomNumber';
    }
    setSortConfig({ key, direction });
  }, [sortBy]);

  const handleSort = (key) => {
    setSortConfig((prev) => {
      const direction = prev.key === key && prev.direction === 'ascending' ? 'descending' : 'ascending';
      return { key, direction };
    });
  };

  const sortedRooms = useMemo(() => {
    const list = [...rooms];
    const { key, direction } = sortConfig;

    return list.sort((a, b) => {
      const dir = direction === 'ascending' ? 1 : -1;

      if (key === 'roomNumber') {
        return (a.roomNumber - b.roomNumber) * dir;
      }

      if (key === 'occupantName') {
        const nameA = (a.tenantInfo?.name || '').toLowerCase();
        const nameB = (b.tenantInfo?.name || '').toLowerCase();
        return nameA.localeCompare(nameB) * dir;
      }

      if (key === 'leaseEndDate') {
        const toDate = (v) => (v === '-' ? new Date(8640000000000000) : new Date(v));
        return (toDate(a.leaseEndDate) - toDate(b.leaseEndDate)) * dir;
      }

      if (key === 'roomStatus') {
        const order = { overdue: 1, 'rent paid': 2, 'room available': 3 };
        const valA = order[a.roomStatus] || 99;
        const valB = order[b.roomStatus] || 99;
        return (valA - valB) * dir;
      }

      if (key === 'maintenanceStatus') {
        const toDate = (v) => (v === '-' ? new Date(-8640000000000000) : new Date(v));
        return (toDate(b.maintenanceStatus) - toDate(a.maintenanceStatus)) * dir;
      }

      return 0;
    });
  }, [rooms, sortConfig]);

  const filteredRooms = useMemo(() => {
    const term = (searchTerm || '').toLowerCase();
    return sortedRooms.filter(
      (room) =>
        String(room.roomNumber).includes(searchTerm || '') ||
        (room.tenantInfo?.name || '').toLowerCase().includes(term)
    );
  }, [sortedRooms, searchTerm]);

  const handleRowClick = (roomNumber) => {
    navigate(`/room-details/${roomNumber}`);
  };

  if (loading) return <div className="room-table">Loading rooms…</div>;
  if (error) return <div className="room-table">Error: {error}</div>;

  return (
    <table className="room-table">
      <thead>
        <tr>
          <th onClick={() => handleSort('roomNumber')} className="sortable">Room No.</th>
          <th onClick={() => handleSort('occupantName')} className="sortable">Occupant&apos;s Name</th>
          <th onClick={() => handleSort('leaseEndDate')} className="sortable">Lease End Date</th>
          <th onClick={() => handleSort('roomStatus')} className="sortable">Room Status</th>
          <th onClick={() => handleSort('maintenanceStatus')} className="sortable">Maintenance Status</th>
        </tr>
      </thead>
      <tbody>
        {filteredRooms.map((room) => (
          <tr key={room.roomNumber} onClick={() => handleRowClick(room.roomNumber)}>
            <td className="link-text">{room.roomNumber}</td>
            <td>{room.tenantInfo?.name || '-'}</td>
            <td>{room.leaseEndDate}</td>
            <td className={`status-${room.roomStatus.replace(/\s+/g, '-')}`}>{room.roomStatus}</td>
            <td>{room.maintenanceStatus}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default RoomList;
