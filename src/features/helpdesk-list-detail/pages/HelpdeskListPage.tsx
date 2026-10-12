import { useEffect, useState } from "react";

import { IconFilter, IconFolder } from "@tabler/icons-react";
import { useLocation, useNavigate } from "react-router-dom";
import { TicketCardMobile } from "../components/TicketCardMobile";
import { TicketFilterBottomSheet } from "../components/TicketFilterBottomSheet";

import type { FilterState } from "../components/TicketFilterBottomSheet";

import { getTickets } from "../services/ticketApi";

import type { TicketPriority, TicketStatus } from "../types/helpdesk";

import Table from "@/components/ui/ui-template/Table";
import Pagination from "@/components/ui/ui-template/Pagination";
import Search from "@/components/ui/ui-template/Search";
import Dropdown from "@/components/ui/ui-template/Dropdown";
import DateInput from "@/components/ui/ui-template/DateInput";

import { TicketStatusBadge } from "../components/TicketStatusBadge";
import { TicketPriorityBadge } from "../components/TicketPriorityBadge";

import type {
  ApiTicket,
  ApiTicketStatus,
  ApiTicketPriority,
  TicketCollectionResponse,
} from "../types/ticket";

const ITEMS_PER_PAGE = 15;

/* =========================
   LABEL STATUS
========================= */

const statusLabelMap: Record<ApiTicketStatus, TicketStatus> = {
  baru: "Baru",
  diklasifikasi: "Diklasifikasi",
  ditugaskan: "Ditugaskan",
  ditolak: "Ditolak",
  diproses: "Diproses",
  eskalasi: "Eskalasi",
  terselesaikan: "Terselesaikan",
  ditutup: "Ditutup",
};

/* =========================
   LABEL PRIORITY
========================= */

const priorityLabelMap: Record<ApiTicketPriority, TicketPriority> = {
  critical: "Critical",
  high: "High",
  medium: "Medium",
  low: "Low",
};

/* =========================
   FORMAT DATE
========================= */

