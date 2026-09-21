import { useState } from "react";

import { IconChevronDown, IconAlertCircle } from "@tabler/icons-react";

import { cn } from "@/lib/utils";

export interface DropdownProps {
  value: string;
  options: string[];
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  error?: string;
}

export default function Dropdown({
  value,
  options,
  onChange,
  placeholder = "Pilih...",
  className,
  error,
}: DropdownProps) {
  const [open, setOpen] = useState(false);

  return (
    <div className={cn("relative w-40", className)}>
      {/* Button */}
      <button
        className={cn(
          `
            flex
            h-11
            w-full
            items-center
            justify-between
            rounded-md
            border
            px-4
            text-sm
            transition
          `,
          error
            ? "border-danger-500 bg-white text-danger-500"
            : "border-transparent bg-button text-text-secondary",
        )}
        onClick={() => setOpen(!open)}
        type="button"
      >
        <span>{value || placeholder}</span>

        <IconChevronDown size={22} strokeWidth={1.5} />
      </button>

      {/* Dropdown */}
      {open && (
        <div
          className="
            absolute
            left-0
            top-12
            z-50
            w-full
            overflow-hidden
            rounded-lg
            border
            border-slate-200
            bg-button
            dark:border-slate-600
          "
        >
          {options.map((option, index) => (
            <button
              key={option}
              type="button"
              className={cn(
                `
                  flex
                  h-10
                  w-full
                  items-center
                  border-b
                  border-slate-200
                  px-4
                  text-left
                  text-sm
                  text-text-secondary
                  transition
                  hover:bg-blue-100
                  dark:border-slate-600
                  dark:hover:bg-blue-800
                `,
                index === options.length - 1 && "border-b-0",
                value === option && "text-slate-700",
              )}
              onClick={() => {
                onChange(option);
                setOpen(false);
              }}
            >
              {option}
            </button>
          ))}
        </div>
      )}

      {/* Error */}
      {error ? (
        <small className="flex items-center gap-1 text-xs font-normal text-danger-500">
          <IconAlertCircle size={14} strokeWidth={2} />
          <span>{error}</span>
        </small>
      ) : null}
    </div>
  );
}
