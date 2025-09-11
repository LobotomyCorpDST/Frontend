import http from './http';

export const listRooms = () => http.get('/api/rooms');

export const createRoom = (payload) =>
  http.post('/api/rooms', payload);

export const getRoomByNumber = (number) =>
  http.get(`/api/rooms/by-number/${number}`);
