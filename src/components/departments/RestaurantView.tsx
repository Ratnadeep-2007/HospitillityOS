'use client';

import React from 'react';
import { TaskItem, GuestItem } from '../../types/dashboard';

interface RestaurantViewProps {
  restaurantTasks: TaskItem[];
  guests: GuestItem[];
  handleUpdateStatus: (taskId: string, newStatus: string) => Promise<void>;
  openTaskModal: () => void;
}

export const RestaurantView: React.FC<RestaurantViewProps> = ({
  restaurantTasks,
  guests,
  handleUpdateStatus,
  openTaskModal,
}) => {
  return (
    <div className="d-flex flex-column gap-4">
      {/* Header Bar */}
      <div className="d-flex flex-column flex-sm-row align-items-start align-items-sm-center justify-content-between gap-2">
        <div>
          <h4 className="fw-bold font-display m-0" style={{ color: 'var(--ink)' }}>Restaurant & Dining Operations</h4>
          <p className="text-muted small mb-0">Table reservations, dining service coordination, and room service orders</p>
        </div>
        <button onClick={openTaskModal} className="btn btn-brass d-flex align-items-center gap-1">
          <span className="material-symbols-outlined fs-6">add</span>
          New Dining Request Task
        </button>
      </div>

      <div className="row g-4">
        {/* Restaurant Tasks */}
        <div className="col-12 col-lg-8">
          <div className="ops-card p-3.5 h-100 d-flex flex-column gap-3">
            <div className="d-flex align-items-center justify-content-between border-bottom pb-2" style={{ borderColor: 'var(--line)' }}>
              <div className="d-flex align-items-center gap-2">
                <span className="material-symbols-outlined text-secondary fs-5">restaurant</span>
                <h6 className="fw-bold font-display m-0">Restaurant Department Queue ({restaurantTasks.length})</h6>
              </div>
            </div>

            {restaurantTasks.length === 0 ? (
              <div className="ops-empty-state my-auto">
                <span className="material-symbols-outlined">flatware</span>
                <span className="ops-empty-state-text">No active dining or table reservation tasks in queue</span>
              </div>
            ) : (
              <div className="row g-3">
                {restaurantTasks.map((task) => (
                  <div key={task.id} className="col-12 col-md-6">
                    <div className="ops-card p-3 h-100 d-flex flex-column justify-between gap-2 status-rail-attention">
                      <div>
                        <div className="d-flex align-items-center justify-content-between mb-1">
                          <span className="badge-status-attention">{task.priority}</span>
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
                          Mark Fulfilled
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Dining Preferences & VIP Guest List */}
        <div className="col-12 col-lg-4">
          <div className="ops-card p-3.5 h-100 d-flex flex-column gap-3">
            <div className="d-flex align-items-center justify-content-between border-bottom pb-2" style={{ borderColor: 'var(--line)' }}>
              <div className="d-flex align-items-center gap-2">
                <span className="material-symbols-outlined text-secondary fs-5">menu_book</span>
                <h6 className="fw-bold font-display m-0">VIP Dining Preferences</h6>
              </div>
            </div>

            {guests.length === 0 ? (
              <div className="ops-empty-state my-auto">
                <span className="material-symbols-outlined">no_meals</span>
                <span className="ops-empty-state-text">No guest dining preferences logged</span>
              </div>
            ) : (
              <div className="d-flex flex-column gap-2 overflow-y-auto pr-1" style={{ maxHeight: '340px' }}>
                {guests.map((g) => (
                  <div key={g.id} className="p-3 border rounded-2 bg-white d-flex flex-column gap-1" style={{ borderColor: 'var(--line)' }}>
                    <div className="d-flex align-items-center justify-content-between">
                      <span className="fw-bold font-display text-dark" style={{ fontSize: '13px' }}>{g.name}</span>
                      {g.loyaltyStatus && (
                        <span className="badge-status-attention">{g.loyaltyStatus}</span>
                      )}
                    </div>
                    <p className="text-muted mb-0" style={{ fontSize: '11px' }}>
                      {g.preferences ? `Dining Note: ${g.preferences}` : 'No special dietary preferences logged.'}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
