import { cn } from "@/lib/utils";
import { helpdeskCategories } from "../data/helpdeskTicketData";
import type { HelpdeskCategory } from "../types";

interface CategorySectionProps {
  value: HelpdeskCategory;
  onChange: (value: HelpdeskCategory) => void;
}

export default function CategorySection({ value, onChange }: CategorySectionProps) {
  return (
    <div className="mt-5">
      <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-600">
        Kategori Helpdesk
        <span className="ml-1 text-red-500">*</span>
      </label>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        {helpdeskCategories.map((category) => {
          const selected = value === category.value;

          return (
            <button
              key={category.value}
              type="button"
              onClick={() => onChange(category.value)}
              className={cn(
                "flex min-h-12 items-center gap-3 rounded-lg border px-4 text-left transition",
                selected
                  ? "border-blue-600 bg-blue-50/30"
                  : "border-slate-200 bg-white hover:border-slate-300",
              )}
            >
              <span
                className={cn(
                  "flex h-4 w-4 shrink-0 items-center justify-center rounded-full border",
                  selected ? "border-blue-700" : "border-slate-300",
                )}
              >
                {selected && <span className="h-2 w-2 rounded-full bg-blue-700" />}
              </span>

              <span
                className={cn(
                  "text-sm",
                  selected ? "font-medium text-slate-800" : "text-slate-600",
                )}
              >
                {category.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
