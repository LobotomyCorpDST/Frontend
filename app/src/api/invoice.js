import http from './http';

// ---------- Create / View ----------
export async function createInvoice(
  payload,
  opts = { includeCommonFee: true, includeGarbageFee: false }
) {
  const params = {
    includeCommonFee: String(opts.includeCommonFee),
    includeGarbageFee: String(opts.includeGarbageFee),
  };
  return http.post(`/api/invoices`, payload, { params });
}

/**
 * เปิดเอกสารของใบแจ้งหนี้
 * - 'print' หรือ 'pdf' => ดึง PDF เป็น blob แล้วเปิดด้วย ObjectURL (เลี่ยงโดน SPA กลืน)
 * - อื่น ๆ             => ต่อ path view ได้ตามต้องการ (ถ้าอนาคตมี)
 */
export async function openInvoice(id, view = 'pdf') {
  if (view === 'print' || view === 'pdf') {
    // ดึงไฟล์แบบ blob (แนบ Authorization ตาม http.js ให้แล้ว)
    const blob = await http.getBlob(`/api/invoices/${id}/pdf`);
    const url = URL.createObjectURL(blob);
    // เปิดในแท็บใหม่
    window.open(url, '_blank', 'noopener,noreferrer');
    // เก็บกวาด object URL หลังจากสักพัก
    setTimeout(() => URL.revokeObjectURL(url), 60_000);
    return;
  }

  // กรณีอนาคตมี view แบบอื่น
  const path = `/api/invoices/${id}/${view}`;
  const blob = await http.getBlob(path);
  const url = URL.createObjectURL(blob);
  window.open(url, '_blank', 'noopener,noreferrer');
  setTimeout(() => URL.revokeObjectURL(url), 60_000);
}

// ---------- Query ----------
export async function listInvoices({ year, month } = {}) {
  if (year && month) {
    return http.get(`/api/invoices/month/${year}/${month}`);
  }
  return http.get(`/api/invoices`);
}

export async function listInvoicesByRoom(roomId) {
  return http.get(`/api/invoices/by-room/${roomId}`);
}

export async function getLatestInvoiceByRoom(roomId) {
  return http.get(`/api/invoices/by-room/${roomId}/latest`);
}

// ---------- Status ops ----------
export async function markPaid(id, paidDate) {
  return http.post(`/api/invoices/${id}/mark-paid`, null, {
    params: paidDate ? { paidDate } : undefined,
  });
}

export async function markUnpaid(id) {
  return http.patch(`/api/invoices/${id}/unpaid`);
}

// ---------- Helpers ----------
export function computeDisplayStatus(inv) {
  if (inv.status === 'PAID') return 'ชำระแล้ว';
  const today = new Date().toISOString().slice(0, 10);
  return inv.dueDate && inv.dueDate < today ? 'ค้างชำระ' : 'ยังไม่ชำระ';
}

// ---------- Edit / Delete ----------
export const getInvoiceById = (id) => http.get(`/api/invoices/${id}`);

export const updateInvoice = (id, payload) => http.patch(`/api/invoices/${id}`, payload);

export const deleteInvoice = (id) => http.delete(`/api/invoices/${id}`);

// ---------- Bulk Print ----------
/**
 * Bulk print multiple invoices as a single combined PDF
 * @param {Array<number>} invoiceIds - Array of invoice IDs to print
 * @returns {Promise<void>} Opens the combined PDF in a new window
 */
export async function bulkPrintInvoices(invoiceIds) {
  if (!invoiceIds || invoiceIds.length === 0) {
    throw new Error('No invoices selected for printing');
  }

  try {
    const blob = await http.postBlob('/api/invoices/bulk-pdf', { ids: invoiceIds });

    const url = URL.createObjectURL(blob);
    window.open(url, '_blank', 'noopener,noreferrer');
    setTimeout(() => URL.revokeObjectURL(url), 60_000);
  } catch (error) {
    console.error('Bulk print failed:', error);
    throw error;
  }
}

// ---------- CSV Import ----------
/**
 * Import invoices from CSV file
 * @param {File} file - CSV file
 * @returns {Promise<Object>} Import result with success/failure counts
 */
export async function importInvoicesFromCsv(file) {
  const formData = new FormData();
  formData.append('file', file);

  const token =
    localStorage.getItem('token') ||
    localStorage.getItem('access_token') ||
    localStorage.getItem('jwt');

  const BASE =
    process.env.REACT_APP_API ||
    process.env.REACT_APP_API_BASE ||
    process.env.REACT_APP_API_BASE_URL ||
    'http://34.87.82.168:8080/';

  const url = `${BASE}/api/invoices/import-csv`;

  const response = await fetch(url, {
    method: 'POST',
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    body: formData,
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(error || 'Failed to import CSV');
  }

  return response.json();
}

// ---------- Get Current Month Invoices ----------
/**
 * Get all invoices for the current calendar month
 * @returns {Promise<Array>} Array of invoices
 */
export async function getCurrentMonthInvoices() {
  return http.get('/api/invoices/current-month');
}
