import { IconCheck, IconChevronDown, IconX } from '@tabler/icons-react'
import { useMemo, useRef, useState } from 'react'
import { cn } from '@/utils/cn'

export type SearchableSelectOption = {
  id: number | string
  name: string
}

export type SearchableSelectValue =
  | SearchableSelectOption['id']
  | SearchableSelectOption['id'][]
  | null

export interface SearchableSelectProps {
  error?: string
  label?: string
  multiple?: boolean
  onChange: (value: SearchableSelectValue) => void
  options: SearchableSelectOption[]
  placeholder?: string
  selected: SearchableSelectValue
}

export default function SearchableSelect({
  error,
  label,
  multiple = false,
  onChange,
  options,
  placeholder = 'Pilih...',
  selected,
}: SearchableSelectProps) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)
  const selectedIds = Array.isArray(selected) ? selected : []

  const filteredOptions = useMemo(() => {
    if (!query) {
      return options
    }

    const normalizedQuery = query.toLowerCase().replace(/\s+/g, '')

    return options.filter((option) =>
      option.name.toLowerCase().replace(/\s+/g, '').includes(normalizedQuery),
    )
  }, [options, query])

  const displayValue = () => {
    if (multiple) {
      return selectedIds.length > 0 ? `${selectedIds.length} terpilih` : ''
    }

    return options.find((option) => option.id === selected)?.name ?? ''
  }

  const selectOption = (option: SearchableSelectOption) => {
    if (multiple) {
      const nextSelected = selectedIds.includes(option.id)
        ? selectedIds.filter((id) => id !== option.id)
        : [...selectedIds, option.id]

      onChange(nextSelected)
      setQuery('')
      inputRef.current?.focus()
      return
    }

    onChange(option.id)
    setQuery('')
    setOpen(false)
  }

  const removeOption = (idToRemove: SearchableSelectOption['id']) => {
    onChange(selectedIds.filter((id) => id !== idToRemove))
  }

  return (
    <div className="flex flex-col gap-2">
      {label ? (
        <label className="text-sm font-medium text-slate-600 dark:text-slate-300">
          {label}
        </label>
      ) : null}

      <div className="relative">
        <div className="relative w-full overflow-hidden rounded-md border border-slate-200 bg-white text-left text-sm focus-within:border-primary-500 focus-within:ring-2 focus-within:ring-primary-500 dark:border-slate-700 dark:bg-slate-900">
          <input
            autoComplete="off"
            className="w-full border-none bg-transparent py-3 pl-4 pr-10 text-sm leading-5 text-slate-900 focus:ring-0 dark:text-slate-100"
            onChange={(event) => {
              setQuery(event.target.value)
              setOpen(true)
            }}
            onFocus={() => setOpen(true)}
            placeholder={displayValue() || placeholder}
            ref={inputRef}
            type="text"
            value={query}
          />
          <button
            className="absolute inset-y-0 right-0 flex items-center pr-3"
            onClick={() => setOpen((value) => !value)}
            type="button"
          >
            <IconChevronDown
              aria-hidden="true"
              className="size-5 text-slate-400"
            />
          </button>
        </div>

        {open ? (
          <div className="absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black/5 focus:outline-none dark:bg-slate-800 sm:text-sm">
            {filteredOptions.length === 0 ? (
              <div className="relative cursor-default select-none px-4 py-2 text-slate-700 dark:text-slate-400">
                Tidak ditemukan.
              </div>
            ) : (
              filteredOptions.map((option) => {
                const isSelected = multiple
                  ? selectedIds.includes(option.id)
                  : selected === option.id

                return (
                  <button
                    className={cn(
                      'relative flex w-full cursor-pointer select-none items-center py-2.5 pl-10 pr-4 text-left',
                      isSelected
                        ? 'bg-primary-50 font-medium text-primary-700'
                        : 'text-slate-900 hover:bg-primary-500 hover:text-white dark:text-slate-100',
                    )}
                    key={option.id}
                    onClick={() => selectOption(option)}
                    type="button"
                  >
                    <span className="block truncate">{option.name}</span>
                    {isSelected ? (
                      <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-primary-600">
                        <IconCheck aria-hidden="true" className="size-5" />
                      </span>
                    ) : null}
                  </button>
                )
              })
            )}
          </div>
        ) : null}
      </div>

      {multiple && selectedIds.length > 0 ? (
        <div className="mt-2 flex flex-wrap gap-2">
          {selectedIds.map((id) => {
            const option = options.find((item) => item.id === id)

            if (!option) {
              return null
            }

            return (
              <div
                className="flex items-center gap-1.5 rounded-md border border-primary-100 bg-primary-50 px-2.5 py-1 text-xs font-medium text-primary-700"
                key={id}
              >
                <span>{option.name}</span>
                <button
                  className="transition hover:text-danger-500"
                  onClick={() => removeOption(id)}
                  type="button"
                >
                  <IconX size={14} strokeWidth={2.5} />
                </button>
              </div>
            )
          })}
        </div>
      ) : null}

      {error ? <p className="text-xs text-danger-500">{error}</p> : null}
    </div>
  )
}
