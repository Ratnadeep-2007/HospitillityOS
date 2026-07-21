'use client';

import React from 'react';
import { ShoppingBag, Plus } from 'lucide-react';
import { VendorItem, InventoryItem, PurchaseRequestItem, DeptItem } from '../../types/dashboard';

interface KitchenProcurementViewProps {
  inventoryItems: InventoryItem[];
  purchaseRequests: PurchaseRequestItem[];
  vendors: VendorItem[];
  availableDepts: DeptItem[];
  prVendorId: string;
  setPrVendorId: (val: string) => void;
  prItemName: string;
  setPrItemName: (val: string) => void;
  prQty: string;
  setPrQty: (val: string) => void;
  prUnit: string;
  setPrUnit: (val: string) => void;
  prCost: string;
  setPrCost: (val: string) => void;
  prDeptId: string;
  setPrDeptId: (val: string) => void;
  prLog: string;
  handlePRSubmit: (e: React.FormEvent) => Promise<void>;
}

export const KitchenProcurementView: React.FC<KitchenProcurementViewProps> = ({
  inventoryItems,
  purchaseRequests,
  vendors,
  availableDepts,
  prVendorId,
  setPrVendorId,
  prItemName,
  setPrItemName,
  prQty,
  setPrQty,
  prUnit,
  setPrUnit,
  prCost,
  setPrCost,
  prDeptId,
  setPrDeptId,
  prLog,
  handlePRSubmit,
}) => {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-bold text-white tracking-wide">Kitchen & Procurement Operations</h2>
        <p className="text-xs text-slate-400">Inventory restocks, low stock thresholds, vendor directory, and automated purchase requests</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Inventory Stock Levels */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-lg space-y-3">
          <h3 className="text-sm font-semibold text-white flex items-center gap-2 border-b border-slate-800 pb-2">
            <ShoppingBag className="w-4 h-4 text-amber-400" />
            Active Inventory Stock Monitor ({inventoryItems.length} Tracked Items)
          </h3>
          <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
            {inventoryItems.map((item) => {
              const isLow = item.quantity <= item.minimumLevel;
              return (
                <div key={item.id} className="bg-slate-950/70 border border-slate-800/80 rounded-lg p-3 space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-white">{item.name}</span>
                    <span className={`font-mono text-xs ${isLow ? 'text-rose-400 font-bold' : 'text-slate-300'}`}>
                      {item.quantity} {item.unit}
                    </span>
                  </div>
                  <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                    <div
                      className={`h-full rounded-full ${isLow ? 'bg-rose-500' : 'bg-emerald-500'}`}
                      style={{ width: `${Math.min(100, (item.quantity / (item.minimumLevel * 2)) * 100)}%` }}
                    />
                  </div>
                  <div className="flex items-center justify-between text-[10px] text-slate-500">
                    <span>Department: {item.department?.name || 'Kitchen'}</span>
                    <span>Min Level: {item.minimumLevel} {item.unit}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Create Purchase Request Form */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-lg space-y-3">
          <h3 className="text-sm font-semibold text-white flex items-center gap-2 border-b border-slate-800 pb-2">
            <Plus className="w-4 h-4 text-emerald-400" />
            Submit Purchase Request to Vendor
          </h3>
          <form onSubmit={handlePRSubmit} className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-semibold text-slate-400 block mb-1">Select Vendor *</label>
                <select
                  required
                  value={prVendorId}
                  onChange={(e) => setPrVendorId(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-amber-500"
                >
                  <option value="">Choose Vendor</option>
                  {vendors.map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.name} ({v.category})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-400 block mb-1">Department *</label>
                <select
                  required
                  value={prDeptId}
                  onChange={(e) => setPrDeptId(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-amber-500"
                >
                  <option value="">Choose Department</option>
                  {availableDepts.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="text-[11px] font-semibold text-slate-400 block mb-1">Item Name *</label>
              <input
                type="text"
                required
                value={prItemName}
                onChange={(e) => setPrItemName(e.target.value)}
                placeholder="e.g. Fresh Milk (Litres)"
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-amber-500"
              />
            </div>

            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="text-[11px] font-semibold text-slate-400 block mb-1">Quantity *</label>
                <input
                  type="number"
                  required
                  value={prQty}
                  onChange={(e) => setPrQty(e.target.value)}
                  placeholder="25"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-400 block mb-1">Unit *</label>
                <input
                  type="text"
                  required
                  value={prUnit}
                  onChange={(e) => setPrUnit(e.target.value)}
                  placeholder="litres / units"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-400 block mb-1">Est. Cost ($) *</label>
                <input
                  type="number"
                  required
                  value={prCost}
                  onChange={(e) => setPrCost(e.target.value)}
                  placeholder="120"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>

            {prLog && (
              <p className="text-xs text-amber-400 bg-amber-500/10 border border-amber-500/20 rounded-lg p-2">
                {prLog}
              </p>
            )}

            <button
              type="submit"
              className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-bold py-2 rounded-lg text-xs shadow-lg shadow-amber-500/20 transition-all"
            >
              Submit Purchase Order & Trigger Workflow
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
