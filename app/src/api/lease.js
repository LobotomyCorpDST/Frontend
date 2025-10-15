import http, { API_BASE } from './http';

export const getAllLeases = () =>
  http.get(`/api/leases`);

export const getActiveLease = (roomNumber) =>
  http.get(`/api/leases/active`, { params: { roomNumber } });

export const getLeaseHistory = (roomNumber) =>
  http.get(`/api/leases/history/${roomNumber}`);

export const createLease = (payload) =>
  http.post(`/api/leases`, payload);

export const endLease = (leaseId, endDate) =>
  http.post(`/api/leases/${leaseId}/end`, null, {
    params: endDate ? { endDate } : undefined,
  });

export const settleLease = (leaseId, date) =>
  http.post(`/api/leases/${leaseId}/settle`, null, {
    params: date ? { date } : undefined,
  });

export const openLease = (id, view = 'print') =>
  window.open(`${API_BASE}/leases/${id}/${view}`, '_blank', 'noopener,noreferrer');

export const getActiveLeaseByTenantId = (tenantId) => http.get(`/api/leases/by-tenant/${tenantId}`);