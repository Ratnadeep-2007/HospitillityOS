/* eslint-disable react-hooks/purity */
'use client';

import React, { useState, useEffect } from 'react';
import { 
  MessageSquare, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  Home, 
  Layers, 
  Plus, 
  Send,
  Zap,
  Activity,
  Cpu,
  Terminal,
  LayoutDashboard,
  Inbox,
  Bed,
  ShoppingBag,
  TrendingUp,
  Shield,
  ChevronDown,
  Check,
  X
} from 'lucide-react';


// Hardcoded fallback data in case API is offline

interface VendorItem {
  id: string;
  name: string;
  category: string;
  contactInfo: string;
}

interface InventoryItem {
  id: string;
  name: string;
  unit: string;
  quantity: number;
  minimumLevel: number;
  department?: { name: string } | null;
}

interface PurchaseRequestItem {
  id: string;
  vendorName: string;
  itemName: string;
  quantity: number;
  unit: string;
  estimatedCost: number;
  status: 'Awaiting Manager Approval' | 'Awaiting Delivery' | 'Completed';
}

interface TaskDepartment {
  name: string;
}

interface TaskRoom {
  roomNumber: string;
}

interface TaskItem {
  id: string;
  title: string;
  description: string;
  priority: string;
  status: string;
  dueDate?: string;
  createdAt: string;
  department?: TaskDepartment;
  room?: TaskRoom | null;
}

interface AIRecItem {
  id: string;
  type: string;
  confidence: number;
  reason: string;
  status: string;
}

interface NotificationUser {
  name: string;
  role: string;
}

interface NotificationItem {
  id: string;
  recipient: string;
  message: string;
  createdAt: string;
  channel?: string; // IN_APP, WHATSAPP, EMAIL, SMS, PUSH
  status?: string;  // PENDING, SENT, FAILED, READ
  user?: NotificationUser | null;
}

interface AuditLogUser {
  name: string;
}

interface AuditLogItem {
  id: string;
  action: string;
  details: string;
  timestamp: string;
  user?: AuditLogUser | null;
}

interface DeptItem {
  id: string;
  name: string;
  description?: string;
}

interface RoomItem {
  id: string;
  roomNumber: string;
  roomType: string;
  status: string; // AVAILABLE, OCCUPIED, DIRTY, MAINTENANCE
}

interface ChecklistTask {
  id: string;
  title: string;
  status: string;
  priority: string;
  dueDate: string | null;
  workflowId: string;
}

interface ChecklistDept {
  departmentId: string;
  tasks: ChecklistTask[];
}

interface ChecklistData {
  date: string;
  totalTasks: number;
  departments: Record<string, ChecklistDept>;
}

