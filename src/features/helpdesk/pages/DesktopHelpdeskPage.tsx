import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Search, Filter } from "lucide-react";
import { MOCK_TICKETS } from "../data/mockTickets";
import type { TicketItem } from "../types/helpdesk";
import NavbarHeader from "../../../components/layout/NavbarHeader";
import BaseTable from "../../../components/BaseTable/BaseTable";
import Badge from "../../../components/ui/Badge";
import Input from "../../../components/ui/Input";
import DatePicker from "../../../components/ui/DatePicker";
import EmptyState from "../../../components/ui/EmptyState";
import DropdownFilter from "../../../components/ui/DropdownFilter";
import DesktopHelpdeskDetailPage from "./DesktopHelpdeskDetailPage";
import DesktopCreateTicketPage from "./DesktopCreateTicketPage";
export function DesktopHelpdeskPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [selectedTicket, setSelectedTicket] = useState<TicketItem | null>(null);
  const [isCreatingTicket, setIsCreatingTicket] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    if (location.pathname === "/helpdesk/sarpras/buat") {
      setIsCreatingTicket(true);
      setSelectedTicket(null);
    } else {
      setIsCreatingTicket(false);
    }
  }, [location.pathname]);

  const breadcrumbs = isCreatingTicket ? [
    { label: "Koordinator Sarpas", href: "#" },
    { label: "Helpdesk", href: "#", onClick: () => setIsCreatingTicket(false) },
    { label: "Buat Tiket" },
  ] : selectedTicket ? [
    { label: "Koordinator Sarpas", href: "#" },
    { label: "Helpdesk", href: "#", onClick: () => setSelectedTicket(null) },
    { label: "Helpdesk Sarpras" },
  ] : [
    { label: "Koordinator Sarpas", href: "#" },
    { label: "Helpdesk", href: "#" },
    { label: "Helpdesk Sarpras" },
  ];

  const columns = [
    {
      key: "code" as keyof TicketItem,
      label: "NOMOR TIKET",
      sortable: true,
      render: (value: any) => (
        <span className="font-medium text-slate-700 dark:text-slate-300">#{value}</span>
      ),
    },
    {
      key: "reporter" as keyof TicketItem,
      label: "PELAPOR",
      sortable: true,
      render: (value: any) => value?.name || "-",
    },
    {
      key: "reporter" as keyof TicketItem,
      label: "UNIT",
      render: (value: any) => value?.unit || "-",
    },
    {
      key: "createdAt" as keyof TicketItem,
      label: "TANGGAL MASUK",
      sortable: true,
    },
    {
      key: "status" as keyof TicketItem,
      label: "STATUS",
      sortable: true,
      render: (value: any) => {
        let variant: "default" | "primary" | "success" | "warning" | "danger" | "info" = "default";

        switch (value) {
          case "Baru":
          case "Ditutup":
            variant = "default";
            break;
          case "Diklasifikasi":
            variant = "warning";
            break;
          case "Terverifikasi":
            // Teal/cyan
            return (
              <Badge className="px-3 py-1 font-normal capitalize bg-teal-50 text-teal-700 border-teal-300 dark:bg-teal-950/30 dark:text-teal-400 dark:border-teal-800/60">
                {value}
              </Badge>
            );
          case "Ditugaskan":
            variant = "warning";
            break;
          case "Diproses":
            variant = "info";
            break;
          case "Eskalasi":
            // Orange
            return (
              <Badge className="px-3 py-1 font-normal capitalize bg-orange-50 text-orange-700 border-orange-300 dark:bg-orange-950/30 dark:text-orange-400 dark:border-orange-800/60">
                {value}
              </Badge>
            );
          case "Terselesaikan":
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
    {
      key: "priority" as keyof TicketItem,
      label: "PRIORITAS",
      sortable: true,
      render: (value: any) => {
        if (!value) return "-";
        
        let variant: "default" | "primary" | "success" | "warning" | "danger" | "info" = "default";
        
        switch (value) {
          case "Critical":
            variant = "danger";
            break;
          case "High":
            variant = "info";
            break;
          case "Medium":
            variant = "warning";
            break;
          case "Low":
            variant = "default";
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

  const filteredData = MOCK_TICKETS.filter((t: TicketItem) => {
    const matchesSearch =
      t.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.reporter.name.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === "all" || t.status === statusFilter;
    const matchesPriority = priorityFilter === "all" || t.priority === priorityFilter;

    return matchesSearch && matchesStatus && matchesPriority;
  });

  const handleRowClick = (ticket: TicketItem) => {
    setSelectedTicket(ticket);
  };

  const handleStatusChange = (ticketId: string, newStatus: TicketItem["status"]) => {
    // Di aplikasi nyata, ini akan memanggil API
    console.log(`Update ticket ${ticketId} status to ${newStatus}`);
  };

  return (
    <div className="flex-1 flex flex-col h-screen overflow-hidden bg-background relative">
      <NavbarHeader breadcrumbs={breadcrumbs} notificationCount={1} />

      {isCreatingTicket ? (
        <DesktopCreateTicketPage
          onBack={() => navigate("/helpdesk/sarpras")}
          onSubmitSuccess={() => navigate("/helpdesk/sarpras")}
        />
      ) : selectedTicket ? (
        <DesktopHelpdeskDetailPage
          ticket={selectedTicket}
          onBack={() => setSelectedTicket(null)}
          onStatusChange={handleStatusChange}
        />
      ) : (
        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-[1200px] mx-auto space-y-6">
            {/* Toolbar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg shadow-sm p-4">
              <div className="flex flex-wrap items-center gap-3">
                <div className="flex items-center text-slate-700 dark:text-slate-300 font-medium text-sm px-2">
                  <Filter className="w-4 h-4 mr-2" />
                  Filters
                </div>
                <div className="h-6 w-px bg-slate-200 dark:bg-slate-700 mx-1"></div>
                <div className="w-44">
                  <DropdownFilter
                    value={statusFilter}
                    onChange={setStatusFilter}
                    placeholder="Semua status"
                    options={[
                      { label: "Semua status", value: "all" },
                      { label: "Baru", value: "Baru" },
                      { label: "Diklasifikasi", value: "Diklasifikasi" },
                      { label: "Diproses", value: "Diproses" },
                      { label: "Eskalasi", value: "Eskalasi" },
                      { label: "Terselesaikan", value: "Terselesaikan" },
                      { label: "Ditutup", value: "Ditutup" },
                      { label: "Ditolak", value: "Ditolak" },
                    ]}
                  />
                </div>
                <div className="w-44">
                  <DropdownFilter
                    value={priorityFilter}
                    onChange={setPriorityFilter}
                    placeholder="Semua prioritas"
                    options={[
                      { label: "Semua prioritas", value: "all" },
                      { label: "Critical", value: "Critical" },
                      { label: "High", value: "High" },
                      { label: "Medium", value: "Medium" },
                      { label: "Low", value: "Low" },
                    ]}
                  />
                </div>
                <div className="w-44">
                  <DatePicker 
                    value="" 
                    onChange={() => { }} 
                    placeholder="mm/dd/yyyy"
                    className="[&>div>input]:bg-blue-50/50 [&>div>input]:border-transparent [&>div>input]:text-slate-700 [&>div>input]:hover:bg-blue-50 [&>div>input]:h-[36px] [&>div>input]:rounded-md"
                  />
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
              </div>
            </div>

            {/* Main Content Area */}
            <div className="bg-white dark:bg-slate-900 rounded-lg shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden min-h-[400px]">
              {filteredData.length === 0 ? (
                <EmptyState
                  title="Tiket Tidak Ditemukan"
                  description={
                    searchQuery
                      ? `Pencarian untuk "${searchQuery}" tidak membuahkan hasil.`
                      : "Tidak ada tiket yang ditemukan dengan filter saat ini."
                  }
                />
              ) : (
                <BaseTable<TicketItem>
                  columns={columns}
                  data={filteredData}
                  itemsPerPage={4}
                  onRowClick={handleRowClick}
                />
              )}
            </div>
          </div>
        </main>
      )}
    </div>
  );
}

export default DesktopHelpdeskPage;
