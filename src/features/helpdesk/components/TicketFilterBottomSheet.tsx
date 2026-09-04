import React, { useState } from "react";
import { Calendar, X } from "lucide-react";
import type { TicketStatus } from "../types/helpdesk";
import Button from "../../../components/ui/Button";
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

const statusOptions: TicketStatus[] = ["Baru", "Terverifikasi", "Diproses", "Selesai", "Ditolak"];

export const TicketFilterBottomSheet: React.FC<TicketFilterBottomSheetProps> = ({
  isOpen,
  onClose,
  onApply,
  initialFilters = { status: null, date: "" },
}) => {
  const [selectedStatus, setSelectedStatus] = useState<TicketStatus | null>(initialFilters.status);
  const [selectedDate, setSelectedDate] = useState<string>(initialFilters.date);

  if (!isOpen) return null;

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

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Sheet Modal Drawer */}
      <div className="relative w-full max-w-md bg-white dark:bg-[#1e293b] rounded-t-3xl p-5 shadow-2xl z-10 space-y-5 animate-in slide-in-from-bottom duration-300 border-t border-slate-100 dark:border-slate-800">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">Filter Tiket</h3>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

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
        <div className="space-y-2">
          <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 block">
            Tanggal
          </span>
          <div className="relative">
            <input
              type="text"
              placeholder="10/01/2023"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full px-3.5 py-2.5 pr-10 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-900/20"
            />
            <Calendar className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3 pt-2">
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
            className="flex-1 py-2.5 text-xs font-semibold rounded-xl bg-blue-950 hover:bg-blue-900 text-white"
          >
            Terapkan
          </Button>
        </div>
      </div>
    </div>
  );
};

export default TicketFilterBottomSheet;
