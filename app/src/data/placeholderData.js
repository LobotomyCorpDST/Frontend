export const placeholderData = [
  {
    id: 1,
    floor: 1,
    roomNumber: '101',
    // --- Data added for RoomCard component ---
    price: 3000,
    occupancy: 1,
    privateBathroom: true,
    kitchen: true,
    // --- Existing Data ---
    tenantInfo: {
      name: 'นายกิตติชาติ ชินนา',
      phoneNumber: '0007355608',
      lineId: 'ohiobossrizz',
      profilePic: 'https://placehold.co/150x150/e0eaf2/1d3e7d?text=Profile',
    },
    roomStatus: 'rent paid', // Status could be 'rent paid', 'overdue', etc. (Red border)
    checkInDate: '2024-09-01',
    checkOutDate: '-',
    leaseStartDate: '2024-09-01',
    leaseEndDate: '2025-08-31',
  },
  {
    id: 2,
    floor: 1,
    roomNumber: '102',
    // --- Data added for RoomCard component ---
    price: 3000,
    occupancy: 1,
    privateBathroom: true,
    kitchen: false, // Example of a room without a kitchen
    // --- Existing Data ---
    tenantInfo: {
      name: 'Jane Smith',
      phoneNumber: '0001234567',
      lineId: 'janesmith',
      profilePic: 'https://placehold.co/150x150/e0eaf2/1d3e7d?text=Profile',
    },
    roomStatus: 'overdue', // (Red border)
    checkInDate: '2024-08-15',
    checkOutDate: '-',
    leaseStartDate: '2024-08-15',
    leaseEndDate: '2025-08-14',
  },
  {
    id: 3,
    floor: 1,
    roomNumber: '103',
    // --- Data added for RoomCard component ---
    price: 3000,
    occupancy: 1,
    privateBathroom: true,
    kitchen: true,
    // --- Existing Data ---
    tenantInfo: {
      name: '-',
      phoneNumber: '-',
      lineId: '-',
      profilePic: 'https://placehold.co/150x150/e0eaf2/1d3e7d?text=Profile',
    },
    roomStatus: 'Room Available', // (Green border)
    checkInDate: '-',
    checkOutDate: '-',
    leaseStartDate: '-',
    leaseEndDate: '-',
  },
  // --- Data for Floor 2 ---
  {
    id: 4,
    floor: 2,
    roomNumber: '201',
    // --- Data added for RoomCard component ---
    price: 3200, // Example of different price
    occupancy: 1,
    privateBathroom: true,
    kitchen: true,
    // --- Existing Data ---
    tenantInfo: {
      name: 'Somsak Jaidee',
      phoneNumber: '0891234567',
      lineId: 'somsak.j',
      profilePic: 'https://placehold.co/150x150/e0eaf2/1d3e7d?text=Profile',
    },
    roomStatus: 'rent paid', // (Red border)
    checkInDate: '2024-07-01',
    checkOutDate: '-',
    leaseStartDate: '2024-07-01',
    leaseEndDate: '2025-06-30',
  },
  {
    id: 5,
    floor: 2,
    roomNumber: '202',
    // --- Data added for RoomCard component ---
    price: 3200,
    occupancy: 1,
    privateBathroom: true,
    kitchen: false,
    // --- Existing Data ---
    tenantInfo: {
      name: '-',
      phoneNumber: '-',
      lineId: '-',
      profilePic: 'https://placehold.co/150x150/e0eaf2/1d3e7d?text=Profile',
    },
    roomStatus: 'Room Available', // (Green border)
    checkInDate: '-',
    checkOutDate: '-',
    leaseStartDate: '-',
    leaseEndDate: '-',
  },
];