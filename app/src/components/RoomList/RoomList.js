import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { placeholderData } from '../../data/placeholderData';
import './RoomList.css';

const RoomList = ({ searchTerm, sortBy }) => {
  const navigate = useNavigate();
  const [rooms, setRooms] = useState([]);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'ascending' });

  // Use a placeholder useEffect to simulate fetching data
  useEffect(() => {
    setRooms(placeholderData);
  }, []);

  // Apply external sortBy prop if provided
  useEffect(() => {
    if (sortBy) {
      let sortKey = null;
      let direction = 'ascending';
      
      switch(sortBy) {
        case 'เลขห้อง':
          sortKey = 'roomNumber';
          break;
        case 'ชื่อ':
          sortKey = 'occupantName';
          break;
        case 'วันที่':
          sortKey = 'leaseEndDate';
          break;
        default:
          sortKey = 'roomNumber';
      }
      
      setSortConfig({ key: sortKey, direction });
    }
  }, [sortBy]);

  const handleSort = (key) => {
    let direction = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  const sortedRooms = [...rooms].sort((a, b) => {
    if (sortConfig.key === 'roomNumber') {
      return sortConfig.direction === 'ascending' ? a.roomNumber - b.roomNumber : b.roomNumber - a.roomNumber;
    }

    if (sortConfig.key === 'occupantName') {
      const nameA = a.tenantInfo.name.toLowerCase();
      const nameB = b.tenantInfo.name.toLowerCase();
      if (sortConfig.direction === 'ascending') {
        return nameA.localeCompare(nameB);
      }
      return nameB.localeCompare(nameA);
    }

    if (sortConfig.key === 'leaseEndDate') {
      const dateA = a.leaseEndDate === '-' ? new Date(8640000000000000) : new Date(a.leaseEndDate);
      const dateB = b.leaseEndDate === '-' ? new Date(8640000000000000) : new Date(b.leaseEndDate);
      return sortConfig.direction === 'ascending' ? dateA - dateB : dateB - dateA;
    }

    if (sortConfig.key === 'roomStatus') {
      const order = { 'overdue': 1, 'rent paid': 2, 'room available': 3 };
      const statusA = order[a.roomStatus] || 4;
      const statusB = order[b.roomStatus] || 4;
      return sortConfig.direction === 'ascending' ? statusA - statusB : statusB - statusA;
    }

    if (sortConfig.key === 'maintenanceStatus') {
      const dateA = a.maintenanceStatus === '-' ? new Date(8640000000000000) : new Date(a.maintenanceStatus);
      const dateB = b.maintenanceStatus === '-' ? new Date(8640000000000000) : new Date(b.maintenanceStatus);
      return sortConfig.direction === 'ascending' ? dateB - dateA : dateA - dateB;
    }

    return 0;
  });

  const filteredRooms = sortedRooms.filter((room) =>
    String(room.roomNumber).includes(searchTerm || '') ||
    room.tenantInfo.name.toLowerCase().includes((searchTerm || '').toLowerCase())
  );

  const handleRowClick = (roomNumber) => {
    navigate(`/room-details/${roomNumber}`);
  };

  return (
    <>
      <div className="room-list-container">
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
              <tr key={room.roomNumber} onClick={() => handleRowClick(room.roomNumber)}>
                <td className="link-text">
                  {room.roomNumber}
                </td>
                <td>{room.tenantInfo.name}</td>
                <td>{room.leaseEndDate}</td>
                <td className={`status-${room.roomStatus.replace(/\s+/g, '-')}`}>
                  {room.roomStatus}
                </td>
                <td>{room.maintenanceStatus}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
};

export default RoomList;
