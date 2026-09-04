import type { ReactNode } from 'react'
import PerPage from './PerPage'
import Search from './Search'

export interface ResourceToolbarProps {
  children?: ReactNode
  onPerPageChange: (value: number | 'all') => void
  onSearchChange: (value: string) => void
  perPage: number | 'all'
  search: string
  searchPlaceholder?: string
}

export default function ResourceToolbar({
  children,
  onPerPageChange,
  onSearchChange,
  perPage,
  search,
  searchPlaceholder,
}: ResourceToolbarProps) {
  return (
    <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="w-full sm:max-w-sm">
        <Search
          onChange={onSearchChange}
          placeholder={searchPlaceholder}
          value={search}
        />
      </div>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        {children}
        <PerPage onChange={onPerPageChange} value={perPage} />
      </div>
    </div>
  )
}
