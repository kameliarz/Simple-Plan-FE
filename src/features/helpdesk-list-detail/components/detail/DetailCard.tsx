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
        rounded-lg
        border border-slate-200
        border-l-[3px] border-l-primary-600
        bg-white
        dark:border-slate-700
        dark:border-l-white
        dark:bg-table-card
        sm:border-l
        sm:border-l-slate-200
        sm:dark:border-l-slate-700
        ${overflowVisible ? "overflow-visible" : "overflow-hidden"}
        ${className}
      `}
    >
      {/* Header */}
      <div
        className="
          flex
          items-center
          justify-between
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
