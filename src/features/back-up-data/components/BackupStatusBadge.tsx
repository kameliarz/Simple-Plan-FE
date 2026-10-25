import type { BackupStatus, BackupType } from "../types/backup.types";

interface BackupStatusBadgeProps {
  status?: BackupStatus;
  type?: BackupType;
}

export default function BackupStatusBadge({ status, type }: BackupStatusBadgeProps) {
  if (type) {
    return (
      <span
        className="
          inline-flex rounded-full
          bg-slate-100 px-2.5 py-1
          text-xs font-medium text-slate-600
          dark:bg-slate-800 dark:text-slate-300
        "
      >
        {type === "automatic" ? "Otomatis" : "Manual"}
      </span>
    );
  }

  if (!status) return null;

  return (
    <span
      className={
        status === "success"
          ? "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border bg-badge-done-fill text-badge-done-text border-badge-done-stroke"
          : "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border bg-badge-denied-fill text-badge-denied-text border-badge-denied-stroke"
      }
    >
      {status === "success" ? "Berhasil" : "Gagal"}
    </span>
  );
}
