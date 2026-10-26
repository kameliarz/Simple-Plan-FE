import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { IconChevronDown, IconChevronUp, IconPlus, IconSearch } from "@tabler/icons-react";
import BaseTable from "@/components/BaseTable/BaseTable";
import Badge from "@/components/ui/Badge";
import MaintenanceFilterPopover from "../components/MaintenanceFilterPopover";
import { maintenanceService } from "../services/maintenanceService";
import type {
  MaintenanceFilterState,
  MaintenanceItem,
  MaintenanceStatus,
} from "../types/maintenance.types";

export default function DaftarMaintenancePage() {
  const navigate = useNavigate();

  const [items, setItems] = useState<MaintenanceItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const [filters, setFilters] = useState<MaintenanceFilterState>({
    klasifikasi: "Semua klasifikasi",
    lokasiRuangan: "Semua lokasi",
    petugas: "Semua petugas",
    status: "Semua status",
    rentangJadwal: "",
  });

  const filterContainerRef = useRef<HTMLDivElement>(null);

  const loadData = async (query = searchTerm, currentFilters = filters) => {
    setIsLoading(true);
    try {
      const data = await maintenanceService.getMaintenances(query, currentFilters);
      setItems(data);
    } catch (err) {
      console.error("Gagal mengambil daftar maintenance:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Handle outside click for filter popover
  useEffect(() => {
    const handleOutside = (e: MouseEvent) => {
      if (filterContainerRef.current && !filterContainerRef.current.contains(e.target as Node)) {
        setIsFilterOpen(false);
      }
    };

    if (isFilterOpen) {
      document.addEventListener("mousedown", handleOutside);
    }
    return () => document.removeEventListener("mousedown", handleOutside);
  }, [isFilterOpen]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setSearchTerm(val);
    void loadData(val, filters);
  };

  const handleApplyFilter = (newFilters: MaintenanceFilterState) => {
    setFilters(newFilters);
    void loadData(searchTerm, newFilters);
  };

  const handleResetFilter = () => {
    const empty: MaintenanceFilterState = {
      klasifikasi: "Semua klasifikasi",
      lokasiRuangan: "Semua lokasi",
      petugas: "Semua petugas",
      status: "Semua status",
      rentangJadwal: "",
    };
    setFilters(empty);
    void loadData(searchTerm, empty);
  };

  const renderStatusBadge = (status: MaintenanceStatus) => {
    switch (status) {
      case "Terlambat":
        return (
          <span className="inline-flex items-center rounded-full border border-[#fecdd3] bg-[#fff1f2] px-3 py-0.5 text-xs font-semibold text-[#e11d48]">
            Terlambat
          </span>
        );
      case "Terjadwal":
        return (
          <span className="inline-flex items-center rounded-full border border-[#fde68a] bg-[#fffbeb] px-3 py-0.5 text-xs font-semibold text-[#d97706]">
            Terjadwal
          </span>
        );
      case "Selesai":
        return (
          <span className="inline-flex items-center rounded-full border border-[#a7f3d0] bg-[#ecfdf5] px-3 py-0.5 text-xs font-semibold text-[#10b981]">
            Selesai
          </span>
        );
      default:
        return <Badge variant="default">{status}</Badge>;
    }
  };

  // Columns definition for BaseTable
  const columns = [
    {
      key: "nomorInventaris" as keyof MaintenanceItem,
      label: "NOMOR INVENTARIS",
      sortable: true,
      render: (val: unknown, row: MaintenanceItem) => (
        <button
          type="button"
          onClick={() => navigate(`/maintenance/${row.id}`)}
          className="font-bold text-[#003178] hover:underline dark:text-blue-400"
        >
          {String(val ?? row.nomorInventaris)}
        </button>
      ),
    },
    {
      key: "namaBarang" as keyof MaintenanceItem,
      label: "NAMA BARANG",
      sortable: true,
      render: (val: unknown) => (
        <span className="text-gray-800 dark:text-slate-100 font-medium">{String(val ?? "-")}</span>
      ),
    },
    {
      key: "tanggalJadwal" as keyof MaintenanceItem,
      label: "TANGGAL JADWAL",
      sortable: true,
      render: (val: unknown) => (
        <span className="text-gray-600 dark:text-slate-300">{String(val ?? "-")}</span>
      ),
    },
    {
      key: "petugas" as keyof MaintenanceItem,
      label: "PETUGAS",
      sortable: true,
      render: (val: unknown) => (
        <span className="text-gray-700 dark:text-slate-200">{String(val ?? "-")}</span>
      ),
    },
    {
      key: "status" as keyof MaintenanceItem,
      label: "STATUS",
      sortable: true,
      render: (val: unknown) => renderStatusBadge(val as MaintenanceStatus),
    },
  ];

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-6 md:px-8">
      {/* Title */}
      <h1 className="mb-6 text-xl font-bold text-gray-800 dark:text-slate-100">
        Daftar Maintenance
      </h1>

      {/* Action Bar (Search, Filter, Tambah Jadwal) */}
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center">
        {/* Search Input */}
        <div className="relative flex-1">
          <input
            type="text"
            value={searchTerm}
            onChange={handleSearchChange}
            placeholder="Cari nomor inventaris, ID, atau nama barang..."
            className="h-10 w-full rounded-lg border border-gray-200 bg-white px-4 pr-10 text-xs text-gray-800 placeholder-gray-400 outline-none transition focus:border-primary-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 shadow-sm"
          />
          <IconSearch
            size={18}
            className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400"
          />
        </div>

        {/* Filter Button & Popover */}
        <div ref={filterContainerRef} className="relative">
          <button
            type="button"
            onClick={() => setIsFilterOpen((prev) => !prev)}
            className="flex h-10 items-center justify-between gap-3 rounded-lg border border-gray-200 bg-white px-4 text-xs font-medium text-gray-700 transition hover:bg-gray-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800 shadow-sm min-w-[100px]"
          >
            <span>Filter</span>
            {isFilterOpen ? <IconChevronUp size={16} /> : <IconChevronDown size={16} />}
          </button>

          <MaintenanceFilterPopover
            isOpen={isFilterOpen}
            onClose={() => setIsFilterOpen(false)}
            filters={filters}
            onApply={handleApplyFilter}
            onReset={handleResetFilter}
          />
        </div>

        {/* Button Tambah Jadwal */}
        <button
          type="button"
          onClick={() => navigate("/maintenance/create")}
          className="flex h-10 items-center justify-center gap-2 rounded-lg bg-[#003178] px-4 text-xs font-semibold text-white transition hover:bg-[#00255c] active:scale-98 shadow-sm whitespace-nowrap"
        >
          <IconPlus size={16} strokeWidth={2.5} />
          <span>Tambah Jadwal</span>
        </button>
      </div>

      {/* Table Container */}
      <div className="rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900 overflow-hidden">
        {isLoading ? (
          <div className="flex h-64 items-center justify-center text-xs text-gray-400">
            Memuat daftar maintenance...
          </div>
        ) : (
          <BaseTable
            columns={columns}
            data={items}
            itemsPerPage={4}
            onRowClick={(row) => navigate(`/maintenance/${row.id}`)}
          />
        )}
      </div>
    </div>
  );
}
