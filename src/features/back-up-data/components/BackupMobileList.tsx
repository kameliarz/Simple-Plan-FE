import { IconInfoCircle } from "@tabler/icons-react";

import BackupCardMobile from "./BackupCardMobile";

import type { Backup } from "../types/backup.types";

interface BackupMobileListProps {
  backups: Backup[];
  onDownload: (backup: Backup) => void;
  onRestore: (backup: Backup) => void;
}

export default function BackupMobileList({
  backups,
  onDownload,
  onRestore,
}: BackupMobileListProps) {
  if (backups.length === 0) {
    return (
      <div className="flex min-h-[65dvh] items-center justify-center px-4">
        <div className="flex items-center justify-center gap-2 text-text-secondary">
          <IconInfoCircle size={18} strokeWidth={1.8} className="shrink-0" />

          <p className="text-xs font-normal">Data back up tidak ditemukan!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {backups.map((backup) => (
        <BackupCardMobile
          key={backup.id}
          backup={backup}
          onDownload={onDownload}
          onRestore={onRestore}
        />
      ))}
    </div>
  );
}
