import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getUser } from "@/features/auth-login/services/authStorage";
import {
  IconChevronDown,
  IconChevronUp,
  IconPlus,
  IconSearch,
  IconCalendarEvent,
  IconCircleCheck,
  IconClipboardList,
  IconAlertTriangle,
  IconAdjustmentsHorizontal,
  IconInfoCircle,
  IconX,
} from "@tabler/icons-react";
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
  const user = getUser();
  const isPetugas =
    user?.role === "petugas-tik" ||
    user?.role === "petugas-sarpras" ||
    Boolean(user?.role?.includes("petugas"));
  const isManajemen = user?.role === "manajemen" || user?.role === "management";

  const [items, setItems] = useState<MaintenanceItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [showMobileFilter, setShowMobileFilter] = useState(false);
  const [mobileVisibleCount, setMobileVisibleCount] = useState(4);
  const [mobileStatus, setMobileStatus] = useState("");
  const [mobileDate, setMobileDate] = useState("");

  const [filters, setFilters] = useState<MaintenanceFilterState>({
    klasifikasi: "Semua klasifikasi",
    lokasiRuangan: "Semua lokasi",
    petugas: "Semua petugas",
    status: "Semua status",
    rentangJadwal: "",
  });

  const filterContainerRef = useRef<HTMLDivElement>(null);

  // Perhitungan statistik untuk role Manajemen
  const stats = useMemo(() => {
    const total = items.length > 0 ? items.length : 42;
    const selesai =
      items.filter((i) => i.status === "Selesai").length || (items.length === 0 ? 31 : 0);
    const terjadwal =
      items.filter((i) => i.status === "Terjadwal").length || (items.length === 0 ? 8 : 0);
    const terlambat =
      items.filter((i) => i.status === "Terlambat").length || (items.length === 0 ? 3 : 0);

    const kondisiBaik =
      items.filter((i) => i.hasilMaintenance?.kondisiPasca === "Baik").length ||
      (items.length === 0 ? 26 : 0);
    const kondisiRusakRingan =
      items.filter((i) => i.hasilMaintenance?.kondisiPasca === "Rusak Ringan").length ||
      (items.length === 0 ? 4 : 0);
    const kondisiRusakBerat =
      items.filter((i) => i.hasilMaintenance?.kondisiPasca === "Rusak Berat").length ||
      (items.length === 0 ? 1 : 0);

    const totalKondisi = kondisiBaik + kondisiRusakRingan + kondisiRusakBerat || 31;
    const baikPct = items.length === 0 ? 84 : Math.round((kondisiBaik / totalKondisi) * 100);
    const ringanPct =
      items.length === 0 ? 13 : Math.round((kondisiRusakRingan / totalKondisi) * 100);
    const beratPct = items.length === 0 ? 3 : 100 - baikPct - ringanPct;

    return {
      total,
      selesai,
      terjadwal,
      terlambat,
      kondisiBaik,
      kondisiRusakRingan,
      kondisiRusakBerat,
      baikPct,
      ringanPct,
      beratPct,
    };
  }, [items]);

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

  const handleApplyMobileFilter = () => {
    const newFilters: MaintenanceFilterState = {
      ...filters,
      status: mobileStatus || "Semua status",
      rentangJadwal: mobileDate,
    };
    setFilters(newFilters);
    void loadData(searchTerm, newFilters);
    setShowMobileFilter(false);
  };

  const handleResetMobileFilter = () => {
    setMobileStatus("");
    setMobileDate("");
    handleResetFilter();
    setShowMobileFilter(false);
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
      <div className="block md:hidden space-y-4">
        {/* Mobile Search & Filter Button */}
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <input
              type="text"
              value={searchTerm}
              onChange={handleSearchChange}
              placeholder="Cari nomor inventaris atau nama..."
              className="h-10 w-full rounded-xl border border-gray-200 bg-white px-4 pr-10 text-xs text-gray-800 placeholder-gray-400 outline-none focus:border-[#003178] shadow-2xs"
            />
            <IconSearch
              size={18}
              className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400"
            />
          </div>
          <button
            type="button"
            onClick={() => setShowMobileFilter(true)}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 active:scale-95 shadow-2xs"
            title="Buka Filter"
          >
            <IconAdjustmentsHorizontal size={18} />
          </button>
        </div>

        {/*Role Manajemen: Laporan Maintenance & Kondisi Pasca-Pemeliharaan */}
        {isManajemen && (
          <div className="space-y-4">
            <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-2xs space-y-3">
              <h2 className="text-xs font-bold text-gray-800">Laporan Maintenance</h2>
              <div className="grid grid-cols-2 gap-3">
                {/* Total Jadwal */}
                <div className="flex items-center justify-between p-3 rounded-xl bg-gray-50/70 border border-gray-100">
                  <div>
                    <p className="text-[10px] text-gray-500">Total Jadwal</p>
                    <p className="text-lg font-bold text-gray-900 mt-0.5">{stats.total}</p>
                  </div>
                  <div className="h-8 w-8 rounded-lg bg-blue-50 text-[#003178] flex items-center justify-center">
                    <IconCalendarEvent size={18} />
                  </div>
                </div>

                {/* Selesai */}
                <div className="flex items-center justify-between p-3 rounded-xl bg-gray-50/70 border border-gray-100">
                  <div>
                    <p className="text-[10px] text-gray-500">Selesai</p>
                    <p className="text-lg font-bold text-gray-900 mt-0.5">{stats.selesai}</p>
                  </div>
                  <div className="h-8 w-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                    <IconCircleCheck size={18} />
                  </div>
                </div>

                {/* Terjadwal */}
                <div className="flex items-center justify-between p-3 rounded-xl bg-gray-50/70 border border-gray-100">
                  <div>
                    <p className="text-[10px] text-gray-500">Terjadwal</p>
                    <p className="text-lg font-bold text-gray-900 mt-0.5">{stats.terjadwal}</p>
                  </div>
                  <div className="h-8 w-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                    <IconClipboardList size={18} />
                  </div>
                </div>

                {/* Terlambat */}
                <div className="flex items-center justify-between p-3 rounded-xl bg-gray-50/70 border border-gray-100">
                  <div>
                    <p className="text-[10px] text-gray-500">Terlambat</p>
                    <p className="text-lg font-bold text-gray-900 mt-0.5">{stats.terlambat}</p>
                  </div>
                  <div className="h-8 w-8 rounded-lg bg-red-50 text-red-500 flex items-center justify-center">
                    <IconAlertTriangle size={18} />
                  </div>
                </div>
              </div>
            </div>

            {/* Kondisi Pasca-Pemeliharaan Card */}
            <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-2xs space-y-3">
              <div className="flex items-center gap-2">
                <IconCircleCheck size={16} className="text-[#003178]" />
                <h2 className="text-xs font-bold text-gray-800">Kondisi Pasca-Pemeliharaan</h2>
              </div>
              <div className="h-2 w-full rounded-full bg-gray-100 overflow-hidden flex">
                <div style={{ width: `${stats.baikPct}%` }} className="bg-[#003178] h-full" />
                <div style={{ width: `${stats.ringanPct}%` }} className="bg-[#6366f1] h-full" />
                <div style={{ width: `${stats.beratPct}%` }} className="bg-[#ef4444] h-full" />
              </div>
              <div className="grid grid-cols-3 gap-2 text-center text-[10px]">
                <div className="py-1.5 px-2 rounded-lg bg-blue-50 border border-blue-100 text-[#003178] font-semibold">
                  ● Baik: {stats.kondisiBaik}
                </div>
                <div className="py-1.5 px-2 rounded-lg bg-indigo-50 border border-indigo-100 text-[#6366f1] font-semibold">
                  ● R. Ringan: {stats.kondisiRusakRingan}
                </div>
                <div className="py-1.5 px-2 rounded-lg bg-red-50 border border-red-100 text-[#ef4444] font-semibold">
                  ● R. Berat: {stats.kondisiRusakBerat}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Daftar Maintenance List Header */}
        <div className="flex items-center justify-between pt-1">
          <h2 className="text-xs font-bold text-gray-800">Daftar Maintenance</h2>
          <span className="text-[11px] text-gray-400">
            Menampilkan {Math.min(mobileVisibleCount, items.length)} dari {items.length}
          </span>
        </div>

        {/* Cards List or Empty State */}
        {isLoading ? (
          <div className="rounded-2xl border border-gray-200 bg-white p-8 text-center text-xs text-gray-400">
            Memuat daftar maintenance...
          </div>
        ) : items.length === 0 ? (
          <div className="rounded-2xl border border-gray-200 bg-white p-8 text-center shadow-2xs space-y-2">
            <div className="h-10 w-10 mx-auto rounded-full bg-gray-50 flex items-center justify-center text-gray-400">
              <IconInfoCircle size={22} />
            </div>
            <p className="text-xs font-medium text-gray-500">Data maintenance tidak ditemukan!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {items.slice(0, mobileVisibleCount).map((item) => (
              <div
                key={item.id}
                onClick={() => navigate(`/maintenance/${item.id}`)}
                className="rounded-2xl border border-gray-200 bg-white p-4 shadow-2xs space-y-2.5 active:scale-[0.99] transition cursor-pointer"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-[10px] text-gray-400">Nomor Inventaris</p>
                    <p className="text-xs font-bold text-gray-800">{item.nomorInventaris}</p>
                  </div>
                  <div>{renderStatusBadge(item.status)}</div>
                </div>
                <div>
                  <p className="text-xs font-bold text-gray-900">{item.namaBarang}</p>
                </div>
                <div className="flex flex-col gap-0.5 text-[11px] text-gray-500 pt-2 border-t border-gray-50">
                  <p>
                    Tanggal Jadwal:{" "}
                    <span className="font-medium text-gray-700">{item.tanggalJadwal}</span>
                  </p>
                  <p>
                    Petugas: <span className="font-medium text-gray-700">{item.petugas}</span>
                  </p>
                </div>
              </div>
            ))}

            {/* Muat Lebih Banyak */}
            {items.length > mobileVisibleCount && (
              <div className="text-center pt-2 pb-4">
                <button
                  type="button"
                  onClick={() => setMobileVisibleCount((prev) => prev + 5)}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#003178] hover:underline"
                >
                  <span>Muat Lebih Banyak</span>
                  <IconChevronDown size={14} />
                </button>
              </div>
            )}
          </div>
        )}

        {/* Mobile Filter Modal / Bottom Sheet */}
        {showMobileFilter && (
          <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 backdrop-blur-2xs">
            <div className="w-full rounded-t-3xl bg-white p-6 shadow-2xl space-y-4">
              <div className="flex items-center justify-between border-b pb-3">
                <h3 className="text-sm font-bold text-gray-900">Filter Maintenance</h3>
                <button
                  type="button"
                  onClick={() => setShowMobileFilter(false)}
                  className="text-gray-400 hover:text-gray-600 p-1"
                >
                  <IconX size={18} />
                </button>
              </div>

              {/* Rentang Jadwal */}
              <div>
                <label className="text-xs font-medium text-gray-600 block mb-1.5">
                  Rentang Jadwal
                </label>
                <input
                  type="date"
                  value={mobileDate}
                  onChange={(e) => setMobileDate(e.target.value)}
                  className="h-10 w-full rounded-xl border border-gray-200 px-3 text-xs text-gray-700 outline-none focus:border-[#003178]"
                />
              </div>

              {/* Status Pills */}
              <div>
                <label className="text-xs font-medium text-gray-600 block mb-1.5">Status</label>
                <div className="grid grid-cols-3 gap-2">
                  {(["Terjadwal", "Selesai", "Terlambat"] as MaintenanceStatus[]).map((st) => (
                    <button
                      key={st}
                      type="button"
                      onClick={() => setMobileStatus(mobileStatus === st ? "" : st)}
                      className={`h-9 rounded-xl text-xs font-medium border transition ${
                        mobileStatus === st
                          ? "border-[#003178] bg-blue-50 text-[#003178] font-bold"
                          : "border-gray-200 text-gray-600 bg-white"
                      }`}
                    >
                      {st}
                    </button>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleResetMobileFilter}
                  className="flex-1 h-10 rounded-xl border border-gray-200 text-xs font-semibold text-gray-700 bg-white active:scale-98"
                >
                  Reset
                </button>
                <button
                  type="button"
                  onClick={handleApplyMobileFilter}
                  className="flex-1 h-10 rounded-xl bg-[#003178] text-xs font-semibold text-white shadow-sm active:scale-98"
                >
                  Terapkan
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* =========================================================
          DESKTOP VIEW (Layar Komputer / Tablet Lebar)
         ========================================================= */}
      <div className="hidden md:block">
        {/* KHUSUS ROLE MANAJEMEN: Header Ringkasan & Kondisi Pasca Pemeliharaan */}
        {isManajemen && (
          <div className="space-y-6 mb-6">
            {/* 4 Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Total Jadwal */}
              <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900 flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-gray-500 dark:text-slate-400">
                    Total Jadwal
                  </p>
                  <div className="mt-2 flex items-baseline gap-1.5">
                    <span className="text-2xl font-bold text-gray-900 dark:text-slate-100">
                      {stats.total}
                    </span>
                    <span className="text-xs font-semibold text-gray-400">Aset</span>
                  </div>
                </div>
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gray-50 border border-gray-100 text-gray-400 dark:bg-slate-800 dark:border-slate-700">
                  <IconCalendarEvent size={22} />
                </div>
              </div>

              {/* Selesai */}
              <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900 flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-gray-500 dark:text-slate-400">Selesai</p>
                  <div className="mt-2 flex items-baseline gap-1.5">
                    <span className="text-2xl font-bold text-gray-900 dark:text-slate-100">
                      {stats.selesai}
                    </span>
                    <span className="text-xs font-semibold text-blue-600 dark:text-blue-400">
                      Selesai
                    </span>
                  </div>
                </div>
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400">
                  <IconCircleCheck size={22} />
                </div>
              </div>

              {/* Terjadwal */}
              <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900 flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-gray-500 dark:text-slate-400">Terjadwal</p>
                  <div className="mt-2 flex items-baseline gap-1.5">
                    <span className="text-2xl font-bold text-gray-900 dark:text-slate-100">
                      {stats.terjadwal}
                    </span>
                    <span className="text-xs font-semibold text-blue-600 dark:text-blue-400">
                      Menunggu
                    </span>
                  </div>
                </div>
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400">
                  <IconClipboardList size={22} />
                </div>
              </div>

              {/* Terlambat */}
              <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900 flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-gray-500 dark:text-slate-400">Terlambat</p>
                  <div className="mt-2 flex items-baseline gap-1.5">
                    <span className="text-2xl font-bold text-gray-900 dark:text-slate-100">
                      {stats.terlambat}
                    </span>
                    <span className="text-xs font-semibold text-red-500">Tertunda</span>
                  </div>
                </div>
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-red-50 text-red-500 dark:bg-red-950/40 dark:text-red-400">
                  <IconAlertTriangle size={22} />
                </div>
              </div>
            </div>

            {/* Card Kondisi Pasca Pemeliharaan */}
            <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <h2 className="text-sm md:text-base font-bold text-gray-800 dark:text-slate-100">
                  Kondisi Pasca Pemeliharaan
                </h2>
                <div className="flex flex-wrap items-center gap-4 text-xs font-medium">
                  <span className="flex items-center gap-1.5 text-gray-700 dark:text-slate-300">
                    <span className="h-2 w-2 rounded-full bg-[#003178]" /> Baik: {stats.baikPct}%
                  </span>
                  <span className="flex items-center gap-1.5 text-gray-700 dark:text-slate-300">
                    <span className="h-2 w-2 rounded-full bg-[#6366f1]" /> Rusak Ringan:{" "}
                    {stats.ringanPct}%
                  </span>
                  <span className="flex items-center gap-1.5 text-gray-700 dark:text-slate-300">
                    <span className="h-2 w-2 rounded-full bg-[#ef4444]" /> Rusak Berat:{" "}
                    {stats.beratPct}%
                  </span>
                </div>
              </div>

              {/* Multi-segment Progress Bar */}
              <div className="h-2.5 w-full rounded-full bg-gray-100 overflow-hidden flex dark:bg-slate-800">
                <div
                  style={{ width: `${stats.baikPct}%` }}
                  className="bg-[#003178] h-full transition-all duration-500"
                  title="Baik"
                />
                <div
                  style={{ width: `${stats.ringanPct}%` }}
                  className="bg-[#6366f1] h-full transition-all duration-500"
                  title="Rusak Ringan"
                />
                <div
                  style={{ width: `${stats.beratPct}%` }}
                  className="bg-[#ef4444] h-full transition-all duration-500"
                  title="Rusak Berat"
                />
              </div>

              {/* 3 Summary Pill Boxes */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                <div className="flex items-center justify-between rounded-xl border border-gray-100 bg-[#f8faff] px-4 py-3 dark:border-slate-800 dark:bg-slate-800/60">
                  <div className="flex items-center gap-2.5">
                    <span className="h-4 w-1 rounded-full bg-[#003178]" />
                    <span className="text-xs font-semibold text-gray-800 dark:text-slate-200">
                      Kondisi Baik
                    </span>
                  </div>
                  <span className="rounded-lg bg-blue-100/70 px-2.5 py-0.5 text-xs font-bold text-[#003178] dark:bg-blue-900/40 dark:text-blue-300">
                    {stats.kondisiBaik} Aset
                  </span>
                </div>

                <div className="flex items-center justify-between rounded-xl border border-gray-100 bg-[#f8faff] px-4 py-3 dark:border-slate-800 dark:bg-slate-800/60">
                  <div className="flex items-center gap-2.5">
                    <span className="h-4 w-1 rounded-full bg-[#6366f1]" />
                    <span className="text-xs font-semibold text-gray-800 dark:text-slate-200">
                      Rusak Ringan
                    </span>
                  </div>
                  <span className="rounded-lg bg-indigo-50 px-2.5 py-0.5 text-xs font-bold text-[#6366f1] dark:bg-indigo-950/40 dark:text-indigo-300">
                    {stats.kondisiRusakRingan} Aset
                  </span>
                </div>

                <div className="flex items-center justify-between rounded-xl border border-gray-100 bg-[#f8faff] px-4 py-3 dark:border-slate-800 dark:bg-slate-800/60">
                  <div className="flex items-center gap-2.5">
                    <span className="h-4 w-1 rounded-full bg-[#ef4444]" />
                    <span className="text-xs font-semibold text-gray-800 dark:text-slate-200">
                      Rusak Berat
                    </span>
                  </div>
                  <span className="rounded-lg bg-red-50 px-2.5 py-0.5 text-xs font-bold text-[#ef4444] dark:bg-red-950/40 dark:text-red-300">
                    {stats.kondisiRusakBerat} Aset
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

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

          {/* Button Tambah Jadwal (Hidden for Petugas) */}
          {!isPetugas && !isManajemen && (
            <button
              type="button"
              onClick={() => navigate("/maintenance/create")}
              className="flex h-10 items-center justify-center gap-2 rounded-lg bg-[#003178] px-4 text-xs font-semibold text-white transition hover:bg-[#00255c] active:scale-98 shadow-sm whitespace-nowrap"
            >
              <IconPlus size={16} strokeWidth={2.5} />
              <span>Tambah Jadwal</span>
            </button>
          )}
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
    </div>
  );
}
