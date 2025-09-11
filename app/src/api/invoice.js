import http, { API_BASE } from './http';

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

export function openInvoice(id, view = 'print') {
  window.open(`${API_BASE}/invoices/${id}/${view}`, '_blank', 'noopener,noreferrer');
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
  if (inv.status === 'PAID') return 'Paid';
  const today = new Date().toISOString().slice(0, 10);
  return inv.dueDate && inv.dueDate < today ? 'Overdue' : 'Not yet paid';
}
