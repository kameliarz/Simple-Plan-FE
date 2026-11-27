import { useState } from "react";
import type { DashboardMaintenanceItem } from "../../types/dashboard.types";

interface MaintenanceCalendarWidgetProps {
  schedules: DashboardMaintenanceItem[];
}

const MONTH_NAMES_ID = [
  "Januari",
  "Februari",
  "Maret",
  "April",
  "Mei",
  "Juni",
  "Juli",
  "Agustus",
  "September",
  "Oktober",
  "November",
  "Desember",
];

export default function MaintenanceCalendarWidget({ schedules }: MaintenanceCalendarWidgetProps) {
  const today = new Date();
  const currentYear = today.getFullYear();
  const currentMonthNum = today.getMonth() + 1;
  const currentMonthStr = String(currentMonthNum).padStart(2, "0");
  const todayDate = today.getDate();

  const [selectedDay, setSelectedDay] = useState<number>(todayDate);

  const monthName = `${MONTH_NAMES_ID[today.getMonth()]} ${currentYear}`;
  const daysInMonth = new Date(currentYear, currentMonthNum, 0).getDate();
  const firstDayOffset = (new Date(currentYear, today.getMonth(), 1).getDay() + 6) % 7;

  const dayNames = ["Sen", "Sel", "Rab", "Kam", "Jum", "Sab", "Min"];

  const formattedSelectedDay = `${currentYear}-${currentMonthStr}-${String(selectedDay).padStart(2, "0")}`;
  const daySchedules = schedules.filter((s) => s.date.startsWith(formattedSelectedDay));

  const daysWithSchedule = new Set(
    schedules
      .filter((s) => s.date.startsWith(`${currentYear}-${currentMonthStr}`))
      .map((s) => {
        const parts = s.date.split("-");
        return parseInt(parts[2], 10);
      })
      .filter((n) => !Number.isNaN(n)),
  );

  return (
    <div className="flex flex-col justify-between rounded-2xl border border-gray-100 bg-white p-5 md:p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900">
      <h2 className="text-base font-bold text-gray-800 dark:text-slate-100">Jadwal Maintenance</h2>

      <div className="mt-4 grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
        <div className="md:col-span-6 lg:col-span-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-gray-800 dark:text-slate-200">{monthName}</span>
            <span className="text-[11px] text-gray-400 dark:text-slate-500">
              Hari ini: {todayDate}
            </span>
          </div>

          <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-semibold text-gray-400 dark:text-slate-500 mb-1">
            {dayNames.map((day) => (
              <div key={day} className="py-0.5">
                {day}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1 text-center">
            {Array.from({ length: firstDayOffset }).map((_, i) => (
              <div key={`empty-${i}`} className="h-8 w-8 mx-auto" />
            ))}

            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1;
              const isSelected = day === selectedDay;
              const hasDot = daysWithSchedule.has(day);
              const dayScheduleCount = schedules.filter((s) =>
                s.date.startsWith(
                  `${currentYear}-${currentMonthStr}-${String(day).padStart(2, "0")}`,
                ),
              ).length;

              return (
                <button
                  key={day}
                  type="button"
                  onClick={() => setSelectedDay(day)}
                  title={
                    hasDot
                      ? `${dayScheduleCount} jadwal maintenance`
                      : `Tanggal ${day} ${monthName}`
                  }
                  className="group relative flex h-8 w-8 mx-auto flex-col items-center justify-center rounded-lg text-xs transition-colors cursor-pointer"
                >
                  <span
                    className={`flex h-6 w-6 items-center justify-center rounded-full text-[11px] transition-all duration-150 ${
                      isSelected
                        ? "bg-[#003178] font-bold text-white shadow-xs scale-105"
                        : "text-gray-700 group-hover:bg-gray-100 font-medium dark:text-slate-300 dark:group-hover:bg-slate-800"
                    }`}
                  >
                    {day}
                  </span>

                  <div className="h-1.5 flex items-center justify-center">
                    {hasDot ? (
                      <span className="h-1 w-1 rounded-full bg-amber-500" />
                    ) : (
                      <span className="h-1 w-1 rounded-full bg-transparent" />
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        <div className="md:col-span-6 lg:col-span-7 flex flex-col justify-start">
          <div className="flex items-center justify-between mb-3 border-b border-gray-100 dark:border-slate-800 pb-2">
            <span className="text-xs font-bold text-gray-800 dark:text-slate-200">
              {selectedDay} November
            </span>
            <span className="text-[11px] text-gray-400 dark:text-slate-500">
              {daySchedules.length} jadwal
            </span>
          </div>

          {daySchedules.length === 0 ? (
            <div className="flex min-h-[140px] flex-col items-center justify-center rounded-xl bg-gray-50/70 p-4 text-center dark:bg-slate-800/40">
              <p className="text-xs text-gray-500 dark:text-slate-400">
                Tidak ada jadwal pada tanggal ini.
              </p>
              <p className="mt-1 text-[11px] text-gray-400 dark:text-slate-500">
                Pilih tanggal yang memiliki titik oranye untuk melihat jadwal.
              </p>
            </div>
          ) : (
            <div className="space-y-2.5">
              {daySchedules.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between rounded-xl border border-gray-100 bg-gray-50/50 p-3.5 transition hover:border-gray-200 dark:border-slate-800 dark:bg-slate-800/50"
                >
                  <div className="min-w-0 pr-3">
                    <p className="text-xs font-semibold text-gray-800 dark:text-slate-100 truncate">
                      {item.assetName}
                    </p>
                    <p className="mt-0.5 text-[11px] text-gray-400 dark:text-slate-400">
                      {item.officerName}
                    </p>
                  </div>

                  <span className="shrink-0 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-0.5 text-[10px] font-semibold text-emerald-700 dark:border-emerald-800/60 dark:bg-emerald-950/40 dark:text-emerald-300">
                    {item.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
