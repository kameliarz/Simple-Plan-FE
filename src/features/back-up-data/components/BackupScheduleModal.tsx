import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type FormEvent,
  type RefObject,
} from "react";

import { createPortal } from "react-dom";
import { IconAlertCircle } from "@tabler/icons-react";

import Button from "@/components/ui/ui-template/Button";
import Dropdown from "@/components/ui/ui-template/Dropdown";

import { backupFrequencyOptions } from "../constants/backupOptions";

import type { BackupFrequency, BackupSchedule } from "../types/backup.types";

type ScheduleFormState = {
  status: string;
  frequency: string;
  dayOfWeek: string;
  dayOfMonth: string;
  time: string;
};

type ScheduleFormErrors = Partial<Record<keyof ScheduleFormState, string>>;

interface BackupScheduleModalProps {
  show: boolean;
  schedule: BackupSchedule;
  onClose: () => void;
  onSave: (schedule: BackupSchedule) => Promise<void>;
  anchorRef: RefObject<HTMLDivElement | null>;
}

type ScheduleContentProps = Omit<BackupScheduleModalProps, "show">;

type PopoverPosition = {
  top: number;
  left: number;
  width: number;
};

const emptyForm: ScheduleFormState = {
  status: "",
  frequency: "",
  dayOfWeek: "",
  dayOfMonth: "",
  time: "",
};

const statusOptions = [
  { value: "active", label: "Aktif" },
  { value: "inactive", label: "Nonaktif" },
];

const dayOptions = [
  { value: "0", label: "Minggu" },
  { value: "1", label: "Senin" },
  { value: "2", label: "Selasa" },
  { value: "3", label: "Rabu" },
  { value: "4", label: "Kamis" },
  { value: "5", label: "Jumat" },
  { value: "6", label: "Sabtu" },
];

const monthDayOptions = Array.from({ length: 28 }, (_, index) => ({
  value: String(index + 1),
  label: String(index + 1),
}));

const hourOptions = Array.from({ length: 24 }, (_, hour) => ({
  value: `${String(hour).padStart(2, "0")}:00`,
  label: `${String(hour).padStart(2, "0")}:00`,
}));

