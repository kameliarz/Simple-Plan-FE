import type { ReactNode } from "react";

interface DetailSectionProps {
  title: string;
  actions?: ReactNode;
  children: ReactNode;
}

export default function DetailSection({ title, actions, children }: DetailSectionProps) {
  return (
    <section
      className="
        rounded-xl
        border border-slate-100
        bg-white
        px-5 py-5
        shadow-sm
        dark:border-slate-700
        dark:bg-table-card
        sm:px-6
      "
    >
      <div
        className="
          mb-5 flex flex-wrap
          items-center justify-between
          gap-3
          border-b border-slate-100
          pb-4
          dark:border-slate-700
        "
      >
        <h2 className="text-sm font-medium text-text-title">{title}</h2>

        {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
      </div>

      {children}
    </section>
  );
}
