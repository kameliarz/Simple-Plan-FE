import { useState, useEffect } from "react";
import {
  ArrowLeft,
  Printer,
  Edit,
  Info,
  QrCode,
  Clock,
  X,
  Download,
  Scan,
  Wrench,
  AirVent,
  Loader2,
  AlertCircle,
  FileText,
  Image as ImageIcon,
} from "lucide-react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { getUser } from "@/features/auth-login/services/authStorage";
import { Badge, type BadgeVariant } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { AttachmentCard } from "@/components/ui/AttachmentCard";
import { EmptyState } from "@/components/ui/EmptyState";
import Toast from "@/components/ui/Toast";
import {
  getAssetDetail,
  downloadSingleAssetLabel,
  printSingleAssetLabel,
} from "../services/inventarisApi";
import type { ApiAsset, InventarisStatus, InventarisCondition } from "../types/inventaris";

function formatFileSize(bytes?: number): string {
  if (!bytes || bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
}

function formatDate(dateStr?: string | null): string {
  if (!dateStr) return "-";
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  } catch {
    return dateStr;
  }
}

function formatDateTime(dateStr?: string | null): string {
  if (!dateStr) return "-";
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return (
      d.toLocaleDateString("id-ID", {
        day: "numeric",
        month: "short",
        year: "numeric",
      }) +
      ", " +
      d.toLocaleTimeString("id-ID", {
        hour: "2-digit",
        minute: "2-digit",
      })
    );
  } catch {
    return dateStr;
  }
}

