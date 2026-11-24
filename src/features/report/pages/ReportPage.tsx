import { useEffect, useState } from "react";

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

import { downloadReport, getReport, reportTabs, type ReportData } from "../services/report.service";

import type {
  ReportFilters as Filters,
  ReportModule,
  ReportSummary,
  TicketStatus,
} from "../types/report.types";

// =====================================
// INITIAL FILTERS
// =====================================

const now = new Date();
const start = new Date(now.getFullYear(), now.getMonth() - 5, 1);
const month = (date: Date) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
const initialFilters: Filters = {
  startDate: month(start),
  endDate: month(now),
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

function helpdeskSummary(data: ReportData | null): ReportSummary {
  const summary = data?.summary ?? {};
  const charts = data?.charts ?? {};
  const statusKeys: [string, TicketStatus, string][] = [
    ["baru", "Baru", "#D0D1D3"],
    ["diklasifikasi", "Diklasisfikasikan", "#F59E0B"],
    ["diproses", "Diproses", "#0D47A1"],
    ["eskalasi", "Eskalasi", "#C2410C"],
    ["terselesaikan", "Terselesaikan", "#10B981"],
    ["ditutup", "Selesai", "#747782"],
    ["ditolak", "Ditolak", "#DC2626"],
  ];
  const statuses = (charts.status_tiket ?? {}) as Record<string, number>;
  const sla = (charts.sla ?? {}) as Record<string, number>;
  const categories = (charts.tiket_per_kategori ?? {}) as Record<
    string,
    { kategori: string; jumlah: number }[]
  >;
  return {
    total: summary.jumlah_tiket_masuk ?? 0,
    resolved: summary.jumlah_tiket_selesai ?? 0,
    rejected: summary.jumlah_tiket_ditolak ?? 0,
    averageResolutionHours: summary.rata_rata_waktu_penyelesaian ?? 0,
    slaPercent: summary.persentase_sla_tercapai ?? 0,
    slaMet: sla.tercapai ?? 0,
    slaLate: sla.terlambat ?? 0,
    monthly: ((charts.tiket_per_bulan ?? []) as { bulan: string; jumlah: number }[]).map(
      (item) => ({ label: item.bulan, count: item.jumlah }),
    ),
    statuses: statusKeys.map(([key, label, color]) => ({
      label,
      color,
      count: statuses[key] ?? 0,
    })),
    categories: ["sarpras", "tik"].map((key) => ({
      group: `Kategori ${key === "tik" ? "TIK" : "Sarpras"}`,
      items: (categories[key] ?? []).map((item) => ({ label: item.kategori, count: item.jumlah })),
    })),
  };
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

  const [data, setData] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const controller = new AbortController();
    getReport(applied, controller.signal)
      .then(setData)
      .catch((err) => {
        if (!controller.signal.aborted)
          setError(err instanceof Error ? err.message : "Gagal memuat laporan.");
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });
    return () => controller.abort();
  }, [applied]);
  const summary = helpdeskSummary(data);
  const totalKey = {
    helpdesk: "jumlah_tiket_masuk",
    inventaris: "total_aset",
    maintenance: "jumlah_jadwal",
    "desain-grafis": "jumlah_request_masuk",
  }[applied.module];
  const hasData = !!data && (data.summary[totalKey] ?? 0) > 0;

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

    if (
      (draft.module === "helpdesk" || draft.module === "desain-grafis") &&
      (!draft.startDate || !draft.endDate)
    ) {
      setError("Periode awal dan akhir wajib diisi.");
      return;
    }
    setError("");
    setLoading(true);
    setData(null);
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
      startDate: applied.startDate || initialFilters.startDate,
      endDate: applied.endDate || initialFilters.endDate,
      classification: "all",
      status: "all",
      location: "all",
    };

    setDraft(nextFilters);
    setLoading(true);
    setData(null);
    setApplied(nextFilters);

    setShowAllCategories(false);
  }

  // =====================================
  // DOWNLOAD CSV
  // =====================================

  async function handleDownload(format: "pdf" | "excel") {
    try {
      await downloadReport(applied, format === "excel" ? "xlsx" : "pdf");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal mengunduh laporan.");
    }
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
          hasData={hasData}
          error={error}
        />

        {/* ========================== */}
        {/* HELPDESK DASHBOARD */}
        {/* ========================== */}

        {loading && <p className="text-sm text-slate-500">Memuat laporan...</p>}

        {data && applied.module === "helpdesk" && (
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
                    total={summary.slaMet + summary.slaLate}
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

        {data && applied.module === "inventaris" && (
          <InventoryDashboard
            data={data}
            showAll={showAllCategories}
            onToggle={handleToggleCategories}
          />
        )}

        {/* ========================== */}
        {/* MAINTENANCE DASHBOARD */}
        {/* ========================== */}

        {data && applied.module === "maintenance" && (
          <MaintenanceDashboard
            data={data}
            showAll={showAllCategories}
            onToggle={handleToggleCategories}
          />
        )}

        {/* ========================== */}
        {/* DESIGN DASHBOARD */}
        {/* ========================== */}

        {data && applied.module === "desain-grafis" && (
          <DesignDashboard
            data={data}
            showAll={showAllCategories}
            onToggle={handleToggleCategories}
          />
        )}
      </div>
    </main>
  );
}
