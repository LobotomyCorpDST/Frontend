const API_BASE = process.env.REACT_APP_API_BASE || 'http://localhost:8080';

// ---------- Create / View ----------
export async function createInvoice(payload, opts = { includeCommonFee: true, includeGarbageFee: false }) {
  const qs = new URLSearchParams({
    includeCommonFee: String(opts.includeCommonFee),
    includeGarbageFee: String(opts.includeGarbageFee),
  });

  const res = await fetch(`${API_BASE}/api/invoices?${qs}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
    mode: 'cors',
  });

  if (!res.ok) {
    let msg = 'Create invoice failed';
    try { const e = await res.json(); msg = e.error || e.message || msg; } catch {}
    throw new Error(msg);
  }
  return res.json();
}

export function openInvoice(id, view = 'print') {
  window.open(`${API_BASE}/invoices/${id}/${view}`, '_blank', 'noopener,noreferrer');
}

// ---------- Query ----------
export async function listInvoices({ year, month } = {}) {
  const url = (year && month)
    ? `${API_BASE}/api/invoices/month/${year}/${month}`
    : `${API_BASE}/api/invoices`;
  const res = await fetch(url);
  if (!res.ok) throw new Error('Load invoices failed');
  return res.json();
}

export async function listInvoicesByRoom(roomId) {
  const res = await fetch(`${API_BASE}/api/invoices/by-room/${roomId}`);
  if (!res.ok) throw new Error('Load room invoices failed');
  return res.json();
}

// ---------- Status ops ----------
export async function markPaid(id, paidDate) {
  const url = new URL(`${API_BASE}/api/invoices/${id}/mark-paid`);
  url.searchParams.set('paidDate', paidDate);
  const res = await fetch(url, { method: 'POST' });
  if (!res.ok) throw new Error('Mark paid failed');
  return res.json();
}

export async function markUnpaid(id) {
  const res = await fetch(`${API_BASE}/api/invoices/${id}/unpaid`, { method: 'PATCH' });
  if (!res.ok) throw new Error('Mark unpaid failed');
  return res.json();
}

// ---------- Helpers ----------
export function computeDisplayStatus(inv) {
  if (inv.status === 'PAID') return 'Paid';
  const today = new Date().toISOString().slice(0,10);
  return (inv.dueDate && inv.dueDate < today) ? 'Overdue' : 'Not yet paid';
}