import { useEffect, useRef, useState } from "react";
import { IconAlertCircle, IconCalendar } from "@tabler/icons-react";
import { DayPicker, type DateRange } from "react-day-picker";
import { format, parseISO } from "date-fns";
import { id } from "date-fns/locale";
import "react-day-picker/style.css";

type DateRangeValue = {
  start: string;
  end: string;
};

export interface DateInputProps {
  // Props untuk mode date dan datetime
  value?: string;
  onChange?: (value: string) => void;

  variant?: "date" | "datetime" | "range";

  // Props khusus untuk mode range
  startValue?: string;
  endValue?: string;
  onRangeChange?: (range: DateRangeValue) => void;

  required?: boolean;
  error?: string;
  disabled?: boolean;
}

function toDate(value?: string): Date | undefined {
  if (!value) return undefined;

  const parsed = parseISO(value);
  return Number.isNaN(parsed.getTime()) ? undefined : parsed;
}

function toInputValue(date?: Date): string {
  return date ? format(date, "yyyy-MM-dd") : "";
}

function formatDateLabel(value?: string): string {
  const date = toDate(value);
  return date ? format(date, "dd MMM yyyy", { locale: id }) : "";
}

export default function DateInput({
  value = "",
  onChange,
  variant = "date",
  startValue = "",
  endValue = "",
  onRangeChange,
  required = false,
  error,
  disabled = false,
}: DateInputProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [draftRange, setDraftRange] = useState<DateRange | undefined>(undefined);

  const wrapperRef = useRef<HTMLDivElement>(null);

  // Klik di luar kalender hanya menutupnya, tidak menerapkan pilihan.
  useEffect(() => {
    function handleOutsideClick(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleOutsideClick);

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, []);

  // Mode range: satu kotak input dan kalender rentang.
  if (variant === "range") {
    const displayValue =
      startValue && endValue
        ? `${formatDateLabel(startValue)} – ${formatDateLabel(endValue)}`
        : startValue
          ? `${formatDateLabel(startValue)} – Pilih tanggal akhir`
          : endValue
            ? `Sampai ${formatDateLabel(endValue)}`
            : "";

    const canApply = !draftRange?.from || !!draftRange?.to;

    return (
      <div className="relative w-64" ref={wrapperRef}>
        <div className="relative">
          <div className="pointer-events-none absolute inset-y-0 left-0 z-10 flex items-center pl-4">
            <IconCalendar size={17} strokeWidth={1.8} className="text-text-secondary" />
          </div>

          <button
            type="button"
            onClick={() => {
              if (!isOpen) {
                setDraftRange(
                  startValue || endValue
                    ? {
                        from: toDate(startValue),
                        to: toDate(endValue),
                      }
                    : undefined,
                );
              }

              setIsOpen((open) => !open);
            }}
            aria-expanded={isOpen}
            className={`
              flex h-10 w-full items-center rounded-md bg-button
              pl-11 pr-3 text-left text-sm outline-none
              ${displayValue ? "text-text-primary" : "text-text-secondary"}
              ${error ? "border border-red-400" : "border border-transparent"}
            `}
          >
            <span className="truncate">{displayValue || "Pilih rentang tanggal"}</span>
          </button>
        </div>

        {isOpen && (
          <div
            className="
              absolute left-0 top-12 z-50
              rounded-lg border border-gray-200
              bg-white p-2 text-gray-800 shadow-lg
            "
          >
            <DayPicker
              mode="range"
              selected={draftRange}
              onSelect={setDraftRange}
              numberOfMonths={1}
              pagedNavigation
              showOutsideDays
              locale={id}
              className="date-range-calendar"
              disabled={{ before: new Date(2000, 0, 1) }}
            />

            <div className="mt-3 flex items-center justify-between gap-3 border-t border-gray-200 pt-3">
              <button
                type="button"
                onClick={() => setDraftRange(undefined)}
                className="text-xs text-gray-600 hover:text-gray-900"
              >
                Hapus pilihan
              </button>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="
                    rounded-md px-3 py-1.5 text-xs text-gray-600
                    hover:bg-gray-100
                  "
                >
                  Batal
                </button>

                <button
                  type="button"
                  disabled={!canApply}
                  onClick={() => {
                    onRangeChange?.({
                      start: toInputValue(draftRange?.from),
                      end: toInputValue(draftRange?.to),
                    });

                    setIsOpen(false);
                  }}
                  className="
                    rounded-md bg-blue-600 px-3 py-1.5 text-xs
                    font-medium text-white hover:bg-blue-700
                    disabled:cursor-not-allowed disabled:opacity-40
                  "
                >
                  Terapkan
                </button>
              </div>
            </div>
          </div>
        )}

        {error && (
          <small className="mt-1 flex items-center gap-1 text-xs font-normal text-danger-500">
            <IconAlertCircle size={14} strokeWidth={2} />
            <span>{error}</span>
          </small>
        )}
      </div>
    );
  }

  // Mode date dan datetime lama, tetap menggunakan input bawaan.
  const inputType = variant === "datetime" ? "datetime-local" : "date";

  return (
    <div className="relative w-50">
      <div className="relative">
        <div className="pointer-events-none absolute inset-y-0 left-0 z-10 flex items-center pl-4">
          <IconCalendar size={17} strokeWidth={1.8} className="text-text-secondary" />
        </div>

        <input
          type={inputType}
          value={value}
          required={required}
          disabled={disabled}
          onChange={(event) => onChange?.(event.target.value)}
          className={`
            h-10 w-full cursor-pointer rounded-md border-0 bg-button
            pl-11 pr-3 text-sm text-text-secondary outline-none
            focus:ring-0
            ${
              error
                ? "border-red-400 focus:border-red-400 focus:ring-red-100"
                : "border-transparent focus:border-primary focus:ring-primary/10"
            }
            [&::-webkit-calendar-picker-indicator]:absolute
            [&::-webkit-calendar-picker-indicator]:right-0
            [&::-webkit-calendar-picker-indicator]:h-full
            [&::-webkit-calendar-picker-indicator]:w-full
            [&::-webkit-calendar-picker-indicator]:opacity-0
          `}
        />
      </div>

      {error && (
        <small className="mt-1 flex items-center gap-1 text-xs font-normal text-danger-500">
          <IconAlertCircle size={14} strokeWidth={2} />
          <span>{error}</span>
        </small>
      )}
    </div>
  );
}
