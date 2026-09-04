import { IconSearch, IconX } from '@tabler/icons-react'

export interface SearchProps {
  onChange: (value: string) => void
  placeholder?: string
  value: string
}

export default function Search({
  onChange,
  placeholder = 'Cari...',
  value,
}: SearchProps) {
  return (
    <div className="relative">
      <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
        <IconSearch className="text-slate-400" size={18} strokeWidth={1.5} />
      </div>
      <input
        className="block h-11 w-full rounded-md border border-slate-200 bg-white py-2 pl-10 pr-10 text-sm text-slate-800 transition focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        type="search"
        value={value}
      />
      {value ? (
        <button
          className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 transition hover:text-slate-700 dark:hover:text-slate-200"
          onClick={() => onChange('')}
          title="Bersihkan pencarian"
          type="button"
        >
          <IconX size={18} strokeWidth={1.5} />
        </button>
      ) : null}
    </div>
  )
}
