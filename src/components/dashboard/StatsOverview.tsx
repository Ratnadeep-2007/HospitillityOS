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
        <div className="ops-card p-3 h-100">
          <div className="d-flex align-items-center justify-content-between">
            <span className="text-uppercase text-muted fw-semibold" style={{ fontSize: '11px', letterSpacing: '0.5px' }}>Total Tasks</span>
            <span className="material-symbols-outlined text-secondary fs-5">assignment</span>
          </div>
          <div className="mt-2">
            <span className="fs-3 fw-bold font-display tabular-nums" style={{ color: 'var(--ink)' }}>{stats.total}</span>
            <span className="text-muted ms-2" style={{ fontSize: '11px' }}>Active</span>
          </div>
        </div>
      </div>

      {/* SLA Escalated */}
      <div className="col-6 col-md-4 col-lg-2">
        <div className="ops-card p-3 h-100 status-rail-critical">
          <div className="d-flex align-items-center justify-content-between">
            <span className="text-uppercase fw-semibold" style={{ fontSize: '11px', letterSpacing: '0.5px', color: 'var(--status-critical)' }}>SLA Escalated</span>
            <span className="material-symbols-outlined fs-5" style={{ color: 'var(--status-critical)' }}>error</span>
          </div>
          <div className="mt-2">
            <span className="fs-3 fw-bold font-display tabular-nums" style={{ color: 'var(--status-critical)' }}>{stats.escalated}</span>
            <span className="text-muted ms-2" style={{ fontSize: '11px' }}>Overdue</span>
          </div>
        </div>
      </div>

      {/* High Priority Tasks */}
      <div className="col-6 col-md-4 col-lg-2">
        <div className="ops-card p-3 h-100 status-rail-attention">
          <div className="d-flex align-items-center justify-content-between">
            <span className="text-uppercase fw-semibold" style={{ fontSize: '11px', letterSpacing: '0.5px', color: 'var(--status-attention)' }}>High Priority</span>
            <span className="material-symbols-outlined fs-5" style={{ color: 'var(--status-attention)' }}>priority_high</span>
          </div>
          <div className="mt-2">
            <span className="fs-3 fw-bold font-display tabular-nums" style={{ color: 'var(--status-attention)' }}>{highPriorityCount}</span>
            <span className="text-muted ms-2" style={{ fontSize: '11px' }}>Pending</span>
          </div>
        </div>
      </div>

      {/* AI Routing Suggestions */}
      <div className="col-6 col-md-4 col-lg-2">
        <div className="ops-card p-3 h-100 status-rail-info">
          <div className="d-flex align-items-center justify-content-between">
            <span className="text-uppercase fw-semibold" style={{ fontSize: '11px', letterSpacing: '0.5px', color: 'var(--status-info)' }}>AI Routing</span>
            <span className="material-symbols-outlined fs-5" style={{ color: 'var(--status-info)' }}>auto_awesome</span>
          </div>
          <div className="mt-2">
            <span className="fs-3 fw-bold font-display tabular-nums" style={{ color: 'var(--status-info)' }}>{pendingRecsCount}</span>
            <span className="text-muted ms-2" style={{ fontSize: '11px' }}>Suggestions</span>
          </div>
        </div>
      </div>

      {/* Low Inventory */}
      <div className="col-6 col-md-4 col-lg-2">
        <div className="ops-card p-3 h-100">
          <div className="d-flex align-items-center justify-content-between">
            <span className="text-uppercase text-muted fw-semibold" style={{ fontSize: '11px', letterSpacing: '0.5px' }}>Low Stock</span>
            <span className="material-symbols-outlined text-secondary fs-5">inventory_2</span>
          </div>
          <div className="mt-2">
            <span className="fs-3 fw-bold font-display tabular-nums" style={{ color: 'var(--status-attention)' }}>{lowInventoryCount}</span>
            <span className="text-muted ms-2" style={{ fontSize: '11px' }}>Items</span>
          </div>
        </div>
      </div>

      {/* Occupancy Rate */}
      <div className="col-6 col-md-4 col-lg-2">
        <div className="ops-card p-3 h-100 status-rail-ok">
          <div className="d-flex align-items-center justify-content-between">
            <span className="text-uppercase fw-semibold" style={{ fontSize: '11px', letterSpacing: '0.5px', color: 'var(--status-ok)' }}>Occupancy</span>
            <span className="material-symbols-outlined fs-5" style={{ color: 'var(--status-ok)' }}>hotel</span>
          </div>
          <div className="mt-2">
            <span className="fs-3 fw-bold font-display tabular-nums" style={{ color: 'var(--status-ok)' }}>{occupancyPercentage}%</span>
            <span className="text-muted ms-2 tabular-nums" style={{ fontSize: '11px' }}>{occupiedRoomsCount}/{totalRoomsCount}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
