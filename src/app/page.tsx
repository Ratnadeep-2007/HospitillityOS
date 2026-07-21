'use client';

import React, { useState, useEffect } from 'react';

import {
  VendorItem,
  InventoryItem,
  PurchaseRequestItem,
  TaskItem,
  AIRecItem,
  NotificationItem,
  AuditLogItem,
  DeptItem,
  RoomItem,
  AssetItem,
  PricingRecommendation,
  GuestItem,
  GuestEventItem,
  ChecklistData,
  UserAccount,
} from '../types/dashboard';

import { Header } from '../components/dashboard/Header';
import { StatsOverview } from '../components/dashboard/StatsOverview';
import { TaskItemCard } from '../components/tasks/TaskItemCard';
import { TaskCreateModal } from '../components/tasks/TaskCreateModal';
import { ManagerOverrideModal } from '../components/tasks/ManagerOverrideModal';
import { ReceptionView } from '../components/departments/ReceptionView';
import { HousekeepingView } from '../components/departments/HousekeepingView';
import { MaintenanceView } from '../components/departments/MaintenanceView';
import { KitchenProcurementView } from '../components/departments/KitchenProcurementView';
import { RestaurantView } from '../components/departments/RestaurantView';
import { SecuritySOPView } from '../components/departments/SecuritySOPView';
import { ManagementControlView } from '../components/departments/ManagementControlView';
import { NotificationFeed } from '../components/notifications/NotificationFeed';
import { exportToCSV } from '../lib/csvExport';

const SYSTEM_EMPLOYEES: UserAccount[] = [
  { id: 'usr-1', name: 'Elena Rostova', role: 'OWNER', department: 'Management', email: 'owner@grandhorizon.com' },
  { id: 'usr-2', name: 'Marcus Vance', role: 'MANAGER', department: 'Management', email: 'manager@grandhorizon.com' },
  { id: 'usr-3', name: 'Sarah Jenkins', role: 'SUPERVISOR', department: 'Reception', email: 'supervisor@grandhorizon.com' },
  { id: 'usr-4', name: 'David Kim', role: 'RECEPTIONIST', department: 'Reception', email: 'receptionist@grandhorizon.com' },
  { id: 'usr-5', name: 'Maria Gomez', role: 'SUPERVISOR', department: 'Housekeeping', email: 'housekeeper.lead@grandhorizon.com' },
  { id: 'usr-6', name: 'John Doe', role: 'HOUSEKEEPER', department: 'Housekeeping', email: 'housekeeper@grandhorizon.com' },
  { id: 'usr-7', name: 'Chef Sanjay', role: 'CHEF', department: 'Kitchen', email: 'chef@grandhorizon.com' },
  { id: 'usr-8', name: 'Robert Miller', role: 'TECHNICIAN', department: 'Maintenance', email: 'technician@grandhorizon.com' },
  { id: 'usr-9', name: 'Alex Thompson', role: 'DRIVER', department: 'Reception', email: 'driver@grandhorizon.com' },
  { id: 'usr-10', name: 'Alice Smith', role: 'STAFF', department: 'Procurement', email: 'staff@grandhorizon.com' },
];

