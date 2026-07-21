'use client';

import React from 'react';
import { GuestItem, GuestEventItem, TaskItem } from '../../types/dashboard';
import { exportToCSV } from '../../lib/csvExport';

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
  const handleExportGuests = () => {
    const data = guests.map((g) => ({
      ID: g.id,
      Name: g.name,
      Phone: g.phone || '',
      Email: g.email || '',
      LoyaltyStatus: g.loyaltyStatus || 'Standard',
      Preferences: g.preferences || '',
      Room: g.bookings?.[0]?.room?.roomNumber || 'Unassigned',
    }));
    exportToCSV('reception_registered_guests', data);
  };

  return (
    <div className="d-flex flex-column gap-4">
      {/* Header Bar */}
      <div className="d-flex flex-column flex-sm-row align-items-start align-items-sm-center justify-content-between gap-2">
        <div>
          <h4 className="fw-bold font-display m-0" style={{ color: 'var(--ink)' }}>Reception & Front Desk Operations</h4>
          <p className="text-muted small mb-0">Guest arrivals, live messaging requests, and front desk coordination queue</p>
        </div>
        <div className="d-flex align-items-center gap-2">
          <button onClick={handleExportGuests} className="btn btn-outline-ops d-flex align-items-center gap-1">
            <span className="material-symbols-outlined fs-6">download</span>
            Export CSV
          </button>
          <button onClick={openTaskModal} className="btn btn-brass d-flex align-items-center gap-1">
            <span className="material-symbols-outlined fs-6">add</span>
            New Front Desk Task
          </button>
        </div>
      </div>

      <div className="row g-4">
        {/* Active Guests Card */}
        <div className="col-12 col-lg-6">
          <div className="ops-card p-3.5 h-100 d-flex flex-column gap-3">
            <div className="d-flex align-items-center justify-content-between border-bottom pb-2" style={{ borderColor: 'var(--line)' }}>
              <div className="d-flex align-items-center gap-2">
                <span className="material-symbols-outlined text-secondary fs-5">person</span>
                <h6 className="fw-bold font-display m-0">Checked-In Guests ({guests.length})</h6>
              </div>
              <span className="badge-status-info">Active Stay Memory</span>
            </div>

            {guests.length === 0 ? (
              <div className="ops-empty-state my-auto">
                <span className="material-symbols-outlined">person_off</span>
                <span className="ops-empty-state-text">No active guests checked in right now</span>
              </div>
            ) : (
              <div className="d-flex flex-column gap-2 overflow-y-auto pr-1" style={{ maxHeight: '320px' }}>
                {guests.map((g) => {
                  const activeBooking = g.bookings?.[0];
                  return (
                    <div key={g.id} className="p-3 border rounded-2 bg-light d-flex align-items-center justify-content-between" style={{ borderColor: 'var(--line)' }}>
                      <div>
                        <div className="d-flex align-items-center gap-2">
                          <span className="fw-bold font-display text-dark">{g.name}</span>
                          {g.loyaltyStatus && (
                            <span className="badge-status-attention">{g.loyaltyStatus}</span>
                          )}
                        </div>
                        <p className="text-muted mb-0 mt-1" style={{ fontSize: '11px' }}>
                          Phone: {g.phone || 'N/A'} • Email: {g.email || 'N/A'}
                        </p>
                        {g.preferences && (
                          <p className="mb-0 mt-1 text-secondary fst-italic" style={{ fontSize: '11px' }}>
                            Prefers: {g.preferences}
                          </p>
                        )}
                      </div>
                      {activeBooking?.room && (
                        <div className="text-end">
                          <span className="badge-status-ok font-mono">Room {activeBooking.room.roomNumber}</span>
                          <p className="text-muted mb-0 mt-1" style={{ fontSize: '11px' }}>{activeBooking.room.roomType}</p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Live Guest Request Feed */}
        <div className="col-12 col-lg-6">
          <div className="ops-card p-3.5 h-100 d-flex flex-column gap-3">
            <div className="d-flex align-items-center justify-content-between border-bottom pb-2" style={{ borderColor: 'var(--line)' }}>
              <div className="d-flex align-items-center gap-2">
                <span className="material-symbols-outlined text-secondary fs-5">chat</span>
                <h6 className="fw-bold font-display m-0">Incoming Guest Messaging Feed</h6>
              </div>
              <span className="badge-status-ok tabular-nums">{guestEvents.length} Events Ingested</span>
            </div>

            {guestEvents.length === 0 ? (
              <div className="ops-empty-state my-auto">
                <span className="material-symbols-outlined">forum</span>
                <span className="ops-empty-state-text">No guest messages recorded in feed</span>
              </div>
            ) : (
              <div className="d-flex flex-column gap-2 overflow-y-auto pr-1" style={{ maxHeight: '320px' }}>
                {guestEvents.map((evt) => (
                  <div key={evt.id} className="p-3 border rounded-2 bg-white d-flex flex-column gap-1" style={{ borderColor: 'var(--line)' }}>
                    <div className="d-flex align-items-center justify-content-between">
                      <span className="badge-status-ok font-semibold">
                        {evt.source} Request
                      </span>
                      <span className="text-muted tabular-nums" style={{ fontSize: '10px' }}>
                        {new Date(evt.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <p className="fw-medium text-dark mb-0 mt-1" style={{ fontSize: '13px' }}>
                      &quot;{evt.metadata?.messageText || 'Guest request received'}&quot;
                    </p>
                    <div className="d-flex align-items-center justify-content-between text-muted mt-1" style={{ fontSize: '11px' }}>
                      <span>Guest: {evt.metadata?.guestName || 'Walk-in'}</span>
                      <span className="tabular-nums">Room: {evt.metadata?.roomNumber || 'N/A'}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Reception Tasks Queue */}
      <div className="ops-card p-3.5 d-flex flex-column gap-3">
        <div className="d-flex align-items-center justify-content-between border-bottom pb-2" style={{ borderColor: 'var(--line)' }}>
          <div className="d-flex align-items-center gap-2">
            <span className="material-symbols-outlined text-secondary fs-5">schedule</span>
            <h6 className="fw-bold font-display m-0">Reception Department Task Queue ({receptionTasks.length})</h6>
          </div>
        </div>

        {receptionTasks.length === 0 ? (
          <div className="ops-empty-state">
            <span className="material-symbols-outlined">task_alt</span>
            <span className="ops-empty-state-text">No front desk tasks in queue right now</span>
          </div>
        ) : (
          <div className="row g-3">
            {receptionTasks.map((task) => (
              <div key={task.id} className="col-12 col-md-6 col-lg-4">
                <div className={`ops-card p-3 h-100 d-flex flex-column justify-between gap-2 ${
                  task.priority === 'URGENT' || task.priority === 'HIGH' ? 'status-rail-attention' : 'status-rail-info'
                }`}>
                  <div>
                    <div className="d-flex align-items-center justify-content-between mb-1">
                      <span className={task.priority === 'HIGH' || task.priority === 'URGENT' ? 'badge-status-attention' : 'badge-status-info'}>
                        {task.priority}
                      </span>
                      <span className="text-muted text-uppercase" style={{ fontSize: '10px' }}>{task.status}</span>
                    </div>
                    <h6 className="fw-bold font-display text-dark mb-1">{task.title}</h6>
                    <p className="text-muted mb-0" style={{ fontSize: '12px' }}>{task.description}</p>
                  </div>
                  {task.status !== 'COMPLETED' && (
                    <button
                      onClick={() => handleUpdateStatus(task.id, 'COMPLETED')}
                      className="btn btn-outline-ops btn-sm w-100 mt-2 d-flex align-items-center justify-content-center gap-1"
                    >
                      <span className="material-symbols-outlined fs-6 text-success">check_circle</span>
                      Mark Resolved
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
