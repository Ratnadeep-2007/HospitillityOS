'use client';

import React from 'react';
import { Home, Shield, ChevronDown, User } from 'lucide-react';
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
    <header className="bg-slate-900 border-b border-slate-800 sticky top-0 z-40 shadow-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 via-orange-500 to-yellow-400 flex items-center justify-center shadow-lg shadow-orange-500/20">
              <Home className="w-5 h-5 text-slate-950 stroke-[2.5]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-lg text-white tracking-tight">HospitalityOS</span>
                <span className="text-[10px] uppercase font-semibold px-2 py-0.5 rounded-full bg-orange-500/10 text-orange-400 border border-orange-500/20">
                  Single Property
                </span>
              </div>
              <p className="text-xs text-slate-400">Grand Horizon Resort & Spa</p>
            </div>
          </div>

          {/* System Status & Session Selector */}
          <div className="flex items-center gap-4">
            {/* API Status Indicator */}
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800/80 border border-slate-700/60 text-xs">
              <span className={`w-2 h-2 rounded-full ${apiOnline ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
              <span className="text-slate-300 font-medium">{apiOnline ? 'Postgres RLS Online' : 'Simulation Mode'}</span>
            </div>

            {/* Active User Dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowSessionMenu(!showSessionMenu)}
                className="flex items-center gap-3 px-3 py-1.5 rounded-xl bg-slate-800 border border-slate-700 hover:border-slate-600 transition-all text-left group"
              >
                <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-slate-700 to-slate-600 flex items-center justify-center text-slate-200">
                  <User className="w-4 h-4" />
                </div>
                <div className="hidden sm:block">
                  <div className="text-xs font-semibold text-white group-hover:text-amber-400 transition-colors">
                    {currentEmployeeName}
                  </div>
                  <div className="text-[10px] text-slate-400 flex items-center gap-1">
                    <Shield className="w-3 h-3 text-amber-500" />
                    <span>{currentUserRole}</span>
                  </div>
                </div>
                <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${showSessionMenu ? 'rotate-180' : ''}`} />
              </button>

              {/* Session Switcher Menu */}
              {showSessionMenu && (
                <div className="absolute right-0 mt-2 w-72 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl py-2 z-50 divide-y divide-slate-800">
                  <div className="px-4 py-2">
                    <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Switch Active Role / User</p>
                    <p className="text-xs text-slate-500 mt-0.5">{currentEmployeeEmail}</p>
                  </div>
                  <div className="py-1 max-h-64 overflow-y-auto">
                    {systemEmployees.map((emp) => (
                      <button
                        key={emp.id}
                        onClick={() => handleEmployeeSwitch(emp)}
                        className={`w-full text-left px-4 py-2.5 hover:bg-slate-800/80 transition-colors flex items-center justify-between ${
                          currentEmployeeEmail === emp.email ? 'bg-amber-500/10 border-l-2 border-amber-500' : ''
                        }`}
                      >
                        <div>
                          <p className="text-xs font-medium text-slate-200">{emp.name}</p>
                          <p className="text-[10px] text-slate-400">{emp.role} • {emp.department}</p>
                        </div>
                        {currentEmployeeEmail === emp.email && (
                          <span className="text-[10px] bg-amber-500/20 text-amber-400 font-semibold px-2 py-0.5 rounded-full">
                            Active
                          </span>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
