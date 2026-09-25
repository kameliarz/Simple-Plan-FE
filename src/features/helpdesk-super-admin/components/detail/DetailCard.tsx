import type { ReactNode } from "react";

type DetailCardProps = {
  title: string;
  icon?: ReactNode;
  headerRight?: ReactNode;
  children: ReactNode;
  className?: string;
  overflowVisible?: boolean;
};

export default function DetailCard({
  title,
  icon,
  headerRight,
  children,
  className = "",
  overflowVisible = false,
}: DetailCardProps) {
  return (
    <div
      className={`
        ${overflowVisible ? "overflow-visible" : "overflow-hidden"}
        overflow-hidden
        rounded-lg
        border
        border-slate-200
        bg-white
        dark:border-slate-700
        dark:bg-table-card
        ${className}
      `}
    >
      <div
        className="
          flex
          items-center
          gap-2
          border-b
          border-slate-200
          px-5
          py-3.5
          dark:border-slate-700
        "
      >
        <div className="flex items-center gap-2">
          {icon}
          <h2 className="text-sm font-semibold text-text-title">{title}</h2>
        </div>

        {headerRight}
      </div>

      {children}
    </div>
  );
}
