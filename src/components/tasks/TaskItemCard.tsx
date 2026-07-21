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

  const priorityBadgeClass =
    task.priority === 'URGENT'
      ? 'badge-stitch-rose'
      : task.priority === 'HIGH'
      ? 'badge-stitch-violet'
      : 'badge-stitch-indigo';

  const statusBadgeClass =
    task.status === 'COMPLETED'
      ? 'badge-stitch-emerald'
      : task.status === 'IN_PROGRESS'
      ? 'badge-stitch-indigo'
      : task.status === 'ESCALATED'
      ? 'badge-stitch-rose'
      : 'bg-secondary bg-opacity-25 text-light border border-secondary border-opacity-25 rounded-pill px-2 py-1';

  return (
    <div className="card-stitch p-3 d-flex flex-column justify-content-between h-100">
      <div>
        <div className="d-flex align-items-center justify-content-between gap-2 mb-2">
          <span className={`badge ${priorityBadgeClass}`} style={{ fontSize: '10px' }}>
            {task.priority}
          </span>
          <span className={`badge ${statusBadgeClass}`} style={{ fontSize: '10px' }}>
            {task.status.replace(/_/g, ' ')}
          </span>
        </div>

        <h6 className="fw-semibold text-white font-display mb-1 text-truncate-2" style={{ fontSize: '13px', lineHeight: '1.4' }}>
          {task.title}
        </h6>
        {task.description && (
          <p className="text-secondary mb-2 text-truncate-2" style={{ fontSize: '11px', lineHeight: '1.4' }}>
            {task.description}
          </p>
        )}
      </div>

      <div className="pt-2 border-top border-secondary border-opacity-25 mt-2">
        <div className="d-flex align-items-center justify-content-between text-secondary mb-2" style={{ fontSize: '11px' }}>
          <span className="d-flex align-items-center gap-1">
            <span className="material-symbols-outlined fs-6 text-info">domain</span>
            {task.department?.name || 'Operations'}
          </span>
          {task.room && (
            <span className="badge badge-stitch-indigo">
              Room {task.room.roomNumber}
            </span>
          )}
        </div>

        {task.assignedUser && (
          <div className="d-flex align-items-center gap-1 text-secondary mb-2" style={{ fontSize: '11px' }}>
            <span className="material-symbols-outlined fs-6 text-warning">person</span>
            <span>Assigned: <strong className="text-light">{task.assignedUser.name}</strong></span>
          </div>
        )}

        {/* Actions */}
        <div className="d-flex align-items-center justify-content-between gap-2 pt-1">
          {task.status !== 'COMPLETED' && (
            <div className="w-100">
              {task.status === 'PENDING' && (
                <button
                  onClick={() => handleUpdateStatus(task.id, 'IN_PROGRESS')}
                  className="btn btn-sm btn-stitch-outline w-100 py-1"
                  style={{ fontSize: '11px' }}
                >
                  Start Task
                </button>
              )}
              {task.status === 'IN_PROGRESS' && (
                <button
                  onClick={() => handleUpdateStatus(task.id, 'COMPLETED')}
                  className="btn btn-sm btn-stitch-primary w-100 py-1 d-flex align-items-center justify-content-center gap-1"
                  style={{ fontSize: '11px' }}
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
              className="btn btn-sm btn-stitch-outline text-warning py-1 whitespace-nowrap"
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
