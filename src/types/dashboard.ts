export interface VendorItem {
  id: string;
  name: string;
  category: string;
  contactInfo: string;
}

export interface InventoryItem {
  id: string;
  name: string;
  unit: string;
  quantity: number;
  minimumLevel: number;
  department?: { name: string } | null;
}

export interface PurchaseRequestItem {
  id: string;
  vendorName: string;
  itemName: string;
  quantity: number;
  unit: string;
  estimatedCost: number;
  status: 'Awaiting Manager Approval' | 'Awaiting Delivery' | 'Completed';
}

export interface TaskDepartment {
  id?: string;
  name: string;
}

export interface TaskRoom {
  id?: string;
  roomNumber: string;
}

export interface TaskUser {
  id: string;
  name: string;
  role: string;
}

export interface TaskItem {
  id: string;
  title: string;
  description: string;
  priority: string;
  status: string;
  dueDate?: string;
  createdAt: string;
  departmentId?: string;
  department?: TaskDepartment;
  assignedUserId?: string | null;
  assignedUser?: TaskUser | null;
  roomId?: string | null;
  room?: TaskRoom | null;
}

export interface AIRecItem {
  id: string;
  type: string;
  confidence: number;
  reason: string;
  status: string;
}

export interface NotificationUser {
  name: string;
  role: string;
}

export interface NotificationItem {
  id: string;
  recipient: string;
  message: string;
  createdAt: string;
  channel?: string;
  status?: string;
  user?: NotificationUser | null;
}

export interface AuditLogUser {
  name: string;
}

export interface AuditLogItem {
  id: string;
  action: string;
  details: string;
  timestamp: string;
  user?: AuditLogUser | null;
}

export interface DeptItem {
  id: string;
  name: string;
  description?: string;
}

export interface RoomItem {
  id: string;
  roomNumber: string;
  roomType: string;
  status: string;
}

export interface ChecklistTask {
  id: string;
  title: string;
  status: string;
  priority: string;
  dueDate: string | null;
  workflowId: string;
}

export interface ChecklistDept {
  departmentId: string;
  tasks: ChecklistTask[];
}

export interface ChecklistData {
  date: string;
  totalTasks: number;
  departments: Record<string, ChecklistDept>;
}

export interface AssetItem {
  id: string;
  name: string;
  category: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export interface PricingRecommendation {
  id: string;
  target: string;
  currentRate: number;
  recommendedRate: number;
  reason: string;
  confidence: number;
  applied: boolean;
}

export interface GuestItem {
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

export interface GuestEventMetadata {
  guestName?: string;
  guestPhone?: string;
  roomNumber?: string;
  messageText?: string;
  [key: string]: unknown;
}

export interface GuestEventItem {
  id: string;
  type: string;
  source: string;
  timestamp: string;
  metadata: GuestEventMetadata;
  processed?: boolean;
}

export interface UserAccount {
  id: string;
  name: string;
  role: string;
  department: string;
  email: string;
}
