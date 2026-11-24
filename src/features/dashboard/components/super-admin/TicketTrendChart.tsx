import { useState } from "react";
import type { MonthlyTicketTrend } from "../../types/dashboard.types";

interface TicketTrendChartProps {
  data: MonthlyTicketTrend[];
}

export default function TicketTrendChart({ data }: TicketTrendChartProps) {
  const [selectedMonthIndex, setSelectedMonthIndex] = useState<number>(() => {
    return data.length > 0 ? data.length - 1 : 0;
  });
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const isEmpty = !data || data.length === 0;
  const maxCount = isEmpty ? 1 : Math.max(...data.map((d) => d.count), 1);

  const activeIndex = hoveredIndex !== null ? hoveredIndex : selectedMonthIndex;
  const activeItem = data[activeIndex] ?? data[data.length - 1];

  return (
    <div className="flex flex-col justify-between rounded-2xl border border-gray-100 bg-white p-5 md:p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-gray-800 dark:text-slate-100">
            Tren Tiket per Bulan
          </h2>
          <p className="mt-0.5 text-xs text-gray-400 dark:text-slate-500">
            Klik batang untuk melihat detail
          </p>
        </div>

        <span className="inline-flex items-center rounded-lg border border-gray-200 bg-gray-50/80 px-2.5 py-1 text-xs font-medium text-gray-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300">
          6 bulan terakhir
        </span>
      </div>

      <div className="mt-6 flex-1">
        {isEmpty ? (
          <div className="flex h-56 w-full items-center justify-center rounded-xl bg-gray-50/60 dark:bg-slate-800/30">
            <p className="text-xs text-gray-400 dark:text-slate-500">
              Tidak ada data pada periode yang dipilih.
            </p>
          </div>
        ) : (
          <div>
            <div
              onMouseLeave={() => setHoveredIndex(null)}
              className="flex h-52 items-end justify-between gap-3 pt-8 pb-2 px-2"
            >
              {data.map((item, index) => {
                const isActive = index === activeIndex;
                const heightPercent = Math.max(12, Math.round((item.count / maxCount) * 85));

                return (
                  <div
                    key={item.month}
                    onMouseEnter={() => setHoveredIndex(index)}
                    onClick={() => setSelectedMonthIndex(index)}
                    className="group flex flex-1 flex-col items-center cursor-pointer"
                  >
                    <div className="h-6 flex items-center justify-center">
                      <span
                        className={`rounded-md bg-[#003178] px-2 py-0.5 text-[11px] font-bold text-white shadow-xs transition-all duration-300 ease-out ${
                          isActive
                            ? "opacity-100 translate-y-0 scale-100"
                            : "opacity-0 translate-y-1 scale-90 pointer-events-none"
                        }`}
                      >
                        {item.count}
                      </span>
                    </div>

                    <div className="relative w-full max-w-[42px] h-36 flex items-end">
                      <div
                        style={{ height: `${heightPercent}%` }}
                        className="relative w-full rounded-t-lg overflow-hidden transition-transform duration-300 ease-out"
                      >
                        <div
                          className={`absolute inset-0 rounded-t-lg bg-[#c8ddfb] dark:bg-blue-900/40 transition-opacity duration-300 ease-in-out ${
                            isActive ? "opacity-0" : "opacity-100 group-hover:bg-[#b8d7fb]"
                          }`}
                        />

                        <div
                          className={`absolute inset-0 rounded-t-lg bg-gradient-to-t from-[#0142a3] to-[#0265ed] shadow-md transition-opacity duration-300 ease-in-out ${
                            isActive ? "opacity-100" : "opacity-0 pointer-events-none"
                          }`}
                        />
                      </div>
                    </div>

                    <span
                      className={`mt-2 text-xs transition-colors ${
                        isActive
                          ? "font-bold text-gray-900 dark:text-white"
                          : "font-medium text-gray-500 dark:text-slate-400"
                      }`}
                    >
                      {item.month}
                    </span>
                  </div>
                );
              })}
            </div>

            {activeItem && (
              <div className="mt-3">
                <span className="inline-flex items-center rounded-lg border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700 transition-all dark:border-blue-800/60 dark:bg-blue-950/40 dark:text-blue-300">
                  {activeItem.fullMonth}: {activeItem.count} tiket
                </span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
