import { useEffect, useMemo, useRef, useState } from "react";

import { IconCalendar, IconDatabase, IconRefresh, IconFilter } from "@tabler/icons-react";

import Button from "@/components/ui/ui-template/Button";
import Search from "@/components/ui/ui-template/Search";
import { useToast } from "@/components/ui/ui-template/UseToast";

import BackupTablePagination from "../components/BackupTablePagination";
import BackupFilter from "../components/BackupFilter";
import BackupFilterMobile from "../components/BackupFilterMobile";
import BackupMobileList from "../components/BackupMobileList";
import BackupTable from "../components/BackupTable";
import BackupScheduleModal from "../components/BackupScheduleModal";
import BackupConfirmModal from "../components/BackupConfirmModal";
import BackupDeleteModal from "../components/BackupDeleteModal";

import { backupService } from "../services/backupService";

import type { ApiMeta } from "@/types/api";

import type { Backup, BackupFilters, BackupSchedule } from "../types/backup.types";

// ==========================================
// CONSTANTS
// ==========================================

const ITEMS_PER_PAGE = 10;

const initialFilters: BackupFilters = {
  search: "",
  type: "all",
  status: "all",
  startDate: "",
  endDate: "",
};

const initialSchedule: BackupSchedule = {
  enabled: true,
  frequency: "daily",
  time: "02:00",
  dayOfWeek: 1,
  dayOfMonth: 1,
};

// ==========================================
// ERROR HELPERS
// ==========================================

const getErrorStatus = (error: unknown): number | undefined => {
  if (typeof error !== "object" || error === null) {
    return undefined;
  }

  const value = error as {
    status?: number;
    response?: {
      status?: number;
    };
  };

  return value.response?.status ?? value.status;
};

// ==========================================
// MAIN PAGE
// ==========================================

