'use client';

import React from 'react';
import { AuditLogItem, PricingRecommendation, AIRecItem } from '../../types/dashboard';
import { exportToCSV } from '../../lib/csvExport';

interface ManagementControlViewProps {
  recommendations: AIRecItem[];
  pricingRecommendations: PricingRecommendation[];
  auditLogs: AuditLogItem[];
  appliedRatesLog: string;
  handleRecAction: (recId: string, action: string) => Promise<void>;
  handleApplyPricing: (recId: string) => void;
}

export const ManagementControlView: React.FC<ManagementControlViewProps> = ({
  recommendations,
  pricingRecommendations,
  auditLogs,
  appliedRatesLog,
  handleRecAction,
  handleApplyPricing,
}) => {
  const handleExportAuditLog = () => {
    const data = auditLogs.map((a) => ({
      ID: a.id,
      Action: a.action,
      User: a.user?.name || 'System',
      Details: a.details,
      Timestamp: a.timestamp,
    }));
    exportToCSV('system_audit_log', data);
  };

  return (
    <div className="d-flex flex-column gap-4">
      {/* Header Bar */}
      <div className="d-flex flex-column flex-sm-row align-items-start align-items-sm-center justify-content-between gap-2">
        <div>
          <h4 className="fw-bold font-display m-0" style={{ color: 'var(--ink)' }}>Management Control Room & Audit Trail</h4>
          <p className="text-muted small mb-0">AI staff routing suggestions, dynamic revenue rate optimizer, and full system audit log</p>
        </div>
        <button onClick={handleExportAuditLog} className="btn btn-outline-ops d-flex align-items-center gap-1">
          <span className="material-symbols-outlined fs-6">download</span>
          Export Audit Log CSV
        </button>
      </div>

      <div className="row g-4">
        {/* AI Staff Workload Balancing */}
        <div className="col-12 col-lg-6">
          <div className="ops-card p-3.5 h-100 d-flex flex-column gap-3">
            <div className="d-flex align-items-center justify-content-between border-bottom pb-2" style={{ borderColor: 'var(--line)' }}>
              <div className="d-flex align-items-center gap-2">
                <span className="material-symbols-outlined text-secondary fs-5">auto_awesome</span>
                <h6 className="fw-bold font-display m-0">AI Dynamic Workload Balancing ({recommendations.length})</h6>
              </div>
            </div>

            {recommendations.length === 0 ? (
              <div className="ops-empty-state my-auto">
                <span className="material-symbols-outlined">smart_toy</span>
                <span className="ops-empty-state-text">No active workload rebalancing suggestions</span>
              </div>
            ) : (
              <div className="d-flex flex-column gap-3">
                {recommendations.map((rec) => (
                  <div key={rec.id} className="ops-card p-3.5 d-flex flex-column gap-2 status-rail-info">
                    <div className="d-flex align-items-center justify-content-between">
                      <span className="badge-status-info text-uppercase">{rec.type.replace(/_/g, ' ')}</span>
                      <span className="badge bg-light text-secondary border font-mono" style={{ fontSize: '10px', borderColor: 'var(--line)' }}>
                        Confidence: {Math.round(rec.confidence * 100)}%
                      </span>
                    </div>
                    <p className="text-dark mb-0" style={{ fontSize: '12px', lineHeight: 1.5 }}>{rec.reason}</p>
                    <div className="d-flex align-items-center gap-2 pt-2 border-top mt-1" style={{ borderColor: 'var(--line)' }}>
                      <button
                        onClick={() => handleRecAction(rec.id, 'APPROVE')}
                        className="btn btn-brass btn-sm flex-grow-1 d-flex align-items-center justify-content-center gap-1"
                      >
                        <span className="material-symbols-outlined fs-6">check</span>
                        Approve Staff Move
                      </button>
                      <button
                        onClick={() => handleRecAction(rec.id, 'REJECT')}
                        className="btn btn-outline-ops btn-sm"
                      >
                        <span className="material-symbols-outlined fs-6">close</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Dynamic Pricing Engine */}
        <div className="col-12 col-lg-6">
          <div className="ops-card p-3.5 h-100 d-flex flex-column gap-3">
            <div className="d-flex align-items-center justify-content-between border-bottom pb-2" style={{ borderColor: 'var(--line)' }}>
              <div className="d-flex align-items-center gap-2">
                <span className="material-symbols-outlined text-secondary fs-5">trending_up</span>
                <h6 className="fw-bold font-display m-0">AI Dynamic Revenue Rate Optimization</h6>
              </div>
            </div>

            <div className="d-flex flex-column gap-3">
              {pricingRecommendations.map((rec) => (
                <div key={rec.id} className="ops-card p-3.5 d-flex flex-column gap-2 status-rail-ok">
                  <div className="d-flex align-items-center justify-content-between">
                    <span className="fw-bold font-display text-dark" style={{ fontSize: '13px' }}>{rec.target}</span>
                    <div className="d-flex align-items-center gap-2">
                      <span className="text-muted text-decoration-line-through tabular-nums" style={{ fontSize: '12px' }}>${rec.currentRate}</span>
                      <span className="badge-status-ok font-mono fs-6">${rec.recommendedRate}</span>
                    </div>
                  </div>
                  <p className="text-muted mb-0" style={{ fontSize: '12px' }}>{rec.reason}</p>
                  <button
                    disabled={rec.applied}
                    onClick={() => handleApplyPricing(rec.id)}
                    className={`btn btn-sm w-100 mt-1 ${rec.applied ? 'btn-secondary disabled' : 'btn-brass'}`}
                  >
                    {rec.applied ? 'Rate Change Applied to PMS' : 'Approve Dynamic Rate Adjustment'}
                  </button>
                </div>
              ))}
              {appliedRatesLog && (
                <div className="p-2 border rounded bg-light text-success font-mono" style={{ fontSize: '11px', borderColor: 'var(--line)' }}>
                  {appliedRatesLog}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* System-Wide Audit Log & Traceability */}
      <div className="ops-card p-3.5 d-flex flex-column gap-3">
        <div className="d-flex align-items-center justify-content-between border-bottom pb-2" style={{ borderColor: 'var(--line)' }}>
          <div className="d-flex align-items-center gap-2">
            <span className="material-symbols-outlined text-secondary fs-5">gavel</span>
            <h6 className="fw-bold font-display m-0">System-Wide Audit Log & Traceability ({auditLogs.length} Records)</h6>
          </div>
          <span className="badge-status-info">RLS Multi-Tenant Enforced</span>
        </div>

        {auditLogs.length === 0 ? (
          <div className="ops-empty-state">
            <span className="material-symbols-outlined">description</span>
            <span className="ops-empty-state-text">No audit logs recorded yet</span>
          </div>
        ) : (
          <div className="d-flex flex-column gap-2 overflow-y-auto pr-1" style={{ maxHeight: '300px' }}>
            {auditLogs.map((log) => (
              <div key={log.id} className="p-2.5 border rounded-2 bg-white d-flex align-items-center justify-content-between text-muted" style={{ borderColor: 'var(--line)', fontSize: '12px' }}>
                <div>
                  <div className="d-flex align-items-center gap-2">
                    <span className="fw-bold font-display text-dark" style={{ color: 'var(--brass)' }}>{log.action}</span>
                    {log.user && <span className="text-secondary" style={{ fontSize: '11px' }}>by {log.user.name}</span>}
                  </div>
                  <p className="text-dark mb-0 mt-0.5" style={{ fontSize: '12px' }}>{log.details}</p>
                </div>
                <span className="text-muted tabular-nums" style={{ fontSize: '10px' }}>
                  {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
