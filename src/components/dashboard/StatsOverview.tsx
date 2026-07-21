'use client';

import React from 'react';
import { Clock, AlertTriangle, Zap, Activity, Bed } from 'lucide-react';

interface StatsProps {
  stats: {
    total: number;
    pending: number;
    inProgress: number;
    completed: number;
    escalated: number;
  };
  highPriorityCount: number;
  pendingRecsCount: number;
  lowInventoryCount: number;
  occupiedRoomsCount: number;
  totalRoomsCount: number;
}

export const StatsOverview: React.FC<StatsProps> = ({
  stats,
  highPriorityCount,
  pendingRecsCount,
  lowInventoryCount,
  occupiedRoomsCount,
  totalRoomsCount,
}) => {
  const occupancyPercentage = totalRoomsCount > 0 ? Math.round((occupiedRoomsCount / totalRoomsCount) * 100) : 0;

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
      {/* Total Active Tasks */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-lg backdrop-blur-sm relative overflow-hidden group hover:border-slate-700 transition-all">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-400">Total Tasks</span>
          <div className="w-8 h-8 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center">
            <Activity className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-3">
          <span className="text-2xl font-bold text-white tracking-tight">{stats.total}</span>
          <span className="text-xs text-slate-500 ml-2">Active</span>
        </div>
      </div>

      {/* Urgent Escalations */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-lg backdrop-blur-sm relative overflow-hidden group hover:border-rose-900/50 transition-all">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-rose-400">Escalated</span>
          <div className="w-8 h-8 rounded-xl bg-rose-500/10 text-rose-400 flex items-center justify-center">
            <AlertTriangle className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-3">
          <span className="text-2xl font-bold text-rose-400 tracking-tight">{stats.escalated}</span>
          <span className="text-xs text-slate-500 ml-2">Urgent SLA</span>
        </div>
      </div>

      {/* High Priority Tasks */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-lg backdrop-blur-sm relative overflow-hidden group hover:border-amber-900/50 transition-all">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-amber-400">High Priority</span>
          <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center">
            <Clock className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-3">
          <span className="text-2xl font-bold text-amber-400 tracking-tight">{highPriorityCount}</span>
          <span className="text-xs text-slate-500 ml-2">Action needed</span>
        </div>
      </div>

      {/* Pending AI Recommendations */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-lg backdrop-blur-sm relative overflow-hidden group hover:border-purple-900/50 transition-all">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-purple-400">AI Routing</span>
          <div className="w-8 h-8 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center">
            <Zap className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-3">
          <span className="text-2xl font-bold text-purple-300 tracking-tight">{pendingRecsCount}</span>
          <span className="text-xs text-slate-500 ml-2">Suggestions</span>
        </div>
      </div>

      {/* Low Inventory Alerts */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-lg backdrop-blur-sm relative overflow-hidden group hover:border-orange-900/50 transition-all">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-orange-400">Low Stock</span>
          <div className="w-8 h-8 rounded-xl bg-orange-500/10 text-orange-400 flex items-center justify-center">
            <AlertTriangle className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-3">
          <span className="text-2xl font-bold text-orange-400 tracking-tight">{lowInventoryCount}</span>
          <span className="text-xs text-slate-500 ml-2">Items low</span>
        </div>
      </div>

      {/* Occupancy Rate */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-lg backdrop-blur-sm relative overflow-hidden group hover:border-emerald-900/50 transition-all">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-emerald-400">Occupancy</span>
          <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
            <Bed className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-3">
          <span className="text-2xl font-bold text-emerald-400 tracking-tight">{occupancyPercentage}%</span>
          <span className="text-xs text-slate-500 ml-2">{occupiedRoomsCount}/{totalRoomsCount} Rooms</span>
        </div>
      </div>
    </div>
  );
};
