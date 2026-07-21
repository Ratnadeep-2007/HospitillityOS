'use client';

import React from 'react';
import { Bed, CheckCircle, Clock, Layers } from 'lucide-react';
import { RoomItem, TaskItem, InventoryItem } from '../../types/dashboard';

interface HousekeepingViewProps {
  rooms: RoomItem[];
  housekeepingTasks: TaskItem[];
  inventoryItems: InventoryItem[];
  handleUpdateStatus: (taskId: string, newStatus: string) => Promise<void>;
  handleRoomStatusChange: (roomId: string, newStatus: string) => Promise<void>;
}

export const HousekeepingView: React.FC<HousekeepingViewProps> = ({
  rooms,
  housekeepingTasks,
  inventoryItems,
  handleUpdateStatus,
  handleRoomStatusChange,
}) => {
  const housekeepingInventory = inventoryItems.filter(
    (i) => i.department?.name?.toLowerCase() === 'housekeeping' || !i.department
  );

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-bold text-white tracking-wide">Housekeeping & Room Turnovers</h2>
        <p className="text-xs text-slate-400">Live room cleaning status grid, turnover task assignments, and linen inventory</p>
      </div>

      {/* Room Cleaning Grid */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-lg space-y-3">
        <div className="flex items-center justify-between border-b border-slate-800 pb-2">
          <h3 className="text-sm font-semibold text-white flex items-center gap-2">
            <Bed className="w-4 h-4 text-blue-400" />
            Room Inventory Status Grid ({rooms.length} Rooms)
          </h3>
          <div className="flex items-center gap-3 text-xs">
            <span className="flex items-center gap-1 text-emerald-400 font-medium">
              <span className="w-2 h-2 rounded-full bg-emerald-400" /> Clean ({rooms.filter(r => r.status === 'AVAILABLE').length})
            </span>
            <span className="flex items-center gap-1 text-amber-400 font-medium">
              <span className="w-2 h-2 rounded-full bg-amber-400" /> Dirty ({rooms.filter(r => r.status === 'DIRTY').length})
            </span>
            <span className="flex items-center gap-1 text-blue-400 font-medium">
              <span className="w-2 h-2 rounded-full bg-blue-400" /> Occupied ({rooms.filter(r => r.status === 'OCCUPIED').length})
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-10 gap-2">
          {rooms.map((room) => {
            const statusBg =
              room.status === 'DIRTY'
                ? 'bg-amber-500/10 border-amber-500/30 text-amber-400'
                : room.status === 'OCCUPIED'
                ? 'bg-blue-500/10 border-blue-500/30 text-blue-400'
                : room.status === 'MAINTENANCE'
                ? 'bg-rose-500/10 border-rose-500/30 text-rose-400'
                : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400';

            return (
              <div
                key={room.id}
                className={`border rounded-lg p-2 text-center flex flex-col justify-between transition-all hover:scale-[1.02] ${statusBg}`}
              >
                <span className="text-xs font-bold">{room.roomNumber}</span>
                <span className="text-[9px] uppercase font-semibold mt-1">{room.status}</span>
                {room.status === 'DIRTY' && (
                  <button
                    onClick={() => handleRoomStatusChange(room.id, 'AVAILABLE')}
                    className="mt-1.5 w-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-[9px] font-bold py-0.5 rounded transition-colors"
                  >
                    Cleaned
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Housekeeping Tasks */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-lg space-y-3">
          <h3 className="text-sm font-semibold text-white flex items-center gap-2 border-b border-slate-800 pb-2">
            <Clock className="w-4 h-4 text-amber-400" />
            Housekeeping Tasks ({housekeepingTasks.length})
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {housekeepingTasks.map((task) => (
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
                    <CheckCircle className="w-3 h-3" /> Mark Completed
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Housekeeping Linen & Toiletries Inventory */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-lg space-y-3">
          <h3 className="text-sm font-semibold text-white flex items-center gap-2 border-b border-slate-800 pb-2">
            <Layers className="w-4 h-4 text-orange-400" />
            Linen & Supplies Stock
          </h3>
          <div className="space-y-3">
            {housekeepingInventory.map((item) => {
              const isLow = item.quantity <= item.minimumLevel;
              return (
                <div key={item.id} className="bg-slate-950/70 border border-slate-800/80 rounded-lg p-3 space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-white">{item.name}</span>
                    <span className={`font-mono text-xs ${isLow ? 'text-rose-400 font-bold' : 'text-slate-300'}`}>
                      {item.quantity} {item.unit}
                    </span>
                  </div>
                  <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                    <div
                      className={`h-full rounded-full ${isLow ? 'bg-rose-500' : 'bg-emerald-500'}`}
                      style={{ width: `${Math.min(100, (item.quantity / (item.minimumLevel * 2)) * 100)}%` }}
                    />
                  </div>
                  <div className="flex items-center justify-between text-[10px] text-slate-500">
                    <span>Min Threshold: {item.minimumLevel} {item.unit}</span>
                    {isLow && <span className="text-rose-400 font-semibold">Low Stock Alert</span>}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
