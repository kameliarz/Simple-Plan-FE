import React from "react";
import { ChevronRight } from "lucide-react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

export interface BreadcrumbProps {
  items: BreadcrumbItem[];
  className?: string;
}

export function Breadcrumb({ items, className }: BreadcrumbProps) {
  return (
    <nav className={cn("flex items-center text-sm text-slate-500 dark:text-slate-400", className)}>
      {items.map((item, index) => {
        const isLast = index === items.length - 1;
        return (
          <React.Fragment key={index}>
            {item.href && !isLast ? (
              <a
                href={item.href}
                className="hover:text-slate-800 dark:hover:text-slate-200 transition-colors"
              >
                {item.label}
              </a>
            ) : (
              <span className={cn(isLast ? "text-slate-800 dark:text-slate-200" : "")}>
                {item.label}
              </span>
            )}

            {!isLast && (
              <ChevronRight className="w-4 h-4 mx-2 text-slate-400 dark:text-slate-600" />
            )}
          </React.Fragment>
        );
      })}
    </nav>
  );
}

export default Breadcrumb;
