import { NavLink } from "react-router-dom";
import type { LucideIcon } from "lucide-react";
import { twMerge } from "tailwind-merge";

interface BaseTabProps {
  to?: string;
  icon: LucideIcon;
  label: string;
  badge?: number;
  onClick?: () => void;
  active?: boolean;
  className?: string;
}

export default function BaseTab({
  to,
  icon: Icon,
  label,
  badge,
  onClick,
  active = false,
  className,
}: BaseTabProps) {
  const getClassName = (isActive: boolean) =>
    twMerge(
      "flex w-full items-center justify-between px-4 py-2.5 text-sm font-medium transition-colors border-l-2",
      isActive
        ? "border-blue-700 bg-blue-50/50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400"
        : "border-transparent text-gray-600 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-slate-800/50",
      className,
    );

  const content = (
    <>
      <div className="flex items-center gap-3">
        <Icon className="h-5 w-5" />
        <span>{label}</span>
      </div>

      {typeof badge === "number" && badge > 0 && (
        <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-red-600 px-1 text-[10px] font-bold text-white">
          {badge}
        </span>
      )}
    </>
  );

  // MODE NAVIGASI
  if (to) {
    return (
      <NavLink to={to} className={({ isActive }) => getClassName(isActive)}>
        {content}
      </NavLink>
    );
  }

  // MODE ACTION
  return (
    <button type="button" onClick={onClick} className={twMerge(getClassName(active), "text-left")}>
      {content}
    </button>
  );
}
