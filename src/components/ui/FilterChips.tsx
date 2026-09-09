import React from "react";
import { cn } from "../../lib/utils";

export interface FilterChipsProps<T extends string = string> {
  options: readonly T[] | T[];
  selected: T;
  onSelect: (option: T) => void;
  getLabel?: (option: T) => string;
  className?: string;
}

export const FilterChips = <T extends string = string>({
  options,
  selected,
  onSelect,
  getLabel,
  className,
}: FilterChipsProps<T>): React.ReactElement => {
  return (
    <div
      className={cn(
        "flex items-center gap-2 overflow-x-auto no-scrollbar py-0.5 -mx-4 px-4",
        className,
      )}
    >
      {options.map((opt) => {
        const isActive = selected === opt;
        const label = getLabel ? getLabel(opt) : opt;

        return (
          <button
            key={opt}
            type="button"
            onClick={() => onSelect(opt)}
            className={cn(
              "px-4 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors select-none cursor-pointer border",
              isActive
                ? "bg-[#003178] border-[#003178] text-white shadow-xs font-semibold"
                : "bg-white dark:bg-[#1e293b] border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800",
            )}
          >
            {label}
          </button>
        );
      })}
    </div>
  );
};

export default FilterChips;
