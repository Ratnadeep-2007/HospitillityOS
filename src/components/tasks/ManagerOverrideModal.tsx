'use client';

import React from 'react';
import { Shield, X, Check } from 'lucide-react';
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
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-amber-500" />
            <div>
              <h2 className="text-base font-bold text-white">Manager Task Override & Reassignment</h2>
              <p className="text-xs text-slate-400">Reassign department, staff assignee, priority or cancel task</p>
            </div>
          </div>
          <button
            onClick={() => setOverrideTask(null)}
            className="text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-3">
          <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-3">
            <p className="text-xs text-slate-400">Target Task:</p>
            <p className="text-sm font-semibold text-white mt-0.5">{overrideTask.title}</p>
            <p className="text-xs text-slate-500 mt-1">Current Dept: {overrideTask.department?.name || 'Unassigned'}</p>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1">Reassign Department</label>
            <select
              value={overrideDeptId}
              onChange={(e) => setOverrideDeptId(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
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
              <label className="text-xs font-semibold text-slate-300 block mb-1">Reassign Staff Member</label>
              <select
                value={overrideAssigneeId || ''}
                onChange={(e) => setOverrideAssigneeId(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
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

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">Override Priority</label>
              <select
                value={overridePriority}
                onChange={(e) => setOverridePriority(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
              >
                <option value="">Keep Existing Priority</option>
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
                <option value="URGENT">Urgent (SLA Alert)</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">Override Due Date</label>
              <input
                type="datetime-local"
                value={overrideDueDate}
                onChange={(e) => setOverrideDueDate(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          {overrideLog && (
            <p className="text-xs text-amber-400 bg-amber-500/10 border border-amber-500/20 rounded-lg p-2">
              {overrideLog}
            </p>
          )}

          <div className="flex items-center justify-between pt-3 border-t border-slate-800">
            <button
              onClick={() => handleManagerOverride('cancel')}
              className="px-3 py-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 rounded-lg text-xs font-semibold transition-colors"
            >
              Cancel Task
            </button>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setOverrideTask(null)}
                className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-semibold transition-colors"
              >
                Close
              </button>
              <button
                onClick={() => handleManagerOverride('update')}
                className="px-4 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-lg text-xs transition-colors flex items-center gap-1 shadow-lg shadow-amber-500/20"
              >
                <Check className="w-3.5 h-3.5" />
                Apply Reassignment
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
