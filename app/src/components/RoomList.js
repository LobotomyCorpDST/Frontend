import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from './Header';
import './RoomList.css';

const placeholderRooms = [
  {
    roomNumber: 101,
    occupantName: 'John Doe',
    leaseEndDate: '2024-12-31',
    roomStatus: 'rent paid',
    maintenanceStatus: '-',
  },
  {
    roomNumber: 102,
    occupantName: 'Jane Smith',
    leaseEndDate: '2024-11-15',
    roomStatus: 'overdue',
    maintenanceStatus: '2024-09-01',
  },
  {
    roomNumber: 103,
    occupantName: 'Alex Johnson',
    leaseEndDate: '2025-01-20',
    roomStatus: 'room available',
    maintenanceStatus: '-',
  },
  {
    roomNumber: 104,
    occupantName: 'Emily White',
    leaseEndDate: '2024-10-31',
    roomStatus: 'rent paid',
    maintenanceStatus: '-',
  },
  {
    roomNumber: 105,
    occupantName: 'Michael Brown',
    leaseEndDate: '2025-03-01',
    roomStatus: 'rent paid',
    maintenanceStatus: '-',
  },
  {
    roomNumber: 106,
    occupantName: 'Lisa Adams',
    leaseEndDate: '2024-10-25',
    roomStatus: 'rent paid',
    maintenanceStatus: '2024-10-15',
  },
  {
    roomNumber: 107,
    occupantName: 'Robert Green',
    leaseEndDate: '2025-02-10',
    roomStatus: 'room available',
    maintenanceStatus: '-',
  },
];

const RoomList = () => {
  const navigate = useNavigate();
  const [rooms, setRooms] = useState([]);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'ascending' });
  const [searchTerm, setSearchTerm] = useState('');

  // Use a placeholder useEffect to simulate fetching data
  useEffect(() => {
    // In a real app, you would fetch data from your MySQL database here.
    // For now, we'll use the placeholder data.
    setRooms(placeholderRooms);
  }, []);

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

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const filteredRooms = sortedRooms.filter((room) =>
    String(room.roomNumber).includes(searchTerm) ||
    room.occupantName.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  const handleRowClick = (roomNumber) => {
    navigate(`/room-details/${roomNumber}`);
  };

  return (
    <>
      <Header title="Room List" />
      <div className="room-list-container">
        <div className="header-bar">
          <div className="header-buttons">
            <button className="invoice-history-btn" onClick={() => navigate('/invoice-history')}>Invoice History</button>
            <button className="room-list-btn" onClick={() => navigate('/room-list')}>Room List</button>
          </div>
          <div className="search-and-add">
            <div className="search-bar">
              <input
                type="text"
                placeholder="Search by Room or Occupant"
                value={searchTerm}
                onChange={handleSearchChange}
              />
            </div>
            <button className="add-room-btn">Add Room</button>
          </div>
        </div>
        <table className="room-table">
          <thead>
            <tr>
              <th onClick={() => handleSort('roomNumber')} className="sortable">Room No.</th>
              <th>Occupant's Name</th>
              <th onClick={() => handleSort('leaseEndDate')} className="sortable">Lease End Date</th>
              <th onClick={() => handleSort('roomStatus')} className="sortable">Room Status</th>
              <th onClick={() => handleSort('maintenanceStatus')} className="sortable">Maintenance Status</th>
            </tr>
          </thead>
          <tbody>
            {filteredRooms.map((room) => (
              <tr key={room.roomNumber} onClick={() => handleRowClick(room.roomNumber)}>
                <td className="room-number-link">
                  {room.roomNumber}
                </td>
                <td>{room.occupantName}</td>
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
