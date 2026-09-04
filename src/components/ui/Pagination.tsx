import { IconChevronLeft, IconChevronRight } from '@tabler/icons-react'
import type { ApiMeta } from '@/types/api'
import { cn } from '@/utils/cn'

export interface PaginationProps {
  meta: ApiMeta | null
  onPageChange: (page: number) => void
}

function visiblePages(currentPage: number, lastPage: number) {
  const start = Math.max(1, currentPage - 2)
  const end = Math.min(lastPage, currentPage + 2)

  return Array.from({ length: end - start + 1 }, (_, index) => start + index)
}

export default function Pagination({ meta, onPageChange }: PaginationProps) {
  if (!meta || meta.last_page <= 1) {
    return null
  }

  const pages = visiblePages(meta.current_page, meta.last_page)
  const buttonClass =
    'inline-flex size-10 items-center justify-center rounded-md border text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-50'

  return (
    <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-sm text-slate-500">
        Menampilkan {meta.from ?? 0}-{meta.to ?? 0} dari {meta.total} data
      </p>
      <div className="flex items-center gap-1">
        <button
          className={cn(
            buttonClass,
            'border-slate-200 bg-white text-slate-600 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300',
          )}
          disabled={meta.current_page <= 1}
          onClick={() => onPageChange(meta.current_page - 1)}
          title="Halaman sebelumnya"
          type="button"
        >
          <IconChevronLeft size={18} strokeWidth={1.5} />
        </button>
        {pages.map((page) => (
          <button
            className={cn(
              buttonClass,
              page === meta.current_page
                ? 'border-primary-600 bg-primary-600 text-white'
                : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300',
            )}
            key={page}
            onClick={() => onPageChange(page)}
            type="button"
          >
            {page}
          </button>
        ))}
        <button
          className={cn(
            buttonClass,
            'border-slate-200 bg-white text-slate-600 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300',
          )}
          disabled={meta.current_page >= meta.last_page}
          onClick={() => onPageChange(meta.current_page + 1)}
          title="Halaman berikutnya"
          type="button"
        >
          <IconChevronRight size={18} strokeWidth={1.5} />
        </button>
      </div>
    </div>
  )
}
