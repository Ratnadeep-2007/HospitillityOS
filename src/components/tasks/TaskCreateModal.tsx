'use client';

import React from 'react';
import { DeptItem, RoomItem } from '../../types/dashboard';

interface TaskCreateModalProps {
  showTaskModal: boolean;
  setShowTaskModal: (show: boolean) => void;
  taskTitle: string;
  setTaskTitle: (val: string) => void;
  taskDescription: string;
  setTaskDescription: (val: string) => void;
  taskDeptId: string;
  setTaskDeptId: (val: string) => void;
  taskPriority: string;
  setTaskPriority: (val: string) => void;
  taskRoomId: string;
  setTaskRoomId: (val: string) => void;
  taskDueDate: string;
  setTaskDueDate: (val: string) => void;
  modalLog: string;
  availableDepts: DeptItem[];
  availableRooms: RoomItem[];
  handleCreateManualTask: (e: React.FormEvent) => Promise<void>;
}

export const TaskCreateModal: React.FC<TaskCreateModalProps> = ({
  showTaskModal,
  setShowTaskModal,
  taskTitle,
  setTaskTitle,
  taskDescription,
  setTaskDescription,
  taskDeptId,
  setTaskDeptId,
  taskPriority,
  setTaskPriority,
  taskRoomId,
  setTaskRoomId,
  taskDueDate,
  setTaskDueDate,
  modalLog,
  availableDepts,
  availableRooms,
  handleCreateManualTask,
}) => {
  if (!showTaskModal) return null;

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
            <span className="material-symbols-outlined fs-5" style={{ color: 'var(--brass)' }}>add_task</span>
            <h5 className="fw-bold font-display m-0" style={{ color: 'var(--ink)' }}>Create Operations Task</h5>
          </div>
          <button
            type="button"
            onClick={() => setShowTaskModal(false)}
            className="btn btn-sm btn-outline-ops p-1 border-0"
          >
            <span className="material-symbols-outlined fs-5">close</span>
          </button>
        </div>

        <form onSubmit={handleCreateManualTask} className="d-flex flex-column gap-3">
          <div>
            <label className="fw-medium text-muted mb-1" style={{ fontSize: '11px' }}>Task Title *</label>
            <input
              type="text"
              required
              value={taskTitle}
              onChange={(e) => setTaskTitle(e.target.value)}
              placeholder="e.g. Inspect AC Chiller Noise"
              className="form-control form-control-ops"
            />
          </div>

          <div>
            <label className="fw-medium text-muted mb-1" style={{ fontSize: '11px' }}>Description / Details</label>
            <textarea
              rows={3}
              value={taskDescription}
              onChange={(e) => setTaskDescription(e.target.value)}
              placeholder="Enter instructions, notes, or guest requirements..."
              className="form-control form-control-ops"
            />
          </div>

          <div className="row g-2">
            <div className="col-12 col-sm-6">
              <label className="fw-medium text-muted mb-1" style={{ fontSize: '11px' }}>Target Department *</label>
              <select
                required
                value={taskDeptId}
                onChange={(e) => setTaskDeptId(e.target.value)}
                className="form-select form-control-ops"
              >
                <option value="">Select Department</option>
                {availableDepts.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="col-12 col-sm-6">
              <label className="fw-medium text-muted mb-1" style={{ fontSize: '11px' }}>Priority Level *</label>
              <select
                value={taskPriority}
                onChange={(e) => setTaskPriority(e.target.value)}
                className="form-select form-control-ops"
              >
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
                <option value="URGENT">Urgent (SLA Alert)</option>
              </select>
            </div>
          </div>

          <div className="row g-2">
            <div className="col-12 col-sm-6">
              <label className="fw-medium text-muted mb-1" style={{ fontSize: '11px' }}>Room (Optional)</label>
              <select
                value={taskRoomId}
                onChange={(e) => setTaskRoomId(e.target.value)}
                className="form-select form-control-ops"
              >
                <option value="">No Room Assigned</option>
                {availableRooms.map((r) => (
                  <option key={r.id} value={r.id}>
                    Room {r.roomNumber} ({r.roomType})
                  </option>
                ))}
              </select>
            </div>

            <div className="col-12 col-sm-6">
              <label className="fw-medium text-muted mb-1" style={{ fontSize: '11px' }}>Due Date / Time</label>
              <input
                type="datetime-local"
                value={taskDueDate}
                onChange={(e) => setTaskDueDate(e.target.value)}
                className="form-control form-control-ops"
              />
            </div>
          </div>

          {modalLog && (
            <div className="p-2 border rounded bg-light text-success font-mono" style={{ fontSize: '11px', borderColor: 'var(--line)' }}>
              {modalLog}
            </div>
          )}

          <div className="d-flex align-items-center justify-content-end gap-2 pt-2 border-top mt-1" style={{ borderColor: 'var(--line)' }}>
            <button
              type="button"
              onClick={() => setShowTaskModal(false)}
              className="btn btn-outline-ops"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-brass"
            >
              Create Task
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
