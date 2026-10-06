import { useState } from "react";
import { IconFilter, IconX } from "@tabler/icons-react";

import DateInput from "@/components/ui/ui-template/DateInput";
import { cn } from "@/lib/utils";

import type { ApiTicketStatus, ApiTicketPriority } from "../types/ticket";

export interface FilterState {
  status: ApiTicketStatus | "";
  priority: ApiTicketPriority | "";
  dateFrom: string;
  dateTo: string;
}

interface TicketFilterBottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  onApply: (filters: FilterState) => void;
  initialFilters?: FilterState;
}

const statusOptions: {
  label: string;
  value: ApiTicketStatus;
}[] = [
  { label: "Baru", value: "baru" },
  { label: "Diklasifikasi", value: "diklasifikasi" },
  { label: "Ditolak", value: "ditolak" },
  { label: "Diproses", value: "diproses" },
  { label: "Eskalasi", value: "eskalasi" },
  { label: "Terselesaikan", value: "terselesaikan" },
  { label: "Ditutup", value: "ditutup" },
];

const priorityOptions: {
  label: string;
  value: ApiTicketPriority;
}[] = [
  { label: "Critical", value: "critical" },
  { label: "High", value: "high" },
  { label: "Medium", value: "medium" },
  { label: "Low", value: "low" },
];

const emptyFilters: FilterState = {
  status: "",
  priority: "",
  dateFrom: "",
  dateTo: "",
};

export function TicketFilterBottomSheet({
  isOpen,
  onClose,
  onApply,
  initialFilters = emptyFilters,
}: TicketFilterBottomSheetProps) {
  const [selectedStatus, setSelectedStatus] = useState<ApiTicketStatus | "">(initialFilters.status);

  const [selectedPriority, setSelectedPriority] = useState<ApiTicketPriority | "">(
    initialFilters.priority,
  );

  const [dateFrom, setDateFrom] = useState(initialFilters.dateFrom);
  const [dateTo, setDateTo] = useState(initialFilters.dateTo);

  // Sinkronkan pilihan ketika sheet dibuka kembali.

  const handleReset = () => {
    setSelectedStatus("");
    setSelectedPriority("");
    setDateFrom("");
    setDateTo("");

    onApply(emptyFilters);
    onClose();
  };

  const handleApply = () => {
    onApply({
      status: selectedStatus,
      priority: selectedPriority,
      dateFrom,
      dateTo,
    });

    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-100 md:hidden">
      {/* Backdrop */}
      <button
        type="button"
        aria-label="Tutup filter"
        onClick={onClose}
        className="absolute inset-0 h-full w-full bg-black/40"
      />

      {/* Bottom Sheet */}
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="ticket-filter-title"
        className="
          absolute inset-x-0 bottom-0
          flex max-h-[90dvh] flex-col
          overflow-hidden rounded-t-3xl
          border border-med-border
          bg-table-card shadow-xl
        "
      >
        {/* Handle */}
        <div className="flex shrink-0 justify-center pt-2.5">
          <div className="h-1.5 w-11 rounded-full bg-slate-300" />
        </div>

        {/* Header */}
        <div
          className="
            flex shrink-0 items-center justify-between
            border-b border-med-border
            px-5 py-4
          "
        >
          <div className="flex items-center gap-2">
            <IconFilter size={19} strokeWidth={1.8} className="text-text-title" />

            <h2 id="ticket-filter-title" className="text-base font-semibold text-text-title">
              Filter Tiket
            </h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Tutup"
            className="
              flex h-8 w-8 items-center justify-center
              rounded-full text-slate-500
              transition hover:bg-button/40
            "
          >
            <IconX size={19} strokeWidth={2} />
          </button>
        </div>

        {/* Filter Content */}
        <div
          className="
            min-h-0 flex-1 space-y-6
            overflow-y-auto overscroll-contain
            px-5 py-5
          "
        >
          {/* STATUS */}
          <section className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-text-title">Status</h3>
            </div>

            <div className="flex flex-wrap gap-2">
              {statusOptions.map((option) => {
                const selected = selectedStatus === option.value;

                return (
                  <button
                    key={option.value}
                    type="button"
                    aria-pressed={selected}
                    onClick={() => setSelectedStatus(selected ? "" : option.value)}
                    className={cn(
                      `
                        inline-flex min-h-10
                        items-center gap-2
                        rounded-lg border
                        px-3.5 py-2
                        text-xs font-medium
                        transition-colors
                      `,
                      selected
                        ? `
                          border-blue-500
                          bg-button/40
                          ring-1 ring-primary-600/20
                        `
                        : `
                          border-med-border
                          bg-table-card
                          text-text-title
                          hover:bg-button/40
                        `,
                    )}
                  >
                    {option.label}
                  </button>
                );
              })}
            </div>
          </section>

          <div className="border-t border-med-border" />

          {/* PRIORITAS */}
          <section className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-text-title">Prioritas</h3>
            </div>

            <div className="flex flex-wrap gap-2">
              {priorityOptions.map((option) => {
                const selected = selectedPriority === option.value;

                return (
                  <button
                    key={option.value}
                    type="button"
                    aria-pressed={selected}
                    onClick={() => setSelectedPriority(selected ? "" : option.value)}
                    className={cn(
                      `
                        inline-flex min-h-10
                        items-center gap-2
                        rounded-lg border
                        px-3.5 py-2
                        text-xs font-medium
                        transition-colors
                      `,
                      selected
                        ? `
                          border-blue-500
                          bg-button/40
                          ring-1 ring-primary-600/20
                        `
                        : `
                          border-med-border
                          bg-table-card
                          text-text-title
                          hover:bg-button/40
                        `,
                    )}
                  >
                    {option.label}
                  </button>
                );
              })}
            </div>
          </section>

          <div className="border-t border-med-border" />

          {/* RENTANG TANGGAL */}
          <section className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-text-title">Tanggal</h3>
            </div>

            <div className="relative z-10 w-full">
              <DateInput
                variant="range"
                startValue={dateFrom}
                endValue={dateTo}
                onRangeChange={({ start, end }) => {
                  setDateFrom(start);
                  setDateTo(end);
                }}
              />
            </div>
          </section>
        </div>

        {/* Footer */}
        <div
          className="
            shrink-0 border-t border-med-border
            bg-table-card
            px-5 py-4
            pb-[max(1rem,env(safe-area-inset-bottom))]
          "
        >
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleReset}
              className="
                flex-1 rounded-xl
                border border-med-border
                bg-table-card px-4 py-3
                text-sm font-semibold
                text-text-secondary
                transition hover:bg-button/40
              "
            >
              Reset
            </button>

            <button
              type="button"
              onClick={handleApply}
              className="
                flex-1 rounded-xl
                bg-primary-600 px-4 py-3
                text-sm font-semibold text-white
                shadow-md transition
                hover:bg-blue-900
              "
            >
              Terapkan
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default TicketFilterBottomSheet;
