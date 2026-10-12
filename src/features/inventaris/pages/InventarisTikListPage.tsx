import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Plus, Filter, Download, X, FolderSearch, QrCode } from "lucide-react";
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

// Mock Data
type InventarisStatus = "Digunakan" | "Tidak Digunakan" | "Dipinjam" | "Rusak" | "Aktif";

interface InventarisTIK {
  id: string;
  nomor: string;
  nama: string;
  lokasi: string;
  status: InventarisStatus;
  klasifikasi?: string;
  perpindahanTerkini?: boolean;
}

const mockData: InventarisTIK[] = [
  {
    id: "1",
    nomor: "INV-TIK-2023-001",
    nama: "PC All-in-One Core i5 Poli Dalam",
    lokasi: "Unit Gawat Darurat (UGD)",
    status: "Digunakan",
    klasifikasi: "Alat IT (Tetap)",
  },
  {
    id: "2",
    nomor: "INV-TIK-2023-002",
    nama: "Printer Thermal Kasir Farmasi 2",
    lokasi: "Unit Gawat Darurat (UGD)",
    status: "Digunakan",
    klasifikasi: "Alat IT (Bergerak)",
  },
  {
    id: "3",
    nomor: "INV-TIK-2023-003",
    nama: "Switch Cisco Catalyst 24 Port Lt.3",
    lokasi: "Unit Gawat Darurat (UGD)",
    status: "Digunakan",
    klasifikasi: "Alat IT (Tetap)",
  },
  {
    id: "4",
    nomor: "INV-TIK-2023-004",
    nama: "Monitor Pasien Mindray Bed 4 UGD",
    lokasi: "Unit Gawat Darurat (UGD)",
    status: "Digunakan",
    klasifikasi: "Alat IT (Tetap)",
  },
  {
    id: "5",
    nomor: "INV-TIK-2023-005",
    nama: "Laptop Lenovo ThinkPad L14 SIMRS",
    lokasi: "Unit Gawat Darurat (UGD)",
    status: "Digunakan",
    klasifikasi: "Alat IT (Bergerak)",
    perpindahanTerkini: true,
  },
  {
    id: "6",
    nomor: "INV-TIK-2023-006",
    nama: "Barcode Scanner Datalogic QuickScan",
    lokasi: "Unit Gawat Darurat (UGD)",
    status: "Digunakan",
    klasifikasi: "Alat IT (Bergerak)",
  },
  {
    id: "7",
    nomor: "INV-TIK-2023-007",
    nama: "Workstation PACS Display Eizo Radiologi",
    lokasi: "Unit Gawat Darurat (UGD)",
    status: "Digunakan",
    klasifikasi: "Alat IT (Tetap)",
  },
  {
    id: "8",
    nomor: "INV-TIK-2023-008",
    nama: "Access Point Aruba AP-505 Gedung B",
    lokasi: "Ruang Isolasi Teratai Lt. 2",
    status: "Tidak Digunakan",
    klasifikasi: "Alat IT (Tetap)",
  },
  {
    id: "9",
    nomor: "INV-TIK-2023-009",
    nama: "Laptop Lenovo ThinkPad L14 SIMRS",
    lokasi: "Radiologi",
    status: "Rusak",
    klasifikasi: "Alat IT (Bergerak)",
  },
  {
    id: "10",
    nomor: "INV-TIK-2023-010",
    nama: "Access Point Aruba AP-505 Gedung B",
    lokasi: "Ruang Isolasi Teratai Lt. 2",
    status: "Digunakan",
    klasifikasi: "Alat IT (Tetap)",
    perpindahanTerkini: true,
  },
];

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