function BackupScheduleContent({ schedule, onClose, onSave, anchorRef }: ScheduleContentProps) {
  // ==========================================
  // STATES
  // ==========================================
  const [form, setForm] = useState<ScheduleFormState>(() => ({ ...emptyForm }));

  const [errors, setErrors] = useState<ScheduleFormErrors>({});

  const [saving, setSaving] = useState(false);
  const [submitError, setSubmitError] = useState("");

  const popoverRef = useRef<HTMLDivElement>(null);

  const [position, setPosition] = useState<PopoverPosition>({
    top: 0,
    left: 0,
    width: 465,
  });

  const [positionReady, setPositionReady] = useState(false);

  const isWeekly = form.frequency === "weekly";
  const isMonthly = form.frequency === "monthly";
  const isActive = form.status === "active";

  // ==========================================
  // RESPONSIVE POPOVER POSITION
  // ==========================================
  useLayoutEffect(() => {
    const updatePosition = () => {
      const anchor = anchorRef.current;
      const popover = popoverRef.current;

      if (!anchor || !popover) return;

      const rect = anchor.getBoundingClientRect();

      const vw = window.innerWidth;
      const vh = window.innerHeight;

      const margin = 12;
      const gap = 8;

      const isMobile = vw < 768;

      const width = Math.min(isMobile ? 224 : 465, vw - margin * 2);

      const left = Math.max(margin, Math.min(rect.right - width, vw - width - margin));

      const height = popover.offsetHeight;

      const below = vh - rect.bottom - gap - margin;
      const above = rect.top - gap - margin;

      const openAbove = height > below && above > below;

      const top = openAbove
        ? Math.max(margin, rect.top - gap - height)
        : Math.max(margin, Math.min(rect.bottom + gap, vh - height - margin));

      setPosition((previous) =>
        previous.top === top && previous.left === left && previous.width === width
          ? previous
          : { top, left, width },
      );

      setPositionReady(true);
    };

    // Tunggu frame layout pertama sebelum
    // memperbarui posisi popover.
    const frame = requestAnimationFrame(updatePosition);

    window.addEventListener("resize", updatePosition);
    window.addEventListener("scroll", updatePosition, true);

    const observer = new ResizeObserver(updatePosition);

    if (popoverRef.current) {
      observer.observe(popoverRef.current);
    }

    return () => {
      cancelAnimationFrame(frame);

      window.removeEventListener("resize", updatePosition);

      window.removeEventListener("scroll", updatePosition, true);

      observer.disconnect();
    };
  }, [anchorRef]);

  // ==========================================
  // CLOSE ON OUTSIDE CLICK / ESCAPE
  // ==========================================
  useEffect(() => {
    if (saving) return;

    const handleOutsideClick = (event: PointerEvent) => {
      const target = event.target as Node;

      if (popoverRef.current?.contains(target)) return;
      if (anchorRef.current?.contains(target)) return;

      onClose();
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("pointerdown", handleOutsideClick);

    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("pointerdown", handleOutsideClick);

      document.removeEventListener("keydown", handleEscape);
    };
  }, [saving, onClose, anchorRef]);

  // ==========================================
  // HANDLE CHANGE
  // ==========================================
  const handleChange = <K extends keyof ScheduleFormState>(key: K, value: ScheduleFormState[K]) => {
    setForm((previous) => ({
      ...previous,
      [key]: value,
    }));

    setErrors((previous) => ({
      ...previous,
      [key]: undefined,
    }));

    setSubmitError("");
  };

  // ==========================================
  // HANDLE FREQUENCY
  // ==========================================
  const handleFrequencyChange = (value: string) => {
    setForm((previous) => ({
      ...previous,
      frequency: value,
      dayOfWeek: "",
      dayOfMonth: "",
    }));

    setErrors((previous) => ({
      ...previous,
      frequency: undefined,
      dayOfWeek: undefined,
      dayOfMonth: undefined,
    }));

    setSubmitError("");
  };

  // ==========================================
  // VALIDATION
  // ==========================================
  const validateForm = (): boolean => {
    const newErrors: ScheduleFormErrors = {};

    if (!form.status) {
      newErrors.status = "Status wajib diisi!";
    }

    if (!form.frequency) {
      newErrors.frequency = "Frekuensi wajib diisi!";
    }

    if (isActive) {
      if (isWeekly && !form.dayOfWeek) {
        newErrors.dayOfWeek = "Hari wajib diisi!";
      }

      if (isMonthly && !form.dayOfMonth) {
        newErrors.dayOfMonth = "Tanggal wajib diisi!";
      }

      if (!form.time) {
        newErrors.time = "Jam wajib diisi!";
      }
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  // ==========================================
  // SUBMIT
  // ==========================================
  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (saving || !validateForm()) return;

    const nextSchedule: BackupSchedule = {
      enabled: isActive,
      frequency: form.frequency as BackupFrequency,
      dayOfWeek: form.dayOfWeek !== "" ? Number(form.dayOfWeek) : schedule.dayOfWeek,
      dayOfMonth: form.dayOfMonth !== "" ? Number(form.dayOfMonth) : schedule.dayOfMonth,
      time: form.time || schedule.time,
    };

    try {
      setSaving(true);
      setSubmitError("");

      await onSave(nextSchedule);
      onClose();
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : "Gagal menyimpan jadwal.");
    } finally {
      setSaving(false);
    }
  };

  // ==========================================
  // RENDER
  // ==========================================
  return createPortal(
    <div
      ref={popoverRef}
      role="dialog"
      aria-label="Pengaturan Back Up Otomatis"
      style={{
        top: position.top,
        left: position.left,
        width: position.width,
        visibility: positionReady ? "visible" : "hidden",
      }}
      className="
        fixed z-100
        max-h-[calc(100dvh-24px)]
        overflow-y-auto
        overscroll-contain
        rounded-xl border border-blue-100
        bg-white p-3 shadow-xl
        dark:border-slate-700
        dark:bg-slate-900
        md:overflow-visible md:p-4
      "
    >
      <form onSubmit={handleSubmit} noValidate>
        {/* TITLE */}
        <h2 className="mb-3 text-xs font-semibold text-slate-600 dark:text-slate-200 md:text-sm">
          Pengaturan Back Up Otomatis
        </h2>

        {/* GRID FORM */}
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          {/* STATUS */}
          <div className="flex min-w-0 flex-col gap-1">
            <label className="text-xs text-slate-400">
              Status <span className="text-red-500">*</span>
            </label>

            <Dropdown
              value={form.status}
              options={statusOptions}
              onChange={(value) => handleChange("status", value)}
              placeholder="Pilih status"
              error={errors.status}
              mobileSheet
              className="w-full"
            />
          </div>

          {/* FREKUENSI */}
          <div className="flex min-w-0 flex-col gap-1">
            <label className="text-xs text-slate-400">
              Frekuensi <span className="text-red-500">*</span>
            </label>

            <Dropdown
              value={form.frequency}
              options={backupFrequencyOptions}
              onChange={handleFrequencyChange}
              placeholder="Pilih frekuensi"
              error={errors.frequency}
              mobileSheet
              className="w-full"
            />
          </div>

          {/* HARI / TANGGAL */}
          <div className="flex min-w-0 flex-col gap-1">
            <label className="text-xs text-slate-400">
              {isMonthly ? "Tanggal" : "Hari"}

              {(isWeekly || isMonthly) && isActive && <span className="ml-1 text-red-500">*</span>}
            </label>

            {isMonthly ? (
              <Dropdown
                value={form.dayOfMonth}
                options={monthDayOptions}
                onChange={(value) => handleChange("dayOfMonth", value)}
                placeholder="Pilih tanggal"
                error={errors.dayOfMonth}
                mobileSheet
                className="w-full"
              />
            ) : (
              <Dropdown
                value={form.dayOfWeek}
                options={dayOptions}
                onChange={(value) => handleChange("dayOfWeek", value)}
                placeholder="Pilih hari"
                disabled={!isWeekly}
                error={errors.dayOfWeek}
                mobileSheet
                className="w-full"
              />
            )}
          </div>

          {/* JAM */}
          <div className="flex min-w-0 flex-col gap-1">
            <label className="text-xs text-slate-400">
              Jam
              {isActive && <span className="ml-1 text-red-500">*</span>}
            </label>

            <Dropdown
              value={form.time}
              options={hourOptions}
              onChange={(value) => handleChange("time", value)}
              placeholder="Pilih jam"
              error={errors.time}
              mobileSheet
              className="w-full"
            />
          </div>
        </div>

        {/* SUBMIT ERROR */}
        {submitError && (
          <div role="alert" className="mt-3 flex items-center gap-1 text-xs text-danger-500">
            <IconAlertCircle size={14} strokeWidth={2} className="shrink-0" />
            <span>{submitError}</span>
          </div>
        )}

        {/* FOOTER */}
        <div className="mt-4 flex justify-end gap-2">
          <Button
            type="button"
            label="Batal"
            variant="secondary"
            size="sm"
            onClick={onClose}
            disabled={saving}
            className="min-w-20"
          />

          <Button
            type="submit"
            label={saving ? "Menyimpan..." : "Simpan"}
            size="sm"
            disabled={saving}
            className="min-w-20"
          />
        </div>
      </form>
    </div>,
    document.body,
  );
}

// ==========================================
// WRAPPER
// ==========================================
export default function BackupScheduleModal({
  show,
  schedule,
  onClose,
  onSave,
  anchorRef,
}: BackupScheduleModalProps) {
  if (!show) return null;

  return (
    <BackupScheduleContent
      schedule={schedule}
      onClose={onClose}
      onSave={onSave}
      anchorRef={anchorRef}
    />
  );
}
