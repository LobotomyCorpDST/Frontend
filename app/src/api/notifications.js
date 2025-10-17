import http from './http';

export async function fetchMaintenanceNotifications(date) {
  try {
    const todayISO =
      date ||
      new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Bangkok' });

    const list = await http.get('/api/notifications/maintenance', {
      params: { date: todayISO },
    });

    console.log('✅ fetched notifications:', list);

    return Array.isArray(list) ? list : [];
  } catch (error) {
    console.error('❌ Error fetching maintenance notifications:', error?.message || error);
    return [];
  }
}
