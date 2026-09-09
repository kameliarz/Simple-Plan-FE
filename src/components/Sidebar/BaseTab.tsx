import { NavLink } from "react-router-dom";
import type { LucideIcon } from "lucide-react";

interface BaseTabProps {
  to: string;
  icon: LucideIcon;
  label: string;
  badge?: number;
}

export default function BaseTab({ to, icon: Icon, label, badge }: BaseTabProps) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `flex items-center justify-between px-4 py-2.5 text-sm font-medium transition-colors border-l-2 ${
          isActive
            ? "border-blue-700 bg-blue-50/50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400"
            : "border-transparent text-gray-600 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-slate-800/50"
        }`
      }
    >
      <div className="flex items-center gap-3">
        <Icon className="h-5 w-5" />
        <span>{label}</span>
      </div>
      {badge && (
        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-red-600 text-[10px] font-bold text-white">
          {badge}
        </span>
      )}
    </NavLink>
  );
}
