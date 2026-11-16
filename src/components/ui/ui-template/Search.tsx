import { IconSearch } from "@tabler/icons-react";

export interface SearchProps {
  onChange: (value: string) => void;
  placeholder?: string;
  value: string;
}

export default function Search({ onChange, placeholder = "Cari data...", value }: SearchProps) {
  return (
    <div className="relative w-full">
      <input
        className="
          block
          h-11
          w-full
          rounded-lg
          border
          border-med-border
          bg-table-card
          px-4
          pr-14
          text-sm
          text-text-secondary
          outline-none
          transition
          placeholder:text-slate-600
          focus:border-slate-400
          focus:ring-2
          focus:ring-slate-200
        "
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        type="text"
        value={value}
      />

      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-5">
        <IconSearch className="text-slate-700" size={18} strokeWidth={2.5} />
      </div>
    </div>
  );
}
