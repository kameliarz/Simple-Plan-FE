import { useMemo } from "react";
import type { AssetStatusItem } from "../../types/dashboard.types";

interface AssetStatusDonutChartProps {
  data: AssetStatusItem[];
}

export default function AssetStatusDonutChart({ data }: AssetStatusDonutChartProps) {
  const isEmpty = !data || data.length === 0 || data.every((d) => d.count === 0);
  const total = isEmpty ? 0 : data.reduce((acc, curr) => acc + curr.count, 0);

  const size = 160;
  const strokeWidth = 16;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  const segments = useMemo(() => {
    return data.reduce<
      Array<{
        key: string;
        color: string;
        strokeDasharray: string;
        strokeDashoffset: number;
        offset: number;
      }>
    >((acc, item) => {
      const percent = total > 0 ? item.count / total : 0;
      const prevOffset = acc.length > 0 ? acc[acc.length - 1].offset : 0;
      const nextOffset = prevOffset + percent;

      return [
        ...acc,
        {
          key: item.key,
          color: item.color,
          strokeDasharray: `${percent * circumference} ${circumference}`,
          strokeDashoffset: -prevOffset * circumference,
          offset: nextOffset,
        },
      ];
    }, []);
  }, [data, total, circumference]);

  return (
    <div className="flex flex-col justify-between rounded-2xl border border-gray-100 bg-white p-5 md:p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900">
      <h2 className="text-base font-bold text-gray-800 dark:text-slate-100">
        Komposisi Status Aset
      </h2>

      <div className="mt-6 flex-1">
        {isEmpty ? (
          <div className="flex h-56 w-full items-center justify-center rounded-xl bg-gray-50/60 dark:bg-slate-800/30">
            <p className="text-xs text-gray-400 dark:text-slate-500">
              Tidak ada data pada periode yang dipilih.
            </p>
          </div>
        ) : (
          <div className="flex flex-col sm:flex-row items-center justify-center sm:justify-around gap-6 h-56">
            <div className="relative flex items-center justify-center">
              <svg width={size} height={size} className="-rotate-90">
                <circle
                  cx={size / 2}
                  cy={size / 2}
                  r={radius}
                  fill="transparent"
                  stroke="currentColor"
                  strokeWidth={strokeWidth}
                  className="text-gray-100 dark:text-slate-800"
                />

                {segments.map((seg) => (
                  <circle
                    key={seg.key}
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    fill="transparent"
                    stroke={seg.color}
                    strokeWidth={strokeWidth}
                    strokeDasharray={seg.strokeDasharray}
                    strokeDashoffset={seg.strokeDashoffset}
                    strokeLinecap="butt"
                    className="transition-all duration-500"
                  />
                ))}
              </svg>

              <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                <span className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
                  {total}
                </span>
                <span className="text-[11px] text-gray-400 dark:text-slate-500 font-medium">
                  Total aset
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-1 gap-3 sm:gap-2.5">
              {data.map((item) => (
                <div key={item.key} className="flex items-start gap-2">
                  <span
                    className="mt-1 h-2.5 w-2.5 shrink-0 rounded-full"
                    style={{ backgroundColor: item.color }}
                  />
                  <div>
                    <p className="text-xs font-bold text-gray-800 dark:text-slate-100">
                      {item.count}
                    </p>
                    <p className="text-[11px] text-gray-500 dark:text-slate-400">{item.label}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
