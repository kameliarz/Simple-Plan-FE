import { useEffect, useRef, useState, type FormEvent } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  IconAlertCircle,
  IconArrowLeft,
  IconCalendar,
  IconCheck,
  IconChevronDown,
  IconSearch,
  IconX,
} from "@tabler/icons-react";
import { maintenanceService, periodOptions } from "../services/maintenanceService";
import type { MaintenanceItem, OfficerOption } from "../types/maintenance.types";
import { useToast } from "@/components/ui/ui-template/UseToast";

interface FormErrors {
  periode?: string;
  tanggalJadwal?: string;
  petugas?: string;
}

export default function UbahJadwalMaintenancePage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [item, setItem] = useState<MaintenanceItem | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Form State
  const [jenisPemeliharaan, setJenisPemeliharaan] = useState("");
  const [periode, setPeriode] = useState("");
  const [tanggalJadwal, setTanggalJadwal] = useState("");
  const [petugas, setPetugas] = useState("");

  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessAlert, setShowSuccessAlert] = useState(false);

  // Dropdowns
  const [officers, setOfficers] = useState<OfficerOption[]>([]);
  const [openDropdown, setOpenDropdown] = useState<"periode" | "petugas" | null>(null);
  const [officerSearch, setOfficerSearch] = useState("");

  const dropdownContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const loadDetail = async () => {
      if (!id) return;
      setIsLoading(true);
      try {
        const [data, officerList] = await Promise.all([
          maintenanceService.getMaintenanceById(id),
          maintenanceService.getOfficerOptions(),
        ]);

        if (data) {
          setItem(data);
          setJenisPemeliharaan(data.jenisPemeliharaan || "");
          setPeriode(data.periode || "");
          setTanggalJadwal(data.tanggalJadwalRaw || "");
          setPetugas(data.petugas || "");
        }
        setOfficers(officerList);
      } catch (err) {
        console.error("Gagal memuat jadwal untuk diedit:", err);
      } finally {
        setIsLoading(false);
      }
    };

    void loadDetail();
  }, [id]);

  // Handle outside click
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (
        dropdownContainerRef.current &&
        !dropdownContainerRef.current.contains(e.target as Node)
      ) {
        setOpenDropdown(null);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  const handleSelectPeriode = (val: string) => {
    setPeriode(val);
    setErrors((p) => ({ ...p, periode: undefined }));
    setOpenDropdown(null);
  };

  const handleSelectOfficer = (officer: OfficerOption) => {
    setPetugas(officer.name);
    setErrors((p) => ({ ...p, petugas: undefined }));
    setOpenDropdown(null);
    setOfficerSearch("");
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!id) return;

    const newErrors: FormErrors = {};

    if (!periode) {
      newErrors.periode = "Periode wajib dipilih!";
    }
    if (!tanggalJadwal) {
      newErrors.tanggalJadwal = "Tanggal jadwal wajib diisi!";
    }
    if (!petugas) {
      newErrors.petugas = "Petugas wajib dipilih!";
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) {
      return;
    }

    try {
      setIsSubmitting(true);
      await maintenanceService.updateSchedule(id, {
        jenisPemeliharaan: jenisPemeliharaan.trim(),
        periode,
        tanggalJadwalRaw: tanggalJadwal,
        petugas,
      });

      setShowSuccessAlert(true);
      showToast("Jadwal berhasil diperbarui!", "success");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Gagal memperbarui jadwal.";
      showToast(message, "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredOfficers = officers.filter((o) =>
    o.displayLabel.toLowerCase().includes(officerSearch.toLowerCase().trim()),
  );

  if (isLoading) {
    return (
      <div className="flex h-96 items-center justify-center text-xs text-gray-400">
        Memuat data jadwal...
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
      {/* Header with back button */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => navigate(`/maintenance/${id}`)}
          className="flex h-9 w-9 items-center justify-center rounded-lg text-gray-700 transition hover:bg-gray-100 active:scale-95 dark:text-slate-200 dark:hover:bg-slate-800"
          title="Kembali"
        >
          <IconArrowLeft size={22} strokeWidth={2} />
        </button>
        <h1 className="text-xl font-bold text-gray-800 dark:text-slate-100">Ubah Jadwal</h1>
      </div>

      {showSuccessAlert && (
        <div className="flex items-center justify-between rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2.5 text-xs font-medium text-emerald-800 transition dark:border-emerald-800/60 dark:bg-emerald-950/40 dark:text-emerald-300">
          <div className="flex items-center gap-2">
            <div className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500 text-white">
              <IconCheck size={13} strokeWidth={3} />
            </div>
            <span>Jadwal berhasil diperbarui!</span>
          </div>
          <button
            type="button"
            onClick={() => setShowSuccessAlert(false)}
            className="text-emerald-600 hover:text-emerald-900 dark:text-emerald-400 dark:hover:text-emerald-200"
          >
            <IconX size={16} />
          </button>
        </div>
      )}

      {/* FORM CARD */}
      <div ref={dropdownContainerRef} className="w-full">
        <form
          onSubmit={handleSubmit}
          className="rounded-2xl border border-gray-200 bg-white p-6 sm:p-8 dark:border-slate-800 dark:bg-slate-900 shadow-sm transition-colors space-y-5"
        >
          {/* 1. ASET * (Read-only input in edit mode) */}
          <div>
            <label className="block text-xs font-bold tracking-wider text-text-title uppercase mb-1.5">
              ASET <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              readOnly
              disabled
              value={item.namaBarang}
              className="h-11 w-full rounded-lg border border-gray-200 bg-white px-4 text-sm text-gray-700 outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
            />
          </div>

          {/* 2. NAMA BARANG (Readonly) */}
          <div>
            <label className="block text-xs font-bold tracking-wider text-text-title uppercase mb-1.5">
              NAMA BARANG
            </label>
            <input
              type="text"
              readOnly
              disabled
              value={item.namaBarang}
              className="h-11 w-full rounded-lg border border-gray-200 bg-white px-4 text-sm text-gray-700 outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
            />
          </div>

          {/* 3. LOKASI RUANGAN (Readonly) */}
          <div>
            <label className="block text-xs font-bold tracking-wider text-text-title uppercase mb-1.5">
              LOKASI RUANGAN
            </label>
            <input
              type="text"
              readOnly
              disabled
              value={item.lokasi || "Gedung Ruangan A"}
              className="h-11 w-full rounded-lg border border-gray-200 bg-white px-4 text-sm text-gray-700 outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
            />
          </div>

          {/* 4. LOKASI (Readonly) */}
          <div>
            <label className="block text-xs font-bold tracking-wider text-text-title uppercase mb-1.5">
              LOKASI
            </label>
            <input
              type="text"
              readOnly
              disabled
              value={item.lokasiRuangan || "Ruang Konsultasi Dokter 03"}
              className="h-11 w-full rounded-lg border border-gray-200 bg-white px-4 text-sm text-gray-700 outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
            />
          </div>

          {/* 5. JENIS PEMELIHARAAN */}
          <div>
            <label className="block text-xs font-bold tracking-wider text-text-title uppercase mb-1.5">
              JENIS PEMELIHARAAN
            </label>
            <input
              type="text"
              value={jenisPemeliharaan}
              onChange={(e) => setJenisPemeliharaan(e.target.value)}
              placeholder="Contoh: Pembersihan perangkat"
              className="h-11 w-full rounded-lg border border-gray-200 bg-white px-4 text-sm text-gray-800 placeholder-gray-400 outline-none transition focus:border-primary-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
            />
          </div>

          {/* 6. PERIODE * */}
          <div className="relative">
            <label className="block text-xs font-bold tracking-wider text-text-title uppercase mb-1.5">
              PERIODE <span className="text-red-500">*</span>
            </label>

            <button
              type="button"
              onClick={() => setOpenDropdown(openDropdown === "periode" ? null : "periode")}
              className={`flex h-11 w-full items-center justify-between rounded-lg border px-4 text-left text-sm transition ${
                errors.periode
                  ? "border-red-500 bg-white dark:bg-slate-900"
                  : "border-gray-200 bg-white dark:border-slate-700 dark:bg-slate-900"
              }`}
            >
              <span
                className={`truncate ${
                  periode ? "text-gray-800 dark:text-slate-100 font-medium" : "text-gray-400"
                }`}
              >
                {periode || "Pilih periode"}
              </span>
              <IconChevronDown
                size={18}
                className={`text-gray-400 transition-transform ${openDropdown === "periode" ? "rotate-180" : ""}`}
              />
            </button>

            {openDropdown === "periode" && (
              <div className="absolute left-0 right-0 top-full z-50 mt-1 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-xl dark:border-slate-700 dark:bg-slate-900 p-1">
                {periodOptions.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => handleSelectPeriode(opt.value)}
                    className={`w-full rounded-lg px-3 py-2 text-left text-xs transition ${
                      periode === opt.value
                        ? "bg-primary-50 font-semibold text-primary-700 dark:bg-primary-950/40 dark:text-primary-300"
                        : "text-gray-700 hover:bg-gray-100 dark:text-slate-200 dark:hover:bg-slate-800"
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            )}

            {errors.periode && (
              <div className="mt-1.5 flex items-center gap-1.5 text-xs text-red-500 font-normal">
                <IconAlertCircle size={15} />
                <span>{errors.periode}</span>
              </div>
            )}
          </div>

          {/* 7. TANGGAL JADWAL * */}
          <div>
            <label className="block text-xs font-bold tracking-wider text-text-title uppercase mb-1.5">
              TANGGAL JADWAL <span className="text-red-500">*</span>
            </label>

            <div className="relative">
              <input
                type="date"
                value={tanggalJadwal}
                onChange={(e) => {
                  setTanggalJadwal(e.target.value);
                  setErrors((p) => ({ ...p, tanggalJadwal: undefined }));
                }}
                placeholder="mm/dd/yyyy"
                className={`h-11 w-full rounded-lg border px-4 pr-10 text-sm text-gray-800 placeholder-gray-400 outline-none transition focus:border-primary-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 ${
                  errors.tanggalJadwal
                    ? "border-red-500 bg-white dark:bg-slate-900"
                    : "border-gray-200 bg-white dark:border-slate-700 dark:bg-slate-900"
                }`}
              />
              <IconCalendar
                size={18}
                className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400"
              />
            </div>

            {errors.tanggalJadwal && (
              <div className="mt-1.5 flex items-center gap-1.5 text-xs text-red-500 font-normal">
                <IconAlertCircle size={15} />
                <span>{errors.tanggalJadwal}</span>
              </div>
            )}
          </div>

          {/* 8. PETUGAS * */}
          <div className="relative">
            <label className="block text-xs font-bold tracking-wider text-text-title uppercase mb-1.5">
              PETUGAS <span className="text-red-500">*</span>
            </label>

            <button
              type="button"
              onClick={() => setOpenDropdown(openDropdown === "petugas" ? null : "petugas")}
              className={`flex h-11 w-full items-center justify-between rounded-lg border px-4 text-left text-sm transition ${
                errors.petugas
                  ? "border-red-500 bg-white dark:bg-slate-900"
                  : "border-gray-200 bg-white dark:border-slate-700 dark:bg-slate-900"
              }`}
            >
              <span
                className={`truncate ${
                  petugas ? "text-gray-800 dark:text-slate-100 font-medium" : "text-gray-400"
                }`}
              >
                {petugas || "Pilih petugas"}
              </span>
              <IconChevronDown
                size={18}
                className={`text-gray-400 transition-transform ${openDropdown === "petugas" ? "rotate-180" : ""}`}
              />
            </button>

            {openDropdown === "petugas" && (
              <div className="absolute left-0 right-0 top-full z-50 mt-1 max-h-64 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-xl dark:border-slate-700 dark:bg-slate-900">
                <div className="p-2 border-b border-gray-100 dark:border-slate-800">
                  <div className="relative flex items-center">
                    <IconSearch size={16} className="absolute left-3 text-gray-400" />
                    <input
                      type="text"
                      value={officerSearch}
                      onChange={(e) => setOfficerSearch(e.target.value)}
                      placeholder="Cari nama atau jabatan petugas..."
                      className="w-full rounded-lg border border-gray-200 bg-gray-50 py-1.5 pl-9 pr-8 text-xs text-gray-800 outline-none focus:border-primary-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
                      autoFocus
                    />
                    {officerSearch && (
                      <button
                        type="button"
                        onClick={() => setOfficerSearch("")}
                        className="absolute right-2.5 text-gray-400 hover:text-gray-600"
                      >
                        <IconX size={14} />
                      </button>
                    )}
                  </div>
                </div>
                <div className="max-h-48 overflow-y-auto p-1">
                  {filteredOfficers.length === 0 ? (
                    <p className="py-4 text-center text-xs text-gray-400">
                      Petugas tidak ditemukan
                    </p>
                  ) : (
                    filteredOfficers.map((officer) => (
                      <button
                        key={officer.id}
                        type="button"
                        onClick={() => handleSelectOfficer(officer)}
                        className={`w-full rounded-lg px-3 py-2 text-left text-xs transition ${
                          petugas === officer.name
                            ? "bg-primary-50 font-semibold text-primary-700 dark:bg-primary-950/40 dark:text-primary-300"
                            : "text-gray-700 hover:bg-gray-100 dark:text-slate-200 dark:hover:bg-slate-800"
                        }`}
                      >
                        <p className="font-medium text-gray-800 dark:text-slate-100">
                          {officer.name}
                        </p>
                        <p className="text-[11px] text-gray-400">{officer.role}</p>
                      </button>
                    ))
                  )}
                </div>
              </div>
            )}

            {errors.petugas && (
              <div className="mt-1.5 flex items-center gap-1.5 text-xs text-red-500 font-normal">
                <IconAlertCircle size={15} />
                <span>{errors.petugas}</span>
              </div>
            )}
          </div>

          {/* 9. Tombol Simpan Perubahan */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full h-12 rounded-lg bg-[#003178] hover:bg-[#00255c] active:scale-[0.99] disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold text-sm transition shadow-sm flex items-center justify-center gap-2"
            >
              {isSubmitting ? "Menyimpan Perubahan..." : "Simpan Perubahan"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
