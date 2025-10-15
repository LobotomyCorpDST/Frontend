import http from './http';

export const listTenants = () => http.get('/api/tenants');

export const createTenant = (payload) => http.post('/api/tenants', payload);

export const updateTenant = (id, payload) => http.put(`/api/tenants/${id}`, payload);

export const deleteTenant = (id) => http.delete(`/api/tenants/${id}`);
