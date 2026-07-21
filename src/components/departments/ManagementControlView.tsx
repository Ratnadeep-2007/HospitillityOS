'use client';

import React from 'react';
import { Shield, Zap, TrendingUp, Check, X } from 'lucide-react';
import { AuditLogItem, PricingRecommendation, AIRecItem } from '../../types/dashboard';

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
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-bold text-white tracking-wide">Management Control Room & Audit Trail</h2>
        <p className="text-xs text-slate-400">AI staff routing suggestions, dynamic revenue rate optimizer, and full system audit log</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* AI Staff Move Recommendations */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-lg space-y-3">
          <h3 className="text-sm font-semibold text-white flex items-center gap-2 border-b border-slate-800 pb-2">
            <Zap className="w-4 h-4 text-purple-400" />
            AI Dynamic Staff Workload Balancing ({recommendations.length} Suggestions)
          </h3>
          <div className="space-y-3">
            {recommendations.map((rec) => (
              <div key={rec.id} className="bg-slate-950/80 border border-slate-800/80 rounded-xl p-3.5 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-purple-400 uppercase">{rec.type.replace(/_/g, ' ')}</span>
                  <span className="text-[10px] bg-purple-500/10 text-purple-300 font-mono px-2 py-0.5 rounded-full border border-purple-500/20">
                    Confidence: {Math.round(rec.confidence * 100)}%
                  </span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">{rec.reason}</p>
                <div className="flex items-center gap-2 pt-1 border-t border-slate-800/80">
                  <button
                    onClick={() => handleRecAction(rec.id, 'APPROVE')}
                    className="flex-1 bg-purple-500 hover:bg-purple-400 text-slate-950 font-bold py-1 rounded-lg text-xs transition-colors flex items-center justify-center gap-1"
                  >
                    <Check className="w-3.5 h-3.5" /> Approve Staff Move
                  </button>
                  <button
                    onClick={() => handleRecAction(rec.id, 'REJECT')}
                    className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-400 rounded-lg text-xs transition-colors"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Dynamic Pricing Engine */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-lg space-y-3">
          <h3 className="text-sm font-semibold text-white flex items-center gap-2 border-b border-slate-800 pb-2">
            <TrendingUp className="w-4 h-4 text-emerald-400" />
            AI Dynamic Revenue & Rate Optimization
          </h3>
          <div className="space-y-3">
            {pricingRecommendations.map((rec) => (
              <div key={rec.id} className="bg-slate-950/80 border border-slate-800/80 rounded-xl p-3.5 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-white">{rec.target}</span>
                  <div className="flex items-center gap-2">
                    <span className="line-through text-slate-500">${rec.currentRate}</span>
                    <span className="text-emerald-400 font-bold font-mono text-sm">${rec.recommendedRate}</span>
                  </div>
                </div>
                <p className="text-xs text-slate-400">{rec.reason}</p>
                <button
                  disabled={rec.applied}
                  onClick={() => handleApplyPricing(rec.id)}
                  className={`w-full py-1 rounded-lg text-xs font-bold transition-colors ${
                    rec.applied
                      ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                      : 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-lg shadow-emerald-500/20'
                  }`}
                >
                  {rec.applied ? 'Rate Change Applied to PMS' : 'Approve Dynamic Rate Adjustment'}
                </button>
              </div>
            ))}
            {appliedRatesLog && (
              <p className="text-xs text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 rounded-lg p-2 mt-2">
                {appliedRatesLog}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Audit Log Timeline */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-lg space-y-3">
        <h3 className="text-sm font-semibold text-white flex items-center gap-2 border-b border-slate-800 pb-2">
          <Shield className="w-4 h-4 text-amber-400" />
          System-Wide Audit Log & Traceability ({auditLogs.length} Records)
        </h3>
        <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
          {auditLogs.map((log) => (
            <div key={log.id} className="bg-slate-950/70 border border-slate-800/80 rounded-lg p-3 flex items-center justify-between text-xs">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-amber-400">{log.action}</span>
                  {log.user && <span className="text-[10px] text-slate-400">by {log.user.name}</span>}
                </div>
                <p className="text-slate-300 mt-0.5">{log.details}</p>
              </div>
              <span className="text-[10px] text-slate-500 font-mono">
                {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
