import Modal from "@/components/ui/ui-template/Modal";
import Button from "@/components/ui/ui-template/Button";

import type { Backup } from "../types/backup.types";

interface BackupRestoreModalProps {
  show: boolean;
  backup: Backup | null;
  onClose: () => void;
  onConfirm: () => void | Promise<void>;
  isLoading?: boolean;
}

const formatBackupDate = (dateString: string): string => {
  const date = new Date(dateString);

  if (Number.isNaN(date.getTime())) {
    return "-";
  }

  return new Intl.DateTimeFormat("id-ID", {
    timeZone: "Asia/Jakarta",
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  })
    .format(date)
    .replace(".", ":");
};

export default function BackupRestoreModal({
  show,
  backup,
  onClose,
  onConfirm,
  isLoading = false,
}: BackupRestoreModalProps) {
  return (
    <Modal show={show} onClose={onClose} closeable={!isLoading} showHeader={false} maxWidth="md">
      <div className="rounded-xl bg-white px-5 py-5 dark:bg-slate-900">
        {/* TITLE */}
        <h2 className="font-semibold text-slate-900 dark:text-slate-100">Pulihkan Data ?</h2>

        {/* DESCRIPTION */}
        <div className="mt-2 space-y-1 text-sm leading-relaxed text-slate-500 dark:text-slate-400">
          <p>
            Seluruh data saat ini akan diganti dengan data pada waktu back up{" "}
            {backup ? formatBackupDate(backup.backupDate) : "-"} ({backup?.fileName ?? "-"}).
          </p>

          <p>Tindakan ini tidak dapat dibatalkan.</p>
        </div>

        {/* ACTION BUTTONS */}
        <div className="mt-6 grid grid-cols-2 gap-2">
          <Button
            type="button"
            label="Batal"
            variant="secondary"
            onClick={onClose}
            disabled={isLoading}
            className="
              w-full
              border-primary-600
              text-primary-600
              hover:bg-blue-50
              dark:border-blue-400
              dark:text-blue-400
              dark:hover:bg-slate-800
            "
          />

          <Button
            type="button"
            label={isLoading ? "Memulihkan..." : "Ya"}
            variant="primary"
            onClick={() => void onConfirm()}
            disabled={isLoading || !backup}
            className="w-full"
          />
        </div>
      </div>
    </Modal>
  );
}
