import React from "react";
import { cn } from "../../lib/utils";

export type BadgeVariant =
  "default" | "primary" | "success" | "warning" | "danger" | "info" | "outline";

export type BadgeSize = "sm" | "md" | "lg";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
  size?: BadgeSize;
  dot?: boolean;
  dotColor?: string;
  children: React.ReactNode;
}

const variantStyles: Record<BadgeVariant, string> = {
  default:
    "bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700",
  primary:
    "bg-blue-50/80 text-[#003178] border-blue-900/30 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-400/40",
  success:
    "bg-emerald-50 text-emerald-700 border-emerald-300 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-800/60",
  warning:
    "bg-amber-50 text-amber-700 border-amber-300 dark:bg-amber-950/30 dark:text-amber-400 dark:border-amber-800/60",
  danger:
    "bg-rose-50 text-rose-600 border-rose-300 dark:bg-rose-950/30 dark:text-rose-400 dark:border-rose-800/60",
  info: "bg-sky-50 text-sky-700 border-sky-300 dark:bg-sky-950/30 dark:text-sky-400 dark:border-sky-800/60",
  outline:
    "bg-transparent text-slate-700 border-slate-300 dark:text-slate-300 dark:border-slate-700",
};

const sizeStyles: Record<BadgeSize, string> = {
  sm: "text-[10px] px-2 py-0.5",
  md: "text-xs px-2.5 py-0.5",
  lg: "text-sm px-3 py-1",
};

export const Badge: React.FC<BadgeProps> = ({
  variant = "default",
  size = "md",
  dot = false,
  dotColor,
  children,
  className,
  ...props
}) => {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full font-medium border transition-colors select-none",
        variantStyles[variant],
        sizeStyles[size],
        className,
      )}
      {...props}
    >
      {dot && (
        <span
          className={cn(
            "w-1.5 h-1.5 rounded-full shrink-0",
            dotColor ||
              (variant === "danger"
                ? "bg-rose-500"
                : variant === "warning"
                  ? "bg-amber-500"
                  : variant === "success"
                    ? "bg-emerald-500"
                    : "bg-[#003178]"),
          )}
        />
      )}
      {children}
    </span>
  );
};

export default Badge;
