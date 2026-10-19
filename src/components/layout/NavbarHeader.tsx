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
          aria-label="Buka notifikasi"
          className="relative p-2 rounded-full text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800 transition-colors"
        >
          <Bell className="w-5 h-5" />

          {notificationCount > 0 && (
            <span
              className="
                absolute
                right-1
                top-1
                h-2.5
                w-2.5
                rounded-full
                bg-red-500
                border-2
                border-white
                dark:border-slate-900
              "
            />
          )}
        </button>
      </div>
    </header>
  );
}

export default NavbarHeader;
