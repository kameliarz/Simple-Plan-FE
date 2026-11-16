import type { ReactNode } from "react";

interface DetailFieldProps {
  label: string;
  children: ReactNode;
}

export default function DetailField({ label, children }: DetailFieldProps) {
  return (
    <div className="grid grid-cols-1 gap-1 text-sm sm:grid-cols-[180px_minmax(0,1fr)] sm:gap-4">
      <dt className="text-text-secondary">{label}</dt>

      <dd className="min-w-0 wrap-break-word font-medium text-text-secondary">{children}</dd>
    </div>
  );
}