export default function Dashboard() {
  const [apiOnline, setApiOnline] = useState(true);
  const [currentUserRole, setCurrentUserRole] = useState('MANAGER');
  const [currentEmployeeName, setCurrentEmployeeName] = useState('Marcus Vance');
  const [currentEmployeeEmail, setCurrentEmployeeEmail] = useState('manager@grandhorizon.com');
  const [showSessionMenu, setShowSessionMenu] = useState(false);

  const [activeTab, setActiveTab] = useState<'control' | 'reception' | 'housekeeping' | 'maintenance' | 'kitchen' | 'restaurant' | 'security' | 'management'>('control');

  // Stats & Entities State
  const [stats, setStats] = useState({ total: 4, pending: 2, inProgress: 1, completed: 1, escalated: 1 });
  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [recommendations, setRecommendations] = useState<AIRecItem[]>([]);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLogItem[]>([]);
  const [availableDepts, setAvailableDepts] = useState<DeptItem[]>([]);
  const [availableRooms, setAvailableRooms] = useState<RoomItem[]>([]);
  const [vendors, setVendors] = useState<VendorItem[]>([]);
  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([]);
  const [assets, setAssets] = useState<AssetItem[]>([]);
  const [purchaseRequests, setPurchaseRequests] = useState<PurchaseRequestItem[]>([]);
  const [guests, setGuests] = useState<GuestItem[]>([]);
  const [guestEvents, setGuestEvents] = useState<GuestEventItem[]>([]);
  const [checklistData, setChecklistData] = useState<ChecklistData | null>(null);

  // Manual Task Creation Modal
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [taskTitle, setTaskTitle] = useState('');
  const [taskDescription, setTaskDescription] = useState('');
  const [taskDeptId, setTaskDeptId] = useState('');
  const [taskPriority, setTaskPriority] = useState('MEDIUM');
  const [taskRoomId, setTaskRoomId] = useState('');
  const [taskDueDate, setTaskDueDate] = useState('');
  const [modalLog, setModalLog] = useState('');

  // Purchase Request Form
  const [prVendorId, setPrVendorId] = useState('');
  const [prItemName, setPrItemName] = useState('');
  const [prQty, setPrQty] = useState('');
  const [prUnit, setPrUnit] = useState('units');
  const [prCost, setPrCost] = useState('');
  const [prDeptId, setPrDeptId] = useState('');
  const [prLog, setPrLog] = useState('');

  // Manager Override Modal
  const [overrideTask, setOverrideTask] = useState<TaskItem | null>(null);
  const [overrideDeptId, setOverrideDeptId] = useState('');
  const [overrideAssigneeId, setOverrideAssigneeId] = useState('');
  const [overridePriority, setOverridePriority] = useState('');
  const [overrideDueDate, setOverrideDueDate] = useState('');
  const [overrideLog, setOverrideLog] = useState('');

  const [pricingRecommendations, setPricingRecommendations] = useState<PricingRecommendation[]>([
    {
      id: 'pr-rec-1',
      target: 'Standard Ocean View',
      currentRate: 180,
      recommendedRate: 235,
      reason: 'Weekend occupancy surge forecasted at 94%. Demand high for ocean views.',
      confidence: 0.94,
      applied: false,
    },
  ]);
  const [appliedRatesLog, setAppliedRatesLog] = useState('');

  // Fetch Dashboard Data
  const refreshData = async () => {
    try {
      const res = await fetch('/api/dashboard/stats');
      if (res.ok) {
        const data = await res.json();
        setStats(data.stats);
        setTasks(data.recentTasks || []);
        setRecommendations(data.recommendations || []);
        setNotifications(data.notifications || []);
        setAuditLogs(data.auditLogs || []);
        setAvailableDepts(data.departments || []);
        setAvailableRooms(data.rooms || []);
        setVendors(data.vendors || []);
        setInventoryItems(data.inventoryItems || []);
        setAssets(data.assets || []);
        setPurchaseRequests(data.purchaseRequests || []);
        setGuests(data.guests || []);
        setGuestEvents(data.guestEvents || []);
        setApiOnline(true);
      } else {
        setApiOnline(false);
      }

      const checklistRes = await fetch('/api/checklists');
      if (checklistRes.ok) {
        const cData = await checklistRes.json();
        setChecklistData(cData);
      }
    } catch {
      setApiOnline(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      refreshData();
    }, 0);
    const interval = setInterval(refreshData, 3000);
    return () => {
      clearTimeout(timer);
      clearInterval(interval);
    };
  }, []);

  // Session Switcher
  const handleEmployeeSwitch = (emp: UserAccount) => {
    setCurrentUserRole(emp.role);
    setCurrentEmployeeName(emp.name);
    setCurrentEmployeeEmail(emp.email);
    setShowSessionMenu(false);

    const switchAudit: AuditLogItem = {
      id: `audit-${Date.now()}`,
      action: 'USER_SESSION_SWAPPED',
      details: `Swapped active session to user ${emp.name} (${emp.role} - ${emp.department}).`,
      timestamp: new Date().toISOString(),
    };
    setAuditLogs((prev) => [switchAudit, ...prev]);
  };

  // Update Task Status
  const handleUpdateStatus = async (taskId: string, newStatus: string) => {
    try {
      const res = await fetch(`/api/tasks/${taskId}/status`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus, userRole: currentUserRole }),
      });
      if (res.ok) refreshData();
    } catch {
      setTasks((prev) => prev.map((t) => (t.id === taskId ? { ...t, status: newStatus } : t)));
    }
  };

  // Update Room Status
  const handleRoomStatusChange = async (roomId: string, newStatus: string) => {
    try {
      const res = await fetch(`/api/rooms/${roomId}/status`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) refreshData();
    } catch {
      setAvailableRooms((prev) => prev.map((r) => (r.id === roomId ? { ...r, status: newStatus } : r)));
    }
  };

  // Recommendation & PR Handlers
  const handleRecAction = async (recId: string, action: string) => {
    try {
      const res = await fetch(`/api/recommendations/${recId}/action`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action }),
      });
      if (res.ok) refreshData();
    } catch {
      setRecommendations((prev) => prev.filter((r) => r.id !== recId));
    }
  };

  const handleCreateManualTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskTitle || !taskDeptId) return;
    setModalLog('Creating task...');

    try {
      const res = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: taskTitle, description: taskDescription, departmentId: taskDeptId, priority: taskPriority, roomId: taskRoomId || undefined }),
      });
      if (res.ok) {
        setShowTaskModal(false);
        refreshData();
      }
    } catch {
      setShowTaskModal(false);
    }
  };

  const handlePRSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prVendorId || !prItemName) return;
    setPrLog('Submitting purchase request...');

    try {
      const res = await fetch('/api/purchase-requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ vendorId: prVendorId, itemName: prItemName, quantity: parseFloat(prQty), unit: prUnit, estimatedCost: parseFloat(prCost), departmentId: prDeptId }),
      });
      if (res.ok) {
        setPrLog('Purchase request submitted!');
        refreshData();
      }
    } catch {
      setPrLog('Submitted locally.');
    }
  };

  const handleApplyPricing = (recId: string) => {
    setPricingRecommendations((prev) => prev.map((r) => (r.id === recId ? { ...r, applied: true } : r)));
    setAppliedRatesLog('Rate adjustment applied.');
  };

  const handleDispatchPredictiveMaintenance = (assetId: string) => {
    setAssets((prev) => prev.map((a) => (a.id === assetId ? { ...a, status: 'MAINTENANCE_REQUIRED' } : a)));
  };

  const openOverrideModal = (task: TaskItem) => {
    setOverrideTask(task);
    setOverrideDeptId(task.departmentId || '');
    setOverrideAssigneeId(task.assignedUserId || '');
    setOverridePriority(task.priority);
    setOverrideDueDate(task.dueDate || '');
    setOverrideLog('');
  };

  const handleManagerOverride = async (action: 'update' | 'cancel') => {
    if (!overrideTask) return;
    setOverrideLog(action === 'cancel' ? 'Cancelling task...' : 'Applying reassignment...');
    const body: Record<string, string> = {};
    if (action === 'cancel') {
      body.status = 'CANCELLED';
    } else {
      if (overrideDeptId) body.departmentId = overrideDeptId;
      if (overrideAssigneeId) body.assignedUserId = overrideAssigneeId;
      if (overridePriority) body.priority = overridePriority;
      if (overrideDueDate) body.dueDate = new Date(overrideDueDate).toISOString();
    }

    try {
      const res = await fetch(`/api/tasks/${overrideTask.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (res.ok) {
        setOverrideLog('Updated successfully!');
        setTimeout(() => {
          setOverrideTask(null);
          refreshData();
        }, 600);
      }
    } catch {
      setOverrideLog('Updated locally.');
      setTimeout(() => setOverrideTask(null), 600);
    }
  };

  const handleExportAllTasks = () => {
    const data = tasks.map((t) => ({
      TaskID: t.id,
      Title: t.title,
      Department: t.department?.name || 'Unassigned',
      Priority: t.priority,
      Status: t.status,
      Room: t.room?.roomNumber || '',
      AssignedTo: t.assignedUser?.name || 'Unassigned',
      DueDate: t.dueDate || '',
    }));
    exportToCSV('all_operations_tasks', data);
  };

  // Department Filters
  const highPriorityCount = tasks.filter((t) => (t.priority === 'HIGH' || t.priority === 'URGENT') && t.status !== 'COMPLETED').length;
  const occupiedRoomsCount = availableRooms.filter((r) => r.status === 'OCCUPIED').length;
  const lowInventoryCount = inventoryItems.filter((i) => i.quantity <= i.minimumLevel).length;

  const receptionTasks = tasks.filter((t) => t.department?.name?.toLowerCase() === 'reception');
  const housekeepingTasks = tasks.filter((t) => t.department?.name?.toLowerCase() === 'housekeeping');
  const maintenanceTasks = tasks.filter((t) => t.department?.name?.toLowerCase() === 'maintenance');
  const restaurantTasks = tasks.filter((t) => t.department?.name?.toLowerCase() === 'restaurant');
  const securityTasks = tasks.filter((t) => t.department?.name?.toLowerCase() === 'security');

  return (
    <div className="min-vh-100 pb-5" style={{ backgroundColor: 'var(--paper)', color: 'var(--ink)' }}>
      <Header
        apiOnline={apiOnline}
        currentUserRole={currentUserRole}
        currentEmployeeName={currentEmployeeName}
        currentEmployeeEmail={currentEmployeeEmail}
        showSessionMenu={showSessionMenu}
        setShowSessionMenu={setShowSessionMenu}
        systemEmployees={SYSTEM_EMPLOYEES}
        handleEmployeeSwitch={handleEmployeeSwitch}
      />

      <main className="container-fluid px-lg-4 pt-4">
        <StatsOverview
          stats={stats}
          highPriorityCount={highPriorityCount}
          pendingRecsCount={recommendations.length}
          lowInventoryCount={lowInventoryCount}
          occupiedRoomsCount={occupiedRoomsCount}
          totalRoomsCount={availableRooms.length}
        />

        {/* Navigation Department Tabs (docs/design.md nav-tab-ops) */}
        <div className="d-flex align-items-center gap-2 overflow-x-auto pb-2 mb-4 border-bottom" style={{ borderColor: 'var(--line)' }}>
          {[
            { id: 'control', label: 'All Operations Queue', icon: 'dashboard' },
            { id: 'reception', label: 'Reception & Front Desk', icon: 'hotel' },
            { id: 'housekeeping', label: 'Housekeeping', icon: 'cleaning_services' },
            { id: 'maintenance', label: 'Maintenance', icon: 'build' },
            { id: 'kitchen', label: 'Kitchen & Procurement', icon: 'shopping_bag' },
            { id: 'restaurant', label: 'Restaurant & Dining', icon: 'restaurant' },
            { id: 'security', label: 'Security & Daily SOPs', icon: 'verified_user' },
            { id: 'management', label: 'Management Control', icon: 'query_stats' },
          ].map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as typeof activeTab)}
                className={`btn btn-sm d-flex align-items-center gap-1.5 text-nowrap nav-tab-ops ${
                  isActive ? 'active' : ''
                }`}
              >
                <span className="material-symbols-outlined fs-6">{tab.icon}</span>
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Tab Views */}
        {activeTab === 'control' && (
          <div>
            <div className="d-flex align-items-center justify-content-between mb-3">
              <h5 className="fw-bold font-display m-0" style={{ color: 'var(--ink)' }}>
                All Operations Task Queue <span className="text-muted tabular-nums">({tasks.length})</span>
              </h5>
              <div className="d-flex align-items-center gap-2">
                <button
                  onClick={handleExportAllTasks}
                  className="btn btn-outline-ops d-flex align-items-center gap-1"
                >
                  <span className="material-symbols-outlined fs-6">download</span>
                  Export Tasks CSV
                </button>
                <button
                  onClick={() => setShowTaskModal(true)}
                  className="btn btn-brass d-flex align-items-center gap-1"
                >
                  <span className="material-symbols-outlined fs-6">add</span>
                  Create Task
                </button>
              </div>
            </div>

            {tasks.length === 0 ? (
              <div className="ops-empty-state mb-4">
                <span className="material-symbols-outlined">task</span>
                <span className="ops-empty-state-text">No active tasks in the queue right now</span>
              </div>
            ) : (
              <div className="row g-3 mb-4">
                {tasks.map((task) => (
                  <div key={task.id} className="col-12 col-md-6 col-lg-4">
                    <TaskItemCard
                      task={task}
                      currentUserRole={currentUserRole}
                      handleUpdateStatus={handleUpdateStatus}
                      openOverrideModal={openOverrideModal}
                    />
                  </div>
                ))}
              </div>
            )}

            <NotificationFeed notifications={notifications} />
          </div>
        )}

        {activeTab === 'reception' && (
          <ReceptionView
            guests={guests}
            guestEvents={guestEvents}
            receptionTasks={receptionTasks}
            handleUpdateStatus={handleUpdateStatus}
            openTaskModal={() => setShowTaskModal(true)}
          />
        )}

        {activeTab === 'housekeeping' && (
          <HousekeepingView
            rooms={availableRooms}
            housekeepingTasks={housekeepingTasks}
            inventoryItems={inventoryItems}
            handleUpdateStatus={handleUpdateStatus}
            handleRoomStatusChange={handleRoomStatusChange}
          />
        )}

        {activeTab === 'maintenance' && (
          <MaintenanceView
            assets={assets}
            maintenanceTasks={maintenanceTasks}
            handleUpdateStatus={handleUpdateStatus}
            handleDispatchPredictiveMaintenance={handleDispatchPredictiveMaintenance}
          />
        )}

        {activeTab === 'kitchen' && (
          <KitchenProcurementView
            inventoryItems={inventoryItems}
            purchaseRequests={purchaseRequests}
            vendors={vendors}
            availableDepts={availableDepts}
            prVendorId={prVendorId}
            setPrVendorId={setPrVendorId}
            prItemName={prItemName}
            setPrItemName={setPrItemName}
            prQty={prQty}
            setPrQty={setPrQty}
            prUnit={prUnit}
            setPrUnit={setPrUnit}
            prCost={prCost}
            setPrCost={setPrCost}
            prDeptId={prDeptId}
            setPrDeptId={setPrDeptId}
            prLog={prLog}
            handlePRSubmit={handlePRSubmit}
          />
        )}

        {activeTab === 'restaurant' && (
          <RestaurantView
            restaurantTasks={restaurantTasks}
            guests={guests}
            handleUpdateStatus={handleUpdateStatus}
            openTaskModal={() => setShowTaskModal(true)}
          />
        )}

        {activeTab === 'security' && (
          <SecuritySOPView
            checklistData={checklistData}
            securityTasks={securityTasks}
            handleUpdateStatus={handleUpdateStatus}
          />
        )}

        {activeTab === 'management' && (
          <ManagementControlView
            recommendations={recommendations}
            pricingRecommendations={pricingRecommendations}
            auditLogs={auditLogs}
            appliedRatesLog={appliedRatesLog}
            handleRecAction={handleRecAction}
            handleApplyPricing={handleApplyPricing}
          />
        )}

        {/* Modals */}
        <TaskCreateModal
          showTaskModal={showTaskModal}
          setShowTaskModal={setShowTaskModal}
          taskTitle={taskTitle}
          setTaskTitle={setTaskTitle}
          taskDescription={taskDescription}
          setTaskDescription={setTaskDescription}
          taskDeptId={taskDeptId}
          setTaskDeptId={setTaskDeptId}
          taskPriority={taskPriority}
          setTaskPriority={setTaskPriority}
          taskRoomId={taskRoomId}
          setTaskRoomId={setTaskRoomId}
          taskDueDate={taskDueDate}
          setTaskDueDate={setTaskDueDate}
          modalLog={modalLog}
          availableDepts={availableDepts}
          availableRooms={availableRooms}
          handleCreateManualTask={handleCreateManualTask}
        />

        <ManagerOverrideModal
          overrideTask={overrideTask}
          setOverrideTask={setOverrideTask}
          overrideDeptId={overrideDeptId}
          setOverrideDeptId={setOverrideDeptId}
          overrideAssigneeId={overrideAssigneeId}
          setOverrideAssigneeId={setOverrideAssigneeId}
          overridePriority={overridePriority}
          setOverridePriority={setOverridePriority}
          overrideDueDate={overrideDueDate}
          setOverrideDueDate={setOverrideDueDate}
          overrideLog={overrideLog}
          availableDepts={availableDepts}
          staffUsers={SYSTEM_EMPLOYEES}
          handleManagerOverride={handleManagerOverride}
        />
      </main>
    </div>
  );
}
