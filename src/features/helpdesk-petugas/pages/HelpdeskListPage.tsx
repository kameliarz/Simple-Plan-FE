import { useEffect, useState } from "react";

import { IconFilter, IconFolder } from "@tabler/icons-react";
import { useLocation, useNavigate } from "react-router-dom";

import Table from "@/components/ui/ui-template/Table";
import Pagination from "@/components/ui/ui-template/Pagination";
import Search from "@/components/ui/ui-template/Search";
import Dropdown from "@/components/ui/ui-template/Dropdown";
import DateInput from "@/components/ui/ui-template/DateInput";

import { TicketStatusBadge } from "../../helpdesk-koor/components/TicketStatusBadge";
import { TicketPriorityBadge } from "../../helpdesk-koor/components/TicketPriorityBadge";
import { TicketCardMobile } from "../components/TicketCardMobile";
import { TicketFilterBottomSheet } from "../components/TicketFilterBottomSheet";
import SearchFilterBar from "../../../components/ui/SearchFilterBar";
import FilterChips from "../../../components/ui/FilterChips";

import { getTickets } from "../../helpdesk-koor/services/ticketApi";

import type { TicketPriority, TicketStatus, TicketItem } from "../../helpdesk-koor/types/helpdesk";
import type {
  ApiTicket,
  ApiTicketStatus,
  ApiTicketPriority,
  TicketCollectionResponse,
} from "../../helpdesk-koor/types/ticket";

const ITEMS_PER_PAGE = 15;

/* =========================
   LABEL STATUS
========================= */

