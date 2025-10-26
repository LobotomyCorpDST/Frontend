// src/api/lease.js
import http, { API_BASE } from './http';

/**
 * helper ให้แน่ใจว่า path ชี้เข้า /api เสมอ
 */
const apiPath = (p) => (p.startsWith('/api') ? p : `/api${p}`);

// ---------- Query ----------
export const getAllLeases = () => http.get(apiPath('/leases'));

export const getActiveLease = (roomNumber) =>
  http.get(apiPath('/leases/active'), { params: { roomNumber } });

export const getLeaseHistory = (roomNumber) =>
  http.get(apiPath(`/leases/history/${roomNumber}`));

export const getActiveLeaseByTenantId = (tenantId) =>
    http.get(apiPath(`/leases/by-tenant/${tenantId}`), { params: { tenantId } });

// // หา lease by tenant id
// export const getActiveLeaseByTenantId = async (tenantId) => {
//     if (!tenantId) throw new Error("Tenant ID is required.");
//     try {
//         const response = await http.get(`/leases/by-tenant/${tenantId}`); // ADJUST ENDPOINT IF NEEDED
//         return response.data; // Assuming your backend has this endpoint
//     } catch (error) {
//         console.error(`Error fetching active lease for tenant ${tenantId}:`, error);
//         throw error;
//     }
// };

// ---------- Create ----------
/**
 * payload รองรับหลายแบบตาม BE:
 *  - { tenantId, roomId, startDate }
 *  - { tenant:{id}, room:{id|number}, startDate, ... }
 *  - { tenantId, roomNumber, startDate }
 */
export const createLease = (payload) => http.post(apiPath('/leases'), payload);

/**
 * เผื่ออยากสร้างด้วย roomNumber แล้วให้เราไปแปลงเป็น roomId ให้ก่อน
 */
export const createLeaseByRoomNumber = async ({ tenantId, roomNumber, startDate }) => {
  const roomView = await http.get(apiPath(`/rooms/by-number/${roomNumber}`)); // คืน RoomView
  return http.post(apiPath('/leases'), { tenantId, roomId: roomView.id, startDate });
};



/** settleLease: POST /api/leases/{id}/settle?date=YYYY-MM-DD */
export const settleLease = (leaseId, date) =>
  http.post(apiPath(`/leases/${leaseId}/settle`), null, {
    params: date ? { date } : undefined,
  });

// ---------- Update ----------

// ✅ Get lease by ID
export const getLeaseById = (leaseId) =>
  http.get(apiPath(`/leases/${leaseId}`));

// ✅ Update (PATCH) lease partially
export const updateLease = (leaseId, payload) =>
  http.patch(apiPath(`/leases/${leaseId}`), payload);

// ✅ Delete lease
export const deleteLease = (leaseId) =>
  http.delete(apiPath(`/leases/${leaseId}`));

/** endLease: PUT /api/leases/{id}/end { endDate?: 'YYYY-MM-DD' } */
export const endLease = (leaseId, endDate) =>
  http.put(apiPath(`/leases/${leaseId}/end`), endDate ? { endDate } : {});

// ---------- Print / Open ----------
/**
 * เปิดไฟล์สัญญา (เช่น PDF/HTML) โดยดึงเป็น blob มาก่อนเพื่อพก header/token
 * แล้วค่อย window.open(blobUrl) — หลบ 401/403 ที่เจอเวลาเปิดตรง ๆ
 */
export const openLease = async (id, view = 'print') => {
  // ดึงเป็น blob
  const blob = await http.getBlob(apiPath(`/leases/${id}/${view}`));
  // กันกรณี backend ส่ง HTML error กลับมา
  if (blob && blob.type && blob.type.includes('text/html')) {
    const text = await blob.text();
    throw new Error(text || 'Open lease failed');
  }
  const url = URL.createObjectURL(blob);
  window.open(url, '_blank', 'noopener,noreferrer');
  // ปล่อยให้เบราว์เซอร์ cache ไฟล์ไว้ชั่วคราว
  setTimeout(() => URL.revokeObjectURL(url), 60_000);
};

// ---------- Bulk Print ----------
/**
 * Bulk print multiple leases as a single combined PDF
 * @param {Array<number>} leaseIds - Array of lease IDs to print
 * @returns {Promise<void>} Opens the combined PDF in a new window
 */
export const bulkPrintLeases = async (leaseIds) => {
  if (!leaseIds || leaseIds.length === 0) {
    throw new Error('No leases selected for printing');
  }

  try {
    const blob = await http.postBlob(apiPath('/leases/bulk-pdf'), { ids: leaseIds });

    // Check if response is actually a PDF
    if (blob && blob.type && blob.type.includes('text/html')) {
      const text = await blob.text();
      throw new Error(text || 'Bulk print failed');
    }

    const url = URL.createObjectURL(blob);
    window.open(url, '_blank', 'noopener,noreferrer');
    setTimeout(() => URL.revokeObjectURL(url), 60_000);
  } catch (error) {
    console.error('Bulk print leases failed:', error);
    throw error;
  }
};
