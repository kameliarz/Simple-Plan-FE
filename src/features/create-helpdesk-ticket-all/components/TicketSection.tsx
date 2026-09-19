import type { ReactNode } from "react";

interface TicketSectionProps {
  title: string;
  children: ReactNode;
}

export default function TicketSection({ title, children }: TicketSectionProps) {
  return (
    <section className="rounded-xl border border-soft-border bg-table-card px-5 py-5">
      <h2 className="pb-3 text-base font-semibold text-text">{title}</h2>

      <div className="pt-5">{children}</div>
    </section>
  );
}
