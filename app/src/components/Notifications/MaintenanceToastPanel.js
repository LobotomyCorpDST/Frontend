import React, { useEffect, useState } from 'react';
import './MaintenanceToastPanel.css';
import { fetchMaintenanceNotifications } from '../../api/notifications';

export default function MaintenanceToastPanel(props) {
    const [alerts, setAlerts] = useState([]);
    const [dismissed, setDismissed] = useState(false); // กดปิดชั่วคราว

    useEffect(() => {
        (async () => {
            const todayISO = new Date().toLocaleDateString('en-CA', {
                timeZone: 'Asia/Bangkok',
            });
            const data = await fetchMaintenanceNotifications(todayISO);
            console.log('🔔 notifications fetched:', data);  // <— ดูใน Console
            setAlerts(Array.isArray(data) ? data : []);
            setDismissed(false);
        })();
    }, []);

    // ถ้าไม่อยากให้แสดงตอนว่าง ให้คง return null แต่เพื่อดีบัก เราจะโชว์ header ว่า "ไม่มีแจ้งเตือน"
    if (dismissed) return null;

    const hasAlerts = alerts.length > 0;

    return (
        <div
            className={`toast-panel ${hasAlerts ? 'toast-panel--visible' : ''}`}
            data-cy="maintenance-toast-panel"
            {...props}
        >
            <div className="toast-header" data-cy="maintenance-toast-header">
                <strong>Notifications</strong>
                <button
                    className="close-btn"
                    onClick={() => setDismissed(true)}
                    aria-label="Close"
                    data-cy="maintenance-toast-close-button"
                >
                    ×
                </button>
            </div>

            <div className="toast-body" data-cy="maintenance-toast-body">
                {hasAlerts ? (
                    alerts.map((item, i) => (
                        <div
                            key={item.id ?? `${item.roomNumber}-${i}`}
                            className="toast-card toast-item-in"
                            style={{ animationDelay: `${i * 70}ms` }}
                            data-cy={`maintenance-toast-card-${item.id}`}
                        >
                            <div className="toast-icon">🔧</div>
                            <div className="toast-content">
                                <div
                                    className="toast-title"
                                    data-cy={`maintenance-toast-card-title-${item.id}`}
                                >
                                    Maintenance Today
                                </div>
                                <div
                                    className="toast-detail"
                                    data-cy={`maintenance-toast-card-detail-${item.id}`}
                                >
                                    {item.description} • Room {item.roomNumber} • {item.scheduledDate}
                                </div>
                            </div>
                            <div className="toast-status today">TODAY</div>
                        </div>
                    ))
                ) : (
                    <div
                        className="toast-empty"
                        data-cy="maintenance-toast-empty-message"
                    >
                        No maintenance due today.
                    </div>
                )}
            </div>
        </div>
    );
}