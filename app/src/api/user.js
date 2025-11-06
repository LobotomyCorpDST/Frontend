// src/api/user.js
import http from './http';

/**
 * Get all users (ADMIN only)
 */
export const getAllUsers = () => http.get('/api/users');

/**
 * Get user by ID (ADMIN only)
 */
export const getUserById = (id) => http.get(`/api/users/${id}`);

/**
 * Create new user (ADMIN only)
 * @param {Object} payload - { username, password, role, roomNumber }
 */
export const createUser = (payload) => http.post('/api/users', payload);

/**
 * Update user (ADMIN only)
 * @param {number} id - User ID
 * @param {Object} payload - { username, role, roomNumber }
 */
export const updateUser = (id, payload) => http.put(`/api/users/${id}`, payload);

/**
 * Change user password (ADMIN only)
 * @param {number} id - User ID
 * @param {string} newPassword - New password
 */
export const changePassword = (id, newPassword) =>
  http.patch(`/api/users/${id}/change-password`, { newPassword });

/**
 * Delete user (ADMIN only)
 * @param {number} id - User ID
 */
export const deleteUser = (id) => http.delete(`/api/users/${id}`);
