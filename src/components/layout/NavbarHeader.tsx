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
    <header
      className="
        sticky top-0 z-20
        flex h-18 shrink-0
        items-center justify-between
        border-b border-soft-border
        bg-table-card px-6
        backdrop-blur-md
      "
    >
      {/* BREADCRUMB */}
      <div className="flex min-w-0 items-center">
        <Breadcrumb items={breadcrumbs} />
      </div>

      {/* NOTIFICATION */}
      <div className="flex shrink-0 items-center space-x-4">
        <button
          type="button"
          onClick={onNotificationClick}
          aria-label="Buka notifikasi"
          className="
            relative rounded-full p-2
            text-slate-500
            transition-colors
            hover:bg-slate-100
            dark:text-slate-400
            dark:hover:bg-slate-800
          "
        >
          <Bell className="h-5 w-5" />

          {notificationCount > 0 && (
            <span
              className="
                absolute right-1 top-1
                h-2.5 w-2.5
                rounded-full bg-red-500
                border-2 border-white
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
