import React from "react";
import { FolderOpen } from "lucide-react";

export interface EmptyStateProps {
  title?: string;
  description?: string;
  icon?: React.ReactNode;
  action?: React.ReactNode;
}

export function EmptyState({
  title = "Data tidak ditemukan",
  description = "Belum ada data yang dapat ditampilkan saat ini.",
  icon = <FolderOpen className="w-12 h-12 text-slate-300 dark:text-slate-600" />,
  action,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center min-h-[300px] border border-dashed border-slate-200 dark:border-slate-800 rounded-lg">
      <div className="mb-4 bg-slate-50 dark:bg-slate-800/50 p-4 rounded-full">{icon}</div>
      <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-1">{title}</h3>
      <p className="text-sm text-slate-500 dark:text-slate-400 mb-6 max-w-sm">{description}</p>
      {action && <div>{action}</div>}
    </div>
  );
}

export default EmptyState;
