'use client';

import React from 'react';

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
    <div className="row g-3 mb-4">
      {/* Total Active Tasks */}
      <div className="col-6 col-md-4 col-lg-2">
        <div className="card-stitch p-3 h-100">
          <div className="d-flex align-items-center justify-content-between">
            <small className="text-info fw-semibold text-uppercase" style={{ fontSize: '11px', letterSpacing: '0.5px' }}>Total Tasks</small>
            <div className="rounded-3 bg-info bg-opacity-15 text-info d-flex align-items-center justify-content-center" style={{ width: '36px', height: '36px' }}>
              <span className="material-symbols-outlined fs-5">monitoring</span>
            </div>
          </div>
          <div className="mt-3">
            <span className="fs-3 fw-bold text-white font-display">{stats.total}</span>
            <small className="text-secondary ms-2" style={{ fontSize: '11px' }}>Active Queue</small>
          </div>
        </div>
      </div>

      {/* Urgent Escalations */}
      <div className="col-6 col-md-4 col-lg-2">
        <div className="card-stitch p-3 h-100" style={{ borderColor: stats.escalated > 0 ? 'rgba(244, 63, 94, 0.5)' : undefined }}>
          <div className="d-flex align-items-center justify-content-between">
            <small className="text-danger fw-semibold text-uppercase" style={{ fontSize: '11px', letterSpacing: '0.5px' }}>SLA Escalated</small>
            <div className="rounded-3 bg-danger bg-opacity-15 text-danger d-flex align-items-center justify-content-center" style={{ width: '36px', height: '36px' }}>
              <span className="material-symbols-outlined fs-5">warning</span>
            </div>
          </div>
          <div className="mt-3">
            <span className="fs-3 fw-bold text-danger font-display">{stats.escalated}</span>
            <small className="text-secondary ms-2" style={{ fontSize: '11px' }}>Breached SLA</small>
          </div>
        </div>
      </div>

      {/* High Priority Tasks */}
      <div className="col-6 col-md-4 col-lg-2">
        <div className="card-stitch p-3 h-100">
          <div className="d-flex align-items-center justify-content-between">
            <small className="text-warning fw-semibold text-uppercase" style={{ fontSize: '11px', letterSpacing: '0.5px' }}>High Priority</small>
            <div className="rounded-3 bg-warning bg-opacity-15 text-warning d-flex align-items-center justify-content-center" style={{ width: '36px', height: '36px' }}>
              <span className="material-symbols-outlined fs-5">schedule</span>
            </div>
          </div>
          <div className="mt-3">
            <span className="fs-3 fw-bold text-warning font-display">{highPriorityCount}</span>
            <small className="text-secondary ms-2" style={{ fontSize: '11px' }}>Urgent Action</small>
          </div>
        </div>
      </div>

      {/* AI Routing Suggestions */}
      <div className="col-6 col-md-4 col-lg-2">
        <div className="card-stitch p-3 h-100">
          <div className="d-flex align-items-center justify-content-between">
            <small className="text-primary fw-semibold text-uppercase" style={{ fontSize: '11px', letterSpacing: '0.5px' }}>AI Routing</small>
            <div className="rounded-3 bg-primary bg-opacity-20 text-info d-flex align-items-center justify-content-center" style={{ width: '36px', height: '36px' }}>
              <span className="material-symbols-outlined fs-5">auto_awesome</span>
            </div>
          </div>
          <div className="mt-3">
            <span className="fs-3 fw-bold text-info font-display">{pendingRecsCount}</span>
            <small className="text-secondary ms-2" style={{ fontSize: '11px' }}>Suggestions</small>
          </div>
        </div>
      </div>

      {/* Low Inventory */}
      <div className="col-6 col-md-4 col-lg-2">
        <div className="card-stitch p-3 h-100">
          <div className="d-flex align-items-center justify-content-between">
            <small className="text-warning fw-semibold text-uppercase" style={{ fontSize: '11px', letterSpacing: '0.5px' }}>Low Stock</small>
            <div className="rounded-3 bg-warning bg-opacity-15 text-warning d-flex align-items-center justify-content-center" style={{ width: '36px', height: '36px' }}>
              <span className="material-symbols-outlined fs-5">inventory_2</span>
            </div>
          </div>
          <div className="mt-3">
            <span className="fs-3 fw-bold text-warning font-display">{lowInventoryCount}</span>
            <small className="text-secondary ms-2" style={{ fontSize: '11px' }}>Items Low</small>
          </div>
        </div>
      </div>

      {/* Occupancy Rate */}
      <div className="col-6 col-md-4 col-lg-2">
        <div className="card-stitch p-3 h-100">
          <div className="d-flex align-items-center justify-content-between">
            <small className="text-success fw-semibold text-uppercase" style={{ fontSize: '11px', letterSpacing: '0.5px' }}>Occupancy</small>
            <div className="rounded-3 bg-success bg-opacity-15 text-success d-flex align-items-center justify-content-center" style={{ width: '36px', height: '36px' }}>
              <span className="material-symbols-outlined fs-5">hotel</span>
            </div>
          </div>
          <div className="mt-3">
            <span className="fs-3 fw-bold text-success font-display">{occupancyPercentage}%</span>
            <small className="text-secondary ms-2" style={{ fontSize: '11px' }}>{occupiedRoomsCount}/{totalRoomsCount} Rooms</small>
          </div>
        </div>
      </div>
    </div>
  );
};
