import type { Backup, BackupSchedule } from "../types/backup.types";

const mockBackups: Backup[] = [
  {
    id: "1",
    fileName: "backup-2026-10-14-0200.zip",
    backupDate: "2026-10-14T02:00:00+07:00",
    type: "automatic",
    performedBy: "Sistem",
    fileSize: 482,
    status: "success",
  },
  {
    id: "2",
    fileName: "backup-2026-10-12-1530.zip",
    backupDate: "2026-10-12T15:30:00+07:00",
    type: "manual",
    performedBy: "Agung Suryana",
    fileSize: 67,
    status: "failed",
  },
  {
    id: "3",
    fileName: "backup-2026-10-11-0200.zip",
    backupDate: "2026-10-11T02:00:00+07:00",
    type: "automatic",
    performedBy: "Sistem",
    fileSize: 678,
    status: "success",
  },
  {
    id: "4",
    fileName: "backup-2026-10-09-1800.zip",
    backupDate: "2026-10-09T18:00:00+07:00",
    type: "manual",
    performedBy: "Sistem",
    fileSize: 400,
    status: "success",
  },
  {
    id: "5",
    fileName: "backup-2026-10-07-1500.zip",
    backupDate: "2026-10-07T15:00:00+07:00",
    type: "automatic",
    performedBy: "Dr. Naura",
    fileSize: 82,
    status: "success",
  },
  {
    id: "6",
    fileName: "backup-2026-10-07-0600.zip",
    backupDate: "2026-10-07T06:00:00+07:00",
    type: "automatic",
    performedBy: "Sistem",
    fileSize: 332,
    status: "failed",
  },
  {
    id: "7",
    fileName: "backup-2026-10-07-0200.zip",
    backupDate: "2026-10-07T02:00:00+07:00",
    type: "automatic",
    performedBy: "Sistem",
    fileSize: 357,
    status: "success",
  },
  {
    id: "8",
    fileName: "backup-2026-10-06-1700.zip",
    backupDate: "2026-10-06T17:00:00+07:00",
    type: "manual",
    performedBy: "Sistem",
    fileSize: 59,
    status: "success",
  },
  {
    id: "9",
    fileName: "backup-2026-10-06-0300.zip",
    backupDate: "2026-10-06T03:00:00+07:00",
    type: "automatic",
    performedBy: "Harris",
    fileSize: 42,
    status: "failed",
  },
  {
    id: "10",
    fileName: "backup-2026-10-05-0900.zip",
    backupDate: "2026-10-05T09:00:00+07:00",
    type: "automatic",
    performedBy: "Sistem",
    fileSize: 89,
    status: "failed",
  },
];

const backups = [...mockBackups];

let schedule: BackupSchedule = {
  enabled: true,
  frequency: "daily",
  time: "02:00",
  dayOfWeek: 1,
  dayOfMonth: 1,
};

export const backupService = {
  async getBackups(): Promise<Backup[]> {
    return [...backups].sort(
      (a, b) => new Date(b.backupDate).getTime() - new Date(a.backupDate).getTime(),
    );
  },

  async getSchedule(): Promise<BackupSchedule> {
    return { ...schedule };
  },

  async saveSchedule(data: BackupSchedule): Promise<void> {
    // Simulasi lokal. Belum menjadwalkan backup di server.
    schedule = { ...data };
  },

  async createBackup(): Promise<never> {
    throw new Error("Endpoint backup manual belum terhubung ke backend.");
  },

  async downloadBackup(_id: string): Promise<never> {
    void _id;

    throw new Error("Endpoint download backup belum terhubung ke backend.");
  },

  async restoreBackup(_id: string): Promise<never> {
    void _id;

    throw new Error("Endpoint restore backup belum terhubung ke backend.");
  },
};
