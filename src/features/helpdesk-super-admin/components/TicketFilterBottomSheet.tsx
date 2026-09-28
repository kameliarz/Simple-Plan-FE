import React, { useState } from "react";
import type { TicketStatus } from "../types/helpdesk";
import Button from "../../../components/ui/Button";
import BottomSheet from "../../../components/ui/BottomSheet";
import DatePicker from "../../../components/ui/DatePicker";
import { cn } from "../../../lib/utils";

export interface FilterState {
  status: TicketStatus | null;
  date: string;
}

interface TicketFilterBottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  onApply: (filters: FilterState) => void;
  initialFilters?: FilterState;
}

const statusOptions: TicketStatus[] = [
  "Baru",
  "Diklasifikasi",
  "Diproses",
  "Terselesaikan",
  "Ditolak",
];

export const TicketFilterBottomSheet: React.FC<TicketFilterBottomSheetProps> = ({
  isOpen,
  onClose,
  onApply,
  initialFilters = { status: null, date: "" },
}) => {
  const [selectedStatus, setSelectedStatus] = useState<TicketStatus | null>(initialFilters.status);
  const [selectedDate, setSelectedDate] = useState<string>(initialFilters.date);

  const handleReset = () => {
    setSelectedStatus(null);
    setSelectedDate("");
    onApply({ status: null, date: "" });
    onClose();
  };

  const handleApply = () => {
    onApply({
      status: selectedStatus,
      date: selectedDate,
    });
    onClose();
  };

  const footerContent = (
    <div className="flex items-center gap-3">
      <Button
        type="button"
        variant="outline"
        onClick={handleReset}
        className="flex-1 py-2.5 text-xs font-semibold rounded-xl border-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
      >
        Reset
      </Button>
      <Button
        type="button"
        onClick={handleApply}
        className="flex-1 py-2.5 text-xs font-semibold rounded-xl bg-[#003178] hover:bg-[#00255a] text-white"
      >
        Terapkan
      </Button>
    </div>
  );

  return (
    <BottomSheet isOpen={isOpen} onClose={onClose} title="Filter Tiket" footer={footerContent}>
      {/* Section: Status */}
      <div className="space-y-2.5">
        <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 block">
          Status
        </span>
        <div className="flex flex-wrap gap-2">
          {statusOptions.map((st) => {
            const isSelected = selectedStatus === st;
            return (
              <button
                key={st}
                type="button"
                onClick={() => setSelectedStatus(isSelected ? null : st)}
                className={cn(
                  "px-4 py-2 rounded-xl text-xs font-medium border transition select-none cursor-pointer",
                  isSelected
                    ? "bg-blue-50/80 dark:bg-blue-950/40 border-blue-900 dark:border-blue-400 text-blue-950 dark:text-blue-300 font-semibold ring-1 ring-blue-900 dark:ring-blue-400"
                    : "border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800",
                )}
              >
                {st}
              </button>
            );
          })}
        </div>
      </div>

      {/* Section: Tanggal */}
      <DatePicker
        label="Tanggal"
        placeholder="10/01/2023"
        value={selectedDate}
        onChange={setSelectedDate}
      />
    </BottomSheet>
  );
};

export default TicketFilterBottomSheet;
