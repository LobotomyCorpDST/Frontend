import http from './http';

/**
 * หมายเหตุสำคัญ:
 * - http.js กำหนด BASE = <REACT_APP_API_BASE>/api อยู่แล้ว
 *   เพราะงั้นที่นี่ "ไม่ต้อง" ใส่ /api นำหน้าอีก
 */

// ---------------- Query ----------------
export async function getMaintenanceByID(Id) {
  return http.get(`/api/maintenance/${Id}`);
}

export async function listMaintenance() {
  return http.get('/api/maintenance');
}

export async function getMaintenance(id) {
  return http.get(`/api/maintenance/${id}`);
}

export async function listMaintenanceByRoomNumber(roomNumber) {
  // ใช้ roomNumber แทน roomId
  return http.get(`/api/maintenance/by-room-number/${roomNumber}`);
}

// ---------------- Create ----------------
export async function createMaintenance(payload) {
  // payload ควรเป็น { roomNumber, description, scheduledDate, costBaht }
  return http.post('/api/maintenance', payload);
}

// ---------------- Update ----------------
export async function completeMaintenance(id, completedDate) {
  // completedDate: 'YYYY-MM-DD' (optional)
  return http.patch(`/api/maintenance/${id}/complete`, null, {
    params: completedDate ? { completedDate } : undefined,
  });
}

export async function updateMaintenance(id, payload) {
  // payload รองรับ { roomNumber?, description?, scheduledDate?, costBaht? }
  return http.put(`/api/maintenance/${id}`, payload);
}

// ---------------- Admin Edit (partial patch) ----------------
export async function adminEditMaintenance(id, payload) {
  // payload รองรับ { status?, scheduledDate?, completedDate?, description?, costBaht? }
  return http.patch(`/api/maintenance/${id}/edit`, payload);
}
