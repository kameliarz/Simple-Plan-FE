import Pagination from "@/components/ui/ui-template/Pagination";

import type { ApiMeta } from "@/types/api";

interface BackupTablePaginationProps {
  meta: ApiMeta | null;
  onPageChange: (page: number) => void;
}

export default function BackupTablePagination({ meta, onPageChange }: BackupTablePaginationProps) {
  if (!meta) return null;

  // Jika ada lebih dari satu halaman,
  // gunakan Pagination existing.
  if (meta.last_page > 1) {
    return <Pagination meta={meta} onPageChange={onPageChange} />;
  }

  // Jika hanya satu halaman,
  // tampilkan informasi jumlah data.
  return (
    <div
      className="
        flex w-full items-center justify-between
        border-t border-slate-200
        bg-table-card px-6 py-4
        dark:border-slate-600
      "
    >
      <p className="text-xs text-text-secondary">
        Showing {meta.from ?? 0} to {meta.to ?? 0} of {meta.total} entries
      </p>

      <div className="flex items-center gap-1">
        <button
          type="button"
          disabled
          aria-label="Halaman sebelumnya"
          className="flex h-6 min-w-6 cursor-not-allowed items-center justify-center text-slate-300"
        >
          ‹
        </button>

        <button
          type="button"
          aria-current="page"
          className="flex h-6 min-w-6 items-center justify-center rounded-xs bg-blue-900 text-sm font-medium text-white"
        >
          1
        </button>

        <button
          type="button"
          disabled
          aria-label="Halaman berikutnya"
          className="flex h-6 min-w-6 cursor-not-allowed items-center justify-center text-slate-300"
        >
          ›
        </button>
      </div>
    </div>
  );
}
