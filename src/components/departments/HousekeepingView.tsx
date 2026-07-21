'use client';

import React from 'react';
import { RoomItem, TaskItem, InventoryItem } from '../../types/dashboard';
import { exportToCSV } from '../../lib/csvExport';

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

  const handleExportRooms = () => {
    const data = rooms.map((r) => ({
      RoomNumber: r.roomNumber,
      RoomType: r.roomType,
      Status: r.status,
    }));
    exportToCSV('housekeeping_room_status', data);
  };

  const cleanCount = rooms.filter((r) => r.status === 'AVAILABLE').length;
  const dirtyCount = rooms.filter((r) => r.status === 'DIRTY').length;
  const occupiedCount = rooms.filter((r) => r.status === 'OCCUPIED').length;

  return (
    <div className="d-flex flex-column gap-4">
      {/* Header Bar */}
      <div className="d-flex flex-column flex-sm-row align-items-start align-items-sm-center justify-content-between gap-2">
        <div>
          <h4 className="fw-bold font-display m-0" style={{ color: 'var(--ink)' }}>Housekeeping & Room Turnovers</h4>
          <p className="text-muted small mb-0">Live room cleaning status grid, turnover task assignments, and linen inventory</p>
        </div>
        <button onClick={handleExportRooms} className="btn btn-outline-ops d-flex align-items-center gap-1">
          <span className="material-symbols-outlined fs-6">download</span>
          Export Room Status CSV
        </button>
      </div>

      {/* Room Inventory Status Grid */}
      <div className="ops-card p-3.5 d-flex flex-column gap-3">
        <div className="d-flex flex-column flex-sm-row align-items-start align-items-sm-center justify-content-between gap-2 border-bottom pb-2" style={{ borderColor: 'var(--line)' }}>
          <div className="d-flex align-items-center gap-2">
            <span className="material-symbols-outlined text-secondary fs-5">cleaning_services</span>
            <h6 className="fw-bold font-display m-0">Room Inventory Status Grid ({rooms.length} Rooms)</h6>
          </div>
          <div className="d-flex align-items-center gap-2" style={{ fontSize: '11px' }}>
            <span className="badge-status-ok tabular-nums">Clean ({cleanCount})</span>
            <span className="badge-status-attention tabular-nums">Dirty ({dirtyCount})</span>
            <span className="badge-status-info tabular-nums">Occupied ({occupiedCount})</span>
          </div>
        </div>

        {rooms.length === 0 ? (
          <div className="ops-empty-state">
            <span className="material-symbols-outlined">hotel</span>
            <span className="ops-empty-state-text">No room inventory found in system</span>
          </div>
        ) : (
          <div className="row g-2">
            {rooms.map((room) => {
              const railClass =
                room.status === 'DIRTY'
                  ? 'status-rail-attention'
                  : room.status === 'OCCUPIED'
                  ? 'status-rail-info'
                  : room.status === 'MAINTENANCE'
                  ? 'status-rail-critical'
                  : 'status-rail-ok';

              const badgeClass =
                room.status === 'DIRTY'
                  ? 'badge-status-attention'
                  : room.status === 'OCCUPIED'
                  ? 'badge-status-info'
                  : room.status === 'MAINTENANCE'
                  ? 'badge-status-critical'
                  : 'badge-status-ok';

              return (
                <div key={room.id} className="col-6 col-sm-4 col-md-3 col-lg-2">
                  <div className={`ops-card p-2.5 text-center d-flex flex-column justify-content-between h-100 ${railClass}`}>
                    <div>
                      <span className="fw-bold font-display text-dark fs-6 d-block tabular-nums">{room.roomNumber}</span>
                      <span className={`${badgeClass} text-uppercase mt-1 d-inline-block`} style={{ fontSize: '10px' }}>
                        {room.status}
                      </span>
                    </div>
                    {room.status === 'DIRTY' && (
                      <button
                        onClick={() => handleRoomStatusChange(room.id, 'AVAILABLE')}
                        className="btn btn-brass btn-sm w-100 mt-2 py-0"
                        style={{ fontSize: '10px' }}
                      >
                        Mark Cleaned
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="row g-4">
        {/* Housekeeping Tasks */}
        <div className="col-12 col-lg-8">
          <div className="ops-card p-3.5 h-100 d-flex flex-column gap-3">
            <div className="d-flex align-items-center justify-content-between border-bottom pb-2" style={{ borderColor: 'var(--line)' }}>
              <div className="d-flex align-items-center gap-2">
                <span className="material-symbols-outlined text-secondary fs-5">schedule</span>
                <h6 className="fw-bold font-display m-0">Housekeeping Department Tasks ({housekeepingTasks.length})</h6>
              </div>
            </div>

            {housekeepingTasks.length === 0 ? (
              <div className="ops-empty-state my-auto">
                <span className="material-symbols-outlined">task_alt</span>
                <span className="ops-empty-state-text">No housekeeping turnover tasks right now</span>
              </div>
            ) : (
              <div className="row g-3">
                {housekeepingTasks.map((task) => (
                  <div key={task.id} className="col-12 col-md-6">
                    <div className="ops-card p-3 h-100 d-flex flex-column justify-between gap-2 status-rail-attention">
                      <div>
                        <div className="d-flex align-items-center justify-content-between mb-1">
                          <span className="badge-status-attention">{task.priority}</span>
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
                          Mark Completed
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Housekeeping Linen & Supplies Stock */}
        <div className="col-12 col-lg-4">
          <div className="ops-card p-3.5 h-100 d-flex flex-column gap-3">
            <div className="d-flex align-items-center justify-content-between border-bottom pb-2" style={{ borderColor: 'var(--line)' }}>
              <div className="d-flex align-items-center gap-2">
                <span className="material-symbols-outlined text-secondary fs-5">inventory_2</span>
                <h6 className="fw-bold font-display m-0">Linen & Supplies Stock</h6>
              </div>
            </div>

            {housekeepingInventory.length === 0 ? (
              <div className="ops-empty-state my-auto">
                <span className="material-symbols-outlined">inventory</span>
                <span className="ops-empty-state-text">No linen or amenity inventory records</span>
              </div>
            ) : (
              <div className="d-flex flex-column gap-2 overflow-y-auto pr-1" style={{ maxHeight: '320px' }}>
                {housekeepingInventory.map((item) => {
                  const isLow = item.quantity <= item.minimumLevel;
                  return (
                    <div key={item.id} className="p-3 border rounded-2 bg-white d-flex flex-column gap-1.5" style={{ borderColor: 'var(--line)' }}>
                      <div className="d-flex align-items-center justify-content-between">
                        <span className="fw-bold font-display text-dark" style={{ fontSize: '13px' }}>{item.name}</span>
                        <span className={`font-mono fw-bold ${isLow ? 'text-danger' : 'text-dark'}`} style={{ fontSize: '12px' }}>
                          {item.quantity} {item.unit}
                        </span>
                      </div>
                      <div className="progress" style={{ height: '6px', backgroundColor: '#EFECE6' }}>
                        <div
                          className={`progress-bar ${isLow ? 'bg-danger' : 'bg-success'}`}
                          role="progressbar"
                          style={{ width: `${Math.min(100, (item.quantity / (item.minimumLevel * 2)) * 100)}%` }}
                        />
                      </div>
                      <div className="d-flex align-items-center justify-content-between text-muted" style={{ fontSize: '10px' }}>
                        <span>Min Threshold: {item.minimumLevel} {item.unit}</span>
                        {isLow && <span className="badge-status-critical">Low Stock Alert</span>}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
