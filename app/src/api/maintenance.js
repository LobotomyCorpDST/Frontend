const API_BASE = process.env.REACT_APP_API_BASE || 'http://localhost:8080';

async function handle(res, fallback = 'Request failed') {
  if (res.ok) return res.json();
  try {
    const j = await res.json();
    throw new Error(j.error || j.message || fallback);
  } catch {
    throw new Error(fallback);
  }
}

export async function listMaintenanceByRoom(roomId) {
  const res = await fetch(`${API_BASE}/api/maintenance/by-room/${roomId}`, { mode: 'cors' });
  return handle(res, 'Load maintenance failed');
}

export async function createMaintenance(payload) {
  const res = await fetch(`${API_BASE}/api/maintenance`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
    mode: 'cors',
  });
  return handle(res, 'Create maintenance failed');
}

export async function completeMaintenance(id, completedDate) {
  const u = new URL(`${API_BASE}/api/maintenance/${id}/complete`);
  u.searchParams.set('completedDate', completedDate); // YYYY-MM-DD
  const res = await fetch(u, { method: 'PATCH', mode: 'cors' });
  return handle(res, 'Complete maintenance failed');
}

// เผื่ออนาคต
export async function updateMaintenance(id, payload) {
  const res = await fetch(`${API_BASE}/api/maintenance/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
    mode: 'cors',
  });
  return handle(res, 'Update maintenance failed');
}
