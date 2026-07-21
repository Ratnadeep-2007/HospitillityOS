'use client';

import React from 'react';
import { Utensils, Calendar, CheckCircle, Plus } from 'lucide-react';
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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-white tracking-wide">Restaurant & Dining Operations</h2>
          <p className="text-xs text-slate-400">Table reservations, dining service coordination, and room service orders</p>
        </div>
        <button
          onClick={openTaskModal}
          className="bg-amber-500 hover:bg-amber-400 text-slate-950 px-3.5 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors shadow-lg shadow-amber-500/20"
        >
          <Plus className="w-3.5 h-3.5" />
          New Dining Request Task
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Restaurant Tasks */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-lg space-y-3">
          <h3 className="text-sm font-semibold text-white flex items-center gap-2 border-b border-slate-800 pb-2">
            <Utensils className="w-4 h-4 text-amber-400" />
            Restaurant Department Queue ({restaurantTasks.length} Active Requests)
          </h3>

          {restaurantTasks.length === 0 ? (
            <div className="text-center py-8 text-slate-500 text-xs">
              No active dining or table reservation tasks in queue.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {restaurantTasks.map((task) => (
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
                      <CheckCircle className="w-3 h-3" /> Mark Fulfilled
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Dining Preferences & VIP Guest List */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-lg space-y-3">
          <h3 className="text-sm font-semibold text-white flex items-center gap-2 border-b border-slate-800 pb-2">
            <Calendar className="w-4 h-4 text-emerald-400" />
            VIP Dining Preferences
          </h3>
          <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
            {guests.map((g) => (
              <div key={g.id} className="bg-slate-950/70 border border-slate-800/80 rounded-lg p-3 space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-white">{g.name}</span>
                  {g.loyaltyStatus && (
                    <span className="text-[10px] bg-amber-500/10 text-amber-400 border border-amber-500/20 px-1.5 py-0.5 rounded-full font-semibold">
                      {g.loyaltyStatus}
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-slate-400">
                  {g.preferences ? `Dining Note: ${g.preferences}` : 'No special dietary preferences logged.'}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
