import type { Backup, BackupFilters, BackupSchedule } from "../types/backup.types";

export const backup: Backup = {
  id: "1",
  fileName: "backup.zip",
  backupDate: "2026-11-12T00:00:00Z",
  type: "manual",
  status: "success",
  performedBy: "Admin",
  fileSize: 1.5,
};
export const filters: BackupFilters = {
  search: "",
  type: "all",
  status: "all",
  startDate: "",
  endDate: "",
};
export const schedule: BackupSchedule = {
  enabled: true,
  frequency: "daily",
  time: "02:00",
  dayOfWeek: 1,
  dayOfMonth: 1,
};
export const record = {
  id: 1,
  file_name: "backup.zip",
  created_at: backup.backupDate,
  type: "manual",
  status: "success",
  performed_by: "Admin",
  file_size: 1572864,
};
export const settings = {
  is_active: true,
  frequency: "daily",
  backup_time: "02:00:00",
  day_of_week: null,
  day_of_month: null,
};
export function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}
