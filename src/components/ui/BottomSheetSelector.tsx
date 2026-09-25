import { useState, useEffect } from "react";
import { X, Search } from "lucide-react";

interface Option {
  label: string;
  value: string;
}

interface BottomSheetSelectorProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  options: Option[];
  value: string;
  onChange: (value: string) => void;
  searchPlaceholder?: string;
}

export function BottomSheetSelector({
  isOpen,
  onClose,
  title,
  options,
  value,
  onChange,
  searchPlaceholder = "Cari...",
}: BottomSheetSelectorProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [localValue, setLocalValue] = useState(value);

  useEffect(() => {
    if (isOpen) {
      setLocalValue(value);
      setSearchQuery("");
    }
  }, [isOpen, value]);

  if (!isOpen) return null;

  const filteredOptions = options.filter((opt) =>
    opt.label.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleApply = () => {
    onChange(localValue);
    onClose();
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/50 z-[60] transition-opacity"
        onClick={onClose}
      />
      
      {/* Bottom Sheet */}
      <div className="fixed inset-x-0 bottom-0 z-[70] bg-white dark:bg-slate-900 rounded-t-3xl transform transition-transform duration-300 flex flex-col max-h-[90vh]">
        
        {/* Handle bar */}
        <div className="flex justify-center pt-3 pb-2">
          <div className="w-10 h-1.5 bg-slate-300 dark:bg-slate-600 rounded-full" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-2">
          <h3 className="font-bold text-slate-800 dark:text-slate-100">{title}</h3>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Search */}
        <div className="p-4 pt-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder={searchPlaceholder}
              className="w-full pl-9 pr-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:border-blue-500"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* Options List */}
        <div className="flex-1 overflow-y-auto px-4 pb-4 space-y-3">
          {filteredOptions.length > 0 ? (
            filteredOptions.map((opt) => (
              <label
                key={opt.value}
                className="flex items-center justify-between p-3.5 rounded-xl border border-slate-200 dark:border-slate-700 cursor-pointer active:bg-slate-50 dark:active:bg-slate-800/50"
                onClick={() => setLocalValue(opt.value)}
              >
                <span className="text-sm text-slate-700 dark:text-slate-300">
                  {opt.label}
                </span>
                <div className="relative flex items-center justify-center w-5 h-5 rounded-full border border-slate-300 dark:border-slate-600">
                  {localValue === opt.value && (
                    <div className="w-2.5 h-2.5 rounded-full bg-blue-600" />
                  )}
                </div>
              </label>
            ))
          ) : (
            <div className="text-center py-6 text-slate-400 text-sm">
              Tidak ada hasil
            </div>
          )}
        </div>

        {/* Footer / Apply Button */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-b-3xl">
          <button
            onClick={handleApply}
            className="w-full py-3 bg-[#0a2360] hover:bg-blue-900 text-white font-medium rounded-xl transition-colors text-sm"
          >
            Terapkan
          </button>
        </div>
      </div>
    </>
  );
}
