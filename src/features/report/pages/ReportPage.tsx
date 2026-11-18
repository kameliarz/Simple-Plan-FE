import { useMemo, useState } from "react";

import ReportFilters from "../components/ReportFilters";

import {
  CategoryChart,
  ChartCard,
  DonutChart,
  MonthlyChart,
  NoData,
} from "../components/ReportCharts";

import {
  InventoryDashboard,
  MaintenanceDashboard,
  DesignDashboard,
} from "../components/OtherReportDashboard";

import { getOtherReportRows } from "../services/otherReport.service";

import { downloadReportCsv, getReport, reportTabs } from "../services/report.service";

import type { ReportFilters as Filters, ReportModule } from "../types/report.types";

// =====================================
// INITIAL FILTERS
// =====================================

const initialFilters: Filters = {
  startDate: "",
  endDate: "",
  service: "all",
  module: "helpdesk",

  classification: "all",
  status: "all",
  location: "all",
};

// =====================================
// METRIC CARD
// =====================================

interface MetricCardProps {
  label: string;
  value: string | number;
  suffix?: string;
}

function MetricCard({ label, value, suffix }: MetricCardProps) {
  return (
    <article
      className="
        min-w-0 rounded-xl bg-white
        px-4 py-4 shadow-sm
        dark:bg-slate-900
      "
    >
      <p
        className="
          min-h-8 text-xs
          text-slate-500
          dark:text-slate-400
        "
      >
        {label}
      </p>

      <p
        className="
          mt-2 text-2xl font-semibold
          tracking-tight text-slate-800
          dark:text-slate-50
        "
      >
        {value}

        {suffix && (
          <span
            className="
              ml-1 text-xs font-normal
              text-slate-500
            "
          >
            {suffix}
          </span>
        )}
      </p>
    </article>
  );
}

// =====================================
// CSV HELPER
// =====================================

function escapeCsv(value: string | number) {
  const raw = String(value ?? "");

  const safeValue = /^[=+\-@\t\r]/.test(raw) ? `'${raw}` : raw;

  return `"${safeValue.replace(/"/g, '""')}"`;
}

function downloadOtherReportCsv(rows: Record<string, string | number>[], filename: string) {
  if (rows.length === 0) {
    return;
  }

  const headers = Object.keys(rows[0]);

  const csvRows = [headers, ...rows.map((row) => headers.map((header) => row[header] ?? ""))];

  const csvContent = "\uFEFF" + csvRows.map((row) => row.map(escapeCsv).join(",")).join("\r\n");

  const blob = new Blob([csvContent], {
    type: "text/csv;charset=utf-8;",
  });

  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = filename;

  document.body.appendChild(link);
  link.click();
  link.remove();

  URL.revokeObjectURL(url);
}

// =====================================
// MAIN REPORT PAGE
// =====================================

