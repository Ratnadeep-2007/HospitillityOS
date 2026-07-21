'use client';

import React from 'react';
import { Terminal, Send, MessageSquare, Bed, AlertTriangle, Zap } from 'lucide-react';

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
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl mb-8">
      <div className="flex items-center justify-between mb-4 border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <Terminal className="w-5 h-5 text-amber-400" />
          <h2 className="text-base font-bold text-white tracking-wide">Multi-Channel Integration Event Gateway</h2>
        </div>
        <span className="text-xs text-slate-400 font-mono bg-slate-800 px-2.5 py-1 rounded-lg border border-slate-700">
          Inngest Pipeline Simulator
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Controls */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setSimType('whatsapp_message')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                simType === 'whatsapp_message'
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                  : 'bg-slate-800/80 text-slate-400 border border-slate-700 hover:text-slate-200'
              }`}
            >
              <MessageSquare className="w-3.5 h-3.5" />
              WhatsApp Guest Request
            </button>
            <button
              onClick={() => setSimType('pms_booking')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                simType === 'pms_booking'
                  ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                  : 'bg-slate-800/80 text-slate-400 border border-slate-700 hover:text-slate-200'
              }`}
            >
              <Bed className="w-3.5 h-3.5" />
              PMS Check-in Event
            </button>
            <button
              onClick={() => setSimType('inventory_alert')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                simType === 'inventory_alert'
                  ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30'
                  : 'bg-slate-800/80 text-slate-400 border border-slate-700 hover:text-slate-200'
              }`}
            >
              <AlertTriangle className="w-3.5 h-3.5" />
              IoT Low Inventory
            </button>
            <button
              onClick={() => setSimType('maintenance_due')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                simType === 'maintenance_due'
                  ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30'
                  : 'bg-slate-800/80 text-slate-400 border border-slate-700 hover:text-slate-200'
              }`}
            >
              <Zap className="w-3.5 h-3.5" />
              Building Automation Alert
            </button>
          </div>

          {/* Dynamic Payload Form */}
          <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-4 space-y-3">
            {simType === 'whatsapp_message' && (
              <>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-semibold text-slate-400 block mb-1">Room Number</label>
                    <input
                      type="text"
                      value={waRoom}
                      onChange={(e) => setWaRoom(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-amber-500"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-semibold text-slate-400 block mb-1">Guest Name</label>
                    <input
                      type="text"
                      value={waName}
                      onChange={(e) => setWaName(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-amber-500"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-slate-400 block mb-1">Incoming WhatsApp Message Body</label>
                  <input
                    type="text"
                    value={waMessage}
                    onChange={(e) => setWaMessage(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
              </>
            )}

            {simType === 'pms_booking' && (
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-semibold text-slate-400 block mb-1">Assign Room Number</label>
                  <input
                    type="text"
                    value={pmsRoom}
                    onChange={(e) => setPmsRoom(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-slate-400 block mb-1">Checking-in Guest Name</label>
                  <input
                    type="text"
                    value={pmsGuest}
                    onChange={(e) => setPmsGuest(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>
            )}

            {simType === 'inventory_alert' && (
              <>
                <div>
                  <label className="text-[11px] font-semibold text-slate-400 block mb-1">Item Name</label>
                  <input
                    type="text"
                    value={invItem}
                    onChange={(e) => setInvItem(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-semibold text-slate-400 block mb-1">Current Stock Quantity</label>
                    <input
                      type="number"
                      value={invLevel}
                      onChange={(e) => setInvLevel(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-amber-500"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-semibold text-slate-400 block mb-1">Minimum Alert Threshold</label>
                    <input
                      type="number"
                      value={invMin}
                      onChange={(e) => setInvMin(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-amber-500"
                    />
                  </div>
                </div>
              </>
            )}

            {simType === 'maintenance_due' && (
              <>
                <div>
                  <label className="text-[11px] font-semibold text-slate-400 block mb-1">Target Building Asset</label>
                  <input
                    type="text"
                    value={maintAsset}
                    onChange={(e) => setMaintAsset(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-slate-400 block mb-1">Telemetry Diagnostics Summary</label>
                  <input
                    type="text"
                    value={maintType}
                    onChange={(e) => setMaintType(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
              </>
            )}

            <button
              onClick={triggerSimulation}
              className="w-full mt-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-bold py-2 rounded-lg text-xs flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 transition-all active:scale-[0.99]"
            >
              <Send className="w-3.5 h-3.5" />
              Dispatch Webhook to Gateway
            </button>
          </div>
        </div>

        {/* Live Output Terminal */}
        <div className="lg:col-span-5 bg-black/90 border border-slate-800 rounded-xl p-4 flex flex-col justify-between font-mono">
          <div>
            <div className="flex items-center justify-between text-[11px] text-slate-400 border-b border-slate-800/80 pb-2 mb-3">
              <span>Event Ingestion Gateway Response</span>
              <span className="text-emerald-400 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                Live Output
              </span>
            </div>
            <pre className="text-xs text-amber-300/90 whitespace-pre-wrap leading-relaxed max-h-48 overflow-y-auto font-mono">
              {simLog || '// Waiting for webhook payload dispatch...\n// Click "Dispatch Webhook to Gateway" to trigger background event pipeline.'}
            </pre>
          </div>
          <div className="text-[10px] text-slate-500 pt-3 border-t border-slate-800/80">
            Pipeline: HTTP Post → Ingest Gateway → Database Event Record → Inngest Workflow Trigger → Task Spawn
          </div>
        </div>
      </div>
    </div>
  );
};
