import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { IconDotsVertical } from "@tabler/icons-react";

import type { Backup } from "../types/backup.types";

interface BackupActionMenuProps {
  backup: Backup;
  onDownload: (backup: Backup) => void;
  onDelete: (backup: Backup) => void;
}

export default function BackupActionMenu({ backup, onDownload, onDelete }: BackupActionMenuProps) {
  const [open, setOpen] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const buttonRef = useRef<HTMLButtonElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;

    const updatePosition = () => {
      const button = buttonRef.current;
      if (!button) return;

      const rect = button.getBoundingClientRect();
      const menuWidth = 160;
      const menuHeight = 88;
      const gap = 4;

      const showAbove =
        window.innerHeight - rect.bottom < menuHeight + gap && rect.top >= menuHeight + gap;

      setPosition({
        top: showAbove ? rect.top - menuHeight - gap : rect.bottom + gap,
        left: Math.max(8, Math.min(rect.right - menuWidth, window.innerWidth - menuWidth - 8)),
      });
    };

    const handleOutside = (event: PointerEvent) => {
      const target = event.target as Node;

      if (!buttonRef.current?.contains(target) && !dropdownRef.current?.contains(target)) {
        setOpen(false);
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };

    const handleScroll = () => setOpen(false);

    updatePosition();

    document.addEventListener("pointerdown", handleOutside);
    document.addEventListener("keydown", handleEscape);
    window.addEventListener("resize", updatePosition);
    window.addEventListener("scroll", handleScroll, true);

    return () => {
      document.removeEventListener("pointerdown", handleOutside);
      document.removeEventListener("keydown", handleEscape);
      window.removeEventListener("resize", updatePosition);
      window.removeEventListener("scroll", handleScroll, true);
    };
  }, [open]);

  const disabled = backup.status !== "success" || backup.fileAvailable === false;

  return (
    <>
      <button
        ref={buttonRef}
        type="button"
        aria-label={`Aksi ${backup.fileName}`}
        aria-expanded={open}
        aria-haspopup="menu"
        onClick={() => setOpen((previous) => !previous)}
        className="rounded-lg p-2 text-text-secondary transition hover:bg-slate-100 dark:hover:bg-slate-800"
      >
        <IconDotsVertical size={18} />
      </button>

      {open &&
        createPortal(
          <div
            ref={dropdownRef}
            role="menu"
            style={{
              position: "fixed",
              top: position.top,
              left: position.left,
            }}
            className="z-9999 w-40 rounded-lg border border-med-border bg-table-card py-1 shadow-lg"
          >
            <button
              type="button"
              role="menuitem"
              disabled={disabled}
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
              disabled={disabled}
              onClick={() => {
                setOpen(false);
                onDelete(backup);
              }}
              className="flex w-full items-center gap-2 px-3 py-2 text-left text-xs text-text-secondary hover:bg-button disabled:cursor-not-allowed disabled:opacity-40"
            >
              Hapus
            </button>
          </div>,
          document.body,
        )}
    </>
  );
}
