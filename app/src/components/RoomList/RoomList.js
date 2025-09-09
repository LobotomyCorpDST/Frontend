import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import './RoomList.css';

// API base URL from the routed version
const API_BASE =
  (process.env.REACT_APP_API && process.env.REACT_APP_API.replace(/\/+$/, '')) ||
  'http://localhost:8080/api';

const RoomList = ({ searchTerm, sortBy }) => {
  const navigate = useNavigate();
  const [rooms, setRooms] = useState([]);
  const [sortConfig, setSortConfig] = useState({ key: 'roomNumber', direction: 'ascending' });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Data fetching logic from RoomList_Routed.js
  useEffect(() => {
    let cancelled = false;
    async function fetchData() {
      setLoading(true);
      setError('');
      try {
        const res = await fetch(`${API_BASE}/rooms`);
        if (!res.ok) throw new Error(`Fetch rooms failed: ${res.status}`);
        const roomsJson = await res.json();

        const withLease = await Promise.all(
          roomsJson.map(async (r) => {
            let leaseEndDate = '-';
            try {
              const leaseRes = await fetch(`${API_BASE}/leases/by-room/${r.id}?activeOnly=true`);
              if (leaseRes.ok) {
                const leases = await leaseRes.json();
                if (Array.isArray(leases) && leases.length > 0) {
                  leaseEndDate = leases[0].endDate;
                }
              }
            } catch { /* Ignore single lease fetch errors */ }
            
            return {
              roomId: r.id,
              roomNumber: r.number,
              tenantInfo: { name: r.tenant?.name || '-' },
              leaseEndDate,
              roomStatus: r.status === 'OCCUPIED' ? 'rent paid' : 'room available',
              maintenanceStatus: '-',
            };
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
    return () => { cancelled = true; };
  }, []);

  const handleSort = (key) => {
    setSortConfig((prev) => ({
      key,
      direction: prev.key === key && prev.direction === 'ascending' ? 'descending' : 'ascending',
    }));
  };

  const sortedRooms = useMemo(() => {
    const list = [...rooms];
    if (!sortConfig.key) return list;
    return list.sort((a, b) => {
      const dir = sortConfig.direction === 'ascending' ? 1 : -1;
      if (sortConfig.key === 'roomNumber') return (a.roomNumber - b.roomNumber) * dir;
      if (sortConfig.key === 'occupantName') return (a.tenantInfo.name || '').localeCompare(b.tenantInfo.name || '') * dir;
      // You can add more sorting cases here if needed, following the pattern
      return 0;
    });
  }, [rooms, sortConfig]);

  const filteredRooms = useMemo(() => {
    const term = (searchTerm || '').toLowerCase();
    if (!term) return sortedRooms;
    return sortedRooms.filter(
      (room) =>
        String(room.roomNumber).includes(term) ||
        (room.tenantInfo.name || '').toLowerCase().includes(term)
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
          <th onClick={() => handleSort('occupantName')} className="sortable">Occupant's Name</th>
          <th onClick={() => handleSort('leaseEndDate')} className="sortable">Lease End Date</th>
          <th onClick={() => handleSort('roomStatus')} className="sortable">Room Status</th>
          <th onClick={() => handleSort('maintenanceStatus')} className="sortable">Maintenance Status</th>
        </tr>
      </thead>
      <tbody>
        {filteredRooms.map((room) => (
          <tr key={room.roomId} onClick={() => handleRowClick(room.roomNumber)}>
            <td className="link-text">{room.roomNumber}</td>
            <td>{room.tenantInfo.name}</td>
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