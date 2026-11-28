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

// Backend API Response Types (/api/v1/dashboard)
export interface BackendDashboardApiResponse {
  variant:
    | "super-admin"
    | "management"
    | "koordinator-sarpras"
    | "petugas-tik"
    | "petugas-sarpras"
    | "user"
    | string;
  summary: {
    // Super Admin & Management
    jumlah_tiket_baru?: number;
    jumlah_tiket_diproses?: number;
    jumlah_request_desain_baru?: number;
    jumlah_aset_rusak?: number;
    jumlah_jadwal_maintenance_minggu_ini?: number;

    // Koordinator Sarpras
    jumlah_tiket_sarpras_baru?: number;
    jumlah_tiket_sarpras_diproses?: number;
    jumlah_aset_sarpras_rusak?: number;

    // Petugas TIK & Sarpras
    jumlah_tiket_ditugaskan?: number;
    jumlah_tugas_desain_aktif?: number;
    jumlah_jadwal_maintenance_mendatang?: number;

    // User
    jumlah_tiket_aktif?: number;
    jumlah_tiket_menunggu_verifikasi?: number;
    jumlah_request_menunggu_persetujuan?: number;

    [key: string]: number | undefined;
  };
  charts?: {
    tren_tiket_per_bulan?: Record<string, number>;
    komposisi_status_aset?: {
      Digunakan?: number;
      "Tidak Digunakan"?: number;
      Rusak?: number;
      Dipinjam?: number;
      [key: string]: number | undefined;
    };
  };
}

export interface BackendLiveStats {
  online_users: number;
  logins_today: number;
  logouts_today: number;
}
