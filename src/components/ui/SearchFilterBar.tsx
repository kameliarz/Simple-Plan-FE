import React from "react";
import { Search, SlidersHorizontal } from "lucide-react";
import { cn } from "../../lib/utils";

export interface SearchFilterBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  onFilterClick?: () => void;
  isFilterActive?: boolean;
  className?: string;
}

export const SearchFilterBar: React.FC<SearchFilterBarProps> = ({
  value,
  onChange,
  placeholder = "Cari...",
  onFilterClick,
  isFilterActive = false,
  className,
}) => {
  return (
    <div className={cn("flex items-center gap-2.5", className)}>
      <div className="relative flex-1">
        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full pl-10 pr-4 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#1e293b] text-slate-800 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-900/20 shadow-xs"
        />
      </div>

      {onFilterClick && (
        <button
          type="button"
          onClick={onFilterClick}
          className={cn(
            "p-2.5 rounded-xl border transition shadow-xs flex items-center justify-center cursor-pointer shrink-0",
            isFilterActive
              ? "bg-[#003178] text-white border-[#003178]"
              : "bg-white dark:bg-[#1e293b] border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800",
          )}
          title="Buka Filter"
        >
          <SlidersHorizontal className="w-4 h-4" />
        </button>
      )}
    </div>
  );
};

export default SearchFilterBar;
