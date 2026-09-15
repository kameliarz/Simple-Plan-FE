import type { InputHTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils";

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
          <label className="text-base font-semibold text-slate-700" htmlFor={inputId}>
            {label}
            {required ? <span className="ml-1 text-red-500">*</span> : null}
          </label>

          {required ? (
            <span className="text-xs font-normal text-[#91A4C3]">Wajib diisi</span>
          ) : null}
        </div>
      ) : null}

      <div className="relative">
        {icon ? (
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">{icon}</span>
        ) : null}

        <input
          className={cn(
            "h-11 w-full rounded-md border border-[#DCE4EF] bg-white px-4 text-sm text-slate-700 transition",
            "placeholder:text-[#91A4C3]",
            "focus:border-bluersch focus:outline-none focus:ring-2 focus:ring-bluersch/10",
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

      {error ? <small className="text-xs font-normal text-danger-500">{error}</small> : null}
    </div>
  );
}
