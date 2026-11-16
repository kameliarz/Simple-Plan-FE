import React from "react";
import { cn } from "../../lib/utils";

export interface InfoCardProps {
  title?: string;
  icon?: React.ReactNode;
  action?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

export const InfoCard: React.FC<InfoCardProps> = ({ title, icon, action, children, className }) => {
  return (
    <div
      className={cn(
        "bg-white dark:bg-[#1e293b] rounded-2xl border border-slate-100 dark:border-slate-800 p-4 space-y-3 shadow-xs",
        className,
      )}
    >
      {(title || icon || action) && (
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-900 dark:text-slate-100">
            {icon}
            {title && <span>{title}</span>}
          </div>
          {action && <div>{action}</div>}
        </div>
      )}
      {children}
    </div>
  );
};

export default InfoCard;
