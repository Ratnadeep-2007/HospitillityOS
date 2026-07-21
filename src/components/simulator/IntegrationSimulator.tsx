'use client';

import React from 'react';

interface SimulatorProps {
  simType: 'whatsapp_message' | 'pms_booking' | 'inventory_alert' | 'maintenance_due';
  setSimType: (type: 'whatsapp_message' | 'pms_booking' | 'inventory_alert' | 'maintenance_due') => void;
  waRoom: string;
  setWaRoom: (val: string) => void;
  waName: string;
  setWaName: (val: string) => void;
  waMessage: string;
  setWaMessage: (val: string) => void;
  pmsRoom: string;
  setPmsRoom: (val: string) => void;
  pmsGuest: string;
  setPmsGuest: (val: string) => void;
  maintAsset: string;
  setMaintAsset: (val: string) => void;
  maintType: string;
  setMaintType: (val: string) => void;
  invItem: string;
  setInvItem: (val: string) => void;
  invLevel: string;
  setInvLevel: (val: string) => void;
  invMin: string;
  setInvMin: (val: string) => void;
  simLog: string;
  triggerSimulation: () => Promise<void>;
}

export const IntegrationSimulator: React.FC<SimulatorProps> = ({
  simType,
  setSimType,
  waRoom,
  setWaRoom,
  waName,
  setWaName,
  waMessage,
  setWaMessage,
  pmsRoom,
  setPmsRoom,
  pmsGuest,
  setPmsGuest,
  invItem,
  setInvItem,
  invLevel,
  setInvLevel,
  invMin,
  setInvMin,
  simLog,
  triggerSimulation,
}) => {
  return (
    <div className="ops-card p-4 mb-4">
      <div className="d-flex align-items-center justify-content-between border-bottom pb-3 mb-3" style={{ borderColor: 'var(--line)' }}>
        <div className="d-flex align-items-center gap-2">
          <span className="material-symbols-outlined text-secondary">terminal</span>
          <h6 className="fw-bold font-display m-0" style={{ color: 'var(--ink)' }}>Multi-Channel Integration Event Gateway</h6>
        </div>
        <span className="badge badge-status-info font-mono">Inngest Pipeline</span>
      </div>

      <div className="row g-4">
        {/* Controls Column */}
        <div className="col-lg-7">
          <div className="d-flex flex-wrap gap-2 mb-3">
            <button
              onClick={() => setSimType('whatsapp_message')}
              className={`btn btn-sm d-flex align-items-center gap-1.5 ${
                simType === 'whatsapp_message' ? 'btn-brass' : 'btn-outline-ops'
              }`}
            >
              <span className="material-symbols-outlined fs-6">chat</span>
              WhatsApp Request
            </button>
            <button
              onClick={() => setSimType('pms_booking')}
              className={`btn btn-sm d-flex align-items-center gap-1.5 ${
                simType === 'pms_booking' ? 'btn-brass' : 'btn-outline-ops'
              }`}
            >
              <span className="material-symbols-outlined fs-6">hotel</span>
              PMS Check-in Event
            </button>
            <button
              onClick={() => setSimType('inventory_alert')}
              className={`btn btn-sm d-flex align-items-center gap-1.5 ${
                simType === 'inventory_alert' ? 'btn-brass' : 'btn-outline-ops'
              }`}
            >
              <span className="material-symbols-outlined fs-6">inventory_2</span>
              Low Inventory Alert
            </button>
          </div>

          {/* Form Fields */}
          <div className="bg-light p-3 rounded border" style={{ borderColor: 'var(--line)' }}>
            {simType === 'whatsapp_message' && (
              <>
                <div className="row g-2 mb-2">
                  <div className="col-6">
                    <label className="text-muted fw-semibold mb-1" style={{ fontSize: '11px' }}>Room Number</label>
                    <input
                      type="text"
                      value={waRoom}
                      onChange={(e) => setWaRoom(e.target.value)}
                      className="form-control form-control-ops tabular-nums"
                    />
                  </div>
                  <div className="col-6">
                    <label className="text-muted fw-semibold mb-1" style={{ fontSize: '11px' }}>Guest Name</label>
                    <input
                      type="text"
                      value={waName}
                      onChange={(e) => setWaName(e.target.value)}
                      className="form-control form-control-ops"
                    />
                  </div>
                </div>
                <div className="mb-2">
                  <label className="text-muted fw-semibold mb-1" style={{ fontSize: '11px' }}>Incoming WhatsApp Body</label>
                  <input
                    type="text"
                    value={waMessage}
                    onChange={(e) => setWaMessage(e.target.value)}
                    className="form-control form-control-ops"
                  />
                </div>
              </>
            )}

            {simType === 'pms_booking' && (
              <div className="row g-2 mb-2">
                <div className="col-6">
                  <label className="text-muted fw-semibold mb-1" style={{ fontSize: '11px' }}>Assign Room Number</label>
                  <input
                    type="text"
                    value={pmsRoom}
                    onChange={(e) => setPmsRoom(e.target.value)}
                    className="form-control form-control-ops tabular-nums"
                  />
                </div>
                <div className="col-6">
                  <label className="text-muted fw-semibold mb-1" style={{ fontSize: '11px' }}>Guest Name</label>
                  <input
                    type="text"
                    value={pmsGuest}
                    onChange={(e) => setPmsGuest(e.target.value)}
                    className="form-control form-control-ops"
                  />
                </div>
              </div>
            )}

            {simType === 'inventory_alert' && (
              <>
                <div className="mb-2">
                  <label className="text-muted fw-semibold mb-1" style={{ fontSize: '11px' }}>Item Name</label>
                  <input
                    type="text"
                    value={invItem}
                    onChange={(e) => setInvItem(e.target.value)}
                    className="form-control form-control-ops"
                  />
                </div>
                <div className="row g-2 mb-2">
                  <div className="col-6">
                    <label className="text-muted fw-semibold mb-1" style={{ fontSize: '11px' }}>Current Stock Quantity</label>
                    <input
                      type="number"
                      value={invLevel}
                      onChange={(e) => setInvLevel(e.target.value)}
                      className="form-control form-control-ops tabular-nums"
                    />
                  </div>
                  <div className="col-6">
                    <label className="text-muted fw-semibold mb-1" style={{ fontSize: '11px' }}>Minimum Alert Threshold</label>
                    <input
                      type="number"
                      value={invMin}
                      onChange={(e) => setInvMin(e.target.value)}
                      className="form-control form-control-ops tabular-nums"
                    />
                  </div>
                </div>
              </>
            )}

            <button
              onClick={triggerSimulation}
              className="btn btn-brass w-100 mt-2 d-flex align-items-center justify-content-center gap-2"
              style={{ fontSize: '13px' }}
            >
              <span className="material-symbols-outlined fs-6">send</span>
              Dispatch Event Payload
            </button>
          </div>
        </div>

        {/* Console Column */}
        <div className="col-lg-5">
          <div className="bg-white border rounded p-3 h-100 d-flex flex-column justify-between font-mono" style={{ borderColor: 'var(--line)' }}>
            <div>
              <div className="d-flex align-items-center justify-content-between text-muted border-bottom pb-2 mb-2" style={{ borderColor: 'var(--line)', fontSize: '11px' }}>
                <span className="fw-semibold">Gateway Ingestion Console</span>
                <span className="text-success d-flex align-items-center gap-1">
                  <span className="rounded-circle bg-success" style={{ width: '6px', height: '6px' }} />
                  Live Output
                </span>
              </div>
              <pre className="text-dark text-wrap mb-0 font-mono" style={{ fontSize: '11px', maxHeight: '180px', overflowY: 'auto' }}>
                {simLog || '// Waiting for event payload dispatch...\n// Click "Dispatch Event Payload" to trigger in-memory background worker.'}
              </pre>
            </div>
            <div className="text-muted pt-2 border-top" style={{ borderColor: 'var(--line)', fontSize: '10px' }}>
              Pipeline: HTTP POST → API Gateway → Event Log → Inngest Bus → Task Dispatch
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
