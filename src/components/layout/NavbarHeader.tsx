import { Bell } from "lucide-react";
import Breadcrumb from "./Breadcrumb";

export interface NavbarHeaderProps {
  breadcrumbs: { label: string; href?: string }[];
  notificationCount?: number;
  onNotificationClick?: () => void;
}

export function NavbarHeader({
  breadcrumbs,
  notificationCount = 0,
  onNotificationClick,
}: NavbarHeaderProps) {
  return (
    <header className="sticky top-0 z-20 flex items-center justify-between px-6 py-4 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800">
      <div className="flex items-center">
        <Breadcrumb items={breadcrumbs} />
      </div>

      <div className="flex items-center space-x-4">
        <button
          type="button"
          onClick={onNotificationClick}
          className="relative p-2 rounded-full text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors focus:outline-none"
          title="Notifikasi"
          aria-label="Lihat Notifikasi"
        >
          <Bell className="w-5 h-5 fill-slate-800 dark:fill-slate-200 text-slate-800 dark:text-slate-200" />
          {notificationCount > 0 && (
            <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white dark:border-slate-900"></span>
          )}
        </button>
      </div>
    </header>
  );
}

export default NavbarHeader;
