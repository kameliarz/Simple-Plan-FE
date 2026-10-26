export type BackupType = "automatic" | "manual";
export type BackupStatus = "success" | "failed";
export type BackupFrequency = "daily" | "weekly" | "monthly";

export interface Backup {
  id: string;
  fileName: string;
  backupDate: string;
  type: BackupType;
  performedBy: string;
  fileSize: number; // MB
  status: BackupStatus;
}

export interface BackupFilters {
  search: string;
  type: BackupType | "all";
  status: BackupStatus | "all";
  startDate: string;
  endDate: string;
}

export interface BackupSchedule {
  enabled: boolean;
  frequency: BackupFrequency;
  time: string;
  dayOfWeek: number;
  dayOfMonth: number;
}
