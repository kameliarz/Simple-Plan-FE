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
import BackupRestoreModal from "../components/BackupRestoreModal";

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

const jakartaDateFormatter = new Intl.DateTimeFormat("en-CA", {
  timeZone: "Asia/Jakarta",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

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

  // SCHEDULE
  const [schedule, setSchedule] = useState<BackupSchedule>(initialSchedule);

  const scheduleButtonRef = useRef<HTMLDivElement>(null);

  // LOADING
  const [isLoading, setIsLoading] = useState(true);
  const [isBackingUp, setIsBackingUp] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);

  const operationRef = useRef<"backup" | "restore" | null>(null);

  // MODALS
  const [showScheduleModal, setShowScheduleModal] = useState(false);

  const [showBackupModal, setShowBackupModal] = useState(false);

  const [showMobileFilter, setShowMobileFilter] = useState(false);

  const [restoreTarget, setRestoreTarget] = useState<Backup | null>(null);

  // ==========================================
  // FETCH BACKUPS
  // ==========================================

  useEffect(() => {
    let active = true;

    const loadData = async () => {
      try {
        setIsLoading(true);

        const [backupData, scheduleData] = await Promise.all([
          backupService.getBackups(),
          backupService.getSchedule(),
        ]);

        if (!active) return;

        setBackups(backupData);
        setSchedule(scheduleData);
      } catch (error) {
        if (!active) return;

        console.error("Gagal memuat backup:", error);

        showToast("Gagal memuat data back up!", "error");
      } finally {
        if (active) setIsLoading(false);
      }
    };

    void loadData();

    return () => {
      active = false;
    };
  }, [showToast]);

  // ==========================================
  // FILTER
  // ==========================================

  const filteredBackups = useMemo(() => {
    const search = filters.search.trim().toLowerCase();

    return backups.filter((backup) => {
      const matchSearch =
        backup.fileName.toLowerCase().includes(search) ||
        backup.performedBy.toLowerCase().includes(search);

      const matchType = filters.type === "all" || backup.type === filters.type;

      const matchStatus = filters.status === "all" || backup.status === filters.status;

      const date = new Date(backup.backupDate);

      const backupDate = Number.isNaN(date.getTime()) ? "" : jakartaDateFormatter.format(date);

      const matchStart =
        !filters.startDate || (backupDate !== "" && backupDate >= filters.startDate);

      const matchEnd = !filters.endDate || (backupDate !== "" && backupDate <= filters.endDate);

      return matchSearch && matchType && matchStatus && matchStart && matchEnd;
    });
  }, [backups, filters]);

  // ==========================================
  // PAGINATION
  // ==========================================

  const total = filteredBackups.length;

  const lastPage = Math.max(1, Math.ceil(total / ITEMS_PER_PAGE));

  const currentPage = Math.min(page, lastPage);

  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;

  const paginatedBackups = filteredBackups.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  const paginationMeta: ApiMeta = {
    current_page: currentPage,
    last_page: lastPage,
    per_page: ITEMS_PER_PAGE,
    total,
    from: total === 0 ? null : startIndex + 1,
    to: total === 0 ? null : Math.min(startIndex + ITEMS_PER_PAGE, total),
    path: "/back-up-data",
    links: [],
  };

  // ==========================================
  // FILTER HANDLERS
  // ==========================================

  const handleFilterChange = (nextFilters: BackupFilters) => {
    setFilters(nextFilters);
    setPage(1);
  };

  const handleSearchChange = (value: string) => {
    setFilters((previous) => ({
      ...previous,
      search: value,
    }));

    setPage(1);
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

      showToast("Masih ada proses back up atau pemulihan yang berjalan", "warning");
      return;
    }

    operationRef.current = "backup";

    try {
      setIsBackingUp(true);
      setShowBackupModal(false);

      await backupService.createBackup();

      showToast("Back up berhasil!", "success");

      try {
        const updated = await backupService.getBackups();
        setBackups(updated);
        setPage(1);
      } catch (error) {
        console.error("Gagal memperbarui riwayat:", error);
      }
    } catch (error) {
      console.error("Gagal backup:", error);

      if (getErrorStatus(error) === 409) {
        showToast("Masih ada proses back up atau pemulihan yang berjalan", "warning");
      } else {
        showToast("Back up gagal, silahkan coba kembali!", "error");
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
      await backupService.downloadBackup(backup.id);
    } catch (error) {
      console.error("Gagal download:", error);

      if (getErrorStatus(error) === 404) {
        showToast("File back up tidak ditemukan", "error");
      } else {
        showToast("Gagal mengunduh file back up!", "error");
      }
    }
  };

  // ==========================================
  // RESTORE
  // ==========================================

  const handleRestore = async () => {
    if (!restoreTarget) return;

    if (operationRef.current !== null) {
      setRestoreTarget(null);

      showToast("Masih ada proses back up atau pemulihan yang berjalan", "warning");
      return;
    }

    operationRef.current = "restore";

    try {
      setIsRestoring(true);

      await backupService.restoreBackup(restoreTarget.id);

      showToast("Pemulihan berhasil!", "success");
      setRestoreTarget(null);
    } catch (error) {
      console.error("Gagal restore:", error);

      if (getErrorStatus(error) === 409) {
        showToast("Masih ada proses back up atau pemulihan yang berjalan", "warning");
      } else if (getErrorStatus(error) === 404) {
        showToast("File back up tidak ditemukan", "error");
      } else {
        showToast("Pemulihan gagal, silahkan coba kembali!", "error");
      }

      setRestoreTarget(null);
    } finally {
      operationRef.current = null;
      setIsRestoring(false);
    }
  };

  // ==========================================
  // SAVE SCHEDULE
  // ==========================================

  const handleSaveSchedule = async (nextSchedule: BackupSchedule) => {
    try {
      await backupService.saveSchedule(nextSchedule);
      setSchedule(nextSchedule);

      showToast("Backup otomatis berhasil!", "success");
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
          <Search value={filters.search} onChange={handleSearchChange} placeholder="Cari data..." />
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
            ${!isLoading && total === 0 ? "hidden" : "flex"}
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
              onRestore={setRestoreTarget}
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
                onRestore={setRestoreTarget}
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
          RESTORE CONFIRMATION
      ====================================== */}
      <BackupRestoreModal
        show={restoreTarget !== null}
        backup={restoreTarget}
        onClose={() => setRestoreTarget(null)}
        onConfirm={handleRestore}
        isLoading={isRestoring}
      />
    </div>
  );
}