const formatDateTime = (dateString: string): string => {
  const date = new Date(dateString);

  if (Number.isNaN(date.getTime())) {
    return "-";
  }

  return new Intl.DateTimeFormat("id-ID", {
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

/* =========================
   MAIN PAGE
========================= */

export default function HelpdeskSAPage() {
  const navigate = useNavigate();
  const location = useLocation();

  const service = location.pathname.includes("/helpdesk/sarpras")
    ? "sarpras"
    : location.pathname.includes("/helpdesk/tik")
      ? "tik"
      : undefined;

  /* =========================
     STATE
  ========================= */

  const [tickets, setTickets] = useState<ApiTicket[]>([]);

  const [meta, setMeta] = useState<TicketCollectionResponse["meta"] | null>(null);

  const [currentPage, setCurrentPage] = useState(1);

  const [search, setSearch] = useState("");

  const [status, setStatus] = useState<ApiTicketStatus | "">("");

  const [priority, setPriority] = useState<ApiTicketPriority | "">("");

  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [isFilterSheetOpen, setIsFilterSheetOpen] = useState(false);

  /* =========================
     FETCH TICKETS
  ========================= */

  useEffect(() => {
    let isActive = true;

    const fetchTickets = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await getTickets({
          page: currentPage,
          per_page: ITEMS_PER_PAGE,
          service,

          status: status || undefined,
          priority: priority || undefined,

          search: search.trim() || undefined,

          date_from: dateFrom || undefined,
          date_to: dateTo || undefined,
        });

        if (!isActive) return;

        // Debug sementara
        console.log("GET /tickets response:", response);

        console.log(
          "Ticket priorities:",
          response.data.map((ticket) => ({
            id: ticket.id,
            ticket_number: ticket.ticket_number,
            priority: ticket.priority,
          })),
        );

        setTickets(response.data);
        setMeta(response.meta);
      } catch (error) {
        if (!isActive) return;

        setError(error instanceof Error ? error.message : "Gagal mengambil data tiket.");
      } finally {
        if (isActive) {
          setLoading(false);
        }
      }
    };

    fetchTickets();

    return () => {
      isActive = false;
    };
  }, [currentPage, search, status, priority, dateFrom, dateTo, service]);

  /* =========================
     FILTER HANDLERS
  ========================= */

  const handleSearchChange = (value: string) => {
    setSearch(value);
    setCurrentPage(1);
  };

  const handleStatusChange = (value: string) => {
    const statusValueMap: Record<string, ApiTicketStatus | ""> = {
      "Semua status": "",
      Baru: "baru",
      Diklasifikasi: "diklasifikasi",
      Ditolak: "ditolak",
      Diproses: "diproses",
      Eskalasi: "eskalasi",
      Terselesaikan: "terselesaikan",
      Ditutup: "ditutup",
    };

    setStatus(statusValueMap[value] ?? "");
    setCurrentPage(1);
  };

  const handlePriorityChange = (value: string) => {
    const priorityValueMap: Record<string, ApiTicketPriority | ""> = {
      "Semua prioritas": "",
      Critical: "critical",
      High: "high",
      Medium: "medium",
      Low: "low",
    };

    setPriority(priorityValueMap[value] ?? "");
    setCurrentPage(1);
  };

  const handleDateRangeChange = ({ start, end }: { start: string; end: string }) => {
    setDateFrom(start);
    setDateTo(end);
    setCurrentPage(1);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleTicketClick = (ticket: ApiTicket) => {
    navigate(`/helpdesk/${service}/${ticket.id}`);
  };

  /* =========================
     MOBILE FILTER
  ========================= */

  const handleApplyMobileFilters = (filters: FilterState) => {
    setStatus(filters.status ?? "");
    setPriority(filters.priority ?? "");
    setDateFrom(filters.dateFrom);
    setDateTo(filters.dateTo);
    setCurrentPage(1);
  };

  const initialMobileFilters: FilterState = {
    status,
    priority,
    dateFrom,
    dateTo,
  };

  /* =========================
     EMPTY STATE
  ========================= */

  const emptyMessage = search
    ? `Pencarian untuk "${search}" tidak membuahkan hasil.`
    : "Tidak ada tiket yang sesuai dengan filter.";

  const renderEmptyState = () => (
    <div className="flex flex-col items-center px-4 py-10 text-center">
      <div
        className="
          mb-3 flex h-14 w-14 items-center justify-center
          rounded-2xl border border-slate-200
          bg-slate-50 text-slate-400 shadow-sm
          dark:border-slate-700 dark:bg-slate-800
        "
      >
        <IconFolder size={28} strokeWidth={1.5} />
      </div>

      <p className="text-sm font-medium text-text">Tiket Tidak Ditemukan</p>

      <p className="mt-1 text-xs text-text-secondary">{emptyMessage}</p>
    </div>
  );

  /* =========================
     MOBILE TICKET LIST
  ========================= */

  const renderMobileTickets = () => {
    if (loading) {
      return (
        <div
          className="
            rounded-lg border border-slate-200
            bg-table-card py-10 text-center
            text-sm text-text-secondary
            dark:border-slate-700
          "
        >
          Memuat data tiket...
        </div>
      );
    }

    if (error) {
      return (
        <div
          className="
            rounded-lg border border-slate-200
            bg-table-card py-10 text-center
            text-sm text-red-500
            dark:border-slate-700
          "
        >
          {error}
        </div>
      );
    }

    if (tickets.length === 0) {
      return (
        <div
          className="
            rounded-lg border border-slate-200
            bg-table-card dark:border-slate-700
          "
        >
          {renderEmptyState()}
        </div>
      );
    }

    return (
      <div className="space-y-2">
        {tickets.map((ticket) => (
          <TicketCardMobile key={ticket.id} ticket={ticket} onClick={handleTicketClick} />
        ))}
      </div>
    );
  };

  /* =========================
     RENDER
  ========================= */

  return (
    <div
      className="
        min-h-full bg-background
        px-4 py-3 text-text
        sm:p-4 lg:p-5
      "
    >
      <div className="mx-auto max-w-350">
        {/* =========================
            FILTER CARD
        ========================= */}

        <div
          className="
            mb-4 overflow-visible rounded-lg
            border border-slate-200 bg-table-card
            dark:border-slate-700
          "
        >
          {/* MOBILE SEARCH + FILTER BUTTON */}

          <div className="flex items-center gap-2 p-3 md:hidden">
            <div className="min-w-0 flex-1">
              <Search
                value={search}
                onChange={handleSearchChange}
                placeholder="Cari ID tiket, pelapor..."
              />
            </div>

            <button
              type="button"
              onClick={() => setIsFilterSheetOpen(true)}
              aria-label="Buka filter tiket"
              aria-haspopup="dialog"
              aria-expanded={isFilterSheetOpen}
              className="
                flex h-10 w-10 shrink-0
                items-center justify-center
                rounded-lg border
                border-slate-200
                bg-white text-text-secondary
                transition-colors
                hover:bg-slate-50
                focus-visible:outline-none
                focus-visible:ring-2
                focus-visible:ring-blue-500
                dark:border-slate-700
                dark:bg-slate-800
              "
            >
              <IconFilter size={18} strokeWidth={1.8} />
            </button>
          </div>

          {/* DESKTOP FILTER CONTROLS */}

          <div
            className="
              hidden border-t border-slate-200
              p-4 dark:border-slate-700
              md:block md:border-t-0
            "
          >
            <div className="flex flex-wrap items-center gap-3">
              {/* FILTER LABEL */}

              <div
                className="
                  flex items-center gap-2
                  border-r border-slate-200 pr-4
                  dark:border-slate-700
                "
              >
                <IconFilter size={16} strokeWidth={2} className="text-text-secondary" />

                <span className="text-sm font-medium text-text-secondary">Filters</span>
              </div>

              {/* STATUS FILTER */}

              <Dropdown
                value={status ? statusLabelMap[status] : ""}
                options={[
                  "Semua status",
                  "Baru",
                  "Diklasifikasi",
                  "Ditolak",
                  "Diproses",
                  "Eskalasi",
                  "Terselesaikan",
                  "Ditutup",
                ]}
                onChange={handleStatusChange}
                placeholder="Semua status"
              />

              {/* PRIORITY FILTER */}

              <Dropdown
                value={priority ? priorityLabelMap[priority] : ""}
                options={["Semua prioritas", "Critical", "High", "Medium", "Low"]}
                onChange={handlePriorityChange}
                placeholder="Semua prioritas"
                className="w-44"
              />

              {/* DATE FILTER */}

              <DateInput
                variant="range"
                startValue={dateFrom}
                endValue={dateTo}
                onRangeChange={handleDateRangeChange}
              />

              {/* DESKTOP SEARCH */}

              <div className="ml-auto w-64">
                <Search value={search} onChange={handleSearchChange} placeholder="Cari data..." />
              </div>
            </div>
          </div>
        </div>

        {/* =========================
            MOBILE TICKET LIST
        ========================= */}

        <div className="md:hidden">
          {renderMobileTickets()}

          {/* MOBILE PAGINATION */}

          {meta && (
            <div className="mt-3">
              <Pagination meta={meta} onPageChange={handlePageChange} />
            </div>
          )}
        </div>

        {/* =========================
            DESKTOP TABLE
        ========================= */}

        <div
          className="
            hidden overflow-hidden rounded-lg
            border border-slate-200 bg-table-card
            dark:border-slate-700 md:block
          "
        >
          <Table>
            <Table.Thead>
              <tr>
                <Table.Th>Nomor Tiket</Table.Th>
                <Table.Th>Pelapor</Table.Th>
                <Table.Th>Unit</Table.Th>
                <Table.Th>Tanggal Masuk</Table.Th>
                <Table.Th>Status</Table.Th>
                <Table.Th>Prioritas</Table.Th>
              </tr>
            </Table.Thead>

            <Table.Tbody>
              {loading ? (
                <tr>
                  <td
                    colSpan={6}
                    className="
                      py-10 text-center
                      text-sm text-text-secondary
                    "
                  >
                    Memuat data tiket...
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td
                    colSpan={6}
                    className="
                      py-10 text-center
                      text-sm text-red-500
                    "
                  >
                    {error}
                  </td>
                </tr>
              ) : tickets.length > 0 ? (
                tickets.map((ticket) => (
                  <tr
                    key={ticket.id}
                    onClick={() => handleTicketClick(ticket)}
                    className="
                      cursor-pointer transition-colors
                      hover:bg-slate-50
                      dark:hover:bg-slate-700
                    "
                  >
                    {/* NOMOR TIKET */}

                    <Table.Td>
                      <span className="font-medium text-text-secondary">
                        #{ticket.ticket_number}
                      </span>
                    </Table.Td>

                    {/* PELAPOR */}

                    <Table.Td>{ticket.reporter.name}</Table.Td>

                    {/* UNIT */}

                    <Table.Td>{ticket.unit.name}</Table.Td>

                    {/* TANGGAL MASUK */}

                    <Table.Td>{formatDateTime(ticket.created_at)}</Table.Td>

                    {/* STATUS */}

                    <Table.Td>
                      <TicketStatusBadge status={statusLabelMap[ticket.status]} />
                    </Table.Td>

                    {/* PRIORITAS */}

                    <Table.Td>
                      <TicketPriorityBadge
                        priority={ticket.priority ? priorityLabelMap[ticket.priority] : null}
                      />
                    </Table.Td>
                  </tr>
                ))
              ) : (
                <Table.Empty colSpan={6} message="Tiket Tidak Ditemukan" description={emptyMessage}>
                  <div
                    className="
                      flex h-16 w-16
                      items-center justify-center
                      rounded-2xl border
                      border-slate-200
                      bg-slate-50 text-slate-400
                      shadow-sm
                      dark:border-slate-700
                      dark:bg-slate-800
                    "
                  >
                    <IconFolder size={30} strokeWidth={1.5} />
                  </div>
                </Table.Empty>
              )}
            </Table.Tbody>
          </Table>

          {/* DESKTOP PAGINATION */}

          {meta && <Pagination meta={meta} onPageChange={handlePageChange} />}
        </div>

        {/* =========================
            MOBILE FILTER BOTTOM SHEET
        ========================= */}

        <TicketFilterBottomSheet
          isOpen={isFilterSheetOpen}
          onClose={() => setIsFilterSheetOpen(false)}
          onApply={handleApplyMobileFilters}
          initialFilters={initialMobileFilters}
        />
      </div>
    </div>
  );
}
