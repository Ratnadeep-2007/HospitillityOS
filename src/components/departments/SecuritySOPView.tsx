'use client';

import React from 'react';
import { ChecklistData, TaskItem } from '../../types/dashboard';

interface SecuritySOPViewProps {
  checklistData: ChecklistData | null;
  securityTasks: TaskItem[];
  handleUpdateStatus: (taskId: string, newStatus: string) => Promise<void>;
}

export const SecuritySOPView: React.FC<SecuritySOPViewProps> = ({
  checklistData,
  securityTasks,
  handleUpdateStatus,
}) => {
  return (
    <div className="d-flex flex-column gap-4">
      {/* Header Bar */}
      <div>
        <h4 className="fw-bold font-display m-0" style={{ color: 'var(--ink)' }}>Security & SOP Automated Checklists</h4>
        <p className="text-muted small mb-0">Daily morning opening checklists, property safety patrols, and SOP execution logs</p>
      </div>

      {/* Automated Daily SOP Checklist */}
      <div className="ops-card p-3.5 d-flex flex-column gap-3">
        <div className="d-flex align-items-center justify-content-between border-bottom pb-2" style={{ borderColor: 'var(--line)' }}>
          <div className="d-flex align-items-center gap-2">
            <span className="material-symbols-outlined text-secondary fs-5">verified_user</span>
            <h6 className="fw-bold font-display m-0">
              Automated Daily Morning SOP Checklist ({checklistData?.totalTasks || 0} Scheduled Tasks)
            </h6>
          </div>
          <span className="text-muted tabular-nums" style={{ fontSize: '11px' }}>Date: {checklistData?.date || 'Today'}</span>
        </div>

        {checklistData?.departments ? (
          <div className="row g-3">
            {Object.entries(checklistData.departments).map(([deptName, deptInfo]) => (
              <div key={deptName} className="col-12 col-md-6">
                <div className="ops-card p-3.5 bg-light h-100 d-flex flex-column gap-2">
                  <h6 className="fw-bold font-display text-uppercase tracking-wider mb-1" style={{ color: 'var(--brass)', fontSize: '11px' }}>
                    {deptName} SOP Tasks
                  </h6>
                  <div className="d-flex flex-column gap-2">
                    {deptInfo.tasks.map((task) => (
                      <div
                        key={task.id}
                        className="p-2.5 border rounded-2 bg-white d-flex align-items-center justify-content-between"
                        style={{ borderColor: 'var(--line)' }}
                      >
                        <div>
                          <p className="fw-semibold text-dark mb-0" style={{ fontSize: '12px' }}>{task.title}</p>
                          <p className="text-muted mb-0" style={{ fontSize: '10px' }}>Priority: {task.priority}</p>
                        </div>
                        <span className={task.status === 'COMPLETED' ? 'badge-status-ok' : 'badge-status-attention'}>
                          {task.status}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="ops-empty-state">
            <span className="material-symbols-outlined">checklist</span>
            <span className="ops-empty-state-text">Loading daily SOP checklist template...</span>
          </div>
        )}
      </div>

      {/* Security Patrol Queue */}
      <div className="ops-card p-3.5 d-flex flex-column gap-3">
        <div className="d-flex align-items-center justify-content-between border-bottom pb-2" style={{ borderColor: 'var(--line)' }}>
          <div className="d-flex align-items-center gap-2">
            <span className="material-symbols-outlined text-secondary fs-5">shield</span>
            <h6 className="fw-bold font-display m-0">Security Patrol Queue ({securityTasks.length})</h6>
          </div>
        </div>

        {securityTasks.length === 0 ? (
          <div className="ops-empty-state">
            <span className="material-symbols-outlined">security</span>
            <span className="ops-empty-state-text">No security patrol tickets pending</span>
          </div>
        ) : (
          <div className="row g-3">
            {securityTasks.map((task) => (
              <div key={task.id} className="col-12 col-md-6 col-lg-4">
                <div className="ops-card p-3 h-100 d-flex flex-column justify-between gap-2 status-rail-info">
                  <div>
                    <div className="d-flex align-items-center justify-content-between mb-1">
                      <span className="badge-status-info">{task.priority}</span>
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
                      Log Completed
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
