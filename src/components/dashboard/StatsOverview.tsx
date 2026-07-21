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
      {/* Primary KPI 1: SLA Escalated (Task 3: Visual hierarchy pass) */}
      <div className="col-12 col-sm-6 col-lg-3">
        <div className={`ops-card p-3 h-100 status-rail-critical ${stats.escalated > 0 ? 'ops-card-kpi-primary' : ''}`}>
          <div className="d-flex align-items-center justify-content-between">
            <span className="text-uppercase fw-bold" style={{ fontSize: '11px', letterSpacing: '0.5px', color: 'var(--status-critical)' }}>
              Critical SLA Escalations
            </span>
            <span className="material-symbols-outlined fs-4" style={{ color: 'var(--status-critical)' }}>error</span>
          </div>
          <div className="mt-2 d-flex align-items-baseline justify-content-between">
            <div>
              <span className="fs-2 fw-bold font-display tabular-nums" style={{ color: 'var(--status-critical)', lineHeight: 1 }}>
                {stats.escalated}
              </span>
              <span className="text-muted ms-2 fw-medium" style={{ fontSize: '12px' }}>Action Required</span>
            </div>
            <span className="badge-status-critical">SLA Overdue</span>
          </div>
        </div>
      </div>

      {/* Primary KPI 2: Live Occupancy (Task 3: Visual hierarchy pass) */}
      <div className="col-12 col-sm-6 col-lg-3">
        <div className="ops-card ops-card-kpi-primary p-3 h-100 status-rail-ok">
          <div className="d-flex align-items-center justify-content-between">
            <span className="text-uppercase fw-bold" style={{ fontSize: '11px', letterSpacing: '0.5px', color: 'var(--brass)' }}>
              Property Occupancy
            </span>
            <span className="material-symbols-outlined fs-4" style={{ color: 'var(--brass)' }}>hotel</span>
          </div>
          <div className="mt-2 d-flex align-items-baseline justify-content-between">
            <div>
              <span className="fs-2 fw-bold font-display tabular-nums" style={{ color: 'var(--ink)', lineHeight: 1 }}>
                {occupancyPercentage}%
              </span>
              <span className="text-muted ms-2 tabular-nums" style={{ fontSize: '12px' }}>
                ({occupiedRoomsCount}/{totalRoomsCount} Rooms)
              </span>
            </div>
            <span className="badge-status-ok">Live PMS</span>
          </div>
        </div>
      </div>

      {/* Secondary Reference Stats Row */}
      <div className="col-6 col-sm-3 col-lg-1.5 style-col col-lg-2">
        <div className="ops-card p-3 h-100 status-rail-attention">
          <div className="d-flex align-items-center justify-content-between">
            <span className="text-uppercase text-muted fw-semibold" style={{ fontSize: '10px', letterSpacing: '0.5px' }}>High Priority</span>
            <span className="material-symbols-outlined text-secondary fs-5">priority_high</span>
          </div>
          <div className="mt-2">
            <span className="fs-4 fw-bold font-display tabular-nums" style={{ color: 'var(--status-attention)' }}>{highPriorityCount}</span>
            <span className="text-muted ms-1" style={{ fontSize: '11px' }}>Pending</span>
          </div>
        </div>
      </div>

      <div className="col-6 col-sm-3 col-lg-2">
        <div className="ops-card p-3 h-100 status-rail-info">
          <div className="d-flex align-items-center justify-content-between">
            <span className="text-uppercase text-muted fw-semibold" style={{ fontSize: '10px', letterSpacing: '0.5px' }}>AI Routing</span>
            <span className="material-symbols-outlined text-secondary fs-5">auto_awesome</span>
          </div>
          <div className="mt-2">
            <span className="fs-4 fw-bold font-display tabular-nums" style={{ color: 'var(--status-info)' }}>{pendingRecsCount}</span>
            <span className="text-muted ms-1" style={{ fontSize: '11px' }}>Suggestions</span>
          </div>
        </div>
      </div>

      <div className="col-6 col-sm-3 col-lg-2">
        <div className="ops-card p-3 h-100">
          <div className="d-flex align-items-center justify-content-between">
            <span className="text-uppercase text-muted fw-semibold" style={{ fontSize: '10px', letterSpacing: '0.5px' }}>Low Stock</span>
            <span className="material-symbols-outlined text-secondary fs-5">inventory_2</span>
          </div>
          <div className="mt-2">
            <span className="fs-4 fw-bold font-display tabular-nums" style={{ color: 'var(--ink)' }}>{lowInventoryCount}</span>
            <span className="text-muted ms-1" style={{ fontSize: '11px' }}>Alerts</span>
          </div>
        </div>
      </div>

      <div className="col-6 col-sm-3 col-lg-2">
        <div className="ops-card p-3 h-100">
          <div className="d-flex align-items-center justify-content-between">
            <span className="text-uppercase text-muted fw-semibold" style={{ fontSize: '10px', letterSpacing: '0.5px' }}>Total Active</span>
            <span className="material-symbols-outlined text-secondary fs-5">assignment</span>
          </div>
          <div className="mt-2">
            <span className="fs-4 fw-bold font-display tabular-nums" style={{ color: 'var(--ink)' }}>{stats.total}</span>
            <span className="text-muted ms-1" style={{ fontSize: '11px' }}>Tasks</span>
          </div>
        </div>
      </div>
    </div>
  );
};
