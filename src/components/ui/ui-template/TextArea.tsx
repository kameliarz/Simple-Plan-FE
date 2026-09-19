import type { TextareaHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

import { IconAlertCircle } from "@tabler/icons-react";

export interface TextAreaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: string;
  label?: string;
}

export default function TextArea({
  className,
  error,
  id,
  label,
  required,
  rows = 4,
  ...props
}: TextAreaProps) {
  const inputId = id ?? props.name;

  return (
    <div className="flex flex-col gap-2">
      {label ? (
        <div className="flex items-center justify-between">
          <label className="text-base font-semibold text-text-secondary" htmlFor={inputId}>
            {label}
            {required ? <span className="ml-1 text-red-500">*</span> : null}
          </label>

          {/* {required ? (
            <span className="text-xs font-normal text-[#91A4C3]">Wajib diisi</span>
          ) : null} */}
        </div>
      ) : null}
      <textarea
        className={cn(
          "w-full resize-none rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 transition placeholder:text-slate-400 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200",
          error && "border-danger-500 focus:border-danger-500",
          className,
        )}
        id={inputId}
        rows={rows}
        {...props}
      />

      {error ? (
        <small className="flex items-center gap-1 text-xs font-normal text-danger-500">
          <IconAlertCircle size={14} strokeWidth={2} />
          <span>{error}</span>
        </small>
      ) : null}
    </div>
  );
}
