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
