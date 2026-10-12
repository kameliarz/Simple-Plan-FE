import { useState } from "react";
import {
  ArrowLeft,
  Printer,
  Edit,
  Info,
  Monitor,
  QrCode,
  Clock,
  X,
  Download,
  Scan,
} from "lucide-react";
import { Link, useParams } from "react-router-dom";
import { getUser } from "@/features/auth-login/services/authStorage";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";

export default function InventarisTikDetailPage() {
  const { id } = useParams();
  const [isPreviewLabelOpen, setIsPreviewLabelOpen] = useState(false);

  const user = getUser();
  const role = user?.role || "";

  // Hak akses edit aset (hanya super-admin dan petugas-tik)
  const canEdit = role === "super-admin" || role === "petugas-tik";

  const aset = {
    id: id || "1",
    nama: "Workstation All-in-One HP ProOne 440 G9",
    kategori: "Alat IT (Nilai Tetap)",
    statusPenggunaan: "Aktif",
    kondisi: "Baik",
    idBarang: "AST-TIK-2023-0042",
    noInventaris: "INV-TIK-2023-042",
    lokasiRuangan: "Poli Penyakit Dalam",
    lokasi: "Ruang Konsultasi Dokter 03",
    spesifikasi: 'Intel Core i7-12700, 16GB DDR4, 512GB SSD, 23.8" FHD IPS',
    serialNumber: "4CE2450N9L",
    tahunBeli: "2023",
    garansi: "18 December 2024",
    keterangan: "Perangkat operasional utama SIMRS di ruang periksa Poli Penyakit Dalam.",
    riwayatMutasi: [
      {
        id: 1,
        tanggal: "14 Jan 2024, 09:30",
        tipe: "Mutasi Unit",
        judul: "Perubahan Unit & Lokasi",
        details: [
          { label: "Dari", val: "Gudang Logistik TIK" },
          { label: "Ke", val: "Poli Penyakit Dalam (R. Konsultasi Dokter 03)" },
        ],
        noInventaris: "INV-TIK-2023-042",
        oleh: "Agung Sunaryo",
        isLatest: true,
      },
      {
        id: 2,
        tanggal: "10 Nov 2023, 14:15",
        tipe: "Pembaruan",
        judul: "Pembaruan Kondisi & Status",
        kondisi: "Rusak Ringan → Baik",
        status: "Dalam Perbaikan → Aktif",
        catatan: "Penggantian port RJ45 & pengujian koneksi jaringan SIMRS",
        oleh: "Budi Santoso",
        isLatest: false,
      },
      {
        id: 3,
        tanggal: "05 Jun 2023, 10:00",
        tipe: "Pendaftaran",
        judul: "Pendaftaran Aset Baru",
        catatan: "Penerimaan unit pengadaan baru tahun 2023 di Gudang Logistik TIK",
        statusKondisi: "Status: Aktif | Kondisi: Baik",
        oleh: "Admin TIK",
        isLatest: false,
      },
    ],
  };

  return (
    <div className="flex flex-col gap-6 p-6 min-h-[calc(100vh-4rem)] bg-slate-50 dark:bg-slate-900">
      {/* Top Bar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            to="/inventaris/tik"
            className="p-2 bg-white dark:bg-slate-800 shadow-sm border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-full transition-colors text-slate-600 dark:text-slate-300"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <h1 className="text-xl font-semibold text-slate-800 dark:text-slate-100">
            Detail Data Inventaris TIK
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

          {/*menyembunyikan selain role tertentu */}
          {canEdit && (
            <Button type="button" variant="default" className="gap-2 px-4 py-2 text-sm font-medium">
              <Edit className="h-4 w-4" /> Ubah Data
            </Button>
          )}
        </div>
      </div>

      {/* Header Card */}
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 p-6 flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-blue-50 dark:bg-blue-900/20 text-blue-600 rounded-xl flex items-center justify-center">
            <Monitor className="h-7 w-7" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-2">
              {aset.nama}
            </h2>
            <div className="flex flex-wrap items-center gap-3 text-sm">
              <Badge variant="default" size="lg" className="gap-1.5">
                <Monitor className="h-3.5 w-3.5" /> {aset.kategori}
              </Badge>
              <Badge variant="success" size="lg" dot>
                {aset.statusPenggunaan}
              </Badge>
              <Badge variant="info" size="lg" dot dotColor="bg-blue-500">
                {aset.kondisi}
              </Badge>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3 px-4 py-3 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800">
          <QrCode className="h-10 w-10 text-slate-700 dark:text-slate-300" />
          <div>
            <div className="text-xs text-slate-400 font-medium">QR CODE ASET</div>
            <div className="text-sm font-bold text-blue-700">{aset.idBarang}</div>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 space-y-6">
          {/* Identitas Aset */}
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 p-6">
            <h3 className="text-base font-semibold text-slate-800 dark:text-slate-100 mb-6 flex items-center gap-2 pb-4 border-b border-slate-100 dark:border-slate-700">
              <Info className="h-5 w-5 text-slate-400" />
              Identitas Aset
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-6 gap-x-8">
              <div>
                <div className="text-xs text-slate-400 mb-1">Kode Aset</div>
                <div className="text-sm font-semibold text-blue-700">{aset.idBarang}</div>
              </div>
              <div>
                <div className="text-xs text-slate-400 mb-1">No. Inventaris</div>
                <div className="text-sm font-medium text-slate-800 dark:text-slate-200">
                  {aset.noInventaris}
                </div>
              </div>
              <div>
                <div className="text-xs text-slate-400 mb-1">Unit</div>
                <div className="text-sm font-medium text-slate-800 dark:text-slate-200">
                  {aset.lokasiRuangan}
                </div>
              </div>
              <div>
                <div className="text-xs text-slate-400 mb-1">Lokasi</div>
                <div className="text-sm font-medium text-slate-800 dark:text-slate-200">
                  {aset.lokasi}
                </div>
              </div>
            </div>
          </div>

          {/* Spesifikasi */}
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 p-6">
            <h3 className="text-base font-semibold text-slate-800 dark:text-slate-100 mb-6 flex items-center gap-2 pb-4 border-b border-slate-100 dark:border-slate-700">
              <Monitor className="h-5 w-5 text-slate-400" />
              Spesifikasi
            </h3>

            <div className="mb-6">
              <div className="text-xs text-slate-400 mb-1">Model Spesifikasi</div>
              <div className="text-sm font-medium text-slate-800 dark:text-slate-200">
                {aset.spesifikasi}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-700 rounded-lg p-4">
                <div className="text-xs text-slate-400 mb-1">Serial Number</div>
                <div className="text-sm font-medium text-slate-800 dark:text-slate-200">
                  {aset.serialNumber}
                </div>
              </div>
              <div className="bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-700 rounded-lg p-4">
                <div className="text-xs text-slate-400 mb-1">Tahun Beli</div>
                <div className="text-sm font-medium text-slate-800 dark:text-slate-200">
                  {aset.tahunBeli}
                </div>
              </div>
              <div className="bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-700 rounded-lg p-4">
                <div className="text-xs text-slate-400 mb-1">Garansi S/D</div>
                <div className="text-sm font-medium text-slate-800 dark:text-slate-200">
                  {aset.garansi}
                </div>
              </div>
            </div>
          </div>

          {/* Keterangan */}
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 p-6">
            <h3 className="text-base font-semibold text-slate-800 dark:text-slate-100 mb-4">
              Keterangan
            </h3>
            <div className="p-4 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-700 rounded-lg text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              {aset.keterangan}
            </div>
          </div>
        </div>

        {/* Riwayat Mutasi Aset */}
        <div>
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 p-6 h-full">
            <h3 className="text-base font-semibold text-slate-800 dark:text-slate-100 mb-1">
              Riwayat Mutasi Aset
            </h3>
            <p className="text-xs text-slate-400 mb-6">
              Catatan perubahan lokasi, kondisi, dan status
            </p>

            {aset.riwayatMutasi && aset.riwayatMutasi.length > 0 ? (
              /* Timeline View (Ada data mutasi) */
              <div className="relative border-l-2 border-slate-200 dark:border-slate-700 ml-3 mt-4 space-y-6 pb-2">
                {aset.riwayatMutasi.map((item) => (
                  <div key={item.id} className="relative pl-6">
                    <div
                      className={`absolute -left-[9px] top-1 w-4 h-4 bg-white dark:bg-slate-800 border-2 rounded-full ${
                        item.isLatest ? "border-blue-600" : "border-slate-300 dark:border-slate-600"
                      }`}
                    ></div>
                    <div className="bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-700 rounded-lg p-4">
                      <div className="flex justify-between items-start mb-2">
                        <span
                          className={`text-xs font-semibold ${
                            item.isLatest ? "text-blue-700" : "text-slate-500"
                          }`}
                        >
                          {item.tanggal}
                        </span>
                        <Badge variant="primary" size="sm">
                          {item.tipe}
                        </Badge>
                      </div>
                      <h4 className="text-sm font-semibold text-slate-800 dark:text-slate-200 mb-2">
                        {item.judul}
                      </h4>

                      {/* Details per tipe */}
                      {item.details && (
                        <div className="text-xs text-slate-500 dark:text-slate-400 mb-3 space-y-1">
                          {item.details.map((d, idx) => (
                            <div key={idx}>
                              {d.label}:{" "}
                              <span className="text-slate-700 dark:text-slate-300">{d.val}</span>
                            </div>
                          ))}
                        </div>
                      )}

                      {item.kondisi && (
                        <div className="text-xs text-slate-600 dark:text-slate-300 mb-2 space-y-1">
                          <div>
                            Kondisi:{" "}
                            <span className="font-medium text-slate-800 dark:text-slate-200">
                              {item.kondisi}
                            </span>
                          </div>
                          <div>
                            Status:{" "}
                            <span className="font-medium text-slate-800 dark:text-slate-200">
                              {item.status}
                            </span>
                          </div>
                        </div>
                      )}

                      {item.catatan && (
                        <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">
                          {item.catatan}
                        </p>
                      )}

                      {item.statusKondisi && (
                        <div className="text-xs font-medium text-slate-700 dark:text-slate-300 mb-3">
                          {item.statusKondisi}
                        </div>
                      )}

                      <div className="text-xs text-slate-500 dark:text-slate-400 space-y-1 border-t border-slate-200 dark:border-slate-700 pt-2">
                        {item.noInventaris && (
                          <div>
                            No. Inventaris:{" "}
                            <span className="font-medium text-slate-700 dark:text-slate-300">
                              {item.noInventaris}
                            </span>
                          </div>
                        )}
                        <div>
                          Oleh:{" "}
                          <span className="font-medium text-slate-700 dark:text-slate-300">
                            {item.oleh}
                          </span>
                        </div>
                      </div>
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
                    <div className="text-sm font-bold tracking-tight">3/1/1/6/2021</div>
                    <div className="text-[10px] text-slate-400 font-semibold tracking-wider">
                      INVENTARIS ASET TIK
                    </div>
                    <div className="h-px bg-slate-200 my-2.5"></div>

                    <div className="space-y-2 text-xs">
                      <div>
                        <div className="text-[9px] text-slate-400 uppercase font-semibold">
                          NAMA BARANG
                        </div>
                        <div className="font-semibold text-slate-800 leading-tight">
                          {aset.nama}
                        </div>
                      </div>
                      <div>
                        <div className="text-[9px] text-slate-400 uppercase font-semibold">
                          LOKASI RUANGAN
                        </div>
                        <div className="font-semibold text-slate-800 leading-tight">
                          {aset.lokasiRuangan}
                        </div>
                      </div>
                      <div>
                        <div className="text-[9px] text-slate-400 uppercase font-semibold">
                          STATUS
                        </div>
                        <div className="font-semibold text-slate-800 leading-tight">
                          {aset.statusPenggunaan}
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
                onClick={() => window.print()}
                className="gap-2 px-4 py-2 dark:bg-slate-800 dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-700 text-sm font-medium"
              >
                <Printer className="h-4 w-4" /> Cetak
              </Button>
              <Button
                type="button"
                variant="default"
                onClick={() => {
                  alert("Label berhasil diunduh!");
                  setIsPreviewLabelOpen(false);
                }}
                className="gap-2 px-4 py-2 text-sm font-medium"
              >
                <Download className="h-4 w-4" /> Unduh
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
