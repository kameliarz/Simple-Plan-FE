import { useEffect, useState } from "react";

import { IconFilter, IconFolder } from "@tabler/icons-react";
import { useLocation, useNavigate } from "react-router-dom";

import Table from "@/components/ui/ui-template/Table";
import Pagination from "@/components/ui/ui-template/Pagination";
import Search from "@/components/ui/ui-template/Search";
import Dropdown from "@/components/ui/ui-template/Dropdown";
import DateInput from "@/components/ui/ui-template/DateInput";

import { TicketStatusBadge } from "../components/TicketStatusBadge";
import { TicketPriorityBadge } from "../components/TicketPriorityBadge";

import { getTickets } from "../services/ticketApi";

import type { TicketPriority, TicketStatus } from "../types/helpdesk";
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

export default function HelpdeskSAPage() {
  const navigate = useNavigate();
  const location = useLocation();

  const service = location.pathname.includes("/helpdesk/sarpras") ? "sarpras" : "tik";

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

          date_from: dateFrom || undefined,
          date_to: dateTo || undefined,
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

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  /* =========================
     RENDER
  ========================= */

  return (
    <div className="min-h-full bg-background p-4 text-text lg:p-5">
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

            <DateInput
              variant="range"
              startValue={dateFrom}
              endValue={dateTo}
              onRangeChange={({ start, end }) => {
                setDateFrom(start);
                setDateTo(end);
                setCurrentPage(1);
              }}
            />

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
                    onClick={() => navigate(`/helpdesk/${service}/${ticket.id}`)}
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
  );
}
