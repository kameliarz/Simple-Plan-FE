import { Listbox, ListboxButton, ListboxOption, ListboxOptions } from '@headlessui/react'
import {
  IconChevronDown,
  IconCircle,
  IconCircleFilled,
} from '@tabler/icons-react'
import { useState } from 'react'

export type SelectOption = {
  id: number | string
  [key: string]: unknown
}

export interface InputSelectProps<TOption extends SelectOption> {
  data: TOption[]
  displayKey?: keyof TOption & string
  error?: string
  label?: string
  multiple?: boolean
  placeholder?: string
  searchable?: boolean
  selected: TOption | TOption[] | null
  setSelected: (value: TOption | TOption[]) => void
}

export default function InputSelect<TOption extends SelectOption>({
  data,
  displayKey = 'name' as keyof TOption & string,
  error,
  label,
  multiple = false,
  placeholder = 'Pilih...',
  searchable = false,
  selected,
  setSelected,
}: InputSelectProps<TOption>) {
  const [search, setSearch] = useState('')

  const filteredData = data.filter((item) =>
    String(item[displayKey] ?? '')
      .toLowerCase()
      .includes(search.toLowerCase()),
  )

  const buttonLabel = multiple
    ? Array.isArray(selected) && selected.length > 0
      ? selected.map((item) => String(item[displayKey] ?? '')).join(', ')
      : placeholder
    : selected && !Array.isArray(selected)
      ? String(selected[displayKey] ?? '')
      : placeholder

  return (
    <div className="flex flex-col gap-2">
      {label ? <label className="text-sm text-slate-600">{label}</label> : null}
      <Listbox
        by="id"
        multiple={multiple}
        onChange={setSelected}
        value={selected ?? undefined}
      >
        <ListboxButton className="flex w-full items-center justify-between gap-8 rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 focus:border-slate-300 focus:outline-none dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300">
          <span className="truncate">{buttonLabel}</span>
          <IconChevronDown size={20} strokeWidth={1.5} />
        </ListboxButton>
        <ListboxOptions className="mt-1 flex max-h-72 flex-col gap-2 overflow-auto rounded-lg border border-slate-200 bg-slate-100 p-4 dark:border-slate-800 dark:bg-slate-950">
          {searchable ? (
            <input
              className="mb-2 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 focus:border-slate-300 focus:outline-none dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300"
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search..."
              type="text"
              value={search}
            />
          ) : null}
          {filteredData.map((item) => (
            <ListboxOption key={item.id} value={item}>
              {({ selected: isSelected }) => (
                <div className="flex cursor-pointer items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 hover:bg-slate-200 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400 dark:hover:bg-slate-800">
                  {isSelected ? (
                    <IconCircleFilled
                      className="text-primary-500"
                      size={15}
                      strokeWidth={1.5}
                    />
                  ) : (
                    <IconCircle size={15} strokeWidth={1.5} />
                  )}
                  {String(item[displayKey] ?? '')}
                </div>
              )}
            </ListboxOption>
          ))}
        </ListboxOptions>
      </Listbox>
      {error ? <small className="text-xs text-danger-500">{error}</small> : null}
    </div>
  )
}
