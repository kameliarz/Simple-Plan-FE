import { useEffect, useState } from "react";

import { IconFilter, IconFolder } from "@tabler/icons-react";

import { useNavigate } from "react-router-dom";

import Table from "@/components/ui/ui-template/Table";
import Pagination from "@/components/ui/ui-template/Pagination";
import Search from "@/components/ui/ui-template/Search";
import Dropdown from "@/components/ui/ui-template/Dropdown";
import DateInput from "@/components/ui/ui-template/DateInput";

import { TicketStatusBadge } from "../components/TicketStatusBadge";

import { getTickets } from "../services/ticketApi";
import type { ApiTicket, ApiTicketStatus, TicketCollectionResponse } from "../types/ticket";

const ITEMS_PER_PAGE = 3;

// Status dari backend menggunakan lowercase,
// sedangkan TicketStatusBadge saat ini menggunakan format UI.
const statusLabelMap: Record<ApiTicketStatus, string> = {
  baru: "Baru",
  terverifikasi: "Terverifikasi",
  diproses: "Diproses",
  selesai: "Selesai",
  ditolak: "Ditolak",
};

export default function HelpdeskSAPage() {
  const navigate = useNavigate();

  // Data tiket yang diterima dari backend
  const [tickets, setTickets] = useState<ApiTicket[]>([]);

  // Pagination dari backend
  const [meta, setMeta] = useState<TicketCollectionResponse["meta"] | null>(null);

  // Filter
  const [currentPage, setCurrentPage] = useState(1);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [date, setDate] = useState("");

  // State loading dan error
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Ambil data tiket dari backend setiap kali
  // halaman atau filter berubah.
  useEffect(() => {
    const fetchTickets = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await getTickets({
          page: currentPage,
          per_page: ITEMS_PER_PAGE,

          // Halaman ini khusus Helpdesk TIK
          service: "tik",

          // Filter dikirim ke backend
          status: status ? (status as ApiTicketStatus) : undefined,

          search: search.trim() || undefined,

          // Kalau DateInput memilih satu tanggal,
          // kita kirim sebagai tanggal awal dan akhir.
          date_from: date || undefined,
          date_to: date || undefined,
        });

        setTickets(response.data);
        setMeta(response.meta);
      } catch (error) {
        setError(error instanceof Error ? error.message : "Gagal mengambil data tiket.");
      } finally {
        setLoading(false);
      }
    };

    fetchTickets();
  }, [currentPage, search, status, date]);

  // Ketika search berubah, kembali ke halaman pertama
  const handleSearchChange = (value: string) => {
    setSearch(value);
    setCurrentPage(1);
  };

  // Ketika status berubah, kembali ke halaman pertama
  const handleStatusChange = (value: string) => {
    setStatus(value);
    setCurrentPage(1);
  };

  // Ketika tanggal berubah, kembali ke halaman pertama
  const handleDateChange = (value: string) => {
    setDate(value);
    setCurrentPage(1);
  };

  // Ketika pagination berubah
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  return (
    <div className="min-h-full bg-background p-4 text-text lg:p-5">
      <div className="mx-auto max-w-350">
        {/* Filter Card */}
        <div className="mb-4 overflow-visible rounded-lg border border-slate-200 bg-table-card dark:border-slate-700">
          <div className="flex flex-wrap items-center gap-3 p-4">
            {/* Filter label */}
            <div className="flex items-center gap-2 border-r border-slate-200 pr-4 dark:border-slate-700">
              <IconFilter size={16} strokeWidth={2} className="text-text-secondary" />

              <span className="text-sm font-medium text-text-secondary">Filters</span>
            </div>

            {/* Status */}
            <Dropdown
              value={status ? statusLabelMap[status as ApiTicketStatus] : ""}
              options={["Semua status", "Baru", "Terverifikasi", "Diproses", "Selesai", "Ditolak"]}
              onChange={(value) => {
                if (value === "Semua status") {
                  handleStatusChange("");
                  return;
                }

                // Ubah label UI menjadi status yang dimengerti backend
                const statusValue: Record<string, ApiTicketStatus> = {
                  Baru: "baru",
                  Terverifikasi: "terverifikasi",
                  Diproses: "diproses",
                  Selesai: "selesai",
                  Ditolak: "ditolak",
                };

                handleStatusChange(statusValue[value]);
              }}
              placeholder="Semua status"
            />

            {/* Date */}
            <DateInput value={date} onChange={handleDateChange} />

            {/* Search */}
            <div className="ml-auto w-full lg:w-64">
              <Search value={search} onChange={handleSearchChange} placeholder="Cari data..." />
            </div>
          </div>
        </div>

        {/* Table Card */}
        <div className="overflow-hidden rounded-lg border border-slate-200 bg-table-card dark:border-slate-700">
          <Table>
            <Table.Thead>
              <tr>
                <Table.Th>Nomor Tiket</Table.Th>
                <Table.Th>Pelapor</Table.Th>
                <Table.Th>Unit</Table.Th>
                <Table.Th>Tanggal Masuk</Table.Th>
                <Table.Th>Status</Table.Th>
              </tr>
            </Table.Thead>

            <Table.Tbody>
              {/* Loading */}
              {loading ? (
                <tr>
                  <td colSpan={5} className="py-10 text-center text-sm text-text-secondary">
                    Memuat data tiket...
                  </td>
                </tr>
              ) : /* Error */
              error ? (
                <tr>
                  <td colSpan={5} className="py-10 text-center text-sm text-red-500">
                    {error}
                  </td>
                </tr>
              ) : /* Data tersedia */
              tickets.length > 0 ? (
                tickets.map((ticket) => (
                  <tr
                    key={ticket.id}
                    onClick={() => navigate(`/helpdesk/tik/${ticket.id}`)}
                    className="cursor-pointer transition-colors hover:bg-slate-50 dark:hover:bg-slate-700"
                  >
                    <Table.Td>
                      <span className="font-medium text-text-secondary">
                        {ticket.ticket_number}
                      </span>
                    </Table.Td>

                    <Table.Td>{ticket.reporter.name}</Table.Td>

                    <Table.Td>{ticket.unit.name}</Table.Td>

                    <Table.Td>{ticket.created_at}</Table.Td>

                    <Table.Td>
                      <TicketStatusBadge
                        status={
                          statusLabelMap[ticket.status] as import("../types/helpdesk").TicketStatus
                        }
                      />
                    </Table.Td>
                  </tr>
                ))
              ) : (
                /* Tidak ada data */
                <Table.Empty
                  colSpan={5}
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

          {/* Pagination menggunakan meta dari backend */}
          {meta && <Pagination meta={meta} onPageChange={handlePageChange} />}
        </div>
      </div>
    </div>
  );
}
