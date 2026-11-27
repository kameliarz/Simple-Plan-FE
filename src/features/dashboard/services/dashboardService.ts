import { apiFetch } from "@/lib/apiFetch";
import { getToken } from "@/features/auth-login/services/authStorage";
import type {
  SuperAdminDashboardData,
  BackendDashboardData,
  BackendLiveStats,
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

function generateLast6MonthsTrends(tickets: Array<{ created_at?: string }>): MonthlyTicketTrend[] {
  const now = new Date();
  const months: Array<{
    monthKey: string;
    month: string;
    fullMonth: string;
    year: number;
    count: number;
  }> = [];

  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const m = d.getMonth();
    const y = d.getFullYear();
    const monthKey = `${y}-${String(m + 1).padStart(2, "0")}`;
    months.push({
      monthKey,
      month: MONTH_NAMES[m],
      fullMonth: `${FULL_MONTH_NAMES[m]} ${y}`,
      year: y,
      count: 0,
    });
  }

  for (const t of tickets) {
    if (!t.created_at) continue;
    const ticketMonth = t.created_at.slice(0, 7);
    const target = months.find((m) => m.monthKey === ticketMonth);
    if (target) {
      target.count += 1;
    }
  }

  return months.map(({ month, fullMonth, year, count }) => ({
    month,
    fullMonth,
    year,
    count,
  }));
}

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
 * Service integrasi data Dashboard riil dari API backend.
 * Memanggil endpoint terkait (tickets, assets, maintenances, design-requests, notifications)
 * untuk menyajikan data aktual ke kartu metrik dan widget grafik sesuai mockup.
 */
