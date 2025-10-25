import http from './http';

/**
 * Get summary report by room (all invoices for that room)
 */
export async function getSummaryByRoom(roomId) {
  return http.get(`/api/reports/by-room/${roomId}`);
}

/**
 * Get summary report by room and specific month
 */
export async function getSummaryByRoomAndMonth(roomId, year, month) {
  return http.get(`/api/reports/by-room/${roomId}/month/${year}/${month}`);
}

/**
 * Get summary report by room number (all invoices for that room)
 */
export async function getSummaryByRoomNumber(roomNumber) {
  return http.get(`/api/reports/by-room-number/${roomNumber}`);
}

/**
 * Get summary report by room number and specific month
 */
export async function getSummaryByRoomNumberAndMonth(roomNumber, year, month) {
  return http.get(`/api/reports/by-room-number/${roomNumber}/month/${year}/${month}`);
}

/**
 * Get summary report by tenant (all invoices for that tenant)
 */
export async function getSummaryByTenant(tenantId) {
  return http.get(`/api/reports/by-tenant/${tenantId}`);
}

/**
 * Get summary report by month (all rooms in that month)
 */
export async function getSummaryByMonth(year, month) {
  return http.get(`/api/reports/by-month/${year}/${month}`);
}

/**
 * Get floor comparison data for a specific month (for bar chart)
 */
export async function getFloorComparison(year, month) {
  return http.get(`/api/reports/floor-comparison/${year}/${month}`);
}

/**
 * Get monthly trend data for a specific room (for line chart)
 */
export async function getMonthlyTrend(roomNumber, months = 6) {
  return http.get(`/api/reports/monthly-trend/${roomNumber}`, { params: { months } });
}

/**
 * Get monthly trend data for an entire floor (for line chart)
 */
export async function getFloorTrend(floor, startMonth, endMonth) {
  return http.get(`/api/reports/floor-trend/${floor}`, {
    params: { startMonth, endMonth }
  });
}
