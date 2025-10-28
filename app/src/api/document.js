import { http, API_BASE } from './http';

/**
 * Upload a document file
 * @param {File} file - File to upload
 * @param {string} entityType - LEASE, MAINTENANCE, or INVOICE
 * @param {number} entityId - ID of the entity
 */
export async function uploadDocument(file, entityType, entityId) {
  const formData = new FormData();
  formData.append('file', file);

  const token =
    localStorage.getItem('token') ||
    localStorage.getItem('access_token') ||
    localStorage.getItem('jwt');

  const url = `${API_BASE}/api/documents/upload?entityType=${entityType}&entityId=${entityId}`;

  const response = await fetch(url, {
    method: 'POST',
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    body: formData,
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(error || 'Failed to upload document');
  }

  return response.json();
}

/**
 * Get all documents for an entity
 * @param {string} entityType - LEASE, MAINTENANCE, or INVOICE
 * @param {number} entityId - ID of the entity
 */
export async function getDocuments(entityType, entityId) {
  return http.get(`/api/documents/${entityType}/${entityId}`);
}

/**
 * Download a document
 * @param {number} documentId - Document ID
 */
export async function downloadDocument(documentId) {
  const blob = await http.getBlob(`/api/documents/${documentId}/download`);
  return blob;
}

/**
 * Delete a document
 * @param {number} documentId - Document ID
 */
export async function deleteDocument(documentId) {
  return http.delete(`/api/documents/${documentId}`);
}