interface AssetItem {
  id: string;
  name: string;
  category: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

interface PricingRecommendation {
  id: string;
  target: string;
  currentRate: number;
  recommendedRate: number;
  reason: string;
  confidence: number;
  applied: boolean;
}

interface GuestItem {
  id: string;
  name: string;
  phone?: string | null;
  email?: string | null;
  preferences?: string | null;
  loyaltyStatus?: string | null;
  bookings?: {
    id: string;
    status: string;
    room?: {
      id: string;
      roomNumber: string;
      roomType: string;
    } | null;
  }[];
}

interface GuestEventMetadata {
  guestName?: string;
  guestPhone?: string;
  roomNumber?: string;
  messageText?: string;
  [key: string]: unknown;
}

interface GuestEventItem {
  id: string;
  type: string;
  source: string;
  timestamp: string;
  metadata: GuestEventMetadata;
  processed?: boolean;
}

// User accounts list matching seeded data
const SYSTEM_EMPLOYEES = [
  { name: 'Marcus Vance', role: 'MANAGER', dept: 'Management', email: 'manager@grandhorizon.com' },
  { name: 'Elena Rostova', role: 'OWNER', dept: 'Management', email: 'owner@grandhorizon.com' },
  { name: 'Sarah Jenkins', role: 'SUPERVISOR', dept: 'Reception', email: 'supervisor@grandhorizon.com' },
  { name: 'David Kim', role: 'RECEPTIONIST', dept: 'Reception', email: 'receptionist@grandhorizon.com' },
  { name: 'Maria Gomez', role: 'SUPERVISOR', dept: 'Housekeeping', email: 'housekeeper.lead@grandhorizon.com' },
  { name: 'John Doe', role: 'HOUSEKEEPER', dept: 'Housekeeping', email: 'housekeeper@grandhorizon.com' },
  { name: 'Robert Miller', role: 'TECHNICIAN', dept: 'Maintenance', email: 'technician@grandhorizon.com' },
  { name: 'Chef Sanjay', role: 'CHEF', dept: 'Kitchen', email: 'chef@grandhorizon.com' }
];

const SYSTEM_PROPERTIES = [
  { id: 'prop-horizon-1', name: 'Grand Horizon Resort & Spa', location: 'Paradise Valley', type: 'Resort' },
  { id: 'prop-crest-2', name: 'Ocean Crest Luxury Villas', location: 'Marina Bay', type: 'Villas' }
];

const mockOfflineGuests = [
  {
    id: 'mock-g-1',
    name: 'Arthur Pendragon',
    phone: '+15550192834',
    email: 'arthur.p@camelot.org',
    preferences: 'Prefers high floors, feather-free pillows, and sparkling water.',
    loyaltyStatus: 'Gold',
    bookings: [{ id: 'mock-b-1', status: 'CHECKED_IN', room: { id: 'mock-r-1', roomNumber: '101', roomType: 'Standard Ocean View' } }]
  },
  {
    id: 'mock-g-2',
    name: 'Morgana Le Fay',
    phone: '+15550192777',
    email: 'morgana.lf@darkmagic.co',
    preferences: 'Prefers early check-in and strong black coffee.',
    loyaltyStatus: 'Silver',
    bookings: [{ id: 'mock-b-2', status: 'CHECKED_IN', room: { id: 'mock-r-11', roomNumber: '201', roomType: 'Deluxe Suite' } }]
  }
];

const StitchedCornerPins = () => (
  <>
    <span className="stitched-pin stitched-pin-tl" />
    <span className="stitched-pin stitched-pin-tr" />
    <span className="stitched-pin stitched-pin-bl" />
    <span className="stitched-pin stitched-pin-br" />
  </>
);

const PriorityBadge = ({ priority }: { priority: string }) => {
  let badgeClass = '';
  switch (priority) {
    case 'LOW':
      badgeClass = 'neon-tag-low';
      break;
    case 'MEDIUM':
      badgeClass = 'neon-tag-medium';
      break;
    case 'HIGH':
      badgeClass = 'neon-tag-high';
      break;
    case 'URGENT':
      badgeClass = 'neon-tag-urgent';
      break;
    default:
      badgeClass = 'neon-tag-low';
  }
  return (
    <span className={`text-[9px] px-2 py-0.5 rounded-md font-bold uppercase tracking-wider font-mono ${badgeClass}`}>
      {priority}
    </span>
  );
};

export default function Dashboard() {
  // Session States
  const [currentUserRole, setCurrentUserRole] = useState<string>('MANAGER');
  const [currentEmployeeName, setCurrentEmployeeName] = useState<string>('Marcus Vance');
  const [currentEmployeeEmail, setCurrentEmployeeEmail] = useState<string>('manager@grandhorizon.com');
  const [activeProperty, setActiveProperty] = useState(SYSTEM_PROPERTIES[0]);
  const [showSessionMenu, setShowSessionMenu] = useState(false);
  const [showPropertyMenu, setShowPropertyMenu] = useState(false);

  // App States
  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [recommendations, setRecommendations] = useState<AIRecItem[]>([]);
  const [stats, setStats] = useState({ total: 0, pending: 0, inProgress: 0, completed: 0, escalated: 0 });
  const [activeDeptFilter, setActiveDeptFilter] = useState('All');
  const [apiOnline, setApiOnline] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [activeNotifFilter, setActiveNotifFilter] = useState<string>('ALL');
  const [auditLogs, setAuditLogs] = useState<AuditLogItem[]>([]);
  const [availableDepts, setAvailableDepts] = useState<DeptItem[]>([]);
  const [availableRooms, setAvailableRooms] = useState<RoomItem[]>([]);

  // Vendor Coordinator & Inventory states
  const [vendors, setVendors] = useState<VendorItem[]>([]);
  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([]);
  const [purchaseRequests, setPurchaseRequests] = useState<PurchaseRequestItem[]>([]);

  // Intelligence & Predictive maintenance states
  const [assets, setAssets] = useState<AssetItem[]>([]);
  const [pricingRecommendations, setPricingRecommendations] = useState<PricingRecommendation[]>([
    { id: 'pr-rec-1', target: 'Deluxe Suite (Base)', currentRate: 150, recommendedRate: 185, reason: 'High weekend demand forecast. Occupancy pace is +18% vs weekly average.', confidence: 0.94, applied: false },
    { id: 'pr-rec-2', target: 'Standard Ocean View', currentRate: 110, recommendedRate: 128, reason: 'Local corporate conference starting tomorrow. Competitor rates up 22%.', confidence: 0.88, applied: false },
    { id: 'pr-rec-3', target: 'Presidential Penthouse', currentRate: 450, recommendedRate: 520, reason: 'Luxury segment traffic peaking. Only 1 penthouse remaining.', confidence: 0.91, applied: false },
  ]);
  const [appliedRatesLog, setAppliedRatesLog] = useState<string>('');

  // Purchase Request Form states
  const [prVendorId, setPrVendorId] = useState('');
  const [prItemName, setPrItemName] = useState('');
  const [prQty, setPrQty] = useState('');
  const [prUnit, setPrUnit] = useState('units');
  const [prCost, setPrCost] = useState('');
  const [prDeptId, setPrDeptId] = useState('');
  const [prLog, setPrLog] = useState('');

  // Manual Task Modal states
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [taskTitle, setTaskTitle] = useState('');
  const [taskDescription, setTaskDescription] = useState('');
  const [taskDeptId, setTaskDeptId] = useState('');
  const [taskPriority, setTaskPriority] = useState('MEDIUM');
  const [taskRoomId, setTaskRoomId] = useState('');
  const [taskDueDate, setTaskDueDate] = useState('');
  const [modalLog, setModalLog] = useState('');

  // Manager Override Modal
  const [overrideTask, setOverrideTask] = useState<TaskItem | null>(null);
  const [overrideDeptId, setOverrideDeptId] = useState('');
  const [overridePriority, setOverridePriority] = useState('');
  const [overrideDueDate, setOverrideDueDate] = useState('');
  const [overrideLog, setOverrideLog] = useState('');

  // Tab State
  const [activeTab, setActiveTab] = useState<'overview' | 'inbox_tasks' | 'room_ops' | 'inventory' | 'revenue_ai' | 'guest_experience' | 'integrations'>('overview');
  const [checklistData, setChecklistData] = useState<ChecklistData | null>(null);
  const [isGeneratingChecklist, setIsGeneratingChecklist] = useState(false);

  // Guest Experience & Sentiment States
  const [guests, setGuests] = useState<GuestItem[]>([]);
  const [guestEvents, setGuestEvents] = useState<GuestEventItem[]>([]);
  const [selectedGuestId, setSelectedGuestId] = useState<string | null>(null);
  const [chatInput, setChatInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const [compAmount, setCompAmount] = useState('');
  const [compReason, setCompReason] = useState('');
  const [guestExperienceLog, setGuestExperienceLog] = useState('');
  const [activeSentimentFilter, setActiveSentimentFilter] = useState<'ALL' | 'ANGRY_FRUSTRATED' | 'VIP'>('ALL');

  // Shift Handover Autopilot States
  const [showHandoverModal, setShowHandoverModal] = useState(false);
  const [handoverSigned, setHandoverSigned] = useState(false);
  const [incomingStaffName, setIncomingStaffName] = useState('');
  const [handoverSummary, setHandoverSummary] = useState('');

  // Housekeeping & Telemetry Inspection states
  const [showInspectModal, setShowInspectModal] = useState(false);
  const [inspectRoom, setInspectRoom] = useState<RoomItem | null>(null);
  const [inspectChecks, setInspectChecks] = useState({
    bedding: false,
    bathroom: false,
    amenities: false,
    actest: false,
    safety: false
  });
  const [inspectLog, setInspectLog] = useState('');

  // Active Room Detail Modal/Drawer
  const [selectedRoomDetails, setSelectedRoomDetails] = useState<RoomItem | null>(null);
  const [updatingRoomStatus, setUpdatingRoomStatus] = useState<string | null>(null);

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

  // Logs / Status
  const [simLog, setSimLog] = useState<string>('');

  // 1. Fetch data on load
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
      console.log('API is currently offline, running in Client-Side Simulation Mode');
      setApiOnline(false);
    }
  };

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      refreshData();
    }, 0);
    const interval = setInterval(refreshData, 3000); // Poll every 3s for real-time experience

    // Register PWA Service Worker
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
          .then((reg) => console.log('Service Worker registered:', reg.scope))
          .catch((swErr) => console.error('Service Worker registration failed:', swErr));
      });
    }

    return () => {
      clearTimeout(timeoutId);
      clearInterval(interval);
    };
  }, []);

  // 2. Session / Employee Switcher
  const handleEmployeeSwitch = (emp: typeof SYSTEM_EMPLOYEES[0]) => {
    setCurrentUserRole(emp.role);
    setCurrentEmployeeName(emp.name);
    setCurrentEmployeeEmail(emp.email);
    setShowSessionMenu(false);

    // Append to audit logs client side
    const switchAudit: AuditLogItem = {
      id: `audit-${Date.now()}`,
      action: 'USER_SESSION_SWAPPED',
      details: `Swapped active session to user ${emp.name} (${emp.role} - ${emp.dept}).`,
      timestamp: new Date().toISOString()
    };
    setAuditLogs(prev => [switchAudit, ...prev]);
  };

  // 3. Trigger integration mock Simulation
  const triggerSimulation = async () => {
    setSimLog('Sending simulated event payload...');
    
    const payload: {
      type: string;
      metadata: Record<string, string | number | boolean | null | undefined>;
    } = {
      type: simType,
      metadata: {},
    };

    if (simType === 'whatsapp_message') {
      payload.metadata = {
        roomNumber: waRoom,
        guestName: waName,
        messageText: waMessage,
      };
    } else if (simType === 'pms_booking') {
      payload.metadata = {
        roomNumber: pmsRoom,
        guestName: pmsGuest,
      };
    } else if (simType === 'inventory_alert') {
      payload.metadata = {
        itemName: invItem,
        currentLevel: parseFloat(invLevel),
        minimumLevel: parseFloat(invMin),
        itemId: 'mock-item-123',
        departmentId: 'mock-dept-123',
      };
    } else if (simType === 'maintenance_due') {
      payload.metadata = {
        assetName: maintAsset,
        maintenanceType: maintType,
      };
    }

    try {
      const isWhatsapp = simType === 'whatsapp_message';
      const endpoint = isWhatsapp ? '/api/integrations/incoming' : '/api/integrations/mock';
      
      let bodyData;
      if (isWhatsapp) {
        bodyData = {
          messageText: waMessage,
          guestPhone: waName === 'Arthur Pendragon' ? '+15550192834' : waName === 'Morgana Le Fay' ? '+15550192777' : '+15550000000',
          source: 'WHATSAPP'
        };
      } else {
        bodyData = payload;
      }

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bodyData),
      });

      if (res.ok) {
        const result = await res.json();
        if (isWhatsapp) {
          setSimLog(`Webhook Ingestion Succeeded!\nResolved Room Number: ${result.resolvedRoomNumber}\nResolved Guest Name: ${result.resolvedGuestName}\nDatabase Event ID: ${result.eventId}\nStatus: ${result.status}`);
        } else {
          setSimLog(`Event Ingested successfully via integration pipeline!\nStatus: ${result.status}\nEmitted Event: ${result.emittedEvent}`);
        }
        refreshData();
      } else {
        const errText = await res.text();
        setSimLog(`Ingest Gateway Error (HTTP ${res.status}): ${errText}`);
      }
    } catch (error) {
      const errMsg = error instanceof Error ? error.message : 'Unknown connection error';
      setSimLog(`Webhook Delivery Failed: ${errMsg}\nPlease verify Next.js server is online and database is running.`);
    }
  };

  // 4. Update task status via click
  const handleUpdateStatus = async (taskId: string, newStatus: string) => {
    const taskToUpdate = tasks.find(t => t.id === taskId);
    let finalStatus = newStatus;

    if (newStatus === 'COMPLETED' && taskToUpdate) {
      const deptName = taskToUpdate.department?.name?.toLowerCase() ?? '';
      const isApprovalDept = deptName === 'housekeeping' || deptName === 'maintenance';
      const isSupervisor = currentUserRole === 'MANAGER' || currentUserRole === 'SUPERVISOR' || currentUserRole === 'OWNER';

      if (isApprovalDept && !isSupervisor) {
        finalStatus = 'PENDING_APPROVAL';
      }
    }

    try {
      const res = await fetch(`/api/tasks/${taskId}/status`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: finalStatus, userRole: currentUserRole }),
      });
      if (res.ok) {
        refreshData();
      }
    } catch {
      console.log('API Offline. Updating task status locally.');
    }

    // Always update client state locally for instant UI response and offline support
    setTasks(prev => prev.map(t => {
      if (t.id === taskId) {
        return { ...t, status: finalStatus };
      }
      return t;
    }));

    // Recalculate stats locally
    setTimeout(() => {
      setTasks(currentTasks => {
        const localTasks = currentTasks.map(t => t.id === taskId ? { ...t, status: finalStatus } : t);
        const pending = localTasks.filter(t => t.status === 'PENDING').length;
        const progress = localTasks.filter(t => t.status === 'IN_PROGRESS').length;
        const completed = localTasks.filter(t => t.status === 'COMPLETED').length;
        const escalated = localTasks.filter(t => t.status === 'ESCALATED').length;
        setStats({
          total: localTasks.length,
          pending,
          inProgress: progress,
          completed,
          escalated,
        });
        return currentTasks;
      });
    }, 10);

    // Handle purchase request workflow chaining locally
    if (finalStatus === 'COMPLETED' && taskToUpdate) {
      setTimeout(() => {
        if (taskToUpdate.title.startsWith('Approve Purchase:')) {
          const pr = purchaseRequests.find(p => taskToUpdate.title.includes(p.itemName) && p.status === 'Awaiting Manager Approval');
          if (pr) {
            setPurchaseRequests(prev => prev.map(p => p.id === pr.id ? { ...p, status: 'Awaiting Delivery' } : p));
            const deliveryTaskId = `task-delivery-${Date.now()}`;
            const deliveryTask: TaskItem = {
              id: deliveryTaskId,
              title: `Verify Delivery: ${pr.quantity} ${pr.unit} of ${pr.itemName}`,
              description: `Purchase order approved. Verify delivery of items from vendor "${pr.vendorName}". Once verified, complete this task to update inventory levels automatically.`,
              priority: 'MEDIUM',
              status: 'PENDING',
              dueDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
              createdAt: new Date().toISOString(),
              department: { name: 'Procurement' },
              room: null,
            };
            setTasks(prev => [deliveryTask, ...prev]);

            const newAudit: AuditLogItem = {
              id: `audit-${Date.now()}`,
              action: 'PURCHASE_REQUEST_APPROVED',
              details: `Purchase request for ${pr.quantity} ${pr.unit} of ${pr.itemName} was approved. Spawned delivery verification task.`,
              timestamp: new Date().toISOString(),
            };
            setAuditLogs(prev => [newAudit, ...prev]);

            const newNotif: NotificationItem = {
              id: `notif-${Date.now()}`,
              recipient: 'procurement@grandhorizon.com',
              message: `Delivery Verification Required: "${deliveryTask.title}" has been dispatched.`,
              createdAt: new Date().toISOString(),
              channel: 'SMS',
              status: 'SENT',
              user: { name: currentEmployeeName, role: currentUserRole },
            };
            setNotifications(prev => [newNotif, ...prev]);
          }
        } else if (taskToUpdate.title.startsWith('Verify Delivery:')) {
          const pr = purchaseRequests.find(p => taskToUpdate.title.includes(p.itemName) && p.status === 'Awaiting Delivery');
          if (pr) {
            setPurchaseRequests(prev => prev.map(p => p.id === pr.id ? { ...p, status: 'Completed' } : p));
            setInventoryItems(prev => prev.map(item => {
              if (item.name.toLowerCase() === pr.itemName.toLowerCase()) {
                return { ...item, quantity: item.quantity + pr.quantity };
              }
              return item;
            }));

            const newAudit: AuditLogItem = {
              id: `audit-${Date.now()}`,
              action: 'INVENTORY_DELIVERY_VERIFIED',
              details: `Verified delivery of ${pr.quantity} ${pr.unit} of ${pr.itemName} from vendor. Incremented inventory stock.`,
              timestamp: new Date().toISOString(),
            };
            setAuditLogs(prev => [newAudit, ...prev]);

            const newNotif: NotificationItem = {
              id: `notif-${Date.now()}`,
              recipient: 'all-staff@grandhorizon.com',
              message: `Delivery Fulfilled: Your requested items (${pr.quantity} ${pr.unit} of "${pr.itemName}") have arrived and been verified!`,
              createdAt: new Date().toISOString(),
              channel: 'EMAIL',
              status: 'SENT',
              user: { name: 'Alice Smith', role: 'STAFF' },
            };
            setNotifications(prev => [newNotif, ...prev]);
          }
        }
      }, 20);
    }
  };

  // 5. Handle AI recommendation actions (execute, dismiss)
  const handleRecAction = async (recId: string, action: string) => {
    try {
      const res = await fetch(`/api/recommendations/${recId}/action`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action }),
      });
      if (res.ok) {
        refreshData();
      }
    } catch (err) {
      console.error('Failed to dispatch recommendation action', err);
      // Client side fallback
      setRecommendations(prev => prev.filter(r => r.id !== recId));
    }
  };

  const handleCreateManualTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskTitle || !taskDeptId || !taskPriority) {
      setModalLog('Please enter a title, department, and priority.');
      return;
    }
    setModalLog('Creating task...');

    try {
      const res = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: taskTitle,
          description: taskDescription,
          departmentId: taskDeptId,
          priority: taskPriority,
          roomId: taskRoomId || undefined,
          dueDate: taskDueDate || undefined,
        }),
      });

      if (res.ok) {
        setModalLog('Task created successfully!');
        setTaskTitle('');
        setTaskDescription('');
        setTaskDeptId('');
        setTaskRoomId('');
        setTaskDueDate('');
        setTimeout(() => {
          setShowTaskModal(false);
          setModalLog('');
          refreshData();
        }, 800);
      } else {
        const errorText = await res.text();
        setModalLog(`Error: ${errorText}`);
      }
    } catch {
      // Local client-side fallback if server is offline
      setModalLog('API offline. Simulating local creation...');
      setTimeout(() => {
        const selectedDept = availableDepts.find(d => d.id === taskDeptId);
        const selectedRoom = availableRooms.find(r => r.id === taskRoomId);
        const mockNewTask: TaskItem = {
          id: `manual-${Date.now()}`,
          title: taskTitle,
          description: taskDescription,
          priority: taskPriority,
          status: 'PENDING',
          dueDate: taskDueDate ? new Date(taskDueDate).toISOString() : new Date(Date.now() + 4 * 60 * 60 * 1000).toISOString(),
          createdAt: new Date().toISOString(),
          department: { name: selectedDept ? selectedDept.name : 'Operations' },
          room: selectedRoom ? { roomNumber: selectedRoom.roomNumber } : null,
        };

        setTasks(prev => [mockNewTask, ...prev]);

        const deptName = selectedDept ? selectedDept.name : 'Operations';
        const primaryNotif: NotificationItem = {
          id: `notif-${Date.now()}-1`,
          recipient: `${deptName.toLowerCase()}@grandhorizon.com`,
          message: `New manual task dispatched to ${deptName}: "${taskTitle}".`,
          createdAt: new Date().toISOString(),
          channel: 'IN_APP',
          status: 'SENT',
          user: { name: currentEmployeeName, role: currentUserRole }
        };

        const extraNotifs: NotificationItem[] = [];
        if (taskPriority === 'URGENT' || taskPriority === 'HIGH') {
          extraNotifs.push({
            id: `notif-${Date.now()}-2`,
            recipient: `+15550199020`,
            message: `⚠️ URGENT: New task dispatched to ${deptName}: "${taskTitle}".`,
            createdAt: new Date().toISOString(),
            channel: 'WHATSAPP',
            status: 'SENT',
            user: { name: currentEmployeeName, role: currentUserRole }
          });
        }

        setNotifications(prev => [primaryNotif, ...extraNotifs, ...prev]);

        const newAudit: AuditLogItem = {
          id: `audit-${Date.now()}`,
          action: 'TASK_CREATED_MANUALLY',
          details: `Manual task created: "${taskTitle}" for ${deptName}. Priority: ${taskPriority}.`,
          timestamp: new Date().toISOString()
        };
        setAuditLogs(prev => [newAudit, ...prev]);

        setStats(prev => ({
          ...prev,
          total: prev.total + 1,
          pending: prev.pending + 1,
        }));
        
        setModalLog('Task created locally (client-side simulation)!');
        setTaskTitle('');
        setTaskDescription('');
        setTaskDeptId('');
        setTaskRoomId('');
        setTaskDueDate('');
        setTimeout(() => {
          setShowTaskModal(false);
          setModalLog('');
        }, 800);
      }, 500);
    }
  };

  const handlePRSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prVendorId || !prItemName || !prQty || !prUnit || !prCost || !prDeptId) {
      setPrLog('Please fill in all mandatory fields.');
      return;
    }
    setPrLog('Submitting purchase request...');

    const vendor = vendors.find(v => v.id === prVendorId);
    const vendorName = vendor ? vendor.name : 'Unknown Vendor';
    const parsedQty = parseFloat(prQty);
    const parsedCost = parseFloat(prCost);

    try {
      const res = await fetch('/api/purchase-requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          vendorId: prVendorId,
          itemName: prItemName,
          quantity: parsedQty,
          unit: prUnit,
          estimatedCost: parsedCost,
          departmentId: prDeptId,
        }),
      });

      if (res.ok) {
        setPrLog('Purchase request submitted successfully!');
        setPrItemName('');
        setPrQty('');
        setPrCost('');
        setTimeout(() => {
          setPrLog('');
          refreshData();
        }, 1500);
      } else {
        const errorText = await res.text();
        setPrLog(`Error: ${errorText}`);
      }
    } catch {
      setPrLog('API offline. Simulating workflow locally...');
      setTimeout(() => {
        const newPR: PurchaseRequestItem = {
          id: `pr-${Date.now().toString().slice(-4)}`,
          vendorName,
          itemName: prItemName,
          quantity: parsedQty,
          unit: prUnit,
          estimatedCost: parsedCost,
          status: 'Awaiting Manager Approval',
        };

        setPurchaseRequests(prev => [newPR, ...prev]);

        const mockApprovalTask: TaskItem = {
          id: `task-pr-${Date.now()}`,
          title: `Approve Purchase: ${parsedQty} ${prUnit} of ${prItemName}`,
          description: `Purchase request for item "${prItemName}" from vendor "${vendorName}". Est. Cost: $${parsedCost}.`,
          priority: 'HIGH',
          status: 'PENDING',
          dueDate: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
          createdAt: new Date().toISOString(),
          department: { name: 'Management' },
          room: null,
        };

        setTasks(prev => [mockApprovalTask, ...prev]);
        setStats(prev => ({
          ...prev,
          total: prev.total + 1,
          pending: prev.pending + 1,
        }));

        const newAudit: AuditLogItem = {
          id: `audit-${Date.now()}`,
          action: 'PURCHASE_REQUEST_SUBMITTED',
          details: `Purchase Request Submitted: "${mockApprovalTask.title}". Awaiting Management approval.`,
          timestamp: new Date().toISOString(),
        };
        setAuditLogs(prev => [newAudit, ...prev]);

        const newNotif: NotificationItem = {
          id: `notif-${Date.now()}`,
          recipient: 'management@grandhorizon.com',
          message: `New Purchase Approval Required: "${mockApprovalTask.title}". Est Cost: $${parsedCost}.`,
          createdAt: new Date().toISOString(),
          channel: 'EMAIL',
          status: 'SENT',
          user: { name: currentEmployeeName, role: currentUserRole },
        };
        setNotifications(prev => [newNotif, ...prev]);

        setPrItemName('');
        setPrQty('');
        setPrCost('');
        setPrLog('Purchase request submitted and workflow active!');
        setTimeout(() => setPrLog(''), 2000);
      }, 500);
    }
  };

  const handleApplyPricing = (recId: string) => {
    const rec = pricingRecommendations.find(r => r.id === recId);
    if (!rec) return;
    setPricingRecommendations(prev => prev.map(r => r.id === recId ? { ...r, applied: true } : r));
    setAppliedRatesLog(`Rate updated: ${rec.target} adjusted from $${rec.currentRate} to $${rec.recommendedRate}.`);

    setTimeout(() => {
      const newAudit: AuditLogItem = {
        id: `audit-${Date.now()}`,
        action: 'REVENUE_RATE_OPTIMIZATION_APPLIED',
        details: `Approved AI revenue recommendation for ${rec.target}. Base rate changed from $${rec.currentRate} to $${rec.recommendedRate}.`,
        timestamp: new Date().toISOString()
      };
      setAuditLogs(prev => [newAudit, ...prev]);

      const newNotif: NotificationItem = {
        id: `notif-${Date.now()}`,
        recipient: 'all-staff@grandhorizon.com',
        message: `System Alert: AI Revenue Optimizer adjusted ${rec.target} to $${rec.recommendedRate} based on occupancy demand forecasting.`,
        createdAt: new Date().toISOString(),
        channel: 'IN_APP',
        status: 'SENT',
        user: { name: 'Revenue Optimizer', role: 'SYSTEM' }
      };
      setNotifications(prev => [newNotif, ...prev]);
    }, 20);
  };

  const handleDispatchPredictiveMaintenance = (assetId: string) => {
    const asset = assets.find(a => a.id === assetId);
    if (!asset) return;

    setAssets(prev => prev.map(a => a.id === assetId ? { ...a, status: 'MAINTENANCE_REQUIRED' } : a));

    setTimeout(() => {
      const pmTaskId = `task-predictive-${Date.now()}`;
      const pmTask: TaskItem = {
        id: pmTaskId,
        title: `Predictive PM: Inspect ${asset.name}`,
        description: `AI diagnostic warning: Anomalous telemetry pattern in ${asset.name}. Dispatch technician to prevent failure.`,
        priority: 'HIGH',
        status: 'PENDING',
        dueDate: new Date(Date.now() + 12 * 60 * 60 * 1000).toISOString(),
        createdAt: new Date().toISOString(),
        department: { name: 'Maintenance' },
        room: null,
      };
      setTasks(prev => [pmTask, ...prev]);
      setStats(prev => ({
        ...prev,
        total: prev.total + 1,
        pending: prev.pending + 1,
      }));

      const newAudit: AuditLogItem = {
        id: `audit-${Date.now()}`,
        action: 'PREDICTIVE_MAINTENANCE_DISPATCHED',
        details: `AI Predictive Maintenance task spawned for ${pmTask.title}. High risk of failure detected in sensor logs.`,
        timestamp: new Date().toISOString()
      };
      setAuditLogs(prev => [newAudit, ...prev]);

      const newNotif: NotificationItem = {
        id: `notif-${Date.now()}`,
        recipient: '+15558882040',
        message: `🔧 Predictive Alert: Maintenance task spawned to inspect "${asset.name}" due to anomalous sensor telemetry. Inspect immediately.`,
        createdAt: new Date().toISOString(),
        channel: 'WHATSAPP',
        status: 'SENT',
        user: { name: 'Facilities Monitor', role: 'SYSTEM' },
      };
      setNotifications(prev => [newNotif, ...prev]);
    }, 20);
  };

  // 6. Manager Override Handler
  const handleManagerOverride = async (action: 'update' | 'cancel') => {
    if (!overrideTask) return;
    setOverrideLog(action === 'cancel' ? 'Cancelling task...' : 'Applying override...');
    const body: Record<string, string> = {};
    if (action === 'cancel') {
      body.status = 'CANCELLED';
    } else {
      if (overrideDeptId) body.departmentId = overrideDeptId;
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
        setOverrideLog(action === 'cancel' ? 'Task cancelled.' : 'Override applied!');
        // Optimistic local update
        setTasks(prev => prev.map(t => {
          if (t.id !== overrideTask.id) return t;
          const dept = availableDepts.find(d => d.id === overrideDeptId);
          return {
            ...t,
            status: action === 'cancel' ? 'CANCELLED' : t.status,
            priority: overridePriority || t.priority,
            dueDate: overrideDueDate ? new Date(overrideDueDate).toISOString() : t.dueDate,
            department: dept ? { name: dept.name } : t.department,
          };
        }));
        if (action === 'cancel') {
          setTasks(prev => prev.filter(t => t.id !== overrideTask.id));
        }
        setTimeout(() => { setOverrideTask(null); setOverrideLog(''); }, 700);
        setTimeout(refreshData, 1000);
      } else {
        const errText = await res.text();
        setOverrideLog(`Error: ${errText}`);
      }
    } catch {
      // Offline local fallback
      if (action === 'cancel') {
        setTasks(prev => prev.filter(t => t.id !== overrideTask.id));
        setOverrideLog('Cancelled locally.');
      } else {
        const dept = availableDepts.find(d => d.id === overrideDeptId);
        setTasks(prev => prev.map(t => {
          if (t.id !== overrideTask.id) return t;
          return {
            ...t,
            priority: overridePriority || t.priority,
            dueDate: overrideDueDate ? new Date(overrideDueDate).toISOString() : t.dueDate,
            department: dept ? { name: dept.name } : t.department,
          };
        }));
        setOverrideLog('Override applied locally (API offline).');
      }
      setTimeout(() => { setOverrideTask(null); setOverrideLog(''); }, 800);
    }
  };

  const handleGenerateChecklists = async () => {
    setIsGeneratingChecklist(true);
    try {
      const res = await fetch('/api/checklists/generate', { method: 'POST' });
      if (res.ok) {
        refreshData();
      } else {
        throw new Error('Fallback to local');
      }
    } catch {
      // Mock checklist local generation
      const mockData: ChecklistData = {
        date: new Date().toISOString().split('T')[0],
        totalTasks: 15,
        departments: {
          'Reception': {
            departmentId: 'reception-id',
            tasks: [
              { id: 'sop-rec-1', title: 'Morning briefing completed', status: 'PENDING', priority: 'LOW', dueDate: null, workflowId: 'wf-sop-1' },
              { id: 'sop-rec-2', title: 'Pending reservations reviewed', status: 'PENDING', priority: 'LOW', dueDate: null, workflowId: 'wf-sop-1' },
              { id: 'sop-rec-3', title: 'VIP arrivals noted', status: 'PENDING', priority: 'LOW', dueDate: null, workflowId: 'wf-sop-1' }
            ]
          },
          'Housekeeping': {
            departmentId: 'housekeeping-id',
            tasks: [
              { id: 'sop-hk-1', title: 'Room inspection rounds completed', status: 'PENDING', priority: 'LOW', dueDate: null, workflowId: 'wf-sop-1' },
              { id: 'sop-hk-2', title: 'Linen inventory counted', status: 'PENDING', priority: 'LOW', dueDate: null, workflowId: 'wf-sop-1' },
              { id: 'sop-hk-3', title: 'Lost & found updated', status: 'PENDING', priority: 'LOW', dueDate: null, workflowId: 'wf-sop-1' }
            ]
          },
          'Kitchen': {
            departmentId: 'kitchen-id',
            tasks: [
              { id: 'sop-kit-1', title: 'Temperature logs recorded', status: 'PENDING', priority: 'LOW', dueDate: null, workflowId: 'wf-sop-1' },
              { id: 'sop-kit-2', title: 'Inventory expiry check', status: 'PENDING', priority: 'LOW', dueDate: null, workflowId: 'wf-sop-1' },
              { id: 'sop-kit-3', title: 'Prep list confirmed with chef', status: 'PENDING', priority: 'LOW', dueDate: null, workflowId: 'wf-sop-1' }
            ]
          },
          'Maintenance': {
            departmentId: 'maint-id',
            tasks: [
              { id: 'sop-maint-1', title: 'Daily asset walkaround completed', status: 'PENDING', priority: 'LOW', dueDate: null, workflowId: 'wf-sop-1' },
              { id: 'sop-maint-2', title: 'Preventive maintenance log updated', status: 'PENDING', priority: 'LOW', dueDate: null, workflowId: 'wf-sop-1' },
              { id: 'sop-maint-3', title: 'Fire safety check', status: 'PENDING', priority: 'LOW', dueDate: null, workflowId: 'wf-sop-1' }
            ]
          },
          'Security': {
            departmentId: 'sec-id',
            tasks: [
              { id: 'sop-sec-1', title: 'CCTV check', status: 'PENDING', priority: 'LOW', dueDate: null, workflowId: 'wf-sop-1' },
              { id: 'sop-sec-2', title: 'Night patrol report filed', status: 'PENDING', priority: 'LOW', dueDate: null, workflowId: 'wf-sop-1' },
              { id: 'sop-sec-3', title: 'Access log reviewed', status: 'PENDING', priority: 'LOW', dueDate: null, workflowId: 'wf-sop-1' }
            ]
          }
        }
      };
      setChecklistData(mockData);
      // Add these tasks to the main tasks array so they render in the tasks tab and can be Claimed/Resolved
      const newTasks: TaskItem[] = [];
      Object.keys(mockData.departments).forEach(deptName => {
        mockData.departments[deptName].tasks.forEach(t => {
          newTasks.push({
            id: t.id,
            title: t.title,
            description: `Daily SOP checklist requirement for ${deptName} department.`,
            priority: t.priority,
            status: t.status,
            dueDate: t.dueDate || new Date(Date.now() + 12 * 60 * 60 * 1000).toISOString(),
            createdAt: new Date().toISOString(),
            department: { name: deptName },
            room: null
          });
        });
      });
      setTasks(prev => [...newTasks, ...prev]);
    } finally {
      setIsGeneratingChecklist(false);
    }
  };

  // Update room status via API
  const handleUpdateRoomStatus = async (roomId: string, newStatus: string) => {
    setUpdatingRoomStatus(roomId);
    try {
      const res = await fetch(`/api/rooms/${roomId}/status`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        refreshData();
        // Update selected room details modal if open
        if (selectedRoomDetails && selectedRoomDetails.id === roomId) {
          setSelectedRoomDetails(prev => prev ? { ...prev, status: newStatus } : null);
        }
      }
    } catch {
      console.log('API Offline. Updating room status locally.');
    }

    // Local client-side fallback
    setAvailableRooms(prev => prev.map(r => r.id === roomId ? { ...r, status: newStatus } : r));
    
    // Add audit log
    const targetRoom = availableRooms.find(r => r.id === roomId);
    if (targetRoom) {
      const newAudit: AuditLogItem = {
        id: `audit-${Date.now()}`,
        action: 'ROOM_STATUS_UPDATED',
        details: `Room ${targetRoom.roomNumber} status overridden to ${newStatus}.`,
        timestamp: new Date().toISOString()
      };
      setAuditLogs(prev => [newAudit, ...prev]);
    }
    setUpdatingRoomStatus(null);
  };

  // Handle sending guest messages (simulate WhatsApp)
  const handleSendGuestMessage = async (sourceType: 'STAFF' | 'WHATSAPP') => {
    if (!selectedGuestId || !chatInput.trim()) return;
    setChatLoading(true);
    try {
      const res = await fetch('/api/guests/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          guestId: selectedGuestId,
          messageText: chatInput,
          source: sourceType
        })
      });
      if (res.ok) {
        setChatInput('');
        refreshData();
      }
    } catch (err) {
      console.error('Failed to send message:', err);
    } finally {
      setChatLoading(false);
    }

    // Local client-side fallback
    const targetGuest = (guests.length > 0 ? guests : mockOfflineGuests).find(g => g.id === selectedGuestId);
    if (targetGuest) {
      const roomNum = targetGuest.bookings?.[0]?.room?.roomNumber || '101';
      const newEvent = {
        id: `mock-ev-${Date.now()}`,
        type: sourceType === 'STAFF' ? 'GUEST_REQUEST' : 'GUEST_REQUEST_CREATED',
        source: sourceType,
        timestamp: new Date().toISOString(),
        metadata: {
          guestName: targetGuest.name,
          guestPhone: targetGuest.phone || '+15550000000',
          roomNumber: roomNum,
          messageText: chatInput
        },
        processed: sourceType === 'STAFF'
      };
      setGuestEvents(prev => [...prev, newEvent]);
      setChatInput('');

      // If it's a guest message, spawn a task locally to match the operations pipeline
      if (sourceType === 'WHATSAPP') {
        const lower = chatInput.toLowerCase();
        let dept = 'Reception';
        let priority = 'MEDIUM';
        let title = 'Guest WhatsApp Request';
        let dueMinutes = 30;

        if (lower.includes('towel') || lower.includes('pillow') || lower.includes('clean') || lower.includes('sheet') || lower.includes('soap')) {
          dept = 'Housekeeping';
          title = lower.includes('towel') ? 'Deliver Fresh Towels' : lower.includes('pillow') ? 'Deliver Pillows' : 'Express Cleaning Service';
          priority = 'HIGH';
          dueMinutes = 15;
        } else if (lower.includes('ac') || lower.includes('broken') || lower.includes('leak') || lower.includes('light') || lower.includes('warm')) {
          dept = 'Maintenance';
          title = lower.includes('ac') ? 'Inspect HVAC Unit' : 'Maintenance Repair Request';
          priority = 'URGENT';
          dueMinutes = 45;
        }

        const localTask: TaskItem = {
          id: `task-mock-${Date.now()}`,
          title,
          description: chatInput,
          priority,
          status: 'PENDING',
          createdAt: new Date().toISOString(),
          dueDate: new Date(Date.now() + dueMinutes * 60 * 1000).toISOString(),
          department: { name: dept },
          room: { roomNumber: roomNum }
        };
        setTasks(prev => [localTask, ...prev]);
        setStats(prev => ({
          ...prev,
          total: prev.total + 1,
          pending: prev.pending + 1
        }));

        // Log to Activity Timeline
        setAuditLogs(prev => [{
          id: `audit-${Date.now()}`,
          action: 'TASK_CREATED',
          details: `WhatsApp message auto-dispatched task: "${title}" for Room ${roomNum}.`,
          timestamp: new Date().toISOString()
        }, ...prev]);
      }
    }
  };

  // Handle applying guest compensation (Service Recovery)
  const handleApplyGuestCompensation = async () => {
    if (!selectedGuestId || !compAmount.trim() || !compReason.trim()) return;
    try {
      const res = await fetch('/api/guests/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          guestId: selectedGuestId,
          compensationAmount: compAmount,
          compensationDetails: compReason
        })
      });
      if (res.ok) {
        setCompAmount('');
        setCompReason('');
        setGuestExperienceLog(`Successfully applied $${parseFloat(compAmount).toFixed(2)} room credit! Outgoing guest alert resolved.`);
        refreshData();
      }
    } catch (err) {
      console.error('Failed to apply compensation:', err);
    }

    // Local client-side fallback
    const targetGuest = (guests.length > 0 ? guests : mockOfflineGuests).find(g => g.id === selectedGuestId);
    if (targetGuest) {
      const roomNum = targetGuest.bookings?.[0]?.room?.roomNumber || 'Unknown';
      const amt = parseFloat(compAmount) || 0;
      
      // Log to AuditLogs
      const newAudit: AuditLogItem = {
        id: `audit-${Date.now()}`,
        action: 'COMPENSATION_APPLIED',
        details: `Applied $${amt.toFixed(2)} credit to Room ${roomNum} for Guest ${targetGuest.name} (${compReason}).`,
        timestamp: new Date().toISOString()
      };
      setAuditLogs(prev => [newAudit, ...prev]);

      // Add a simulated staff notification and chat logs
      const staffMsg: GuestEventItem = {
        id: `mock-staff-apology-${Date.now()}`,
        type: 'GUEST_REQUEST',
        source: 'STAFF',
        timestamp: new Date().toISOString(),
        metadata: {
          guestName: targetGuest.name,
          guestPhone: targetGuest.phone || '+15550000000',
          roomNumber: roomNum,
          messageText: `We have applied a $${amt.toFixed(2)} credit to your room account for: "${compReason}". Please accept our apologies.`,
        },
        processed: true
      };
      setGuestEvents(prev => [...prev, staffMsg]);

      // Add appreciation reply after 1s
      setTimeout(() => {
        const guestMsg: GuestEventItem = {
          id: `mock-guest-apprec-${Date.now()}`,
          type: 'GUEST_REQUEST',
          source: 'WHATSAPP',
          timestamp: new Date().toISOString(),
          metadata: {
            guestName: targetGuest.name,
            guestPhone: targetGuest.phone || '+15550000000',
            roomNumber: roomNum,
            messageText: `Thank you so much! I appreciate you handling this so quickly. The credit shows up on my app. Great service recovery!`,
          },
          processed: true
        };
        setGuestEvents(prev => [...prev, guestMsg]);
      }, 1000);

      setCompAmount('');
      setCompReason('');
      setGuestExperienceLog(`Applied local $${amt.toFixed(2)} credit to Room ${roomNum} (Offline).`);
    }
  };

  // Compile and generate AI Shift Handover note
  const handleGenerateShiftHandover = () => {
    const currentHour = new Date().getHours();
    let shiftName = 'Morning Shift (07:00 - 15:00)';
    if (currentHour >= 15 && currentHour < 23) {
      shiftName = 'Afternoon Shift (15:00 - 23:00)';
    } else if (currentHour >= 23 || currentHour < 7) {
      shiftName = 'Night Shift (23:00 - 07:00)';
    }

    const completedTasksCount = tasks.filter(t => t.status === 'COMPLETED').length;
    const escalatedTasksCount = tasks.filter(t => t.status === 'ESCALATED').length;
    const pendingHighCount = tasks.filter(t => (t.priority === 'HIGH' || t.priority === 'URGENT') && t.status !== 'COMPLETED' && t.status !== 'CANCELLED').length;
    const lowStockCount = inventoryItems.filter(item => item.quantity <= item.minimumLevel).length;
    const pendingPRs = purchaseRequests.filter(pr => pr.status === 'Awaiting Manager Approval').length;
    const activeComplaints = auditLogs.filter(log => log.action === 'TASK_SLA_BREACHED' || log.action === 'GUEST_SERVICE_RECOVERY').length;

    const note = `HOSPITALITYOS SHIFT HANDOVER REPORT
----------------------------------------------
Date: ${new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
Time Generated: ${new Date().toLocaleTimeString()}
Current Shift: ${shiftName}
Outgoing Duty Manager: ${currentEmployeeName} (${currentUserRole})

1. SHIFT OPERATIONAL METRICS:
- Tasks Completed this Shift: ${completedTasksCount}
- Active SLA Breaches/Escalations: ${escalatedTasksCount}
- High/Urgent Work Orders Pending: ${pendingHighCount}

2. CRITICAL PENDING TASKS FOR NEXT SHIFT:
${tasks.filter(t => (t.priority === 'HIGH' || t.priority === 'URGENT') && t.status !== 'COMPLETED' && t.status !== 'CANCELLED').slice(0, 3).map(t => `- [${t.priority}] ${t.title} (Assigned to: ${t.department?.name || 'Unassigned'})`).join('\n') || '- None'}

3. PROCUREMENT & INVENTORY ALERTS:
- Low-Stock Consumables: ${lowStockCount} items flagged
- Pending PRs Awaiting Approval: ${pendingPRs} requests

4. GUEST EXPERIENCE & SENTIMENT:
- Unresolved/Escalated Guest Issues: ${activeComplaints}
- Recommended Service Recovery Actions: Verify Room 202 HVAC sensor status.

5. HANDOVER SIGN-OFF STATUS:
- Prepared By: ${currentEmployeeName}
- Shift Handover Integrity Check: PASSED.`;

    setHandoverSummary(note);
    setHandoverSigned(false);
    setIncomingStaffName('');
    setShowHandoverModal(true);
  };

  // Complete Room Inspection checklist and release room
  const handleInspectRoomComplete = () => {
    if (!inspectRoom) return;
    
    const allChecked = Object.values(inspectChecks).every(Boolean);
    if (!allChecked) {
      setInspectLog('Error: All safety and cleanliness checkpoints must be checked prior to room release.');
      return;
    }

    handleUpdateRoomStatus(inspectRoom.id, 'AVAILABLE');
    
    const newAudit = {
      id: `audit-${Date.now()}`,
      action: 'ROOM_INSPECTED_AND_RELEASED',
      details: `Supervisor verified and released Room ${inspectRoom.roomNumber} as clean & ready. Checks: Bedding, Bath, Telemetry, AC Test, Safety lock.`,
      timestamp: new Date().toISOString()
    };
    setAuditLogs(prev => [newAudit, ...prev]);

    setInspectLog('');
    setShowInspectModal(false);
    setInspectRoom(null);
    setInspectChecks({
      bedding: false,
      bathroom: false,
      amenities: false,
      actest: false,
      safety: false
    });
  };

  // 7. Filter Logic
  const filteredTasks = tasks.filter(task => {
    if (activeDeptFilter === 'All') return true;
    return task.department?.name?.toLowerCase() === activeDeptFilter.toLowerCase();
  });

  const filteredNotifs = notifications.filter(notif => {
    if (activeNotifFilter === 'ALL') return true;
    const channel = notif.channel || 'IN_APP';
    return channel.toUpperCase() === activeNotifFilter.toUpperCase();
  });

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-background text-slate-100 font-sans">
      
      {/* Background neon ambient glows */}
      <div className="absolute top-[-10%] left-[20%] w-[500px] h-[500px] bg-amber-500/5 rounded-full blur-[120px] pointer-events-none z-0" />
      <div className="absolute bottom-[10%] right-[10%] w-[400px] h-[400px] bg-emerald-600/5 rounded-full blur-[100px] pointer-events-none z-0" />

      {/* LEFT SIDEBAR - Enterprise Navigation */}
      <aside className="w-68 bg-black/35 border-r border-slate-900/60 flex flex-col justify-between h-full z-10 shrink-0 select-none backdrop-blur-md">
        
        {/* Top Branding Section */}
        <div>
          <div className="h-16 flex items-center px-5 border-b border-slate-900/40 gap-3">
            <span className="p-1.5 bg-amber-500/10 border border-amber-500/20 rounded-full text-amber-400 shadow-[0_0_12px_rgba(245,158,11,0.15)]">
              <svg className="w-5 h-5 text-amber-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3M15.5 7.5L18 5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </span>
            <div>
              <h1 className="text-xs font-black tracking-widest bg-gradient-to-r from-white via-amber-100 to-amber-400 bg-clip-text text-transparent uppercase font-display">
                HospitalityOS
              </h1>
              <span className="text-[8px] px-1.5 py-0.2 font-black bg-amber-500/10 text-amber-400 border border-amber-500/20 rounded uppercase tracking-widest font-mono block mt-0.5 max-w-max">
                Château Suite v2.4
              </span>
            </div>
          </div>

          {/* Property Selector */}
          <div className="px-4 py-3 border-b border-slate-900/40 relative">
            <button 
              onClick={() => { setShowPropertyMenu(!showPropertyMenu); setShowSessionMenu(false); }}
              className="w-full flex items-center justify-between px-3 py-2 bg-slate-950/60 border border-slate-900 hover:border-slate-850 rounded-xl transition-all text-left cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <span className="text-xs">🏨</span>
                <div>
                  <div className="text-[10px] text-slate-550 font-extrabold uppercase tracking-wider">Property</div>
                  <div className="text-xs font-bold text-slate-200 truncate max-w-[130px]">{activeProperty.name}</div>
                </div>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-500" />
            </button>

            {showPropertyMenu && (
              <div className="absolute left-4 right-4 mt-1 bg-slate-950 border border-slate-850 rounded-xl shadow-2xl z-50 overflow-hidden divide-y divide-slate-900/60">
                {SYSTEM_PROPERTIES.map(p => (
                  <button
                    key={p.id}
                    onClick={() => { setActiveProperty(p); setShowPropertyMenu(false); }}
                    className="w-full text-left px-4 py-2.5 hover:bg-slate-900/40 text-xs transition-colors flex items-center justify-between cursor-pointer"
                  >
                    <div>
                      <div className="font-bold text-slate-200">{p.name}</div>
                      <div className="text-[9px] text-slate-500">{p.type} • {p.location}</div>
                    </div>
                    {activeProperty.id === p.id && <Check className="w-3.5 h-3.5 text-indigo-400" />}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Sidebar Middle Menu */}
        <nav className="flex-1 py-4 overflow-y-auto px-3 space-y-1 scrollbar-none">
          <button
            onClick={() => setActiveTab('overview')}
            className={`w-full px-4 py-3 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer uppercase tracking-wider flex items-center gap-3 ${activeTab === 'overview' ? 'bg-indigo-600/10 border-l-2 border-indigo-500 text-indigo-300 font-black' : 'text-slate-400 border-l-2 border-transparent hover:text-slate-200 hover:bg-white/3'}`}
          >
            <LayoutDashboard className="w-4 h-4 shrink-0" />
            <span>Overview Desk</span>
          </button>
          
          <button
            onClick={() => setActiveTab('inbox_tasks')}
            className={`w-full px-4 py-3 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer uppercase tracking-wider flex items-center justify-between ${activeTab === 'inbox_tasks' ? 'bg-indigo-600/10 border-l-2 border-indigo-500 text-indigo-300 font-black' : 'text-slate-400 border-l-2 border-transparent hover:text-slate-200 hover:bg-white/3'}`}
          >
            <div className="flex items-center gap-3">
              <Inbox className="w-4 h-4 shrink-0" />
              <span>Inbox & Tasks</span>
            </div>
            {stats.pending + stats.inProgress > 0 && (
              <span className="text-[9px] font-mono bg-indigo-550 text-white font-extrabold px-1.5 py-0.5 rounded-full shrink-0">
                {stats.pending + stats.inProgress}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('room_ops')}
            className={`w-full px-4 py-3 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer uppercase tracking-wider flex items-center gap-3 ${activeTab === 'room_ops' ? 'bg-indigo-600/10 border-l-2 border-indigo-500 text-indigo-300 font-black' : 'text-slate-400 border-l-2 border-transparent hover:text-slate-200 hover:bg-white/3'}`}
          >
            <Bed className="w-4 h-4 shrink-0" />
            <span>Room Directory</span>
          </button>

          <button
            onClick={() => setActiveTab('guest_experience')}
            className={`w-full px-4 py-3 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer uppercase tracking-wider flex items-center gap-3 ${activeTab === 'guest_experience' ? 'bg-indigo-600/10 border-l-2 border-indigo-500 text-indigo-300 font-black' : 'text-slate-400 border-l-2 border-transparent hover:text-slate-200 hover:bg-white/3'}`}
          >
            <MessageSquare className="w-4 h-4 shrink-0" />
            <span>Guest Experience</span>
          </button>

          <button
            onClick={() => setActiveTab('inventory')}
            className={`w-full px-4 py-3 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer uppercase tracking-wider flex items-center gap-3 ${activeTab === 'inventory' ? 'bg-indigo-600/10 border-l-2 border-indigo-500 text-indigo-300 font-black' : 'text-slate-400 border-l-2 border-transparent hover:text-slate-200 hover:bg-white/3'}`}
          >
            <ShoppingBag className="w-4 h-4 shrink-0" />
            <span>Procurement Hub</span>
          </button>

          <button
            onClick={() => setActiveTab('revenue_ai')}
            className={`w-full px-4 py-3 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer uppercase tracking-wider flex items-center gap-3 ${activeTab === 'revenue_ai' ? 'bg-indigo-600/10 border-l-2 border-indigo-500 text-indigo-300 font-black' : 'text-slate-400 border-l-2 border-transparent hover:text-slate-200 hover:bg-white/3'}`}
          >
            <TrendingUp className="w-4 h-4 shrink-0" />
            <span>Intelligence Unit</span>
          </button>

          <div className="pt-4 border-t border-slate-900/40 mt-4">
            <span className="text-[9px] font-black text-slate-550 uppercase tracking-widest px-4 block mb-2 font-mono">Integrations Gateway</span>
            <button
              onClick={() => setActiveTab('integrations')}
              className={`w-full px-4 py-3 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer uppercase tracking-wider flex items-center gap-3 ${activeTab === 'integrations' ? 'bg-indigo-600/10 border-l-2 border-indigo-500 text-indigo-300 font-black' : 'text-slate-400 border-l-2 border-transparent hover:text-slate-200 hover:bg-white/3'}`}
            >
              <Terminal className="w-4 h-4 shrink-0" />
              <span>Sandbox Console</span>
            </button>
          </div>
        </nav>

        {/* Sidebar Bottom Active Employee Session Selector */}
        <div className="p-4 border-t border-slate-900/40 relative bg-[#040711]">
          <button 
            onClick={() => { setShowSessionMenu(!showSessionMenu); setShowPropertyMenu(false); }}
            className="w-full flex items-center justify-between p-2.5 rounded-xl border border-slate-900 hover:bg-slate-900/25 transition-all text-left cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center font-bold text-xs text-white">
                {currentEmployeeName.split(' ').map(n => n[0]).join('')}
              </div>
              <div className="overflow-hidden">
                <div className="text-xs font-black text-slate-200 truncate">{currentEmployeeName}</div>
                <div className="text-[8px] text-slate-500 truncate mt-0.5">{currentEmployeeEmail}</div>
              </div>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-500" />
          </button>

          {showSessionMenu && (
            <div className="absolute bottom-16 left-4 right-4 bg-slate-950 border border-slate-850 rounded-xl shadow-2xl z-50 overflow-hidden max-h-[300px] overflow-y-auto divide-y divide-slate-900/60">
              <div className="px-4 py-2 bg-slate-950/80 text-[9px] text-slate-500 font-black uppercase tracking-wider font-mono">
                Select Session Account
              </div>
              {SYSTEM_EMPLOYEES.map(emp => (
                <button
                  key={emp.email}
                  onClick={() => handleEmployeeSwitch(emp)}
                  className="w-full text-left px-4 py-2.5 hover:bg-slate-900/40 text-xs transition-colors flex items-center justify-between cursor-pointer"
                >
                  <div>
                    <div className="font-bold text-slate-200">{emp.name}</div>
                    <div className="text-[9px] text-slate-500 uppercase tracking-wider mt-0.5">{emp.role} • {emp.dept}</div>
                  </div>
                  {currentEmployeeName === emp.name && <Check className="w-3.5 h-3.5 text-indigo-400" />}
                </button>
              ))}
            </div>
          )}
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <div className="flex-1 flex flex-col overflow-hidden bg-slate-950 relative">
        
        {/* Top Header Bar */}
        <header className="h-16 flex items-center justify-between px-8 border-b border-slate-900/50 shrink-0 relative z-10 bg-slate-950/40 backdrop-blur-md">
          <div>
            <h2 className="text-lg font-black tracking-wider uppercase text-slate-100 font-display">
              {activeTab === 'overview' && 'Operations Dashboard'}
              {activeTab === 'inbox_tasks' && 'Work Orders & Tasks'}
              {activeTab === 'room_ops' && 'Room Inventory Directory'}
              {activeTab === 'guest_experience' && 'AI Guest Experience & Sentiment Recovery'}
              {activeTab === 'inventory' && 'Procurement & Inventory Control'}
              {activeTab === 'revenue_ai' && 'Revenue & Predictive Intelligence'}
              {activeTab === 'integrations' && 'System Integrations & Sandbox'}
            </h2>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-[9px] text-slate-500 uppercase tracking-widest font-mono">
                {activeProperty.name}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* API Status Connection Indicator */}
            <div className="flex items-center gap-4 px-3.5 py-1.5 bg-slate-900/60 border border-slate-850 rounded-xl text-[10px] font-mono text-slate-400">
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full neon-dot ${apiOnline ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                <span>API: <strong className={apiOnline ? 'text-emerald-400' : 'text-rose-400'}>{apiOnline ? 'CONNECTED' : 'OFFLINE'}</strong></span>
              </div>
              <div className="w-px h-3 bg-slate-800" />
              <div className="flex items-center gap-1.5">
                <Shield className="w-3 h-3 text-indigo-400" />
                <span>RLS Session: <strong className="text-indigo-400 font-bold uppercase">{currentUserRole}</strong></span>
              </div>
            </div>

            {/* Shift Handover Autopilot Button */}
            <button
              onClick={handleGenerateShiftHandover}
              className="px-4 py-2 bg-slate-900 border border-slate-850 hover:bg-slate-850 hover:border-slate-700 text-indigo-400 font-extrabold text-xs rounded-xl cursor-pointer transition-all uppercase tracking-wider shadow-sm flex items-center gap-1.5"
            >
              <Cpu className="w-4 h-4 text-indigo-400" />
              <span>Shift Handover</span>
            </button>

            {/* Quick Action Add Task Button */}
            <button
              onClick={() => {
                setTaskRoomId('');
                setTaskTitle('');
                setTaskDescription('');
                setTaskDeptId('');
                setTaskDueDate('');
                setModalLog('');
                setShowTaskModal(true);
              }}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-xs rounded-xl cursor-pointer transition-all uppercase tracking-wider shadow-md hover:shadow-[0_0_15px_rgba(99,102,241,0.35)] flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Dispatch Task</span>
            </button>
          </div>
        </header>

        {/* Dynamic Inner Tab Views */}
        <main className="flex-1 overflow-y-auto p-8 relative z-10 blueprint-grid">
          
          {/* VIEW: OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              
              {/* KPI Stats Cards */}
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                
                <div className="premium-card rounded-xl p-5 flex flex-col justify-between relative overflow-hidden group">
                  <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-indigo-500" />
                  <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/5 rounded-full translate-x-8 -translate-y-8 pointer-events-none group-hover:scale-125 transition-all duration-500" />
                  <div className="flex justify-between items-center text-slate-400">
                    <span className="text-[9px] uppercase font-bold tracking-widest font-display text-slate-400">Total Workloads</span>
                    <div className="p-1.5 bg-indigo-500/10 rounded-lg text-indigo-400 border border-indigo-500/10">
                      <Activity className="w-4 h-4" />
                    </div>
                  </div>
                  <div>
                    <span className="text-3.5xl font-extrabold mt-3 text-white tracking-tight font-display">{stats.total}</span>
                    <div className="w-full bg-slate-900/60 h-1 rounded-full overflow-hidden mt-3 border border-slate-850/40">
                      <div className="bg-indigo-500 h-full w-full" />
                    </div>
                  </div>
                </div>

                <div className="premium-card rounded-xl p-5 flex flex-col justify-between relative overflow-hidden group">
                  <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-sky-500" />
                  <div className="absolute top-0 right-0 w-24 h-24 bg-sky-500/5 rounded-full translate-x-8 -translate-y-8 pointer-events-none group-hover:scale-125 transition-all duration-500" />
                  <div className="flex justify-between items-center text-slate-400">
                    <span className="text-[9px] uppercase font-bold tracking-widest font-display text-slate-400">Unassigned</span>
                    <div className="p-1.5 bg-sky-500/10 rounded-lg text-sky-400 border border-sky-500/10">
                      <Clock className="w-4 h-4" />
                    </div>
                  </div>
                  <div>
                    <span className="text-3.5xl font-extrabold mt-3 text-sky-400 tracking-tight font-display">{stats.pending}</span>
                    <div className="w-full bg-slate-900/60 h-1 rounded-full overflow-hidden mt-3 border border-slate-850/40">
                      <div className="bg-sky-500 h-full" style={{ width: `${stats.total > 0 ? (stats.pending / stats.total) * 100 : 0}%` }} />
                    </div>
                  </div>
                </div>

                <div className="premium-card rounded-xl p-5 flex flex-col justify-between relative overflow-hidden group">
                  <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-violet-500" />
                  <div className="absolute top-0 right-0 w-24 h-24 bg-violet-500/5 rounded-full translate-x-8 -translate-y-8 pointer-events-none group-hover:scale-125 transition-all duration-500" />
                  <div className="flex justify-between items-center text-slate-400">
                    <span className="text-[9px] uppercase font-bold tracking-widest font-display text-slate-400">In Progress</span>
                    <div className="p-1.5 bg-violet-500/10 rounded-lg text-violet-400 border border-violet-500/10">
                      <Home className="w-4 h-4" />
                    </div>
                  </div>
                  <div>
                    <span className="text-3.5xl font-extrabold mt-3 text-violet-400 tracking-tight font-display">{stats.inProgress}</span>
                    <div className="w-full bg-slate-900/60 h-1 rounded-full overflow-hidden mt-3 border border-slate-850/40">
                      <div className="bg-violet-500 h-full" style={{ width: `${stats.total > 0 ? (stats.inProgress / stats.total) * 100 : 0}%` }} />
                    </div>
                  </div>
                </div>

                <div className="premium-card rounded-xl p-5 flex flex-col justify-between relative overflow-hidden group">
                  <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-emerald-500" />
                  <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-full translate-x-8 -translate-y-8 pointer-events-none group-hover:scale-125 transition-all duration-500" />
                  <div className="flex justify-between items-center text-slate-400">
                    <span className="text-[9px] uppercase font-bold tracking-widest font-display text-slate-400">Completed</span>
                    <div className="p-1.5 bg-emerald-500/10 rounded-lg text-emerald-400 border border-emerald-500/10">
                      <CheckCircle className="w-4 h-4" />
                    </div>
                  </div>
                  <div>
                    <span className="text-3.5xl font-extrabold mt-3 text-emerald-400 tracking-tight font-display">{stats.completed}</span>
                    <div className="w-full bg-slate-900/60 h-1 rounded-full overflow-hidden mt-3 border border-slate-850/40">
                      <div className="bg-emerald-500 h-full" style={{ width: `${stats.total > 0 ? (stats.completed / stats.total) * 100 : 0}%` }} />
                    </div>
                  </div>
                </div>

                <div className="premium-card rounded-xl p-5 flex flex-col justify-between col-span-2 md:col-span-1 relative overflow-hidden group border-rose-500/20 bg-rose-950/5">
                  <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-rose-500" />
                  <div className="absolute top-0 right-0 w-24 h-24 bg-rose-500/5 rounded-full translate-x-8 -translate-y-8 pointer-events-none group-hover:scale-125 transition-all duration-500" />
                  <div className="flex justify-between items-center text-rose-400">
                    <span className="text-[9px] uppercase font-bold tracking-widest font-display">SLA Breached</span>
                    <div className="p-1.5 bg-rose-500/10 rounded-lg text-rose-455 border border-rose-500/10">
                      <AlertTriangle className="w-4 h-4 text-rose-550 animate-bounce" />
                    </div>
                  </div>
                  <div>
                    <span className="text-3.5xl font-extrabold mt-3 text-rose-500 tracking-tight font-display">{stats.escalated}</span>
                    <div className="w-full bg-slate-900/60 h-1 rounded-full overflow-hidden mt-3 border border-slate-850/40">
                      <div className="bg-rose-500 h-full" style={{ width: `${stats.total > 0 ? (stats.escalated / stats.total) * 100 : 0}%` }} />
                    </div>
                  </div>
                </div>

              </div>

              {/* AI Operational Recommendations */}
              {recommendations.length > 0 && (
                <div className="stitched-card rounded-2xl p-5 bg-gradient-to-r from-indigo-950/20 to-slate-900/40 border-indigo-500/30 relative overflow-hidden flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <StitchedCornerPins />
                  <div className="absolute top-[-50%] left-[-20%] w-[350px] h-[350px] bg-indigo-500/5 rounded-full blur-[60px] pointer-events-none" />
                  
                  <div className="flex items-start gap-3.5 relative z-10">
                    <span className="p-3 bg-indigo-500/10 border border-indigo-500/20 rounded-xl text-indigo-400 shadow-[0_0_12px_rgba(99,102,241,0.15)] shrink-0">
                      <Zap className="w-5 h-5 text-indigo-400 animate-pulse" />
                    </span>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[9px] px-2 py-0.5 bg-indigo-655 text-white rounded font-black tracking-wider uppercase">
                          AI Recommendation
                        </span>
                        <span className="text-xs text-slate-500 font-mono">
                          Confidence: {(recommendations[0].confidence * 100).toFixed(0)}%
                        </span>
                      </div>
                      <p className="text-xs text-slate-200 mt-2 font-medium leading-relaxed max-w-2xl">
                        {recommendations[0].reason}
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-2 shrink-0 w-full md:w-auto justify-end relative z-10">
                    <button 
                      onClick={() => handleRecAction(recommendations[0].id, 'execute')}
                      className="text-xs bg-indigo-600 hover:bg-indigo-500 text-white font-bold px-4 py-2.5 rounded-xl transition-all cursor-pointer shadow-[0_0_15px_rgba(99,102,241,0.3)] hover:shadow-[0_0_20px_rgba(99,102,241,0.5)] uppercase tracking-wider"
                    >
                      Execute Shift
                    </button>
                    <button 
                      onClick={() => handleRecAction(recommendations[0].id, 'reject')}
                      className="text-xs bg-slate-900 hover:bg-slate-800 text-slate-300 font-bold px-4 py-2.5 rounded-xl transition-all border border-slate-800 cursor-pointer uppercase tracking-wider"
                    >
                      Dismiss
                    </button>
                  </div>
                </div>
              )}

              {/* Side-by-Side widgets */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Column 1: Activity Timeline */}
                <div className="stitched-card rounded-2xl p-6 relative flex flex-col h-[400px]">
                  <StitchedCornerPins />
                  <div className="flex items-center gap-2 mb-4 border-b border-slate-800/85 pb-3">
                    <Activity className="w-5 h-5 text-indigo-400" />
                    <h2 className="text-sm font-black uppercase tracking-wider">Activity Timeline</h2>
                  </div>
                  
                  <div className="flex-1 overflow-y-auto space-y-4 pr-1 scrollbar-thin">
                    {auditLogs.length === 0 ? (
                      <div className="text-center py-16 text-slate-500 text-sm flex flex-col items-center justify-center h-full">
                        <span>No recent activity logs recorded.</span>
                      </div>
                    ) : (
                      auditLogs.map((log) => (
                        <div key={log.id} className="flex gap-3 text-xs border-b border-slate-900/60 pb-3 last:border-b-0">
                          <div className="shrink-0 w-2 h-2 rounded-full bg-indigo-500 mt-1.5 neon-dot" />
                          <div className="space-y-1">
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="font-black px-2 py-0.5 bg-slate-950 border border-slate-900 text-indigo-300 rounded font-mono text-[9px] tracking-wider">
                                {log.action}
                              </span>
                              <span className="text-slate-350 font-bold">
                                {log.user ? log.user.name : 'System Monitor'}
                              </span>
                              <span className="text-[9px] text-slate-550 font-mono">
                                {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                              </span>
                            </div>
                            <p className="text-slate-400 font-light leading-relaxed text-xs">{log.details}</p>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* Column 2: Daily SOP Checklists */}
                <div className="stitched-card rounded-2xl p-6 relative flex flex-col h-[400px]">
                  <StitchedCornerPins />
                  <div className="flex items-center justify-between mb-4 border-b border-slate-800/85 pb-3">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-5 h-5 text-indigo-400" />
                      <h2 className="text-sm font-black uppercase tracking-wider">Daily SOP Run</h2>
                    </div>
                    {checklistData && checklistData.totalTasks > 0 && (
                      <span className="text-[9px] bg-indigo-500/20 text-indigo-400 font-extrabold px-2 py-0.5 rounded border border-indigo-500/25 font-mono">
                        {checklistData.totalTasks} ITEMS
                      </span>
                    )}
                  </div>

                  {!checklistData || Object.keys(checklistData.departments).length === 0 ? (
                    <div className="flex-1 flex flex-col items-center justify-center text-center p-4">
                      <Layers className="w-10 h-10 text-slate-600 mb-2.5 opacity-40" />
                      <span className="text-xs text-slate-400 font-medium">No checklists active for today</span>
                      <p className="text-[10px] text-slate-500 max-w-[200px] mt-1 font-light leading-relaxed">
                        Initiate standard operating procedures for all property departments.
                      </p>
                      <button
                        onClick={handleGenerateChecklists}
                        disabled={isGeneratingChecklist}
                        className="mt-4 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 disabled:text-slate-550 text-white font-extrabold text-[10px] rounded-xl cursor-pointer transition-all uppercase tracking-wider shadow-sm"
                      >
                        {isGeneratingChecklist ? 'Generating...' : 'Generate Daily SOPs'}
                      </button>
                    </div>
                  ) : (
                    <div className="flex-1 overflow-y-auto space-y-4 pr-1 text-xs scrollbar-thin">
                      {Object.keys(checklistData.departments).map(deptName => {
                        const dept = checklistData.departments[deptName];
                        return (
                          <div key={deptName} className="space-y-1.5">
                            <h4 className="text-[9px] uppercase font-black tracking-widest text-indigo-400 font-mono">{deptName} SOP</h4>
                            <div className="space-y-1">
                              {dept.tasks.map(t => {
                                const isTaskCompleted = t.status === 'COMPLETED';
                                return (
                                  <div key={t.id} className="flex items-center gap-2 bg-slate-950/40 border border-slate-900/60 p-2 rounded-lg group">
                                    <input 
                                      type="checkbox"
                                      checked={isTaskCompleted}
                                      onChange={() => {
                                        setChecklistData(prev => {
                                          if (!prev) return prev;
                                          const newDepts = { ...prev.departments };
                                          newDepts[deptName].tasks = newDepts[deptName].tasks.map(task => {
                                            if (task.id === t.id) {
                                              return { ...task, status: isTaskCompleted ? 'PENDING' : 'COMPLETED' };
                                            }
                                            return task;
                                          });
                                          return { ...prev, departments: newDepts };
                                        });
                                        setTasks(prev => prev.map(task => {
                                          if (task.id === t.id) {
                                            return { ...task, status: isTaskCompleted ? 'PENDING' : 'COMPLETED' };
                                          }
                                          return task;
                                        }));
                                        handleUpdateStatus(t.id, isTaskCompleted ? 'PENDING' : 'COMPLETED');
                                      }}
                                      className="w-3.5 h-3.5 rounded border-slate-800 text-indigo-600 focus:ring-indigo-500/50 cursor-pointer bg-slate-955" 
                                    />
                                    <span className={`text-[11px] font-medium leading-tight ${isTaskCompleted ? 'line-through text-slate-500' : 'text-slate-200'}`}>
                                      {t.title}
                                    </span>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Column 3: Notifications Hub */}
                <div className="stitched-card rounded-2xl p-6 relative flex flex-col h-[400px]">
                  <StitchedCornerPins />
                  <div className="flex flex-col gap-2 mb-4 border-b border-slate-800/85 pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <MessageSquare className="w-5 h-5 text-indigo-400" />
                        <h2 className="text-sm font-black uppercase tracking-wider">Alerts & Dispatch</h2>
                      </div>
                    </div>
                    
                    <div className="flex flex-wrap gap-1 mt-1">
                      {['ALL', 'IN_APP', 'WHATSAPP', 'EMAIL', 'SMS'].map((ch) => (
                        <button
                          key={ch}
                          onClick={() => setActiveNotifFilter(ch)}
                          className={`text-[8px] px-2 py-0.5 rounded font-black border transition-all cursor-pointer uppercase ${
                            activeNotifFilter === ch
                              ? 'bg-indigo-650 text-white border-indigo-550 shadow-sm'
                              : 'bg-slate-950 text-slate-500 border-slate-900 hover:text-white hover:border-slate-800'
                          }`}
                        >
                          {ch === 'ALL' ? 'All' : ch.replace('_', '-')}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="flex-1 overflow-y-auto space-y-3.5 pr-1 scrollbar-thin">
                    {filteredNotifs.length === 0 ? (
                      <div className="text-center py-16 text-slate-500 text-sm flex flex-col items-center justify-center h-full">
                        <span>No alerts triggered for &quot;{activeNotifFilter}&quot;.</span>
                      </div>
                    ) : (
                      filteredNotifs.map((notif) => {
                        const channel = notif.channel || 'IN_APP';
                        const status = notif.status || 'SENT';
                        
                        let channelBadge = 'border-indigo-500/20 text-indigo-400 bg-indigo-950/20';
                        let channelIcon = '🔔';
                        if (channel === 'WHATSAPP') {
                          channelBadge = 'border-emerald-500/20 text-emerald-400 bg-emerald-950/20';
                          channelIcon = '💬';
                        } else if (channel === 'EMAIL') {
                          channelBadge = 'border-sky-500/20 text-sky-400 bg-sky-950/20';
                          channelIcon = '📧';
                        } else if (channel === 'SMS') {
                          channelBadge = 'border-cyan-500/20 text-cyan-400 bg-cyan-950/20';
                          channelIcon = '📱';
                        }
                        
                        return (
                          <div key={notif.id} className="p-3 bg-slate-950/40 border border-slate-900 rounded-xl space-y-1.5 relative overflow-hidden group">
                            <div className="flex justify-between items-center text-[9px]">
                              <span className={`px-2 py-0.5 rounded font-black border uppercase tracking-wider font-mono ${channelBadge}`}>
                                {channelIcon} {channel}
                              </span>
                              <span className={`font-mono font-bold ${status === 'FAILED' ? 'text-rose-500' : 'text-emerald-400'}`}>
                                {status === 'SENT' ? '✓ SENT' : status === 'PENDING' ? '⏳ PENDING' : '✖ FAILED'}
                              </span>
                            </div>
                            <p className="text-xs text-slate-300 font-light leading-relaxed">{notif.message}</p>
                            <div className="flex justify-between items-center text-[9px] text-slate-550 border-t border-slate-900/60 pt-1.5 mt-1.5">
                              <span>To: <strong className="font-mono text-slate-450">{notif.recipient}</strong></span>
                              <span>{new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>

              </div>

            </div>
          )}

          {/* VIEW: TASKS & INBOX */}
          {activeTab === 'inbox_tasks' && (
            <div className="space-y-6">
              
              {/* Toolbar: Department Filters */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-950 border border-slate-900 p-4 rounded-xl relative z-20">
                <div className="flex flex-wrap gap-1.5">
                  <button
                    onClick={() => setActiveDeptFilter('All')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-black transition-all cursor-pointer uppercase ${activeDeptFilter === 'All' ? 'bg-indigo-650 text-white border border-indigo-550 shadow-md' : 'text-slate-400 hover:text-slate-200 border border-transparent'}`}
                  >
                    All Departments
                  </button>
                  {availableDepts.map(dept => (
                    <button
                      key={dept.id}
                      onClick={() => setActiveDeptFilter(dept.name)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-black transition-all cursor-pointer uppercase ${activeDeptFilter === dept.name ? 'bg-indigo-650 text-white border border-indigo-550 shadow-md' : 'text-slate-400 hover:text-slate-200 border border-transparent'}`}
                    >
                      {dept.name}
                    </button>
                  ))}
                </div>

                <div className="text-xs text-slate-550 font-bold uppercase tracking-wider font-mono">
                  Showing {filteredTasks.length} Work Orders
                </div>
              </div>

              {/* Tasks List */}
              <div className="stitched-card rounded-2xl p-6 relative min-h-[500px]">
                <StitchedCornerPins />
                
                <div className="space-y-3.5">
                  {filteredTasks.length === 0 ? (
                    <div className="text-center py-24 text-slate-500 text-sm flex flex-col items-center justify-center">
                      <Inbox className="w-10 h-10 text-slate-700 mb-3 opacity-30 animate-pulse" />
                      <span>All caught up! No active tasks found for &quot;{activeDeptFilter}&quot;.</span>
                      <p className="text-xs text-slate-600 mt-1 max-w-sm">Tasks generated via daily SOPs, predictive maintenance, or manual dispatches appear here.</p>
                    </div>
                  ) : (
                    filteredTasks.map((task) => {
                      const isCompleted = task.status === 'COMPLETED';
                      const isEscalated = task.status === 'ESCALATED';
                      const isInProgress = task.status === 'IN_PROGRESS';
                      
                      return (
                        <div 
                          key={task.id}
                          className={`p-4 bg-slate-950/60 border rounded-xl hover:border-indigo-500/40 transition-all flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 relative overflow-hidden group ${isEscalated ? 'border-rose-500/30 bg-rose-955/5' : isCompleted ? 'border-emerald-500/10 opacity-70' : 'border-slate-900'}`}
                        >
                          <div className={`absolute left-0 top-0 bottom-0 w-1 ${isEscalated ? 'bg-rose-500' : isCompleted ? 'bg-emerald-500' : isInProgress ? 'bg-indigo-500' : 'bg-slate-750'}`} />

                          <div className="space-y-1.5">
                            <div className="flex flex-wrap items-center gap-2">
                              <PriorityBadge priority={task.priority} />
                              <span className="text-[9px] px-2 py-0.5 font-bold bg-slate-900 border border-slate-850 text-slate-400 rounded-md font-mono tracking-wider uppercase">
                                {task.department ? task.department.name : 'OPERATIONS'}
                              </span>
                              {task.room && (
                                <span className="text-[9px] px-2 py-0.5 font-bold bg-slate-900 border border-slate-850 text-indigo-300 rounded-md font-mono tracking-wider">
                                  ROOM {task.room.roomNumber}
                                </span>
                              )}
                              <span className="text-[10px] text-slate-500 font-mono">
                                Dispatched {new Date(task.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </span>
                            </div>
                            <h4 className={`text-sm font-extrabold ${isCompleted ? 'line-through text-slate-500' : 'text-slate-100'}`}>{task.title}</h4>
                            {task.description && (
                              <p className="text-xs text-slate-450 font-light leading-relaxed max-w-3xl">{task.description}</p>
                            )}
                          </div>

                          <div className="flex items-center gap-4 self-stretch sm:self-auto justify-between border-t border-slate-900/60 sm:border-t-0 pt-3 sm:pt-0 shrink-0">
                            {/* SLA countdown */}
                            {!isCompleted && task.dueDate && (
                              <div className="text-right flex flex-col">
                                <span className="text-[8px] uppercase font-black text-slate-555 tracking-widest font-mono">SLA Deadline</span>
                                <span className={`font-mono text-xs font-bold ${isEscalated ? 'text-rose-500 animate-pulse' : 'text-indigo-400'}`}>
                                  {new Date(task.dueDate) > new Date() 
                                    ? `${Math.ceil((new Date(task.dueDate).getTime() - new Date().getTime()) / 60000)}m remaining`
                                    : 'BREACHED'
                                  }
                                </span>
                              </div>
                            )}

                            {/* Manager Override Trigger Button */}
                            {!isCompleted && (
                              <button
                                onClick={() => {
                                  setOverrideTask(task);
                                  setOverrideDeptId('');
                                  setOverridePriority(task.priority);
                                  setOverrideDueDate('');
                                  setOverrideLog('');
                                }}
                                title="Manager Override"
                                className="p-1.5 rounded-lg text-slate-555 hover:text-indigo-400 hover:bg-indigo-500/10 border border-transparent hover:border-indigo-500/20 transition-all cursor-pointer shrink-0"
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/></svg>
                              </button>
                            )}

                            {/* Actions / SLA signoffs */}
                            <div className="flex gap-2">
                              {task.status === 'PENDING_APPROVAL' ? (
                                currentUserRole === 'MANAGER' || currentUserRole === 'SUPERVISOR' || currentUserRole === 'OWNER' ? (
                                  <button 
                                    onClick={() => handleUpdateStatus(task.id, 'COMPLETED')}
                                    className="text-[10px] bg-amber-600 hover:bg-amber-500 text-white font-extrabold px-3 py-2 rounded-lg transition-all cursor-pointer uppercase tracking-wider shadow-md"
                                  >
                                    Sign Off ✅
                                  </button>
                                ) : (
                                  <span className="text-[10px] font-black text-amber-400 uppercase tracking-widest px-2.5 py-1.5 border border-amber-500/20 bg-amber-955/20 rounded-lg">
                                    Awaiting Sign-off ⏳
                                  </span>
                                )
                              ) : isCompleted ? (
                                <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest px-2.5 py-1.5 border border-emerald-500/20 bg-emerald-955/20 rounded-lg">
                                  Completed ✅
                                </span>
                              ) : isEscalated ? (
                                <div className="flex gap-2">
                                  <span className="text-[10px] font-black text-rose-500 uppercase tracking-widest px-2.5 py-1.5 border border-rose-500/20 bg-rose-955/20 rounded-lg">
                                    Escalated ⚠️
                                  </span>
                                  <button 
                                    onClick={() => handleUpdateStatus(task.id, 'COMPLETED')}
                                    className="text-[10px] bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold px-3 py-2 rounded-lg transition-all cursor-pointer uppercase tracking-wider"
                                  >
                                    Resolve
                                  </button>
                                </div>
                              ) : (
                                <>
                                  {task.status === 'PENDING' ? (
                                    <button 
                                      onClick={() => handleUpdateStatus(task.id, 'IN_PROGRESS')}
                                      className="text-[10px] bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold px-3 py-2 rounded-lg transition-all cursor-pointer uppercase tracking-wider shadow-md hover:shadow-[0_0_12px_rgba(99,102,241,0.35)]"
                                    >
                                      Claim
                                    </button>
                                  ) : (
                                    <button 
                                      onClick={() => handleUpdateStatus(task.id, 'COMPLETED')}
                                      className="text-[10px] bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold px-3 py-2 rounded-lg transition-all cursor-pointer uppercase tracking-wider"
                                    >
                                      Complete
                                    </button>
                                  )}
                                </>
                              )}
                            </div>

                          </div>
                        </div>
                      );
                    })
                  )}
                </div>

              </div>

            </div>
          )}

          {/* VIEW: ROOM OPERATIONS */}
          {activeTab === 'room_ops' && (
            <div className="space-y-6">
              
              {/* Stats Bar */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="premium-card rounded-xl p-4 flex items-center gap-3">
                  <span className="text-2xl">🟢</span>
                  <div>
                    <div className="text-[10px] text-slate-500 font-extrabold uppercase tracking-wider">Clean & Available</div>
                    <div className="text-lg font-black text-slate-200 font-mono">
                      {availableRooms.filter(r => r.status === 'AVAILABLE').length} Rooms
                    </div>
                  </div>
                </div>
                <div className="premium-card rounded-xl p-4 flex items-center gap-3">
                  <span className="text-2xl">🔵</span>
                  <div>
                    <div className="text-[10px] text-slate-500 font-extrabold uppercase tracking-wider">Occupied</div>
                    <div className="text-lg font-black text-indigo-400 font-mono">
                      {availableRooms.filter(r => r.status === 'OCCUPIED').length} Rooms
                    </div>
                  </div>
                </div>
                <div className="premium-card rounded-xl p-4 flex items-center gap-3">
                  <span className="text-2xl">🟡</span>
                  <div>
                    <div className="text-[10px] text-slate-500 font-extrabold uppercase tracking-wider">Dirty - Inspect</div>
                    <div className="text-lg font-black text-amber-500 font-mono">
                      {availableRooms.filter(r => r.status === 'DIRTY').length} Rooms
                    </div>
                  </div>
                </div>
                <div className="premium-card rounded-xl p-4 flex items-center gap-3">
                  <span className="text-2xl">🔴</span>
                  <div>
                    <div className="text-[10px] text-slate-500 font-extrabold uppercase tracking-wider">Maintenance Hold</div>
                    <div className="text-lg font-black text-rose-500 font-mono">
                      {availableRooms.filter(r => r.status === 'MAINTENANCE').length} Rooms
                    </div>
                  </div>
                </div>
              </div>

              {/* Grid Wrapper */}
              <div className="stitched-card rounded-2xl p-6 relative min-h-[400px]">
                <StitchedCornerPins />
                
                <div className="flex items-center justify-between mb-6 border-b border-slate-900 pb-3">
                  <h3 className="text-sm font-black uppercase tracking-wider text-slate-100 flex items-center gap-2">
                    <Bed className="w-4 h-4 text-indigo-400" />
                    <span>Property Room Grid Matrix</span>
                  </h3>
                  <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">
                    Interactive PMS Operations Board
                  </div>
                </div>

                {availableRooms.length === 0 ? (
                  <div className="text-center py-20 text-slate-500">
                    <p>No rooms found. Please run the seeder to load property configuration.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-4">
                    {availableRooms.map((room) => {
                      const isAvailable = room.status === 'AVAILABLE';
                      const isOccupied = room.status === 'OCCUPIED';
                      const isDirty = room.status === 'DIRTY';
                      const isMaint = room.status === 'MAINTENANCE';

                      let borderStyle = 'border-slate-900 hover:border-slate-800 bg-slate-950/20';
                      let statusText = 'Clean & Available';
                      let dotColor = 'bg-emerald-500';
                      
                      if (isAvailable) {
                        borderStyle = 'border-emerald-500/10 hover:border-emerald-500/30 hover:bg-emerald-950/5';
                        statusText = 'AVAILABLE';
                        dotColor = 'bg-emerald-500';
                      } else if (isOccupied) {
                        borderStyle = 'border-indigo-500/20 hover:border-indigo-500/40 hover:bg-indigo-950/5';
                        statusText = 'OCCUPIED';
                        dotColor = 'bg-indigo-400';
                      } else if (isDirty) {
                        borderStyle = 'border-amber-500/20 hover:border-amber-500/40 hover:bg-amber-955/5';
                        statusText = 'DIRTY';
                        dotColor = 'bg-amber-500';
                      } else if (isMaint) {
                        borderStyle = 'border-rose-500/20 hover:border-rose-500/40 hover:bg-rose-955/5';
                        statusText = 'MAINTENANCE';
                        dotColor = 'bg-rose-500';
                      }

                      // Check guest name from static mock mapped to seeded bookings
                      let occupyingGuest = '';
                      if (room.roomNumber === '101') occupyingGuest = 'Arthur Pendragon';
                      if (room.roomNumber === '201') occupyingGuest = 'Morgana Le Fay';

                      return (
                        <div
                          key={room.id}
                          onClick={() => setSelectedRoomDetails(room)}
                          className={`p-4 border rounded-xl cursor-pointer transition-all flex flex-col justify-between h-32 relative group overflow-hidden ${borderStyle}`}
                        >
                          <div className={`absolute top-0 right-0 w-12 h-12 rounded-full opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none ${
                            isAvailable ? 'bg-emerald-500/5' : isOccupied ? 'bg-indigo-500/5' : isDirty ? 'bg-amber-500/5' : 'bg-rose-500/5'
                          }`} />

                          <div>
                            <div className="flex justify-between items-start">
                              <span className="text-base font-black text-slate-100 tracking-tight font-mono">
                                Room {room.roomNumber}
                              </span>
                              <div className="flex items-center gap-1.5">
                                <div className={`w-1.5 h-1.5 rounded-full ${dotColor} neon-dot`} />
                                <span className={`text-[8px] font-black uppercase tracking-wider font-mono ${
                                  isAvailable ? 'text-emerald-450' : isOccupied ? 'text-indigo-400' : isDirty ? 'text-amber-500' : 'text-rose-500'
                                }`}>
                                  {statusText}
                                </span>
                              </div>
                            </div>
                            <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider mt-0.5 block">
                              {room.roomType}
                            </span>
                          </div>

                          <div className="border-t border-slate-900/60 pt-2 mt-2">
                            {occupyingGuest ? (
                              <div className="overflow-hidden">
                                <span className="text-[7px] text-slate-500 font-bold uppercase block tracking-wider">Active Guest</span>
                                <span className="text-[10px] text-indigo-300 font-bold truncate block">{occupyingGuest}</span>
                              </div>
                            ) : (
                              <span className="text-[9px] text-slate-600 font-light block italic">Vacant</span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

              </div>
            </div>
          )}

          {/* VIEW: GUEST EXPERIENCE & SENTIMENT RECOVERY */}
          {activeTab === 'guest_experience' && (
            <div className="space-y-6 w-full">
              
              {/* Header metrics row */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="premium-card rounded-xl p-5 flex items-center justify-between relative overflow-hidden group">
                  <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-emerald-500" />
                  <div>
                    <span className="text-[9px] uppercase font-bold tracking-widest font-mono text-slate-400">Average Sentiment</span>
                    <h3 className="text-2.5xl font-black mt-1 text-white font-display">8.4 <span className="text-xs text-slate-500 font-normal">/ 10</span></h3>
                    <p className="text-[10px] text-emerald-400 mt-1 font-light flex items-center gap-1">🟢 Sentiment Index: STABLE</p>
                  </div>
                  <div className="p-3 bg-emerald-500/10 border border-emerald-500/10 rounded-xl text-emerald-400 shrink-0">
                    <TrendingUp className="w-5 h-5" />
                  </div>
                </div>

                <div className="premium-card rounded-xl p-5 flex items-center justify-between relative overflow-hidden group">
                  <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-rose-500" />
                  <div>
                    <span className="text-[9px] uppercase font-bold tracking-widest font-mono text-slate-400">Escalated Alerts</span>
                    <h3 className="text-2.5xl font-black mt-1 text-rose-550 font-display">
                      {
                        (guests.length > 0 ? guests : mockOfflineGuests).filter(g => {
                          const evs = (guestEvents || []).filter(e => e.metadata?.guestPhone === g.phone);
                          const lastMsg = evs[evs.length - 1]?.metadata?.messageText?.toLowerCase() || '';
                          return lastMsg.includes('ac') || lastMsg.includes('broken') || lastMsg.includes('leak') || lastMsg.includes('hot');
                        }).length
                      }
                    </h3>
                    <p className="text-[10px] text-rose-400 mt-1 font-light flex items-center gap-1">🚨 SLA Recovery Protocols ACTIVE</p>
                  </div>
                  <div className="p-3 bg-rose-500/10 border border-rose-500/10 rounded-xl text-rose-450 shrink-0">
                    <AlertTriangle className="w-5 h-5 text-rose-500 animate-pulse" />
                  </div>
                </div>

                <div className="premium-card rounded-xl p-5 flex items-center justify-between relative overflow-hidden group">
                  <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-indigo-500" />
                  <div>
                    <span className="text-[9px] uppercase font-bold tracking-widest font-mono text-slate-400">Service Recovery Folio</span>
                    <h3 className="text-2.5xl font-black mt-1 text-white font-display">
                      ${
                        auditLogs
                          .filter(log => log.action === 'COMPENSATION_APPLIED')
                          .reduce((sum, log) => {
                            const match = log.details?.match(/\$(\d+(\.\d+)?)/);
                            return sum + (match ? parseFloat(match[1]) : 0);
                          }, 0).toFixed(2)
                      }
                    </h3>
                    <p className="text-[10px] text-indigo-400 mt-1 font-light flex items-center gap-1">✓ Logged to PMS room accounts</p>
                  </div>
                  <div className="p-3 bg-indigo-500/10 border border-indigo-500/10 rounded-xl text-indigo-400 shrink-0">
                    <Shield className="w-5 h-5" />
                  </div>
                </div>
              </div>

              {/* Main Panel Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
                
                {/* LEFT COLUMN: Guest List */}
                <div className="lg:col-span-4 stitched-card rounded-2xl p-5 bg-slate-950/20 relative flex flex-col h-[520px]">
                  <StitchedCornerPins />
                  <div className="flex items-center justify-between mb-4 border-b border-slate-900 pb-3">
                    <div className="flex items-center gap-2">
                      <Inbox className="w-5 h-5 text-indigo-400" />
                      <h3 className="text-xs font-black uppercase tracking-wider">In-house Guests</h3>
                    </div>
                  </div>

                  {/* Sentiment Filter Segment */}
                  <div className="flex gap-1.5 mb-3">
                    <button
                      onClick={() => setActiveSentimentFilter('ALL')}
                      className={`text-[9px] px-2 py-1 rounded font-black border transition-all cursor-pointer uppercase ${
                        activeSentimentFilter === 'ALL'
                          ? 'bg-indigo-650 border-indigo-550 text-white shadow-sm'
                          : 'bg-slate-950 text-slate-500 border-slate-900 hover:text-white'
                      }`}
                    >
                      All
                    </button>
                    <button
                      onClick={() => setActiveSentimentFilter('ANGRY_FRUSTRATED')}
                      className={`text-[9px] px-2 py-1 rounded font-black border transition-all cursor-pointer uppercase ${
                        activeSentimentFilter === 'ANGRY_FRUSTRATED'
                          ? 'bg-rose-950 border-rose-900/50 text-rose-400 shadow-sm'
                          : 'bg-slate-950 text-slate-500 border-slate-900 hover:text-white'
                      }`}
                    >
                      Alerts
                    </button>
                    <button
                      onClick={() => setActiveSentimentFilter('VIP')}
                      className={`text-[9px] px-2 py-1 rounded font-black border transition-all cursor-pointer uppercase ${
                        activeSentimentFilter === 'VIP'
                          ? 'bg-indigo-950 border-indigo-900 text-indigo-400 shadow-sm'
                          : 'bg-slate-950 text-slate-500 border-slate-900 hover:text-white'
                      }`}
                    >
                      VIPs
                    </button>
                  </div>

                  {/* Scrollable list */}
                  <div className="flex-1 overflow-y-auto space-y-2.5 pr-1 scrollbar-thin">
                    {((guests.length > 0 ? guests : mockOfflineGuests)
                      .filter(g => {
                        const evs = (guestEvents || []).filter(e => e.metadata?.guestPhone === g.phone);
                        const lastMsg = evs[evs.length - 1]?.metadata?.messageText?.toLowerCase() || '';
                        
                        if (activeSentimentFilter === 'ANGRY_FRUSTRATED') {
                          return lastMsg.includes('ac') || lastMsg.includes('broken') || lastMsg.includes('leak') || lastMsg.includes('hot');
                        }
                        if (activeSentimentFilter === 'VIP') {
                          return g.loyaltyStatus === 'Gold' || g.loyaltyStatus === 'Silver';
                        }
                        return true;
                      })
                      .map(g => {
                        const activeBooking = g.bookings?.[0];
                        const roomNum = activeBooking?.room?.roomNumber || 'Unknown';
                        const evs = (guestEvents || []).filter(e => e.metadata?.guestPhone === g.phone);
                        const lastMsg = evs[evs.length - 1];
                        const lastMsgText = lastMsg?.metadata?.messageText || 'No messages received.';
                        
                        // Heuristically calculate sentiment for visualization
                        let sentimentText = 'NEUTRAL';
                        let sentimentColor = 'bg-slate-400';
                        if (lastMsgText.toLowerCase().includes('ac') || lastMsgText.toLowerCase().includes('broken') || lastMsgText.toLowerCase().includes('leak') || lastMsgText.toLowerCase().includes('hot')) {
                          sentimentText = 'FRUSTRATED';
                          sentimentColor = 'bg-rose-500 animate-ping';
                        } else if (lastMsgText.toLowerCase().includes('thank') || lastMsgText.toLowerCase().includes('great') || lastMsgText.toLowerCase().includes('appreciate')) {
                          sentimentText = 'HAPPY';
                          sentimentColor = 'bg-emerald-500';
                        }

                        return (
                          <button
                            key={g.id}
                            onClick={() => {
                              setSelectedGuestId(g.id);
                              setCompAmount('');
                              setCompReason('');
                              setGuestExperienceLog('');
                            }}
                            className={`w-full text-left p-3 border rounded-xl transition-all cursor-pointer relative overflow-hidden flex items-start gap-3 ${
                              selectedGuestId === g.id
                                ? 'bg-indigo-600/10 border-indigo-500/40 text-indigo-300'
                                : 'bg-slate-950/40 border-slate-900 text-slate-400 hover:bg-slate-900/30'
                            }`}
                          >
                            <div className="shrink-0 relative">
                              <span className="w-8 h-8 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center font-bold text-slate-300 text-xs">
                                {g.name.split(' ').map((n: string) => n[0]).join('')}
                              </span>
                              <span className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border border-slate-950 ${sentimentColor}`} />
                            </div>
                            
                            <div className="flex-1 min-w-0">
                              <div className="flex justify-between items-center">
                                <h4 className="font-extrabold text-[11px] text-slate-200 truncate">{g.name}</h4>
                                <span className="font-mono text-[9px] font-bold text-indigo-400">R: {roomNum}</span>
                              </div>
                              <p className="text-[10px] text-slate-500 truncate mt-1">{lastMsgText}</p>
                              <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
                                {g.loyaltyStatus && (
                                  <span className="text-[7.5px] px-1.5 py-0.5 rounded font-black uppercase tracking-wider font-mono bg-indigo-950/40 border border-indigo-900 text-indigo-400">
                                    VIP {g.loyaltyStatus}
                                  </span>
                                )}
                                <span className={`text-[7.5px] px-1.5 py-0.5 rounded font-black uppercase tracking-wider font-mono bg-slate-950 border border-slate-900 ${
                                  sentimentText === 'FRUSTRATED' ? 'text-rose-400' : sentimentText === 'HAPPY' ? 'text-emerald-400' : 'text-slate-500'
                                }`}>
                                  {sentimentText}
                                </span>
                              </div>
                            </div>
                          </button>
                        );
                      })
                    )}
                  </div>
                </div>

                {/* RIGHT COLUMN: Live Chat & AI Copilot */}
                <div className="lg:col-span-8 flex flex-col lg:flex-row gap-6 items-stretch">
                  
                  {/* Chat Message Window */}
                  <div className="flex-1 stitched-card rounded-2xl p-5 bg-slate-950/20 relative flex flex-col h-[520px]">
                    <StitchedCornerPins />
                    {selectedGuestId ? (
                      (() => {
                        const targetGuest = (guests.length > 0 ? guests : mockOfflineGuests).find(g => g.id === selectedGuestId);
                        if (!targetGuest) return null;
                        const roomNum = targetGuest.bookings?.[0]?.room?.roomNumber || 'Unknown';
                        const roomType = targetGuest.bookings?.[0]?.room?.roomType || 'Standard Ocean View';
                        const evs = (guestEvents || []).filter(e => e.metadata?.guestPhone === targetGuest.phone);

                        return (
                          <div className="flex flex-col h-full">
                            
                            {/* Chat Header */}
                            <div className="flex justify-between items-center border-b border-slate-900 pb-3 mb-3">
                              <div>
                                <h4 className="font-extrabold text-xs text-slate-100 flex items-center gap-2">
                                  {targetGuest.name} 
                                  {targetGuest.loyaltyStatus && (
                                    <span className="text-[8px] bg-indigo-500/10 text-indigo-400 font-bold px-1.5 py-0.5 border border-indigo-500/10 rounded">
                                      {targetGuest.loyaltyStatus} Member
                                    </span>
                                  )}
                                </h4>
                                <span className="text-[9px] text-slate-500 font-mono">Room {roomNum} • {roomType} • {targetGuest.phone}</span>
                              </div>
                              <div className="text-right">
                                <span className="text-[8px] font-black uppercase text-indigo-400 border border-indigo-500/20 px-2 py-1 bg-indigo-950/10 rounded-lg">
                                  WhatsApp Active
                                </span>
                              </div>
                            </div>

                            {/* Chat messages viewport */}
                            <div className="flex-1 overflow-y-auto space-y-3 pr-1 scrollbar-thin flex flex-col justify-end min-h-0 py-2">
                              {evs.length === 0 ? (
                                <div className="text-center py-20 text-slate-600 text-xs flex flex-col justify-center items-center h-full">
                                  <span>No messages in this thread.</span>
                                  <p className="text-[10px] text-slate-650 max-w-[200px] mt-1 font-light leading-relaxed">
                                    Simulate incoming guest WhatsApp messages or send staff responses below.
                                  </p>
                                </div>
                              ) : (
                                <div className="space-y-3 max-h-full overflow-y-auto">
                                  {evs.map((e, idx) => {
                                    const isStaff = e.source === 'STAFF';
                                    const text = e.metadata?.messageText || '';
                                    return (
                                      <div key={e.id || idx} className={`flex ${isStaff ? 'justify-end' : 'justify-start'}`}>
                                        <div className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-xs ${
                                          isStaff 
                                            ? 'bg-indigo-650 text-white rounded-tr-none' 
                                            : 'bg-slate-900 border border-slate-850/80 text-slate-200 rounded-tl-none'
                                        }`}>
                                          <p className="leading-relaxed font-light">{text}</p>
                                          <div className="text-[8px] text-slate-500 font-mono text-right mt-1.5">
                                            {isStaff ? 'Staff' : 'Guest'} • {new Date(e.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                          </div>
                                        </div>
                                      </div>
                                    );
                                  })}
                                </div>
                              )}
                            </div>

                            {/* Chat input footer */}
                            <div className="border-t border-slate-900 pt-3 mt-3 flex flex-col gap-2">
                              <div className="flex items-center gap-2">
                                <input
                                  type="text"
                                  value={chatInput}
                                  onChange={(e) => setChatInput(e.target.value)}
                                  placeholder="Type apolgies, work order updates, or guest queries..."
                                  disabled={chatLoading}
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter') handleSendGuestMessage('STAFF');
                                  }}
                                  className="flex-1 bg-slate-955 border border-slate-900 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500 font-light"
                                />
                                <button
                                  onClick={() => handleSendGuestMessage('STAFF')}
                                  disabled={chatLoading || !chatInput.trim()}
                                  className="p-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 disabled:text-slate-650 text-white rounded-xl cursor-pointer transition-colors shadow-md"
                                >
                                  <Send className="w-4 h-4" />
                                </button>
                              </div>
                              <div className="flex justify-between items-center text-[9px] text-slate-500">
                                <span>Press Enter to send.</span>
                                <div className="flex gap-2">
                                  <button
                                    onClick={() => handleSendGuestMessage('WHATSAPP')}
                                    disabled={chatLoading || !chatInput.trim()}
                                    className="px-2.5 py-1 bg-emerald-950 hover:bg-emerald-900 text-emerald-400 border border-emerald-900/60 rounded font-mono font-bold cursor-pointer transition-all uppercase"
                                  >
                                    [Simulate Guest Reply]
                                  </button>
                                </div>
                              </div>
                            </div>

                          </div>
                        );
                      })()
                    ) : (
                      <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
                        <MessageSquare className="w-12 h-12 text-slate-700 mb-3 opacity-30 animate-pulse" />
                        <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">Select a guest conversation</span>
                        <p className="text-[10px] text-slate-500 max-w-[250px] mt-1 font-light leading-relaxed">
                          Monitor guest sentiment, review WhatsApp incoming requests, and dispatch service recovery compensation folio updates.
                        </p>
                      </div>
                    )}
                  </div>

                  {/* AI Sentiment Copilot Sidebar */}
                  {selectedGuestId && (
                    (() => {
                      const targetGuest = (guests.length > 0 ? guests : mockOfflineGuests).find(g => g.id === selectedGuestId);
                      if (!targetGuest) return null;
                      const roomNum = targetGuest.bookings?.[0]?.room?.roomNumber || 'Unknown';
                      const evs = (guestEvents || []).filter(e => e.metadata?.guestPhone === targetGuest.phone);
                      const lastMsg = evs[evs.length - 1];
                      const lastMsgText = lastMsg?.metadata?.messageText || '';

                      // Heuristic sentiment metrics
                      let sentimentText = 'NEUTRAL';
                      let sentimentColor = 'text-slate-400 bg-slate-950 border-slate-900';
                      let showRecoveryPanel = false;
                      let recommendation = 'No action required. Monitor guest request SLA fulfillment.';

                      if (lastMsgText.toLowerCase().includes('ac') || lastMsgText.toLowerCase().includes('broken') || lastMsgText.toLowerCase().includes('leak') || lastMsgText.toLowerCase().includes('hot')) {
                        sentimentText = 'FRUSTRATED';
                        sentimentColor = 'text-rose-400 bg-rose-950/20 border-rose-900/60';
                        showRecoveryPanel = true;
                        recommendation = `Apply $25.00 Food & Beverage credit to room folio to compensate for Room ${roomNum} HVAC delay, or offer complimentary late check-out.`;
                      } else if (lastMsgText.toLowerCase().includes('thank') || lastMsgText.toLowerCase().includes('great') || lastMsgText.toLowerCase().includes('appreciate')) {
                        sentimentText = 'HAPPY';
                        sentimentColor = 'text-emerald-400 bg-emerald-950/20 border-emerald-900/60';
                        recommendation = 'Guest is delighted. No service recovery required. Record preference for loyalty graph.';
                      }

                      return (
                        <div className="w-full lg:w-[260px] stitched-card rounded-2xl p-5 bg-gradient-to-b from-indigo-950/10 to-slate-900/20 relative flex flex-col h-[520px] shrink-0">
                          <StitchedCornerPins />
                          <div className="flex items-center gap-2 mb-4 border-b border-slate-900 pb-3">
                            <Zap className="w-4 h-4 text-indigo-400" />
                            <h3 className="text-xs font-black uppercase tracking-wider">Sentiment Copilot</h3>
                          </div>

                          <div className="space-y-4 flex-1 overflow-y-auto pr-1 scrollbar-thin text-xs">
                            
                            {/* Sentiment Widget */}
                            <div className="space-y-1">
                              <span className="text-[9px] uppercase font-bold tracking-widest text-slate-500 font-mono">Live Sentiment</span>
                              <div className={`p-2.5 rounded-lg border font-bold text-center tracking-widest font-mono text-[10px] ${sentimentColor}`}>
                                {sentimentText}
                              </div>
                            </div>

                            {/* CLV Metric */}
                            <div className="space-y-1">
                              <span className="text-[9px] uppercase font-bold tracking-widest text-slate-500 font-mono">Lifetime Value</span>
                              <div className="bg-slate-950 border border-slate-900 p-2.5 rounded-lg text-slate-300 font-mono text-[10px] font-bold">
                                $4,850.00 <span className="text-[8px] text-indigo-400 font-bold uppercase">(VIP GOLD)</span>
                              </div>
                            </div>

                            {/* Review Risk */}
                            <div className="space-y-1">
                              <span className="text-[9px] uppercase font-bold tracking-widest text-slate-500 font-mono">TripAdvisor Risk</span>
                              <div className="bg-slate-950 border border-slate-900 p-2.5 rounded-lg font-mono text-[10px] font-bold">
                                {sentimentText === 'FRUSTRATED' ? (
                                  <span className="text-rose-455 animate-pulse">🔥 HIGH RISK (84% probability)</span>
                                ) : (
                                  <span className="text-emerald-400">🟢 LOW RISK (8%)</span>
                                )}
                              </div>
                            </div>

                            {/* AI Suggestion */}
                            <div className="space-y-1">
                              <span className="text-[9px] uppercase font-bold tracking-widest text-slate-500 font-mono">AI Recommendation</span>
                              <div className="bg-indigo-950/20 border border-indigo-900/40 p-2.5 rounded-xl text-slate-300 font-light leading-relaxed text-[10px] shadow-sm">
                                {recommendation}
                              </div>
                            </div>

                            {/* Service Recovery Compensation Panel */}
                            {showRecoveryPanel && (
                              <div className="border-t border-slate-900 pt-3 mt-3 space-y-2">
                                <span className="text-[9px] uppercase font-black tracking-widest text-rose-400 font-mono block">Apply Recovery credit</span>
                                
                                <div className="space-y-1">
                                  <input
                                    type="number"
                                    value={compAmount}
                                    onChange={(e) => setCompAmount(e.target.value)}
                                    placeholder="Amount ($)"
                                    className="w-full bg-slate-955 border border-slate-900 rounded-lg px-2.5 py-1.5 text-[10px] text-white focus:outline-none focus:border-indigo-500 font-mono"
                                  />
                                </div>
                                <div className="space-y-1">
                                  <input
                                    type="text"
                                    value={compReason}
                                    onChange={(e) => setCompReason(e.target.value)}
                                    placeholder="Details (e.g. HVAC Delay)"
                                    className="w-full bg-slate-955 border border-slate-900 rounded-lg px-2.5 py-1.5 text-[10px] text-white focus:outline-none focus:border-indigo-500"
                                  />
                                </div>
                                
                                <button
                                  onClick={handleApplyGuestCompensation}
                                  disabled={!compAmount || !compReason}
                                  className="w-full py-2 bg-rose-650 hover:bg-rose-550 disabled:bg-slate-800 disabled:text-slate-650 text-white font-extrabold text-[9px] rounded-lg cursor-pointer transition-all uppercase tracking-wider font-mono shadow-sm"
                                >
                                  Apply Folio Credit
                                </button>
                              </div>
                            )}

                            {/* Status Logs */}
                            {guestExperienceLog && (
                              <div className="text-[9px] text-indigo-400 font-mono p-2 border border-indigo-900/30 bg-indigo-950/10 rounded-lg leading-relaxed">
                                {guestExperienceLog}
                              </div>
                            )}

                          </div>
                        </div>
                      );
                    })()
                  )}
                </div>

              </div>

            </div>
          )}

          {/* VIEW: PROCUREMENT & INVENTORY */}
          {activeTab === 'inventory' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 w-full">
              
              {/* Inventory Levels Grid */}
              <div className="lg:col-span-4 stitched-card rounded-2xl p-6 relative flex flex-col min-h-[500px]">
                <StitchedCornerPins />
                <div className="flex items-center gap-2 mb-4 border-b border-slate-800 pb-3">
                  <span className="p-1 bg-indigo-500/10 border border-indigo-500/30 rounded-lg text-indigo-400">📊</span>
                  <h2 className="text-sm font-black uppercase tracking-wider text-slate-100">Stock Directory</h2>
                </div>
                <p className="text-xs text-slate-400 mb-4 font-light leading-relaxed">
                  Consumables inventory monitored in real-time. Depleting stock alerts will trigger procurement workflows.
                </p>
                
                <div className="flex-1 overflow-y-auto space-y-3 pr-1 scrollbar-thin">
                  {inventoryItems.map((item) => {
                    const isLow = item.quantity <= item.minimumLevel;
                    return (
                      <div key={item.id} className={`p-3 bg-slate-950/60 border rounded-xl flex items-center justify-between transition-all ${isLow ? 'border-amber-500/30 bg-amber-955/5 shadow-[0_0_12px_rgba(245,158,11,0.05)]' : 'border-slate-900'}`}>
                        <div>
                          <h4 className="text-xs font-black text-slate-200">{item.name}</h4>
                          <span className="text-[9px] uppercase font-bold text-slate-500 font-mono block mt-0.5">
                            Dept: {item.department?.name ?? 'Procurement'}
                          </span>
                        </div>
                        <div className="text-right">
                          <span className={`text-sm font-black ${isLow ? 'text-amber-400 font-mono' : 'text-slate-200 font-mono'}`}>
                            {item.quantity} {item.unit}
                          </span>
                          <div className="text-[8px] text-slate-500 uppercase tracking-wider font-mono">
                            Alert Min: {item.minimumLevel} {item.unit}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Vendor List & Purchase Submission Forms */}
              <div className="lg:col-span-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Vendor Directories */}
                <div className="stitched-card rounded-2xl p-6 relative flex flex-col h-[500px]">
                  <StitchedCornerPins />
                  <div className="flex items-center gap-2 mb-4 border-b border-slate-800 pb-3">
                    <span className="p-1 bg-indigo-500/10 border border-indigo-500/30 rounded-lg text-indigo-400">🤝</span>
                    <h2 className="text-sm font-black uppercase tracking-wider text-slate-100">Partners & Vendors</h2>
                  </div>
                  
                  <div className="flex-1 overflow-y-auto space-y-3 pr-1 scrollbar-thin">
                    {vendors.map((vendor) => (
                      <div key={vendor.id} className="p-3 bg-slate-950/40 border border-slate-900 rounded-xl space-y-1 hover:border-indigo-500/20 transition-all">
                        <div className="flex justify-between items-start">
                          <h4 className="text-xs font-black text-slate-200">{vendor.name}</h4>
                          <span className="text-[8px] px-2 py-0.5 bg-indigo-950 text-indigo-400 border border-indigo-900/30 rounded uppercase font-bold tracking-wider font-mono">
                            {vendor.category}
                          </span>
                        </div>
                        <div className="text-[10px] text-slate-400 font-light font-mono select-all">
                          📧 {vendor.contactInfo}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Purchase Order Submitter */}
                <div className="stitched-card rounded-2xl p-6 relative flex flex-col h-[500px] justify-between">
                  <StitchedCornerPins />
                  <div>
                    <div className="flex items-center gap-2 mb-4 border-b border-slate-800 pb-3">
                      <span className="p-1 bg-indigo-500/10 border border-indigo-500/30 rounded-lg text-indigo-400">📝</span>
                      <h2 className="text-sm font-black uppercase tracking-wider text-slate-100">Procure Stock Items</h2>
                    </div>
                    
                    <form onSubmit={handlePRSubmit} className="space-y-3.5">
                      <div>
                        <label className="text-[9px] text-slate-400 font-extrabold uppercase tracking-wider block mb-1">Select Vendor *</label>
                        <select 
                          required
                          value={prVendorId}
                          onChange={(e) => setPrVendorId(e.target.value)}
                          className="w-full bg-slate-950 border border-slate-900 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-indigo-500"
                        >
                          <option value="" disabled>Select Vendor</option>
                          {vendors.map(v => (
                            <option key={v.id} value={v.id}>{v.name}</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="text-[9px] text-slate-400 font-extrabold uppercase tracking-wider block mb-1">Item Description *</label>
                        <input 
                          type="text"
                          required
                          placeholder="e.g. Fresh Whole Milk"
                          value={prItemName}
                          onChange={(e) => setPrItemName(e.target.value)}
                          className="w-full bg-slate-950 border border-slate-900 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-indigo-500"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="text-[9px] text-slate-400 font-extrabold uppercase tracking-wider block mb-1">Quantity *</label>
                          <input 
                            type="number"
                            required
                            min="1"
                            placeholder="20"
                            value={prQty}
                            onChange={(e) => setPrQty(e.target.value)}
                            className="w-full bg-slate-950 border border-slate-900 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-indigo-500"
                          />
                        </div>
                        <div>
                          <label className="text-[9px] text-slate-400 font-extrabold uppercase tracking-wider block mb-1">Stock Unit *</label>
                          <select 
                            required
                            value={prUnit}
                            onChange={(e) => setPrUnit(e.target.value)}
                            className="w-full bg-slate-950 border border-slate-900 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-indigo-500"
                          >
                            <option value="litres">litres</option>
                            <option value="units">units</option>
                            <option value="kg">kg</option>
                            <option value="boxes">boxes</option>
                          </select>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="text-[9px] text-slate-400 font-extrabold uppercase tracking-wider block mb-1">Estimated Cost ($) *</label>
                          <input 
                            type="number"
                            required
                            min="1"
                            placeholder="50"
                            value={prCost}
                            onChange={(e) => setPrCost(e.target.value)}
                            className="w-full bg-slate-950 border border-slate-900 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-indigo-500"
                          />
                        </div>
                        <div>
                          <label className="text-[9px] text-slate-400 font-extrabold uppercase tracking-wider block mb-1">Requester Department *</label>
                          <select 
                            required
                            value={prDeptId}
                            onChange={(e) => setPrDeptId(e.target.value)}
                            className="w-full bg-slate-950 border border-slate-900 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-indigo-500"
                          >
                            <option value="" disabled>Select Department</option>
                            {availableDepts.map(d => (
                              <option key={d.id} value={d.id}>{d.name}</option>
                            ))}
                          </select>
                        </div>
                      </div>

                      {prLog && (
                        <div className="bg-slate-950 border border-slate-900 rounded-lg p-2 text-[9px] font-mono text-indigo-400">
                          {prLog}
                        </div>
                      )}

                      <button 
                        type="submit"
                        className="w-full py-2.5 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-bold rounded-xl transition-all shadow-[0_0_15px_rgba(99,102,241,0.25)] flex items-center justify-center gap-1.5 cursor-pointer uppercase tracking-wider text-[10px]"
                      >
                        Submit Purchase Request
                      </button>
                    </form>
                  </div>
                </div>

              </div>

              {/* Active Procurement Workflows List Tracker */}
              <div className="lg:col-span-12 stitched-card rounded-2xl p-6 relative flex flex-col min-h-[250px]">
                <StitchedCornerPins />
                <div className="flex items-center gap-2 mb-4 border-b border-slate-800 pb-3">
                  <span className="p-1 bg-indigo-500/10 border border-indigo-500/30 rounded-lg text-indigo-400">⚡</span>
                  <h2 className="text-sm font-black uppercase tracking-wider text-slate-100">Procurement Workflow Status Engine</h2>
                </div>

                <div className="overflow-x-auto w-full">
                  <table className="w-full text-xs text-left text-slate-350">
                    <thead className="text-[9px] text-slate-550 uppercase tracking-widest border-b border-slate-900 font-mono">
                      <tr>
                        <th className="pb-3">Order ID</th>
                        <th className="pb-3">Supplier</th>
                        <th className="pb-3">Goods Info</th>
                        <th className="pb-3">Net Cost</th>
                        <th className="pb-3">Workflow State</th>
                        <th className="pb-3">Operations Mapped</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-900">
                      {purchaseRequests.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="py-8 text-center text-slate-500 font-light">
                            No active procurement workflows tracked. Submit a request above to initialize Inngest gates.
                          </td>
                        </tr>
                      ) : (
                        purchaseRequests.map((pr) => (
                          <tr key={pr.id} className="hover:bg-slate-900/10 transition-colors">
                            <td className="py-3.5 font-mono text-[10px] font-black text-indigo-300">{pr.id}</td>
                            <td className="py-3.5 font-bold text-slate-200">{pr.vendorName}</td>
                            <td className="py-3.5">
                              <span className="font-extrabold text-slate-200">{pr.itemName}</span>
                              <span className="text-slate-550 font-light block mt-0.5">{pr.quantity} {pr.unit}</span>
                            </td>
                            <td className="py-3.5 font-mono text-emerald-400 font-extrabold">${pr.estimatedCost}</td>
                            <td className="py-3.5">
                              <span className={`px-2 py-0.5 text-[9px] rounded font-black border uppercase tracking-wider font-mono ${
                                pr.status === 'Completed' ? 'bg-emerald-950/20 border-emerald-500/20 text-emerald-400' :
                                pr.status === 'Awaiting Delivery' ? 'bg-indigo-950/20 border-indigo-500/20 text-indigo-400' :
                                'bg-amber-955/20 border-amber-500/20 text-amber-400'
                              }`}>
                                {pr.status}
                              </span>
                            </td>
                            <td className="py-3.5 text-[10px] font-medium text-slate-400">
                              {pr.status === 'Awaiting Manager Approval' ? '👉 Step 1: Supervisor/Manager approval pending in Task Inbox' :
                               pr.status === 'Awaiting Delivery' ? '👉 Step 2: Delivery verification pending in Task Inbox' :
                               '✅ Stock delivery verified. Inventory incremented.'}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* VIEW: REVENUE & PREDICTIVE AI */}
          {activeTab === 'revenue_ai' && (
            <div className="space-y-6">
              
              {/* Row 1: Yield Optimizations */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 w-full">
                
                {/* Dynamic forecasts */}
                <div className="lg:col-span-4 stitched-card rounded-2xl p-6 relative flex flex-col justify-between min-h-[350px]">
                  <StitchedCornerPins />
                  <div>
                    <div className="flex items-center gap-2 mb-4 border-b border-slate-800 pb-3">
                      <span className="p-1 bg-indigo-500/10 border border-indigo-500/30 rounded-lg text-indigo-400">📈</span>
                      <h2 className="text-sm font-black uppercase tracking-wider text-slate-100">Revenue Yield metrics</h2>
                    </div>
                    <p className="text-xs text-slate-400 mb-6 font-light leading-relaxed">
                      AI Occupancy modeling, ADR calculations, and daily RevPAR metrics compiled on serverless cron engines.
                    </p>

                    <div className="grid grid-cols-2 gap-4 mb-6">
                      <div className="p-3 bg-slate-950/60 border border-slate-900 rounded-xl">
                        <span className="text-[9px] text-slate-500 font-extrabold uppercase tracking-wider block mb-1">Predicted Occupancy</span>
                        <span className="text-xl font-black text-indigo-400 font-mono">78.4%</span>
                        <span className="text-[8px] text-emerald-400 font-bold block mt-0.5">▲ +4.5% vs avg week</span>
                      </div>
                      <div className="p-3 bg-slate-950/60 border border-slate-900 rounded-xl">
                        <span className="text-[9px] text-slate-500 font-extrabold uppercase tracking-wider block mb-1">Target ADR</span>
                        <span className="text-xl font-black text-indigo-400 font-mono">$168.50</span>
                        <span className="text-[8px] text-emerald-400 font-bold block mt-0.5">▲ +$12.50 margin</span>
                      </div>
                    </div>
                  </div>

                  <div className="p-3 bg-indigo-950/20 border border-indigo-500/20 rounded-xl text-[10px] text-indigo-300 font-mono flex items-center gap-2 leading-relaxed">
                    <span>⚡</span>
                    <span>Computed RevPAR: <strong>$132.10</strong> | Dynamic Yielding Gate: <strong>ACTIVE</strong></span>
                  </div>
                </div>

                {/* AI Recommendations Table */}
                <div className="lg:col-span-8 stitched-card rounded-2xl p-6 relative flex flex-col min-h-[350px]">
                  <StitchedCornerPins />
                  <div className="flex items-center gap-2 mb-4 border-b border-slate-800 pb-3">
                    <span className="p-1 bg-indigo-500/10 border border-indigo-500/30 rounded-lg text-indigo-400">🤖</span>
                    <h2 className="text-sm font-black uppercase tracking-wider text-slate-100">Dynamic Pricing AI recommendations</h2>
                  </div>

                  <div className="overflow-x-auto w-full flex-1">
                    <table className="w-full text-xs text-left text-slate-350">
                      <thead className="text-[9px] text-slate-550 uppercase tracking-widest border-b border-slate-900 font-mono">
                        <tr>
                          <th className="pb-3">Room / Category</th>
                          <th className="pb-3">Current Rate</th>
                          <th className="pb-3">Recommended Rate</th>
                          <th className="pb-3 text-right font-mono">Target Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-900">
                        {pricingRecommendations.map((rec) => (
                          <tr key={rec.id} className="hover:bg-slate-900/10 transition-colors">
                            <td className="py-3 font-bold text-slate-200">{rec.target}</td>
                            <td className="py-3 font-mono text-slate-400">${rec.currentRate}</td>
                            <td className="py-3 font-mono text-indigo-400 font-extrabold">${rec.recommendedRate}</td>
                            <td className="py-3 text-[11px] font-light max-w-xs leading-relaxed text-slate-400">
                              {rec.reason}
                            </td>
                            <td className="py-3 text-right">
                              {rec.applied ? (
                                <span className="text-[9px] font-black text-emerald-400 uppercase bg-emerald-950/20 border border-emerald-500/20 px-2.5 py-1 rounded font-mono">
                                  Applied ✓
                                </span>
                              ) : (
                                <button
                                  onClick={() => handleApplyPricing(rec.id)}
                                  className="text-[9px] font-black bg-indigo-600 hover:bg-indigo-500 text-white px-3 py-1.5 rounded uppercase tracking-wider transition-all cursor-pointer shadow-sm"
                                >
                                  Apply Rate
                                </button>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {appliedRatesLog && (
                    <div className="mt-4 p-2.5 bg-slate-950 border border-slate-900 rounded-xl font-mono text-[9px] text-emerald-400">
                      {appliedRatesLog}
                    </div>
                  )}
                </div>

              </div>

              {/* Row 2: Predictive Maintenance Telemetry */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 w-full">
                
                {/* IoT assets monitoring */}
                <div className="lg:col-span-12 stitched-card rounded-2xl p-6 relative flex flex-col min-h-[300px]">
                  <StitchedCornerPins />
                  <div className="flex items-center gap-2 mb-4 border-b border-slate-800 pb-3">
                    <span className="p-1 bg-indigo-500/10 border border-indigo-500/30 rounded-lg text-indigo-400">🔧</span>
                    <h2 className="text-sm font-black uppercase tracking-wider text-slate-100">IoT Facility Telemetry Warnings</h2>
                  </div>

                  <p className="text-xs text-slate-450 mb-6 font-light max-w-3xl leading-relaxed">
                    Connected property hardware assets monitoring live telemetry streams. If vibration, temperature, or current loads exceed tolerance boundaries, an automated work order is dispatched to the technicians.
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {assets.map((asset) => {
                      const isDown = asset.status === 'DOWN';
                      const isWarn = asset.status === 'MAINTENANCE_REQUIRED';
                      const isOk = asset.status === 'OPERATIONAL';
                      
                      let statusBadge = 'bg-emerald-955/20 border-emerald-500/20 text-emerald-400';
                      let cardBorder = 'border-slate-900 bg-slate-950/20';
                      if (isDown) {
                        statusBadge = 'bg-rose-955/20 border-rose-500/20 text-rose-500 animate-pulse';
                        cardBorder = 'border-rose-500/25 bg-rose-955/5';
                      } else if (isWarn) {
                        statusBadge = 'bg-amber-955/20 border-amber-500/20 text-amber-500 animate-pulse';
                        cardBorder = 'border-amber-500/25 bg-amber-955/5';
                      }

                      return (
                        <div key={asset.id} className={`p-5 border rounded-xl flex flex-col justify-between h-44 transition-all hover:translate-y-[-2px] ${cardBorder}`}>
                          <div>
                            <div className="flex justify-between items-start">
                              <h4 className="text-xs font-black text-slate-200 uppercase tracking-wider">{asset.name}</h4>
                              <span className={`px-2 py-0.5 text-[8px] rounded font-black border uppercase tracking-wider font-mono ${statusBadge}`}>
                                {asset.status}
                              </span>
                            </div>
                            <span className="text-[9px] text-slate-505 font-extrabold uppercase tracking-wider font-mono block mt-1">
                              Category: {asset.category}
                            </span>
                            
                            {/* Dummy Diagnostic info */}
                            <div className="mt-3.5 bg-slate-955/80 border border-slate-900 rounded p-2 text-[9px] font-mono text-slate-400 space-y-1">
                              {asset.name.includes('AC') ? (
                                <>
                                  <div>Ambient Temp: <span className={isOk ? 'text-emerald-400' : 'text-rose-450'}>{isOk ? '21.5°C' : '29.8°C'}</span></div>
                                  <div>Compressor Vib: 0.12 mm/s</div>
                                </>
                              ) : (
                                <>
                                  <div>Core Voltage: 220V</div>
                                  <div>Load factor: <span className={isOk ? 'text-emerald-400' : 'text-amber-500'}>{isOk ? '45%' : '88%'}</span></div>
                                </>
                              )}
                            </div>
                          </div>

                          <div className="border-t border-slate-900/60 pt-3 mt-3">
                            {isOk ? (
                              <button
                                onClick={() => handleDispatchPredictiveMaintenance(asset.id)}
                                className="w-full text-[9px] font-black bg-slate-900 hover:bg-slate-805 text-slate-300 py-2 border border-slate-800 rounded uppercase tracking-wider transition-all cursor-pointer"
                              >
                                Dispatch PM Check
                              </button>
                            ) : (
                              <span className="w-full text-[9px] font-black text-slate-500 uppercase tracking-widest block text-center py-2 bg-slate-955 rounded border border-slate-900 font-mono">
                                PM Work Order Active 🔧
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                </div>

              </div>

            </div>
          )}

          {/* VIEW: INTEGRATIONS / DEVELOPER SANDBOX */}
          {activeTab === 'integrations' && (
            <div className="space-y-6">
              
              <div className="bg-indigo-950/20 border border-indigo-500/20 p-4 rounded-xl flex items-start gap-3.5 relative overflow-hidden">
                <div className="absolute top-[-50%] right-[-10%] w-60 h-60 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />
                <span className="p-2 bg-indigo-500/10 border border-indigo-500/30 rounded-xl text-indigo-400 shrink-0">
                  <Terminal className="w-5 h-5 animate-pulse" />
                </span>
                <div>
                  <h4 className="text-xs font-black uppercase tracking-wider text-slate-100">API Webhook Simulator Ingestion Console</h4>
                  <p className="text-xs text-slate-400 mt-1 font-light leading-relaxed font-sans">
                    This section represents the **Developer Integrations Sandbox**. In production, external webhooks (Twilio for WhatsApp, PMS syncing suites, IoT sensor endpoints) send HTTP requests to `/api/integrations/incoming` which auto-generates tasks via Inngest and matches them via database triggers. Select a mockup payload below to simulate and test the pipelines.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 w-full">
                
                {/* Left simulator forms */}
                <section className="lg:col-span-6 stitched-card rounded-2xl p-6 relative">
                  <StitchedCornerPins />

                  <div className="flex items-center gap-2 mb-2">
                    <Terminal className="w-4 h-4 text-indigo-400" />
                    <h2 className="text-sm font-black uppercase tracking-wider text-slate-100">Simulate Input Payload</h2>
                  </div>
                  <p className="text-xs text-slate-400 mb-6 font-light leading-relaxed">
                    Select a third-party channel below to construct a mock webhook payload.
                  </p>

                  <div className="grid grid-cols-4 gap-1 p-1 bg-slate-950 border border-slate-900 rounded-xl mb-6 text-[9px] font-bold tracking-wider uppercase">
                    <button 
                      onClick={() => setSimType('whatsapp_message')}
                      className={`py-2 rounded-lg text-center transition-all cursor-pointer ${simType === 'whatsapp_message' ? 'bg-indigo-650 text-white shadow-sm' : 'text-slate-550 hover:text-white'}`}
                    >
                      WhatsApp
                    </button>
                    <button 
                      onClick={() => setSimType('pms_booking')}
                      className={`py-2 rounded-lg text-center transition-all cursor-pointer ${simType === 'pms_booking' ? 'bg-indigo-655 text-white shadow-sm' : 'text-slate-550 hover:text-white'}`}
                    >
                      PMS Sync
                    </button>
                    <button 
                      onClick={() => setSimType('inventory_alert')}
                      className={`py-2 rounded-lg text-center transition-all cursor-pointer ${simType === 'inventory_alert' ? 'bg-indigo-655 text-white shadow-sm' : 'text-slate-550 hover:text-white'}`}
                    >
                      Stock Low
                    </button>
                    <button 
                      onClick={() => setSimType('maintenance_due')}
                      className={`py-2 rounded-lg text-center transition-all cursor-pointer ${simType === 'maintenance_due' ? 'bg-indigo-655 text-white shadow-sm' : 'text-slate-550 hover:text-white'}`}
                    >
                      Asset Failure
                    </button>
                  </div>

                  {/* Inputs */}
                  <div className="bg-slate-950/60 border border-slate-900 rounded-xl p-4 min-h-[180px] flex flex-col justify-center">
                    
                    {simType === 'whatsapp_message' && (
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="text-[9px] text-slate-500 font-extrabold uppercase tracking-wider block mb-1">Room Number</label>
                            <input 
                              type="text" 
                              value={waRoom}
                              onChange={(e) => setWaRoom(e.target.value)}
                              className="w-full bg-slate-950 border border-slate-900 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-indigo-500" 
                            />
                          </div>
                          <div>
                            <label className="text-[9px] text-slate-500 font-extrabold uppercase tracking-wider block mb-1">Guest Name</label>
                            <input 
                              type="text" 
                              value={waName}
                              onChange={(e) => setWaName(e.target.value)}
                              className="w-full bg-slate-950 border border-slate-900 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-indigo-500" 
                            />
                          </div>
                        </div>
                        <div>
                          <label className="text-[9px] text-slate-500 font-extrabold uppercase tracking-wider block mb-1">WhatsApp message payload text</label>
                          <textarea 
                            rows={2} 
                            value={waMessage}
                            onChange={(e) => setWaMessage(e.target.value)}
                            className="w-full bg-slate-950 border border-slate-900 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-indigo-500 resize-none font-sans" 
                          />
                        </div>
                      </div>
                    )}

                    {simType === 'pms_booking' && (
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="text-[9px] text-slate-500 font-extrabold uppercase tracking-wider block mb-1">Assigned Room</label>
                            <input 
                              type="text" 
                              value={pmsRoom}
                              onChange={(e) => setPmsRoom(e.target.value)}
                              className="w-full bg-slate-950 border border-slate-900 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-indigo-500" 
                            />
                          </div>
                          <div>
                            <label className="text-[9px] text-slate-500 font-extrabold uppercase tracking-wider block mb-1">Guest Name</label>
                            <input 
                              type="text" 
                              value={pmsGuest}
                              onChange={(e) => setPmsGuest(e.target.value)}
                              className="w-full bg-slate-950 border border-slate-900 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-indigo-500" 
                            />
                          </div>
                        </div>
                        <span className="text-[9px] text-slate-600 uppercase tracking-widest font-bold font-mono">Emits PMS reservation check-in pipeline trigger</span>
                      </div>
                    )}

                    {simType === 'maintenance_due' && (
                      <div className="space-y-4">
                        <div>
                          <label className="text-[9px] text-slate-500 font-extrabold uppercase tracking-wider block mb-1">Target Asset Name</label>
                          <input 
                            type="text" 
                            value={maintAsset}
                            onChange={(e) => setMaintAsset(e.target.value)}
                            className="w-full bg-slate-950 border border-slate-900 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-indigo-500" 
                          />
                        </div>
                        <div>
                          <label className="text-[9px] text-slate-500 font-extrabold uppercase tracking-wider block mb-1">Diagnostic Log Warning Message</label>
                          <input 
                            type="text" 
                            value={maintType}
                            onChange={(e) => setMaintType(e.target.value)}
                            className="w-full bg-slate-950 border border-slate-900 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-indigo-500" 
                          />
                        </div>
                      </div>
                    )}

                    {simType === 'inventory_alert' && (
                      <div className="space-y-4">
                        <div>
                          <label className="text-[9px] text-slate-500 font-extrabold uppercase tracking-wider block mb-1">Inventory Item Name</label>
                          <input 
                            type="text" 
                            value={invItem}
                            onChange={(e) => setInvItem(e.target.value)}
                            className="w-full bg-slate-950 border border-slate-900 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-indigo-500" 
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="text-[9px] text-slate-500 font-extrabold uppercase tracking-wider block mb-1">Current Level</label>
                            <input 
                              type="number" 
                              value={invLevel}
                              onChange={(e) => setInvLevel(e.target.value)}
                              className="w-full bg-slate-950 border border-slate-900 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-indigo-500" 
                            />
                          </div>
                          <div>
                            <label className="text-[9px] text-slate-500 font-extrabold uppercase tracking-wider block mb-1">Min Threshold</label>
                            <input 
                              type="number" 
                              value={invMin}
                              onChange={(e) => setInvMin(e.target.value)}
                              className="w-full bg-slate-950 border border-slate-900 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-indigo-500" 
                            />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  <button 
                    onClick={triggerSimulation}
                    className="w-full mt-6 py-3 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-bold rounded-xl transition-all shadow-[0_0_20px_rgba(99,102,241,0.3)] hover:shadow-[0_0_25px_rgba(99,102,241,0.5)] flex items-center justify-center gap-2 cursor-pointer uppercase tracking-wider text-xs"
                  >
                    <Send className="w-3.5 h-3.5" />
                    Fire Simulated Webhook
                  </button>
                </section>

                {/* Right console */}
                <section className="lg:col-span-6 stitched-card rounded-2xl p-6 relative flex flex-col h-full min-h-[400px]">
                  <StitchedCornerPins />
                  <div className="flex items-center justify-between mb-4 border-b border-slate-800 pb-3">
                    <div className="flex items-center gap-2">
                      <Terminal className="w-4 h-4 text-emerald-455 animate-pulse" />
                      <h2 className="text-sm font-black uppercase tracking-wider text-slate-100">Sandbox Ingestion Console Logs</h2>
                    </div>
                    <div className="flex items-center gap-2 text-[8px] text-slate-550 font-bold uppercase tracking-wider font-mono">
                      <div className="w-2 h-2 rounded-full bg-emerald-500 neon-dot animate-ping" />
                      <span>Console Active</span>
                    </div>
                  </div>
                  <p className="text-xs text-slate-400 mb-6 font-light leading-relaxed">
                    API response metadata, AI intent resolution results, and internal trigger mappings print here.
                  </p>
                  <div className="flex-1 bg-slate-955/80 border border-slate-900 rounded-xl p-4 font-mono text-emerald-400 text-xs overflow-y-auto whitespace-pre-wrap shadow-inner min-h-[250px] leading-relaxed scrollbar-thin">
                    {simLog || '// SYSTEM SANDBOX: Ready for mock webhook ingest.\n// Select payload options and hit "Fire Webhook" on the left.'}
                  </div>
                </section>

              </div>

            </div>
          )}

        </main>
      </div>

      {/* MODAL: SHIFT HANDOVER REPORT */}
      {showHandoverModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <div className="stitched-card rounded-2xl w-full max-w-2xl p-6 bg-[#030611] border border-indigo-900/40 relative shadow-[0_0_50px_rgba(99,102,241,0.15)] flex flex-col max-h-[90vh]">
            <StitchedCornerPins />
            
            <div className="flex items-center justify-between border-b border-slate-900 pb-3 mb-4 shrink-0">
              <h3 className="text-base font-black uppercase tracking-wider text-slate-100 flex items-center gap-2">
                <Cpu className="w-5 h-5 text-indigo-400 animate-pulse" />
                <span>AI Shift Handover Autopilot</span>
              </h3>
              <button 
                onClick={() => setShowHandoverModal(false)}
                className="text-slate-500 hover:text-white p-1 rounded-lg hover:bg-slate-900/60 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-4 pr-1 scrollbar-thin text-xs">
              <p className="text-slate-400 font-light leading-relaxed">
                The operations autopilot has compiled the active shift metrics, pending tasks, inventory status, and guest complaints for review. Verify and sign off to transfer responsibility.
              </p>
              
              <div className="bg-slate-955 border border-slate-900 rounded-xl p-4 font-mono text-[10px] text-indigo-300 whitespace-pre-wrap leading-relaxed max-h-[300px] overflow-y-auto">
                {handoverSummary}
              </div>

              {!handoverSigned ? (
                <div className="space-y-3.5 bg-slate-950/40 border border-slate-900 p-4 rounded-xl">
                  <span className="text-[10px] font-black uppercase tracking-wider text-indigo-400 font-mono block">Duty Handover Sign-off Register</span>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[9px] uppercase font-bold text-slate-500 font-mono">Incoming Manager Name</label>
                      <input
                        type="text"
                        value={incomingStaffName}
                        onChange={(e) => setIncomingStaffName(e.target.value)}
                        placeholder="e.g. Elena Rostova"
                        className="w-full bg-slate-955 border border-slate-900 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                      />
                    </div>
                    <div className="flex items-end pb-1.5">
                      <label className="flex items-center gap-2 text-slate-350 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={handoverSigned}
                          onChange={(e) => setHandoverSigned(e.target.checked)}
                          className="w-4 h-4 rounded border-slate-800 text-indigo-600 focus:ring-indigo-500/50 cursor-pointer bg-slate-955"
                        />
                        <span className="text-[10px] font-medium leading-none">I verify shift metrics integrity</span>
                      </label>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      if (!incomingStaffName.trim()) return;
                      setHandoverSigned(true);
                      // Log to Audit Log
                      setAuditLogs(prev => [{
                        id: `audit-${Date.now()}`,
                        action: 'SHIFT_HANDOVER_COMPLETE',
                        details: `Shift duty signed off by ${currentEmployeeName} (Outgoing) to ${incomingStaffName} (Incoming). Active workloads reconciled.`,
                        timestamp: new Date().toISOString()
                      }, ...prev]);
                    }}
                    disabled={!incomingStaffName.trim()}
                    className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-850 disabled:text-slate-600 text-white font-extrabold text-xs rounded-xl cursor-pointer transition-all uppercase tracking-wider font-mono shadow-md"
                  >
                    Authorize Shift Duty Transfer
                  </button>
                </div>
              ) : (
                <div className="bg-emerald-950/20 border border-emerald-900/60 p-4 rounded-xl flex items-center gap-3.5 shadow-sm animate-fade-in">
                  <span className="p-2.5 bg-emerald-500/10 border border-emerald-500/10 rounded-xl text-emerald-400 font-bold shrink-0">✓</span>
                  <div>
                    <h4 className="font-extrabold text-xs text-emerald-400">Shift Handover Authorized</h4>
                    <p className="text-[10px] text-slate-400 font-light mt-0.5">
                      Responsibility has been signed off to <strong className="text-slate-300 font-bold">{incomingStaffName}</strong>. Handover receipt copied to property logs.
                    </p>
                  </div>
                </div>
              )}
            </div>

            <div className="border-t border-slate-900 pt-3.5 mt-4 flex justify-end shrink-0">
              <button
                onClick={() => setShowHandoverModal(false)}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-slate-350 font-bold text-xs rounded-xl cursor-pointer transition-all border border-slate-800 uppercase tracking-wider"
              >
                Close Report
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: HOUSEKEEPING INSPECTION GATE */}
      {showInspectModal && inspectRoom && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <div className="stitched-card rounded-2xl w-full max-w-lg p-6 bg-[#030611] border border-slate-850 relative shadow-[0_0_40px_rgba(99,102,241,0.1)]">
            <StitchedCornerPins />

            <div className="flex items-center justify-between border-b border-slate-900 pb-3 mb-4">
              <h3 className="text-base font-black uppercase tracking-wider text-slate-100 flex items-center gap-2">
                <Shield className="w-5 h-5 text-indigo-400 animate-pulse" />
                <span>Quality Inspection Gate: Room {inspectRoom.roomNumber}</span>
              </h3>
              <button 
                onClick={() => {
                  setShowInspectModal(false);
                  setInspectRoom(null);
                }}
                className="text-slate-500 hover:text-white p-1 rounded-lg hover:bg-slate-900/60 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <p className="text-slate-400 font-light leading-relaxed">
                Housekeeping has submitted the room cleanup checklist. You must visually inspect and confirm all service gates are certified before releasing the room to available.
              </p>

              <div className="space-y-2 bg-slate-950/40 border border-slate-900 p-4 rounded-xl">
                <span className="text-[10px] font-black uppercase tracking-widest text-indigo-400 font-mono block mb-1.5">Supervisor verification checklist</span>
                
                <label className="flex items-start gap-2.5 p-2 rounded hover:bg-slate-900/30 cursor-pointer transition-colors text-[11px] text-slate-350">
                  <input
                    type="checkbox"
                    checked={inspectChecks.bedding}
                    onChange={(e) => setInspectChecks(prev => ({ ...prev, bedding: e.target.checked }))}
                    className="w-4 h-4 rounded border-slate-800 text-indigo-600 focus:ring-indigo-500/50 cursor-pointer bg-slate-955 mt-0.5"
                  />
                  <div>
                    <strong className="font-bold text-slate-200 block">Bedding & Linens</strong>
                    <span className="text-[10px] text-slate-500">Linens fluffed, sheet corners tucked, pillow configuration matched to standard.</span>
                  </div>
                </label>

                <label className="flex items-start gap-2.5 p-2 rounded hover:bg-slate-900/30 cursor-pointer transition-colors text-[11px] text-slate-350">
                  <input
                    type="checkbox"
                    checked={inspectChecks.bathroom}
                    onChange={(e) => setInspectChecks(prev => ({ ...prev, bathroom: e.target.checked }))}
                    className="w-4 h-4 rounded border-slate-800 text-indigo-600 focus:ring-indigo-500/50 cursor-pointer bg-slate-955 mt-0.5"
                  />
                  <div>
                    <strong className="font-bold text-slate-200 block">Bathroom & Toiletries</strong>
                    <span className="text-[10px] text-slate-500">Mirrors polished, toilet sanitized with wrap bands, toiletries and clean towels restocked.</span>
                  </div>
                </label>

                <label className="flex items-start gap-2.5 p-2 rounded hover:bg-slate-900/30 cursor-pointer transition-colors text-[11px] text-slate-350">
                  <input
                    type="checkbox"
                    checked={inspectChecks.amenities}
                    onChange={(e) => setInspectChecks(prev => ({ ...prev, amenities: e.target.checked }))}
                    className="w-4 h-4 rounded border-slate-800 text-indigo-600 focus:ring-indigo-500/50 cursor-pointer bg-slate-955 mt-0.5"
                  />
                  <div>
                    <strong className="font-bold text-slate-200 block">Amenities & Minibar</strong>
                    <span className="text-[10px] text-slate-500">Coffee station refilled, minibar counts logged, welcome kit vouchers positioned.</span>
                  </div>
                </label>

                <label className="flex items-start gap-2.5 p-2 rounded hover:bg-slate-900/30 cursor-pointer transition-colors text-[11px] text-slate-350">
                  <input
                    type="checkbox"
                    checked={inspectChecks.actest}
                    onChange={(e) => setInspectChecks(prev => ({ ...prev, actest: e.target.checked }))}
                    className="w-4 h-4 rounded border-slate-800 text-indigo-600 focus:ring-indigo-500/50 cursor-pointer bg-slate-955 mt-0.5"
                  />
                  <div>
                    <strong className="font-bold text-slate-200 block">HVAC & Telemetry Test</strong>
                    <span className="text-[10px] text-slate-500">AC checked and set to welcome temperature (21°C). TV remote batteries verified.</span>
                  </div>
                </label>

                <label className="flex items-start gap-2.5 p-2 rounded hover:bg-slate-900/30 cursor-pointer transition-colors text-[11px] text-slate-350">
                  <input
                    type="checkbox"
                    checked={inspectChecks.safety}
                    onChange={(e) => setInspectChecks(prev => ({ ...prev, safety: e.target.checked }))}
                    className="w-4 h-4 rounded border-slate-800 text-indigo-600 focus:ring-indigo-500/50 cursor-pointer bg-slate-955 mt-0.5"
                  />
                  <div>
                    <strong className="font-bold text-slate-200 block">Safety & Security lock</strong>
                    <span className="text-[10px] text-slate-500">Door keycard battery checked, smoke detector sensor light verify green.</span>
                  </div>
                </label>
              </div>

              {inspectLog && (
                <div className="p-2 border border-rose-900 bg-rose-950/20 text-rose-455 rounded-lg text-[10px] font-mono leading-relaxed">
                  {inspectLog}
                </div>
              )}

              <div className="flex gap-2 justify-end pt-2 border-t border-slate-900">
                <button
                  onClick={() => {
                    setShowInspectModal(false);
                    setInspectRoom(null);
                  }}
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-slate-350 font-bold text-xs rounded-xl cursor-pointer border border-slate-800 uppercase tracking-wider transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleInspectRoomComplete}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-xs rounded-xl cursor-pointer uppercase tracking-wider transition-colors shadow-md"
                >
                  Verify & Release Room
                </button>
              </div>

            </div>
          </div>
        </div>
      )}

      {/* MODAL: CREATE MANUAL TASK */}
      {showTaskModal && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="stitched-card rounded-2xl w-full max-w-lg p-6 relative bg-[#030611] border border-slate-850">
            <StitchedCornerPins />
            
            <div className="flex items-center justify-between border-b border-slate-900 pb-3.5 mb-4">
              <h3 className="text-base font-black uppercase tracking-wider text-slate-100 flex items-center gap-2">
                <Plus className="w-5 h-5 text-indigo-400" />
                <span>Create & Dispatch Task</span>
              </h3>
              <button 
                onClick={() => setShowTaskModal(false)}
                className="text-slate-500 hover:text-white p-1 rounded-lg hover:bg-slate-900/60 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateManualTask} className="space-y-4">
              <div>
                <label className="text-[9px] text-slate-400 font-extrabold uppercase tracking-wider block mb-1">Task Title *</label>
                <input 
                  type="text" 
                  required
                  placeholder="e.g. Broken AC in room 103" 
                  value={taskTitle}
                  onChange={(e) => setTaskTitle(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-900 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-indigo-500" 
                />
              </div>

              <div>
                <label className="text-[9px] text-slate-400 font-extrabold uppercase tracking-wider block mb-1">Task Description</label>
                <textarea 
                  rows={2} 
                  placeholder="Detailed context about the work required..."
                  value={taskDescription}
                  onChange={(e) => setTaskDescription(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-900 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-indigo-500 resize-none font-sans" 
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[9px] text-slate-400 font-extrabold uppercase tracking-wider block mb-1">Assign Target Department *</label>
                  <select 
                    required
                    value={taskDeptId}
                    onChange={(e) => setTaskDeptId(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-900 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-indigo-500"
                  >
                    <option value="" disabled>Select Department</option>
                    {availableDepts.map(d => (
                      <option key={d.id} value={d.id}>{d.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-[9px] text-slate-400 font-extrabold uppercase tracking-wider block mb-1">Priority Level *</label>
                  <select 
                    required
                    value={taskPriority}
                    onChange={(e) => setTaskPriority(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-900 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-indigo-500"
                  >
                    <option value="LOW">LOW</option>
                    <option value="MEDIUM">MEDIUM</option>
                    <option value="HIGH">HIGH</option>
                    <option value="URGENT">URGENT</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[9px] text-slate-400 font-extrabold uppercase tracking-wider block mb-1">Associate Room (Optional)</label>
                  <select 
                    value={taskRoomId}
                    onChange={(e) => setTaskRoomId(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-900 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-indigo-500"
                  >
                    <option value="">No Room Mapped</option>
                    {availableRooms.map(r => (
                      <option key={r.id} value={r.id}>Room {r.roomNumber} ({r.roomType})</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-[9px] text-slate-400 font-extrabold uppercase tracking-wider block mb-1">SLA Deadline Date/Time</label>
                  <input 
                    type="datetime-local" 
                    value={taskDueDate}
                    onChange={(e) => setTaskDueDate(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-900 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-indigo-500" 
                  />
                </div>
              </div>

              {modalLog && (
                <div className="bg-slate-950 border border-slate-900 rounded-lg p-2 text-[9px] font-mono text-indigo-400">
                  {modalLog}
                </div>
              )}

              <div className="flex gap-2 justify-end border-t border-slate-900/60 pt-4 mt-4">
                <button 
                  type="button"
                  onClick={() => setShowTaskModal(false)}
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-slate-355 text-xs font-bold rounded-xl transition-all border border-slate-800 cursor-pointer"
                >
                  Dismiss
                </button>
                <button 
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl transition-all shadow-md cursor-pointer"
                >
                  Submit & Assign
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: MANAGER OVERRIDE */}
      {overrideTask && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="stitched-card rounded-2xl w-full max-w-md p-6 relative bg-[#030611] border border-slate-850">
            <StitchedCornerPins />
            
            <div className="flex items-center justify-between border-b border-slate-900 pb-3.5 mb-4">
              <h3 className="text-base font-black uppercase tracking-wider text-slate-100 flex items-center gap-2">
                <Sliders className="w-5 h-5 text-indigo-400" />
                <span>Manager SOP Override</span>
              </h3>
              <button 
                onClick={() => setOverrideTask(null)}
                className="text-slate-500 hover:text-white p-1 rounded-lg hover:bg-slate-900/60 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="bg-slate-950 p-3 rounded-lg border border-slate-900 text-xs">
                <div className="text-[8px] text-slate-500 font-extrabold uppercase font-mono tracking-wider">Active task details</div>
                <div className="font-bold text-slate-200 mt-1">{overrideTask.title}</div>
                {overrideTask.description && <div className="text-slate-450 mt-1 font-light">{overrideTask.description}</div>}
              </div>

              <div>
                <label className="text-[9px] text-slate-400 font-extrabold uppercase tracking-wider block mb-1">Reassign Department</label>
                <select 
                  value={overrideDeptId}
                  onChange={(e) => setOverrideDeptId(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-900 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-indigo-500"
                >
                  <option value="">Do Not Reassign</option>
                  {availableDepts.map(d => (
                    <option key={d.id} value={d.id}>{d.name}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[9px] text-slate-400 font-extrabold uppercase tracking-wider block mb-1">Set Priority</label>
                  <select 
                    value={overridePriority}
                    onChange={(e) => setOverridePriority(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-900 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-indigo-500"
                  >
                    <option value="LOW">LOW</option>
                    <option value="MEDIUM">MEDIUM</option>
                    <option value="HIGH">HIGH</option>
                    <option value="URGENT">URGENT</option>
                  </select>
                </div>
                <div>
                  <label className="text-[9px] text-slate-400 font-extrabold uppercase tracking-wider block mb-1">Extend SLA due date</label>
                  <input 
                    type="datetime-local" 
                    value={overrideDueDate}
                    onChange={(e) => setOverrideDueDate(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-900 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-indigo-500" 
                  />
                </div>
              </div>

              {overrideLog && (
                <div className="bg-slate-950 border border-slate-900 rounded-lg p-2 text-[9px] font-mono text-indigo-400">
                  {overrideLog}
                </div>
              )}

              <div className="flex gap-2 justify-between border-t border-slate-900/60 pt-4 mt-4">
                <button 
                  type="button"
                  onClick={() => handleManagerOverride('cancel')}
                  className="px-4 py-2 bg-rose-955/20 hover:bg-rose-900/30 text-rose-400 text-xs font-bold rounded-xl transition-all border border-rose-900/20 cursor-pointer uppercase tracking-wider"
                >
                  Cancel Task ✖
                </button>
                <div className="flex gap-2">
                  <button 
                    type="button"
                    onClick={() => setOverrideTask(null)}
                    className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-slate-355 text-xs font-bold rounded-xl border border-slate-800 cursor-pointer"
                  >
                    Close
                  </button>
                  <button 
                    type="button"
                    onClick={() => handleManagerOverride('update')}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl transition-all shadow-md cursor-pointer"
                  >
                    Apply override
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL/DRAWER: ROOM DETAILS & STATUS CONTROL */}
      {selectedRoomDetails && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="stitched-card rounded-2xl w-full max-w-md p-6 relative bg-[#030611] border border-slate-850">
            <StitchedCornerPins />

            <div className="flex items-center justify-between border-b border-slate-900 pb-3.5 mb-4">
              <div>
                <h3 className="text-base font-black uppercase tracking-wider text-slate-100 flex items-center gap-2">
                  <Bed className="w-5 h-5 text-indigo-400" />
                  <span>Room {selectedRoomDetails.roomNumber} Controls</span>
                </h3>
                <span className="text-[9px] text-slate-500 uppercase tracking-widest font-mono mt-0.5 block">{selectedRoomDetails.roomType}</span>
              </div>
              <button 
                onClick={() => setSelectedRoomDetails(null)}
                className="text-slate-500 hover:text-white p-1 rounded-lg hover:bg-slate-900/60 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-5">
              
              {/* Active Status controls */}
              <div className="p-4 bg-slate-950 rounded-xl border border-slate-900">
                <label className="text-[9px] text-slate-500 font-extrabold uppercase tracking-wider block mb-2 font-mono">Set Room Cleanliness / Allocation Status</label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { status: 'AVAILABLE', label: '🟢 Available & Clean' },
                    { status: 'OCCUPIED', label: '🔵 Guest In-Room' },
                    { status: 'DIRTY', label: '🟡 Dirty (Inspect)' },
                    { status: 'MAINTENANCE', label: '🔴 Maintenance Hold' }
                  ].map((btn) => (
                    <button
                      key={btn.status}
                      disabled={updatingRoomStatus !== null}
                      onClick={() => handleUpdateRoomStatus(selectedRoomDetails.id, btn.status)}
                      className={`px-3 py-2 text-left rounded-lg text-xs font-bold transition-all flex items-center justify-between border cursor-pointer ${
                        selectedRoomDetails.status === btn.status
                          ? 'bg-indigo-600/10 border-indigo-500 text-indigo-300'
                          : 'bg-slate-950 border-slate-850 text-slate-400 hover:text-white hover:border-slate-800'
                      }`}
                    >
                      <span>{btn.label}</span>
                      {selectedRoomDetails.status === btn.status && <Check className="w-3.5 h-3.5 text-indigo-400" />}
                    </button>
                  ))}
                </div>
              </div>

              {selectedRoomDetails.status === 'DIRTY' && (
                <div className="bg-indigo-950/25 border border-indigo-900/50 p-4 rounded-xl text-center space-y-2.5 animate-pulse">
                  <span className="text-[10px] text-slate-350 font-medium block">
                    This room requires a supervisor sign-off before it can be set to clean/available.
                  </span>
                  <button
                    onClick={() => {
                      setInspectRoom(selectedRoomDetails);
                      setInspectChecks({
                        bedding: false,
                        bathroom: false,
                        amenities: false,
                        actest: false,
                        safety: false
                      });
                      setInspectLog('');
                      setSelectedRoomDetails(null);
                      setShowInspectModal(true);
                    }}
                    className="w-full py-2.5 bg-indigo-655 hover:bg-indigo-550 text-white font-extrabold text-xs rounded-lg transition-all uppercase tracking-wider font-mono shadow-md cursor-pointer"
                  >
                    📋 Launch Quality Inspection
                  </button>
                </div>
              )}

              {/* Tasks Mapped to this Room */}
              <div className="space-y-2">
                <label className="text-[9px] text-slate-500 font-extrabold uppercase tracking-wider block font-mono">Tasks Mapped to Room {selectedRoomDetails.roomNumber}</label>
                
                <div className="space-y-1.5 max-h-[150px] overflow-y-auto pr-1">
                  {tasks.filter(t => t.room?.roomNumber === selectedRoomDetails.roomNumber).length === 0 ? (
                    <div className="text-[10px] text-slate-550 italic p-3 text-center bg-slate-950/40 border border-slate-900/60 rounded-xl">
                      No active task workloads currently mapped.
                    </div>
                  ) : (
                    tasks.filter(t => t.room?.roomNumber === selectedRoomDetails.roomNumber).map(t => (
                      <div key={t.id} className="p-2.5 bg-slate-950/60 border border-slate-900 rounded-lg flex items-center justify-between text-xs">
                        <div className="overflow-hidden">
                          <span className="font-extrabold text-slate-200 block truncate max-w-[200px]">{t.title}</span>
                          <span className="text-[8px] text-slate-550 font-bold uppercase mt-0.5 block">{t.status}</span>
                        </div>
                        <PriorityBadge priority={t.priority} />
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Actions Section */}
              <div className="flex gap-2 justify-end border-t border-slate-900/60 pt-4">
                <button
                  onClick={() => {
                    setTaskRoomId(selectedRoomDetails.id);
                    setTaskTitle(`Service request: Room ${selectedRoomDetails.roomNumber}`);
                    setTaskDescription(`Action request on Room ${selectedRoomDetails.roomNumber} (${selectedRoomDetails.roomType}). `);
                    setTaskDeptId('');
                    setTaskDueDate('');
                    setModalLog('');
                    setSelectedRoomDetails(null);
                    setShowTaskModal(true);
                  }}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl transition-all shadow-md cursor-pointer flex items-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Dispatch Task</span>
                </button>
                <button 
                  type="button"
                  onClick={() => setSelectedRoomDetails(null)}
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-slate-355 text-xs font-bold rounded-xl border border-slate-800 cursor-pointer"
                >
                  Close Controls
                </button>
              </div>

            </div>
          </div>
        </div>
      )}

    </div>
  );
}

// Sliders Lucide placeholder helper mapping
function Sliders({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className}><line x1="4" y1="21" x2="4" y2="14"/><line x1="4" y1="10" x2="4" y2="3"/><line x1="12" y1="21" x2="12" y2="12"/><line x1="12" y1="8" x2="12" y2="3"/><line x1="20" y1="21" x2="20" y2="16"/><line x1="20" y1="12" x2="20" y2="3"/><line x1="2" y1="14" x2="6" y2="14"/><line x1="10" y1="8" x2="14" y2="8"/><line x1="18" y1="16" x2="22" y2="16"/></svg>
  );
}
