import { useEffect, useState } from "react";
import { IconAdjustmentsHorizontal, IconInfoCircle, IconX } from "@tabler/icons-react";
import Button from "@/components/ui/ui-template/Button";
import Dropdown from "@/components/ui/ui-template/Dropdown";
import Search from "@/components/ui/ui-template/Search";
import { cn } from "@/lib/utils";
import DesignRequestTable from "../components/DesignRequestTable";
import DesignStatusBadge from "../components/DesignStatusBadge";
import { DESIGN_STATUS_LIST, designGraphicService } from "../services/designGraphicService";
import type { DesignRequestItem } from "../types/designGraphic.types";

const DESKTOP_FILTER_OPTIONS = ["Semua status", ...DESIGN_STATUS_LIST];

export default function KelolaRequestPage() {
  const [items, setItems] = useState<DesignRequestItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("Semua status");

  // Mobile filter sheet state
  const [showMobileFilter, setShowMobileFilter] = useState(false);
  const [mobileTempStatus, setMobileTempStatus] = useState("");

  const loadData = async (query = searchTerm, currentStatus = statusFilter) => {
    setIsLoading(true);
    try {
      const data = await designGraphicService.getRequests(query, currentStatus);
      setItems(data);
    } catch (err) {
      console.error("Gagal memuat daftar kelola request:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    let active = true;
    designGraphicService
      .getRequests("", "Semua status")
      .then((data) => {
        if (active) {
          setItems(data);
        }
      })
      .catch((err) => {
        console.error("Gagal memuat daftar kelola request:", err);
      })
      .finally(() => {
        if (active) {
          setIsLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, []);

  const handleSearchChange = (val: string) => {
    setSearchTerm(val);
    void loadData(val, statusFilter);
  };

  const handleSelectDesktopStatus = (status: string) => {
    setStatusFilter(status);
    void loadData(searchTerm, status);
  };

  const handleOpenMobileFilter = () => {
    setMobileTempStatus(statusFilter === "Semua status" ? "" : statusFilter);
    setShowMobileFilter(true);
  };

  const handleApplyMobileFilter = () => {
    const applied = mobileTempStatus || "Semua status";
    setStatusFilter(applied);
    setShowMobileFilter(false);
    void loadData(searchTerm, applied);
  };

  const handleResetMobileFilter = () => {
    setMobileTempStatus("");
    setStatusFilter("Semua status");
    setShowMobileFilter(false);
    void loadData(searchTerm, "Semua status");
  };

  return (
    <div className="min-w-0 space-y-4 p-3 m-1 md:m-5 md:space-y-5 md:p-0">
      {/*mobile */}
      <div className="space-y-4 md:hidden">
        {/* Search & Filter Button */}
        <div className="flex items-center gap-2">
          <div className="min-w-0 flex-1">
            <Search
              value={searchTerm}
              onChange={handleSearchChange}
              placeholder="Cari nomor atau judul request..."
            />
          </div>

          <button
            type="button"
            onClick={handleOpenMobileFilter}
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border border-med-border bg-table-card text-text-secondary transition hover:bg-slate-100 dark:hover:bg-slate-800"
            aria-label="Filter Status"
          >
            <IconAdjustmentsHorizontal size={19} strokeWidth={1.8} />
          </button>
        </div>

        {/* Mobile Card*/}
        {isLoading ? (
          <div className="flex min-h-40 items-center justify-center text-sm text-text-secondary">
            Memuat daftar kelola request...
          </div>
        ) : items.length === 0 ? (
          <div className="flex min-h-[65dvh] items-center justify-center px-4">
            <div className="flex items-center justify-center gap-2 text-text-secondary">
              <IconInfoCircle size={18} strokeWidth={1.8} className="shrink-0" />
              <p className="text-xs font-normal">Data request tidak ditemukan!</p>
            </div>
          </div>
        ) : (
          <div className="space-y-2.5">
            <h1 className="font-poppins text-base font-semibold text-text-title">Kelola Request</h1>

            {items.map((item) => (
              <div
                key={item.id}
                className="overflow-hidden rounded-xl border border-slate-200 bg-table-card p-4 shadow-2xs dark:border-slate-700"
              >
                <div className="flex items-start justify-between border-b border-slate-100 pb-2.5 dark:border-slate-700">
                  <div>
                    <p className="text-xs font-medium text-text-title">Nomor Request</p>
                    <p className="mt-0.5 text-xs text-text-secondary">{item.nomorRequest}</p>
                  </div>
                  <DesignStatusBadge status={item.status} />
                </div>

                <div className="mt-2.5 space-y-1">
                  <p className="text-xs font-semibold text-text">{item.judulRequest}</p>
                  <p className="text-xs text-text-secondary">
                    Unit : <span className="font-semibold text-text">{item.unit}</span>
                  </p>
                  <p className="text-xs text-text-secondary">
                    Tanggal Dibutuhkan :{" "}
                    <span className="font-semibold text-text">{item.tanggalDibutuhkan}</span>
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Mobile Filter Status Bottom Sheet */}
        {showMobileFilter && (
          <div className="fixed inset-0 z-100 md:hidden">
            <button
              type="button"
              aria-label="Tutup filter"
              onClick={() => setShowMobileFilter(false)}
              className="absolute inset-0 h-full w-full bg-black/40"
            />

            <div
              role="dialog"
              aria-modal="true"
              className="absolute inset-x-0 bottom-0 flex max-h-[90dvh] flex-col overflow-hidden rounded-t-3xl border border-med-border bg-table-card shadow-xl"
            >
              <div className="flex shrink-0 items-center justify-between px-5 py-4">
                <h2 className="font-poppins text-base font-semibold text-text-title">
                  Filter Status
                </h2>

                <button
                  type="button"
                  onClick={() => setShowMobileFilter(false)}
                  aria-label="Tutup filter"
                  className="flex h-8 w-8 items-center justify-center rounded-full text-slate-500 transition hover:bg-button/40"
                >
                  <IconX size={19} strokeWidth={2} />
                </button>
              </div>

              <div className="min-h-0 flex-1 space-y-3 overflow-y-auto overscroll-contain px-5 pb-5">
                <h3 className="font-poppins text-xs font-medium text-text-title">Status</h3>

                <div className="flex flex-wrap gap-2">
                  {DESIGN_STATUS_LIST.map((st) => {
                    const isSelected = mobileTempStatus === st;
                    return (
                      <button
                        key={st}
                        type="button"
                        onClick={() => setMobileTempStatus(isSelected ? "" : st)}
                        className={cn(
                          "inline-flex min-h-10 items-center gap-2 rounded-lg border px-3.5 py-2 text-xs font-medium transition-colors",
                          isSelected
                            ? "border-primary-600 bg-selected text-primary-600 ring-1 ring-primary-600/20"
                            : "border-med-border bg-table-card text-text-title hover:bg-button/40",
                        )}
                      >
                        {st}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="shrink-0 bg-table-card px-5 py-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
                <div className="grid grid-cols-2 gap-3">
                  <Button
                    type="button"
                    variant="secondary"
                    label="Reset"
                    onClick={handleResetMobileFilter}
                    className="w-full"
                  />
                  <Button
                    type="button"
                    label="Terapkan"
                    onClick={handleApplyMobileFilter}
                    className="w-full"
                  />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/*desktop */}
      <div className="hidden md:block space-y-5">
        <h1 className="font-poppins text-xl font-semibold text-text-title">Kelola Request</h1>

        <div className="rounded-xl border border-med-border bg-table-card p-4 md:p-5">
          {/* Search & Status Dropdown Bar */}
          <div className="mb-5 flex items-center gap-3">
            <div className="min-w-0 flex-1">
              <Search
                value={searchTerm}
                onChange={handleSearchChange}
                placeholder="Cari nomor atau judul request..."
              />
            </div>

            <Dropdown
              value={statusFilter}
              options={DESKTOP_FILTER_OPTIONS}
              onChange={handleSelectDesktopStatus}
              placeholder="Semua status"
              className="w-48 shrink-0 [&_button]:h-11"
            />
          </div>

          {/* Table */}
          <DesignRequestTable items={items} isLoading={isLoading} />
        </div>
      </div>
    </div>
  );
}
