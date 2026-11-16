import { useEffect, useMemo, useRef, useState } from "react";
import { IconChevronDown, IconAlertCircle, IconSearch, IconX } from "@tabler/icons-react";
import { cn } from "@/lib/utils";

export interface DropdownOption {
  label: string;
  value: string;
}

export interface DropdownProps {
  value: string;
  options: (string | DropdownOption)[];
  onChange: (value: string) => void;
  disabled?: boolean;
  placeholder?: string;
  className?: string;
  error?: string;
  mobileSheet?: boolean;
  searchable?: boolean;
  searchPlaceholder?: string;
  sheetTitle?: string;
  displayValue?: string;
  onSearchChange?: (value: string) => void;
  emptyMessage?: string;
  emptyActionLabel?: string;
  onEmptyActionClick?: (search: string) => void;
}

export default function Dropdown({
  value,
  options,
  onChange,
  disabled = false,
  placeholder = "Pilih...",
  className,
  error,
  mobileSheet = false,
  searchable = false,
  searchPlaceholder = "Cari...",
  sheetTitle = "Pilih pilihan",
  displayValue,
  onSearchChange,
  emptyMessage,
  emptyActionLabel,
  onEmptyActionClick,
}: DropdownProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [draftValue, setDraftValue] = useState(value);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const handleClose = () => {
    setOpen(false);
    setSearch("");
  };

  useEffect(() => {
    if (!open) return;

    const handleClickOutside = (event: PointerEvent) => {
      const target = event.target as Node;

      if (dropdownRef.current && !dropdownRef.current.contains(target)) {
        handleClose();
      }
    };

    document.addEventListener("pointerdown", handleClickOutside);

    return () => {
      document.removeEventListener("pointerdown", handleClickOutside);
    };
  }, [open]);

  const normalizedOptions = useMemo(
    () =>
      options.map((option) =>
        typeof option === "string" ? { label: option, value: option } : option,
      ),
    [options],
  );

  const filteredOptions = useMemo(() => {
    if (onSearchChange) {
      return normalizedOptions;
    }

    if (!searchable) {
      return normalizedOptions;
    }

    return normalizedOptions.filter((option) =>
      option.label.toLowerCase().includes(search.trim().toLowerCase()),
    );
  }, [normalizedOptions, search, searchable, onSearchChange]);

  const selectedLabel = normalizedOptions.find((option) => option.value === value)?.label ?? "";

  // displayValue lets the parent show a name instead of an ID.
  const triggerLabel =
    displayValue !== undefined ? displayValue : selectedLabel || value || placeholder;

  const handleOpen = () => {
    setDraftValue(value);
    setSearch("");
    setOpen(true);
  };

  const handleApply = () => {
    onChange(draftValue);
    handleClose();
  };

  const handleSearchChange = (nextSearch: string) => {
    setSearch(nextSearch);
    onSearchChange?.(nextSearch);
  };

  const handleSelect = (optionValue: string) => {
    onChange(optionValue);
    handleClose();
  };

  return (
    <div ref={dropdownRef} className={cn("relative w-40", className)}>
      {/* Trigger */}
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        disabled={disabled}
        onClick={() => (open ? handleClose() : handleOpen())}
        className={cn(
          "flex h-10 w-full items-center justify-between rounded-md border px-4 text-sm transition",
          error
            ? "border-danger-500 bg-table-card text-danger-500"
            : "border-transparent bg-button text-text-secondary",
        )}
      >
        <span className="truncate">{triggerLabel}</span>
        {!disabled && <IconChevronDown size={22} strokeWidth={1.5} className="shrink-0" />}
      </button>

      {/* Desktop Dropdown */}
      {open && (
        <div
          className={cn(
            "absolute left-0 top-12 z-50 w-full overflow-hidden rounded-lg border border-slate-200 bg-button shadow-md dark:border-slate-600",
            mobileSheet && "hidden md:block",
          )}
        >
          {searchable && (
            <div className="border-b border-slate-200 p-2 dark:border-slate-600">
              <div className="flex h-9 items-center gap-2 rounded-md border border-slate-200 px-2 dark:border-slate-600">
                <IconSearch size={16} strokeWidth={1.7} className="shrink-0 text-slate-400" />
                <input
                  type="search"
                  value={search}
                  onChange={(event) => handleSearchChange(event.target.value)}
                  placeholder={searchPlaceholder}
                  aria-label={searchPlaceholder}
                  className="h-full min-w-0 flex-1 bg-transparent text-sm text-text-secondary outline-none"
                />
              </div>
            </div>
          )}

          <div role="listbox" className="max-h-60 overflow-y-auto">
            {filteredOptions.map((option, index) => (
              <button
                key={option.value}
                type="button"
                role="option"
                aria-selected={value === option.value}
                className={cn(
                  "flex min-h-10 w-full items-center border-b border-slate-200 px-4 py-2 text-left text-sm text-text-secondary transition hover:bg-blue-100 dark:border-slate-600 dark:hover:bg-blue-800",
                  index === filteredOptions.length - 1 && "border-b-0",
                  value === option.value && "font-medium text-text-secondary",
                )}
                onClick={() => handleSelect(option.value)}
              >
                {option.label}
              </button>
            ))}

            {filteredOptions.length === 0 && (
              <div className="px-3 py-4 text-center text-sm text-slate-500">
                {onEmptyActionClick && search.trim() ? (
                  <p>
                    {emptyMessage ?? "Pilihan tidak ditemukan."}{" "}
                    <button
                      type="button"
                      className="font-semibold text-blue-700 underline hover:text-blue-900"
                      onClick={() => {
                        const searchValue = search.trim();
                        handleClose();
                        onEmptyActionClick(searchValue);
                      }}
                    >
                      {emptyActionLabel ?? "Tambah data baru"}
                    </button>
                  </p>
                ) : (
                  <p>Pilihan tidak ditemukan.</p>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Mobile Bottom Sheet */}
      {open && mobileSheet && (
        <div className="fixed inset-0 z-100 md:hidden">
          {/* Backdrop */}
          <button
            type="button"
            aria-label="Tutup pilihan"
            onClick={handleClose}
            className="absolute inset-0 h-full w-full bg-black/40"
          />

          {/* Sheet */}
          <div
            role="dialog"
            aria-modal="true"
            aria-label={sheetTitle}
            className="absolute inset-x-0 bottom-0 flex h-[60dvh] max-h-[90dvh] flex-col overflow-hidden rounded-t-3xl border border-med-border bg-table-card shadow-xl"
          >
            {/* Handle */}
            <div className="flex shrink-0 justify-center pt-2.5">
              <div className="h-1.5 w-11 rounded-full bg-slate-300" />
            </div>

            {/* Header */}
            <div className="flex shrink-0 items-center justify-between border-b border-med-border px-5 py-3">
              <h2 className="text-base font-semibold text-primary-600">{sheetTitle}</h2>

              <button
                type="button"
                onClick={handleClose}
                aria-label="Tutup"
                className="flex h-8 w-8 items-center justify-center rounded-full bg-table-card text-slate-500 transition hover:bg-button/40"
              >
                <IconX size={18} strokeWidth={2} />
              </button>
            </div>

            {/* Search */}
            <div className="shrink-0 border-b border-med-border px-4 py-3">
              <div className="flex h-10 items-center gap-2 rounded-lg border border-med-border bg-table-card px-3">
                <IconSearch size={18} strokeWidth={1.7} className="shrink-0 text-slate-400" />

                <input
                  type="search"
                  value={search}
                  onChange={(event) => handleSearchChange(event.target.value)}
                  placeholder={searchPlaceholder}
                  aria-label={searchPlaceholder}
                  className="h-full min-w-0 flex-1 bg-transparent text-sm text-text-title outline-none placeholder:text-slate-400"
                />
              </div>
            </div>

            {/* Options */}
            <div
              role="listbox"
              aria-label={sheetTitle}
              className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 py-2"
            >
              <div className="flex flex-col gap-1">
                {filteredOptions.map((option) => {
                  const selected = draftValue === option.value;

                  return (
                    <button
                      key={option.value}
                      type="button"
                      role="option"
                      aria-selected={selected}
                      onClick={() => setDraftValue(option.value)}
                      className={cn(
                        "flex min-h-11 w-full items-center justify-between gap-3 rounded-xl border px-3 py-2 text-left transition",
                        selected
                          ? "border-blue-500 bg-button/40"
                          : "border-med-border bg-table-card",
                      )}
                    >
                      <span className="flex min-w-0 items-center gap-2 text-sm text-text-title">
                        <span
                          className={cn(
                            "h-2 w-2 shrink-0 rounded-full",
                            selected ? "bg-primary-600" : "bg-slate-300",
                          )}
                        />
                        <span className="truncate">{option.label}</span>
                      </span>

                      <span
                        className={cn(
                          "flex h-4 w-4 shrink-0 items-center justify-center rounded-full border",
                          selected ? "border-primary-600" : "border-slate-400",
                        )}
                      >
                        {selected && <span className="h-2 w-2 rounded-full bg-primary-600" />}
                      </span>
                    </button>
                  );
                })}

                {filteredOptions.length === 0 && (
                  <p className="py-8 text-center text-sm text-slate-500">
                    Pilihan tidak ditemukan.
                  </p>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="shrink-0 border-t border-med-border px-4 py-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={handleApply}
                  disabled={!draftValue}
                  className="min-w-32 rounded-xl bg-primary-600 px-6 py-3 text-sm font-semibold text-white shadow-md transition hover:bg-blue-900 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Terapkan
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Error */}
      {error ? (
        <small className="mt-1 flex items-center gap-1 text-xs font-normal text-danger-500">
          <IconAlertCircle size={14} strokeWidth={2} />
          <span>{error}</span>
        </small>
      ) : null}
    </div>
  );
}
