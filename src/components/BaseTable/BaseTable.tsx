import { useMemo, useState, type ReactNode } from "react";

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
}

function BaseTable<T>({
  columns,
  data,
  itemsPerPage = 4,
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

  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;

    return sortedData.slice(startIndex, endIndex);
  }, [sortedData, currentPage, itemsPerPage]);

  const handleSort = (key: keyof T) => {
    if (sortKey === key) {
      setSortDirection((currentDirection) =>
        currentDirection === "asc" ? "desc" : "asc",
      );
    } else {
      setSortKey(key);
      setSortDirection("asc");
    }

    setCurrentPage(1);
  };

  const handlePreviousPage = () => {
    setCurrentPage((page) => Math.max(page - 1, 1));
  };

  const handleNextPage = () => {
    setCurrentPage((page) =>
      Math.min(page + 1, totalPages),
    );
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const startEntry =
    sortedData.length === 0
      ? 0
      : (currentPage - 1) * itemsPerPage + 1;

  const endEntry = Math.min(
    currentPage * itemsPerPage,
    sortedData.length,
  );

  const visiblePages = Array.from(
    { length: Math.min(totalPages, 3) },
    (_, index) => index + 1,
  );

  return (
    <div className="w-full overflow-hidden rounded-lg border border-gray-200 bg-sidebar">
      <div className="w-full overflow-x-auto">
        <table className="w-full min-w-175">
          <thead>
            <tr className="border-b border-gray-200 bg-background">
              {columns.map((column) => (
                <th
                  key={String(column.key)}
                  className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wide text-text-secondary"
                >
                  {column.sortable ? (
                    <button
                      type="button"
                      onClick={() => handleSort(column.key)}
                      className="inline-flex items-center gap-1.5 transition hover:text-primary"
                    >
                      {column.label}

                      <span className="text-[10px]">
                        {sortKey === column.key
                          ? sortDirection === "asc"
                            ? "↑"
                            : "↓"
                          : "↕"}
                      </span>
                    </button>
                  ) : (
                    column.label
                  )}
                </th>
              ))}
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-200">
            {paginatedData.length > 0 ? (
              paginatedData.map((row, rowIndex) => (
                <tr
                  key={rowIndex}
                  className="transition hover:bg-background"
                >
                  {columns.map((column) => {
                    const value = row[column.key];

                    return (
                      <td
                        key={String(column.key)}
                        className="px-5 py-3 text-sm text-text"
                      >
                        {column.render
                          ? column.render(value, row)
                          : String(value ?? "-")}
                      </td>
                    );
                  })}
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={columns.length}
                  className="px-5 py-8 text-center text-sm text-text-secondary"
                >
                  No entries found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between border-t border-gray-200 px-5 py-3">
        <p className="text-xs text-text-secondary">
          Showing {startEntry} to {endEntry} of{" "}
          {sortedData.length} entries
        </p>

        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={handlePreviousPage}
            disabled={currentPage === 1}
            aria-label="Previous page"
            className="flex h-8 w-8 items-center justify-center text-2xl text-text-secondary transition hover:text-primary disabled:cursor-not-allowed disabled:opacity-40"
          >
            ‹
          </button>

          {visiblePages.map((page) => (
            <button
              key={page}
              type="button"
              onClick={() => handlePageChange(page)}
              aria-label={`Page ${page}`}
              aria-current={
                currentPage === page ? "page" : undefined
              }
              className={`flex h-8 w-8 items-center justify-center rounded-md text-xs font-medium transition ${
                currentPage === page
                  ? "bg-primary text-white"
                  : "text-text-secondary hover:bg-background"
              }`}
            >
              {page}
            </button>
          ))}

          <button
            type="button"
            onClick={handleNextPage}
            disabled={
              currentPage === totalPages || totalPages === 0
            }
            aria-label="Next page"
            className="flex h-8 w-8 items-center justify-center text-2xl text-text-secondary transition hover:text-primary disabled:cursor-not-allowed disabled:opacity-40"
          >
            ›
          </button>
        </div>
      </div>
    </div>
  );
}

export default BaseTable;