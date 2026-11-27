import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import type { DashboardReminderItem } from "../../types/dashboard.types";

interface ReminderWidgetProps {
  initialReminders: DashboardReminderItem[];
}

export default function ReminderWidget({ initialReminders }: ReminderWidgetProps) {
  const navigate = useNavigate();
  const [readItemIds, setReadItemIds] = useState<Set<string>>(new Set());

  const reminders = useMemo(() => {
    return initialReminders.map((r) => ({
      ...r,
      isRead: r.isRead || readItemIds.has(r.id),
    }));
  }, [initialReminders, readItemIds]);

  const handleMarkAllAsRead = () => {
    setReadItemIds(new Set(initialReminders.map((r) => r.id)));
  };

  const handleItemClick = (item: DashboardReminderItem) => {
    setReadItemIds((prev) => new Set([...prev, item.id]));
    if (item.link) {
      navigate(item.link);
    }
  };

  const isEmpty = reminders.length === 0;

  return (
    <div className="flex flex-col justify-between rounded-2xl border border-gray-100 bg-white p-5 md:p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-gray-800 dark:text-slate-100">Pengingat</h2>
          <p className="mt-0.5 text-xs text-gray-400 dark:text-slate-500">
            Notifikasi terbaru untuk Anda
          </p>
        </div>

        {!isEmpty && (
          <button
            type="button"
            onClick={handleMarkAllAsRead}
            className="text-xs font-semibold text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
          >
            Tandai semua dibaca
          </button>
        )}
      </div>

      <div className="mt-4 flex-1">
        {isEmpty ? (
          <div className="flex min-h-[160px] w-full items-center justify-center rounded-xl bg-gray-50/60 dark:bg-slate-800/30">
            <p className="text-xs text-gray-400 dark:text-slate-500">
              Tidak ada notifikasi terbaru
            </p>
          </div>
        ) : (
          <div className="space-y-2.5">
            {reminders.map((item) => (
              <div
                key={item.id}
                onClick={() => handleItemClick(item)}
                className={`flex flex-col justify-between rounded-xl border p-3.5 transition-colors cursor-pointer ${
                  item.isRead
                    ? "border-gray-100 bg-white opacity-70 dark:border-slate-800 dark:bg-slate-900"
                    : "border-gray-100 bg-white hover:border-blue-200 dark:border-slate-800 dark:bg-slate-800/40"
                }`}
              >
                <div className="flex items-start gap-2">
                  <span className="text-xs font-semibold text-gray-800 dark:text-slate-200">•</span>
                  <p className="text-xs font-medium text-gray-800 dark:text-slate-200 leading-snug">
                    {item.title}
                  </p>
                </div>

                <p className="mt-1 pl-3.5 text-[11px] text-gray-400 dark:text-slate-400">
                  {item.timeAgo}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
