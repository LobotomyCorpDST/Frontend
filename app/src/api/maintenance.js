import http from './http';

// ---------------- Query ----------------
export async function listMaintenanceByRoom(roomId) {
  return http.get(`/api/maintenance/by-room/${roomId}`);
}

// ---------------- Create ----------------
export async function createMaintenance(payload) {
  return http.post(`/api/maintenance`, payload);
}

// ---------------- Update ----------------
export async function completeMaintenance(id, completedDate) {
  return http.patch(`/api/maintenance/${id}/complete`, null, {
    params: completedDate ? { completedDate } : undefined, // YYYY-MM-DD
  });
}

export async function updateMaintenance(id, payload) {
  return http.put(`/api/maintenance/${id}`, payload);
}
