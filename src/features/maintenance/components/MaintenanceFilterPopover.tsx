import { useState } from "react";
import { IconCalendar, IconChevronDown, IconX } from "@tabler/icons-react";
import type { MaintenanceFilterState } from "../types/maintenance.types";

interface MaintenanceFilterPopoverProps {
  isOpen: boolean;
  onClose: () => void;
  filters: MaintenanceFilterState;
  onApply: (filters: MaintenanceFilterState) => void;
  onReset: () => void;
}

const klasifikasiOptions = ["Semua klasifikasi", "Alat IT", "Alat Medis", "Sarpras"];
const lokasiOptions = [
  "Semua lokasi",
  "Ruang Konsultasi Dokter 03",
  "Poli Dalam",
  "Farmasi 2",
  "Ruang Server Lt.3",
  "Bed 4 UGD",
];
const petugasOptions = [
  "Semua petugas",
  "Ahmad Fauzi",
  "M. Hendra",
  "Rian P.",
  "Budi Santosa",
  "Hendra Wijaya, S.Kom",
];
const statusOptions = ["Semua status", "Terlambat", "Terjadwal", "Selesai"];

export default function MaintenanceFilterPopover({
  isOpen,
  onClose,
  filters,
  onApply,
  onReset,
}: MaintenanceFilterPopoverProps) {
  const [draft, setDraft] = useState<MaintenanceFilterState>({ ...filters });

  if (!isOpen) return null;

  const handleApply = () => {
    onApply(draft);
    onClose();
  };

  const handleReset = () => {
    const empty: MaintenanceFilterState = {
      klasifikasi: "Semua klasifikasi",
      lokasiRuangan: "Semua lokasi",
      petugas: "Semua petugas",
      status: "Semua status",
      rentangJadwal: "",
    };
    setDraft(empty);
    onReset();
    onClose();
  };

  return (
    <div className="absolute right-0 top-12 z-50 w-80 rounded-2xl border border-gray-200 bg-white p-5 shadow-2xl transition-all dark:border-slate-700 dark:bg-slate-900">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-gray-100 pb-3 dark:border-slate-800">
        <h3 className="text-sm font-semibold text-gray-800 dark:text-slate-100">
          Filter Maintenance
        </h3>
        <button
          type="button"
          onClick={onClose}
          className="rounded-md p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-slate-800 dark:hover:text-slate-200"
        >
          <IconX size={16} />
        </button>
      </div>

      {/* Filter Body */}
      <div className="space-y-3.5 py-4">
        {/* Klasifikasi */}
        <div>
          <label className="block text-xs font-semibold text-gray-700 dark:text-slate-300 mb-1">
            Klasifikasi
          </label>
          <div className="relative">
            <select
              value={draft.klasifikasi}
              onChange={(e) => setDraft((p) => ({ ...p, klasifikasi: e.target.value }))}
              className="h-10 w-full appearance-none rounded-lg border border-gray-200 bg-white px-3 pr-8 text-xs text-gray-800 outline-none focus:border-primary-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
            >
              {klasifikasiOptions.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
            <IconChevronDown
              size={16}
              className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400"
            />
          </div>
        </div>

        {/* Lokasi Ruangan */}
        <div>
          <label className="block text-xs font-semibold text-gray-700 dark:text-slate-300 mb-1">
            Lokasi Ruangan
          </label>
          <div className="relative">
            <select
              value={draft.lokasiRuangan}
              onChange={(e) => setDraft((p) => ({ ...p, lokasiRuangan: e.target.value }))}
              className="h-10 w-full appearance-none rounded-lg border border-gray-200 bg-white px-3 pr-8 text-xs text-gray-800 outline-none focus:border-primary-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
            >
              {lokasiOptions.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
            <IconChevronDown
              size={16}
              className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400"
            />
          </div>
        </div>

        {/* Petugas */}
        <div>
          <label className="block text-xs font-semibold text-gray-700 dark:text-slate-300 mb-1">
            Petugas
          </label>
          <div className="relative">
            <select
              value={draft.petugas}
              onChange={(e) => setDraft((p) => ({ ...p, petugas: e.target.value }))}
              className="h-10 w-full appearance-none rounded-lg border border-gray-200 bg-white px-3 pr-8 text-xs text-gray-800 outline-none focus:border-primary-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
            >
              {petugasOptions.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
            <IconChevronDown
              size={16}
              className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400"
            />
          </div>
        </div>

        {/* Status */}
        <div>
          <label className="block text-xs font-semibold text-gray-700 dark:text-slate-300 mb-1">
            Status
          </label>
          <div className="relative">
            <select
              value={draft.status}
              onChange={(e) => setDraft((p) => ({ ...p, status: e.target.value }))}
              className="h-10 w-full appearance-none rounded-lg border border-gray-200 bg-white px-3 pr-8 text-xs text-gray-800 outline-none focus:border-primary-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
            >
              {statusOptions.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
            <IconChevronDown
              size={16}
              className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400"
            />
          </div>
        </div>

        {/* Rentang Jadwal */}
        <div>
          <label className="block text-xs font-semibold text-gray-700 dark:text-slate-300 mb-1">
            Rentang Jadwal
          </label>
          <div className="relative">
            <input
              type="date"
              value={draft.rentangJadwal}
              onChange={(e) => setDraft((p) => ({ ...p, rentangJadwal: e.target.value }))}
              placeholder="mm/dd/yyyy"
              className="h-10 w-full rounded-lg border border-gray-200 bg-white px-3 pr-9 text-xs text-gray-800 outline-none focus:border-primary-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
            />
            <IconCalendar
              size={16}
              className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400"
            />
          </div>
        </div>
      </div>

      {/* Footer Actions */}
      <div className="flex items-center justify-end gap-2 border-t border-gray-100 pt-3 dark:border-slate-800">
        <button
          type="button"
          onClick={handleReset}
          className="rounded-lg border border-gray-200 px-4 py-2 text-xs font-medium text-gray-700 hover:bg-gray-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
        >
          Reset
        </button>
        <button
          type="button"
          onClick={handleApply}
          className="rounded-lg bg-[#003178] px-4 py-2 text-xs font-medium text-white hover:bg-[#00255c] transition shadow-sm"
        >
          Terapkan
        </button>
      </div>
    </div>
  );
}
