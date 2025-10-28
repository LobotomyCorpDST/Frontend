import { http, API_BASE } from './http';

/**
 * Get current invoice settings (payment description, QR code, interest rate)
 */
export async function getInvoiceSettings() {
  return http.get('/api/invoice-settings');
}

/**
 * Update invoice settings
 * @param {Object} settings - { paymentDescription, interestRatePerMonth }
 */
export async function updateInvoiceSettings(settings) {
  return http.put('/api/invoice-settings', settings);
}

/**
 * Upload QR code image
 * @param {File} file - QR code image file (jpg/png)
 */
export async function uploadQrCode(file) {
  const formData = new FormData();
  formData.append('file', file);

  const token =
    localStorage.getItem('token') ||
    localStorage.getItem('access_token') ||
    localStorage.getItem('jwt');

  const url = `${API_BASE}/api/invoice-settings/qr-upload`;

  const response = await fetch(url, {
    method: 'POST',
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    body: formData,
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(error || 'Failed to upload QR code');
  }

  return response.json();
}
