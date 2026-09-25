import React from "react";
import { cn } from "../../lib/utils";

export interface TimelineEntry {
  id: string;
  timestamp: string;
  action: string;
  isCompleted?: boolean;
  variant?: "default" | "danger" | "warning" | "success" | "primary";
}

export interface TimelineProps {
  items: TimelineEntry[];
  className?: string;
}

export const Timeline: React.FC<TimelineProps> = ({ items, className }) => {
  return (
    <div className={cn("pl-1 pt-1 space-y-4", className)}>
      {items.map((item, index) => {
        const isLatest = index === 0;
        const isLastItem = index === items.length - 1;

        const dotColor =
          item.variant === "danger"
            ? "bg-rose-500"
            : item.variant === "success"
              ? "bg-emerald-500"
              : item.variant === "primary"
                ? "bg-blue-600 dark:bg-blue-500"
                : item.variant === "warning" || isLatest
                  ? "bg-amber-500"
                  : "bg-slate-300 dark:bg-slate-600";

        const textColor =
          item.variant === "danger"
            ? "text-rose-600 dark:text-rose-400"
            : item.variant === "success"
              ? "text-emerald-600 dark:text-emerald-400"
              : item.variant === "primary"
                ? "text-blue-700 dark:text-blue-400"
                : item.variant === "warning" || isLatest
                  ? "text-amber-700 dark:text-amber-400"
                  : "text-slate-400 dark:text-slate-500";

        return (
          <div key={item.id} className="relative flex items-start gap-3">
            {/* Connector Line */}
            {!isLastItem && (
              <div className="absolute left-1.5 top-3.5 bottom-[-16px] w-[1.5px] bg-slate-200 dark:bg-slate-700" />
            )}

            {/* Dot */}
            <div
              className={cn(
                "w-3 h-3 rounded-full mt-0.5 shrink-0 z-10 ring-2 ring-white dark:ring-[#1e293b]",
                dotColor,
              )}
            />

            <div className="min-w-0 flex-1 text-xs">
              <span className={cn("font-semibold block", textColor)}>{item.timestamp}</span>
              <p className="text-slate-700 dark:text-slate-300 font-medium mt-0.5">{item.action}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default Timeline;
