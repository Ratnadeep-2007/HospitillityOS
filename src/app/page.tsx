/* eslint-disable react-hooks/purity */
'use client';

import React, { useState, useEffect } from 'react';
import { LayoutDashboard, Bed, ShoppingBag, Utensils, Shield, Layers, Plus } from 'lucide-react';

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
import { IntegrationSimulator } from '../components/simulator/IntegrationSimulator';
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

  // Simulator Inputs
  const [simType, setSimType] = useState<'whatsapp_message' | 'pms_booking' | 'inventory_alert' | 'maintenance_due'>('whatsapp_message');
  const [waRoom, setWaRoom] = useState('101');
  const [waName, setWaName] = useState('Arthur Pendragon');
  const [waMessage, setWaMessage] = useState('We need 2 fresh pillows and a dental kit, please.');
  const [pmsRoom, setPmsRoom] = useState('202');
  const [pmsGuest, setPmsGuest] = useState('Lancelot Du Lac');
  const [maintAsset, setMaintAsset] = useState('Lobby Central AC Chiller');
  const [maintType, setMaintType] = useState('AC blowing warm air, room temperature rising');
  const [invItem, setInvItem] = useState('Hotel Toiletries Kit');
  const [invLevel, setInvLevel] = useState('45');
  const [invMin, setInvMin] = useState('100');
  const [simLog, setSimLog] = useState<string>('');

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

  // 1. Fetch Dashboard Data
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

  // 2. Session Switcher
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

  // 3. Trigger Simulation Payload
  const triggerSimulation = async () => {
    setSimLog('Sending simulated event payload...');
    const payload: { type: string; metadata: Record<string, unknown> } = {
      type: simType,
      metadata: {},
    };

    if (simType === 'whatsapp_message') {
      payload.metadata = { roomNumber: waRoom, guestName: waName, messageText: waMessage };
    } else if (simType === 'pms_booking') {
      payload.metadata = { roomNumber: pmsRoom, guestName: pmsGuest };
    } else if (simType === 'inventory_alert') {
      payload.metadata = { itemName: invItem, currentLevel: parseFloat(invLevel), minimumLevel: parseFloat(invMin) };
    } else if (simType === 'maintenance_due') {
      payload.metadata = { assetName: maintAsset, maintenanceType: maintType };
    }

    try {
      const isWhatsapp = simType === 'whatsapp_message';
      const endpoint = isWhatsapp ? '/api/integrations/incoming' : '/api/integrations/mock';
      const currentPropId = availableDepts[0]?.propertyId;
      const bodyData = isWhatsapp
        ? {
            messageText: waMessage,
            guestPhone: waName === 'Arthur Pendragon' ? '+15550192834' : '+15550000000',
            targetPhone: '+15550192834',
            propertyId: currentPropId,
            source: 'WHATSAPP',
          }
        : {
            ...payload,
            propertyId: currentPropId,
          };

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bodyData),
      });

      if (res.ok) {
        const result = await res.json();
        setSimLog(`Event Ingested successfully!\nStatus: ${result.status}`);
        refreshData();
      } else {
        const errText = await res.text();
        setSimLog(`Gateway Error (HTTP ${res.status}): ${errText}`);
      }
    } catch (error) {
      const errMsg = error instanceof Error ? error.message : 'Unknown connection error';
      setSimLog(`Delivery Failed: ${errMsg}`);
    }
  };

  // 4. Update Task Status
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

  // 5. Update Room Status
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

  // 6. Recommendation & PR Handlers
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
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-amber-500 selection:text-slate-950 pb-12">
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

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        <StatsOverview
          stats={stats}
          highPriorityCount={highPriorityCount}
          pendingRecsCount={recommendations.length}
          lowInventoryCount={lowInventoryCount}
          occupiedRoomsCount={occupiedRoomsCount}
          totalRoomsCount={availableRooms.length}
        />

        <IntegrationSimulator
          simType={simType}
          setSimType={setSimType}
          waRoom={waRoom}
          setWaRoom={setWaRoom}
          waName={waName}
          setWaName={setWaName}
          waMessage={waMessage}
          setWaMessage={setWaMessage}
          pmsRoom={pmsRoom}
          setPmsRoom={setPmsRoom}
          pmsGuest={pmsGuest}
          setPmsGuest={setPmsGuest}
          maintAsset={maintAsset}
          setMaintAsset={setMaintAsset}
          maintType={maintType}
          setMaintType={setMaintType}
          invItem={invItem}
          setInvItem={setInvItem}
          invLevel={invLevel}
          setInvLevel={setInvLevel}
          invMin={invMin}
          setInvMin={setInvMin}
          simLog={simLog}
          triggerSimulation={triggerSimulation}
        />

        {/* Navigation Department Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 mb-6 border-b border-slate-800 scrollbar-none">
          {[
            { id: 'control', label: 'All Operations Queue', icon: LayoutDashboard },
            { id: 'reception', label: 'Reception & Front Desk', icon: Bed },
            { id: 'housekeeping', label: 'Housekeeping', icon: Layers },
            { id: 'maintenance', label: 'Maintenance', icon: Shield },
            { id: 'kitchen', label: 'Kitchen & Procurement', icon: ShoppingBag },
            { id: 'restaurant', label: 'Restaurant & Dining', icon: Utensils },
            { id: 'security', label: 'Security & Daily SOPs', icon: Shield },
            { id: 'management', label: 'Management Control', icon: Shield },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as typeof activeTab)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/20'
                    : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Tab Views */}
        {activeTab === 'control' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-white tracking-wide">All Operations Task Queue ({tasks.length})</h2>
              <button
                onClick={() => setShowTaskModal(true)}
                className="bg-amber-500 hover:bg-amber-400 text-slate-950 px-3.5 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors shadow-lg shadow-amber-500/20"
              >
                <Plus className="w-3.5 h-3.5" />
                Create Operations Task
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {tasks.map((task) => (
                <TaskItemCard
                  key={task.id}
                  task={task}
                  currentUserRole={currentUserRole}
                  handleUpdateStatus={handleUpdateStatus}
                  openOverrideModal={openOverrideModal}
                />
              ))}
            </div>

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
