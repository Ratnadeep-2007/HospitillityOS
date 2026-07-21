'use client';

import React from 'react';
import { TaskItem, DeptItem, UserAccount } from '../../types/dashboard';

interface ManagerOverrideModalProps {
  overrideTask: TaskItem | null;
  setOverrideTask: (task: TaskItem | null) => void;
  overrideDeptId: string;
  setOverrideDeptId: (val: string) => void;
  overrideAssigneeId?: string;
  setOverrideAssigneeId?: (val: string) => void;
  overridePriority: string;
  setOverridePriority: (val: string) => void;
  overrideDueDate: string;
  setOverrideDueDate: (val: string) => void;
  overrideLog: string;
  availableDepts: DeptItem[];
  staffUsers?: UserAccount[];
  handleManagerOverride: (action: 'update' | 'cancel') => Promise<void>;
}

export const ManagerOverrideModal: React.FC<ManagerOverrideModalProps> = ({
  overrideTask,
  setOverrideTask,
  overrideDeptId,
  setOverrideDeptId,
  overrideAssigneeId,
  setOverrideAssigneeId,
  overridePriority,
  setOverridePriority,
  overrideDueDate,
  setOverrideDueDate,
  overrideLog,
  availableDepts,
  staffUsers = [],
  handleManagerOverride,
}) => {
  if (!overrideTask) return null;

  return (
    <div
      className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center p-3 z-3"
      style={{ backgroundColor: 'rgba(28, 35, 33, 0.6)', backdropFilter: 'blur(2px)' }}
    >
      <div
        className="ops-card p-4 shadow-lg w-100"
        style={{ maxWidth: '540px', backgroundColor: 'var(--surface)', borderColor: 'var(--line)' }}
      >
        <div className="d-flex align-items-center justify-content-between border-bottom pb-3 mb-3" style={{ borderColor: 'var(--line)' }}>
          <div className="d-flex align-items-center gap-2">
            <span className="material-symbols-outlined fs-5 text-warning">shield</span>
            <div>
              <h5 className="fw-bold font-display m-0" style={{ color: 'var(--ink)' }}>Manager Task Override</h5>
              <p className="text-muted small mb-0" style={{ fontSize: '11px' }}>Reassign department, staff assignee, priority or cancel task</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setOverrideTask(null)}
            className="btn btn-sm btn-outline-ops p-1 border-0"
          >
            <span className="material-symbols-outlined fs-5">close</span>
          </button>
        </div>

        <div className="d-flex flex-column gap-3">
          <div className="p-3 border rounded-2 bg-light" style={{ borderColor: 'var(--line)' }}>
            <span className="text-muted" style={{ fontSize: '11px' }}>Target Task:</span>
            <p className="fw-bold font-display text-dark mb-0 mt-0.5" style={{ fontSize: '13px' }}>{overrideTask.title}</p>
            <p className="text-muted mb-0 mt-1" style={{ fontSize: '11px' }}>Current Dept: {overrideTask.department?.name || 'Unassigned'}</p>
          </div>

          <div>
            <label className="fw-medium text-muted mb-1" style={{ fontSize: '11px' }}>Reassign Department</label>
            <select
              value={overrideDeptId}
              onChange={(e) => setOverrideDeptId(e.target.value)}
              className="form-select form-control-ops"
            >
              <option value="">Keep Existing Department</option>
              {availableDepts.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name}
                </option>
              ))}
            </select>
          </div>

          {setOverrideAssigneeId && staffUsers.length > 0 && (
            <div>
              <label className="fw-medium text-muted mb-1" style={{ fontSize: '11px' }}>Reassign Staff Member</label>
              <select
                value={overrideAssigneeId || ''}
                onChange={(e) => setOverrideAssigneeId(e.target.value)}
                className="form-select form-control-ops"
              >
                <option value="">Unassigned / Any Staff</option>
                {staffUsers.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.name} ({u.role} - {u.department})
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="row g-2">
            <div className="col-12 col-sm-6">
              <label className="fw-medium text-muted mb-1" style={{ fontSize: '11px' }}>Override Priority</label>
              <select
                value={overridePriority}
                onChange={(e) => setOverridePriority(e.target.value)}
                className="form-select form-control-ops"
              >
                <option value="">Keep Existing Priority</option>
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
                <option value="URGENT">Urgent (SLA Alert)</option>
              </select>
            </div>

            <div className="col-12 col-sm-6">
              <label className="fw-medium text-muted mb-1" style={{ fontSize: '11px' }}>Override Due Date</label>
              <input
                type="datetime-local"
                value={overrideDueDate}
                onChange={(e) => setOverrideDueDate(e.target.value)}
                className="form-control form-control-ops"
              />
            </div>
          </div>

          {overrideLog && (
            <div className="p-2 border rounded bg-light text-success font-mono" style={{ fontSize: '11px', borderColor: 'var(--line)' }}>
              {overrideLog}
            </div>
          )}

          <div className="d-flex align-items-center justify-content-between pt-3 border-top mt-1" style={{ borderColor: 'var(--line)' }}>
            <button
              type="button"
              onClick={() => handleManagerOverride('cancel')}
              className="btn btn-outline-danger btn-sm"
              style={{ fontSize: '12px' }}
            >
              Cancel Task
            </button>
            <div className="d-flex align-items-center gap-2">
              <button
                type="button"
                onClick={() => setOverrideTask(null)}
                className="btn btn-outline-ops"
              >
                Close
              </button>
              <button
                type="button"
                onClick={() => handleManagerOverride('update')}
                className="btn btn-brass d-flex align-items-center gap-1"
              >
                <span className="material-symbols-outlined fs-6">check</span>
                Apply Reassignment
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
