import React, { useState } from "react";
import type { TicketStatus } from "../types/helpdesk";
import { MOCK_TICKETS } from "../data/mockTickets";
import { TicketCardMobile } from "../components/TicketCardMobile";
import { TicketFilterBottomSheet, type FilterState } from "../components/TicketFilterBottomSheet";
import SearchFilterBar from "../../../components/ui/SearchFilterBar";
import FilterChips from "../../../components/ui/FilterChips";
import FloatingActionButton from "../../../components/ui/FloatingActionButton";

interface HelpdeskListPageProps {
  onSelectTicket?: (id: string) => void;
  onNewTicket?: () => void;
}

const filterTabs: Array<"Semua" | TicketStatus> = [
  "Semua",
  "Baru",
  "Diklasifikasi",
  "Terselesaikan",
  "Ditolak",
];

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
      <SearchFilterBar
        placeholder="Cari ID tiket, pelapor..."
        value={searchQuery}
        onChange={setSearchQuery}
        onFilterClick={() => setIsFilterSheetOpen(true)}
        isFilterActive={Boolean(filters.status || filters.date)}
      />

      {/* 2. Horizontal Filter Pills */}
      <FilterChips
        options={filterTabs}
        selected={activeTab}
        onSelect={(tab) => setActiveTab(tab as "Semua" | TicketStatus)}
      />

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
      <FloatingActionButton onClick={onNewTicket} title="Buat Tiket Baru" />

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
