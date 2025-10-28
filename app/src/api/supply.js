import { http } from './http';

/**
 * Get all supplies, optionally filtered by search term
 * @param {string} search - Optional search term
 */
export async function getAllSupplies(search = '') {
  const params = search ? { search } : {};
  return http.get('/api/supplies', { params });
}

/**
 * Get supplies with low stock (< 3 units)
 */
export async function getLowStockSupplies() {
  return http.get('/api/supplies/low-stock');
}

/**
 * Get a single supply by ID
 * @param {number} id - Supply ID
 */
export async function getSupplyById(id) {
  return http.get(`/api/supplies/${id}`);
}

/**
 * Create a new supply
 * @param {Object} supply - { supplyName, supplyAmount }
 */
export async function createSupply(supply) {
  return http.post('/api/supplies', supply);
}

/**
 * Update supply
 * @param {number} id - Supply ID
 * @param {Object} updates - { supplyName?, supplyAmount? }
 */
export async function updateSupply(id, updates) {
  return http.patch(`/api/supplies/${id}`, updates);
}

/**
 * Increment supply amount by 1
 * @param {number} id - Supply ID
 */
export async function incrementSupply(id) {
  return http.post(`/api/supplies/${id}/increment`, {});
}

/**
 * Decrement supply amount by 1
 * @param {number} id - Supply ID
 */
export async function decrementSupply(id) {
  return http.post(`/api/supplies/${id}/decrement`, {});
}

/**
 * Delete a supply
 * @param {number} id - Supply ID
 */
export async function deleteSupply(id) {
  return http.delete(`/api/supplies/${id}`);
}
