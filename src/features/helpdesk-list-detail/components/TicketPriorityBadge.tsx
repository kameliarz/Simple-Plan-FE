import React from "react";

import type { TicketPriority } from "../types/helpdesk";

interface Props {
  priority: TicketPriority | null;
}

const priorityStyles: Record<TicketPriority, string> = {
  Low: "bg-badge-new-fill text-badge-new-text border-badge-new-stroke",
  Medium:
    "bg-badge-classificated-fill text-badge-classificated-text border-badge-classificated-stroke",
  High: "bg-badge-process-fill text-badge-process-text border-badge-process-stroke",
  Critical: "bg-badge-denied-fill text-badge-denied-text border-badge-denied-stroke",
};

export const TicketPriorityBadge: React.FC<Props> = ({ priority }) => {
  if (!priority) {
    return <span className="text-sm text-text-secondary">-</span>;
  }

  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${priorityStyles[priority]}`}
    >
      {priority}
    </span>
  );
};
