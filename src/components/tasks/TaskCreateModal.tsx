'use client';

import React from 'react';
import { X, Plus } from 'lucide-react';
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
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Plus className="w-5 h-5 text-amber-400" />
            <h2 className="text-base font-bold text-white">Create Operations Task</h2>
          </div>
          <button
            onClick={() => setShowTaskModal(false)}
            className="text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleCreateManualTask} className="space-y-3">
          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1">Task Title *</label>
            <input
              type="text"
              required
              value={taskTitle}
              onChange={(e) => setTaskTitle(e.target.value)}
              placeholder="e.g. Inspect AC Chiller Noise"
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1">Description / Details</label>
            <textarea
              rows={3}
              value={taskDescription}
              onChange={(e) => setTaskDescription(e.target.value)}
              placeholder="Enter instructions, notes, or guest requirements..."
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">Target Department *</label>
              <select
                required
                value={taskDeptId}
                onChange={(e) => setTaskDeptId(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
              >
                <option value="">Select Department</option>
                {availableDepts.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">Priority Level *</label>
              <select
                value={taskPriority}
                onChange={(e) => setTaskPriority(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
              >
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
                <option value="URGENT">Urgent (SLA Alert)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">Room (Optional)</label>
              <select
                value={taskRoomId}
                onChange={(e) => setTaskRoomId(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
              >
                <option value="">No Room Assigned</option>
                {availableRooms.map((r) => (
                  <option key={r.id} value={r.id}>
                    Room {r.roomNumber} ({r.roomType})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">Due Date / Time</label>
              <input
                type="datetime-local"
                value={taskDueDate}
                onChange={(e) => setTaskDueDate(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          {modalLog && (
            <p className="text-xs text-amber-400 bg-amber-500/10 border border-amber-500/20 rounded-lg p-2">
              {modalLog}
            </p>
          )}

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
            <button
              type="button"
              onClick={() => setShowTaskModal(false)}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-semibold transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-bold rounded-lg text-xs transition-colors shadow-lg shadow-amber-500/20"
            >
              Create Task
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
