import { IconDownload, IconRestore } from "@tabler/icons-react";

import type { Backup } from "../types/backup.types";

import BackupStatusBadge from "./BackupStatusBadge";

interface BackupCardMobileProps {
  backup: Backup;
  onDownload: (backup: Backup) => void;
  onRestore: (backup: Backup) => void;
}

const formatBackupDate = (value: string): string => {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "-";
  }

  return (
    new Intl.DateTimeFormat("id-ID", {
      timeZone: "Asia/Jakarta",
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    })
      .format(date)
      .replace(".", ":") + " WIB"
  );
};

export default function BackupCardMobile({ backup, onDownload, onRestore }: BackupCardMobileProps) {
  const isSuccess = backup.status === "success";

  return (
    <article
      className="
        overflow-hidden rounded-xl
        border border-slate-200
        border-l-[3px] border-l-primary-600
        bg-table-card
        dark:border-slate-700
        dark:border-l-primary-500
      "
    >
      {/* CARD CONTENT */}
      <div className="space-y-3 p-3">
        {/* FILE NAME & STATUS */}
        <div className="flex items-start justify-between gap-2">
          <h3
            className="
              min-w-0 flex-1 break-all
              text-sm font-medium
              text-text-secondary
            "
          >
            {backup.fileName}
          </h3>

          <div className="shrink-0">
            <BackupStatusBadge status={backup.status} />
          </div>
        </div>

        {/* BACKUP INFORMATION */}
        <div
          className="
            grid grid-cols-2 gap-x-3 gap-y-3
            rounded-lg bg-slate-100/80 p-3
            dark:bg-slate-700/60
          "
        >
          {/* WAKTU */}
          <div className="min-w-0 space-y-1">
            <p className="text-xs text-slate-400">Waktu Back Up</p>

            <p className="text-xs font-medium text-text-secondary">
              {formatBackupDate(backup.backupDate)}
            </p>
          </div>

          {/* JENIS */}
          <div className="min-w-0 space-y-1">
            <p className="text-xs text-slate-400">Jenis Back Up</p>

            <BackupStatusBadge type={backup.type} />
          </div>

          {/* DILAKUKAN OLEH */}
          <div className="min-w-0 space-y-1">
            <p className="text-xs text-slate-400">Dilakukan Oleh</p>

            <p className="wrap-break-word text-xs font-medium text-text-secondary">
              {backup.performedBy}
            </p>
          </div>

          {/* UKURAN FILE */}
          <div className="min-w-0 space-y-1">
            <p className="text-xs text-slate-400">Ukuran File</p>

            <p className="text-xs font-medium text-text-secondary">
              {backup.fileSize.toLocaleString("id-ID")} MB
            </p>
          </div>
        </div>
      </div>

      {/* CARD ACTIONS */}
      <div
        className="
          flex items-center justify-end gap-2
          border-t border-slate-100
          px-3 py-2
          dark:border-slate-700
        "
      >
        <button
          type="button"
          onClick={() => onDownload(backup)}
          disabled={!isSuccess}
          className="
            inline-flex min-h-8 items-center
            justify-center gap-1.5
            rounded-full bg-slate-100
            px-3 text-xs font-medium
            text-slate-600 transition
            hover:bg-slate-200
            disabled:cursor-not-allowed
            disabled:opacity-40
            dark:bg-slate-800
            dark:text-slate-300
            dark:hover:bg-slate-700
          "
        >
          <IconDownload size={13} strokeWidth={1.8} />
          Download
        </button>

        <button
          type="button"
          onClick={() => onRestore(backup)}
          disabled={!isSuccess}
          className="
            inline-flex min-h-8 items-center
            justify-center gap-1.5
            rounded-full bg-slate-100
            px-3 text-xs font-medium
            text-slate-600 transition
            hover:bg-slate-200
            disabled:cursor-not-allowed
            disabled:opacity-40
            dark:bg-slate-800
            dark:text-slate-300
            dark:hover:bg-slate-700
          "
        >
          <IconRestore size={13} strokeWidth={1.8} />
          Pulihkan
        </button>
      </div>
    </article>
  );
}
