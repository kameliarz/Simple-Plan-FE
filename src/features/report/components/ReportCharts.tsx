import type { CSSProperties, ReactNode } from "react";

import type { ReportSummary } from "../types/report.types";

// =====================================
// CHART CARD
// =====================================

interface ChartCardProps {
  title: string;
  children: ReactNode;
  className?: string;
}

export function ChartCard({ title, children, className = "" }: ChartCardProps) {
  return (
    <section
      className={`
        min-w-0 rounded-xl bg-white p-4
        shadow-sm dark:bg-slate-900
        ${className}
      `}
    >
      <h2
        className="
          mb-4 text-sm font-semibold
          text-slate-700 dark:text-slate-200
        "
      >
        {title}
      </h2>

      {children}
    </section>
  );
}

// =====================================
// EMPTY STATE
// =====================================

export function NoData({ className = "" }: { className?: string }) {
  return (
    <div
      className={`
        flex min-h-44 items-center justify-center
        rounded-lg bg-slate-50 px-3
        text-center text-xs text-slate-400
        dark:bg-slate-800/50
        ${className}
      `}
    >
      Tidak ada data pada periode yang dipilih.
    </div>
  );
}

// =====================================
// MONTHLY CHART
// =====================================

interface MonthlyChartProps {
  data: ReportSummary["monthly"];
}

export function MonthlyChart({ data }: MonthlyChartProps) {
  const max = Math.max(1, ...data.map((item) => item.count));

  return (
    <div
      className="
        flex h-48 items-end gap-2
        border-b border-slate-100 pb-1
        sm:gap-4 dark:border-slate-800
      "
      role="img"
      aria-label="Grafik jumlah tiket per bulan"
    >
      {data.map(({ label, count }) => (
        <div
          key={label}
          className="
            flex h-full min-w-0 flex-1
            flex-col items-center justify-end gap-1
          "
        >
          {/* COUNT */}
          <span
            className="
              text-[10px] font-semibold
              text-slate-700 dark:text-slate-200
            "
          >
            {count || ""}
          </span>

          {/* BAR CONTAINER */}
          <div
            className="
              flex h-[calc(100%-34px)]
              w-full items-end justify-center
            "
          >
            <div
              className="
                w-full max-w-9 rounded-t-sm
                bg-[#0b4ca5]
                transition-all duration-300
              "
              style={{
                height: `${(count / max) * 100}%`,
                minHeight: count ? 3 : 0,
              }}
              title={`${label}: ${count} tiket`}
            />
          </div>

          {/* MONTH LABEL */}
          <span
            className="
              text-[10px] text-slate-400
            "
          >
            {label}
          </span>
        </div>
      ))}
    </div>
  );
}

// =====================================
// DONUT CHART
// =====================================

interface DonutSegment {
  label: string;
  count: number;
  color: string;
}

interface DonutChartProps {
  segments: DonutSegment[];
  total: number;
  centerLabel: string;
}

export function DonutChart({ segments, total, centerLabel }: DonutChartProps) {
  // =====================================
  // FILTER VALID SEGMENTS
  // =====================================

  const validSegments = segments.filter((segment) => segment.count > 0);

  // =====================================
  // CALCULATE GRADIENT
  // Menggunakan reduce tanpa mutasi
  // variabel luar.
  // =====================================

  const gradientParts = validSegments.reduce<{
    current: number;
    colors: string[];
  }>(
    (acc, segment) => {
      const start = total ? (acc.current / total) * 100 : 0;

      const next = acc.current + segment.count;

      const end = total ? (next / total) * 100 : 0;

      return {
        current: next,
        colors: [...acc.colors, `${segment.color} ${start}% ${end}%`],
      };
    },
    {
      current: 0,
      colors: [],
    },
  );

  const gradient = gradientParts.colors.join(", ");

  // =====================================
  // DONUT STYLE
  // =====================================

  const style: CSSProperties = {
    background: `conic-gradient(${gradient || "#e2e8f0 0% 100%"})`,
  };

  // =====================================
  // RENDER
  // =====================================

  return (
    <div
      className="
        flex flex-col items-center gap-5
        sm:flex-row
      "
    >
      {/* ========================== */}
      {/* DONUT */}
      {/* ========================== */}

      <div
        className="
          relative size-36 shrink-0
          rounded-full
        "
        style={style}
        role="img"
        aria-label={segments.map((segment) => `${segment.label}: ${segment.count}`).join(", ")}
      >
        {/* DONUT CENTER */}

        <div
          className="
            absolute inset-[19%]
            flex flex-col
            items-center justify-center
            rounded-full bg-white
            dark:bg-slate-900
          "
        >
          <strong
            className="
              text-xl text-slate-800
              dark:text-slate-100
            "
          >
            {total}
          </strong>

          <span
            className="
              text-[10px] text-slate-400
            "
          >
            {centerLabel}
          </span>
        </div>
      </div>

      {/* ========================== */}
      {/* LEGEND */}
      {/* ========================== */}

      <div
        className="
          w-full min-w-0 flex-1
          space-y-1.5
        "
      >
        {segments.map((segment) => (
          <div
            key={segment.label}
            className="
              flex items-center gap-2
              text-[11px]
            "
          >
            {/* COLOR INDICATOR */}

            <span
              className="
                size-2 shrink-0 rounded-sm
              "
              style={{
                backgroundColor: segment.color,
              }}
            />

            {/* STATUS LABEL */}

            <span
              className="
                min-w-0 flex-1 truncate
                text-slate-500
                dark:text-slate-300
              "
            >
              {segment.label}
            </span>

            {/* STATUS COUNT */}

            <span
              className="
                font-medium text-slate-700
                dark:text-slate-100
              "
            >
              {segment.count}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

// =====================================
// CATEGORY CHART
// =====================================

interface CategoryChartProps {
  groups: ReportSummary["categories"];
}

export function CategoryChart({ groups }: CategoryChartProps) {
  const max = Math.max(1, ...groups.flatMap((group) => group.items.map((item) => item.count)));

  return (
    <div className="space-y-5">
      {groups
        .filter((group) => group.items.length > 0)
        .map((group) => (
          <div key={group.group}>
            {/* GROUP TITLE */}

            <h3
              className="
                mb-2 text-xs font-semibold
                text-slate-600
                dark:text-slate-300
              "
            >
              {group.group}
            </h3>

            {/* CATEGORY ITEMS */}

            <div className="space-y-2">
              {group.items.map((item) => (
                <div
                  key={item.label}
                  className="
                    grid items-center gap-3
                    grid-cols-[minmax(85px,1fr)_minmax(0,3fr)_30px]
                    sm:grid-cols-[minmax(150px,1fr)_minmax(0,3fr)_30px]
                  "
                >
                  {/* LABEL */}

                  <span
                    className="
                      truncate text-xs
                      text-slate-500
                      dark:text-slate-300
                    "
                    title={item.label}
                  >
                    {item.label}
                  </span>

                  {/* PROGRESS BAR */}

                  <div
                    className="
                      h-2 overflow-hidden
                      rounded-full bg-slate-100
                      dark:bg-slate-800
                    "
                  >
                    <div
                      className="
                        h-full rounded-full
                        bg-[#0b4ca5]
                      "
                      style={{
                        width: `${(item.count / max) * 100}%`,
                      }}
                    />
                  </div>

                  {/* COUNT */}

                  <span
                    className="
                      text-right text-xs
                      font-semibold
                      text-slate-700
                      dark:text-slate-100
                    "
                  >
                    {item.count}
                  </span>
                </div>
              ))}
            </div>
          </div>
        ))}
    </div>
  );
}