export const dashboardService = {
  /**
   * Mengambil data backend bawaan `/api/v1/dashboard`.
   */
  async getRawDashboard(): Promise<BackendDashboardData | null> {
    try {
      const response = await apiFetch("/api/v1/dashboard", {
        method: "GET",
        headers: getAuthHeaders(),
      });
      if (!response.ok) return null;
      const json = await response.json();
      return json?.data ?? null;
    } catch {
      return null;
    }
  },

  /**
   * Mengambil live-stats `/api/v1/dashboard/live-stats`.
   */
  async getLiveStats(): Promise<BackendLiveStats | null> {
    try {
      const response = await apiFetch("/api/v1/dashboard/live-stats", {
        method: "GET",
        headers: getAuthHeaders(),
      });
      if (!response.ok) return null;
      const json = await response.json();
      return json?.data ?? null;
    } catch {
      return null;
    }
  },

  /**
   * Mengambil data dashboard riil per-role.
   */
  async getDashboardData(role: string): Promise<SuperAdminDashboardData> {
    const baseMock = this.getDefaultMockByRole(role);

    try {
      const isSarpras = role === "koordinator-sarpras" || role === "petugas-sarpras";
      const isTik = role === "petugas-tik";
      const isUser = role === "user";
      const serviceQuery = isSarpras ? "&service=sarpras" : isTik ? "&service=tik" : "";

      // 1. Ambil data tiket secara riil per status
      const [
        resTiketBaru,
        resTiketDiproses,
        resTiketSelesai,
        resAllTickets,
        resAssetDigunakan,
        resAssetTidakDigunakan,
        resAssetRusak,
        resAssetDipinjam,
        resAllAssets,
        resDesignBaru,
        resDesignUser,
        resMaintenances,
        resNotifications,
      ] = await Promise.allSettled([
        apiFetch(`/api/v1/tickets?status=baru&per_page=1${serviceQuery}`, {
          headers: getAuthHeaders(),
        }),
        apiFetch(`/api/v1/tickets?status=diproses&per_page=1${serviceQuery}`, {
          headers: getAuthHeaders(),
        }),
        apiFetch(`/api/v1/tickets?status=terselesaikan&per_page=1${serviceQuery}`, {
          headers: getAuthHeaders(),
        }),
        apiFetch(`/api/v1/tickets?per_page=100${serviceQuery}`, { headers: getAuthHeaders() }),
        apiFetch(`/api/v1/assets?status=${encodeURIComponent("Digunakan")}&per_page=1`, {
          headers: getAuthHeaders(),
        }),
        apiFetch(`/api/v1/assets?status=${encodeURIComponent("Tidak Digunakan")}&per_page=1`, {
          headers: getAuthHeaders(),
        }),
        apiFetch(`/api/v1/assets?status=${encodeURIComponent("Rusak")}&per_page=1`, {
          headers: getAuthHeaders(),
        }),
        apiFetch(`/api/v1/assets?status=${encodeURIComponent("Dipinjam")}&per_page=1`, {
          headers: getAuthHeaders(),
        }),
        apiFetch("/api/v1/assets?per_page=1", { headers: getAuthHeaders() }),
        apiFetch("/api/v1/design-requests?status=baru&per_page=1", { headers: getAuthHeaders() }),
        apiFetch("/api/v1/design-requests?scope=mine&status=menunggu_persetujuan&per_page=1", {
          headers: getAuthHeaders(),
        }),
        apiFetch("/api/v1/asset-maintenances?per_page=10", { headers: getAuthHeaders() }),
        apiFetch("/api/v1/notifications?per_page=10", { headers: getAuthHeaders() }),
      ]);

      // Ekstraksi hasil riil tiket
      let countTiketBaru: number | null = null;
      let countTiketDiproses: number | null = null;
      let countTiketSelesai: number | null = null;
      let recentTicketsList: Array<{ created_at?: string }> = [];

      if (resTiketBaru.status === "fulfilled" && resTiketBaru.value.ok) {
        const j = await resTiketBaru.value.json();
        if (typeof j?.meta?.total === "number") countTiketBaru = j.meta.total;
      }
      if (resTiketDiproses.status === "fulfilled" && resTiketDiproses.value.ok) {
        const j = await resTiketDiproses.value.json();
        if (typeof j?.meta?.total === "number") countTiketDiproses = j.meta.total;
      }
      if (resTiketSelesai.status === "fulfilled" && resTiketSelesai.value.ok) {
        const j = await resTiketSelesai.value.json();
        if (typeof j?.meta?.total === "number") countTiketSelesai = j.meta.total;
      }
      if (resAllTickets.status === "fulfilled" && resAllTickets.value.ok) {
        const j = await resAllTickets.value.json();
        if (Array.isArray(j?.data)) recentTicketsList = j.data;
      }

      // Ekstraksi hasil riil aset
      let countDigunakan: number | null = null;
      let countTidakDigunakan: number | null = null;
      let countRusak: number | null = null;
      let countDipinjam: number | null = null;
      let countTotalAset: number | null = null;

      if (resAssetDigunakan.status === "fulfilled" && resAssetDigunakan.value.ok) {
        const j = await resAssetDigunakan.value.json();
        if (typeof j?.meta?.total === "number") countDigunakan = j.meta.total;
      }
      if (resAssetTidakDigunakan.status === "fulfilled" && resAssetTidakDigunakan.value.ok) {
        const j = await resAssetTidakDigunakan.value.json();
        if (typeof j?.meta?.total === "number") countTidakDigunakan = j.meta.total;
      }
      if (resAssetRusak.status === "fulfilled" && resAssetRusak.value.ok) {
        const j = await resAssetRusak.value.json();
        if (typeof j?.meta?.total === "number") countRusak = j.meta.total;
      }
      if (resAssetDipinjam.status === "fulfilled" && resAssetDipinjam.value.ok) {
        const j = await resAssetDipinjam.value.json();
        if (typeof j?.meta?.total === "number") countDipinjam = j.meta.total;
      }
      if (resAllAssets.status === "fulfilled" && resAllAssets.value.ok) {
        const j = await resAllAssets.value.json();
        if (typeof j?.meta?.total === "number") countTotalAset = j.meta.total;
      }

      // Ekstraksi hasil riil request desain
      let countDesignBaru: number | null = null;
      let countDesignUserMenunggu: number | null = null;

      if (resDesignBaru.status === "fulfilled" && resDesignBaru.value.ok) {
        const j = await resDesignBaru.value.json();
        if (typeof j?.meta?.total === "number") countDesignBaru = j.meta.total;
      }
      if (resDesignUser.status === "fulfilled" && resDesignUser.value.ok) {
        const j = await resDesignUser.value.json();
        if (typeof j?.meta?.total === "number") countDesignUserMenunggu = j.meta.total;
      }

      // Ekstraksi jadwal pemeliharaan
      let realSchedules: DashboardMaintenanceItem[] = [];
      let totalMaintenanceCount: number | null = null;

      if (resMaintenances.status === "fulfilled" && resMaintenances.value.ok) {
        const j = await resMaintenances.value.json();
        const items = (
          Array.isArray(j?.data) ? j.data : Array.isArray(j) ? j : []
        ) as ApiMaintenanceRawItem[];
        if (typeof j?.total === "number") {
          totalMaintenanceCount = j.total;
        } else if (typeof j?.meta?.total === "number") {
          totalMaintenanceCount = j.meta.total;
        } else if (items.length > 0) {
          totalMaintenanceCount = items.length;
        }

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

      // Ekstraksi notifikasi riil
      let realReminders: DashboardReminderItem[] = [];
      let unreadNotificationsCount: number | null = null;

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
          unreadNotificationsCount = notifList.filter(
            (n: ApiNotificationRawItem) => !n.read_at,
          ).length;
        }
      }

      // Salin base data
      const result: SuperAdminDashboardData = {
        ...baseMock,
        stats: baseMock.stats.map((stat) => ({ ...stat })),
        ticketTrends:
          recentTicketsList.length > 0
            ? generateLast6MonthsTrends(recentTicketsList)
            : [...baseMock.ticketTrends],
        assetStatuses: [...baseMock.assetStatuses],
        maintenanceSchedules:
          realSchedules.length > 0 ? realSchedules : [...baseMock.maintenanceSchedules],
        reminders: realReminders.length > 0 ? realReminders : [...baseMock.reminders],
      };

      // Sinkronisasi Stat Cards dengan data riil API
      result.stats = result.stats.map((stat): DashboardStatCard => {
        // Tiket Baru
        if (
          stat.id.includes("tiket-baru") ||
          stat.id === "tiket-saya" ||
          (isUser && stat.id === "tiket-aktif")
        ) {
          if (countTiketBaru !== null) return { ...stat, value: countTiketBaru };
        }
        // Tiket Diproses
        if (stat.id.includes("tiket-diproses") || stat.id.includes("tiket-dikerjakan")) {
          if (countTiketDiproses !== null) return { ...stat, value: countTiketDiproses };
        }
        // Tiket Selesai
        if (stat.id.includes("tiket-selesai")) {
          if (countTiketSelesai !== null) return { ...stat, value: countTiketSelesai };
        }
        // Tiket Menunggu Verifikasi Saya (User)
        if (isUser && stat.id.includes("verifikasi")) {
          if (countTiketBaru !== null) return { ...stat, value: countTiketBaru };
        }
        // Request Desain Baru (Admin / Petugas TIK / Manajemen)
        if (stat.id.includes("request-desain") || stat.id.includes("tugas-desain")) {
          if (isUser && countDesignUserMenunggu !== null) {
            return { ...stat, value: countDesignUserMenunggu };
          }
          if (countDesignBaru !== null) return { ...stat, value: countDesignBaru };
        }
        // Aset Rusak
        if (stat.id.includes("aset-rusak")) {
          if (countRusak !== null) return { ...stat, value: countRusak };
        }
        // Total Aset
        if (stat.id.includes("total-aset")) {
          if (countTotalAset !== null) return { ...stat, value: countTotalAset };
        }
        // Jadwal Maintenance
        if (stat.id.includes("maintenance")) {
          if (totalMaintenanceCount !== null) return { ...stat, value: totalMaintenanceCount };
        }
        // Notifikasi Belum Dibaca (User)
        if (isUser && stat.id.includes("notifikasi")) {
          if (unreadNotificationsCount !== null)
            return { ...stat, value: unreadNotificationsCount };
        }

        return stat;
      });

      // Sinkronisasi Donut Chart Komposisi Status Aset
      if (
        countDigunakan !== null ||
        countTidakDigunakan !== null ||
        countRusak !== null ||
        countDipinjam !== null
      ) {
        result.assetStatuses = result.assetStatuses.map((item): AssetStatusItem => {
          if (item.key === "digunakan" && countDigunakan !== null)
            return { ...item, count: countDigunakan };
          if (item.key === "tidak_digunakan" && countTidakDigunakan !== null)
            return { ...item, count: countTidakDigunakan };
          if (item.key === "rusak" && countRusak !== null) return { ...item, count: countRusak };
          if (item.key === "dipinjam" && countDipinjam !== null)
            return { ...item, count: countDipinjam };
          return item;
        });
      }

      return result;
    } catch {
      return baseMock;
    }
  },

  /**
   * Mengembalikan default mock data sesuai role yang diminta.
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
