import { useState } from "react";
import { IconChevronDown } from "@tabler/icons-react";

import { cn } from "@/lib/utils";

export interface DropdownProps {
  value: string;
  options: string[];
  onChange: (value: string) => void;
  placeholder?: string;
}

export default function Dropdown({
  value,
  options,
  onChange,
  placeholder = "Pilih...",
}: DropdownProps) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative w-40">
      {/* Button */}
      <button
        className="
          flex
          h-10
          w-full
          items-center
          justify-between
          rounded-md
          bg-button
          px-4
          text-sm
          text-text-secondary
          transition
        "
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
            dark:border-slate-600
            bg-button
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
                dark:border-slate-600
                px-4
                text-left
                text-sm
                text-text-secondary
                transition
                hover:bg-blue-100
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
    </div>
  );
}
