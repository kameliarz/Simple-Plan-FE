import { useEffect, useRef, useState } from "react";

import {
  IconAlertCircle,
  IconCalendar,
  IconChevronDown,
  IconChevronLeft,
  IconChevronRight,
} from "@tabler/icons-react";

import { DayPicker, type DateRange } from "react-day-picker";
import { format, parseISO } from "date-fns";
import { id } from "date-fns/locale";

import "react-day-picker/style.css";

type DateRangeValue = {
  start: string;
  end: string;
};

export interface DateInputProps {
  value?: string;
  onChange?: (value: string) => void;

  variant?: "date" | "datetime" | "range" | "month";

  startValue?: string;
  endValue?: string;
  onRangeChange?: (range: DateRangeValue) => void;

  required?: boolean;
  error?: string;
  disabled?: boolean;
  invalid?: boolean;
}

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"];

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

function formatMonthLabel(value: string): string {
  if (!/^\d{4}-(0[1-9]|1[0-2])$/.test(value)) {
    return "";
  }

  const [year, month] = value.split("-");

  return `${MONTHS[Number(month) - 1]} ${year}`;
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
  invalid = false,
}: DateInputProps) {
  const [isOpen, setIsOpen] = useState(false);

  const [draftRange, setDraftRange] = useState<DateRange | undefined>();

  const [displayYear, setDisplayYear] = useState(() => {
    const selectedYear = Number(value.slice(0, 4));

    return selectedYear || new Date().getFullYear();
  });

  const wrapperRef = useRef<HTMLDivElement>(null);

  // =====================================
  // CLOSE POPUP
  // =====================================

  useEffect(() => {
    if (!isOpen) return;

    function handleOutsideClick(event: PointerEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    }

    document.addEventListener("pointerdown", handleOutsideClick);

    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("pointerdown", handleOutsideClick);

      document.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen]);

  // =====================================
  // MONTH MODE
  // =====================================

  if (variant === "month") {
    const selectedMonth = value ? Number(value.slice(5, 7)) - 1 : -1;

    const selectedYear = value ? Number(value.slice(0, 4)) : null;

    const displayValue = formatMonthLabel(value);

    const handleOpen = () => {
      if (disabled) return;

      if (!isOpen) {
        setDisplayYear(selectedYear || new Date().getFullYear());
      }

      setIsOpen((current) => !current);
    };

    const handleMonthSelect = (monthIndex: number) => {
      const month = String(monthIndex + 1).padStart(2, "0");

      onChange?.(`${displayYear}-${month}`);
      setIsOpen(false);
    };

    const handleCurrentMonth = () => {
      const today = new Date();

      const year = today.getFullYear();
      const month = String(today.getMonth() + 1).padStart(2, "0");

      onChange?.(`${year}-${month}`);
      setDisplayYear(year);
      setIsOpen(false);
    };

    return (
      <div ref={wrapperRef} className="relative w-full min-w-0">
        {/* INPUT TRIGGER */}
        <button
          type="button"
          disabled={disabled}
          aria-expanded={isOpen}
          aria-haspopup="dialog"
          aria-label="Pilih bulan dan tahun"
          aria-required={required}
          aria-invalid={Boolean(error || invalid)}
          onClick={handleOpen}
          className={`
            flex h-10 w-full items-center
            justify-between gap-3
            rounded-lg border bg-button
            px-3 text-left text-sm
            transition-colors duration-150

            hover:border-primary-600/40
            focus:outline-none
            focus:ring-2 focus:ring-primary-600/15

            disabled:cursor-not-allowed
            disabled:opacity-50

            ${
              error || invalid
                ? "border-danger-500"
                : isOpen
                  ? "border-primary-600"
                  : "border-transparent"
            }
          `}
        >
          <span className="flex min-w-0 items-center gap-2.5">
            <IconCalendar size={18} strokeWidth={1.7} className="shrink-0 text-text-secondary" />

            <span
              className={`
                truncate
                ${displayValue ? "text-text-primary" : "text-text-secondary"}
              `}
            >
              {displayValue || "Pilih bulan dan tahun"}
            </span>
          </span>

          <IconChevronDown
            size={17}
            strokeWidth={1.8}
            className={`
              shrink-0 text-text-secondary
              transition-transform duration-200
              ${isOpen ? "rotate-180" : ""}
            `}
          />
        </button>

        {/* CUSTOM MONTH YEAR POPUP */}
        {isOpen && !disabled && (
          <div
            role="dialog"
            aria-label="Pilih bulan dan tahun"
            className="
              absolute left-0 top-full z-50
              mt-2 w-[min(280px,calc(100vw-2rem))]
              rounded-xl
              border border-med-border
              bg-table-card p-3
              shadow-xl
            "
          >
            {/* HEADER TAHUN */}
            <div
              className="
                mb-3 flex items-center
                justify-between gap-2
              "
            >
              <button
                type="button"
                aria-label="Tahun sebelumnya"
                disabled={displayYear <= 2000}
                onClick={() => setDisplayYear((year) => Math.max(2000, year - 1))}
                className="
                  flex h-8 w-8 items-center
                  justify-center rounded-lg
                  text-text-secondary
                  transition hover:bg-button
                  disabled:opacity-30
                "
              >
                <IconChevronLeft size={18} />
              </button>

              <span
                className="
                  text-sm font-semibold
                  text-text-primary
                "
              >
                {displayYear}
              </span>

              <button
                type="button"
                aria-label="Tahun berikutnya"
                disabled={displayYear >= 2100}
                onClick={() => setDisplayYear((year) => Math.min(2100, year + 1))}
                className="
                  flex h-8 w-8 items-center
                  justify-center rounded-lg
                  text-text-secondary
                  transition hover:bg-button
                  disabled:opacity-30
                "
              >
                <IconChevronRight size={18} />
              </button>
            </div>

            {/* MONTH GRID */}
            <div className="grid grid-cols-3 gap-1">
              {MONTHS.map((month, index) => {
                const isSelected = selectedMonth === index && selectedYear === displayYear;

                return (
                  <button
                    key={month}
                    type="button"
                    aria-pressed={isSelected}
                    onClick={() => handleMonthSelect(index)}
                    className={`
                      flex h-10 items-center justify-center
                      rounded-md text-sm transition-colors
                      ${
                        isSelected
                          ? "bg-primary-600 font-semibold text-white"
                          : "text-text-primary hover:bg-primary-600/5 hover:text-primary-600"
                      }
                    `}
                  >
                    {month}
                  </button>
                );
              })}
            </div>

            {/* FOOTER */}
            <div
              className="
                mt-3 flex items-center
                justify-between
                border-t border-med-border pt-3
              "
            >
              <button
                type="button"
                onClick={() => {
                  onChange?.("");
                  setIsOpen(false);
                }}
                className="
                  rounded-md px-2 py-1.5
                  text-xs font-medium
                  text-text-secondary
                  hover:bg-button
                "
              >
                Hapus
              </button>

              <button
                type="button"
                onClick={handleCurrentMonth}
                className="
                  rounded-md px-2 py-1.5
                  text-xs font-semibold
                  text-primary-600
                  hover:bg-primary-600/10
                "
              >
                Bulan ini
              </button>
            </div>
          </div>
        )}

        {error && (
          <small
            className="
              mt-1 flex items-center gap-1
              text-xs text-danger-500
            "
          >
            <IconAlertCircle size={14} />
            <span>{error}</span>
          </small>
        )}
      </div>
    );
  }

  // =====================================
  // RANGE MODE (EXISTING)
  // =====================================

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
          <div
            className="
              pointer-events-none absolute
              inset-y-0 left-0 z-10
              flex items-center pl-4
            "
          >
            <IconCalendar size={17} strokeWidth={1.8} className="text-text-secondary" />
          </div>

          <button
            type="button"
            disabled={disabled}
            aria-expanded={isOpen}
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
            className={`
              flex h-10 w-full items-center
              rounded-md bg-button
              pl-11 pr-3 text-left text-sm
              outline-none
              disabled:opacity-50

              ${displayValue ? "text-text-primary" : "text-text-secondary"}

              ${error ? "border border-red-400" : "border border-transparent"}
            `}
          >
            <span className="truncate">{displayValue || "Pilih rentang tanggal"}</span>
          </button>
        </div>

        {isOpen && !disabled && (
          <div
            className="
              absolute left-0 top-12 z-50
              max-w-[calc(100vw-2rem)]
              overflow-x-auto rounded-lg
              border border-gray-200
              bg-white p-2 text-gray-800
              shadow-lg
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
              disabled={{
                before: new Date(2000, 0, 1),
              }}
            />

            <div
              className="
                mt-3 flex items-center
                justify-between gap-3
                border-t border-gray-200 pt-3
              "
            >
              <button
                type="button"
                onClick={() => setDraftRange(undefined)}
                className="
                  text-xs text-gray-600
                  hover:text-gray-900
                "
              >
                Hapus pilihan
              </button>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="
                    rounded-md px-3 py-1.5
                    text-xs text-gray-600
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
                    rounded-md bg-blue-600
                    px-3 py-1.5 text-xs
                    font-medium text-white
                    hover:bg-blue-700
                    disabled:opacity-40
                  "
                >
                  Terapkan
                </button>
              </div>
            </div>
          </div>
        )}

        {error && (
          <small
            className="
              mt-1 flex items-center gap-1
              text-xs text-danger-500
            "
          >
            <IconAlertCircle size={14} />
            <span>{error}</span>
          </small>
        )}
      </div>
    );
  }

  // =====================================
  // DATE / DATETIME MODE (EXISTING)
  // =====================================

  const inputType = variant === "datetime" ? "datetime-local" : "date";

  return (
    <div className="relative w-50">
      <div className="relative">
        <div
          className="
            pointer-events-none absolute
            inset-y-0 left-0 z-10
            flex items-center pl-4
          "
        >
          <IconCalendar size={17} strokeWidth={1.8} className="text-text-secondary" />
        </div>

        <input
          type={inputType}
          value={value}
          required={required}
          disabled={disabled}
          onChange={(event) => onChange?.(event.target.value)}
          className={`
            h-10 w-full cursor-pointer
            rounded-md border-0 bg-button
            pl-11 pr-3 text-sm
            text-text-secondary outline-none
            focus:ring-0

            ${error ? "border-red-400" : "border-transparent"}

            [&::-webkit-calendar-picker-indicator]:absolute
            [&::-webkit-calendar-picker-indicator]:right-0
            [&::-webkit-calendar-picker-indicator]:h-full
            [&::-webkit-calendar-picker-indicator]:w-full
            [&::-webkit-calendar-picker-indicator]:opacity-0
          `}
        />
      </div>

      {error && (
        <small
          className="
            mt-1 flex items-center gap-1
            text-xs text-danger-500
          "
        >
          <IconAlertCircle size={14} />
          <span>{error}</span>
        </small>
      )}
    </div>
  );
}
