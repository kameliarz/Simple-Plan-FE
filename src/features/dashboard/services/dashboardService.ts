import { apiFetch } from "@/lib/apiFetch";
import { getToken } from "@/features/auth-login/services/authStorage";
import type {
  SuperAdminDashboardData,
  BackendDashboardApiResponse,
  DashboardStatCard,
  MonthlyTicketTrend,
  AssetStatusItem,
  DashboardMaintenanceItem,
  DashboardReminderItem,
} from "../types/dashboard.types";
import {
  MOCK_SUPER_ADMIN_DASHBOARD_DATA,
  MOCK_KOORDINATOR_SARPRAS_DASHBOARD_DATA,
  MOCK_MANAJEMEN_DASHBOARD_DATA,
  MOCK_PETUGAS_TIK_DASHBOARD_DATA,
  MOCK_PETUGAS_SARPRAS_DASHBOARD_DATA,
  MOCK_USER_DASHBOARD_DATA,
} from "./dashboardMockData";

interface ApiMaintenanceRawItem {
  id?: number | string;
  maintenance_type?: string;
  asset_name?: string;
  next_scheduled_date?: string;
  status?: string;
  asset_code?: {
    asset_item?: { name?: string };
  };
  assetCode?: {
    assetItem?: { name?: string };
  };
  assigned_officer?: { name?: string };
  assignedOfficer?: { name?: string };
}

interface ApiNotificationRawItem {
  id?: number | string;
  title?: string;
  message?: string;
  body?: string;
  created_at?: string;
  read_at?: string | null;
  action_url?: string;
  link?: string;
}

