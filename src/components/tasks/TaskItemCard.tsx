'use client';

import React from 'react';
import { CheckCircle, User, Layers } from 'lucide-react';
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

  const priorityColor =
    task.priority === 'URGENT'
      ? 'bg-rose-500/10 text-rose-400 border-rose-500/20'
      : task.priority === 'HIGH'
      ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
      : 'bg-blue-500/10 text-blue-400 border-blue-500/20';

  const statusColor =
    task.status === 'COMPLETED'
      ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
      : task.status === 'IN_PROGRESS'
      ? 'bg-blue-500/10 text-blue-400 border-blue-500/20'
      : task.status === 'ESCALATED'
      ? 'bg-rose-500/20 text-rose-400 border-rose-500/30'
      : task.status === 'PENDING_APPROVAL'
      ? 'bg-purple-500/10 text-purple-400 border-purple-500/20'
      : 'bg-slate-800 text-slate-400 border-slate-700';

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 hover:border-slate-700 transition-all flex flex-col justify-between space-y-3">
      <div>
        <div className="flex items-start justify-between gap-2 mb-2">
          <span className={`text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full border ${priorityColor}`}>
            {task.priority}
          </span>
          <span className={`text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full border ${statusColor}`}>
            {task.status.replace(/_/g, ' ')}
          </span>
        </div>

        <h3 className="text-sm font-semibold text-white leading-snug line-clamp-2">{task.title}</h3>
        {task.description && (
          <p className="text-xs text-slate-400 mt-1 line-clamp-2 leading-relaxed">{task.description}</p>
        )}
      </div>

      <div className="pt-2 border-t border-slate-800/80 space-y-2">
        <div className="flex items-center justify-between text-xs text-slate-400">
          <span className="flex items-center gap-1">
            <Layers className="w-3.5 h-3.5 text-slate-500" />
            {task.department?.name || 'Operations'}
          </span>
          {task.room && (
            <span className="flex items-center gap-1 text-slate-300 font-medium">
              Room {task.room.roomNumber}
            </span>
          )}
        </div>

        {task.assignedUser && (
          <div className="flex items-center gap-1.5 text-xs text-slate-400">
            <User className="w-3.5 h-3.5 text-amber-500" />
            <span>Assigned: <strong className="text-slate-200">{task.assignedUser.name}</strong></span>
          </div>
        )}

        {/* Action Controls */}
        <div className="flex items-center justify-between gap-2 pt-1">
          {task.status !== 'COMPLETED' && (
            <div className="flex items-center gap-1.5 w-full">
              {task.status === 'PENDING' && (
                <button
                  onClick={() => handleUpdateStatus(task.id, 'IN_PROGRESS')}
                  className="w-full bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 border border-blue-500/20 rounded-lg py-1 text-xs font-semibold transition-colors"
                >
                  Start Task
                </button>
              )}
              {task.status === 'IN_PROGRESS' && (
                <button
                  onClick={() => handleUpdateStatus(task.id, 'COMPLETED')}
                  className="w-full bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 rounded-lg py-1 text-xs font-semibold transition-colors flex items-center justify-center gap-1"
                >
                  <CheckCircle className="w-3.5 h-3.5" />
                  Complete
                </button>
              )}
            </div>
          )}

          {isManager && openOverrideModal && (
            <button
              onClick={() => openOverrideModal(task)}
              className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-amber-400 border border-slate-700 rounded-lg text-xs font-medium transition-colors whitespace-nowrap"
            >
              Reassign / Override
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
