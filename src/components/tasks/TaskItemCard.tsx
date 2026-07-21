'use client';

import React from 'react';
import { TaskItem, DeptItem } from '../../types/dashboard';

interface TaskItemCardProps {
  task: TaskItem;
  currentUserRole: string;
  availableDepts?: DeptItem[];
  handleUpdateStatus: (taskId: string, newStatus: string) => Promise<void>;
  openOverrideModal?: (task: TaskItem) => void;
}

export const TaskItemCard: React.FC<TaskItemCardProps> = ({
  task,
  currentUserRole,
  handleUpdateStatus,
  openOverrideModal,
}) => {
  const isManager = currentUserRole === 'MANAGER' || currentUserRole === 'OWNER' || currentUserRole === 'SUPERVISOR';

  // Status Rail & Badge mapping according to docs/design.md
  let railClass = 'status-rail-info';
  let statusBadgeClass = 'badge-status-info';

  if (task.status === 'COMPLETED') {
    railClass = 'status-rail-ok';
    statusBadgeClass = 'badge-status-ok';
  } else if (task.status === 'ESCALATED' || task.priority === 'URGENT') {
    railClass = 'status-rail-critical';
    statusBadgeClass = 'badge-status-critical';
  } else if (task.priority === 'HIGH' || task.status === 'PENDING_APPROVAL') {
    railClass = 'status-rail-attention';
    statusBadgeClass = 'badge-status-attention';
  }

  const formattedDueDate = task.dueDate
    ? new Date(task.dueDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    : 'No SLA';

  return (
    <div className={`ops-card p-3 d-flex flex-column justify-content-between h-100 ${railClass}`}>
      <div>
        <div className="d-flex align-items-center justify-content-between gap-2 mb-2">
          <span className="text-uppercase fw-bold text-muted" style={{ fontSize: '10px', letterSpacing: '0.5px' }}>
            {task.priority} Priority
          </span>
          <span className={`badge ${statusBadgeClass}`}>
            {task.status.replace(/_/g, ' ')}
          </span>
        </div>

        <h6 className="fw-semibold font-display mb-1 text-truncate-2" style={{ color: 'var(--ink)', fontSize: '14px', lineHeight: '1.4' }}>
          {task.title}
        </h6>
        {task.description && (
          <p className="text-secondary mb-2 text-truncate-2" style={{ fontSize: '12px', lineHeight: '1.4' }}>
            {task.description}
          </p>
        )}
      </div>

      <div className="pt-2 border-top mt-2" style={{ borderColor: 'var(--line)' }}>
        <div className="d-flex align-items-center justify-content-between text-secondary mb-2" style={{ fontSize: '11.5px' }}>
          <span className="d-flex align-items-center gap-1">
            <span className="material-symbols-outlined text-muted" style={{ fontSize: '15px' }}>layers</span>
            {task.department?.name || 'Operations'}
          </span>
          {task.room && (
            <span className="fw-semibold tabular-nums text-dark bg-light px-2 py-0.5 rounded border" style={{ borderColor: 'var(--line)' }}>
              Room {task.room.roomNumber}
            </span>
          )}
        </div>

        <div className="d-flex align-items-center justify-content-between text-secondary mb-2" style={{ fontSize: '11.5px' }}>
          {task.assignedUser ? (
            <span className="d-flex align-items-center gap-1 text-truncate">
              <span className="material-symbols-outlined text-muted" style={{ fontSize: '15px' }}>person</span>
              <span className="text-dark fw-medium">{task.assignedUser.name}</span>
            </span>
          ) : (
            <span className="text-muted fst-italic">Unassigned</span>
          )}
          <span className="d-flex align-items-center gap-1 tabular-nums text-muted" style={{ fontSize: '11px' }}>
            <span className="material-symbols-outlined" style={{ fontSize: '13px' }}>schedule</span>
            {formattedDueDate}
          </span>
        </div>

        {/* Action Controls */}
        <div className="d-flex align-items-center justify-content-between gap-2 pt-1">
          {task.status !== 'COMPLETED' && (
            <div className="w-100">
              {task.status === 'PENDING' && (
                <button
                  onClick={() => handleUpdateStatus(task.id, 'IN_PROGRESS')}
                  className="btn btn-outline-ops w-100 py-1"
                  style={{ fontSize: '12px' }}
                >
                  Start Task
                </button>
              )}
              {task.status === 'IN_PROGRESS' && (
                <button
                  onClick={() => handleUpdateStatus(task.id, 'COMPLETED')}
                  className="btn btn-brass w-100 py-1 d-flex align-items-center justify-content-center gap-1"
                  style={{ fontSize: '12px' }}
                >
                  <span className="material-symbols-outlined fs-6">check_circle</span>
                  Complete
                </button>
              )}
            </div>
          )}

          {isManager && openOverrideModal && (
            <button
              onClick={() => openOverrideModal(task)}
              className="btn btn-outline-ops py-1 whitespace-nowrap text-muted"
              style={{ fontSize: '11px' }}
            >
              Override
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
