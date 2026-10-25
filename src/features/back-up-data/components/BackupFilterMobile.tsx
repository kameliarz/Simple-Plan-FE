import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

import { IconX } from "@tabler/icons-react";

import Dropdown from "@/components/ui/ui-template/Dropdown";
import DateInput from "@/components/ui/ui-template/DateInput";
import Button from "@/components/ui/ui-template/Button";
import CategorySelector from "@/components/ui/ui-template/CategorySelector";

import { backupTypeOptions } from "../constants/backupOptions";

import type { BackupFilters, BackupStatus, BackupType } from "../types/backup.types";

interface BackupFilterMobileProps {
  show: boolean;
  filters: BackupFilters;
  onClose: () => void;
  onApply: (filters: BackupFilters) => void;
}

type FilterContentProps = Omit<BackupFilterMobileProps, "show">;

const statusOptions: {
  label: string;
  value: BackupStatus;
}[] = [
  { label: "Gagal", value: "failed" },
  { label: "Berhasil", value: "success" },
];

function BackupFilterContent({ filters, onClose, onApply }: FilterContentProps) {
  const [draft, setDraft] = useState<BackupFilters>(() => ({
    ...filters,
  }));

  // ==========================================
  // LOCK BODY SCROLL
  // ==========================================
  useEffect(() => {
    const previousOverflow = document.body.style.overflow;

    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, []);

  // ==========================================
  // CLOSE ON ESCAPE
  // ==========================================
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("keydown", handleEscape);
    };
  }, [onClose]);

  // ==========================================
  // HANDLERS
  // ==========================================
  const handleStatusChange = (value: BackupStatus) => {
    setDraft((previous) => ({
      ...previous,
      status: previous.status === value ? "all" : value,
    }));
  };

  const handleReset = () => {
    const resetFilters: BackupFilters = {
      ...draft,
      type: "all",
      status: "all",
      startDate: "",
      endDate: "",
    };

    setDraft(resetFilters);
    onApply(resetFilters);
    onClose();
  };

  const handleApply = () => {
    onApply(draft);
    onClose();
  };

  return createPortal(
    <div className="fixed inset-0 z-100 md:hidden">
      {/* BACKDROP */}
      <button
        type="button"
        aria-label="Tutup filter"
        onClick={onClose}
        className="absolute inset-0 h-full w-full bg-black/40"
      />

      {/* BOTTOM SHEET */}
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="backup-filter-title"
        className="
          absolute inset-x-0 bottom-0
          flex max-h-[90dvh] flex-col
          overflow-hidden rounded-t-3xl
          border border-med-border
          bg-table-card shadow-xl
        "
      >
        {/* DRAG HANDLE */}
        <div className="flex shrink-0 justify-center pt-2.5">
          <div className="h-1.5 w-11 rounded-full bg-slate-300 dark:bg-slate-600" />
        </div>

        {/* HEADER */}
        <div className="flex shrink-0 items-center justify-between px-5 py-4">
          <h2 id="backup-filter-title" className="text-base font-semibold text-text-title">
            Filter
          </h2>

          <button
            type="button"
            onClick={onClose}
            aria-label="Tutup filter"
            className="
              flex h-8 w-8 items-center justify-center
              rounded-full text-slate-500
              transition hover:bg-button/40
            "
          >
            <IconX size={19} strokeWidth={2} />
          </button>
        </div>

        {/* FILTER CONTENT */}
        <div
          className="
            min-h-0 flex-1 space-y-5
            overflow-y-auto overscroll-contain
            px-5 pb-5
          "
        >
          {/* JENIS BACKUP */}
          <section className="space-y-2">
            <h3 className="text-xs font-medium text-text-title">Jenis Back Up</h3>

            <Dropdown
              value={draft.type}
              options={backupTypeOptions}
              onChange={(value) =>
                setDraft((previous) => ({
                  ...previous,
                  type: value as BackupType | "all",
                }))
              }
              placeholder="Semua jenis"
              className="w-full"
            />
          </section>

          {/* TANGGAL */}
          <section className="space-y-2">
            <h3 className="text-xs font-medium text-text-title">Tanggal</h3>

            <div className="relative z-10 w-full">
              <DateInput
                variant="range"
                startValue={draft.startDate}
                endValue={draft.endDate}
                onRangeChange={({ start, end }) =>
                  setDraft((previous) => ({
                    ...previous,
                    startDate: start,
                    endDate: end,
                  }))
                }
              />
            </div>
          </section>

          {/* STATUS */}
          <section className="space-y-2">
            <h3 className="text-xs font-medium text-text-title">Status</h3>

            <CategorySelector<BackupStatus>
              name="backup-status-mobile"
              value={draft.status === "all" ? ("" as BackupStatus) : draft.status}
              options={statusOptions}
              onChange={handleStatusChange}
              className="
                [&>div]:flex!
                [&>div]:flex-wrap
                [&>div]:gap-2

                [&_label]:w-auto
                [&_label]:min-w-24
                [&_label]:min-h-9
                [&_label]:items-center
                [&_label]:justify-center
                [&_label]:rounded-lg
                [&_label]:px-4
                [&_label]:py-2

                [&_input]:sr-only

                [&_label_span]:text-xs
                [&_label_span]:font-medium
              "
            />
          </section>
        </div>

        {/* FOOTER */}
        <div
          className="
            shrink-0 bg-table-card
            px-5 py-4
            pb-[max(1rem,env(safe-area-inset-bottom))]
          "
        >
          <div className="grid grid-cols-2 gap-3">
            <Button
              type="button"
              variant="secondary"
              label="Reset"
              onClick={handleReset}
              className="w-full"
            />

            <Button type="button" label="Terapkan" onClick={handleApply} className="w-full" />
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
}

// ==========================================
// WRAPPER
// ==========================================
export default function BackupFilterMobile({
  show,
  filters,
  onClose,
  onApply,
}: BackupFilterMobileProps) {
  if (!show) return null;

  return <BackupFilterContent filters={filters} onClose={onClose} onApply={onApply} />;
}
