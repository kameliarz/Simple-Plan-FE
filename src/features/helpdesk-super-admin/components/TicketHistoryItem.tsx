import React from "react";

interface TicketHistoryItemProps {
  action: string;
  timestamp: string;
  isLatest?: boolean;
  isLast?: boolean;
}

export const TicketHistoryItem: React.FC<TicketHistoryItemProps> = ({
  action,
  timestamp,
  isLatest = false,
  isLast = false,
}) => {
  return (
    <div className="relative flex gap-3">
      {/* ==========================================
          TIMELINE DOT + LINE
      ========================================== */}
      <div className="relative flex w-8 shrink-0 justify-center">
        {/* Garis hanya dibuat kalau BUKAN item terakhir */}
        {!isLast && (
          <div
            className="
              absolute
              top-5
              bottom-0
              w-px
              bg-slate-200
              dark:bg-slate-700
            "
          />
        )}

        {/* Dot */}
        <div
          className={`
            relative
            z-10
            mt-1
            flex
            h-4
            w-4
            items-center
            justify-center
            rounded-full
            border-[3px]
            ${
              isLatest
                ? "border-orange-100 bg-orange-500"
                : "border-slate-200 bg-slate-400 dark:border-slate-700"
            }
          `}
        >
          {isLatest && <div className="h-1.5 w-1.5 rounded-full bg-white" />}
        </div>
      </div>

      {/* ==========================================
          HISTORY CONTENT
      ========================================== */}
      <div className="mb-3 min-w-0 flex-1">
        <div
          className="
            flex
            min-h-12
            items-center
            justify-between
            gap-3
            rounded-lg
            bg-slate-50
            px-3
            py-2.5
            dark:bg-slate-800
          "
        >
          <p className="text-xs font-medium text-text-title">{action}</p>

          <span className="shrink-0 text-[11px] text-slate-400">{timestamp}</span>
        </div>
      </div>
    </div>
  );
};

export default TicketHistoryItem;
