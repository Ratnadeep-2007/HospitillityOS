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
  maintAsset,
  setMaintAsset,
  maintType,
  setMaintType,
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
    <div className="card-stitch p-4 mb-4">
      <div className="d-flex align-items-center justify-content-between border-bottom border-secondary border-opacity-25 pb-3 mb-3">
        <div className="d-flex align-items-center gap-2">
          <span className="material-symbols-outlined text-info">terminal</span>
          <h6 className="fw-bold text-white font-display m-0">Multi-Channel Integration Event Gateway</h6>
        </div>
        <span className="badge badge-stitch-indigo">Inngest Pipeline Simulator</span>
      </div>

      <div className="row g-4">
        {/* Controls Column */}
        <div className="col-lg-7">
          <div className="d-flex flex-wrap gap-2 mb-3">
            <button
              onClick={() => setSimType('whatsapp_message')}
              className={`btn btn-sm d-flex align-items-center gap-2 ${
                simType === 'whatsapp_message' ? 'btn-stitch-primary' : 'btn-stitch-outline'
              }`}
            >
              <span className="material-symbols-outlined fs-6">chat</span>
              WhatsApp Guest Request
            </button>
            <button
              onClick={() => setSimType('pms_booking')}
              className={`btn btn-sm d-flex align-items-center gap-2 ${
                simType === 'pms_booking' ? 'btn-stitch-primary' : 'btn-stitch-outline'
              }`}
            >
              <span className="material-symbols-outlined fs-6">hotel</span>
              PMS Check-in Event
            </button>
            <button
              onClick={() => setSimType('inventory_alert')}
              className={`btn btn-sm d-flex align-items-center gap-2 ${
                simType === 'inventory_alert' ? 'btn-stitch-primary' : 'btn-stitch-outline'
              }`}
            >
              <span className="material-symbols-outlined fs-6">inventory_2</span>
              Low Inventory Alert
            </button>
          </div>

          {/* Form Fields */}
          <div className="bg-dark bg-opacity-50 border border-secondary border-opacity-25 rounded-3 p-3 space-y-3">
            {simType === 'whatsapp_message' && (
              <>
                <div className="row g-2 mb-2">
                  <div className="col-6">
                    <label className="text-secondary fw-semibold mb-1" style={{ fontSize: '11px' }}>Room Number</label>
                    <input
                      type="text"
                      value={waRoom}
                      onChange={(e) => setWaRoom(e.target.value)}
                      className="form-control form-control-sm bg-dark text-light border-secondary border-opacity-25"
                    />
                  </div>
                  <div className="col-6">
                    <label className="text-secondary fw-semibold mb-1" style={{ fontSize: '11px' }}>Guest Name</label>
                    <input
                      type="text"
                      value={waName}
                      onChange={(e) => setWaName(e.target.value)}
                      className="form-control form-control-sm bg-dark text-light border-secondary border-opacity-25"
                    />
                  </div>
                </div>
                <div className="mb-2">
                  <label className="text-secondary fw-semibold mb-1" style={{ fontSize: '11px' }}>Incoming Message Text</label>
                  <input
                    type="text"
                    value={waMessage}
                    onChange={(e) => setWaMessage(e.target.value)}
                    className="form-control form-control-sm bg-dark text-light border-secondary border-opacity-25"
                  />
                </div>
              </>
            )}

            {simType === 'pms_booking' && (
              <div className="row g-2 mb-2">
                <div className="col-6">
                  <label className="text-secondary fw-semibold mb-1" style={{ fontSize: '11px' }}>Assign Room Number</label>
                  <input
                    type="text"
                    value={pmsRoom}
                    onChange={(e) => setPmsRoom(e.target.value)}
                    className="form-control form-control-sm bg-dark text-light border-secondary border-opacity-25"
                  />
                </div>
                <div className="col-6">
                  <label className="text-secondary fw-semibold mb-1" style={{ fontSize: '11px' }}>Guest Name</label>
                  <input
                    type="text"
                    value={pmsGuest}
                    onChange={(e) => setPmsGuest(e.target.value)}
                    className="form-control form-control-sm bg-dark text-light border-secondary border-opacity-25"
                  />
                </div>
              </div>
            )}

            {simType === 'inventory_alert' && (
              <>
                <div className="mb-2">
                  <label className="text-secondary fw-semibold mb-1" style={{ fontSize: '11px' }}>Item Name</label>
                  <input
                    type="text"
                    value={invItem}
                    onChange={(e) => setInvItem(e.target.value)}
                    className="form-control form-control-sm bg-dark text-light border-secondary border-opacity-25"
                  />
                </div>
                <div className="row g-2 mb-2">
                  <div className="col-6">
                    <label className="text-secondary fw-semibold mb-1" style={{ fontSize: '11px' }}>Current Stock Quantity</label>
                    <input
                      type="number"
                      value={invLevel}
                      onChange={(e) => setInvLevel(e.target.value)}
                      className="form-control form-control-sm bg-dark text-light border-secondary border-opacity-25"
                    />
                  </div>
                  <div className="col-6">
                    <label className="text-secondary fw-semibold mb-1" style={{ fontSize: '11px' }}>Minimum Alert Threshold</label>
                    <input
                      type="number"
                      value={invMin}
                      onChange={(e) => setInvMin(e.target.value)}
                      className="form-control form-control-sm bg-dark text-light border-secondary border-opacity-25"
                    />
                  </div>
                </div>
              </>
            )}

            <button
              onClick={triggerSimulation}
              className="btn btn-stitch-primary w-100 mt-2 d-flex align-items-center justify-content-center gap-2"
              style={{ fontSize: '12px' }}
            >
              <span className="material-symbols-outlined fs-6">send</span>
              Dispatch Event to Gateway
            </button>
          </div>
        </div>

        {/* Console Column */}
        <div className="col-lg-5">
          <div className="bg-black bg-opacity-75 border border-secondary border-opacity-25 rounded-3 p-3 h-100 d-flex flex-column justify-between font-mono">
            <div>
              <div className="d-flex align-items-center justify-content-between text-secondary border-bottom border-secondary border-opacity-25 pb-2 mb-2" style={{ fontSize: '11px' }}>
                <span>Ingestion Gateway Console</span>
                <span className="text-success d-flex align-items-center gap-1">
                  <span className="spinner-grow spinner-grow-sm text-success" style={{ width: '6px', height: '6px' }} />
                  Live Output
                </span>
              </div>
              <pre className="text-info text-wrap mb-0" style={{ fontSize: '11px', maxHeight: '180px', overflowY: 'auto' }}>
                {simLog || '// Waiting for event payload dispatch...\n// Click "Dispatch Event to Gateway" to trigger in-memory queue.'}
              </pre>
            </div>
            <div className="text-secondary pt-2 border-top border-secondary border-opacity-25" style={{ fontSize: '10px' }}>
              Flow: HTTP POST → API Gateway → Event Log → Inngest Bus → Task Dispatch
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
