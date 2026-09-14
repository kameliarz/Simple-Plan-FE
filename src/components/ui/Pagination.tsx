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

  return Array.from(
    { length: end - start + 1 },
    (_, index) => start + index,
  )
}


export default function Pagination({
  meta,
  onPageChange,
}: PaginationProps) {

  if (!meta || meta.last_page <= 1) {
    return null
  }


  const pages = visiblePages(
    meta.current_page,
    meta.last_page,
  )


  const buttonClass =
    'flex h-6 min-w-6 items-center justify-center rounded-xs text-sm font-medium transition'


  return (
    <div
      className="
        flex
        w-full
        items-center
        justify-between
        border-slate-200
        bg-white
        px-6
        py-1
      "
    >

      {/* Text kiri */}
      <p className="text-sm text-slate-600">
        Showing {meta.from ?? 0} to {meta.to ?? 0} of {meta.total} entries
      </p>


      {/* Pagination kanan */}
      <div className="flex items-center gap-1">


        {/* Previous */}
        <button
          className={cn(
            buttonClass,
            'text-slate-400 hover:bg-slate-100',
          )}
          disabled={meta.current_page <= 1}
          onClick={() =>
            onPageChange(meta.current_page - 1)
          }
          type="button"
        >
          <IconChevronLeft
            size={14}
            strokeWidth={2}
          />
        </button>


        {/* Pages */}
        {pages.map((page) => (
          <button
            className={cn(
              buttonClass,

              page === meta.current_page
                ? `
                  bg-blue-900
                  text-white
                `
                : `
                  text-slate-600
                  hover:bg-slate-100
                `,
            )}
            key={page}
            onClick={() =>
              onPageChange(page)
            }
            type="button"
          >
            {page}
          </button>
        ))}


        {/* Next */}
        <button
          className={cn(
            buttonClass,
            'text-slate-400 hover:bg-slate-100',
          )}
          disabled={meta.current_page >= meta.last_page}
          onClick={() =>
            onPageChange(meta.current_page + 1)
          }
          type="button"
        >
          <IconChevronRight
            size={14}
            strokeWidth={2}
          />
        </button>


      </div>

    </div>
  )
}