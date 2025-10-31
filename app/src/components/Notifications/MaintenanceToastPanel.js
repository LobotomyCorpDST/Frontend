import React, { useEffect, useState } from 'react';
import './MaintenanceToastPanel.css';
import { fetchMaintenanceNotifications } from '../../api/notifications';

export default function MaintenanceToastPanel({ userRole, userRoomId }) {
  const [alerts, setAlerts] = useState([]);
  const [dismissed, setDismissed] = useState(false); // กดปิดชั่วคราว

  useEffect(() => {
    (async () => {
      // GUEST: Should not see notifications (handled by Dashboard conditional rendering)
      if (userRole === 'GUEST') {
        setAlerts([]);
        setDismissed(false);
        return;
      }

      const todayISO = new Date().toLocaleDateString('en-CA', {
        timeZone: 'Asia/Bangkok',
      });
      const data = await fetchMaintenanceNotifications(todayISO);
      console.log('🔔 notifications fetched:', data);  // <— ดูใน Console

      let filteredData = Array.isArray(data) ? data : [];

      // USER: Filter to only their assigned room's notifications
      if (userRole === 'USER' && userRoomId) {
        filteredData = filteredData.filter(item =>
          item.roomId === parseInt(userRoomId)
        );
      }

      // STAFF/ADMIN: Show all notifications (no filtering)

      setAlerts(filteredData);
      setDismissed(false);
    })();
  }, [userRole, userRoomId]);

  // ถ้าไม่อยากให้แสดงตอนว่าง ให้คง return null แต่เพื่อดีบัก เราจะโชว์ header ว่า "ไม่มีแจ้งเตือน"
  if (dismissed) return null;

  const hasAlerts = alerts.length > 0;

  return (
    <div className={`toast-panel ${hasAlerts ? 'toast-panel--visible' : ''}`}>
      <div className="toast-header">
        <strong>Notifications</strong>
        <button className="close-btn" onClick={() => setDismissed(true)} aria-label="Close">×</button>
      </div>

      <div className="toast-body">
        {hasAlerts ? (
          alerts.map((item, i) => (
            <div
              key={item.id ?? `${item.roomNumber}-${i}`}
              className="toast-card toast-item-in"
              style={{ animationDelay: `${i * 70}ms` }}
            >
              <div className="toast-icon">🔧</div>
              <div className="toast-content">
                <div className="toast-title">Maintenance Today</div>
                <div className="toast-detail">
                  {item.description} • Room {item.roomNumber} • {item.scheduledDate}
                </div>
              </div>
              <div className="toast-status today">TODAY</div>
            </div>
          ))
        ) : (
          <div className="toast-empty">No maintenance due today.</div>
        )}
      </div>
    </div>
  );
}
