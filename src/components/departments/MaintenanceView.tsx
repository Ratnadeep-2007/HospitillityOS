'use client';

import React from 'react';
import { AssetItem, TaskItem } from '../../types/dashboard';
import { exportToCSV } from '../../lib/csvExport';

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
  const handleExportAssets = () => {
    const data = assets.map((a) => ({
      AssetID: a.id,
      Name: a.name,
      Category: a.category,
      Status: a.status,
    }));
    exportToCSV('maintenance_asset_telemetry', data);
  };

  return (
    <div className="d-flex flex-column gap-4">
      {/* Header Bar */}
      <div className="d-flex flex-column flex-sm-row align-items-start align-items-sm-center justify-content-between gap-2">
        <div>
          <h4 className="fw-bold font-display m-0" style={{ color: 'var(--ink)' }}>Maintenance & Facility Assets</h4>
          <p className="text-muted small mb-0">Equipment health telemetry, predictive maintenance AI diagnostics, and work orders</p>
        </div>
        <button onClick={handleExportAssets} className="btn btn-outline-ops d-flex align-items-center gap-1">
          <span className="material-symbols-outlined fs-6">download</span>
          Export Assets CSV
        </button>
      </div>

      {/* Asset Telemetry Cards */}
      <div className="ops-card p-3.5 d-flex flex-column gap-3">
        <div className="d-flex align-items-center justify-content-between border-bottom pb-2" style={{ borderColor: 'var(--line)' }}>
          <div className="d-flex align-items-center gap-2">
            <span className="material-symbols-outlined text-secondary fs-5">build</span>
            <h6 className="fw-bold font-display m-0">Building Systems & Critical Assets ({assets.length})</h6>
          </div>
          <span className="badge-status-info">IoT Telemetry Active</span>
        </div>

        {assets.length === 0 ? (
          <div className="ops-empty-state">
            <span className="material-symbols-outlined">handyman</span>
            <span className="ops-empty-state-text">No registered facility assets tracked in system</span>
          </div>
        ) : (
          <div className="row g-3">
            {assets.map((asset) => {
              const isDown = asset.status === 'MAINTENANCE_REQUIRED' || asset.status === 'DOWN';
              return (
                <div key={asset.id} className="col-12 col-md-6 col-lg-4">
                  <div className={`ops-card p-3.5 h-100 d-flex flex-column justify-content-between gap-3 ${
                    isDown ? 'status-rail-critical' : 'status-rail-ok'
                  }`}>
                    <div>
                      <div className="d-flex align-items-start justify-content-between gap-2 mb-1">
                        <span className="fw-bold font-display text-dark fs-6">{asset.name}</span>
                        <span className={isDown ? 'badge-status-critical' : 'badge-status-ok'}>
                          {asset.status.replace(/_/g, ' ')}
                        </span>
                      </div>
                      <p className="text-muted mb-0" style={{ fontSize: '11px' }}>Category: {asset.category}</p>
                    </div>

                    <div className="pt-2 border-top d-flex align-items-center justify-content-between" style={{ borderColor: 'var(--line)' }}>
                      <span className="text-muted" style={{ fontSize: '11px' }}>
                        {isDown ? 'Anomaly Flagged' : 'Telemetry Normal'}
                      </span>
                      <button
                        onClick={() => handleDispatchPredictiveMaintenance(asset.id)}
                        className="btn btn-outline-ops btn-sm"
                        style={{ fontSize: '11px' }}
                      >
                        Simulate Telemetry Anomaly
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Maintenance Work Orders */}
      <div className="ops-card p-3.5 d-flex flex-column gap-3">
        <div className="d-flex align-items-center justify-content-between border-bottom pb-2" style={{ borderColor: 'var(--line)' }}>
          <div className="d-flex align-items-center gap-2">
            <span className="material-symbols-outlined text-secondary fs-5">schedule</span>
            <h6 className="fw-bold font-display m-0">Maintenance Work Orders Queue ({maintenanceTasks.length})</h6>
          </div>
        </div>

        {maintenanceTasks.length === 0 ? (
          <div className="ops-empty-state">
            <span className="material-symbols-outlined">task_alt</span>
            <span className="ops-empty-state-text">No maintenance tickets right now</span>
          </div>
        ) : (
          <div className="row g-3">
            {maintenanceTasks.map((task) => (
              <div key={task.id} className="col-12 col-md-6 col-lg-4">
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
                      Complete Work Order
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
