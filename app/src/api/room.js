import http from './http';

export const listRooms = () => http.get('/api/rooms');

export const createRoom = (payload) => http.post('/api/rooms', payload);

export const getRoomByNumber = (number) =>
  http.get(`/api/rooms/by-number/${number}`);

export const getRoomById = (id) =>
  http.get(`/api/rooms/${id}`);

export const updateRoom = (id, payload) =>
  http.put(`/api/rooms/${id}`, payload);

export const pingRooms = () =>
  http.get('/api/rooms/ping');

export const deleteRoom = (id) => 
  http.delete(`/api/rooms/${id}`);
