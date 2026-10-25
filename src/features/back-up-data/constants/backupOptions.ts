import type { BackupFrequency, BackupStatus, BackupType } from "../types/backup.types";

export const backupTypeOptions: {
  value: BackupType | "all";
  label: string;
}[] = [
  { value: "all", label: "Semua jenis" },
  { value: "automatic", label: "Otomatis" },
  { value: "manual", label: "Manual" },
];

export const backupStatusOptions: {
  value: BackupStatus | "all";
  label: string;
}[] = [
  { value: "all", label: "Semua status" },
  { value: "success", label: "Berhasil" },
  { value: "failed", label: "Gagal" },
];

export const backupFrequencyOptions: {
  value: BackupFrequency;
  label: string;
}[] = [
  { value: "daily", label: "Setiap Hari" },
  { value: "weekly", label: "Setiap Minggu" },
  { value: "monthly", label: "Setiap Bulan" },
];
