import React from "react";
import type { TicketStatus } from "../types/helpdesk";

interface Props {
  status: TicketStatus;
}

const statusStyles: Record<TicketStatus, string> = {
  Baru: "bg-badge-new-fill text-badge-new-text border-badge-new-stroke",
  Terverifikasi: "bg-badge-verified-fill text-badge-verified-text border-badge-verified-stroke",
  Diproses: "bg-badge-process-fill text-badge-process-text border-badge-process-stroke",
  Selesai: "bg-badge-done-fill text-badge-done-text border-badge-done-stroke",
  Ditolak: "bg-badge-denied-fill text-badge-denied-text border-badge-denied-stroke",
  Diklasifikasi: "bg-badge-verified-fill text-badge-verified-text border-badge-verified-stroke",
  Eskalasi: "bg-badge-denied-fill text-badge-denied-text border-badge-denied-stroke",
};

export const TicketStatusBadge: React.FC<Props> = ({ status }) => (
  <span
    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${statusStyles[status]}`}
  >
    {status}
  </span>
);
