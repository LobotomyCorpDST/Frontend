// src/api/tenant.js
import http from './http';

// ----- CRUD พื้นฐาน -----
export const listTenants = () => http.get('/api/tenants');

export const listTenantsWithRooms = () => http.get('/api/tenants/with-rooms');

export const getTenantById = (id) => http.get(`/api/tenants/${id}`);

export const createTenant = (payload) => http.post('/api/tenants', payload);

export const updateTenant = (id, payload) => http.put(`/api/tenants/${id}`, payload);

export const deleteTenant = (id) => http.delete(`/api/tenants/${id}`);

// ----- Helper แนะนำสำหรับ auto-fill (ไม่บังคับ) -----
// ใช้ในฟอร์ม: ถ้าไม่เจอ (404) จะคืน null เฉย ๆ ไม่โยน error
export const getTenantByIdSafe = async (id) => {
  try {
    return await getTenantById(id);
  } catch (e) {
    const status = e?.response?.status || e?.status;
    if (status === 404) return null;
    throw e;
  }
};
