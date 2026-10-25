import { useEffect, useRef, useState, type FormEvent } from "react";
import {
  IconAlertCircle,
  IconCalendar,
  IconCheck,
  IconChevronDown,
  IconSearch,
  IconX,
} from "@tabler/icons-react";
import { maintenanceService, periodOptions } from "../services/maintenanceService";
import type {
  AssetMaintenanceOption,
  MaintenanceFormState,
  OfficerOption,
} from "../types/maintenance.types";
import { useToast } from "@/components/ui/ui-template/UseToast";

interface FormErrors {
  assetId?: string;
  periode?: string;
  tanggalJadwal?: string;
  petugasId?: string;
}

export default function TambahJadwalForm() {
  const { showToast } = useToast();

  // Form State
  const [form, setForm] = useState<MaintenanceFormState>({
    assetId: "",
    namaBarang: "",
    lokasiRuangan: "",
    lokasi: "",
    jenisPemeliharaan: "",
    periode: "",
    tanggalJadwal: "",
    petugasId: "",
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessAlert, setShowSuccessAlert] = useState(false);

  // Options State
  const [assets, setAssets] = useState<AssetMaintenanceOption[]>([]);
  const [officers, setOfficers] = useState<OfficerOption[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(true);

  // Dropdown UI States
  const [openDropdown, setOpenDropdown] = useState<"asset" | "periode" | "petugas" | null>(null);
  const [assetSearch, setAssetSearch] = useState("");
  const [officerSearch, setOfficerSearch] = useState("");

  const dropdownContainerRef = useRef<HTMLDivElement>(null);

  // Load Assets and Officers
  useEffect(() => {
    let isMounted = true;
    const loadOptions = async () => {
      try {
        setIsLoadingData(true);
        const [assetList, officerList] = await Promise.all([
          maintenanceService.getAssetOptions(),
          maintenanceService.getOfficerOptions(),
        ]);

        if (isMounted) {
          setAssets(assetList);
          setOfficers(officerList);
        }
      } catch (err) {
        console.error("Gagal memuat opsi form maintenance:", err);
      } finally {
        if (isMounted) {
          setIsLoadingData(false);
        }
      }
    };

    void loadOptions();

    return () => {
      isMounted = false;
    };
  }, []);

  // Handle outside click to close dropdowns
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

  // Handle Asset Selection
  const handleSelectAsset = (asset: AssetMaintenanceOption) => {
    setForm((prev) => ({
      ...prev,
      assetId: String(asset.id),
      namaBarang: asset.itemName,
      lokasiRuangan: asset.roomLocation,
      lokasi: asset.locationDetail,
    }));

    setErrors((prev) => ({ ...prev, assetId: undefined }));
    setOpenDropdown(null);
    setAssetSearch("");
  };

  // Handle Periode Selection
  const handleSelectPeriode = (val: string) => {
    setForm((prev) => ({ ...prev, periode: val }));
    setErrors((prev) => ({ ...prev, periode: undefined }));
    setOpenDropdown(null);
  };

  // Handle Officer Selection
  const handleSelectOfficer = (officer: OfficerOption) => {
    setForm((prev) => ({ ...prev, petugasId: String(officer.id) }));
    setErrors((prev) => ({ ...prev, petugasId: undefined }));
    setOpenDropdown(null);
    setOfficerSearch("");
  };

  // Submit Handler with Validation matching the screenshot
  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const newErrors: FormErrors = {};

    if (!form.assetId) {
      newErrors.assetId = "Aset wajib dipilih!";
    }
    if (!form.periode) {
      newErrors.periode = "Periode wajib dipilih!";
    }
    if (!form.tanggalJadwal) {
      newErrors.tanggalJadwal = "Tanggal jadwal wajib diisi!";
    }
    if (!form.petugasId) {
      newErrors.petugasId = "Petugas wajib dipilih!";
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) {
      return;
    }

    try {
      setIsSubmitting(true);

      const targetAsset = assets.find((a) => String(a.id) === form.assetId);
      const targetOfficer = officers.find((o) => String(o.id) === form.petugasId);

      await maintenanceService.createSchedule(
        {
          asset_id: Number(form.assetId),
          maintenance_type: form.jenisPemeliharaan.trim() || undefined,
          period: form.periode,
          scheduled_date: form.tanggalJadwal,
          officer_id: Number(form.petugasId),
        },
        {
          namaBarang: form.namaBarang,
          lokasiRuangan: form.lokasiRuangan,
          lokasi: form.lokasi,
          fullCode: targetAsset?.fullCode,
          petugasName: targetOfficer?.name,
        },
      );

      // Tampilkan banner sukses hijau sesuai screenshot 1
      setShowSuccessAlert(true);
      showToast("Jadwal maintenance berhasil disimpan!", "success");

      // Reset form fields
      setForm({
        assetId: "",
        namaBarang: "",
        lokasiRuangan: "",
        lokasi: "",
        jenisPemeliharaan: "",
        periode: "",
        tanggalJadwal: "",
        petugasId: "",
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Gagal menyimpan jadwal maintenance.";
      showToast(message, "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Selected labels
  const selectedAsset = assets.find((a) => String(a.id) === form.assetId);
  const selectedOfficer = officers.find((o) => String(o.id) === form.petugasId);

  // Filtered lists
  const filteredAssets = assets.filter((a) =>
    a.displayLabel.toLowerCase().includes(assetSearch.toLowerCase().trim()),
  );

  const filteredOfficers = officers.filter((o) =>
    o.displayLabel.toLowerCase().includes(officerSearch.toLowerCase().trim()),
  );

  return (
    <div ref={dropdownContainerRef} className="w-full space-y-4">
      {/* SUCCESS ALERT BANNER (Screenshot 1) */}
      {showSuccessAlert && (
        <div className="flex items-center justify-between rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2.5 text-xs font-medium text-emerald-800 transition dark:border-emerald-800/60 dark:bg-emerald-950/40 dark:text-emerald-300">
          <div className="flex items-center gap-2">
            <div className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500 text-white">
              <IconCheck size={13} strokeWidth={3} />
            </div>
            <span>Jadwal berhasil ditambahkan!</span>
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

      <form
        onSubmit={handleSubmit}
        className="rounded-2xl border border-gray-200 bg-white p-6 sm:p-8 dark:border-slate-800 dark:bg-slate-900 shadow-sm transition-colors space-y-5"
      >
        {/* 1. ASET * */}
        <div className="relative">
          <label className="block text-xs font-bold tracking-wider text-text-title uppercase mb-1.5">
            ASET <span className="text-red-500">*</span>
          </label>

          <button
            type="button"
            onClick={() => setOpenDropdown(openDropdown === "asset" ? null : "asset")}
            className={`flex h-11 w-full items-center justify-between rounded-lg border px-4 text-left text-sm transition ${
              errors.assetId
                ? "border-red-500 bg-white dark:bg-slate-900"
                : "border-gray-200 bg-white dark:border-slate-700 dark:bg-slate-900"
            }`}
          >
            <span
              className={`truncate ${
                selectedAsset ? "text-gray-800 dark:text-slate-100 font-medium" : "text-gray-400"
              }`}
            >
              {isLoadingData
                ? "Memuat data aset..."
                : selectedAsset
                  ? selectedAsset.displayLabel
                  : "Pilih Aset"}
            </span>
            <IconChevronDown
              size={18}
              className={`text-gray-400 transition-transform ${openDropdown === "asset" ? "rotate-180" : ""}`}
            />
          </button>

          {/* Asset Dropdown Menu */}
          {openDropdown === "asset" && (
            <div className="absolute left-0 right-0 top-full z-50 mt-1 max-h-64 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-xl dark:border-slate-700 dark:bg-slate-900">
              <div className="p-2 border-b border-gray-100 dark:border-slate-800">
                <div className="relative flex items-center">
                  <IconSearch size={16} className="absolute left-3 text-gray-400" />
                  <input
                    type="text"
                    value={assetSearch}
                    onChange={(e) => setAssetSearch(e.target.value)}
                    placeholder="Cari kode atau nama aset..."
                    className="w-full rounded-lg border border-gray-200 bg-gray-50 py-1.5 pl-9 pr-8 text-xs text-gray-800 outline-none focus:border-primary-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
                    autoFocus
                  />
                  {assetSearch && (
                    <button
                      type="button"
                      onClick={() => setAssetSearch("")}
                      className="absolute right-2.5 text-gray-400 hover:text-gray-600"
                    >
                      <IconX size={14} />
                    </button>
                  )}
                </div>
              </div>
              <div className="max-h-48 overflow-y-auto p-1">
                {filteredAssets.length === 0 ? (
                  <p className="py-4 text-center text-xs text-gray-400">
                    {assets.length === 0 ? "Belum ada aset tersedia" : "Aset tidak ditemukan"}
                  </p>
                ) : (
                  filteredAssets.map((asset) => (
                    <button
                      key={asset.id}
                      type="button"
                      onClick={() => handleSelectAsset(asset)}
                      className={`w-full rounded-lg px-3 py-2 text-left text-xs transition ${
                        String(asset.id) === form.assetId
                          ? "bg-primary-50 font-semibold text-primary-700 dark:bg-primary-950/40 dark:text-primary-300"
                          : "text-gray-700 hover:bg-gray-100 dark:text-slate-200 dark:hover:bg-slate-800"
                      }`}
                    >
                      <p className="font-medium">{asset.displayLabel}</p>
                      <p className="text-[11px] text-gray-400">
                        Ruang: {asset.roomLocation} | Lokasi: {asset.locationDetail}
                      </p>
                    </button>
                  ))
                )}
              </div>
            </div>
          )}

          {errors.assetId && (
            <div className="mt-1.5 flex items-center gap-1.5 text-xs text-red-500 font-normal">
              <IconAlertCircle size={15} />
              <span>{errors.assetId}</span>
            </div>
          )}
        </div>

        {/* 2. NAMA BARANG (Readonly / Auto-filled) */}
        <div>
          <label className="block text-xs font-bold tracking-wider text-text-title uppercase mb-1.5">
            NAMA BARANG
          </label>
          <input
            type="text"
            readOnly
            disabled
            value={form.namaBarang}
            placeholder="Terisi otomatis dari inventaris"
            className="h-11 w-full cursor-not-allowed rounded-lg border border-gray-200 bg-white px-4 text-sm text-gray-700 placeholder-gray-400 outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
          />
        </div>

        {/* 3. LOKASI RUANGAN (Readonly / Auto-filled) */}
        <div>
          <label className="block text-xs font-bold tracking-wider text-text-title uppercase mb-1.5">
            LOKASI RUANGAN
          </label>
          <input
            type="text"
            readOnly
            disabled
            value={form.lokasiRuangan}
            placeholder="Terisi otomatis dari inventaris"
            className="h-11 w-full cursor-not-allowed rounded-lg border border-gray-200 bg-white px-4 text-sm text-gray-700 placeholder-gray-400 outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
          />
        </div>

        {/* 4. LOKASI (Readonly / Auto-filled) */}
        <div>
          <label className="block text-xs font-bold tracking-wider text-text-title uppercase mb-1.5">
            LOKASI
          </label>
          <input
            type="text"
            readOnly
            disabled
            value={form.lokasi}
            placeholder="Terisi otomatis dari inventaris"
            className="h-11 w-full cursor-not-allowed rounded-lg border border-gray-200 bg-white px-4 text-sm text-gray-700 placeholder-gray-400 outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
          />
        </div>

        {/* 5. JENIS PEMELIHARAAN (Optional Input) */}
        <div>
          <label className="block text-xs font-bold tracking-wider text-text-title uppercase mb-1.5">
            JENIS PEMELIHARAAN
          </label>
          <input
            type="text"
            value={form.jenisPemeliharaan}
            onChange={(e) => setForm((prev) => ({ ...prev, jenisPemeliharaan: e.target.value }))}
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
                form.periode ? "text-gray-800 dark:text-slate-100 font-medium" : "text-gray-400"
              }`}
            >
              {form.periode || "Pilih periode"}
            </span>
            <IconChevronDown
              size={18}
              className={`text-gray-400 transition-transform ${openDropdown === "periode" ? "rotate-180" : ""}`}
            />
          </button>

          {/* Periode Dropdown Menu */}
          {openDropdown === "periode" && (
            <div className="absolute left-0 right-0 top-full z-50 mt-1 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-xl dark:border-slate-700 dark:bg-slate-900 p-1">
              {periodOptions.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => handleSelectPeriode(opt.value)}
                  className={`w-full rounded-lg px-3 py-2 text-left text-xs transition ${
                    form.periode === opt.value
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
              value={form.tanggalJadwal}
              onChange={(e) => {
                setForm((prev) => ({ ...prev, tanggalJadwal: e.target.value }));
                setErrors((prev) => ({ ...prev, tanggalJadwal: undefined }));
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
              errors.petugasId
                ? "border-red-500 bg-white dark:bg-slate-900"
                : "border-gray-200 bg-white dark:border-slate-700 dark:bg-slate-900"
            }`}
          >
            <span
              className={`truncate ${
                selectedOfficer ? "text-gray-800 dark:text-slate-100 font-medium" : "text-gray-400"
              }`}
            >
              {isLoadingData
                ? "Memuat data petugas..."
                : selectedOfficer
                  ? selectedOfficer.displayLabel
                  : "Pilih petugas"}
            </span>
            <IconChevronDown
              size={18}
              className={`text-gray-400 transition-transform ${openDropdown === "petugas" ? "rotate-180" : ""}`}
            />
          </button>

          {/* Petugas Dropdown Menu */}
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
                    {officers.length === 0
                      ? "Belum ada petugas tersedia"
                      : "Petugas tidak ditemukan"}
                  </p>
                ) : (
                  filteredOfficers.map((officer) => (
                    <button
                      key={officer.id}
                      type="button"
                      onClick={() => handleSelectOfficer(officer)}
                      className={`w-full rounded-lg px-3 py-2 text-left text-xs transition ${
                        String(officer.id) === form.petugasId
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

          {errors.petugasId && (
            <div className="mt-1.5 flex items-center gap-1.5 text-xs text-red-500 font-normal">
              <IconAlertCircle size={15} />
              <span>{errors.petugasId}</span>
            </div>
          )}
        </div>

        {/* 9. Tombol Simpan */}
        <div className="pt-2">
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full h-12 rounded-lg bg-[#003178] hover:bg-[#00255c] active:scale-[0.99] disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold text-sm transition shadow-sm flex items-center justify-center gap-2"
          >
            {isSubmitting ? "Menyimpan..." : "Simpan"}
          </button>
        </div>
      </form>
    </div>
  );
}
