import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import './RoomList.css';
import CreateRoomModal from './CreateRoomModal';

const API_BASE =
  (process.env.REACT_APP_API && process.env.REACT_APP_API.replace(/\/+$/, '')) ||
  'http://localhost:8080/api';

const RoomList = ({ searchTerm, addRoomSignal }) => {
  const navigate = useNavigate();
  const [rooms, setRooms] = useState([]);
  const [sortConfig, setSortConfig] = useState({ key: 'roomNumber', direction: 'ascending' });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [openCreate, setOpenCreate] = useState(false);

  const prevSignal = useRef(addRoomSignal);
  useEffect(() => {
    if (prevSignal.current !== addRoomSignal) {
      prevSignal.current = addRoomSignal;
      setOpenCreate(true);
    }
  }, [addRoomSignal]);

  const loadRooms = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`${API_BASE}/rooms`);
      if (!res.ok) throw new Error(`Fetch rooms failed: ${res.status}`);
      const roomsJson = await res.json();

      const withLease = await Promise.all(
        roomsJson.map(async (r) => {
          let leaseEndDate = '-';
          let occupantName = r.tenant?.name || '-';
          let roomStatus = r.status === 'OCCUPIED' ? 'rent paid' : 'room available';

          try {
            const activeLeaseRes = await fetch(
              `${API_BASE}/leases/active?roomNumber=${encodeURIComponent(r.number)}`
            );

            if (activeLeaseRes.ok) {
              const text = await activeLeaseRes.text();
              const lease = text ? JSON.parse(text) : null;

              if (lease && typeof lease === 'object') {
                occupantName =
                  (lease.customName && lease.customName.trim()) ||
                  (lease.tenant?.name && lease.tenant.name.trim()) ||
                  r.tenant?.name ||
                  '-';

                leaseEndDate = lease.endDate || '-';
                roomStatus = 'rent paid';
              } else {
                occupantName = r.tenant?.name || '-';
                leaseEndDate = '-';
                roomStatus = 'room available';
              }
            }
          } catch {
          }

          return {
            roomId: r.id,
            roomNumber: r.number,
            tenantInfo: { name: occupantName },
            leaseEndDate,
            roomStatus,
            maintenanceStatus: '-',
          };
        })
      );

      setRooms(withLease);
    } catch (e) {
      setError(e.message || 'Failed to load rooms');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!cancelled) await loadRooms();
    })();
    return () => {
      cancelled = true;
    };
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
    const dir = sortConfig.direction === 'ascending' ? 1 : -1;

    return list.sort((a, b) => {
      if (sortConfig.key === 'roomNumber') return (a.roomNumber - b.roomNumber) * dir;
      if (sortConfig.key === 'occupantName')
        return (a.tenantInfo.name || '').localeCompare(b.tenantInfo.name || '') * dir;
      if (sortConfig.key === 'leaseEndDate') {
        const da = a.leaseEndDate && a.leaseEndDate !== '-' ? a.leaseEndDate : '';
        const db = b.leaseEndDate && b.leaseEndDate !== '-' ? b.leaseEndDate : '';
        return da.localeCompare(db) * dir;
      }
      if (sortConfig.key === 'roomStatus')
        return a.roomStatus.localeCompare(b.roomStatus) * dir;
      if (sortConfig.key === 'maintenanceStatus')
        return (a.maintenanceStatus || '').localeCompare(b.maintenanceStatus || '') * dir;
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
    <>
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

      {openCreate && (
        <CreateRoomModal
          open={openCreate}
          onClose={() => setOpenCreate(false)}
          onCreated={loadRooms}
        />
      )}
    </>
  );
};

export default RoomList;
