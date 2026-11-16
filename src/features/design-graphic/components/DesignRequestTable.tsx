import { useState } from "react";
import { IconChevronLeft, IconChevronRight, IconInfoCircle } from "@tabler/icons-react";
import Table from "@/components/ui/ui-template/Table";
import { cn } from "@/lib/utils";
import type { ApiMeta } from "@/types/api";
import type { DesignRequestItem } from "../types/designGraphic.types";
import DesignStatusBadge from "./DesignStatusBadge";

interface DesignRequestTableProps {
  items: DesignRequestItem[];
  isLoading?: boolean;
  onRowClick?: (item: DesignRequestItem) => void;
  meta?: ApiMeta | null;
  onPageChange?: (page: number) => void;
}

function visiblePages(currentPage: number, lastPage: number) {
  const start = Math.max(1, currentPage - 2);
  const end = Math.min(lastPage, currentPage + 2);
  return Array.from({ length: end - start + 1 }, (_, index) => start + index);
}

export default function DesignRequestTable({
  items,
  isLoading = false,
  onRowClick,
  meta,
  onPageChange,
}: DesignRequestTableProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 15;

  const totalPages = meta ? meta.last_page : Math.max(1, Math.ceil(items.length / itemsPerPage));
  const activePage = meta ? meta.current_page : Math.min(currentPage, totalPages);
  const paginatedItems = meta
    ? items
    : items.slice((activePage - 1) * itemsPerPage, activePage * itemsPerPage);

  const pages = visiblePages(activePage, totalPages);

  const handlePageClick = (page: number) => {
    if (onPageChange) {
      onPageChange(page);
    } else {
      setCurrentPage(page);
    }
  };

  const buttonClass =
    "flex h-6 min-w-6 items-center justify-center rounded-xs text-sm font-medium transition cursor-pointer";

  if (isLoading) {
    return (
      <div className="flex min-h-64 items-center justify-center rounded-lg border border-med-border bg-table-card text-sm text-text-secondary">
        Memuat data request desain...
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-lg border border-med-border bg-table-card">
      <Table className="min-w-175 table-auto">
        <Table.Thead>
          <tr>
            <Table.Th className="whitespace-nowrap">Nomor Request</Table.Th>
            <Table.Th className="whitespace-nowrap">Judul Request</Table.Th>
            <Table.Th className="whitespace-nowrap">Unit</Table.Th>
            <Table.Th className="whitespace-nowrap">Tanggal Dibutuhkan</Table.Th>
            <Table.Th className="whitespace-nowrap">Status</Table.Th>
          </tr>
        </Table.Thead>

        <Table.Tbody>
          {paginatedItems.length === 0 ? (
            <tr>
              <td colSpan={5} className="px-6 py-16 text-center">
                <div className="flex items-center justify-center gap-2 text-text-secondary">
                  <IconInfoCircle size={18} strokeWidth={1.8} className="shrink-0" />
                  <p className="text-xs font-normal">Data request tidak ditemukan!</p>
                </div>
              </td>
            </tr>
          ) : (
            paginatedItems.map((item) => (
              <tr
                key={item.id}
                onClick={() => onRowClick?.(item)}
                className={cn(
                  "transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/50",
                  onRowClick && "cursor-pointer",
                )}
              >
                <Table.Td className="whitespace-nowrap font-semibold text-primary-600 dark:text-blue-400">
                  {item.nomorRequest}
                </Table.Td>
                <Table.Td className="whitespace-nowrap">{item.judulRequest}</Table.Td>
                <Table.Td className="whitespace-nowrap">{item.unit}</Table.Td>
                <Table.Td className="whitespace-nowrap">{item.tanggalDibutuhkan}</Table.Td>
                <Table.Td className="whitespace-nowrap">
                  <DesignStatusBadge status={item.status} />
                </Table.Td>
              </tr>
            ))
          )}
        </Table.Tbody>
      </Table>

      {/* Pagination Footer */}
      <div className="flex w-full items-center justify-between border-t border-slate-200 bg-table-card px-6 py-4 dark:border-slate-600">
        <p className="text-xs text-text-secondary">
          {meta
            ? `Showing ${meta.from ?? 0} to ${meta.to ?? 0} of ${meta.total} entries`
            : items.length === 0
              ? "Showing 0 to 0 of 0 entries"
              : `Showing ${(activePage - 1) * itemsPerPage + 1} to ${Math.min(activePage * itemsPerPage, items.length)} of ${items.length} entries`}
        </p>

        {totalPages > 1 && (
          <div className="flex items-center gap-1">
            <button
              className={cn(
                buttonClass,
                "text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed",
              )}
              disabled={activePage <= 1}
              onClick={() => handlePageClick(activePage - 1)}
              type="button"
              aria-label="Halaman sebelumnya"
            >
              <IconChevronLeft size={14} strokeWidth={2} />
            </button>

            {pages.map((page) => (
              <button
                key={page}
                type="button"
                onClick={() => handlePageClick(page)}
                className={cn(
                  buttonClass,
                  activePage === page
                    ? "bg-blue-900 text-white"
                    : "text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800",
                )}
              >
                {page}
              </button>
            ))}

            <button
              className={cn(
                buttonClass,
                "text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed",
              )}
              disabled={activePage >= totalPages}
              onClick={() => handlePageClick(activePage + 1)}
              type="button"
              aria-label="Halaman berikutnya"
            >
              <IconChevronRight size={14} strokeWidth={2} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
