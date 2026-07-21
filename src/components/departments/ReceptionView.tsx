'use client';

import React from 'react';
import { MessageSquare, Plus, Clock, User, CheckCircle } from 'lucide-react';
import { GuestItem, GuestEventItem, TaskItem } from '../../types/dashboard';

interface ReceptionViewProps {
  guests: GuestItem[];
  guestEvents: GuestEventItem[];
  receptionTasks: TaskItem[];
  handleUpdateStatus: (taskId: string, newStatus: string) => Promise<void>;
  openTaskModal: () => void;
}

export const ReceptionView: React.FC<ReceptionViewProps> = ({
  guests,
  guestEvents,
  receptionTasks,
  handleUpdateStatus,
  openTaskModal,
}) => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-white tracking-wide">Reception & Front Desk Operations</h2>
          <p className="text-xs text-slate-400">Guest arrivals, live messaging requests, and reception task queue</p>
        </div>
        <button
          onClick={openTaskModal}
          className="bg-amber-500 hover:bg-amber-400 text-slate-950 px-3.5 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors shadow-lg shadow-amber-500/20"
        >
          <Plus className="w-3.5 h-3.5" />
          New Front Desk Task
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Active Guests Card */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-lg space-y-3">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <h3 className="text-sm font-semibold text-white flex items-center gap-2">
              <User className="w-4 h-4 text-amber-400" />
              Checked-In Guests
            </h3>
            <span className="text-xs text-slate-400 font-mono">{guests.length} Registered</span>
          </div>

          <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
            {guests.map((g) => {
              const activeBooking = g.bookings?.[0];
              return (
                <div key={g.id} className="bg-slate-950/70 border border-slate-800/80 rounded-lg p-3 flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-white">{g.name}</span>
                      {g.loyaltyStatus && (
                        <span className="text-[10px] bg-amber-500/10 text-amber-400 border border-amber-500/20 font-semibold px-1.5 py-0.5 rounded-full">
                          {g.loyaltyStatus}
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Phone: {g.phone || 'N/A'} • Email: {g.email || 'N/A'}
                    </p>
                    {g.preferences && (
                      <p className="text-[10px] text-amber-300/80 mt-1 italic">
                        Prefers: {g.preferences}
                      </p>
                    )}
                  </div>
                  {activeBooking?.room && (
                    <div className="text-right">
                      <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-lg">
                        Room {activeBooking.room.roomNumber}
                      </span>
                      <p className="text-[10px] text-slate-500 mt-1">{activeBooking.room.roomType}</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Live Guest Request Feed */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-lg space-y-3">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <h3 className="text-sm font-semibold text-white flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-emerald-400" />
              Incoming Messaging Gateway Feed
            </h3>
            <span className="text-xs text-slate-400 font-mono">{guestEvents.length} Events Logged</span>
          </div>

          <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
            {guestEvents.map((evt) => (
              <div key={evt.id} className="bg-slate-950/70 border border-slate-800/80 rounded-lg p-3 space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-emerald-400 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    {evt.source} Request
                  </span>
                  <span className="text-[10px] text-slate-500">
                    {new Date(evt.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <p className="text-xs text-white font-medium">&quot;{evt.metadata?.messageText || 'Request'}&quot;</p>
                <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1">
                  <span>Guest: {evt.metadata?.guestName || 'Walk-in'}</span>
                  <span>Room: {evt.metadata?.roomNumber || 'Unknown'}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Reception Tasks Queue */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-lg space-y-3">
        <h3 className="text-sm font-semibold text-white flex items-center gap-2 border-b border-slate-800 pb-2">
          <Clock className="w-4 h-4 text-amber-400" />
          Reception Department Task Queue ({receptionTasks.length})
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {receptionTasks.map((task) => (
            <div key={task.id} className="bg-slate-950/80 border border-slate-800 rounded-lg p-3 flex flex-col justify-between space-y-2">
              <div>
                <div className="flex items-center justify-between text-[10px] mb-1">
                  <span className="font-semibold text-amber-400 uppercase">{task.priority}</span>
                  <span className="text-slate-400">{task.status}</span>
                </div>
                <h4 className="text-xs font-semibold text-white">{task.title}</h4>
                <p className="text-[11px] text-slate-400 mt-1">{task.description}</p>
              </div>
              {task.status !== 'COMPLETED' && (
                <button
                  onClick={() => handleUpdateStatus(task.id, 'COMPLETED')}
                  className="w-full bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 rounded-md py-1 text-xs font-semibold transition-colors flex items-center justify-center gap-1"
                >
                  <CheckCircle className="w-3 h-3" /> Mark Resolved
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
