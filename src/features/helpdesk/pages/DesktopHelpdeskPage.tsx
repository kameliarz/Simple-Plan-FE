import { useState } from "react";
import { Search, Filter, ListPlus, X } from "lucide-react";
import { MOCK_TICKETS } from "../data/mockTickets";
import type { TicketItem } from "../types/helpdesk";
import NavbarHeader from "../../../components/layout/NavbarHeader";
import BaseTable from "../../../components/BaseTable/BaseTable";
import Badge from "../../../components/ui/Badge";
import Input from "../../../components/ui/Input";
import Button from "../../../components/ui/Button";
import DatePicker from "../../../components/ui/DatePicker";
import Select from "../../../components/ui/Select";
import Checkbox from "../../../components/ui/Checkbox";
import RadioButton from "../../../components/ui/RadioButton";
import EmptyState from "../../../components/ui/EmptyState";
import ErrorState from "../../../components/ui/ErrorState";
import LoadingStateOverlay from "../../../components/ui/LoadingStateOverlay";
import SkeletonLoading from "../../../components/ui/SkeletonLoading";

export function DesktopHelpdeskPage() {
  const [searchQuery, setSearchQuery] = useState("");

  // State for demonstrations
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedAssignee, setSelectedAssignee] = useState<string>("");
  const [notifyAssignee, setNotifyAssignee] = useState(true);

  // Simulate loading data
  const handleSimulateLoad = () => {
    setIsLoading(true);
    setTimeout(() => setIsLoading(false), 2000);
  };

  const breadcrumbs = [{ label: "Super Admin", href: "#" }, { label: "Helpdesk TIK" }];

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
    {
      key: "id" as keyof TicketItem,
      label: "AKSI",
      render: () => (
        <Button
          variant="outline"
          className="text-xs py-1 h-7 border-blue-200 text-blue-600 hover:bg-blue-50 dark:border-blue-800 dark:text-blue-400 dark:hover:bg-blue-900/30"
          onClick={() => setShowAssignModal(true)}
        >
          Tugaskan
        </Button>
      ),
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

      {isLoading && <LoadingStateOverlay fullScreen message="Memuat data tiket..." />}

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
              <Button onClick={() => setIsError(!isError)} variant="outline" className="text-sm">
                Toggle Error
              </Button>
              <Button onClick={handleSimulateLoad} variant="outline" className="text-sm">
                Simulasi Load
              </Button>
              <Button className="flex items-center font-medium bg-white text-slate-700 border border-slate-200 shadow-sm hover:bg-slate-50 dark:bg-slate-800 dark:text-slate-200 dark:border-slate-700 dark:hover:bg-slate-700">
                <ListPlus className="w-4 h-4 mr-2" />
                Tambah Tiket
              </Button>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="bg-white dark:bg-slate-900 rounded-lg shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden min-h-[400px]">
            {isError ? (
              <ErrorState onRetry={() => setIsError(false)} />
            ) : filteredData.length === 0 ? (
              <EmptyState
                title="Tiket Tidak Ditemukan"
                description={`Pencarian untuk "${searchQuery}" tidak membuahkan hasil.`}
                action={<Button onClick={() => setSearchQuery("")}>Hapus Pencarian</Button>}
              />
            ) : (
              <BaseTable<TicketItem> columns={columns} data={filteredData} itemsPerPage={10} />
            )}
          </div>

          {/* Contoh Skeleton Loading saat loading table manual (opsional) */}
          {isLoading && (
            <div className="space-y-3 mt-8 p-6 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800">
              <h3 className="text-sm font-semibold mb-4">Contoh Skeleton Loading Component:</h3>
              <SkeletonLoading className="h-8 w-full" />
              <SkeletonLoading className="h-8 w-full" />
              <SkeletonLoading className="h-8 w-full" />
            </div>
          )}
        </div>
      </main>

      {/* Modal Mockup: Tugaskan Petugas (Mendemonstrasikan RadioButton & Checkbox) */}
      {showAssignModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 w-[450px] rounded-xl shadow-xl overflow-hidden border border-slate-200 dark:border-slate-800">
            <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
              <h2 className="font-semibold text-slate-800 dark:text-slate-100">Tugaskan Petugas</h2>
              <button
                onClick={() => setShowAssignModal(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 space-y-4">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <Input
                  placeholder="Cari nama petugas..."
                  className="pl-9 w-full text-sm dark:bg-slate-800 dark:border-slate-700"
                />
              </div>

              <div className="space-y-3 mt-4">
                <div
                  className="flex items-center justify-between p-3 border border-blue-500 bg-blue-50 dark:bg-blue-900/20 rounded-lg cursor-pointer"
                  onClick={() => setSelectedAssignee("hw")}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-bold">
                      HW
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-800 dark:text-slate-200">
                        Hendra Wijaya
                      </p>
                      <p className="text-xs text-slate-500">IT Support - SIMRS</p>
                    </div>
                  </div>
                  <RadioButton
                    name="assignee"
                    id="hw"
                    checked={selectedAssignee === "hw"}
                    readOnly
                  />
                </div>

                <div
                  className="flex items-center justify-between p-3 border border-slate-200 dark:border-slate-700 rounded-lg cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800"
                  onClick={() => setSelectedAssignee("rp")}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 flex items-center justify-center text-xs font-bold">
                      RP
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-800 dark:text-slate-200">
                        Rian Pratama
                      </p>
                      <p className="text-xs text-slate-500">Teknisi Lapangan</p>
                    </div>
                  </div>
                  <RadioButton
                    name="assignee"
                    id="rp"
                    checked={selectedAssignee === "rp"}
                    readOnly
                  />
                </div>

                <div
                  className="flex items-center justify-between p-3 border border-slate-200 dark:border-slate-700 rounded-lg cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800"
                  onClick={() => setSelectedAssignee("sa")}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 flex items-center justify-center text-xs font-bold">
                      SA
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-800 dark:text-slate-200">
                        Siti Aisyah
                      </p>
                      <p className="text-xs text-slate-500">IT Helpdesk</p>
                    </div>
                  </div>
                  <RadioButton
                    name="assignee"
                    id="sa"
                    checked={selectedAssignee === "sa"}
                    readOnly
                  />
                </div>
              </div>

              <div className="pt-4 mt-4 border-t border-slate-100 dark:border-slate-800">
                <Checkbox
                  id="notify"
                  label="Kirim notifikasi ke petugas via WhatsApp"
                  checked={notifyAssignee}
                  onChange={(e) => setNotifyAssignee(e.target.checked)}
                />
              </div>
            </div>

            <div className="p-4 bg-slate-50 dark:bg-slate-800/50 flex justify-end gap-3 border-t border-slate-100 dark:border-slate-800">
              <Button
                variant="outline"
                onClick={() => setShowAssignModal(false)}
                className="dark:border-slate-600 dark:text-slate-300"
              >
                Batal
              </Button>
              <Button
                onClick={() => setShowAssignModal(false)}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                Tugaskan
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default DesktopHelpdeskPage;
