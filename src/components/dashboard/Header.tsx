'use client';

import React from 'react';
import { UserAccount } from '../../types/dashboard';

interface HeaderProps {
  apiOnline: boolean;
  currentUserRole: string;
  currentEmployeeName: string;
  currentEmployeeEmail: string;
  showSessionMenu: boolean;
  setShowSessionMenu: (show: boolean) => void;
  systemEmployees: UserAccount[];
  handleEmployeeSwitch: (emp: UserAccount) => void;
}

export const Header: React.FC<HeaderProps> = ({
  apiOnline,
  currentUserRole,
  currentEmployeeName,
  currentEmployeeEmail,
  showSessionMenu,
  setShowSessionMenu,
  systemEmployees,
  handleEmployeeSwitch,
}) => {
  return (
    <header className="ops-navbar sticky-top py-2.5 px-3">
      <div className="container-fluid d-flex align-items-center justify-content-between">
        {/* Brand & Property Context */}
        <div className="d-flex align-items-center gap-3">
          <div
            className="d-flex align-items-center justify-content-center rounded-2 text-white"
            style={{
              width: '36px',
              height: '36px',
              backgroundColor: 'var(--brass)',
            }}
          >
            <span className="material-symbols-outlined fs-5 text-white">domain</span>
          </div>
          <div>
            <div className="d-flex align-items-center gap-2">
              <span className="fw-bold fs-5 font-display tracking-tight" style={{ color: 'var(--ink)' }}>HospitalityOS</span>
              <span className="badge rounded-1 fw-semibold text-uppercase px-2 py-0.5" style={{ backgroundColor: '#F0EAE1', color: 'var(--brass)', fontSize: '10px', border: '1px solid #E2D7C7' }}>
                Operations Control Center
              </span>
            </div>
            <div className="text-muted d-flex align-items-center gap-1" style={{ fontSize: '11px' }}>
              <span>Grand Horizon Resort & Spa</span>
              <span>•</span>
              <span className="tabular-nums">ID: prop-gh-01</span>
            </div>
          </div>
        </div>

        {/* Status & Active User Account Switcher */}
        <div className="d-flex align-items-center gap-3">
          {/* API Health Status */}
          <div className="d-flex align-items-center gap-2 px-2.5 py-1 rounded-2 bg-light border" style={{ borderColor: 'var(--line)', fontSize: '12px' }}>
            <span
              className="rounded-circle"
              style={{
                width: '7px',
                height: '7px',
                backgroundColor: apiOnline ? 'var(--status-ok)' : 'var(--status-attention)',
              }}
            />
            <span className="fw-medium text-secondary" style={{ fontSize: '12px' }}>
              {apiOnline ? 'Live Connection' : 'Simulation Mode'}
            </span>
          </div>

          {/* User Account Dropdown */}
          <div className="position-relative">
            <button
              onClick={() => setShowSessionMenu(!showSessionMenu)}
              className="btn btn-outline-ops d-flex align-items-center gap-2 px-3 py-1.5"
            >
              <div
                className="rounded-circle d-flex align-items-center justify-content-center"
                style={{ width: '28px', height: '28px', backgroundColor: '#F0EAE1', color: 'var(--brass)' }}
              >
                <span className="material-symbols-outlined fs-6">account_circle</span>
              </div>
              <div className="text-start d-none d-sm-block">
                <div className="fw-semibold font-display" style={{ fontSize: '12px', color: 'var(--ink)' }}>
                  {currentEmployeeName}
                </div>
                <div className="text-muted d-flex align-items-center gap-1" style={{ fontSize: '10px' }}>
                  <span className="material-symbols-outlined" style={{ fontSize: '11px', color: 'var(--brass)' }}>shield</span>
                  <span>{currentUserRole}</span>
                </div>
              </div>
              <span className="material-symbols-outlined text-muted fs-6 ms-1">expand_more</span>
            </button>

            {/* Dropdown Menu */}
            {showSessionMenu && (
              <div
                className="position-absolute end-0 mt-1 bg-white border rounded-2 shadow-sm p-1 z-3"
                style={{ width: '280px', borderColor: 'var(--line)' }}
              >
                <div className="px-3 py-2 border-bottom" style={{ borderColor: 'var(--line)' }}>
                  <span className="text-uppercase text-muted fw-bold" style={{ fontSize: '10px', letterSpacing: '0.5px' }}>
                    Switch Operational Role
                  </span>
                  <div className="text-secondary text-truncate" style={{ fontSize: '11px' }}>{currentEmployeeEmail}</div>
                </div>
                <div className="py-1 overflow-y-auto" style={{ maxHeight: '240px' }}>
                  {systemEmployees.map((emp) => (
                    <button
                      key={emp.id}
                      onClick={() => handleEmployeeSwitch(emp)}
                      className={`btn w-100 text-start px-3 py-1.5 rounded-1 d-flex align-items-center justify-content-between ${
                        currentEmployeeEmail === emp.email ? 'bg-light fw-semibold' : 'text-dark hover-bg-light'
                      }`}
                      style={{ fontSize: '12px' }}
                    >
                      <div>
                        <div className="fw-medium">{emp.name}</div>
                        <small className="text-muted">{emp.role} • {emp.department}</small>
                      </div>
                      {currentEmployeeEmail === emp.email && (
                        <span className="badge rounded-1" style={{ backgroundColor: 'var(--brass)', color: '#FFFFFF', fontSize: '10px' }}>Active</span>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
