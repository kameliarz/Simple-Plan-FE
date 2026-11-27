export interface DashboardStatCard {
  id: string;
  title: string;
  value: number;
  subtext: string;
  link: string;
  isPrimary?: boolean;
}

export interface MonthlyTicketTrend {
  month: string;
  fullMonth: string;
  year: number;
  count: number;
}

export interface AssetStatusItem {
  key: string;
  label: string;
  count: number;
  color: string;
}

export interface DashboardMaintenanceItem {
  id: string;
  assetName: string;
  officerName: string;
  status: "Terjadwal" | "Selesai" | "Terlambat";
  date: string; // ISO date 'YYYY-MM-DD'
}

export interface DashboardReminderItem {
  id: string;
  title: string;
  timeAgo: string;
  isRead: boolean;
  link?: string;
}

export interface SuperAdminDashboardData {
  stats: DashboardStatCard[];
  ticketTrends: MonthlyTicketTrend[];
  assetStatuses: AssetStatusItem[];
  maintenanceSchedules: DashboardMaintenanceItem[];
  reminders: DashboardReminderItem[];
}

export type KoordinatorSarprasDashboardData = SuperAdminDashboardData;
export type ManajemenDashboardData = SuperAdminDashboardData;
export type DashboardData = SuperAdminDashboardData;

// Backend API Raw Response Types (/api/v1/dashboard & /api/v1/dashboard/live-stats)
export interface BackendDashboardSummary {
  total_users: number;
  total_roles: number;
  total_units: number;
  total_permissions: number;
}

export interface BackendDashboardData {
  variant: string;
  summary: BackendDashboardSummary;
  current_user: {
    roles: string[];
    units: string[];
    permissions_count: number;
  };
  role_distribution: Array<{ name: string; users_count: number }>;
  recent_users: Array<{
    id: number;
    name: string;
    email: string;
    avatar?: string | null;
    nip?: string | null;
    status: string;
    roles: Array<{ id: number; name: string }>;
    created_at: string;
  }>;
  owned_units: {
    total_units: number;
    unit_names: string[];
    total_members: number;
    units: Array<{ id: number; unit_name: string; users_count: number }>;
    active_shifts: number;
    present_today: number;
  };
  today: {
    date: string;
    timezone: string;
  };
}

export interface BackendLiveStats {
  online_users: number;
  logins_today: number;
  logouts_today: number;
}
