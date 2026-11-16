import type { InputHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "type"> {
  error?: string;
  label?: string;
}

export default function Checkbox({ className, error, id, label, ...props }: CheckboxProps) {
  const inputId = id ?? props.name;

  return (
    <div className="flex flex-col gap-1">
      <label className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300">
        <input
          className={cn(
            "rounded border-slate-300 text-primary-600 shadow-sm focus:ring-primary-500 dark:border-slate-700 dark:bg-slate-900",
            className,
          )}
          id={inputId}
          type="checkbox"
          {...props}
        />
        {label}
      </label>
      {error ? <small className="text-xs text-danger-500">{error}</small> : null}
    </div>
  );
}
