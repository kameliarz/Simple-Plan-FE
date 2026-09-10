import { useState } from "react";
import { Search, Filter, ListPlus } from "lucide-react";
import { MOCK_TICKETS } from "../data/mockTickets";
import type { TicketItem } from "../types/helpdesk";
import NavbarHeader from "../../../components/layout/NavbarHeader";
import BaseTable from "../../../components/BaseTable/BaseTable";
import Badge from "../../../components/ui/Badge";
import Input from "../../../components/ui/Input";
import Button from "../../../components/ui/Button";
import DatePicker from "../../../components/ui/DatePicker";
import Select from "../../../components/ui/Select";
import EmptyState from "../../../components/ui/EmptyState";

export function DesktopHelpdeskPage() {
  const [searchQuery, setSearchQuery] = useState("");

  const breadcrumbs = [
    { label: "Koordinator Sarpas", href: "#" },
    { label: "Helpdesk", href: "#" },
    { label: "Helpdesk Sarpras" },
  ];

  const columns = [
    {
      key: "code" as keyof TicketItem,
      label: "NOMOR TIKET",
      sortable: true,
      render: (value: TicketItem["code"]) => (
        <span className="font-medium text-slate-700 dark:text-slate-300">#{value}</span>
      ),
    },
    {
      key: "reporter" as keyof TicketItem,
      label: "PELAPOR",
      sortable: true,
      render: (value: TicketItem["reporter"]) => value?.name || "-",
    },
    {
      key: "reporter" as keyof TicketItem,
      label: "UNIT",
      render: (value: TicketItem["reporter"]) => value?.unit || "-",
    },
    {
      key: "createdAt" as keyof TicketItem,
      label: "TANGGAL DIBUAT",
      sortable: true,
    },
    {
      key: "status" as keyof TicketItem,
      label: "STATUS",
      sortable: true,
      render: (value: TicketItem["status"]) => {
        let variant: "default" | "success" | "warning" | "danger" | "info" = "default";

        switch (value) {
          case "Baru":
            variant = "default";
            break;
          case "Terverifikasi":
            variant = "warning";
            break;
          case "Diproses":
            variant = "info";
            break;
          case "Selesai":
            variant = "success";
            break;
          case "Ditolak":
            variant = "danger";
            break;
        }

        return (
          <Badge variant={variant} className="px-3 py-1 font-normal capitalize">
            {value}
          </Badge>
        );
      },
    },
  ];

  const filteredData = MOCK_TICKETS.filter(
    (t: TicketItem) =>
      t.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.reporter.name.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <div className="flex-1 flex flex-col h-screen overflow-hidden bg-[#f4f7f9] dark:bg-slate-900/50 relative">
      <NavbarHeader breadcrumbs={breadcrumbs} notificationCount={1} />

      <main className="flex-1 overflow-y-auto p-6">
        <div className="max-w-[1200px] mx-auto space-y-6">
          {/* Toolbar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg shadow-sm">
            <div className="flex items-center gap-3">
              <div className="flex items-center text-slate-700 dark:text-slate-300 font-medium text-sm px-2">
                <Filter className="w-4 h-4 mr-2" />
                Filters
              </div>
              <div className="h-6 w-px bg-slate-200 dark:bg-slate-700 mx-1"></div>
              <div className="w-40">
                <Select className="w-full text-sm border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 rounded-md px-3 py-2 outline-none">
                  <option value="all">Semua status</option>
                  <option value="baru">Baru</option>
                  <option value="diproses">Diproses</option>
                </Select>
              </div>
              <div className="w-44">
                <DatePicker value="" onChange={() => {}} />
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="relative w-64">
                <Search className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <Input
                  placeholder="Cari data..."
                  className="w-full text-sm py-2 px-3 pr-9 rounded-md border border-slate-200 dark:border-slate-700 dark:bg-slate-800 outline-none focus:border-blue-400"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <div className="h-6 w-px bg-slate-200 dark:bg-slate-700 mx-1"></div>
              <Button className="flex items-center font-medium bg-slate-100 text-slate-700 border-transparent hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700 rounded-md">
                <ListPlus className="w-4 h-4 mr-2" />
                Tambah Tiket
              </Button>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="bg-white dark:bg-slate-900 rounded-lg shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden min-h-[400px]">
            {filteredData.length === 0 ? (
              <EmptyState
                title="Tiket Tidak Ditemukan"
                description={`Pencarian untuk "${searchQuery}" tidak membuahkan hasil.`}
                action={<Button onClick={() => setSearchQuery("")}>Hapus Pencarian</Button>}
              />
            ) : (
              <BaseTable<TicketItem> columns={columns} data={filteredData} itemsPerPage={4} />
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

export default DesktopHelpdeskPage;