export default function InventarisTikListPage() {
  const navigate = useNavigate();
  const user = getUser();
  const role = user?.role || "";

  // Sembunyikan aksi jika bukan role yang diizinkan (misal Management hanya view-only)
  const canCreate = role === "super-admin" || role === "petugas-tik";

  const [searchTerm, setSearchTerm] = useState("");

  // Mode Unduh
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

  const [tempLokasi, setTempLokasi] = useState("Semua lokasi");
  const [tempStatus, setTempStatus] = useState("Semua status");
  const [tempKlasifikasi, setTempKlasifikasi] = useState("Semua jenis");
  const [tempPerpindahan, setTempPerpindahan] = useState(false);

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
      key: "nomor" as keyof InventarisTIK,
      label: "NOMOR INVENTARIS",
      render: (value: unknown) => (
        <span className="font-semibold text-blue-700 hover:underline">{String(value ?? "")}</span>
      ),
    },
    { key: "nama" as keyof InventarisTIK, label: "NAMA BARANG" },
    { key: "lokasi" as keyof InventarisTIK, label: "LOKASI RUANGAN" },
    {
      key: "status" as keyof InventarisTIK,
      label: "STATUS",
      render: (value: unknown) => (
        <Badge variant={getBadgeVariant(value as InventarisStatus)} size="sm">
          {String(value ?? "")}
        </Badge>
      ),
    },
  ];

  const filteredData = mockData.filter((item) => {
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

  return (
    <div className="flex flex-col min-h-[calc(100vh-4rem)] p-6 bg-slate-50 dark:bg-slate-900">
      <div className="mb-6 flex flex-col gap-1">
        <h1 className="text-xl font-semibold text-slate-800 dark:text-slate-100">
          Daftar Inventaris TIK
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
                            <option value="Unit Gawat Darurat (UGD)">
                              Unit Gawat Darurat (UGD)
                            </option>
                            <option value="Poli Penyakit Dalam">Poli Penyakit Dalam</option>
                            <option value="Farmasi Rawat Jalan">Farmasi Rawat Jalan</option>
                            <option value="Server & Jaringan Lantai 3">
                              Server & Jaringan Lantai 3
                            </option>
                            <option value="Akreditasi & Penjaminan Mutu">
                              Akreditasi & Penjaminan Mutu
                            </option>
                            <option value="Pendaftaran Rawat Inap (TPPRI)">
                              Pendaftaran Rawat Inap (TPPRI)
                            </option>
                            <option value="Radiologi">Radiologi</option>
                            <option value="Ruang Isolasi Teratai Lt. 2">
                              Ruang Isolasi Teratai Lt. 2
                            </option>
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

                        {/* Jenis Klasifikasi */}
                        <div>
                          <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                            Jenis Klasifikasi
                          </label>
                          <Select
                            value={tempKlasifikasi}
                            onChange={(e) => setTempKlasifikasi(e.target.value)}
                            className="w-full px-3 py-1.5 border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                          >
                            <option value="Semua jenis">Semua jenis</option>
                            <option value="Alat IT (Tetap)">Alat IT (Tetap)</option>
                            <option value="Alat IT (Bergerak)">Alat IT (Bergerak)</option>
                          </Select>
                        </div>

                        {/* Perpindahan Unit Terkini */}
                        <div className="pt-1">
                          <Checkbox
                            id="tik-perpindahan"
                            checked={tempPerpindahan}
                            onChange={(e) => setTempPerpindahan(e.target.checked)}
                            label="Perpindahan Unit Terkini"
                          />
                          <div className="text-[11px] text-slate-400 pl-6">
                            Hanya aset yang berpindah unit dalam 3 bulan terakhir
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
                  onClick={() => {
                    setIsSelectMode(true);
                    setSelectedIds(["2", "4", "5"]);
                  }}
                  className="gap-2 px-4 py-2 bg-blue-800 hover:bg-blue-900 text-white rounded-md text-sm font-medium"
                >
                  <Download className="h-4 w-4" /> Unduh Label Massal
                </Button>

                {/* Tambah Aset - Sembunyikan jika role tidak diizinkan */}
                {canCreate && (
                  <Button
                    type="button"
                    variant="default"
                    className="gap-2 px-4 py-2 bg-blue-800 hover:bg-blue-900 text-white rounded-md text-sm font-medium"
                  >
                    <Plus className="h-4 w-4" /> Tambah Aset
                  </Button>
                )}
              </>
            )}
          </div>
        </div>

        {/* Content Table / Empty State */}
        <div className="p-6 flex flex-col">
          {isSelectMode && (
            <div className="flex items-center justify-between p-3.5 mb-4 bg-blue-50/70 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800/50 rounded-lg text-sm text-slate-700 dark:text-slate-200">
              <div className="flex items-center gap-3">
                <Checkbox
                  id="select-all-header-tik"
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

          {filteredData.length > 0 ? (
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
                  navigate(`/inventaris/tik/${row.id}`);
                }
              }}
            />
          ) : (
            <div className="py-8">
              <EmptyState
                title="Data Aset Tidak Ditemukan"
                description={`Pencarian untuk "${searchTerm}" tidak membuahkan hasil.`}
                icon={<FolderSearch className="h-12 w-12 text-slate-400" />}
              />
            </div>
          )}
        </div>
      </div>

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
                        id={`tik-size-${opt.id}`}
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
                <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm text-slate-800">
                  <div className="flex justify-between items-start gap-2">
                    <div className="flex-1">
                      <div className="text-xs font-bold tracking-tight">3/1/1/6/2021</div>
                      <div className="text-[9px] text-slate-400 font-semibold tracking-wider">
                        INVENTARIS ASET TIK
                      </div>
                      <div className="h-px bg-slate-200 my-2"></div>

                      <div className="space-y-1.5 text-[11px]">
                        <div>
                          <div className="text-[8px] text-slate-400 uppercase font-semibold">
                            NAMA BARANG
                          </div>
                          <div className="font-semibold text-slate-800 leading-tight">
                            Monitor Pasien Multi-Para Bionet BM3
                          </div>
                        </div>
                        <div>
                          <div className="text-[8px] text-slate-400 uppercase font-semibold">
                            LOKASI RUANGAN
                          </div>
                          <div className="font-semibold text-slate-800 leading-tight">
                            Ruang Rawat Inap Melati 3
                          </div>
                        </div>
                        <div>
                          <div className="text-[8px] text-slate-400 uppercase font-semibold">
                            STATUS
                          </div>
                          <div className="font-semibold text-slate-800 leading-tight">Aktif</div>
                        </div>
                      </div>
                    </div>

                    {/* QR Code */}
                    <div className="shrink-0 pt-1">
                      <QrCode className="h-20 w-20 text-slate-900" />
                    </div>
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
              <option value="Unit Gawat Darurat (UGD)">Unit Gawat Darurat (UGD)</option>
              <option value="Poli Penyakit Dalam">Poli Penyakit Dalam</option>
              <option value="Farmasi Rawat Jalan">Farmasi Rawat Jalan</option>
              <option value="Server & Jaringan Lantai 3">Server & Jaringan Lantai 3</option>
              <option value="Akreditasi & Penjaminan Mutu">Akreditasi & Penjaminan Mutu</option>
              <option value="Pendaftaran Rawat Inap (TPPRI)">Pendaftaran Rawat Inap (TPPRI)</option>
              <option value="Radiologi">Radiologi</option>
              <option value="Ruang Isolasi Teratai Lt. 2">Ruang Isolasi Teratai Lt. 2</option>
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

          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
              Jenis Klasifikasi
            </label>
            <Select
              value={tempKlasifikasi}
              onChange={(e) => setTempKlasifikasi(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="Semua jenis">Semua jenis</option>
              <option value="Alat IT (Tetap)">Alat IT (Tetap)</option>
              <option value="Alat IT (Bergerak)">Alat IT (Bergerak)</option>
            </Select>
          </div>

          <div className="pt-1">
            <Checkbox
              id="mobile-tik-perpindahan"
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
    </div>
  );
}
