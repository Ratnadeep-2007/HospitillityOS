'use client';

import React from 'react';
import { VendorItem, InventoryItem, PurchaseRequestItem, DeptItem } from '../../types/dashboard';
import { exportToCSV } from '../../lib/csvExport';

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
  const handleExportInventory = () => {
    const data = inventoryItems.map((i) => ({
      ItemName: i.name,
      Quantity: i.quantity,
      Unit: i.unit,
      MinThreshold: i.minimumLevel,
      Department: i.department?.name || 'Kitchen',
    }));
    exportToCSV('inventory_stock_report', data);
  };

  return (
    <div className="d-flex flex-column gap-4">
      {/* Header Bar */}
      <div className="d-flex flex-column flex-sm-row align-items-start align-items-sm-center justify-content-between gap-2">
        <div>
          <h4 className="fw-bold font-display m-0" style={{ color: 'var(--ink)' }}>Kitchen & Procurement Operations</h4>
          <p className="text-muted small mb-0">Inventory restocks, low stock thresholds, vendor directory, and automated purchase requests</p>
        </div>
        <button onClick={handleExportInventory} className="btn btn-outline-ops d-flex align-items-center gap-1">
          <span className="material-symbols-outlined fs-6">download</span>
          Export Inventory CSV
        </button>
      </div>

      <div className="row g-4">
        {/* Inventory Stock Levels */}
        <div className="col-12 col-lg-6">
          <div className="ops-card p-3.5 h-100 d-flex flex-column gap-3">
            <div className="d-flex align-items-center justify-content-between border-bottom pb-2" style={{ borderColor: 'var(--line)' }}>
              <div className="d-flex align-items-center gap-2">
                <span className="material-symbols-outlined text-secondary fs-5">shopping_bag</span>
                <h6 className="fw-bold font-display m-0">Active Inventory Monitor ({inventoryItems.length} Items)</h6>
              </div>
            </div>

            {inventoryItems.length === 0 ? (
              <div className="ops-empty-state my-auto">
                <span className="material-symbols-outlined">inventory_2</span>
                <span className="ops-empty-state-text">No tracked inventory items found</span>
              </div>
            ) : (
              <div className="d-flex flex-column gap-2 overflow-y-auto pr-1" style={{ maxHeight: '340px' }}>
                {inventoryItems.map((item) => {
                  const isLow = item.quantity <= item.minimumLevel;
                  return (
                    <div key={item.id} className="p-3 border rounded-2 bg-white d-flex flex-column gap-1.5" style={{ borderColor: 'var(--line)' }}>
                      <div className="d-flex align-items-center justify-content-between">
                        <span className="fw-bold font-display text-dark" style={{ fontSize: '13px' }}>{item.name}</span>
                        <span className={`font-mono fw-bold ${isLow ? 'text-danger' : 'text-dark'}`} style={{ fontSize: '12px' }}>
                          {item.quantity} {item.unit}
                        </span>
                      </div>
                      <div className="progress" style={{ height: '6px', backgroundColor: '#EFECE6' }}>
                        <div
                          className={`progress-bar ${isLow ? 'bg-danger' : 'bg-success'}`}
                          role="progressbar"
                          style={{ width: `${Math.min(100, (item.quantity / (item.minimumLevel * 2)) * 100)}%` }}
                        />
                      </div>
                      <div className="d-flex align-items-center justify-content-between text-muted" style={{ fontSize: '10px' }}>
                        <span>Department: {item.department?.name || 'Kitchen'}</span>
                        <span>Min Threshold: {item.minimumLevel} {item.unit}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Create Purchase Request Form */}
        <div className="col-12 col-lg-6">
          <div className="ops-card p-3.5 h-100 d-flex flex-column gap-3">
            <div className="d-flex align-items-center justify-content-between border-bottom pb-2" style={{ borderColor: 'var(--line)' }}>
              <div className="d-flex align-items-center gap-2">
                <span className="material-symbols-outlined text-secondary fs-5">post_add</span>
                <h6 className="fw-bold font-display m-0">Submit Purchase Request to Vendor</h6>
              </div>
            </div>

            <form onSubmit={handlePRSubmit} className="d-flex flex-column gap-3">
              <div className="row g-2">
                <div className="col-12 col-sm-6">
                  <label className="fw-medium text-muted mb-1" style={{ fontSize: '11px' }}>Select Vendor *</label>
                  <select
                    required
                    value={prVendorId}
                    onChange={(e) => setPrVendorId(e.target.value)}
                    className="form-select form-control-ops"
                  >
                    <option value="">Choose Vendor</option>
                    {vendors.map((v) => (
                      <option key={v.id} value={v.id}>
                        {v.name} ({v.category})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="col-12 col-sm-6">
                  <label className="fw-medium text-muted mb-1" style={{ fontSize: '11px' }}>Department *</label>
                  <select
                    required
                    value={prDeptId}
                    onChange={(e) => setPrDeptId(e.target.value)}
                    className="form-select form-control-ops"
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
                <label className="fw-medium text-muted mb-1" style={{ fontSize: '11px' }}>Item Name *</label>
                <input
                  type="text"
                  required
                  value={prItemName}
                  onChange={(e) => setPrItemName(e.target.value)}
                  placeholder="e.g. Fresh Milk (Litres)"
                  className="form-control form-control-ops"
                />
              </div>

              <div className="row g-2">
                <div className="col-4">
                  <label className="fw-medium text-muted mb-1" style={{ fontSize: '11px' }}>Quantity *</label>
                  <input
                    type="number"
                    required
                    value={prQty}
                    onChange={(e) => setPrQty(e.target.value)}
                    placeholder="25"
                    className="form-control form-control-ops"
                  />
                </div>

                <div className="col-4">
                  <label className="fw-medium text-muted mb-1" style={{ fontSize: '11px' }}>Unit *</label>
                  <input
                    type="text"
                    required
                    value={prUnit}
                    onChange={(e) => setPrUnit(e.target.value)}
                    placeholder="litres"
                    className="form-control form-control-ops"
                  />
                </div>

                <div className="col-4">
                  <label className="fw-medium text-muted mb-1" style={{ fontSize: '11px' }}>Est. Cost ($) *</label>
                  <input
                    type="number"
                    required
                    value={prCost}
                    onChange={(e) => setPrCost(e.target.value)}
                    placeholder="120"
                    className="form-control form-control-ops"
                  />
                </div>
              </div>

              {prLog && (
                <div className="p-2 border rounded bg-light text-success font-mono" style={{ fontSize: '11px', borderColor: 'var(--line)' }}>
                  {prLog}
                </div>
              )}

              <button type="submit" className="btn btn-brass mt-2">
                Submit Purchase Order & Trigger Workflow
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
