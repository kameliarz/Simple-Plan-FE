import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search,
  Plus,
  Filter,
  Download,
  X,
  QrCode,
  Loader2,
  AlertCircle,
  SlidersHorizontal,
  Info,
  Check,
  Minus,
} from "lucide-react";
import BaseTable from "@/components/BaseTable/BaseTable";
import { clearAuth, getUser } from "@/features/auth-login/services/authStorage";
import Badge, { type BadgeVariant } from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import Checkbox from "@/components/ui/Checkbox";
import RadioButton from "@/components/ui/RadioButton";
import BottomSheet from "@/components/ui/BottomSheet";
import Toast from "@/components/ui/Toast";
import {
  getAssets,
  getAssetLocations,
  getAssetClassifications,
  exportBulkAssetLabels,
} from "../services/inventarisApi";
import type {
  ApiAsset,
  AssetClassification,
  AssetLocation,
  BulkAssetLabelFilters,
  InventarisStatus,
} from "../types/inventaris";

export interface InventarisSarprasRow {
  id: string;
  nomor: string;
  nama: string;
  lokasi: string;
  status: InventarisStatus;
  klasifikasi?: string;
  perpindahanTerkini?: boolean;
  raw: ApiAsset;
}

const getBadgeVariant = (status: InventarisStatus): BadgeVariant => {
  switch (status) {
    case "Digunakan":
    case "Aktif":
      return "success";
    case "Dipinjam":
      return "warning";
    case "Rusak":
      return "danger";
    case "Tidak Digunakan":
    default:
      return "default";
  }
};

const getStatusBadgeClass = (status: InventarisStatus): string => {
  switch (status) {
    case "Digunakan":
    case "Aktif":
      return "bg-emerald-50 text-emerald-600 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800";
    case "Dipinjam":
      return "bg-amber-50 text-amber-600 border border-amber-200 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-800";
    case "Rusak":
      return "bg-rose-50 text-rose-600 border border-rose-200 dark:bg-rose-950/40 dark:text-rose-400 dark:border-rose-800";
    case "Tidak Digunakan":
    default:
      return "bg-slate-50 text-slate-600 border border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700";
  }
};

