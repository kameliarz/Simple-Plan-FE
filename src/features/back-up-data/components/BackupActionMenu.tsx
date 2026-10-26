import { useEffect, useRef, useState } from "react";
import { IconDotsVertical } from "@tabler/icons-react";

import type { Backup } from "../types/backup.types";

interface BackupActionMenuProps {
  backup: Backup;
  onDownload: (backup: Backup) => void;
  onRestore: (backup: Backup) => void;
}

export default function BackupActionMenu({ backup, onDownload, onRestore }: BackupActionMenuProps) {
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;

    const handleOutside = (event: PointerEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };

    document.addEventListener("pointerdown", handleOutside);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("pointerdown", handleOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [open]);

  return (
    <div ref={menuRef} className="relative inline-flex">
      <button
        type="button"
        aria-label={`Aksi ${backup.fileName}`}
        aria-expanded={open}
        aria-haspopup="menu"
        onClick={() => setOpen((previous) => !previous)}
        className="rounded-lg p-2 text-text-secondary transition hover:bg-slate-100 dark:hover:bg-slate-800"
      >
        <IconDotsVertical size={18} />
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 top-full z-40 mt-1 w-40 rounded-lg border border-med-border bg-table-card py-1 shadow-lg"
        >
          <button
            type="button"
            role="menuitem"
            disabled={backup.status !== "success"}
            onClick={() => {
              setOpen(false);
              onDownload(backup);
            }}
            className="flex w-full items-center gap-2 px-3 py-2 text-left text-xs text-text-secondary hover:bg-button disabled:cursor-not-allowed disabled:opacity-40"
          >
            Download
          </button>

          <button
            type="button"
            role="menuitem"
            disabled={backup.status !== "success"}
            onClick={() => {
              setOpen(false);
              onRestore(backup);
            }}
            className="flex w-full items-center gap-2 px-3 py-2 text-left text-xs text-text-secondary hover:bg-button disabled:cursor-not-allowed disabled:opacity-40"
          >
            Pulihkan
          </button>
        </div>
      )}
    </div>
  );
}
