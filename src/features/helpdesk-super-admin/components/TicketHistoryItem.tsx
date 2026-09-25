import React from "react";

interface TicketHistoryItemProps {
  action: string;
  timestamp: string;
  isLatest?: boolean;
  children?: React.ReactNode;
}

export const TicketHistoryItem: React.FC<TicketHistoryItemProps> = ({
  action,
  timestamp,
  isLatest = false,
  children,
}) => {
  return (
    <div className="flex min-w-0 gap-3">
      {/* DOT */}
      <div className="flex w-8 shrink-0 justify-center">
        <div
          className={`
            relative
            z-10
            mt-1
            flex
            h-4
            w-4
            shrink-0
            items-center
            justify-center
            rounded-full
            border-4
            ${
              isLatest
                ? "border-orange-500 bg-white"
                : "border-slate-400 bg-slate-200 dark:border-slate-700"
            }
          `}
        >
          {isLatest && <div className="h-1.5 w-1.5 rounded-full bg-white" />}
        </div>
      </div>

      {/* ACTIVITY */}
      <div className="mb-3 min-w-0 flex-1">
        <div
          className="
            flex
            min-h-10
            items-center
            justify-between
            gap-3
            rounded-lg
            border
            border-slate-200
            bg-slate-50
            px-3
            py-2.5
            dark:border-slate-700
            dark:bg-slate-800
          "
        >
          <p className="text-xs font-medium text-text-title">{action}</p>

          <span className="shrink-0 text-[11px] text-slate-400">{timestamp}</span>
        </div>

        {children && <div className="mt-2">{children}</div>}
      </div>
    </div>
  );
};

export default TicketHistoryItem;