export default function InventarisSarprasListPage() {
  const navigate = useNavigate();
  const user = getUser();
  const role = user?.role || "";

  // Hak akses create: Super Admin, Koordinator Sarpras, Petugas Sarpras
  const canCreate =
    role === "super-admin" || role === "koordinator-sarpras" || role === "petugas-sarpras";

  const [assets, setAssets] = useState<ApiAsset[]>([]);
  const [locations, setLocations] = useState<AssetLocation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [searchTerm, setSearchTerm] = useState("");

  const [classifications, setClassifications] = useState<AssetClassification[]>([]);

  // Mode Unduh Label Massal & Seleksi Baris
  const [isSelectMode, setIsSelectMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isDownloadModalOpen, setIsDownloadModalOpen] = useState(false);
  const [exportMode, setExportMode] = useState<"selected" | "all_filtered">("selected");
  const [labelSize, setLabelSize] = useState<"standard" | "small" | "large">("standard");
  const [isDownloading, setIsDownloading] = useState(false);
  const [toast, setToast] = useState<{
    show: boolean;
    message: string;
    variant?: "success" | "danger" | "info";
  }>({
    show: false,
    message: "",
    variant: "info",
  });

  // Filter state
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);
  const filterRef = useRef<HTMLDivElement>(null);

  const [filterLokasi, setFilterLokasi] = useState("Semua lokasi");
  const [filterStatus, setFilterStatus] = useState("Semua status");
  const [filterKlasifikasi, setFilterKlasifikasi] = useState("Semua jenis");
  const [filterPerpindahan, setFilterPerpindahan] = useState(false);

  // Temporary filter states for the popover/sheet
  const [tempLokasi, setTempLokasi] = useState("Semua lokasi");
  const [tempStatus, setTempStatus] = useState("Semua status");
  const [tempKlasifikasi, setTempKlasifikasi] = useState("Semua jenis");
  const [tempPerpindahan, setTempPerpindahan] = useState(false);

  // Fetch initial data (classifications, locations, assets)
  const fetchData = async (overridePerpindahan?: boolean) => {
    setIsLoading(true);
    setError(null);
    try {
      const isMoved = overridePerpindahan !== undefined ? overridePerpindahan : filterPerpindahan;
      const classificationsData = await getAssetClassifications().catch(() => []);
      setClassifications(classificationsData);

      const sarprasClasses = classificationsData.filter(
        (c) =>
          c.name.toLowerCase() !== "alat it" &&
          !c.name.toLowerCase().includes("tik") &&
          c.code !== 6 &&
          c.code !== 5,
      );

      const locs = await getAssetLocations().catch(() => []);
      setLocations(locs);

      const fetchPromises: Promise<{ data?: ApiAsset[] }>[] = sarprasClasses.map((sc) =>
        getAssets({
          asset_classification_id: sc.id,
          per_page: 100,
          moved_last_3_months: isMoved,
        }),
      );

      const responses = await Promise.all(fetchPromises);
      const combinedAssets = responses.flatMap((r) => r.data || []);

      // Urutkan aset dari ID terbesar (paling baru dibuat muncul di paling atas)
      combinedAssets.sort((a, b) => Number(b.id) - Number(a.id));

      setAssets(combinedAssets);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal memuat data inventaris sarpras");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Close filter when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (filterRef.current && !filterRef.current.contains(event.target as Node)) {
        setIsFilterOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleOpenFilter = () => {
    setTempLokasi(filterLokasi);
    setTempStatus(filterStatus);
    setTempKlasifikasi(filterKlasifikasi);
    setTempPerpindahan(filterPerpindahan);
    if (window.innerWidth < 1024) {
      setIsMobileFilterOpen(true);
    } else {
      setIsFilterOpen((prev) => !prev);
    }
  };

  const handleApplyFilter = () => {
    setFilterLokasi(tempLokasi);
    setFilterStatus(tempStatus);
    setFilterKlasifikasi(tempKlasifikasi);
    setFilterPerpindahan(tempPerpindahan);
    setIsFilterOpen(false);
    setIsMobileFilterOpen(false);
    fetchData(tempPerpindahan);
  };

  const handleResetFilter = () => {
    setTempLokasi("Semua lokasi");
    setTempStatus("Semua status");
    setTempKlasifikasi("Semua jenis");
    setTempPerpindahan(false);
    setFilterLokasi("Semua lokasi");
    setFilterStatus("Semua status");
    setFilterKlasifikasi("Semua jenis");
    setFilterPerpindahan(false);
    setIsFilterOpen(false);
    setIsMobileFilterOpen(false);
    fetchData(false);
  };

  const isFilterActive =
    filterLokasi !== "Semua lokasi" ||
    filterStatus !== "Semua status" ||
    filterKlasifikasi !== "Semua jenis" ||
    filterPerpindahan;

  const columns = [
    {
      key: "nomor" as keyof InventarisSarprasRow,
      label: "NOMOR INVENTARIS",
      render: (value: unknown) => (
        <span className="font-semibold text-blue-700 hover:underline">{String(value ?? "")}</span>
      ),
    },
    { key: "nama" as keyof InventarisSarprasRow, label: "NAMA BARANG" },
    { key: "lokasi" as keyof InventarisSarprasRow, label: "LOKASI RUANGAN" },
    {
      key: "status" as keyof InventarisSarprasRow,
      label: "STATUS",
      render: (value: unknown) => (
        <Badge variant={getBadgeVariant(value as InventarisStatus)} size="sm">
          {String(value ?? "")}
        </Badge>
      ),
    },
  ];

  // Map raw API assets into table rows
  const tableData: InventarisSarprasRow[] = assets.map((item) => ({
    id: String(item.id),
    nomor: item.asset_code?.full_code || item.asset_uid,
    nama: item.asset_code?.item?.name || item.brand || item.model_specification || "Barang Sarpras",
    lokasi: item.asset_code?.location?.name || "-",
    status: item.status,
    klasifikasi: item.asset_code?.classification?.name || "Sarana dan Prasarana",
    perpindahanTerkini: filterPerpindahan || Boolean(item.histories && item.histories.length > 0),
    raw: item,
  }));

  const filteredData = tableData.filter((item) => {
    const matchesSearch =
      item.nomor.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.nama.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.lokasi.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesLokasi = filterLokasi === "Semua lokasi" || item.lokasi === filterLokasi;

    const matchesStatus = filterStatus === "Semua status" || item.status === filterStatus;

    const matchesKlasifikasi =
      filterKlasifikasi === "Semua jenis" || item.klasifikasi === filterKlasifikasi;

    const matchesPerpindahan = !filterPerpindahan || Boolean(item.perpindahanTerkini);

    return (
      matchesSearch && matchesLokasi && matchesStatus && matchesKlasifikasi && matchesPerpindahan
    );
  });

  const previewAsset =
    selectedIds.length > 0
      ? tableData.find((d) => selectedIds.includes(d.id)) || tableData[0]
      : tableData[0];

  const handleDownloadBulk = async () => {
    setIsDownloading(true);
    try {
      const dimensions = {
        standard: { width_mm: 70, height_mm: 35 },
        small: { width_mm: 50, height_mm: 25 },
        large: { width_mm: 100, height_mm: 50 },
      }[labelSize];

      if (exportMode === "selected") {
        if (selectedIds.length === 0) {
          setToast({
            show: true,
            message: "Pilih minimal 1 aset untuk diunduh.",
            variant: "danger",
          });
          setIsDownloading(false);
          return;
        }

        await exportBulkAssetLabels({
          selection_mode: "selected",
          asset_ids: selectedIds.map(Number),
          width_mm: dimensions.width_mm,
          height_mm: dimensions.height_mm,
        });

        setToast({
          show: true,
          message: `Berhasil mengunduh label untuk ${selectedIds.length} aset terpilih!`,
          variant: "success",
        });
      } else {
        // Mode: all_filtered
        const matchedLocation = locations.find((l) => l.name === filterLokasi);
        const matchedClassification = classifications.find((c) => c.name === filterKlasifikasi);

        const filters: BulkAssetLabelFilters = {};

        if (matchedLocation?.id) {
          filters.location_id = matchedLocation.id;
        }
        if (matchedClassification?.id) {
          filters.classification_id = matchedClassification.id;
        }
        if (filterStatus && filterStatus !== "Semua status") {
          filters.status = filterStatus;
        }
        if (filterPerpindahan) {
          filters.moved_last_3_months = true;
        }
        if (searchTerm.trim()) {
          filters.search = searchTerm.trim();
        }

        await exportBulkAssetLabels({
          selection_mode: "all_filtered",
          filters,
          width_mm: dimensions.width_mm,
          height_mm: dimensions.height_mm,
        });

        setToast({
          show: true,
          message: "Berhasil mengunduh label untuk seluruh aset sarpras yang terfilter!",
          variant: "success",
        });
      }

      setIsDownloadModalOpen(false);
      setSelectedIds([]);
      setIsSelectMode(false);
    } catch (err) {
      setToast({
        show: true,
        message: err instanceof Error ? err.message : "Gagal mengunduh label massal sarpras",
        variant: "danger",
      });
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-[calc(100vh-4rem)] p-4 lg:p-6 bg-slate-50 dark:bg-slate-900">
      {/* Mobile Search Bar & Filter Trigger */}
      <div className="flex items-center gap-2 mb-4 lg:hidden">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Cari Data..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-1 focus:ring-blue-600 text-sm text-slate-800 dark:text-slate-200 shadow-sm"
          />
        </div>
        <button
          type="button"
          onClick={handleOpenFilter}
          className={`p-2.5 rounded-xl border transition-colors shrink-0 shadow-sm ${
            isFilterActive
              ? "bg-blue-50 border-blue-400 text-blue-700 dark:bg-blue-900/40 dark:border-blue-500 dark:text-blue-300"
              : "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300"
          }`}
          aria-label="Buka Filter"
        >
          <SlidersHorizontal className="h-5 w-5" />
        </button>
      </div>

      {/* Desktop Header */}
      <div className="hidden lg:flex mb-6 flex-col gap-1">
        <h1 className="text-xl font-semibold text-slate-800 dark:text-slate-100">
          Daftar Inventaris Sarpras
        </h1>
      </div>

      {/* Mobile Title & Action Bar */}
      <div className="lg:hidden mb-4">
        {isSelectMode ? (
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 text-xs text-slate-700 dark:text-slate-200 font-medium">
              <button
                type="button"
                onClick={() => {
                  if (selectedIds.length === filteredData.length) {
                    setSelectedIds([]);
                  } else {
                    setSelectedIds(filteredData.map((d) => d.id));
                  }
                }}
                className="w-5 h-5 flex items-center justify-center border border-slate-400 rounded bg-slate-100 dark:bg-slate-800"
              >
                {selectedIds.length === filteredData.length && filteredData.length > 0 ? (
                  <Check className="h-3.5 w-3.5 text-blue-700" />
                ) : selectedIds.length > 0 ? (
                  <Minus className="h-3.5 w-3.5 text-slate-700 dark:text-slate-300" />
                ) : null}
              </button>
              <span>{selectedIds.length} aset terpilih untuk unduh label</span>
              <button
                type="button"
                onClick={() => {
                  setIsSelectMode(false);
                  setSelectedIds([]);
                }}
                className="text-blue-900 dark:text-blue-400 font-bold hover:underline ml-1"
              >
                Batalkan
              </button>
            </div>

            <Button
              type="button"
              variant="default"
              onClick={() => {
                setExportMode(selectedIds.length > 0 ? "selected" : "all_filtered");
                setIsDownloadModalOpen(true);
              }}
              className="gap-1.5 px-3 py-1.5 bg-[#0f2d59] hover:bg-blue-900 text-white rounded-lg text-xs font-semibold shrink-0"
            >
              <Download className="h-3.5 w-3.5" /> Unduh Label
            </Button>
          </div>
        ) : (
          <div className="flex items-center justify-between gap-2">
            <h1 className="text-base font-semibold text-slate-800 dark:text-slate-100">
              Daftar Inventaris Sarpras
            </h1>

            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="default"
                onClick={() => setIsSelectMode(true)}
                className="gap-1.5 px-3 py-1.5 bg-[#0f2d59] hover:bg-blue-900 text-white rounded-lg text-xs font-semibold"
              >
                <Download className="h-3.5 w-3.5" /> Unduh Label Massal
              </Button>

              {canCreate && (
                <Button
                  type="button"
                  variant="default"
                  onClick={() => navigate("/inventory/sarpras/create")}
                  className="gap-1 px-3 py-1.5 bg-[#0f2d59] hover:bg-blue-900 text-white rounded-lg text-xs font-semibold"
                >
                  <Plus className="h-3.5 w-3.5" /> Tambah Aset
                </Button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Main Container Card */}
      <div className="bg-transparent lg:bg-white lg:dark:bg-slate-800 lg:rounded-lg lg:shadow-sm lg:border lg:border-slate-200 lg:dark:border-slate-700 flex flex-col">
        {/* Desktop Toolbar */}
        <div className="hidden lg:flex p-4 border-b border-slate-200 dark:border-slate-700 justify-between items-center gap-4">
          <div className="relative flex-1 min-w-[240px] max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              type="text"
              placeholder="Cari data..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-600 text-sm text-slate-800 dark:text-slate-200"
            />
          </div>

          <div className="flex items-center gap-3">
            {isSelectMode ? (
              <Button
                type="button"
                variant="default"
                onClick={() => {
                  setExportMode(selectedIds.length > 0 ? "selected" : "all_filtered");
                  setIsDownloadModalOpen(true);
                }}
                className="gap-2 px-4 py-2 bg-blue-800 hover:bg-blue-900 text-white rounded-md text-sm font-medium"
              >
                <Download className="h-4 w-4" /> Unduh Label
              </Button>
            ) : (
              <>
                <div className="relative" ref={filterRef}>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleOpenFilter}
                    className={`gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                      isFilterActive
                        ? "bg-blue-50 border-blue-400 text-blue-700 dark:bg-blue-900/30 dark:border-blue-500 dark:text-blue-300"
                        : "bg-white dark:bg-slate-850 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800"
                    }`}
                  >
                    Filter <Filter className="h-4 w-4" />
                  </Button>

                  {isFilterOpen && (
                    <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-slate-800 rounded-lg shadow-xl border border-slate-200 dark:border-slate-700 p-4 z-50">
                      <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-700 mb-4">
                        <h4 className="text-sm font-semibold text-slate-800 dark:text-slate-100">
                          Filter Data Aset
                        </h4>
                        <button
                          type="button"
                          onClick={() => setIsFilterOpen(false)}
                          className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>

                      <div className="space-y-4 text-sm">
                        {/* Lokasi Ruangan */}
                        <div>
                          <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                            Lokasi Ruangan
                          </label>
                          <Select
                            value={tempLokasi}
                            onChange={(e) => setTempLokasi(e.target.value)}
                            className="w-full px-3 py-1.5 border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                          >
                            <option value="Semua lokasi">Semua lokasi</option>
                            {locations.map((loc) => (
                              <option key={loc.id} value={loc.name}>
                                {loc.name}
                              </option>
                            ))}
                          </Select>
                        </div>

                        {/* Status */}
                        <div>
                          <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                            Status
                          </label>
                          <Select
                            value={tempStatus}
                            onChange={(e) => setTempStatus(e.target.value)}
                            className="w-full px-3 py-1.5 border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                          >
                            <option value="Semua status">Semua status</option>
                            <option value="Digunakan">Digunakan</option>
                            <option value="Tidak Digunakan">Tidak Digunakan</option>
                            <option value="Dipinjam">Dipinjam</option>
                            <option value="Rusak">Rusak</option>
                          </Select>
                        </div>

                        {/* Perpindahan Unit Terkini */}
                        <div className="pt-1">
                          <Checkbox
                            id="sarpras-perpindahan"
                            checked={tempPerpindahan}
                            onChange={(e) => setTempPerpindahan(e.target.checked)}
                            label="Perpindahan Unit Terkini"
                          />
                          <div className="text-[11px] text-slate-400 pl-6">
                            Hanya aset yang berpindah unit / memiliki catatan mutasi
                          </div>
                        </div>

                        {/* Filter Actions */}
                        <div className="flex items-center gap-3 pt-3 border-t border-slate-100 dark:border-slate-700">
                          <Button
                            type="button"
                            variant="outline"
                            onClick={handleResetFilter}
                            className="flex-1 py-1.5 px-3 rounded-md text-xs font-medium"
                          >
                            Reset
                          </Button>
                          <Button
                            type="button"
                            variant="default"
                            onClick={handleApplyFilter}
                            className="flex-1 py-1.5 px-3 bg-blue-700 hover:bg-blue-800 text-white rounded-md text-xs font-medium"
                          >
                            Terapkan
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <Button
                  type="button"
                  variant="default"
                  onClick={() => setIsSelectMode(true)}
                  className="gap-2 px-4 py-2 bg-blue-800 hover:bg-blue-900 text-white rounded-md text-sm font-medium"
                >
                  <Download className="h-4 w-4" /> Unduh Label Massal
                </Button>

                {canCreate && (
                  <Button
                    type="button"
                    variant="default"
                    onClick={() => navigate("/inventory/sarpras/create")}
                    className="gap-2 px-4 py-2 bg-blue-800 hover:bg-blue-900 text-white rounded-md text-sm font-medium"
                  >
                    <Plus className="h-4 w-4" /> Tambah Aset
                  </Button>
                )}
              </>
            )}
          </div>
        </div>

        {/* Content Section */}
        <div className="p-0 lg:p-6 flex flex-col">
          {/* Desktop Selection Mode Info Bar */}
          {isSelectMode && (
            <div className="hidden lg:flex items-center justify-between p-3.5 mb-4 bg-blue-50/70 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800/50 rounded-lg text-sm text-slate-700 dark:text-slate-200">
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center justify-center px-2 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300">
                  {selectedIds.length}
                </span>
                <span className="font-medium text-slate-700 dark:text-slate-200">
                  dari {filteredData.length} aset terpilih
                </span>
              </div>

              <div className="flex items-center gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => {
                    if (selectedIds.length === filteredData.length) {
                      setSelectedIds([]);
                    } else {
                      setSelectedIds(filteredData.map((d) => d.id));
                    }
                  }}
                  className="text-blue-700 dark:text-blue-400 font-semibold hover:underline"
                >
                  {selectedIds.length === filteredData.length
                    ? "Batal Pilih Semua"
                    : `Pilih Semua (${filteredData.length})`}
                </button>
                <span className="text-slate-400">•</span>
                <button
                  type="button"
                  onClick={() => {
                    setExportMode("all_filtered");
                    setIsDownloadModalOpen(true);
                  }}
                  className="text-blue-700 dark:text-blue-400 font-semibold hover:underline"
                >
                  Unduh Semua Terfilter
                </button>
                <span className="text-slate-400">•</span>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedIds([]);
                    setIsSelectMode(false);
                  }}
                  className="text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 font-medium"
                >
                  Selesai
                </button>
              </div>
            </div>
          )}

          {isLoading ? (
            <div className="py-16 flex flex-col items-center justify-center">
              <Loader2 className="h-8 w-8 text-blue-600 animate-spin mb-3" />
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Memuat data inventaris sarpras...
              </p>
            </div>
          ) : error ? (
            <div className="py-12 flex flex-col items-center justify-center gap-3 text-center">
              <div className="p-3 bg-red-50 dark:bg-red-950/40 rounded-full text-red-600 dark:text-red-400">
                <AlertCircle className="h-8 w-8" />
              </div>
              <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
                {error.includes("401")
                  ? "Sesi login Anda telah berakhir (401). Silakan login kembali untuk melanjutkan."
                  : error}
              </p>
              {error.includes("401") ? (
                <Button
                  variant="default"
                  className="py-1.5 px-4 text-xs bg-blue-800 hover:bg-blue-900 text-white"
                  onClick={() => {
                    clearAuth();
                    navigate("/login");
                  }}
                >
                  Login Kembali
                </Button>
              ) : (
                <Button variant="outline" className="py-1 px-3 text-xs" onClick={() => fetchData()}>
                  Coba Lagi
                </Button>
              )}
            </div>
          ) : filteredData.length > 0 ? (
            <>
              {/* MOBILE CARD LIST (lg:hidden) */}
              <div className="lg:hidden flex flex-col gap-3">
                {filteredData.map((item) => {
                  const isSelected = selectedIds.includes(item.id);
                  return (
                    <div
                      key={item.id}
                      onClick={() => {
                        if (isSelectMode) {
                          if (isSelected) {
                            setSelectedIds((prev) => prev.filter((id) => id !== item.id));
                          } else {
                            setSelectedIds((prev) => [...prev, item.id]);
                          }
                        } else {
                          navigate(`/inventaris/sarpras/${item.id}`);
                        }
                      }}
                      className={`bg-white dark:bg-slate-800 rounded-xl p-4 border transition-all cursor-pointer shadow-sm relative ${
                        isSelected
                          ? "border-blue-600 ring-2 ring-blue-600 bg-blue-50/20"
                          : "border-slate-200 dark:border-slate-700 hover:border-slate-300"
                      }`}
                    >
                      {/* Top Header: Nomor Inventaris & Status */}
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-start gap-2.5">
                          {isSelectMode && (
                            <div className="pt-0.5" onClick={(e) => e.stopPropagation()}>
                              <input
                                type="checkbox"
                                checked={isSelected}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setSelectedIds((prev) => [...prev, item.id]);
                                  } else {
                                    setSelectedIds((prev) => prev.filter((id) => id !== item.id));
                                  }
                                }}
                                className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                              />
                            </div>
                          )}
                          <div>
                            <div className="text-[11px] text-slate-400 font-medium">
                              Nomor Inventaris
                            </div>
                            <div className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                              {item.nomor}
                            </div>
                          </div>
                        </div>

                        <span
                          className={`px-3 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeClass(
                            item.status,
                          )}`}
                        >
                          {item.status}
                        </span>
                      </div>

                      {/* Card Content: Nama & Lokasi */}
                      <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-700/60">
                        <div className="text-sm font-semibold text-slate-900 dark:text-slate-100 leading-snug">
                          {item.nama}
                        </div>
                        <div className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                          Lokasi Ruangan:{" "}
                          <span className="font-semibold text-slate-800 dark:text-slate-200">
                            {item.lokasi}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* DESKTOP TABLE VIEW (hidden lg:block) */}
              <div className="hidden lg:block">
                <BaseTable
                  columns={columns}
                  data={filteredData}
                  itemsPerPage={10}
                  selectable={isSelectMode}
                  showHeaderCheckbox={false}
                  selectedIds={selectedIds}
                  getId={(row) => row.id}
                  onSelectRow={(id, selected) => {
                    if (selected) {
                      setSelectedIds((prev) => [...prev, id]);
                    } else {
                      setSelectedIds((prev) => prev.filter((item) => item !== id));
                    }
                  }}
                  onSelectAll={(selected) => {
                    if (selected) {
                      setSelectedIds(filteredData.map((d) => d.id));
                    } else {
                      setSelectedIds([]);
                    }
                  }}
                  onRowClick={(row) => {
                    if (isSelectMode) {
                      if (selectedIds.includes(row.id)) {
                        setSelectedIds((prev) => prev.filter((id) => id !== row.id));
                      } else {
                        setSelectedIds((prev) => [...prev, row.id]);
                      }
                    } else {
                      navigate(`/inventaris/sarpras/${row.id}`);
                    }
                  }}
                />
              </div>
            </>
          ) : (
            <div className="py-20 flex flex-col items-center justify-center text-center px-4">
              <div className="w-12 h-12 rounded-full border-2 border-slate-300 dark:border-slate-600 flex items-center justify-center text-slate-400 mb-3">
                <Info className="h-6 w-6 stroke-[1.5]" />
              </div>
              <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                Data aset tidak ditemukan!
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Unduh Label Massal Modal */}
      {isDownloadModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-700">
              <h3 className="text-base font-semibold text-slate-800 dark:text-slate-100">
                Pilih Ukuran Label
              </h3>
              <button
                type="button"
                onClick={() => setIsDownloadModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Body */}
            <div className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
                  Ukuran <span className="text-rose-500">*</span>
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {[
                    { id: "standard" as const, label: "Standar (70 x 35 mm)" },
                    { id: "small" as const, label: "Kecil (50 x 25 mm)" },
                    { id: "large" as const, label: "Besar (100 x 50 mm)" },
                  ].map((opt) => (
                    <div
                      key={opt.id}
                      onClick={() => setLabelSize(opt.id)}
                      className={`flex items-center p-3 rounded-xl border cursor-pointer transition-all ${
                        labelSize === opt.id
                          ? "border-blue-600 bg-blue-50/50 dark:bg-blue-900/20 text-blue-900 dark:text-blue-200 font-medium"
                          : "border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-750"
                      }`}
                    >
                      <RadioButton
                        id={`sarpras-size-${opt.id}`}
                        name="labelSize"
                        checked={labelSize === opt.id}
                        onChange={() => setLabelSize(opt.id)}
                        label={opt.label}
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Pratinjau Label Card */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Pratinjau Label
                  </label>
                </div>

                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl p-4 shadow-sm text-slate-800 dark:text-slate-200">
                  <div className="flex justify-between items-start gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-bold tracking-tight">
                        {previewAsset?.nomor || "3/1/1/6/2021"}
                      </div>
                      <div className="text-[10px] text-slate-400 font-semibold tracking-wider">
                        INVENTARIS ASET SARPRAS
                      </div>
                      <div className="h-px bg-slate-200 dark:bg-slate-700 my-2"></div>

                      <div className="space-y-1.5 text-xs">
                        <div>
                          <div className="text-[9px] text-slate-400 uppercase font-semibold">
                            NAMA BARANG
                          </div>
                          <div className="font-semibold text-slate-800 dark:text-slate-200 leading-tight truncate">
                            {previewAsset?.nama || "Kursi Pasien Ergonomis"}
                          </div>
                        </div>
                        <div>
                          <div className="text-[9px] text-slate-400 uppercase font-semibold">
                            LOKASI RUANGAN
                          </div>
                          <div className="font-semibold text-slate-800 dark:text-slate-200 leading-tight truncate">
                            {previewAsset?.lokasi || "Poli Penyakit Dalam"}
                          </div>
                        </div>
                        <div>
                          <div className="text-[9px] text-slate-400 uppercase font-semibold">
                            STATUS
                          </div>
                          <div className="font-semibold text-slate-800 dark:text-slate-200 leading-tight">
                            {previewAsset?.status || "Aktif"}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="shrink-0 pt-1">
                      <QrCode className="h-20 w-20 text-slate-900 dark:text-slate-100" />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-slate-100 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/40">
              <Button
                type="button"
                variant="default"
                disabled={isDownloading || (exportMode === "selected" && selectedIds.length === 0)}
                onClick={handleDownloadBulk}
                className="w-full gap-2 py-2.5 bg-[#0f2d59] hover:bg-blue-900 text-white rounded-xl text-sm font-semibold disabled:opacity-50"
              >
                {isDownloading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" /> Mengunduh...
                  </>
                ) : (
                  <>
                    <Download className="h-4 w-4" /> Unduh Label
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Mobile Filter BottomSheet */}
      <BottomSheet
        isOpen={isMobileFilterOpen}
        onClose={() => setIsMobileFilterOpen(false)}
        title="Filter Aset"
        footer={
          <div className="flex items-center gap-3 w-full">
            <Button
              variant="outline"
              className="flex-1 rounded-xl h-11 text-sm font-medium border-slate-300"
              onClick={() => {
                handleResetFilter();
                setIsMobileFilterOpen(false);
              }}
            >
              Reset
            </Button>
            <Button
              variant="default"
              className="flex-1 rounded-xl h-11 text-sm font-semibold bg-[#0f2d59] hover:bg-blue-900 text-white"
              onClick={() => {
                handleApplyFilter();
                setIsMobileFilterOpen(false);
              }}
            >
              Terapkan
            </Button>
          </div>
        }
      >
        <div className="space-y-5 py-2 text-sm">
          {/* Lokasi Ruangan */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
              Lokasi Ruangan
            </label>
            <select
              value={tempLokasi}
              onChange={(e) => setTempLokasi(e.target.value)}
              className="w-full px-3.5 py-2.5 border border-slate-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="Semua lokasi">Cari lokasi ruangan...</option>
              {locations.map((loc) => (
                <option key={loc.id} value={loc.name}>
                  {loc.name}
                </option>
              ))}
            </select>
          </div>

          {/* Status Pills */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
              Status
            </label>
            <div className="flex flex-wrap gap-2">
              {["Digunakan", "Dipinjam", "Tidak Digunakan", "Rusak"].map((st) => {
                const isActive = tempStatus === st;
                return (
                  <button
                    key={st}
                    type="button"
                    onClick={() => {
                      setTempStatus(isActive ? "Semua status" : st);
                    }}
                    className={`px-3.5 py-2 rounded-xl text-xs font-medium border transition-all ${
                      isActive
                        ? "border-blue-600 text-blue-700 bg-blue-50/70 dark:bg-blue-950/40 dark:text-blue-300 font-semibold"
                        : "border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800"
                    }`}
                  >
                    {st}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Klasifikasi Pills */}
          {classifications.length > 0 && (
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
                Klasifikasi
              </label>
              <div className="flex flex-wrap gap-2">
                {classifications
                  .filter(
                    (c) =>
                      c.name.toLowerCase() !== "alat it" && !c.name.toLowerCase().includes("tik"),
                  )
                  .map((cls) => {
                    const isActive = tempKlasifikasi === cls.name;
                    return (
                      <button
                        key={cls.id}
                        type="button"
                        onClick={() => {
                          setTempKlasifikasi(isActive ? "Semua jenis" : cls.name);
                        }}
                        className={`px-3.5 py-2 rounded-xl text-xs font-medium border transition-all ${
                          isActive
                            ? "border-blue-600 text-blue-700 bg-blue-50/70 dark:bg-blue-950/40 dark:text-blue-300 font-semibold"
                            : "border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800"
                        }`}
                      >
                        {cls.name}
                      </button>
                    );
                  })}
              </div>
            </div>
          )}

          {/* Perpindahan Unit Terkini Checkbox */}
          <div className="pt-1">
            <Checkbox
              id="mobile-sarpras-perpindahan"
              checked={tempPerpindahan}
              onChange={(e) => setTempPerpindahan(e.target.checked)}
              label="Perpindahan Unit Terkini"
            />
            <div className="text-[11px] text-slate-400 pl-6 mt-0.5">
              Hanya aset yang berpindah unit dalam 3 bulan terakhir
            </div>
          </div>
        </div>
      </BottomSheet>

      <Toast
        show={toast.show}
        message={toast.message}
        variant={toast.variant}
        onClose={() => setToast((prev) => ({ ...prev, show: false }))}
      />
    </div>
  );
}
