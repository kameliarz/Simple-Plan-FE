import { useMemo, useState, type ReactNode } from "react";
import { IconChevronLeft, IconChevronRight } from "@tabler/icons-react";

interface Column<T> {
  key: keyof T;
  label: string;
  sortable?: boolean;
  render?: (value: T[keyof T], row: T) => ReactNode;
}

interface BaseTableProps<T> {
  columns: Column<T>[];
  data: T[];
  itemsPerPage?: number;
  onRowClick?: (row: T) => void;
  selectable?: boolean;
  selectedIds?: string[];
  getId?: (row: T) => string;
  onSelectRow?: (id: string, selected: boolean) => void;
  onSelectAll?: (selected: boolean) => void;
  showHeaderCheckbox?: boolean;
}

function BaseTable<T>({
  columns,
  data,
  itemsPerPage = 4,
  onRowClick,
  selectable = false,
  selectedIds = [],
  getId,
  onSelectRow,
  onSelectAll,
  showHeaderCheckbox = false,
}: BaseTableProps<T>) {
  const [sortKey, setSortKey] = useState<keyof T | null>(null);
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [currentPage, setCurrentPage] = useState(1);

  const sortedData = useMemo(() => {
    if (!sortKey) {
      return data;
    }

    return [...data].sort((a, b) => {
      const valueA = a[sortKey];
      const valueB = b[sortKey];

      if (valueA === valueB) {
        return 0;
      }

      if (valueA === null || valueA === undefined) {
        return -1;
      }

      if (valueB === null || valueB === undefined) {
        return 1;
      }

      if (valueA < valueB) {
        return sortDirection === "asc" ? -1 : 1;
      }

      return sortDirection === "asc" ? 1 : -1;
    });
  }, [data, sortKey, sortDirection]);

  const totalPages = Math.ceil(sortedData.length / itemsPerPage);
  const safeCurrentPage = totalPages > 0 ? Math.min(currentPage, totalPages) : 1;

  const paginatedData = useMemo(() => {
    const startIndex = (safeCurrentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;

    return sortedData.slice(startIndex, endIndex);
  }, [sortedData, safeCurrentPage, itemsPerPage]);

  const handleSort = (key: keyof T) => {
    if (sortKey === key) {
      setSortDirection((currentDirection) => (currentDirection === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDirection("asc");
    }

    setCurrentPage(1);
  };

  const handlePreviousPage = () => {
    setCurrentPage((page) => Math.max(Math.min(page, totalPages) - 1, 1));
  };

  const handleNextPage = () => {
    setCurrentPage((page) => Math.min(page + 1, totalPages));
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const startEntry = sortedData.length === 0 ? 0 : (safeCurrentPage - 1) * itemsPerPage + 1;

  const endEntry = Math.min(safeCurrentPage * itemsPerPage, sortedData.length);

  const pageStart = Math.max(1, safeCurrentPage - 2);
  const pageEnd = Math.min(totalPages, safeCurrentPage + 2);
  const visiblePages = Array.from(
    { length: Math.max(0, pageEnd - pageStart + 1) },
    (_, index) => pageStart + index,
  );

  return (
    <div className="w-full overflow-hidden rounded-lg border border-slate-200 bg-table-card dark:border-slate-700">
      <div className="w-full overflow-x-auto">
        <table className="w-full min-w-175 text-sm">
          <thead className="border-b border-slate-200 bg-button dark:border-slate-800">
            <tr>
              {selectable && (
                <th className="h-12 w-12 px-6 text-left align-middle">
                  {showHeaderCheckbox && (
                    <input
                      type="checkbox"
                      checked={
                        paginatedData.length > 0 &&
                        paginatedData.every((row) => {
                          const id = getId
                            ? getId(row)
                            : String((row as { id?: string | number }).id ?? "");
                          return selectedIds.includes(id);
                        })
                      }
                      onChange={(e) => onSelectAll?.(e.target.checked)}
                      className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                    />
                  )}
                </th>
              )}
              {columns.map((column) => (
                <th
                  key={String(column.key)}
                  className="h-12 px-6 text-left align-middle text-xs font-semibold uppercase tracking-wide text-text-secondary"
                >
                  {column.sortable ? (
                    <button
                      type="button"
                      onClick={() => handleSort(column.key)}
                      className="inline-flex items-center gap-1.5 transition hover:text-primary-600 dark:hover:text-white"
                    >
                      {column.label}

                      <span className="text-[10px]">
                        {sortKey === column.key ? (sortDirection === "asc" ? "↑" : "↓") : "↕"}
                      </span>
                    </button>
                  ) : (
                    column.label
                  )}
                </th>
              ))}
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-200 bg-table-card dark:divide-slate-600">
            {paginatedData.length > 0 ? (
              paginatedData.map((row, rowIndex) => {
                const rowId = getId
                  ? getId(row)
                  : String((row as { id?: string | number }).id ?? rowIndex);
                const isSelected = selectedIds.includes(rowId);

                return (
                  <tr
                    key={rowIndex}
                    onClick={() => onRowClick?.(row)}
                    className={`transition-colors ${
                      isSelected
                        ? "bg-blue-50/70 dark:bg-blue-900/20"
                        : "hover:bg-slate-50 dark:hover:bg-slate-700"
                    } ${onRowClick ? "cursor-pointer" : ""}`}
                  >
                    {selectable && (
                      <td
                        className="w-12 px-6 py-3 align-middle text-sm"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={(e) => onSelectRow?.(rowId, e.target.checked)}
                          className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                        />
                      </td>
                    )}
                    {columns.map((column) => {
                      const value = row[column.key];

                      return (
                        <td
                          key={String(column.key)}
                          className="whitespace-nowrap px-6 py-3 align-middle text-sm text-text-secondary"
                        >
                          {column.render ? column.render(value, row) : String(value ?? "-")}
                        </td>
                      );
                    })}
                  </tr>
                );
              })
            ) : (
              <tr>
                <td
                  colSpan={columns.length + (selectable ? 1 : 0)}
                  className="px-6 py-8 text-center text-sm text-text-secondary"
                >
                  Data tidak ditemukan
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between border-t border-slate-200 bg-table-card px-6 py-4 dark:border-slate-600">
        <p className="text-xs text-text-secondary">
          Showing {startEntry} to {endEntry} of {sortedData.length} entries
        </p>

        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={handlePreviousPage}
            disabled={safeCurrentPage === 1}
            aria-label="Previous page"
            className="flex h-6 min-w-6 items-center justify-center rounded-xs text-slate-400 transition hover:bg-slate-100 dark:hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <IconChevronLeft size={14} strokeWidth={2} />
          </button>

          {visiblePages.map((page) => (
            <button
              key={page}
              type="button"
              onClick={() => handlePageChange(page)}
              aria-label={`Page ${page}`}
              aria-current={safeCurrentPage === page ? "page" : undefined}
              className={`flex h-6 min-w-6 items-center justify-center rounded-xs text-sm font-medium transition ${
                safeCurrentPage === page
                  ? "bg-blue-900 text-white"
                  : "text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-700"
              }`}
            >
              {page}
            </button>
          ))}

          <button
            type="button"
            onClick={handleNextPage}
            disabled={safeCurrentPage === totalPages || totalPages === 0}
            aria-label="Next page"
            className="flex h-6 min-w-6 items-center justify-center rounded-xs text-slate-400 transition hover:bg-slate-100 dark:hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <IconChevronRight size={14} strokeWidth={2} />
          </button>
        </div>
      </div>
    </div>
  );
}

export default BaseTable;
