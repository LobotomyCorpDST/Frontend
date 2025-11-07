import { http, API_BASE } from './http';

// Mirror credentials behavior from http.js for multipart uploads
const CREDENTIALS =
  process.env.REACT_APP_CREDENTIALS === 'include'
    ? 'include'
    : process.env.REACT_APP_CREDENTIALS === 'same-origin'
    ? 'same-origin'
    : 'omit';

/**
 * Upload a document file
 * @param {File} file - File to upload
 * @param {string} entityType - LEASE, MAINTENANCE, or INVOICE
 * @param {number} entityId - ID of the entity
 */
export async function uploadDocument(file, entityType, entityId) {
  console.debug('[doc.upload] start', {
    entityType,
    entityId,
    file: file ? { name: file.name, type: file.type, size: file.size } : null,
  });
  const formData = new FormData();
  formData.append('file', file);
  formData.append('entityType', String(entityType || '').toUpperCase());
  formData.append('entityId', String(entityId));
  try {
    const dbg = {};
    for (const [k, v] of formData.entries()) {
      if (k === 'file' && v && typeof v === 'object' && 'name' in v) {
        dbg[k] = { name: v.name, type: v.type, size: v.size };
      } else {
        dbg[k] = v;
      }
    }
    console.debug('[doc.upload] formData', dbg);
  } catch (e) {
    console.debug('[doc.upload] formData inspect failed', e);
  }

  const token =
    localStorage.getItem('token') ||
    localStorage.getItem('access_token') ||
    localStorage.getItem('jwt');

  const url = `${API_BASE}/api/documents/upload`;
  const headers = token ? { Authorization: `Bearer ${token}` } : {};
  console.debug('[doc.upload] request', {
    url,
    credentials: CREDENTIALS,
    headers: headers.Authorization ? { Authorization: `${headers.Authorization.slice(0, 18)}...` } : {},
  });

  const response = await fetch(url, {
    method: 'POST',
    headers,
    body: formData,
    // Ensure cookies are sent if the backend uses session/CSRF
    credentials: CREDENTIALS,
    mode: 'cors',
  });

  console.debug('[doc.upload] response', {
    ok: response.ok,
    status: response.status,
    type: response.type,
    redirected: response.redirected,
    url: response.url,
  });

  if (!response.ok) {
    let errorText = '';
    try { errorText = await response.text(); } catch {}
    console.error('[doc.upload] failed', { status: response.status, body: errorText });
    throw new Error(errorText || 'Failed to upload document');
  }

  return response.json();
}

/**
 * Get all documents for an entity
 * @param {string} entityType - LEASE, MAINTENANCE, or INVOICE
 * @param {number} entityId - ID of the entity
 */
export async function getDocuments(entityType, entityId) {
  const path = `/api/documents/${entityType}/${entityId}`;
  console.debug('[doc.list] GET', { path, entityType, entityId });
  try {
    const res = await http.get(path);
    console.debug('[doc.list] ok', { count: Array.isArray(res) ? res.length : undefined });
    return res;
  } catch (e) {
    console.error('[doc.list] failed', e);
    throw e;
  }
}

/**
 * Download a document
 * @param {number} documentId - Document ID
 */
export async function downloadDocument(documentId) {
  const path = `/api/documents/${documentId}/download`;
  console.debug('[doc.download] GET blob', { path, documentId });
  try {
    const blob = await http.getBlob(path);
    console.debug('[doc.download] ok', { size: blob?.size, type: blob?.type });
    return blob;
  } catch (e) {
    console.error('[doc.download] failed', e);
    throw e;
  }
}

/**
 * Delete a document
 * @param {number} documentId - Document ID
 */
export async function deleteDocument(documentId) {
  const path = `/api/documents/${documentId}`;
  console.debug('[doc.delete] DELETE', { path, documentId });
  try {
    const res = await http.delete(path);
    console.debug('[doc.delete] ok');
    return res;
  } catch (e) {
    console.error('[doc.delete] failed', e);
    throw e;
  }
}
