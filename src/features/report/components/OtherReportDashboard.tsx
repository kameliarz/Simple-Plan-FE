import type { ReactNode } from "react";

import { ChartCard, DonutChart, MonthlyChart, NoData } from "./ReportCharts";

import {
  assetColors,
  designItems,
  designStatusColors,
  getInventoryAssets,
  getWorkItems,
  maintenanceItems,
} from "../services/otherReport.service";

import type { WorkItem } from "../services/otherReport.service";

import type { ReportFilters } from "../types/report.types";

// =====================================
// CONSTANTS
// =====================================

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"];

const BLUE = "#06469b";

// =====================================
// STAT CARD
// =====================================

interface StatCardProps {
  label: string;
  value: number | string;
  suffix?: string;
}

function StatCard({ label, value, suffix }: StatCardProps) {
  return (
    <article
      className="
        rounded-xl bg-white p-4 shadow-sm
        dark:bg-slate-900
      "
    >
      <p className="min-h-7 text-xs text-slate-500">{label}</p>

      <p
        className="
          mt-1 text-2xl font-semibold
          text-slate-800 dark:text-white
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
// STAT GRID
// =====================================

interface StatGridProps {
  children: ReactNode;
  columns: 3 | 4;
}

function StatGrid({ children, columns }: StatGridProps) {
  return (
    <div
      className={
        columns === 4
          ? "grid grid-cols-2 gap-3 lg:grid-cols-4"
          : "grid grid-cols-2 gap-3 lg:grid-cols-3"
      }
    >
      {children}
    </div>
  );
}

// =====================================
// COUNT HELPER
// =====================================

function getCounts<T>(items: T[], key: (item: T) => string) {
  const counter = new Map<string, number>();

  for (const item of items) {
    const label = key(item);

    counter.set(label, (counter.get(label) ?? 0) + 1);
  }

  return [...counter.entries()]
    .map(([label, count]) => ({
      label,
      count,
    }))
    .sort((a, b) => b.count - a.count);
}

// =====================================
// HORIZONTAL CHART
// =====================================

interface HorizontalChartProps {
  items: {
    label: string;
    count: number;
  }[];
  showAll: boolean;
  onToggle: () => void;
}

function HorizontalChart({ items, showAll, onToggle }: HorizontalChartProps) {
  const max = Math.max(1, ...items.map((item) => item.count));

  const visible = showAll ? items : items.slice(0, 6);

  return (
    <div>
      <div className="space-y-3">
        {visible.map((item) => (
          <div
            key={item.label}
            className="
              grid items-center gap-3
              grid-cols-[minmax(75px,1fr)_minmax(0,4fr)_28px]
            "
          >
            {/* LABEL */}
            <span
              className="
                truncate text-xs
                text-slate-500
              "
              title={item.label}
            >
              {item.label}
            </span>

            {/* BAR */}
            <div
              className="
                h-2 overflow-hidden rounded-full
                bg-slate-100 dark:bg-slate-800
              "
            >
              <div
                className="
                  h-full rounded-full
                "
                style={{
                  backgroundColor: BLUE,
                  width: `${(item.count / max) * 100}%`,
                }}
              />
            </div>

            {/* COUNT */}
            <span
              className="
                text-right text-xs
                text-slate-700
                dark:text-slate-200
              "
            >
              {item.count}
            </span>
          </div>
        ))}
      </div>

      {items.length > 6 && (
        <button
          type="button"
          onClick={onToggle}
          className="
            mt-5 w-full rounded-md
            border border-slate-200
            py-2 text-xs text-slate-500
            hover:bg-slate-50
            dark:border-slate-700
            dark:hover:bg-slate-800
          "
        >
          {showAll ? "Show less ⌃" : "Show more ⌄"}
        </button>
      )}
    </div>
  );
}

// =====================================
// CONDITION CHART
// =====================================

interface ConditionChartProps {
  items: {
    label: string;
    count: number;
  }[];
}

function ConditionChart({ items }: ConditionChartProps) {
  const max = Math.max(1, ...items.map((item) => item.count));

  return (
    <div
      className="
        flex h-44 items-end
        justify-around gap-4
        border-b border-slate-100
        dark:border-slate-800
      "
    >
      {items.map((item) => (
        <div
          key={item.label}
          className="
            flex h-full flex-1
            flex-col items-center
            justify-end gap-2
          "
        >
          {/* COUNT */}
          <span
            className="
              text-xs text-slate-500
              dark:text-slate-300
            "
          >
            {item.count}
          </span>

          {/* BAR */}
          <div
            className="
              flex h-32 w-full
              items-end justify-center
            "
          >
            <div
              className="
                w-full max-w-14 rounded-t-sm
              "
              style={{
                height: `${(item.count / max) * 100}%`,
                backgroundColor: BLUE,
              }}
            />
          </div>

          {/* LABEL */}
          <span
            className="
              text-center text-[10px]
              text-slate-500
              dark:text-slate-300
            "
          >
            {item.label}
          </span>
        </div>
      ))}
    </div>
  );
}

// =====================================
// MONTHLY DATA HELPER
// =====================================

function monthlyData(items: WorkItem[]) {
  return MONTHS.map((label, index) => ({
    label,

    count: items.filter((item) => Number(item.month.slice(5, 7)) === index + 1).length,
  }));
}

// =====================================
// INVENTORY DASHBOARD
// =====================================

interface DashboardProps {
  filters: ReportFilters;
  showAll: boolean;
  onToggle: () => void;
}

export function InventoryDashboard({ filters, showAll, onToggle }: DashboardProps) {
  // FILTERED DATA
  const data = getInventoryAssets(filters);

  const total = data.length;

  // SUMMARY
  const damaged = data.filter((asset) => asset.status === "Rusak").length;

  const borrowed = data.filter((asset) => asset.status === "Dipinjam").length;

  // CHART DATA
  const classification = getCounts(data, (asset) => asset.classification);

  const condition = getCounts(data, (asset) => asset.condition);

  const locations = getCounts(data, (asset) => asset.location);

  return (
    <>
      {/* ========================== */}
      {/* SUMMARY CARDS */}
      {/* ========================== */}

      <StatGrid columns={3}>
        <StatCard label="Total Aset" value={total} />

        <StatCard label="Aset Rusak" value={damaged} />

        <StatCard label="Aset Dipinjam" value={borrowed} />
      </StatGrid>

      {/* ========================== */}
      {/* CLASSIFICATION & CONDITION */}
      {/* ========================== */}

      <div className="grid gap-4 lg:grid-cols-2">
        {/* ASET PER KLASIFIKASI */}

        <ChartCard title="Aset per Klasifikasi">
          {total > 0 ? (
            <DonutChart
              total={total}
              centerLabel="Aset"
              segments={classification.map((item) => ({
                ...item,
                color: assetColors[item.label] || BLUE,
              }))}
            />
          ) : (
            <NoData />
          )}
        </ChartCard>

        {/* ASET PER KONDISI */}

        <ChartCard title="Aset per Kondisi">
          {total > 0 ? <ConditionChart items={condition} /> : <NoData />}
        </ChartCard>
      </div>

      {/* ========================== */}
      {/* ASSET PER LOCATION */}
      {/* ========================== */}

      <ChartCard title="Aset per Lokasi Ruangan">
        {total > 0 ? (
          <HorizontalChart items={locations} showAll={showAll} onToggle={onToggle} />
        ) : (
          <NoData className="min-h-60" />
        )}
      </ChartCard>
    </>
  );
}

// =====================================
// MAINTENANCE DASHBOARD
// =====================================

export function MaintenanceDashboard({ filters, showAll, onToggle }: DashboardProps) {
  // FILTERED DATA
  const data = getWorkItems(maintenanceItems, filters);

  const total = data.length;

  // COMPLETED MAINTENANCE
  const completedItems = data.filter((item) => item.status === "Selesai");

  const completed = completedItems.length;

  const percentage = total > 0 ? (completed / total) * 100 : 0;

  // CHART DATA
  const conditions = getCounts(completedItems, (item) => item.condition);

  const staff = getCounts(completedItems, (item) => item.group);

  // CONDITION COLORS
  const conditionColors: Record<string, string> = {
    Baik: "#10b981",
    "Rusak Ringan": "#0b8dca",
    "Rusak Berat": "#f97316",
  };

  return (
    <>
      {/* ========================== */}
      {/* SUMMARY CARDS */}
      {/* ========================== */}

      <StatGrid columns={3}>
        <StatCard label="Jumlah Jadwal" value={total} />

        <StatCard label="Jadwal Selesai" value={completed} />

        <StatCard
          label="Persentase Jadwal Selesai"
          value={percentage.toLocaleString("id-ID", {
            maximumFractionDigits: 2,
          })}
          suffix="%"
        />
      </StatGrid>

      {/* ========================== */}
      {/* MONTHLY CHART */}
      {/* ========================== */}

      <ChartCard title="Jadwal Maintenance per Bulan">
        {total > 0 ? <MonthlyChart data={monthlyData(data)} /> : <NoData className="min-h-52" />}
      </ChartCard>

      {/* ========================== */}
      {/* CONDITION & STAFF */}
      {/* ========================== */}

      <div className="grid gap-4 lg:grid-cols-2">
        {/* CONDITION */}

        <ChartCard title="Kondisi Alat Pasca Pemeliharaan">
          {completed > 0 ? (
            <DonutChart
              total={completed}
              centerLabel="Alat"
              segments={conditions.map((item) => ({
                ...item,
                color: conditionColors[item.label] || BLUE,
              }))}
            />
          ) : (
            <NoData />
          )}
        </ChartCard>

        {/* STAFF */}

        <ChartCard title="Jadwal Selesai per Petugas">
          {completed > 0 ? (
            <HorizontalChart items={staff} showAll={showAll} onToggle={onToggle} />
          ) : (
            <NoData />
          )}
        </ChartCard>
      </div>
    </>
  );
}

// =====================================
// GRAPHIC DESIGN DASHBOARD
// =====================================

export function DesignDashboard({ filters, showAll, onToggle }: DashboardProps) {
  // FILTERED DATA
  const data = getWorkItems(designItems, filters);

  const total = data.length;

  // SUMMARY
  const completed = data.filter((item) => item.status === "Selesai").length;

  const rejected = data.filter((item) => item.status === "Ditolak").length;

  const average = total > 0 ? data.reduce((sum, item) => sum + item.duration, 0) / total : 0;

  // CHART DATA
  const statuses = getCounts(data, (item) => item.status);

  const categories = getCounts(data, (item) => item.group);

  return (
    <>
      {/* ========================== */}
      {/* SUMMARY CARDS */}
      {/* ========================== */}

      <StatGrid columns={4}>
        <StatCard label="Request Masuk" value={total} />

        <StatCard label="Request Selesai" value={completed} />

        <StatCard label="Request Ditolak" value={rejected} />

        <StatCard
          label="Rata-rata Waktu Penyelesaian"
          value={average.toLocaleString("id-ID", {
            maximumFractionDigits: 1,
          })}
          suffix="Hari"
        />
      </StatGrid>

      {/* ========================== */}
      {/* MONTHLY CHART */}
      {/* ========================== */}

      <ChartCard title="Request per Bulan">
        {total > 0 ? <MonthlyChart data={monthlyData(data)} /> : <NoData className="min-h-52" />}
      </ChartCard>

      {/* ========================== */}
      {/* STATUS & DESIGN TYPE */}
      {/* ========================== */}

      <div className="grid gap-4 lg:grid-cols-2">
        {/* STATUS REQUEST */}

        <ChartCard title="Status Request">
          {total > 0 ? (
            <DonutChart
              total={total}
              centerLabel="Request"
              segments={statuses.map((item) => ({
                ...item,
                color: designStatusColors[item.label] || BLUE,
              }))}
            />
          ) : (
            <NoData />
          )}
        </ChartCard>

        {/* DESIGN TYPE */}

        <ChartCard title="Request per Jenis Desain">
          {total > 0 ? (
            <HorizontalChart items={categories} showAll={showAll} onToggle={onToggle} />
          ) : (
            <NoData />
          )}
        </ChartCard>
      </div>
    </>
  );
}