export default function BackupDataPage() {
  const { showToast } = useToast();

  // DATA
  const [backups, setBackups] = useState<Backup[]>([]);
  const [filters, setFilters] = useState<BackupFilters>(initialFilters);
  const [page, setPage] = useState(1);
  const [refresh, setRefresh] = useState(0);
  const [scheduleReady, setScheduleReady] = useState(false);
  const [paginationMeta, setPaginationMeta] = useState<ApiMeta>({
    current_page: 1,
    last_page: 1,
    per_page: ITEMS_PER_PAGE,
    total: 0,
    from: null,
    to: null,
    path: "/backups",
    links: [],
  });

  // SCHEDULE
  const [schedule, setSchedule] = useState<BackupSchedule>(initialSchedule);

  const scheduleButtonRef = useRef<HTMLDivElement>(null);

  // LOADING
  const [isLoading, setIsLoading] = useState(true);
  const [isBackingUp, setIsBackingUp] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const operationRef = useRef<"backup" | "delete" | null>(null);

  // MODALS
  const [showScheduleModal, setShowScheduleModal] = useState(false);

  const [showBackupModal, setShowBackupModal] = useState(false);

  const [showMobileFilter, setShowMobileFilter] = useState(false);

  const [deleteTarget, setDeleteTarget] = useState<Backup | null>(null);

  // ==========================================
  // FETCH BACKUPS
  // ==========================================

  useEffect(() => {
    const controller = new AbortController();
    let active = true;
    let loading = false;
    const loadData = async (silent = false) => {
      if (loading) return;
      loading = true;
      if (!silent) setIsLoading(true);
      try {
        const result = await backupService.getBackups(
          page,
          ITEMS_PER_PAGE,
          {
            search: "",
            type: filters.type,
            status: filters.status,
            startDate: filters.startDate,
            endDate: filters.endDate,
          },
          controller.signal,
        );
        if (!active) return;
        if (page > result.meta.last_page) {
          setPage(Math.max(1, result.meta.last_page));
          return;
        }
        setBackups(result.backups);
        setPaginationMeta(result.meta);
      } catch (error) {
        if (active && !silent) {
          setBackups([]);
          showToast(error instanceof Error ? error.message : "Gagal memuat data back up!", "error");
        }
      } finally {
        loading = false;
        if (active && !silent) setIsLoading(false);
      }
    };
    void loadData();
    const interval = window.setInterval(() => {
      void loadData(true);
    }, 10000);
    return () => {
      active = false;
      controller.abort();
      window.clearInterval(interval);
    };
  }, [page, filters.type, filters.status, filters.startDate, filters.endDate, refresh, showToast]);

  useEffect(() => {
    let active = true;
    void backupService
      .getSchedule()
      .then((data) => {
        if (active) {
          setSchedule(data);
          setScheduleReady(true);
        }
      })
      .catch((error: unknown) => {
        if (active)
          showToast(
            error instanceof Error ? error.message : "Gagal memuat jadwal back up!",
            "error",
          );
      });
    return () => {
      active = false;
    };
  }, [showToast]);

  // The API has no search parameter; search only the currently loaded page.
  const paginatedBackups = useMemo(() => {
    const search = filters.search.trim().toLowerCase();
    return backups.filter(
      (backup) =>
        backup.fileName.toLowerCase().includes(search) ||
        backup.performedBy.toLowerCase().includes(search),
    );
  }, [backups, filters.search]);
  const total = paginationMeta.total;
  const lastPage = paginationMeta.last_page;

  // ==========================================
  // FILTER HANDLERS
  // ==========================================

  const handleFilterChange = (nextFilters: BackupFilters) => {
    setFilters(nextFilters);
    if (
      nextFilters.type !== filters.type ||
      nextFilters.status !== filters.status ||
      nextFilters.startDate !== filters.startDate ||
      nextFilters.endDate !== filters.endDate
    )
      setPage(1);
  };

  const handleSearchChange = (value: string) => {
    setFilters((previous) => ({
      ...previous,
      search: value,
    }));
  };

  const handlePageChange = (nextPage: number) => {
    if (nextPage < 1 || nextPage > lastPage) return;
    setPage(nextPage);
  };

  // ==========================================
  // BACKUP MANUAL
  // ==========================================

  const handleCreateBackup = async () => {
    if (operationRef.current !== null) {
      setShowBackupModal(false);

      showToast("Masih ada proses back up atau penghapusan yang berjalan", "warning");
      return;
    }

    operationRef.current = "backup";

    try {
      setIsBackingUp(true);
      setShowBackupModal(false);

      await backupService.createBackup();

      showToast("Back up masuk antrean. Status akan diperbarui otomatis.", "success");

      setPage(1);
      setRefresh((value) => value + 1);
    } catch (error) {
      console.error("Gagal backup:", error);

      if (getErrorStatus(error) === 409) {
        showToast("Masih ada proses back up atau penghapusan yang berjalan", "warning");
      } else {
        showToast(
          error instanceof Error ? error.message : "Back up gagal, silahkan coba kembali!",
          "error",
        );
      }
    } finally {
      operationRef.current = null;
      setIsBackingUp(false);
    }
  };

  // ==========================================
  // DOWNLOAD
  // ==========================================

  const handleDownload = async (backup: Backup) => {
    try {
      await backupService.downloadBackup(backup.id, backup.fileName);
    } catch (error) {
      console.error("Gagal download:", error);

      if (getErrorStatus(error) === 404) {
        showToast("File back up tidak ditemukan", "error");
      } else {
        showToast(
          error instanceof Error ? error.message : "Gagal mengunduh file back up!",
          "error",
        );
      }
    }
  };

  // ==========================================
  // DELETE
  // ==========================================

  const handleDelete = async () => {
    if (!deleteTarget) return;

    if (operationRef.current !== null) {
      setDeleteTarget(null);

      showToast("Masih ada proses back up atau penghapusan yang berjalan", "warning");
      return;
    }

    operationRef.current = "delete";

    try {
      setIsDeleting(true);

      await backupService.deleteBackup(deleteTarget.id);

      setBackups((previous) =>
        previous.map((backup) =>
          backup.id === deleteTarget.id ? { ...backup, fileAvailable: false } : backup,
        ),
      );
      setRefresh((value) => value + 1);
      showToast("File back up berhasil dihapus!", "success");
      setDeleteTarget(null);
    } catch (error) {
      console.error("Gagal menghapus:", error);

      if (getErrorStatus(error) === 404) {
        showToast("File back up tidak ditemukan", "error");
      } else {
        showToast(
          error instanceof Error ? error.message : "Data gagal dihapus, silahkan coba kembali!",
          "error",
        );
      }

      setDeleteTarget(null);
    } finally {
      operationRef.current = null;
      setIsDeleting(false);
    }
  };

  // ==========================================
  // SAVE SCHEDULE
  // ==========================================

  const handleSaveSchedule = async (nextSchedule: BackupSchedule) => {
    try {
      await backupService.saveSchedule(nextSchedule);
      setSchedule(nextSchedule);

      showToast("Jadwal backup otomatis berhasil disimpan!", "success");
    } catch (error) {
      console.error("Gagal menyimpan jadwal:", error);

      showToast("Gagal menyimpan jadwal back up!", "error");

      throw error;
    }
  };

  // ==========================================
  // RENDER
  // ==========================================

  return (
    <div className="min-w-0 space-y-4 p-3 m-1 md:m-5 md:space-y-5 md:p-0">
      {/* ======================================
          MOBILE SEARCH
      ====================================== */}
      <div className="flex items-center gap-2 md:hidden">
        <div className="min-w-0 flex-1">
          <Search
            value={filters.search}
            onChange={handleSearchChange}
            placeholder="Cari di halaman ini..."
          />
        </div>

        <button
          type="button"
          onClick={() => setShowMobileFilter(true)}
          aria-label="Buka filter backup"
          aria-haspopup="dialog"
          aria-expanded={showMobileFilter}
          className="
            flex h-11 w-11 shrink-0
            items-center justify-center
            rounded-lg border border-med-border
            bg-table-card text-text-secondary
            transition hover:bg-slate-100
            dark:hover:bg-slate-800
          "
        >
          <IconFilter size={19} strokeWidth={1.8} />
        </button>
      </div>

      {/* ======================================
          PAGE HEADER
      ====================================== */}
      <div
        className={`
            items-center justify-between gap-2
            md:flex
            flex
        `}
      >
        <h1 className="font-semibold text-text-title md:text-xl">
          <span className="md:hidden">History Back Up</span>

          <span className="hidden md:inline">Back Up Data</span>
        </h1>

        <div className="flex shrink-0 items-center gap-2">
          {/* ATUR JADWAL */}
          <div ref={scheduleButtonRef}>
            <Button
              label="Atur Jadwal"
              disabled={!scheduleReady}
              icon={<IconCalendar size={15} />}
              variant="secondary"
              size="sm"
              onClick={() => setShowScheduleModal((prev) => !prev)}
              aria-expanded={showScheduleModal}
              aria-haspopup="dialog"
              className="px-2 text-xs sm:px-3 sm:text-xs"
            />
          </div>

          {/* BACKUP */}
          <Button
            label="Back Up"
            disabled={
              isBackingUp ||
              isDeleting ||
              backups.some(
                (backup) => backup.status === "pending" || backup.status === "processing",
              )
            }
            icon={<IconDatabase size={15} />}
            size="sm"
            onClick={() => setShowBackupModal(true)}
            className="px-2 text-xs sm:px-3 sm:text-xs"
          />
        </div>
      </div>

      {/* ======================================
          MOBILE BACKUP LIST
      ====================================== */}
      <div className="md:hidden">
        {isLoading ? (
          <div className="flex min-h-40 items-center justify-center gap-2 text-sm text-text-secondary">
            <IconRefresh size={18} className="animate-spin" />
            Memuat data backup...
          </div>
        ) : (
          <>
            <BackupMobileList
              backups={paginatedBackups}
              onDownload={handleDownload}
              onDelete={setDeleteTarget}
            />

            {total > 0 && (
              <div className="mt-3 overflow-hidden rounded-lg border border-med-border">
                <BackupTablePagination meta={paginationMeta} onPageChange={handlePageChange} />
              </div>
            )}
          </>
        )}
      </div>

      {/* ======================================
          DESKTOP CONTENT
      ====================================== */}
      <div className="hidden rounded-xl border border-med-border bg-table-card p-4 md:block md:p-5">
        {/* DESKTOP FILTER */}
        <BackupFilter filters={filters} onChange={handleFilterChange} />

        {/* TABLE */}
        <div className="mt-5 rounded-lg border border-med-border">
          {isLoading ? (
            <div className="flex min-h-64 items-center justify-center gap-2 text-sm text-text-secondary">
              <IconRefresh size={20} className="animate-spin" />
              Memuat data backup...
            </div>
          ) : (
            <>
              <BackupTable
                backups={paginatedBackups}
                onDownload={handleDownload}
                onDelete={setDeleteTarget}
              />

              <BackupTablePagination meta={paginationMeta} onPageChange={handlePageChange} />
            </>
          )}
        </div>
      </div>

      {/* ======================================
          MOBILE FILTER MODAL
      ====================================== */}
      <BackupFilterMobile
        show={showMobileFilter}
        filters={filters}
        onClose={() => setShowMobileFilter(false)}
        onApply={handleFilterChange}
      />

      {/* ======================================
          SCHEDULE POPOVER
      ====================================== */}
      <BackupScheduleModal
        show={showScheduleModal}
        schedule={schedule}
        anchorRef={scheduleButtonRef}
        onClose={() => setShowScheduleModal(false)}
        onSave={handleSaveSchedule}
      />

      {/* ======================================
          BACKUP CONFIRMATION
      ====================================== */}
      <BackupConfirmModal
        show={showBackupModal}
        onClose={() => setShowBackupModal(false)}
        onConfirm={handleCreateBackup}
        isLoading={isBackingUp}
      />

      {/* ======================================
          DELETE CONFIRMATION
      ====================================== */}
      <BackupDeleteModal
        show={deleteTarget !== null}
        backup={deleteTarget}
        onClose={() => {
          if (!isDeleting) setDeleteTarget(null);
        }}
        onConfirm={handleDelete}
        isLoading={isDeleting}
      />
    </div>
  );
}
