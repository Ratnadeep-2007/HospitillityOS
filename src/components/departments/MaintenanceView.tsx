'use client';

import React from 'react';
import { Zap, CheckCircle, Clock } from 'lucide-react';
import { AssetItem, TaskItem } from '../../types/dashboard';

interface MaintenanceViewProps {
  assets: AssetItem[];
  maintenanceTasks: TaskItem[];
  handleUpdateStatus: (taskId: string, newStatus: string) => Promise<void>;
  handleDispatchPredictiveMaintenance: (assetId: string) => void;
}

export const MaintenanceView: React.FC<MaintenanceViewProps> = ({
  assets,
  maintenanceTasks,
  handleUpdateStatus,
  handleDispatchPredictiveMaintenance,
}) => {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-bold text-white tracking-wide">Maintenance & Facility Assets</h2>
        <p className="text-xs text-slate-400">Equipment health telemetry, predictive maintenance AI diagnostics, and work orders</p>
      </div>

      {/* Asset Telemetry Cards */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-lg space-y-3">
        <h3 className="text-sm font-semibold text-white flex items-center gap-2 border-b border-slate-800 pb-2">
          <Zap className="w-4 h-4 text-purple-400" />
          Building Systems & Critical Assets ({assets.length})
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {assets.map((asset) => {
            const isDown = asset.status === 'MAINTENANCE_REQUIRED' || asset.status === 'DOWN';
            return (
              <div
                key={asset.id}
                className="bg-slate-950/80 border border-slate-800/80 rounded-xl p-4 flex flex-col justify-between space-y-3"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <span className="text-xs font-bold text-white">{asset.name}</span>
                    <span
                      className={`text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full border ${
                        isDown
                          ? 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                          : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                      }`}
                    >
                      {asset.status.replace(/_/g, ' ')}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400">Category: {asset.category}</p>
                </div>

                <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between">
                  <span className="text-[10px] text-slate-500">
                    Telemetry Normal
                  </span>
                  <button
                    onClick={() => handleDispatchPredictiveMaintenance(asset.id)}
                    className="px-2.5 py-1 bg-purple-500/10 hover:bg-purple-500/20 text-purple-300 border border-purple-500/20 rounded-lg text-xs font-medium transition-colors"
                  >
                    Simulate Telemetry Anomaly
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Maintenance Work Orders */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-lg space-y-3">
        <h3 className="text-sm font-semibold text-white flex items-center gap-2 border-b border-slate-800 pb-2">
          <Clock className="w-4 h-4 text-amber-400" />
          Maintenance Work Orders Queue ({maintenanceTasks.length})
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {maintenanceTasks.map((task) => (
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
                  <CheckCircle className="w-3 h-3" /> Complete Work Order
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
