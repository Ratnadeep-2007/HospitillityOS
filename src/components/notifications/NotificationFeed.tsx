'use client';

import React from 'react';
import { NotificationItem } from '../../types/dashboard';

interface NotificationFeedProps {
  notifications: NotificationItem[];
}

export const NotificationFeed: React.FC<NotificationFeedProps> = ({ notifications }) => {
  return (
    <div className="ops-card p-3.5 d-flex flex-column gap-3">
      <div className="d-flex align-items-center justify-content-between border-bottom pb-2" style={{ borderColor: 'var(--line)' }}>
        <div className="d-flex align-items-center gap-2">
          <span className="material-symbols-outlined text-secondary fs-5">outbox</span>
          <h6 className="fw-bold font-display m-0">Real-Time Dispatch Outbox ({notifications.length})</h6>
        </div>
        <span className="badge-status-info">Live Dispatch Gateway</span>
      </div>

      {notifications.length === 0 ? (
        <div className="ops-empty-state">
          <span className="material-symbols-outlined">mark_email_read</span>
          <span className="ops-empty-state-text">No outgoing dispatch notifications logged</span>
        </div>
      ) : (
        <div className="d-flex flex-column gap-2 overflow-y-auto pr-1" style={{ maxHeight: '280px' }}>
          {notifications.map((n) => {
            const channelBadgeClass =
              n.channel === 'WHATSAPP'
                ? 'badge-status-ok'
                : n.channel === 'SMS'
                ? 'badge-status-info'
                : n.channel === 'EMAIL'
                ? 'badge-status-attention'
                : 'badge-status-info';

            return (
              <div key={n.id} className="p-3 border rounded-2 bg-white d-flex flex-column gap-1" style={{ borderColor: 'var(--line)' }}>
                <div className="d-flex align-items-center justify-content-between">
                  <span className={`${channelBadgeClass} text-uppercase`} style={{ fontSize: '10px' }}>
                    {n.channel || 'IN_APP'} • {n.status || 'SENT'}
                  </span>
                  <span className="text-muted tabular-nums" style={{ fontSize: '10px' }}>
                    {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <p className="text-dark mb-0 mt-1" style={{ fontSize: '12px' }}>{n.message}</p>
                <div className="d-flex align-items-center justify-content-between text-muted mt-1" style={{ fontSize: '10px' }}>
                  <span>Recipient: {n.recipient}</span>
                  {n.user && <span>Sender: {n.user.name} ({n.user.role})</span>}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
