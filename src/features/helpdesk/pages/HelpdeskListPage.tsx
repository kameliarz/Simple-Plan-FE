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
  "Ditugaskan",
  "Diproses",
  "Eskalasi",
  "Terselesaikan",
  "Terverifikasi",
  "Ditutup",
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
      <div className="space-y-3 flex-1 flex flex-col">
        {filteredTickets.length > 0 ? (
          filteredTickets.map((ticket) => (
            <TicketCardMobile
              key={ticket.id}
              ticket={ticket}
              onClick={() => onSelectTicket?.(ticket.id)}
            />
          ))
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center py-20 text-slate-400 dark:text-slate-500">
            <div className="flex items-center gap-2 text-sm">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="16" x2="12" y2="12"></line>
                <line x1="12" y1="8" x2="12.01" y2="8"></line>
              </svg>
              <span>Data tiket tidak ditemukan!</span>
            </div>
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