const statusLabelMap: Record<ApiTicketStatus, TicketStatus> = {
  baru: "Baru",
  diklasifikasi: "Diklasifikasi",
  ditolak: "Ditolak",
  ditugaskan: "Ditugaskan",
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

const mapApiTicketToTicketItem = (ticket: ApiTicket): TicketItem => {
  return {
    id: String(ticket.id),
    code: ticket.ticket_number,
    title: ticket.category ?? "-",
    description: ticket.description,
    category: ticket.service === "tik" ? "TIK" : "Sarpras",
    status: statusLabelMap[ticket.status],
    priority: ticket.priority ? priorityLabelMap[ticket.priority] : null,
    reporter: {
      name: ticket.reporter.name,
      unit: ticket.unit.name,
      avatarInitials: ticket.reporter.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .slice(0, 2)
        .toUpperCase(),
    },
    createdAt: formatDateTime(ticket.created_at),
  };
};

export default function HelpdeskListPage() {
  const navigate = useNavigate();
  const location = useLocation();

  const service = location.pathname.includes("tik") ? "tik" : "sarpras";

  /* =========================
     STATE
  ========================= */

  const [tickets, setTickets] = useState<ApiTicket[]>([]);

  const [meta, setMeta] = useState<TicketCollectionResponse["meta"] | null>(null);

  const [currentPage, setCurrentPage] = useState(1);

  const [search, setSearch] = useState("");

  const [status, setStatus] = useState<ApiTicketStatus | "">("");

  const [priority, setPriority] = useState<ApiTicketPriority | "">("");

  const [date, setDate] = useState("");

  const [loading, setLoading] = useState(false);

  const [error, setError] = useState<string | null>(null);

  const [isFilterSheetOpen, setIsFilterSheetOpen] = useState(false);

  /* =========================
     FETCH TICKETS
  ========================= */

  useEffect(() => {
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

          date_from: date || undefined,
          date_to: date || undefined,
        });

        /*
         * DEBUG SEMENTARA
         *
         * Ini penting untuk memastikan data priority
         * benar-benar masuk dari API.
         */
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
        setError(error instanceof Error ? error.message : "Gagal mengambil data tiket.");
      } finally {
        setLoading(false);
      }
    };

    fetchTickets();
  }, [currentPage, search, status, priority, date, service]);

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
      Ditugaskan: "ditugaskan",
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

  const handleDateChange = (value: string) => {
    setDate(value);
    setCurrentPage(1);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  /* =========================
     RENDER
  ========================= */

  return (
    <div className="min-h-full bg-background text-text">
      {/* =========================
          MOBILE VIEW
      ========================= */}
      <div className="block md:hidden w-full pb-24 px-4 pt-3 space-y-4">
        <SearchFilterBar
          placeholder="Cari ID tiket, pelapor..."
          value={search}
          onChange={handleSearchChange}
          onFilterClick={() => setIsFilterSheetOpen(true)}
          isFilterActive={Boolean(status || priority || date)}
        />

        <FilterChips
          options={["Semua", "Baru", "Diklasifikasi", "Diproses", "Terselesaikan", "Ditolak"]}
          selected={status ? statusLabelMap[status] : "Semua"}
          onSelect={(tab) => {
            if (tab === "Semua") {
              setStatus("");
            } else {
              const apiStatus = Object.keys(statusLabelMap).find(
                (key) => statusLabelMap[key as ApiTicketStatus] === tab,
              ) as ApiTicketStatus | undefined;
              setStatus(apiStatus || "");
            }
            setCurrentPage(1);
          }}
        />

        <div className="space-y-3">
          {loading ? (
            <div className="py-10 text-center text-sm text-text-secondary">
              Memuat data tiket...
            </div>
          ) : error ? (
            <div className="py-10 text-center text-sm text-red-500">{error}</div>
          ) : tickets.length > 0 ? (
            tickets.map((ticket) => (
              <TicketCardMobile
                key={ticket.id}
                ticket={mapApiTicketToTicketItem(ticket)}
                onClick={() => navigate(`/petugas/${service}/helpdesk/${ticket.id}`)}
              />
            ))
          ) : (
            <div className="flex flex-col items-center justify-center py-16 space-y-4 text-slate-400">
              <IconFolder size={32} strokeWidth={1.5} className="text-slate-300" />
              <p className="text-sm font-semibold">Data tiket tidak ditemukan!</p>
            </div>
          )}
        </div>

        {meta && <Pagination meta={meta} onPageChange={handlePageChange} />}

        <TicketFilterBottomSheet
          isOpen={isFilterSheetOpen}
          onClose={() => setIsFilterSheetOpen(false)}
          initialFilters={{
            status: status ? statusLabelMap[status] : null,
            priority: priority ? priorityLabelMap[priority] : null,
            date: date,
          }}
          onApply={(filters) => {
            if (filters.status) {
              const apiStatus = Object.keys(statusLabelMap).find(
                (key) => statusLabelMap[key as ApiTicketStatus] === filters.status,
              ) as ApiTicketStatus;
              setStatus(apiStatus);
            } else {
              setStatus("");
            }

            if (filters.priority) {
              const apiPriority = Object.keys(priorityLabelMap).find(
                (key) => priorityLabelMap[key as ApiTicketPriority] === filters.priority,
              ) as ApiTicketPriority;
              setPriority(apiPriority);
            } else {
              setPriority("");
            }

            setDate(filters.date);
            setCurrentPage(1);
          }}
        />
      </div>

      {/* =========================
          DESKTOP VIEW
      ========================= */}
      <div className="hidden md:block p-4 lg:p-5">
        <div className="mx-auto max-w-350">
          {/* =========================
            FILTER CARD
        ========================= */}

          <div className="mb-4 overflow-visible rounded-lg border border-slate-200 bg-table-card dark:border-slate-700">
            <div className="flex flex-wrap items-center gap-3 p-4">
              {/* Filter label */}

              <div className="flex items-center gap-2 border-r border-slate-200 pr-4 dark:border-slate-700">
                <IconFilter size={16} strokeWidth={2} className="text-text-secondary" />

                <span className="text-sm font-medium text-text-secondary">Filters</span>
              </div>

              {/* Status */}

              <Dropdown
                value={status ? statusLabelMap[status] : ""}
                options={[
                  "Semua status",
                  "Baru",
                  "Diklasifikasi",
                  "Ditolak",
                  "Ditugaskan",
                  "Diproses",
                  "Eskalasi",
                  "Terselesaikan",
                  "Ditutup",
                ]}
                onChange={handleStatusChange}
                placeholder="Semua status"
              />

              <Dropdown
                value={priority ? priorityLabelMap[priority] : ""}
                options={["Semua prioritas", "Critical", "High", "Medium", "Low"]}
                onChange={handlePriorityChange}
                placeholder="Semua prioritas"
                className="w-44"
              />

              {/* Date */}

              <DateInput value={date} onChange={handleDateChange} />

              {/* Search */}

              <div className="ml-auto w-full lg:w-64">
                <Search value={search} onChange={handleSearchChange} placeholder="Cari data..." />
              </div>
            </div>
          </div>

          {/* =========================
            TABLE CARD
        ========================= */}

          <div className="overflow-hidden rounded-lg border border-slate-200 bg-table-card dark:border-slate-700">
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
                {/* =========================
                  LOADING
              ========================= */}

                {loading ? (
                  <tr>
                    <td colSpan={6} className="py-10 text-center text-sm text-text-secondary">
                      Memuat data tiket...
                    </td>
                  </tr>
                ) : /* =========================
                   ERROR
               ========================= */
                error ? (
                  <tr>
                    <td colSpan={6} className="py-10 text-center text-sm text-red-500">
                      {error}
                    </td>
                  </tr>
                ) : /* =========================
                   DATA
               ========================= */
                tickets.length > 0 ? (
                  tickets.map((ticket) => (
                    <tr
                      key={ticket.id}
                      onClick={() => navigate(`/petugas/${service}/helpdesk/${ticket.id}`)}
                      className="cursor-pointer transition-colors hover:bg-slate-50 dark:hover:bg-slate-700"
                    >
                      {/* Nomor tiket */}

                      <Table.Td>
                        <span className="font-medium text-text-secondary">
                          #{ticket.ticket_number}
                        </span>
                      </Table.Td>

                      {/* Pelapor */}

                      <Table.Td>{ticket.reporter.name}</Table.Td>

                      {/* Unit */}

                      <Table.Td>{ticket.unit.name}</Table.Td>

                      {/* Tanggal masuk */}

                      <Table.Td>{formatDateTime(ticket.created_at)}</Table.Td>

                      {/* Status */}

                      <Table.Td>
                        <TicketStatusBadge status={statusLabelMap[ticket.status]} />
                      </Table.Td>

                      {/* Prioritas */}

                      <Table.Td>
                        <TicketPriorityBadge
                          priority={ticket.priority ? priorityLabelMap[ticket.priority] : null}
                        />
                      </Table.Td>
                    </tr>
                  ))
                ) : (
                  /* =========================
                   EMPTY
               ========================= */

                  <Table.Empty
                    colSpan={6}
                    message="Tiket Tidak Ditemukan"
                    description={
                      search
                        ? `Pencarian untuk "${search}" tidak membuahkan hasil.`
                        : "Tidak ada tiket yang sesuai dengan filter."
                    }
                  >
                    <div
                      className="
                      flex
                      h-16
                      w-16
                      items-center
                      justify-center
                      rounded-2xl
                      border
                      border-slate-200
                      bg-slate-50
                      text-slate-400
                      shadow-sm
                      dark:border-slate-700
                      dark:bg-slate-800
                      dark:text-slate-400
                    "
                    >
                      <IconFolder size={30} strokeWidth={1.5} />
                    </div>
                  </Table.Empty>
                )}
              </Table.Tbody>
            </Table>

            {/* Pagination */}

            {meta && <Pagination meta={meta} onPageChange={handlePageChange} />}
          </div>
        </div>
      </div>
    </div>
  );
}
