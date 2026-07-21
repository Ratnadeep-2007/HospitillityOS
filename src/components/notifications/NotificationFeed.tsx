'use client';

import React from 'react';
import { Inbox } from 'lucide-react';
import { NotificationItem } from '../../types/dashboard';

interface NotificationFeedProps {
  notifications: NotificationItem[];
}

export const NotificationFeed: React.FC<NotificationFeedProps> = ({ notifications }) => {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-lg space-y-3">
      <div className="flex items-center justify-between border-b border-slate-800 pb-2">
        <h3 className="text-sm font-semibold text-white flex items-center gap-2">
          <Inbox className="w-4 h-4 text-blue-400" />
          Twilio / Resend Real-Time Dispatch Log ({notifications.length})
        </h3>
        <span className="text-xs text-slate-400 font-mono">Real-time Outbox</span>
      </div>

      <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
        {notifications.map((n) => {
          const channelColor =
            n.channel === 'WHATSAPP'
              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
              : n.channel === 'SMS'
              ? 'bg-blue-500/10 text-blue-400 border-blue-500/20'
              : n.channel === 'EMAIL'
              ? 'bg-purple-500/10 text-purple-400 border-purple-500/20'
              : 'bg-amber-500/10 text-amber-400 border-amber-500/20';

          return (
            <div key={n.id} className="bg-slate-950/70 border border-slate-800/80 rounded-lg p-3 space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className={`text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full border ${channelColor}`}>
                  {n.channel || 'IN_APP'} • {n.status || 'SENT'}
                </span>
                <span className="text-[10px] text-slate-500 font-mono">
                  {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
              <p className="text-xs text-white mt-1">{n.message}</p>
              <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1">
                <span>Recipient: {n.recipient}</span>
                {n.user && <span>Sender: {n.user.name} ({n.user.role})</span>}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
