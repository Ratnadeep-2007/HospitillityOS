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
    <header className="stitch-navbar sticky-top py-2 px-3 shadow-lg">
      <div className="container-fluid d-flex align-items-center justify-content-between">
        {/* Brand & Property Context */}
        <div className="d-flex align-items-center gap-3">
          <div
            className="d-flex align-items-center justify-content-center rounded-3 text-white shadow-lg"
            style={{
              width: '44px',
              height: '44px',
              background: 'linear-gradient(135deg, #f59e0b 0%, #0284c7 50%, #7c3aed 100%)',
              boxShadow: '0 4px 20px rgba(245, 158, 11, 0.35)',
            }}
          >
            <span className="material-symbols-outlined fs-4 text-white">domain</span>
          </div>
          <div>
            <div className="d-flex align-items-center gap-2">
              <span className="fw-extrabold fs-5 text-white font-display tracking-tight">HospitalityOS</span>
              <span className="badge badge-stitch-gold text-uppercase px-2.5 py-1" style={{ fontSize: '10px' }}>
                Enterprise Property Hub
              </span>
            </div>
            <small className="text-secondary d-flex align-items-center gap-1" style={{ fontSize: '11px' }}>
              <span className="material-symbols-outlined text-warning" style={{ fontSize: '13px' }}>location_city</span>
              Grand Horizon Resort & Spa • Property ID: prop-gh-01
            </small>
          </div>
        </div>

        {/* Status & Active User Account Switcher */}
        <div className="d-flex align-items-center gap-3">
          {/* API Health Status */}
          <div className="d-flex align-items-center gap-2 px-3 py-1.5 rounded-pill bg-dark bg-opacity-75 border border-secondary border-opacity-25">
            <span
              className={`rounded-circle ${apiOnline ? 'bg-success' : 'bg-warning'}`}
              style={{ width: '8px', height: '8px', boxShadow: apiOnline ? '0 0 10px #10b981' : '0 0 10px #f59e0b' }}
            />
            <small className="text-light fw-medium" style={{ fontSize: '12px' }}>
              {apiOnline ? 'Live Postgres & Event Bus' : 'Simulation Fallback'}
            </small>
          </div>

          {/* User Account Dropdown */}
          <div className="position-relative">
            <button
              onClick={() => setShowSessionMenu(!showSessionMenu)}
              className="btn btn-outline-secondary d-flex align-items-center gap-2 border-opacity-35 bg-dark bg-opacity-80 text-white rounded-3 px-3 py-1.5"
              style={{ borderStyle: 'dashed' }}
            >
              <div
                className="rounded-circle bg-warning bg-opacity-25 d-flex align-items-center justify-content-center text-warning"
                style={{ width: '32px', height: '32px' }}
              >
                <span className="material-symbols-outlined fs-5">account_circle</span>
              </div>
              <div className="text-start d-none d-sm-block">
                <div className="fw-semibold text-white font-display" style={{ fontSize: '12px' }}>
                  {currentEmployeeName}
                </div>
                <small className="text-warning d-flex align-items-center gap-1" style={{ fontSize: '10px' }}>
                  <span className="material-symbols-outlined" style={{ fontSize: '12px' }}>admin_panel_settings</span>
                  {currentUserRole}
                </small>
              </div>
              <span className="material-symbols-outlined text-secondary fs-5 ms-1">expand_more</span>
            </button>

            {/* Dropdown Menu */}
            {showSessionMenu && (
              <div
                className="position-absolute end-0 mt-2 bg-dark border border-secondary border-opacity-35 rounded-3 shadow-2xl p-2 z-3"
                style={{ width: '300px', backdropFilter: 'blur(20px)' }}
              >
                <div className="px-3 py-2 border-bottom border-secondary border-opacity-25">
                  <span className="text-uppercase text-warning fw-bold" style={{ fontSize: '10px', letterSpacing: '0.5px' }}>
                    Switch Active Role / User Account
                  </span>
                  <div className="text-secondary text-truncate" style={{ fontSize: '11px' }}>{currentEmployeeEmail}</div>
                </div>
                <div className="py-1 overflow-y-auto" style={{ maxHeight: '250px' }}>
                  {systemEmployees.map((emp) => (
                    <button
                      key={emp.id}
                      onClick={() => handleEmployeeSwitch(emp)}
                      className={`btn w-100 text-start px-3 py-2 rounded-2 d-flex align-items-center justify-content-between ${
                        currentEmployeeEmail === emp.email ? 'bg-warning bg-opacity-15 text-warning fw-semibold' : 'text-light hover-bg-secondary'
                      }`}
                      style={{ fontSize: '12px' }}
                    >
                      <div>
                        <div className="fw-medium text-white">{emp.name}</div>
                        <small className="text-secondary">{emp.role} • {emp.department}</small>
                      </div>
                      {currentEmployeeEmail === emp.email && (
                        <span className="badge badge-stitch-gold">Active</span>
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
