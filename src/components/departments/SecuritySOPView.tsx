'use client';

import React from 'react';
import { Shield, CheckCircle, Clock } from 'lucide-react';
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
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-bold text-white tracking-wide">Security & SOP Automated Checklists</h2>
        <p className="text-xs text-slate-400">Daily morning opening checklists, property safety patrols, and SOP execution logs</p>
      </div>

      {/* Automated Daily SOP Checklist */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-lg space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-2">
          <h3 className="text-sm font-semibold text-white flex items-center gap-2">
            <Shield className="w-4 h-4 text-emerald-400" />
            Automated Daily Morning SOP Checklist ({checklistData?.totalTasks || 0} Scheduled Tasks)
          </h3>
          <span className="text-xs text-slate-400 font-mono">Date: {checklistData?.date || 'Today'}</span>
        </div>

        {checklistData?.departments ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Object.entries(checklistData.departments).map(([deptName, deptInfo]) => (
              <div key={deptName} className="bg-slate-950/80 border border-slate-800 rounded-xl p-4 space-y-2.5">
                <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider">{deptName} SOP Tasks</h4>
                <div className="space-y-2">
                  {deptInfo.tasks.map((task) => (
                    <div
                      key={task.id}
                      className="bg-slate-900/90 border border-slate-800/80 rounded-lg p-2.5 flex items-center justify-between"
                    >
                      <div>
                        <p className="text-xs font-semibold text-white">{task.title}</p>
                        <p className="text-[10px] text-slate-400 mt-0.5">Priority: {task.priority}</p>
                      </div>
                      <span
                        className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${
                          task.status === 'COMPLETED'
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                            : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                        }`}
                      >
                        {task.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-xs text-slate-500 italic py-4">Loading daily SOP checklist template...</div>
        )}
      </div>

      {/* Security Patrol Queue */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-lg space-y-3">
        <h3 className="text-sm font-semibold text-white flex items-center gap-2 border-b border-slate-800 pb-2">
          <Clock className="w-4 h-4 text-amber-400" />
          Security Patrol Queue ({securityTasks.length})
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {securityTasks.map((task) => (
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
                  <CheckCircle className="w-3 h-3" /> Log Completed
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
