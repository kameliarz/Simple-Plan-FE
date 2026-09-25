import React, { useState, useRef, useEffect } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { cn } from "../../lib/utils";

export interface DropdownOption {
  label: string;
  value: string;
}

export interface DropdownFilterProps {
  options: DropdownOption[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export const DropdownFilter: React.FC<DropdownFilterProps> = ({
  options,
  value,
  onChange,
  placeholder = "Select...",
  className,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find((opt) => opt.value === value);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "flex items-center justify-between w-full text-xs font-medium text-slate-700 dark:text-slate-200 bg-blue-50/50 hover:bg-blue-50 dark:bg-slate-800 dark:hover:bg-slate-700 px-3 py-2 rounded-md transition-colors",
          className
        )}
      >
        <span className="truncate whitespace-nowrap">{selectedOption ? selectedOption.label : placeholder}</span>
        {isOpen ? (
          <ChevronUp className="w-4 h-4 ml-2 text-slate-400" />
        ) : (
          <ChevronDown className="w-4 h-4 ml-2 text-slate-400" />
        )}
      </button>

      {isOpen && (
        <div className="absolute z-50 w-48 mt-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md shadow-lg py-1">
          {options.map((opt) => (
            <button
              key={opt.value}
              className={cn(
                "block w-full text-left px-4 py-2 text-sm hover:bg-slate-100 dark:hover:bg-slate-700",
                value === opt.value
                  ? "text-blue-600 bg-blue-50/50 dark:bg-slate-700"
                  : "text-slate-700 dark:text-slate-200"
              )}
              onClick={() => {
                onChange(opt.value);
                setIsOpen(false);
              }}
            >
              {opt.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default DropdownFilter;
