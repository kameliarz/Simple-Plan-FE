import { useMemo, useState } from "react";
import { IconFilter } from "@tabler/icons-react";
import { IconFolder } from "@tabler/icons-react";
import { useNavigate } from "react-router-dom";

import Table from "@/components/ui/ui-template/Table";
import Pagination from "@/components/ui/ui-template/Pagination";
import Search from "@/components/ui/ui-template/Search";
import Dropdown from "@/components/ui/ui-template/Dropdown";
import DateInput from "@/components/ui/ui-template/DateInput";
import { TicketStatusBadge } from "../components/TicketStatusBadge";

import type { ApiMeta } from "@/types/api";

import { MOCK_TICKETS } from "../data/mockTickets";

const ITEMS_PER_PAGE = 3;

export default function HelpdeskSAPage() {
  // Menyimpan halaman yang sedang aktif
  const [currentPage, setCurrentPage] = useState(1);

  // Menyimpan nilai filter
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [date, setDate] = useState("");

  // Filter data berdasarkan search, status, dan tanggal
  const filteredTickets = useMemo(() => {
    return MOCK_TICKETS.filter((ticket) => {
      const matchesSearch =
        search.trim() === "" ||
        ticket.code.toLowerCase().includes(search.toLowerCase()) ||
        ticket.reporter.name.toLowerCase().includes(search.toLowerCase()) ||
        ticket.reporter.unit.toLowerCase().includes(search.toLowerCase());

      const matchesStatus = status === "" || ticket.status === status;

      const matchesDate = date === "" || ticket.createdAt === date;

      return matchesSearch && matchesStatus && matchesDate;
    });
  }, [search, status, date]);

  // Menghitung total halaman berdasarkan hasil filter
  const totalPages = Math.ceil(filteredTickets.length / ITEMS_PER_PAGE);

  const navigate = useNavigate();

  // Mengambil data sesuai halaman aktif
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;

  const endIndex = startIndex + ITEMS_PER_PAGE;

  const currentTickets = filteredTickets.slice(startIndex, endIndex);

  // Metadata pagination
  const meta: ApiMeta = {
    current_page: currentPage,
    from: filteredTickets.length === 0 ? null : startIndex + 1,
    last_page: totalPages,
    path: "/helpdesk/tik",
    per_page: ITEMS_PER_PAGE,
    to: filteredTickets.length === 0 ? null : Math.min(endIndex, filteredTickets.length),
    total: filteredTickets.length,
  };

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

  // Ketika halaman pagination berubah
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
              value={status}
              options={["Semua status", "Baru", "Diproses", "Selesai", "Ditolak"]}
              onChange={(value) => {
                handleStatusChange(value === "Semua status" ? "" : value);
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
              {currentTickets.length > 0 ? (
                currentTickets.map((ticket) => (
                  <tr
                    key={ticket.id}
                    onClick={() => navigate(`/helpdesk/tik/${ticket.id}`)}
                    className="cursor-pointer transition-colors hover:bg-slate-50 dark:hover:bg-slate-700"
                  >
                    <Table.Td>
                      <span className="font-medium text-text-secondary">{ticket.code}</span>
                    </Table.Td>

                    <Table.Td>{ticket.reporter.name}</Table.Td>

                    <Table.Td>{ticket.reporter.unit}</Table.Td>

                    <Table.Td>{ticket.createdAt}</Table.Td>

                    <Table.Td>
                      <TicketStatusBadge status={ticket.status} />
                    </Table.Td>
                  </tr>
                ))
              ) : (
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

          {/* Pagination */}
          <Pagination meta={meta} onPageChange={handlePageChange} />
        </div>
      </div>
    </div>
  );
}
