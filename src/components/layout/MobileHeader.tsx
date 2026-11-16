import React from "react";
import { Menu, Bell } from "lucide-react";

import { cn } from "../../lib/utils";

interface MobileHeaderProps {
  onMenuClick?: () => void;
  onNotificationClick?: () => void;
  isDarkMode?: boolean;
  onToggleDarkMode?: () => void;
  notificationCount?: number;
  className?: string;
}

export const MobileHeader: React.FC<MobileHeaderProps> = ({
  onMenuClick,
  onNotificationClick,
  notificationCount = 0,
  className,
}) => {
  return (
    <header
      className={cn(
        `
          sticky top-0 z-30
          flex h-16 items-center
          justify-between
          border-b border-slate-100
          bg-white/95 px-4
          backdrop-blur-sm
          transition-colors
          dark:border-slate-800
          dark:bg-[#111827]/95
        `,
        className,
      )}
    >
      {/* ======================================
          LEFT: MENU & APP NAME
      ====================================== */}
      <div className="flex min-w-0 items-center gap-3">
        <button
          type="button"
          onClick={onMenuClick}
          aria-label="Buka Menu"
          className="
            shrink-0 rounded-lg p-1.5
            text-slate-700 transition
            hover:bg-slate-100
            dark:text-slate-200
            dark:hover:bg-slate-800
          "
        >
          <Menu className="h-5 w-5" />
        </button>

        <div className="flex min-w-0 flex-col">
          <h1 className="text-sm font-bold leading-tight text-blue-950 dark:text-blue-300">
            Simple-Plan
          </h1>

          <p className="truncate text-[10px] font-medium text-slate-500 dark:text-slate-400">
            Rumah Sakit Citra Husada Jember
          </p>
        </div>
      </div>

      {/* ======================================
          RIGHT: NOTIFICATION & LOGO
      ====================================== */}
      <div className="flex shrink-0 items-center gap-2">
        {/* NOTIFICATION */}
        <button
          type="button"
          onClick={onNotificationClick}
          aria-label="Buka Notifikasi"
          className="
            relative rounded-lg p-1.5
            text-slate-600 transition
            hover:bg-slate-100
            dark:text-slate-300
            dark:hover:bg-slate-800
          "
        >
          <Bell className="h-5 w-5" />

          {notificationCount > 0 && (
            <span
              className="
                absolute right-0 top-0
                h-2.5 w-2.5
                rounded-full bg-red-500
                border-2 border-white
                dark:border-slate-900
              "
            />
          )}
        </button>

        {/* LOGO SIMPLE-PLAN */}
        <img
          src="/logo-simple-plan.png"
          alt="Logo Simple-Plan"
          className="h-7 w-7 shrink-0 object-contain"
        />
      </div>
    </header>
  );
};

export default MobileHeader;