function getAuthHeaders(): Record<string, string> {
  const token = getToken();
  return {
    Accept: "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

const MONTH_NAMES = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "Mei",
  "Jun",
  "Jul",
  "Agu",
  "Sep",
  "Okt",
  "Nov",
  "Des",
];
const FULL_MONTH_NAMES = [
  "Januari",
  "Februari",
  "Maret",
  "April",
  "Mei",
  "Juni",
  "Juli",
  "Agustus",
  "September",
  "Oktober",
  "November",
  "Desember",
];

function formatRelativeTime(dateString?: string): string {
  if (!dateString) return "Baru saja";
  try {
    const past = new Date(dateString).getTime();
    const now = Date.now();
    const diffSec = Math.floor((now - past) / 1000);
    if (diffSec < 60) return "Baru saja";
    const diffMin = Math.floor(diffSec / 60);
    if (diffMin < 60) return `${diffMin} menit lalu`;
    const diffHour = Math.floor(diffMin / 60);
    if (diffHour < 24) return `${diffHour} jam lalu`;
    const diffDay = Math.floor(diffHour / 24);
    return `${diffDay} hari lalu`;
  } catch {
    return "Beberapa waktu lalu";
  }
}

/**
 * Service integrasi data Dashboard dari endpoint resmi `GET /api/v1/dashboard`.
 * Endpoint ini menyediakan:
 * - summary (kartu statistik per-role)
 * - charts.tren_tiket_per_bulan (grafik tren tiket 6 bulan terakhir)
 * - charts.komposisi_status_aset (komposisi status aset untuk Donut Chart)
 * Serta kalender & pengingat dari modul Maintenance dan Notifications.
 */
export const dashboardService = {
  /**
   * Mengambil data dashboard riil dari endpoint resmi backend `GET /api/v1/dashboard`.
   */
  async getDashboardData(role: string): Promise<SuperAdminDashboardData> {
    const baseMock = this.getDefaultMockByRole(role);

    try {
      // Panggil endpoint utama /api/v1/dashboard bersamaan dengan maintenance & notifikasi
      const [resDashboard, resMaintenances, resNotifications] = await Promise.allSettled([
        apiFetch("/api/v1/dashboard", { headers: getAuthHeaders() }),
        apiFetch("/api/v1/asset-maintenances?per_page=10", { headers: getAuthHeaders() }),
        apiFetch("/api/v1/notifications?per_page=10", { headers: getAuthHeaders() }),
      ]);

      let dashboardData: BackendDashboardApiResponse | null = null;
      if (resDashboard.status === "fulfilled" && resDashboard.value.ok) {
        const json = await resDashboard.value.json();
        dashboardData = (json?.data ?? null) as BackendDashboardApiResponse | null;
      }

      // 1. Olah Jadwal Maintenance untuk Kalender
      let realSchedules: DashboardMaintenanceItem[] = [];
      if (resMaintenances.status === "fulfilled" && resMaintenances.value.ok) {
        const j = await resMaintenances.value.json();
        const items = (
          Array.isArray(j?.data) ? j.data : Array.isArray(j) ? j : []
        ) as ApiMaintenanceRawItem[];
        if (items.length > 0) {
          realSchedules = items.map(
            (item: ApiMaintenanceRawItem, idx: number): DashboardMaintenanceItem => ({
              id: String(item.id || `sch-${idx}`),
              assetName:
                item.asset_code?.asset_item?.name ||
                item.assetCode?.assetItem?.name ||
                item.asset_name ||
                item.maintenance_type ||
                "Aset Rumah Sakit",
              officerName:
                item.assigned_officer?.name || item.assignedOfficer?.name || "Petugas Terkait",
              status:
                item.status === "completed" || item.status === "Selesai" ? "Selesai" : "Terjadwal",
              date: item.next_scheduled_date
                ? String(item.next_scheduled_date).slice(0, 10)
                : new Date().toISOString().slice(0, 10),
            }),
          );
        }
      }

      // 2. Olah Notifikasi untuk Widget Pengingat
      let realReminders: DashboardReminderItem[] = [];
      let unreadNotifCount = 0;
      if (resNotifications.status === "fulfilled" && resNotifications.value.ok) {
        const j = await resNotifications.value.json();
        const notifList = (
          Array.isArray(j?.data) ? j.data : Array.isArray(j?.notifications) ? j.notifications : []
        ) as ApiNotificationRawItem[];
        if (notifList.length > 0) {
          realReminders = notifList.map(
            (n: ApiNotificationRawItem, idx: number): DashboardReminderItem => ({
              id: String(n.id || `notif-${idx}`),
              title: n.title || n.message || n.body || "Aktivitas sistem",
              timeAgo: formatRelativeTime(n.created_at),
              isRead: Boolean(n.read_at),
              link: n.action_url || n.link || undefined,
            }),
          );
          unreadNotifCount = notifList.filter((n: ApiNotificationRawItem) => !n.read_at).length;
        }
      }

      // Jika response /api/v1/dashboard tidak berhasil didapat, fallback ke baseMock
      if (!dashboardData) {
        return {
          ...baseMock,
          maintenanceSchedules:
            realSchedules.length > 0 ? realSchedules : baseMock.maintenanceSchedules,
          reminders: realReminders.length > 0 ? realReminders : baseMock.reminders,
        };
      }

      const summary = dashboardData.summary || {};
      const charts = dashboardData.charts;

      // 3. Olah Tren Tiket 6 Bulan dari charts.tren_tiket_per_bulan
      let realTicketTrends: MonthlyTicketTrend[] = baseMock.ticketTrends;
      if (charts?.tren_tiket_per_bulan && typeof charts.tren_tiket_per_bulan === "object") {
        const entries = Object.entries(charts.tren_tiket_per_bulan);
        if (entries.length > 0) {
          realTicketTrends = entries.map(([yearMonth, count]): MonthlyTicketTrend => {
            const [yStr, mStr] = yearMonth.split("-");
            const y = parseInt(yStr, 10) || new Date().getFullYear();
            const m = (parseInt(mStr, 10) || 1) - 1;
            return {
              month: MONTH_NAMES[m] || mStr,
              fullMonth: `${FULL_MONTH_NAMES[m] || mStr} ${y}`,
              year: y,
              count: typeof count === "number" ? count : 0,
            };
          });
        }
      }

      // 4. Olah Komposisi Status Aset untuk Donut Chart
      let realAssetStatuses: AssetStatusItem[] = baseMock.assetStatuses;
      if (charts?.komposisi_status_aset && typeof charts.komposisi_status_aset === "object") {
        const k = charts.komposisi_status_aset;
        realAssetStatuses = [
          { key: "digunakan", label: "Digunakan", count: k["Digunakan"] ?? 0, color: "#1d4ed8" },
          {
            key: "tidak_digunakan",
            label: "Tidak Digunakan",
            count: k["Tidak Digunakan"] ?? 0,
            color: "#60a5fa",
          },
          { key: "rusak", label: "Rusak", count: k["Rusak"] ?? 0, color: "#ef4444" },
          { key: "dipinjam", label: "Dipinjam", count: k["Dipinjam"] ?? 0, color: "#f97316" },
        ];
      }

      // 5. Petakan Nilai Kartu Statistik (Summary) Berdasarkan Role Pengguna
      const mappedStats = baseMock.stats.map((stat): DashboardStatCard => {
        // Super Admin & Manajemen
        if (summary.jumlah_tiket_baru !== undefined && stat.id.includes("tiket-baru")) {
          return { ...stat, value: summary.jumlah_tiket_baru };
        }
        if (summary.jumlah_tiket_diproses !== undefined && stat.id.includes("tiket-diproses")) {
          return { ...stat, value: summary.jumlah_tiket_diproses };
        }
        if (
          summary.jumlah_request_desain_baru !== undefined &&
          stat.id.includes("request-desain")
        ) {
          return { ...stat, value: summary.jumlah_request_desain_baru };
        }
        if (summary.jumlah_aset_rusak !== undefined && stat.id.includes("aset-rusak")) {
          return { ...stat, value: summary.jumlah_aset_rusak };
        }
        if (
          summary.jumlah_jadwal_maintenance_minggu_ini !== undefined &&
          stat.id.includes("maintenance")
        ) {
          return { ...stat, value: summary.jumlah_jadwal_maintenance_minggu_ini };
        }

        // Koordinator Sarpras
        if (summary.jumlah_tiket_sarpras_baru !== undefined && stat.id === "tiket-baru-sarpras") {
          return { ...stat, value: summary.jumlah_tiket_sarpras_baru };
        }
        if (
          summary.jumlah_tiket_sarpras_diproses !== undefined &&
          stat.id === "tiket-diproses-sarpras"
        ) {
          return { ...stat, value: summary.jumlah_tiket_sarpras_diproses };
        }
        if (summary.jumlah_aset_sarpras_rusak !== undefined && stat.id === "aset-rusak-sarpras") {
          return { ...stat, value: summary.jumlah_aset_sarpras_rusak };
        }

        // Petugas TIK & Petugas Sarpras
        if (
          summary.jumlah_tiket_ditugaskan !== undefined &&
          (stat.id === "tiket-tik-saya" || stat.id === "tiket-sarpras-saya")
        ) {
          return { ...stat, value: summary.jumlah_tiket_ditugaskan };
        }
        if (summary.jumlah_tiket_diproses !== undefined && stat.id.includes("tiket-dikerjakan")) {
          return { ...stat, value: summary.jumlah_tiket_diproses };
        }
        if (summary.jumlah_tugas_desain_aktif !== undefined && stat.id === "tugas-desain-aktif") {
          return { ...stat, value: summary.jumlah_tugas_desain_aktif };
        }
        if (
          summary.jumlah_jadwal_maintenance_mendatang !== undefined &&
          stat.id.includes("jadwal-maintenance")
        ) {
          return { ...stat, value: summary.jumlah_jadwal_maintenance_mendatang };
        }

        // Role User
        if (summary.jumlah_tiket_aktif !== undefined && stat.id === "tiket-saya-aktif") {
          return { ...stat, value: summary.jumlah_tiket_aktif };
        }
        if (
          summary.jumlah_tiket_menunggu_verifikasi !== undefined &&
          stat.id === "tiket-menunggu-verifikasi"
        ) {
          return { ...stat, value: summary.jumlah_tiket_menunggu_verifikasi };
        }
        if (
          summary.jumlah_request_menunggu_persetujuan !== undefined &&
          stat.id === "request-desain-menunggu"
        ) {
          return { ...stat, value: summary.jumlah_request_menunggu_persetujuan };
        }
        if (stat.id === "notifikasi-belum-dibaca") {
          return { ...stat, value: unreadNotifCount };
        }

        // Khusus Manajemen (Total Aset Terdaftar)
        if (stat.id === "total-aset-terdaftar" && charts?.komposisi_status_aset) {
          const total = Object.values(charts.komposisi_status_aset).reduce<number>(
            (a, b) => a + (b ?? 0),
            0,
          );
          return { ...stat, value: total };
        }

        return stat;
      });

      return {
        stats: mappedStats,
        ticketTrends: realTicketTrends,
        assetStatuses: realAssetStatuses,
        maintenanceSchedules:
          realSchedules.length > 0 ? realSchedules : baseMock.maintenanceSchedules,
        reminders: realReminders.length > 0 ? realReminders : baseMock.reminders,
      };
    } catch {
      return baseMock;
    }
  },

  /**
   * Mengembalikan default baseline mock data sesuai role yang diminta.
   */
  getDefaultMockByRole(role: string): SuperAdminDashboardData {
    switch (role) {
      case "user":
        return MOCK_USER_DASHBOARD_DATA;
      case "petugas-tik":
        return MOCK_PETUGAS_TIK_DASHBOARD_DATA;
      case "petugas-sarpras":
        return MOCK_PETUGAS_SARPRAS_DASHBOARD_DATA;
      case "koordinator-sarpras":
        return MOCK_KOORDINATOR_SARPRAS_DASHBOARD_DATA;
      case "manajemen":
      case "management":
        return MOCK_MANAJEMEN_DASHBOARD_DATA;
      case "super-admin":
      default:
        return MOCK_SUPER_ADMIN_DASHBOARD_DATA;
    }
  },
};
