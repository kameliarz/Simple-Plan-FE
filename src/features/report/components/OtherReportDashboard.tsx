import type { ReactNode } from "react";

import { ChartCard, DonutChart, MonthlyChart, NoData } from "./ReportCharts";

import { assetColors, designStatusColors } from "../services/otherReport.service";
import type { ReportData } from "../services/report.service";

function chartItems(value: unknown, key: string) {
  if (Array.isArray(value))
    return value.map((item: Record<string, string | number>) => ({
      label: String(item[key]),
      count: Number(item.jumlah),
    }));
  if (value && typeof value === "object")
    return Object.entries(value).map(([label, count]) => ({ label, count: Number(count) }));
  return [];
}

// =====================================
// CONSTANTS
// =====================================

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

// =====================================
// INVENTORY DASHBOARD
// =====================================

interface DashboardProps {
  data: ReportData;
  showAll: boolean;
  onToggle: () => void;
}

export function InventoryDashboard({ data, showAll, onToggle }: DashboardProps) {
  const total = data.summary.total_aset;
  const damaged = data.summary.total_rusak;
  const borrowed = data.summary.total_dipinjam;
  const classification = chartItems(data.charts.per_klasifikasi, "klasifikasi");
  const condition = chartItems(data.charts.per_kondisi, "");
  const locations = chartItems(data.charts.per_lokasi, "lokasi");

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

export function MaintenanceDashboard({ data, showAll, onToggle }: DashboardProps) {
  const total = data.summary.jumlah_jadwal;
  const completed = data.summary.jadwal_selesai;
  const percentage = data.summary.presentase_jadwal_selesai;
  const conditions = chartItems(data.charts.kondisi_pasca_pemeliharaan, "");
  const staff = chartItems(data.charts.per_petugas, "petugas");
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
        {total > 0 ? (
          <MonthlyChart data={chartItems(data.charts.per_bulan, "bulan")} />
        ) : (
          <NoData className="min-h-52" />
        )}
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

export function DesignDashboard({ data, showAll, onToggle }: DashboardProps) {
  const total = data.summary.jumlah_request_masuk;
  const completed = data.summary.jumlah_request_selesai;
  const rejected = data.summary.jumlah_request_ditolak;
  const average = data.summary.rata_rata_waktu_penyelesaian;
  const statuses = chartItems(data.charts.status_request, "").map((item) => ({
    ...item,
    label: item.label.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()),
  }));
  const categories = chartItems(data.charts.request_per_jenis_desain, "jenis_desain");

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
        {total > 0 ? (
          <MonthlyChart data={chartItems(data.charts.request_per_bulan, "bulan")} />
        ) : (
          <NoData className="min-h-52" />
        )}
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
