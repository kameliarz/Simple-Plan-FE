import type { ComponentType, ReactNode } from "react";

export interface EmptyStateProps {
  children?: ReactNode;
  description?: ReactNode;
  icon?: ComponentType<{ size?: number; strokeWidth?: number }>;
  title: ReactNode;
}

export default function EmptyState({ children, description, icon: Icon, title }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center rounded-lg border border-slate-200 bg-white px-6 py-16 text-center dark:border-slate-800 dark:bg-slate-900">
      {Icon ? (
        <div className="mb-4 flex size-14 items-center justify-center rounded-full bg-slate-100 text-slate-400 dark:bg-slate-800">
          <Icon size={28} strokeWidth={1.5} />
        </div>
      ) : null}
      <h3 className="font-semibold text-slate-900 dark:text-slate-100">{title}</h3>
      {description ? <p className="mt-1 text-sm text-slate-500">{description}</p> : null}
      {children ? <div className="mt-5">{children}</div> : null}
    </div>
  );
}
