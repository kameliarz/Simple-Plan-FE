import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search,
  Plus,
  Filter,
  Download,
  X,
  FolderSearch,
  QrCode,
  Loader2,
  AlertCircle,
} from "lucide-react";
import BaseTable from "@/components/BaseTable/BaseTable";
import { getUser } from "@/features/auth-login/services/authStorage";
import Badge, { type BadgeVariant } from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import Checkbox from "@/components/ui/Checkbox";
import RadioButton from "@/components/ui/RadioButton";
import EmptyState from "@/components/ui/EmptyState";
import BottomSheet from "@/components/ui/BottomSheet";
import { getAssets, getAssetLocations, getAssetClassifications } from "../services/inventarisApi";
import type { ApiAsset, AssetLocation, InventarisStatus } from "../types/inventaris";

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

  // Mode Unduh Label Massal & Seleksi Baris
  const [isSelectMode, setIsSelectMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isDownloadModalOpen, setIsDownloadModalOpen] = useState(false);
  const [labelSize, setLabelSize] = useState<"standard" | "small" | "large">("standard");

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
  const fetchData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      // 1. Ambil klasifikasi untuk sarpras
      const classifications = await getAssetClassifications().catch(() => []);
      const sarprasClass = classifications.find(
        (c) =>
          c.name.toLowerCase().includes("sarpras") ||
          c.name.toLowerCase().includes("sarana") ||
          c.code === 3,
      );
      const targetClassId = sarprasClass ? sarprasClass.id : 1;

      // 2. Ambil lokasi
      const locs = await getAssetLocations().catch(() => []);
      setLocations(locs);

      // 3. Ambil data aset sarpras
      const assetRes = await getAssets({
        asset_classification_id: targetClassId,
        per_page: 100,
      });

      setAssets(assetRes.data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal memuat data inventaris sarpras");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchData();
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
    if (window.innerWidth < 768) {
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
    perpindahanTerkini: Boolean(item.histories && item.histories.length > 0),
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

  return (
    <div className="flex flex-col min-h-[calc(100vh-4rem)] p-6 bg-slate-50 dark:bg-slate-900">
      <div className="mb-6 flex flex-col gap-1">
        <h1 className="text-xl font-semibold text-slate-800 dark:text-slate-100">
          Daftar Inventaris Sarpras
        </h1>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 flex flex-col">
        {/* Toolbar */}
        <div className="p-4 border-b border-slate-200 dark:border-slate-700 flex flex-wrap justify-between items-center gap-4">
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
              /* Mode Unduh Label */
              <Button
                type="button"
                variant="default"
                onClick={() => setIsDownloadModalOpen(true)}
                disabled={selectedIds.length === 0}
                className="gap-2 px-4 py-2 bg-blue-800 hover:bg-blue-900 text-white rounded-md text-sm font-medium"
              >
                <Download className="h-4 w-4" /> Unduh Label
              </Button>
            ) : (
              /* Toolbar Normal */
              <>
                {/* Filter Dropdown */}
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

                  {/* Filter Popover Modal (Desktop) */}
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
                            Hanya aset yang memiliki catatan mutasi
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

                {/* Tombol Masuk Mode Unduh Label Massal */}
                <Button
                  type="button"
                  variant="default"
                  onClick={() => setIsSelectMode(true)}
                  className="gap-2 px-4 py-2 bg-blue-800 hover:bg-blue-900 text-white rounded-md text-sm font-medium"
                >
                  <Download className="h-4 w-4" /> Unduh Label Massal
                </Button>

                {/* Tambah Aset - Sembunyikan jika role tidak diizinkan */}
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

        {/* Tabel Konten */}
        <div className="p-6 flex flex-col">
          {isSelectMode && (
            <div className="flex items-center justify-between p-3.5 mb-4 bg-blue-50/70 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800/50 rounded-lg text-sm text-slate-700 dark:text-slate-200">
              <div className="flex items-center gap-3">
                <Checkbox
                  id="select-all-header"
                  checked={filteredData.length > 0 && selectedIds.length === filteredData.length}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setSelectedIds(filteredData.map((d) => d.id));
                    } else {
                      setSelectedIds([]);
                    }
                  }}
                />
                <span className="font-medium text-slate-800 dark:text-slate-100">
                  <span className="text-blue-700 font-semibold">{selectedIds.length}</span> aset
                  terpilih untuk unduh label
                </span>
              </div>

              <div className="flex items-center gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => setSelectedIds(filteredData.map((d) => d.id))}
                  className="text-blue-700 font-semibold hover:underline"
                >
                  Pilih Semua ({filteredData.length})
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
                  Batalkan
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
              <p className="text-sm font-medium text-slate-700 dark:text-slate-300">{error}</p>
              <Button variant="outline" className="py-1 px-3 text-xs" onClick={fetchData}>
                Coba Lagi
              </Button>
            </div>
          ) : filteredData.length > 0 ? (
            <BaseTable
              columns={columns}
              data={filteredData}
              itemsPerPage={10}
              selectable={isSelectMode}
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
          ) : (
            <div className="py-8">
              <EmptyState
                title="Data Aset Tidak Ditemukan"
                description={
                  searchTerm
                    ? `Pencarian untuk "${searchTerm}" tidak membuahkan hasil.`
                    : "Belum ada aset sarpras yang terdaftar."
                }
                icon={<FolderSearch className="h-12 w-12 text-slate-400" />}
              />
            </div>
          )}
        </div>
      </div>

      {/* Pilih ukuran Label Modal */}
      {isDownloadModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-700 w-full max-w-xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
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
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Left: Ukuran */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-3">
                  Ukuran <span className="text-rose-500">*</span>
                </label>
                <div className="space-y-2.5">
                  {[
                    { id: "standard" as const, label: "Standar (70 x 35 mm)" },
                    { id: "small" as const, label: "Kecil (50 x 25 mm)" },
                    { id: "large" as const, label: "Besar (100 x 50 mm)" },
                  ].map((opt) => (
                    <div
                      key={opt.id}
                      onClick={() => setLabelSize(opt.id)}
                      className={`flex items-center p-3 rounded-lg border cursor-pointer transition-all ${
                        labelSize === opt.id
                          ? "border-blue-600 bg-blue-50/50 dark:bg-blue-900/20 text-blue-900 dark:text-blue-200 font-medium"
                          : "border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/50"
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

              {/* Right: Pratinjau Label */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-3">
                  Pratinjau Label
                </label>
                <div className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg p-3 text-xs space-y-2">
                  <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-700 pb-2">
                    <span className="font-bold text-slate-800 dark:text-slate-100">
                      {previewAsset?.nomor || "3/1/1/1/2020"}
                    </span>
                    <span className="text-[10px] text-slate-400 font-medium">SARPRAS</span>
                  </div>
                  <div className="flex justify-between items-center gap-2">
                    <div className="space-y-1">
                      <div className="text-[10px] text-slate-400">Nama Barang</div>
                      <div className="font-semibold text-slate-700 dark:text-slate-200 line-clamp-1">
                        {previewAsset?.nama || "Kursi Aula"}
                      </div>
                      <div className="text-[10px] text-slate-400">Lokasi</div>
                      <div className="font-semibold text-slate-700 dark:text-slate-200 line-clamp-1">
                        {previewAsset?.lokasi || "Poli Penyakit Dalam"}
                      </div>
                    </div>
                    <QrCode className="h-14 w-14 text-slate-700 dark:text-slate-300 shrink-0" />
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end px-6 py-3.5 border-t border-slate-100 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/40">
              <Button
                type="button"
                variant="default"
                onClick={() => {
                  alert(`Berhasil mengunduh label untuk ${selectedIds.length} aset terpilih!`);
                  setIsDownloadModalOpen(false);
                }}
                className="gap-2 px-5 py-2 bg-blue-800 hover:bg-blue-900 text-white rounded-md text-sm font-medium"
              >
                <Download className="h-4 w-4" /> Unduh Label
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Mobile Filter BottomSheet */}
      <BottomSheet
        isOpen={isMobileFilterOpen}
        onClose={() => setIsMobileFilterOpen(false)}
        title="Filter Data Aset"
        footer={
          <div className="flex items-center gap-3 w-full">
            <Button
              variant="outline"
              className="flex-1 rounded-xl h-10 text-xs"
              onClick={() => {
                handleResetFilter();
                setIsMobileFilterOpen(false);
              }}
            >
              Reset
            </Button>
            <Button
              variant="default"
              className="flex-1 rounded-xl h-10 text-xs bg-blue-800 hover:bg-blue-900 text-white"
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
        <div className="space-y-4 py-2 text-sm">
          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
              Lokasi Ruangan
            </label>
            <Select
              value={tempLokasi}
              onChange={(e) => setTempLokasi(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="Semua lokasi">Semua lokasi</option>
              {locations.map((loc) => (
                <option key={loc.id} value={loc.name}>
                  {loc.name}
                </option>
              ))}
            </Select>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
              Status
            </label>
            <Select
              value={tempStatus}
              onChange={(e) => setTempStatus(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="Semua status">Semua status</option>
              <option value="Digunakan">Digunakan</option>
              <option value="Tidak Digunakan">Tidak Digunakan</option>
              <option value="Dipinjam">Dipinjam</option>
              <option value="Rusak">Rusak</option>
            </Select>
          </div>

          <div className="pt-1">
            <Checkbox
              id="mobile-sarpras-perpindahan"
              checked={tempPerpindahan}
              onChange={(e) => setTempPerpindahan(e.target.checked)}
              label="Perpindahan Unit Terkini"
            />
            <div className="text-[11px] text-slate-400 pl-6 mt-0.5">
              Hanya aset yang memiliki catatan mutasi
            </div>
          </div>
        </div>
      </BottomSheet>
    </div>
  );
}
