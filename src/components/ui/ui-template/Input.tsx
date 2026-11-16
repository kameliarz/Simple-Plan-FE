import type { InputHTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils";
import { IconAlertCircle } from "@tabler/icons-react";

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  error?: string;
  icon?: ReactNode;
  label?: string;
}

export default function Input({
  className,
  error,
  icon,
  id,
  label,
  required,
  type = "text",
  ...props
}: InputProps) {
  const inputId = id ?? props.name;

  return (
    <div className="flex flex-col gap-2">
      {label ? (
        <div className="flex items-center justify-between">
          <label className="text-sm font-semibold text-text-secondary" htmlFor={inputId}>
            {label}
            {required ? <span className="ml-1 text-red-500">*</span> : null}
          </label>
        </div>
      ) : null}

      <div className="relative">
        {icon ? (
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">{icon}</span>
        ) : null}

        <input
          className={cn(
            "h-11 w-full rounded-md border border-slate-300 dark:border-slate-500 bg-table-card px-4 text-sm dark:text-white transition",
            "placeholder:text-[#91A4C3]",
            "focus:border-primary-600 dark:focus:border-white  focus:outline-none focus:ring-2  focus:ring-primary-600/10 dark:focus:ring-white/10",
            icon ? "pl-11" : "",
            error && "border-danger-500 focus:border-danger-500 focus:ring-danger-500/10",
            className,
          )}
          id={inputId}
          required={required}
          type={type}
          {...props}
        />
      </div>

      {error ? (
        <small className="flex items-center gap-1 text-xs font-normal text-danger-500">
          <IconAlertCircle size={14} strokeWidth={2} />
          <span>{error}</span>
        </small>
      ) : null}
    </div>
  );
}
