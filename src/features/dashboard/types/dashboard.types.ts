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
