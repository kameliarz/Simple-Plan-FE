import React, { useState } from "react";
import { Search, SlidersHorizontal, Plus } from "lucide-react";
import type { TicketStatus } from "../types/helpdesk";
import { MOCK_TICKETS } from "../data/mockTickets";
import { TicketCardMobile } from "../components/TicketCardMobile";
import { TicketFilterBottomSheet, type FilterState } from "../components/TicketFilterBottomSheet";
import { cn } from "../../../lib/utils";

interface HelpdeskListPageProps {
  onSelectTicket?: (id: string) => void;
  onNewTicket?: () => void;
}

export const HelpdeskListPage: React.FC<HelpdeskListPageProps> = ({
  onSelectTicket,
  onNewTicket,
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<"Semua" | TicketStatus>("Semua");
  const [isFilterSheetOpen, setIsFilterSheetOpen] = useState(false);
  const [filters, setFilters] = useState<FilterState>({
    status: null,
    date: "",
  });

  const filterTabs: Array<"Semua" | TicketStatus> = [
    "Semua",
    "Baru",
    "Terverifikasi",
    "Selesai",
    "Ditolak",
  ];

  const filteredTickets = MOCK_TICKETS.filter((ticket) => {
    const matchSearch =
      ticket.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ticket.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ticket.reporter.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ticket.reporter.unit.toLowerCase().includes(searchQuery.toLowerCase());

    const matchTab = activeTab === "Semua" || ticket.status === activeTab;
    const matchSheetStatus = !filters.status || ticket.status === filters.status;

    return matchSearch && matchTab && matchSheetStatus;
  });

  return (
    <div className="w-full pb-24 px-4 pt-3 space-y-4">
      {/* 1. Bar Pencarian + Tombol Filter */}
      <div className="flex items-center gap-2.5">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari ID tiket, pelapor..."
            className="w-full pl-10 pr-4 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#1e293b] text-slate-800 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-900/20 shadow-xs"
          />
        </div>

        <button
          type="button"
          onClick={() => setIsFilterSheetOpen(true)}
          className={cn(
            "p-2.5 rounded-xl border transition shadow-xs flex items-center justify-center cursor-pointer shrink-0",
            filters.status || filters.date
              ? "bg-blue-950 text-white border-blue-950"
              : "bg-white dark:bg-[#1e293b] border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800",
          )}
          title="Buka Filter"
        >
          <SlidersHorizontal className="w-4 h-4" />
        </button>
      </div>

      {/* 2. Horizontal Filter Pills */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-0.5 -mx-4 px-4">
        {filterTabs.map((tab) => {
          const isActive = activeTab === tab;
          return (
            <button
              key={tab}
              type="button"
              onClick={() => setActiveTab(tab)}
              className={cn(
                "px-4 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors select-none cursor-pointer border",
                isActive
                  ? "bg-[#003178] border-[#003178] text-white shadow-xs font-semibold"
                  : "bg-white dark:bg-[#1e293b] border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800",
              )}
            >
              {tab}
            </button>
          );
        })}
      </div>

      {/* 3. Daftar Kartu Tiket */}
      <div className="space-y-3">
        {filteredTickets.length > 0 ? (
          filteredTickets.map((ticket) => (
            <TicketCardMobile
              key={ticket.id}
              ticket={ticket}
              onClick={() => onSelectTicket?.(ticket.id)}
            />
          ))
        ) : (
          <div className="text-center py-12 px-4 rounded-2xl bg-white dark:bg-[#1e293b] border border-slate-100 dark:border-slate-800 text-slate-400">
            <p className="text-sm font-semibold">Tidak ada tiket ditemukan</p>
            <p className="text-xs mt-1">Coba sesuaikan kata kunci atau filter pencarian.</p>
          </div>
        )}
      </div>

      {/* 4. Floating Action Button (FAB +) */}
      <button
        type="button"
        onClick={onNewTicket}
        className="fixed bottom-20 right-4 z-30 w-13 h-13 rounded-2xl bg-[#003178] hover:bg-[#00255a] active:scale-95 text-white shadow-xl flex items-center justify-center transition cursor-pointer"
        title="Buat Tiket Baru"
      >
        <Plus className="w-6 h-6" />
      </button>

      {/* 5. Bottom Sheet Filter */}
      <TicketFilterBottomSheet
        isOpen={isFilterSheetOpen}
        onClose={() => setIsFilterSheetOpen(false)}
        initialFilters={filters}
        onApply={(newFilters) => setFilters(newFilters)}
      />
    </div>
  );
};

export default HelpdeskListPage;
