import React from "react";
import { Menu, Moon, Sun, Bell } from "lucide-react";
import { cn } from "../../lib/utils";

interface MobileHeaderProps {
  onMenuClick?: () => void;
  onNotificationClick?: () => void;
  isDarkMode?: boolean;
  onToggleDarkMode?: () => void;
  className?: string;
}

export const MobileHeader: React.FC<MobileHeaderProps> = ({
  onMenuClick,
  onNotificationClick,
  isDarkMode,
  onToggleDarkMode,
  className,
}) => {
  return (
    <header
      className={cn(
        "sticky top-0 z-30 flex items-center justify-between px-4 py-3 bg-white/95 dark:bg-[#111827]/95 backdrop-blur-sm border-b border-slate-100 dark:border-slate-800 transition-colors",
        className,
      )}
    >
      {/* Kiri: Hamburger Menu & Title */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onMenuClick}
          className="p-1.5 rounded-lg text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          aria-label="Buka Menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex flex-col">
          <h1 className="text-sm font-bold text-blue-950 dark:text-blue-300 leading-tight">
            Simple-Plan
          </h1>
          <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">
            Rumah Sakit Citra Husada Jember
          </p>
        </div>
      </div>

      {/* Kanan: Dark Mode Toggle & Hospital Emblem Logo */}
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={onNotificationClick}
          className="
            relative
            p-1.5
            rounded-lg
            text-slate-600
            dark:text-slate-300
            hover:bg-slate-100
            dark:hover:bg-slate-800
            transition
          "
          aria-label="Buka Notifikasi"
        >
          <Bell className="w-5 h-5" />

          {/* Badge jumlah unread */}
          <span
            className="
              absolute
              -right-0.5
              -top-0.5
              flex
              h-3.5
              w-3.5
              items-center
              justify-center
              rounded-full
              bg-red-500
              text-[8px]
              text-white
            "
          >
            3
          </span>
        </button>

        {onToggleDarkMode && (
          <button
            type="button"
            onClick={onToggleDarkMode}
            className="p-1.5 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            title="Toggle Tema"
          >
            {isDarkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
          </button>
        )}

        {/* Emblem Logo RS Citra Husada Jember */}
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center p-0.5"
          title="RS Citra Husada Jember"
        >
          <svg viewBox="0 0 48 48" className="w-full h-full drop-shadow-sm" fill="none">
            {/* Perisai Lambang */}
            <path
              d="M24 4L8 10V22C8 33 15 42 24 45C33 42 40 33 40 22V10L24 4Z"
              fill="#ffffff"
              stroke="#0f766e"
              strokeWidth="2.5"
            />
            {/* Garis Aksen Hijau/Teal */}
            <path
              d="M24 6L10 11.5V22C10 31.5 16 39.5 24 42.5C32 39.5 38 31.5 38 22V11.5L24 6Z"
              fill="#f0fdf4"
            />
            {/* Palang Medis Merah */}
            <path d="M21 16H27V21H32V27H27V32H21V27H16V21H21V16Z" fill="#ef4444" />
            {/* Bintang / Garis Simbol Medis */}
            <circle cx="24" cy="24" r="2.5" fill="#ffffff" />
          </svg>
        </div>
      </div>
    </header>
  );
};

export default MobileHeader;
