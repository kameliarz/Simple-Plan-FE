import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  IconArrowLeft,
  IconBuilding,
  IconCalendar,
  IconCheck,
  IconClock,
  IconDoor,
  IconDownload,
  IconEdit,
  IconPhoto,
  IconX,
} from "@tabler/icons-react";
import { Wrench } from "lucide-react";
import Badge from "@/components/ui/Badge";
import { maintenanceService } from "../services/maintenanceService";
import type { MaintenanceItem } from "../types/maintenance.types";
import { useToast } from "@/components/ui/ui-template/UseToast";

export default function DetailJadwalMaintenancePage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [item, setItem] = useState<MaintenanceItem | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Modal & Banner state
  const [showDeactivateModal, setShowDeactivateModal] = useState(false);
  const [showDeactivatedBanner, setShowDeactivatedBanner] = useState(false);

  useEffect(() => {
    const fetchDetail = async () => {
      if (!id) return;
      setIsLoading(true);
      try {
        const data = await maintenanceService.getMaintenanceById(id);
        setItem(data);
      } catch (err) {
        console.error("Gagal mengambil detail maintenance:", err);
      } finally {
        setIsLoading(false);
      }
    };

    void fetchDetail();
  }, [id]);

  const handleOpenDeactivateModal = () => {
    if (!item?.isActive) {
      void handleToggleActive(true);
      return;
    }
    setShowDeactivateModal(true);
  };

  const handleConfirmDeactivate = async () => {
    setShowDeactivateModal(false);
    await handleToggleActive(false);
  };

  const handleToggleActive = async (targetActive?: boolean) => {
    if (!id || !item) return;
    try {
      const nextActive = targetActive !== undefined ? targetActive : !item.isActive;
      // Simpan perubahan status
      await maintenanceService.toggleMaintenanceStatus(id);
      setItem((prev) => (prev ? { ...prev, isActive: nextActive } : null));

      if (!nextActive) {
        setShowDeactivatedBanner(true);
        showToast("Jadwal maintenance dinonaktifkan", "info");
      } else {
        setShowDeactivatedBanner(false);
        showToast("Jadwal maintenance diaktifkan", "success");
      }
    } catch {
      showToast("Gagal mengubah status maintenance", "error");
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-96 items-center justify-center text-xs text-gray-400">
        Memuat detail maintenance...
      </div>
    );
  }

  if (!item) {
    return (
      <div className="mx-auto w-full max-w-5xl px-4 py-12 text-center">
        <p className="text-sm font-semibold text-gray-600 dark:text-slate-300">
          Jadwal maintenance tidak ditemukan
        </p>
        <button
          type="button"
          onClick={() => navigate("/maintenance")}
          className="mt-4 rounded-lg bg-[#003178] px-4 py-2 text-xs font-semibold text-white"
        >
          Kembali ke Daftar
        </button>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-6 md:px-8 space-y-4">
      {/* Header with back button & action buttons */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate("/maintenance")}
            className="flex h-9 w-9 items-center justify-center rounded-lg text-gray-700 transition hover:bg-gray-100 active:scale-95 dark:text-slate-200 dark:hover:bg-slate-800"
            title="Kembali"
          >
            <IconArrowLeft size={22} strokeWidth={2} />
          </button>
          <h1 className="text-lg font-bold text-gray-800 dark:text-slate-100">
            Detail Jadwal Maintenance
          </h1>
        </div>

        <div className="flex items-center gap-2.5">
          {/* Tombol Nonaktifkan / Aktifkan */}
          <button
            type="button"
            onClick={handleOpenDeactivateModal}
            className="rounded-lg border border-[#003178] bg-white px-4 py-2 text-xs font-semibold text-[#003178] transition hover:bg-blue-50 dark:bg-slate-900 dark:border-blue-400 dark:text-blue-400 dark:hover:bg-slate-800 shadow-sm"
          >
            {item.isActive ? "Nonaktifkan" : "Aktifkan"}
          </button>

          {/* Edit Data */}
          <button
            type="button"
            onClick={() => navigate(`/maintenance/${id}/edit`)}
            className="flex items-center gap-1.5 rounded-lg bg-[#003178] px-4 py-2 text-xs font-semibold text-white transition hover:bg-[#00255c] active:scale-98 shadow-sm"
          >
            <IconEdit size={15} />
            <span>Edit Data</span>
          </button>
        </div>
      </div>

      {showDeactivatedBanner && (
        <div className="flex items-center justify-between rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2.5 text-xs font-medium text-emerald-800 transition dark:border-emerald-800/60 dark:bg-emerald-950/40 dark:text-emerald-300">
          <div className="flex items-center gap-2">
            <div className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500 text-white">
              <IconCheck size={13} strokeWidth={3} />
            </div>
            <span>Jadwal berhasil dinonaktifkan!</span>
          </div>
          <button
            type="button"
            onClick={() => setShowDeactivatedBanner(false)}
            className="text-emerald-600 hover:text-emerald-900 dark:text-emerald-400 dark:hover:text-emerald-200"
          >
            <IconX size={16} />
          </button>
        </div>
      )}

      {/* TOP CARD: Info Aset & Jadwal Maintenance */}
      <div className="rounded-2xl border border-gray-200 bg-white p-6 md:p-8 shadow-sm transition dark:border-slate-800 dark:bg-slate-900 space-y-6">
        {/* Card Header: Nama Barang & Badges */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-gray-100 pb-5 dark:border-slate-800">
          <h2 className="text-base md:text-lg font-bold text-gray-800 dark:text-slate-100">
            {item.namaBarang}
          </h2>

          <div className="flex items-center gap-2">
            {item.isActive ? (
              <Badge variant="success" dot={true}>
                Aktif
              </Badge>
            ) : (
              <span className="inline-flex items-center gap-1.5 rounded-full border border-[#fecdd3] bg-[#fff1f2] px-2.5 py-0.5 text-xs font-medium text-[#e11d48]">
                <span className="h-1.5 w-1.5 rounded-full bg-[#e11d48]" />
                Nonaktif
              </span>
            )}

            {/* Badge Status Maintenance */}
            {item.status === "Selesai" && (
              <Badge variant="success" dot={true}>
                Selesai
              </Badge>
            )}
            {item.status === "Terjadwal" && (
              <Badge variant="warning" dot={true}>
                Terjadwal
              </Badge>
            )}
            {item.status === "Terlambat" && (
              <Badge variant="danger" dot={true}>
                Terlambat
              </Badge>
            )}
          </div>
        </div>

        {/* 2-Columns Details Grid */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          {/* Col 1 */}
          <div className="space-y-4">
            <div>
              <p className="text-xs font-medium text-gray-400">ID Barang</p>
              <p className="mt-1 text-sm font-bold text-[#003178] dark:text-blue-400">
                {item.idBarang || item.nomorInventaris}
              </p>
            </div>

            <div>
              <p className="text-xs font-medium text-gray-400">Lokasi</p>
              <div className="mt-1 flex items-center gap-2 text-sm font-medium text-gray-800 dark:text-slate-100">
                <IconBuilding size={16} className="text-gray-400" />
                <span>{item.lokasi || "-"}</span>
              </div>
            </div>
          </div>

          {/* Col 2 */}
          <div className="space-y-4">
            <div>
              <p className="text-xs font-medium text-gray-400">Klasifikasi</p>
              <p className="mt-1 text-sm font-semibold text-gray-800 dark:text-slate-100">
                {item.klasifikasi || "Alat IT"}
              </p>
            </div>

            <div>
              <p className="text-xs font-medium text-gray-400">Lokasi Ruangan</p>
              <div className="mt-1 flex items-center gap-2 text-sm font-medium text-gray-800 dark:text-slate-100">
                <IconDoor size={16} className="text-gray-400" />
                <span>{item.lokasiRuangan || "-"}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Jenis Pemeliharaan */}
        <div>
          <p className="text-xs font-medium text-gray-400 mb-2">Jenis Pemeliharaan</p>
          <div className="flex items-center gap-3 rounded-xl border border-blue-100 bg-[#eff4ff] px-4 py-3 text-xs font-medium text-slate-800 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-100 dark:bg-slate-700 text-[#003178] dark:text-blue-400">
              <Wrench size={16} />
            </div>
            <span>{item.jenisPemeliharaan || "Pemeliharaan & Pengecekan Rutin"}</span>
          </div>
        </div>

        {/* Bottom Row (Periode, Tanggal Jadwal, Petugas) */}
        <div className="grid grid-cols-1 gap-6 border-t border-gray-100 pt-5 sm:grid-cols-3 dark:border-slate-800">
          <div>
            <p className="text-xs font-medium text-gray-400 mb-2">Periode</p>
            <div className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-gray-50/80 px-3 py-1.5 text-xs font-medium text-gray-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200">
              <IconClock size={15} className="text-gray-500" />
              <span>{item.periode}</span>
            </div>
          </div>

          <div>
            <p className="text-xs font-medium text-gray-400 mb-2">Tanggal Jadwal</p>
            <div className="flex items-center gap-2 text-xs font-medium text-gray-700 dark:text-slate-200">
              <IconCalendar size={16} className="text-gray-400" />
              <span>{item.tanggalJadwal}</span>
            </div>
          </div>

          <div>
            <p className="text-xs font-medium text-gray-400 mb-2">Petugas</p>
            <p className="text-xs font-semibold text-gray-800 dark:text-slate-100">
              {item.petugas}
            </p>
          </div>
        </div>
      </div>

      {item.status === "Selesai" && item.hasilMaintenance && (
        <div className="rounded-2xl border border-gray-200 bg-white p-6 md:p-8 shadow-sm transition dark:border-slate-800 dark:bg-slate-900 space-y-6">
          <h2 className="text-base font-bold text-gray-800 dark:text-slate-100 border-b border-gray-100 pb-4 dark:border-slate-800">
            Hasil Maintenance
          </h2>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
            <div>
              <p className="text-xs font-medium text-gray-400">Uraian Pekerjaan</p>
              <p className="mt-1 text-xs font-medium text-gray-800 dark:text-slate-100 leading-relaxed">
                {item.hasilMaintenance.uraianPekerjaan}
              </p>
            </div>

            <div>
              <p className="text-xs font-medium text-gray-400">Hasil Pemeliharaan</p>
              <p className="mt-1 text-xs font-medium text-gray-800 dark:text-slate-100">
                {item.hasilMaintenance.hasilPemeliharaan}
              </p>
            </div>

            <div>
              <p className="text-xs font-medium text-gray-400 mb-1.5">Kondisi pasca pemeliharaan</p>
              <Badge variant="success" dot={true}>
                {item.hasilMaintenance.kondisiPasca}
              </Badge>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6 border-t border-gray-100 pt-5 sm:grid-cols-3 dark:border-slate-800">
            <div>
              <p className="text-xs font-medium text-gray-400">Waktu Mulai</p>
              <p className="mt-1 text-xs font-semibold text-gray-800 dark:text-slate-100">
                {item.hasilMaintenance.waktuMulai}
              </p>
            </div>

            <div>
              <p className="text-xs font-medium text-gray-400">Waktu Selesai</p>
              <p className="mt-1 text-xs font-semibold text-gray-800 dark:text-slate-100">
                {item.hasilMaintenance.waktuSelesai}
              </p>
            </div>

            <div>
              <p className="text-xs font-medium text-gray-400 mb-1.5">Foto hasil pemeliharaan</p>
              {item.hasilMaintenance.fotoHasil && (
                <div className="flex items-center justify-between rounded-xl border border-gray-200 bg-white p-2.5 dark:border-slate-700 dark:bg-slate-800">
                  <div className="flex items-center gap-2.5">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 text-[#003178] dark:bg-slate-700 dark:text-blue-300">
                      <IconPhoto size={18} />
                    </div>
                    <div>
                      <p className="text-[11px] font-medium text-gray-800 dark:text-slate-100">
                        {item.hasilMaintenance.fotoHasil.namaFile}
                      </p>
                      <p className="text-[10px] text-gray-400">
                        {item.hasilMaintenance.fotoHasil.ukuranFile}
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    className="p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-slate-200"
                    title="Download"
                  >
                    <IconDownload size={16} />
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* CONFIRMATION MODAL: Nonaktifkan jadwal? (Screenshot 5) */}
      {showDeactivateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="w-full max-w-sm sm:max-w-md rounded-2xl bg-white dark:bg-slate-900 p-6 shadow-2xl transition">
            <h3 className="text-sm sm:text-base font-bold text-gray-900 dark:text-slate-100 mb-1.5">
              Nonaktifkan jadwal?
            </h3>
            <p className="text-xs text-gray-500 dark:text-slate-400 mb-6 leading-relaxed">
              Jadwal akan dinonaktifkan dan pengulangan jadwal akan berhenti.
            </p>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setShowDeactivateModal(false)}
                className="flex-1 h-10 rounded-lg border border-[#003178] bg-white text-xs font-semibold text-[#003178] transition hover:bg-blue-50 dark:bg-slate-900 dark:border-blue-400 dark:text-blue-400"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleConfirmDeactivate}
                className="flex-1 h-10 rounded-lg bg-[#003178] text-xs font-semibold text-white transition hover:bg-[#00255c] active:scale-98"
              >
                Ya
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
