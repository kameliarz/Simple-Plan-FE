import type { InputHTMLAttributes } from "react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export interface RadioButtonProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}

export function RadioButton({ className, label, id, ...props }: RadioButtonProps) {
  return (
    <div className="flex items-center space-x-2">
      <input
        type="radio"
        id={id}
        className={cn(
          "peer h-4 w-4 shrink-0 rounded-full border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-blue-600",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 disabled:cursor-not-allowed disabled:opacity-50",
          className,
        )}
        {...props}
      />
      {label && (
        <label
          htmlFor={id}
          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-slate-700 dark:text-slate-300"
        >
          {label}
        </label>
      )}
    </div>
  );
}

export default RadioButton;