export default function ReportPage() {
  // =====================================
  // STATES
  // =====================================

  const [draft, setDraft] = useState<Filters>(initialFilters);

  const [applied, setApplied] = useState<Filters>(initialFilters);

  const [error, setError] = useState("");

  const [showAllCategories, setShowAllCategories] = useState(false);

  // =====================================
  // GET HELPDESK DATA
  // =====================================

  const { tickets, summary } = useMemo(() => getReport(applied), [applied]);

  const hasData = summary.total > 0;

  // =====================================
  // FORMAT NUMBER
  // =====================================

  const formatNumber = (value: number, digits = 0) =>
    value.toLocaleString("id-ID", {
      minimumFractionDigits: digits,
      maximumFractionDigits: digits,
    });

  // =====================================
  // VALIDATE PERIOD
  // =====================================

  const isInvalidPeriod = Boolean(
    draft.module !== "inventaris" &&
    draft.startDate &&
    draft.endDate &&
    draft.startDate > draft.endDate,
  );

  // =====================================
  // APPLY FILTER
  // =====================================

  function handleApply() {
    if (isInvalidPeriod) {
      setError("Periode akhir tidak boleh lebih awal dari periode awal.");

      return;
    }

    setError("");
    setApplied({ ...draft });
    setShowAllCategories(false);
  }

  // =====================================
  // CHANGE TAB
  // =====================================

  function handleTabChange(module: ReportModule) {
    setError("");

    const nextFilters = {
      ...applied,
      module,
    };

    setDraft(nextFilters);
    setApplied(nextFilters);

    setShowAllCategories(false);
  }

  // =====================================
  // DOWNLOAD CSV
  // =====================================

  function handleDownload() {
    if (isInvalidPeriod) {
      setError("Periode akhir tidak boleh lebih awal dari periode awal.");
      return;
    }

    // HELPDESK
    if (applied.module === "helpdesk") {
      downloadReportCsv(
        tickets,
        `laporan-helpdesk-${applied.startDate || "semua"}-${applied.endDate || "semua"}.csv`,
      );

      return;
    }

    // OTHER REPORTS
    const rows = getOtherReportRows(applied);

    if (rows.length === 0) {
      setError("Tidak ada data laporan yang dapat diunduh.");
      return;
    }

    setError("");

    const filename =
      applied.module === "inventaris"
        ? "laporan-inventaris.csv"
        : `laporan-${applied.module}-${applied.startDate || "semua"}-${applied.endDate || "semua"}.csv`;

    downloadOtherReportCsv(rows, filename);
  }

  // =====================================
  // HELPDESK CATEGORY ITEMS
  // =====================================

  const categoryGroups = showAllCategories
    ? summary.categories
    : summary.categories.map((group) => ({
        ...group,
        items: group.items.slice(0, 3),
      }));

  // =====================================
  // SHOW MORE
  // =====================================

  function handleToggleCategories() {
    setShowAllCategories((current) => !current);
  }

  // =====================================
  // RENDER
  // =====================================

  return (
    <main
      className="
        min-h-screen bg-[#f5f7fc]
        px-4 py-5
        dark:bg-slate-950
        sm:px-6
      "
    >
      <div className="mx-auto max-w-7xl space-y-4">
        {/* ========================== */}
        {/* TABS */}
        {/* ========================== */}

        <nav
          aria-label="Kategori laporan"
          className="
            flex gap-6 overflow-x-auto
            border-b border-slate-200
            dark:border-slate-800
          "
        >
          {reportTabs.map((tab) => {
            const isActive = applied.module === tab.value;

            return (
              <button
                key={tab.value}
                type="button"
                onClick={() => handleTabChange(tab.value)}
                aria-current={isActive ? "page" : undefined}
                className={`
                  shrink-0 border-b-2 pb-3
                  text-sm transition

                  ${
                    isActive
                      ? `
                        border-[#0b4ca5]
                        font-semibold
                        text-[#0b4ca5]
                      `
                      : `
                        border-transparent
                        text-slate-400
                        hover:text-slate-700
                        dark:hover:text-slate-200
                      `
                  }
                `}
              >
                {tab.label}
              </button>
            );
          })}
        </nav>

        {/* ========================== */}
        {/* FILTERS */}
        {/* ========================== */}

        <ReportFilters
          value={draft}
          onChange={(next) => {
            setDraft(next);
            setError("");
          }}
          onApply={handleApply}
          onDownload={handleDownload}
          error={error}
        />

        {/* ========================== */}
        {/* HELPDESK DASHBOARD */}
        {/* ========================== */}

        {applied.module === "helpdesk" && (
          <>
            {/* SUMMARY CARDS */}

            <div
              className="
                grid grid-cols-2 gap-3
                md:grid-cols-3
                xl:grid-cols-5
              "
            >
              <MetricCard label="Tiket Masuk" value={formatNumber(summary.total)} />

              <MetricCard label="Tiket Selesai" value={formatNumber(summary.resolved)} />

              <MetricCard label="Tiket Ditolak" value={formatNumber(summary.rejected)} />

              <MetricCard
                label="Rata-rata Waktu Penyelesaian"
                value={formatNumber(summary.averageResolutionHours, 1)}
                suffix="jam"
              />

              <MetricCard
                label="SLA Tercapai"
                value={formatNumber(summary.slaPercent, 2)}
                suffix="%"
              />
            </div>

            {/* MONTHLY CHART */}

            <ChartCard title="Jumlah Tiket per Bulan">
              {hasData ? <MonthlyChart data={summary.monthly} /> : <NoData className="min-h-52" />}
            </ChartCard>

            {/* STATUS & SLA */}

            <div className="grid gap-4 lg:grid-cols-2">
              {/* STATUS TIKET */}

              <ChartCard title="Status Tiket">
                {hasData ? (
                  <DonutChart
                    total={summary.total}
                    centerLabel="Tiket"
                    segments={summary.statuses}
                  />
                ) : (
                  <NoData />
                )}
              </ChartCard>

              {/* KETERCAPAIAN SLA */}

              <ChartCard title="Ketercapaian SLA">
                {hasData ? (
                  <DonutChart
                    total={summary.total}
                    centerLabel="Tiket"
                    segments={[
                      {
                        label: "Tercapai",
                        count: summary.slaMet,
                        color: "#063f93",
                      },
                      {
                        label: "Terlambat",
                        count: summary.slaLate,
                        color: "#27a7e8",
                      },
                    ]}
                  />
                ) : (
                  <NoData />
                )}
              </ChartCard>
            </div>

            {/* CATEGORY CHART */}

            <ChartCard title="Tiket per Kategori">
              {hasData ? (
                <>
                  <CategoryChart groups={categoryGroups} />

                  {summary.categories.some((group) => group.items.length > 3) && (
                    <button
                      type="button"
                      className="
                        mt-5 w-full rounded-md
                        border border-slate-200
                        py-2 text-xs
                        text-slate-500
                        hover:bg-slate-50
                        dark:border-slate-700
                        dark:hover:bg-slate-800
                      "
                      onClick={handleToggleCategories}
                    >
                      {showAllCategories ? "Show less ⌃" : "Show more ⌄"}
                    </button>
                  )}
                </>
              ) : (
                <NoData className="min-h-60" />
              )}
            </ChartCard>
          </>
        )}

        {/* ========================== */}
        {/* INVENTORY DASHBOARD */}
        {/* ========================== */}

        {applied.module === "inventaris" && (
          <InventoryDashboard
            filters={applied}
            showAll={showAllCategories}
            onToggle={handleToggleCategories}
          />
        )}

        {/* ========================== */}
        {/* MAINTENANCE DASHBOARD */}
        {/* ========================== */}

        {applied.module === "maintenance" && (
          <MaintenanceDashboard
            filters={applied}
            showAll={showAllCategories}
            onToggle={handleToggleCategories}
          />
        )}

        {/* ========================== */}
        {/* DESIGN DASHBOARD */}
        {/* ========================== */}

        {applied.module === "desain-grafis" && (
          <DesignDashboard
            filters={applied}
            showAll={showAllCategories}
            onToggle={handleToggleCategories}
          />
        )}
      </div>
    </main>
  );
}
