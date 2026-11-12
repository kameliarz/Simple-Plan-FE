import { useId } from "react";
import { cn } from "@/lib/utils";

export interface CategorySelectorOption<T extends string> {
  label: string;
  value: T;
  description?: string;
}

interface CategorySelectorProps<T extends string> {
  value: T;
  options: CategorySelectorOption<T>[];
  onChange: (value: T) => void;
  label?: string;
  required?: boolean;
  error?: string;
  className?: string;
  name?: string;
}

export default function CategorySelector<T extends string>({
  value,
  options,
  onChange,
  label,
  required = false,
  error,
  className,
  name,
}: CategorySelectorProps<T>) {
  const generatedId = useId();
  const radioName = name ?? generatedId;
  const errorId = `${generatedId}-error`;

  return (
    <fieldset className={cn("space-y-2", className)} aria-describedby={error ? errorId : undefined}>
      {label && (
        <legend className="mb-1.5 block text-sm font-medium text-text-primary">
          {label}
          {required && <span className="ml-0.5 text-red-500">*</span>}
        </legend>
      )}

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {options.map((option) => {
          const isSelected = value === option.value;
          const inputId = `${generatedId}-${option.value}`;

          return (
            <label
              key={option.value}
              htmlFor={inputId}
              className={cn(
                "flex cursor-pointer items-start gap-2.5 rounded-lg border px-3 py-3 transition",
                isSelected ? "border-blue-500 bg-button/40" : "border-med-border bg-table-card",
              )}
            >
              <input
                id={inputId}
                type="radio"
                name={radioName}
                value={option.value}
                checked={isSelected}
                onChange={() => onChange(option.value)}
                className="mt-0.5 h-4 w-4 shrink-0 accent-blue-600"
              />

              <span className="min-w-0">
                <span className="block text-sm text-text-title">{option.label}</span>

                {option.description && (
                  <span className="mt-1 block text-xs text-slate-500">{option.description}</span>
                )}
              </span>
            </label>
          );
        })}
      </div>

      {error && (
        <p id={errorId} role="alert" className="text-xs text-red-500">
          {error}
        </p>
      )}
    </fieldset>
  );
}
