import { API_BASE_URL } from "@/config/api";
import { getToken } from "@/features/auth-login/services/authStorage";
import type { ApiMeta } from "@/types/api";
import type {
  Backup,
  BackupFilters,
  BackupSchedule,
  BackupStatus,
  BackupType,
} from "../types/backup.types";

// Response schemas are absent from Swagger; isolate wire field mapping here.
interface BackupRecord {
  id: number | string;
  file_name?: string | null;
  filename?: string | null;
  backup_date?: string | null;
  created_at: string;
  type: BackupType;
  status: BackupStatus;
  performed_by?: string | { nama?: string; name?: string } | null;
  user?: { nama?: string; name?: string } | null;
  file_size?: number | null;
  file_size_mb?: number | null;

  file_available?: boolean | null;
  file_exists?: boolean | null;
  can_download?: boolean | null;
  deleted_at?: string | null;
}
interface SettingsRecord {
  is_active: boolean;
  frequency: BackupSchedule["frequency"];
  backup_time: string | null;
  day_of_week: number | null;
  day_of_month: number | null;
}
export class BackupApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}
async function request(path: string, options: RequestInit = {}): Promise<Response> {
  const headers = new Headers(options.headers);
  if (!headers.has("Accept")) headers.set("Accept", "application/json");
  const token = getToken();
  if (token) headers.set("Authorization", `Bearer ${token}`);
  if (options.body) headers.set("Content-Type", "application/json");
  const response = await fetch(`${API_BASE_URL}${path}`, { ...options, headers });
  if (!response.ok) {
    const body = await response.json().catch(() => null);
    const validation = body?.errors ? Object.values(body.errors).flat().join(" ") : "";
    throw new BackupApiError(
      validation || body?.message || `Permintaan backup gagal (${response.status})`,
      response.status,
    );
  }
  return response;
}

function mapBackup(row: BackupRecord): Backup {
  const actor = row.performed_by ?? row.user;

  return {
    id: String(row.id),
    fileName: row.file_name ?? row.filename ?? `Backup #${row.id}`,
    backupDate: row.backup_date ?? row.created_at,
    type: row.type,
    status: row.status,
    performedBy:
      typeof actor === "string"
        ? actor
        : (actor?.nama ?? actor?.name ?? (row.type === "automatic" ? "Sistem" : "-")),
    fileSize:
      row.file_size_mb ?? Math.round((Number(row.file_size ?? 0) / 1024 / 1024) * 100) / 100,

    // Prioritaskan file_available dari API
    fileAvailable:
      row.file_available === false
        ? false
        : row.file_exists !== false && row.can_download !== false && !row.deleted_at,
  };
}

function mapSchedule(row: SettingsRecord): BackupSchedule {
  return {
    enabled: row.is_active,
    frequency: row.frequency,
    time: row.backup_time?.slice(0, 5) ?? "02:00",
    dayOfWeek: row.day_of_week ?? 1,
    dayOfMonth: row.day_of_month ?? 1,
  };
}
export const backupService = {
  async getBackups(
    page = 1,
    perPage = 10,
    filters?: BackupFilters,
    signal?: AbortSignal,
  ): Promise<{ backups: Backup[]; meta: ApiMeta }> {
    const query = new URLSearchParams({ page: String(page), per_page: String(perPage) });
    if (filters?.type && filters.type !== "all") query.set("type", filters.type);
    if (filters?.status && filters.status !== "all") query.set("status", filters.status);
    if (filters?.startDate) query.set("date_from", filters.startDate);
    if (filters?.endDate) query.set("date_to", filters.endDate);
    const body = await (await request(`/backups?${query}`, { signal })).json();
    const collection = Array.isArray(body.data) ? body : body.data;
    if (!collection || !Array.isArray(collection.data))
      throw new Error("Format riwayat backup tidak sesuai.");
    const pagination = collection.meta ?? collection;
    return {
      backups: collection.data.map(mapBackup),
      meta: {
        current_page: Number(pagination.current_page ?? page),
        last_page: Number(pagination.last_page ?? 1),
        per_page: Number(pagination.per_page ?? perPage),
        total: Number(pagination.total ?? collection.data.length),
        from: pagination.from ?? null,
        to: pagination.to ?? null,
        path: pagination.path ?? `${API_BASE_URL}/backups`,
        links: Array.isArray(pagination.links) ? pagination.links : [],
      },
    };
  },
  async getSchedule(): Promise<BackupSchedule> {
    const body = await (await request("/backup-settings")).json();
    return mapSchedule(body.data ?? body);
  },
  async saveSchedule(data: BackupSchedule): Promise<void> {
    await request("/backup-settings", {
      method: "PUT",
      body: JSON.stringify({
        is_active: data.enabled,
        frequency: data.frequency,
        backup_time: data.time,
        ...(data.frequency === "weekly" ? { day_of_week: data.dayOfWeek } : {}),
        ...(data.frequency === "monthly" ? { day_of_month: data.dayOfMonth } : {}),
      }),
    });
  },
  async createBackup(): Promise<void> {
    await request("/backups", { method: "POST" });
  },
  async deleteBackup(id: string): Promise<void> {
    await request(`/backups/${encodeURIComponent(id)}`, { method: "DELETE" });
  },
  async downloadBackup(id: string, fileName: string): Promise<void> {
    const response = await request(`/backups/${encodeURIComponent(id)}/download`, {
      headers: { Accept: "application/zip" },
    });
    const url = URL.createObjectURL(await response.blob());
    const link = document.createElement("a");
    link.href = url;
    link.download = fileName.endsWith(".zip") ? fileName : `backup-${id}.zip`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  },
};