export default function InventarisSarprasDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [isPreviewLabelOpen, setIsPreviewLabelOpen] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [isPrinting, setIsPrinting] = useState(false);
  const [toast, setToast] = useState<{
    show: boolean;
    message: string;
    variant?: "success" | "danger" | "info";
  }>({
    show: false,
    message: "",
    variant: "info",
  });

  const [asset, setAsset] = useState<ApiAsset | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const user = getUser();
  const role = user?.role || "";

  // Hak akses edit: Super Admin, Koordinator Sarpras, Petugas Sarpras
  const canEdit =
    role === "super-admin" || role === "koordinator-sarpras" || role === "petugas-sarpras";

  const handleDownloadLabel = async () => {
    if (!asset) return;
    setIsDownloading(true);
    try {
      await downloadSingleAssetLabel(asset.id, 70, 35, asset.asset_uid);
      setToast({
        show: true,
        message: "Label aset berhasil diunduh!",
        variant: "success",
      });
      setIsPreviewLabelOpen(false);
    } catch (err) {
      setToast({
        show: true,
        message: err instanceof Error ? err.message : "Gagal mengunduh label aset",
        variant: "danger",
      });
    } finally {
      setIsDownloading(false);
    }
  };

  const handlePrintLabel = async () => {
    if (!asset) return;
    setIsPrinting(true);
    try {
      await printSingleAssetLabel(asset.id, 70, 35);
    } catch (err) {
      setToast({
        show: true,
        message: err instanceof Error ? err.message : "Gagal mencetak label aset",
        variant: "danger",
      });
    } finally {
      setIsPrinting(false);
    }
  };

  const fetchDetail = () => {
    if (!id) return;
    setIsLoading(true);
    setError(null);
    getAssetDetail(id)
      .then((data) => {
        setAsset(data);
        setIsLoading(false);
      })
      .catch((err) => {
        setError(err instanceof Error ? err.message : "Gagal memuat detail inventaris");
        setIsLoading(false);
      });
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchDetail();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const getStatusVariant = (status?: InventarisStatus): BadgeVariant => {
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

  const getConditionBadge = (kondisi?: InventarisCondition) => {
    switch (kondisi) {
      case "Baik":
        return { variant: "info" as BadgeVariant, dotColor: "bg-blue-500" };
      case "Rusak Ringan":
        return { variant: "warning" as BadgeVariant, dotColor: "bg-amber-500" };
      case "Rusak Berat":
        return { variant: "danger" as BadgeVariant, dotColor: "bg-rose-500" };
      default:
        return { variant: "default" as BadgeVariant, dotColor: "bg-slate-400" };
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-4rem)] p-6 bg-slate-50 dark:bg-slate-900">
        <Loader2 className="h-10 w-10 text-blue-600 animate-spin mb-4" />
        <p className="text-sm font-medium text-slate-600 dark:text-slate-300">
          Memuat data inventaris sarpras...
        </p>
      </div>
    );
  }

  if (error || !asset) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-4rem)] p-6 bg-slate-50 dark:bg-slate-900 gap-4">
        <div className="p-4 bg-red-50 dark:bg-red-950/40 rounded-full text-red-600 dark:text-red-400">
          <AlertCircle className="h-10 w-10" />
        </div>
        <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-100">
          {error || "Data inventaris tidak ditemukan"}
        </h2>
        <div className="flex items-center gap-3">
          <Button variant="outline" onClick={() => navigate("/inventaris/sarpras")}>
            Kembali ke Daftar
          </Button>
          <Button variant="default" onClick={fetchDetail}>
            Coba Lagi
          </Button>
        </div>
      </div>
    );
  }

  const namaBarang =
    asset.asset_code?.item?.name || asset.brand || asset.model_specification || "Barang Sarpras";
  const kategoriBarang = asset.asset_code?.classification?.name || "Alat Sarpras";
  const fullCode = asset.asset_code?.full_code || "-";
  const lokasiRuangan = asset.asset_code?.location?.name || "-";
  const lokasiDetail = asset.location_detail || "-";
  const spesifikasi = asset.model_specification || "-";
  const serialNumber = asset.serial_number || "-";
  const tahunBeli = asset.purchase_year ? String(asset.purchase_year) : "-";
  const garansi = formatDate(asset.warranty_until);
  const keterangan = asset.notes || "Tidak ada keterangan tambahan.";
  const conditionBadgeInfo = getConditionBadge(asset.condition);

  const handleDownloadKalibrasi = () => {
    if (asset.calibration_document?.url) {
      window.open(asset.calibration_document.url, "_blank");
    } else {
      alert(`Mengunduh ${asset.calibration_document?.original_name || "dokumen"}`);
    }
  };

  const handleDownloadPhoto = () => {
    if (asset.photo?.url) {
      window.open(asset.photo.url, "_blank");
    } else {
      alert(`Mengunduh ${asset.photo?.original_name || "foto aset"}`);
    }
  };

  return (
    <div className="flex flex-col gap-6 p-6 min-h-[calc(100vh-4rem)] bg-slate-50 dark:bg-slate-900">
      {/* Top Bar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            to="/inventaris/sarpras"
            className="p-2 bg-white dark:bg-slate-800 shadow-sm border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-full transition-colors text-slate-600 dark:text-slate-300"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <h1 className="text-xl font-semibold text-slate-800 dark:text-slate-100">
            Detail Data Inventaris Sarpras
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => setIsPreviewLabelOpen(true)}
            className="gap-2 px-4 py-2 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-700 text-sm font-medium"
          >
            <Printer className="h-4 w-4" /> Cetak Label
          </Button>

          {/* Sembunyikan Ubah Data jika bukan role yang diizinkan */}
          {canEdit && (
            <Button
              type="button"
              variant="default"
              onClick={() => navigate(`/inventory/sarpras/${asset.id}/edit`)}
              className="gap-2 px-4 py-2 bg-blue-800 hover:bg-blue-900 text-white rounded-md text-sm font-medium"
            >
              <Edit className="h-4 w-4" /> Ubah Data
            </Button>
          )}
        </div>
      </div>

      {/* Header Card */}
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 p-6 flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-blue-50 dark:bg-blue-900/20 text-blue-600 rounded-xl flex items-center justify-center">
            <AirVent className="h-7 w-7" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-2">
              {namaBarang}
            </h2>
            <div className="flex flex-wrap items-center gap-3 text-sm">
              <Badge variant="default" size="lg" className="gap-1.5">
                <Wrench className="h-3.5 w-3.5" /> {kategoriBarang}
              </Badge>
              <Badge variant={getStatusVariant(asset.status)} size="lg" dot>
                {asset.status}
              </Badge>
              <Badge
                variant={conditionBadgeInfo.variant}
                size="lg"
                dot
                dotColor={conditionBadgeInfo.dotColor}
              >
                {asset.condition}
              </Badge>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3 px-4 py-3 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800">
          <QrCode className="h-10 w-10 text-slate-700 dark:text-slate-300" />
          <div>
            <div className="text-xs text-slate-400 font-medium">QR CODE ASET</div>
            <div className="text-sm font-bold text-blue-700 break-all max-w-[200px]">
              {asset.asset_uid}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Left Column: Identitas, Spesifikasi, Keterangan */}
        <div className="xl:col-span-2 space-y-6">
          {/* Identitas Aset */}
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 p-6">
            <h3 className="text-base font-semibold text-slate-800 dark:text-slate-100 mb-6 flex items-center gap-2 pb-4 border-b border-slate-100 dark:border-slate-700">
              <Info className="h-5 w-5 text-slate-400" />
              Identitas Aset
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-6 gap-x-8">
              <div>
                <div className="text-xs text-slate-400 mb-1">ID Barang</div>
                <div className="text-sm font-semibold text-blue-700 break-all">
                  {asset.asset_uid}
                </div>
              </div>
              <div>
                <div className="text-xs text-slate-400 mb-1">No. Inventaris</div>
                <div className="text-sm font-medium text-slate-800 dark:text-slate-200">
                  {fullCode}
                </div>
              </div>
              <div>
                <div className="text-xs text-slate-400 mb-1">Lokasi Ruangan</div>
                <div className="text-sm font-medium text-slate-800 dark:text-slate-200">
                  {lokasiRuangan}
                </div>
              </div>
              <div>
                <div className="text-xs text-slate-400 mb-1">Lokasi Detail</div>
                <div className="text-sm font-medium text-slate-800 dark:text-slate-200">
                  {lokasiDetail}
                </div>
              </div>
            </div>
          </div>

          {/* Spesifikasi */}
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 p-6">
            <h3 className="text-base font-semibold text-slate-800 dark:text-slate-100 mb-6 flex items-center gap-2 pb-4 border-b border-slate-100 dark:border-slate-700">
              <Wrench className="h-5 w-5 text-slate-400" />
              Spesifikasi
            </h3>

            <div className="mb-6">
              <div className="text-xs text-slate-400 mb-1">Model / Merk / Spesifikasi</div>
              <div className="text-sm font-medium text-slate-800 dark:text-slate-200">
                {spesifikasi !== "-" ? spesifikasi : asset.brand || "-"}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-700 rounded-lg p-4">
                <div className="text-xs text-slate-400 mb-1">Serial Number</div>
                <div className="text-sm font-medium text-slate-800 dark:text-slate-200 break-all">
                  {serialNumber}
                </div>
              </div>
              <div className="bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-700 rounded-lg p-4">
                <div className="text-xs text-slate-400 mb-1">Tahun Beli</div>
                <div className="text-sm font-medium text-slate-800 dark:text-slate-200">
                  {tahunBeli}
                </div>
              </div>
              <div className="bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-700 rounded-lg p-4">
                <div className="text-xs text-slate-400 mb-1">Garansi S/D</div>
                <div className="text-sm font-medium text-slate-800 dark:text-slate-200">
                  {garansi}
                </div>
              </div>
            </div>
          </div>

          {/* Keterangan */}
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 p-6">
            <h3 className="text-base font-semibold text-slate-800 dark:text-slate-100 mb-4">
              Keterangan
            </h3>
            <div className="p-4 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-700 rounded-lg text-sm text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-line">
              {keterangan}
            </div>
          </div>
        </div>

        {/* Right Column: Riwayat Mutasi Aset & Dokumen Kalibrasi / Foto */}
        <div className="space-y-6">
          {/* Riwayat Mutasi Aset */}
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 p-6">
            <h3 className="text-base font-semibold text-slate-800 dark:text-slate-100 mb-1">
              Riwayat Mutasi Aset
            </h3>
            <p className="text-xs text-slate-400 mb-6">
              Catatan perubahan lokasi, kondisi, dan status
            </p>

            {asset.histories && asset.histories.length > 0 ? (
              /* Timeline View */
              <div className="relative border-l-2 border-slate-200 dark:border-slate-700 ml-3 mt-4 space-y-6 pb-2">
                {asset.histories.map((item, idx) => (
                  <div key={item.id || idx} className="relative pl-6">
                    <div
                      className={`absolute -left-[9px] top-1 w-4 h-4 bg-white dark:bg-slate-800 border-2 rounded-full ${
                        idx === 0 ? "border-blue-600" : "border-slate-300 dark:border-slate-600"
                      }`}
                    ></div>
                    <div className="bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-700 rounded-lg p-4">
                      <div className="flex justify-between items-start mb-2">
                        <span
                          className={`text-xs font-semibold ${
                            idx === 0 ? "text-blue-700" : "text-slate-500"
                          }`}
                        >
                          {formatDateTime(item.created_at)}
                        </span>
                        <Badge variant="primary" size="sm">
                          {item.is_location_change
                            ? "Mutasi Unit"
                            : item.event_type === "created"
                              ? "Pendaftaran"
                              : "Pembaruan"}
                        </Badge>
                      </div>
                      <h4 className="text-sm font-semibold text-slate-800 dark:text-slate-200 mb-2">
                        {item.is_location_change
                          ? "Perubahan Lokasi Ruangan"
                          : item.event_type === "created"
                            ? "Pendaftaran Aset Baru"
                            : "Pembaruan Data Aset"}
                      </h4>

                      {item.changed_by && (
                        <div className="text-xs text-slate-500 dark:text-slate-400 pt-2 border-t border-slate-200 dark:border-slate-700">
                          Oleh:{" "}
                          <span className="font-medium text-slate-700 dark:text-slate-300">
                            {item.changed_by.name}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState
                title="Belum Ada Riwayat Mutasi"
                description="Belum tercatat adanya mutasi lokasi, perubahan kondisi, ataupun perubahan status pada aset ini."
                icon={<Clock className="h-8 w-8 text-blue-600 dark:text-blue-400" />}
              />
            )}
          </div>

          {/* Dokumen Kalibrasi */}
          {asset.calibration_document && (
            <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 p-6 space-y-3">
              <div className="text-xs text-slate-500 dark:text-slate-400 font-medium flex items-center gap-2">
                <FileText className="h-4 w-4 text-blue-600" /> Dokumen Kalibrasi
              </div>
              <AttachmentCard
                name={asset.calibration_document.original_name}
                size={formatFileSize(asset.calibration_document.size)}
                onDownload={handleDownloadKalibrasi}
              />
            </div>
          )}

          {/* Foto Aset */}
          {asset.photo && (
            <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 p-6 space-y-3">
              <div className="text-xs text-slate-500 dark:text-slate-400 font-medium flex items-center gap-2">
                <ImageIcon className="h-4 w-4 text-blue-600" /> Foto Aset
              </div>
              {asset.photo.url && (
                <div className="rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-900 max-h-48 flex items-center justify-center">
                  <img
                    src={asset.photo.url}
                    alt={asset.photo.original_name}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              <AttachmentCard
                name={asset.photo.original_name}
                size={formatFileSize(asset.photo.size)}
                onDownload={handleDownloadPhoto}
              />
            </div>
          )}
        </div>
      </div>

      {/* Preview Label Aset Modal */}
      {isPreviewLabelOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-700 w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-700">
              <h3 className="text-base font-semibold text-slate-800 dark:text-slate-100">
                Preview Label Aset
              </h3>
              <button
                type="button"
                onClick={() => setIsPreviewLabelOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6">
              <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm text-slate-800">
                <div className="flex justify-between items-start gap-4">
                  <div className="flex-1">
                    <div className="text-sm font-bold tracking-tight">{fullCode}</div>
                    <div className="text-[10px] text-slate-400 font-semibold tracking-wider">
                      INVENTARIS ASET SARPRAS
                    </div>
                    <div className="h-px bg-slate-200 my-2.5"></div>

                    <div className="space-y-2 text-xs">
                      <div>
                        <div className="text-[9px] text-slate-400 uppercase font-semibold">
                          NAMA BARANG
                        </div>
                        <div className="font-semibold text-slate-800 leading-tight">
                          {namaBarang}
                        </div>
                      </div>
                      <div>
                        <div className="text-[9px] text-slate-400 uppercase font-semibold">
                          LOKASI RUANGAN
                        </div>
                        <div className="font-semibold text-slate-800 leading-tight">
                          {lokasiRuangan}
                        </div>
                      </div>
                      <div>
                        <div className="text-[9px] text-slate-400 uppercase font-semibold">
                          STATUS
                        </div>
                        <div className="font-semibold text-slate-800 leading-tight">
                          {asset.status}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* QR Code */}
                  <div className="shrink-0 pt-2">
                    <QrCode className="h-24 w-24 text-slate-900" />
                  </div>
                </div>

                <div className="mt-4 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                  <div className="flex items-center gap-1.5">
                    <Scan className="h-3.5 w-3.5" />
                    <span>Format Thermal Barcode</span>
                  </div>
                  <div>70 x 35 mm</div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-end gap-3 px-6 py-3.5 border-t border-slate-100 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/40">
              <Button
                type="button"
                variant="outline"
                disabled={isPrinting || isDownloading}
                onClick={handlePrintLabel}
                className="gap-2 px-4 py-2 dark:bg-slate-800 dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-700 text-sm font-medium disabled:opacity-50"
              >
                {isPrinting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" /> Menyiapkan...
                  </>
                ) : (
                  <>
                    <Printer className="h-4 w-4" /> Cetak
                  </>
                )}
              </Button>
              <Button
                type="button"
                variant="default"
                disabled={isDownloading || isPrinting}
                onClick={handleDownloadLabel}
                className="gap-2 px-4 py-2 bg-blue-800 hover:bg-blue-900 text-white rounded-md text-sm font-medium disabled:opacity-50"
              >
                {isDownloading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" /> Mengunduh...
                  </>
                ) : (
                  <>
                    <Download className="h-4 w-4" /> Unduh
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      )}

      <Toast
        show={toast.show}
        message={toast.message}
        variant={toast.variant}
        onClose={() => setToast((prev) => ({ ...prev, show: false }))}
      />
    </div>
  );
}
