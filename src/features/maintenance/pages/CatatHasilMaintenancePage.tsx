import { useState, useRef, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  IconArrowLeft,
  IconAlertCircle,
  IconPhoto,
  IconChevronDown,
  IconX,
} from "@tabler/icons-react";
import { maintenanceService } from "../services/maintenanceService";
import type { MaintenanceItem } from "../types/maintenance.types";
import { useToast } from "@/components/ui/ui-template/UseToast";

export default function CatatHasilMaintenancePage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [, setItem] = useState<MaintenanceItem | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form Fields
  const [uraianPekerjaan, setUraianPekerjaan] = useState("");
  const [hasilPemeliharaan, setHasilPemeliharaan] = useState("");
  const [kondisiPasca, setKondisiPasca] = useState<"" | "Baik" | "Rusak Ringan" | "Rusak Berat">(
    "",
  );
  const [waktuMulai, setWaktuMulai] = useState("");
  const [waktuSelesai, setWaktuSelesai] = useState("");
  const [fotoFile, setFotoFile] = useState<File | null>(null);

  // Error States
  const [errors, setErrors] = useState<{
    uraianPekerjaan?: string;
    hasilPemeliharaan?: string;
    kondisiPasca?: string;
    waktuMulai?: string;
    waktuSelesai?: string;
    fotoFile?: string;
  }>({});

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

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

  const handleFileChange = (file: File | null) => {
    if (!file) return;

    // Max 5MB (5 * 1024 * 1024 bytes)
    const MAX_SIZE = 5 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      setErrors((prev) => ({
        ...prev,
        fotoFile: "Foto hasil wajib diunggah dengan ukuran maksimal 5 MB !",
      }));
      setFotoFile(null);
      return;
    }

    setFotoFile(file);
    setErrors((prev) => ({ ...prev, fotoFile: undefined }));
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileChange(e.dataTransfer.files[0]);
    }
  };

  const validate = (): boolean => {
    const newErrors: typeof errors = {};

    if (!uraianPekerjaan.trim()) {
      newErrors.uraianPekerjaan = "Uraian pekerjaan wajib diisi!";
    }

    if (!hasilPemeliharaan.trim()) {
      newErrors.hasilPemeliharaan = "Hasil pemeliharaan wajib diisi!";
    }

    if (!kondisiPasca) {
      newErrors.kondisiPasca = "Kondisi pasca pemeliharaan wajib diisi!";
    }

    if (!waktuMulai) {
      newErrors.waktuMulai = "Waktu mulai wajib diisi!";
    }

    if (!waktuSelesai) {
      newErrors.waktuSelesai = "Waktu selesai wajib diisi!";
    } else if (waktuMulai && new Date(waktuSelesai) <= new Date(waktuMulai)) {
      newErrors.waktuSelesai = "Waktu selesai tidak boleh lebih awal dari waktu mulai!";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate() || !id) return;

    setIsSubmitting(true);
    try {
      // Format timestamps for backend: YYYY-MM-DD HH:mm:ss
      const formatToSqlDateTime = (val: string) => {
        const d = new Date(val);
        if (isNaN(d.getTime())) return val;
        const pad = (n: number) => String(n).padStart(2, "0");
        return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:00`;
      };

      await maintenanceService.recordMaintenanceLog(id, {
        work_description: uraianPekerjaan,
        maintenance_result: hasilPemeliharaan,
        post_maintenance_condition: kondisiPasca as "Baik" | "Rusak Ringan" | "Rusak Berat",
        started_at: formatToSqlDateTime(waktuMulai),
        completed_at: formatToSqlDateTime(waktuSelesai),
        photo: fotoFile,
      });

      // Redirect to detail page with success state
      navigate(`/maintenance/${id}`, {
        state: { successMessage: "Hasil maintenance berhasil dicatat!" },
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Gagal mencatat hasil maintenance.";
      showToast(msg, "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-96 items-center justify-center text-xs text-gray-400">
        Memuat form pencatatan...
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-6 md:px-8 space-y-4">
      {/* Header with back button */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="flex h-9 w-9 items-center justify-center rounded-lg text-gray-700 transition hover:bg-gray-100 active:scale-95 dark:text-slate-200 dark:hover:bg-slate-800"
          title="Kembali"
        >
          <IconArrowLeft size={22} strokeWidth={2} />
        </button>
        <h1 className="text-lg font-bold text-gray-800 dark:text-slate-100">Catat Hasil</h1>
      </div>

      {/* Form Container Card */}
      <div className="rounded-2xl border border-gray-200 bg-white p-6 md:p-8 shadow-sm transition dark:border-slate-800 dark:bg-slate-900">
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* URAIAN PEKERJAAN */}
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-slate-200">
              Uraian Pekerjaan <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={uraianPekerjaan}
              onChange={(e) => {
                setUraianPekerjaan(e.target.value);
                if (errors.uraianPekerjaan) {
                  setErrors((prev) => ({ ...prev, uraianPekerjaan: undefined }));
                }
              }}
              placeholder="Contoh: Pemeriksaan oli, filter, dan uji beban 30 menit"
              className={`mt-1.5 h-10 w-full rounded-lg border px-4 text-xs text-gray-800 placeholder-gray-400 outline-none transition focus:border-[#003178] dark:bg-slate-800 dark:text-slate-100 ${
                errors.uraianPekerjaan
                  ? "border-red-500 bg-red-50/10 focus:border-red-500"
                  : "border-gray-200 dark:border-slate-700"
              }`}
            />
            {errors.uraianPekerjaan && (
              <p className="mt-1.5 flex items-center gap-1 text-[11px] font-medium text-red-500">
                <IconAlertCircle size={14} className="shrink-0" />
                <span>{errors.uraianPekerjaan}</span>
              </p>
            )}
          </div>

          {/* HASIL PEMELIHARAAN */}
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-slate-200">
              Hasil Pemeliharaan <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={hasilPemeliharaan}
              onChange={(e) => {
                setHasilPemeliharaan(e.target.value);
                if (errors.hasilPemeliharaan) {
                  setErrors((prev) => ({ ...prev, hasilPemeliharaan: undefined }));
                }
              }}
              placeholder="Contoh: Genset berfungsi normal"
              className={`mt-1.5 h-10 w-full rounded-lg border px-4 text-xs text-gray-800 placeholder-gray-400 outline-none transition focus:border-[#003178] dark:bg-slate-800 dark:text-slate-100 ${
                errors.hasilPemeliharaan
                  ? "border-red-500 bg-red-50/10 focus:border-red-500"
                  : "border-gray-200 dark:border-slate-700"
              }`}
            />
            {errors.hasilPemeliharaan && (
              <p className="mt-1.5 flex items-center gap-1 text-[11px] font-medium text-red-500">
                <IconAlertCircle size={14} className="shrink-0" />
                <span>{errors.hasilPemeliharaan}</span>
              </p>
            )}
          </div>

          {/* KONDISI PASCA PEMELIHARAAN */}
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-slate-200">
              Kondisi Pasca Pemeliharaan <span className="text-red-500">*</span>
            </label>
            <div className="relative mt-1.5">
              <select
                value={kondisiPasca}
                onChange={(e) => {
                  setKondisiPasca(e.target.value as "" | "Baik" | "Rusak Ringan" | "Rusak Berat");
                  if (errors.kondisiPasca) {
                    setErrors((prev) => ({ ...prev, kondisiPasca: undefined }));
                  }
                }}
                className={`h-10 w-full appearance-none rounded-lg border bg-white px-4 pr-10 text-xs text-gray-800 outline-none transition focus:border-[#003178] dark:bg-slate-800 dark:text-slate-100 ${
                  errors.kondisiPasca
                    ? "border-red-500 bg-red-50/10 focus:border-red-500"
                    : "border-gray-200 dark:border-slate-700"
                } ${!kondisiPasca ? "text-gray-400 dark:text-slate-500" : ""}`}
              >
                <option value="" disabled>
                  Pilih kondisi
                </option>
                <option value="Baik">Baik</option>
                <option value="Rusak Ringan">Rusak Ringan</option>
                <option value="Rusak Berat">Rusak Berat</option>
              </select>
              <IconChevronDown
                size={16}
                className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400"
              />
            </div>
            {errors.kondisiPasca && (
              <p className="mt-1.5 flex items-center gap-1 text-[11px] font-medium text-red-500">
                <IconAlertCircle size={14} className="shrink-0" />
                <span>{errors.kondisiPasca}</span>
              </p>
            )}
          </div>

          {/* TWO COLUMNS: WAKTU MULAI & WAKTU SELESAI */}
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            {/* WAKTU MULAI */}
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-slate-200">
                Waktu Mulai <span className="text-red-500">*</span>
              </label>
              <div className="relative mt-1.5">
                <input
                  type="datetime-local"
                  value={waktuMulai}
                  onChange={(e) => {
                    setWaktuMulai(e.target.value);
                    if (errors.waktuMulai) {
                      setErrors((prev) => ({ ...prev, waktuMulai: undefined }));
                    }
                  }}
                  className={`h-10 w-full rounded-lg border bg-white px-4 text-xs text-gray-800 outline-none transition focus:border-[#003178] dark:bg-slate-800 dark:text-slate-100 ${
                    errors.waktuMulai
                      ? "border-red-500 bg-red-50/10 focus:border-red-500"
                      : "border-gray-200 dark:border-slate-700"
                  } ${!waktuMulai ? "text-gray-400 dark:text-slate-500" : ""}`}
                />
              </div>
              {errors.waktuMulai && (
                <p className="mt-1.5 flex items-center gap-1 text-[11px] font-medium text-red-500">
                  <IconAlertCircle size={14} className="shrink-0" />
                  <span>{errors.waktuMulai}</span>
                </p>
              )}
            </div>

            {/* WAKTU SELESAI */}
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-slate-200">
                Waktu Selesai <span className="text-red-500">*</span>
              </label>
              <div className="relative mt-1.5">
                <input
                  type="datetime-local"
                  value={waktuSelesai}
                  onChange={(e) => {
                    setWaktuSelesai(e.target.value);
                    if (errors.waktuSelesai) {
                      setErrors((prev) => ({ ...prev, waktuSelesai: undefined }));
                    }
                  }}
                  className={`h-10 w-full rounded-lg border bg-white px-4 text-xs text-gray-800 outline-none transition focus:border-[#003178] dark:bg-slate-800 dark:text-slate-100 ${
                    errors.waktuSelesai
                      ? "border-red-500 bg-red-50/10 focus:border-red-500"
                      : "border-gray-200 dark:border-slate-700"
                  } ${!waktuSelesai ? "text-gray-400 dark:text-slate-500" : ""}`}
                />
              </div>
              {errors.waktuSelesai && (
                <p className="mt-1.5 flex items-center gap-1 text-[11px] font-medium text-red-500">
                  <IconAlertCircle size={14} className="shrink-0" />
                  <span>{errors.waktuSelesai}</span>
                </p>
              )}
            </div>
          </div>

          {/* FOTO HASIL PEMELIHARAAN */}
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-slate-200 mb-1.5 block">
              Foto Hasil Pemeliharaan
            </label>

            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`relative flex flex-col items-center justify-center rounded-2xl border-2 border-dashed p-8 text-center transition ${
                errors.fotoFile
                  ? "border-red-500 bg-red-50/10"
                  : isDragging
                    ? "border-[#003178] bg-blue-50/30"
                    : "border-blue-200 bg-[#f8faff] dark:border-slate-700 dark:bg-slate-800/40"
              }`}
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100 text-[#003178] dark:bg-slate-700 dark:text-blue-300 mb-3">
                <IconPhoto size={26} />
              </div>

              {fotoFile ? (
                <div className="flex items-center gap-3 bg-white dark:bg-slate-800 px-4 py-2 rounded-xl border border-gray-200 dark:border-slate-700 shadow-xs">
                  <span className="text-xs font-medium text-gray-800 dark:text-slate-200 truncate max-w-xs">
                    {fotoFile.name} ({(fotoFile.size / 1024).toFixed(0)} KB)
                  </span>
                  <button
                    type="button"
                    onClick={() => setFotoFile(null)}
                    className="p-1 text-gray-400 hover:text-red-500"
                    title="Hapus foto"
                  >
                    <IconX size={16} />
                  </button>
                </div>
              ) : (
                <>
                  <p className="text-xs text-gray-600 dark:text-slate-300">
                    Tarik & lepas file bukti kerusakan di sini, atau{" "}
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="font-semibold text-[#003178] hover:underline dark:text-blue-400 cursor-pointer"
                    >
                      Pilih Dokumen
                    </button>
                  </p>
                  <p className="mt-1 text-[11px] text-gray-400">
                    Format: JPG, PNG, atau PDF (Maks. 5MB)
                  </p>
                </>
              )}

              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,application/pdf"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    handleFileChange(e.target.files[0]);
                  }
                }}
                className="hidden"
              />
            </div>

            {errors.fotoFile && (
              <p className="mt-1.5 flex items-center gap-1 text-[11px] font-medium text-red-500">
                <IconAlertCircle size={14} className="shrink-0" />
                <span>{errors.fotoFile}</span>
              </p>
            )}
          </div>

          {/* SIMPAN BUTTON */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex h-11 w-full items-center justify-center rounded-xl bg-[#003178] text-xs font-semibold text-white shadow-sm transition hover:bg-[#00255c] active:scale-[0.99] disabled:opacity-50 cursor-pointer"
            >
              {isSubmitting ? "Menyimpan..." : "Simpan"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
