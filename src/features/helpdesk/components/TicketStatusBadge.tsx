import React from "react";
import type { TicketStatus } from "../types/helpdesk";

interface Props {
  status: TicketStatus;
}

const statusStyles: Record<TicketStatus, string> = {
  Baru: "bg-slate-100 text-slate-700 border-slate-200",
  Diklasifikasi: "bg-purple-100 text-purple-700 border-purple-200",
  Ditugaskan: "bg-amber-100 text-amber-700 border-amber-200",
  Diproses: "bg-blue-100 text-blue-700 border-blue-200",
  Eskalasi: "bg-orange-100 text-orange-700 border-orange-200",
  Terselesaikan: "bg-emerald-100 text-emerald-700 border-emerald-200",
  Terverifikasi: "bg-teal-100 text-teal-700 border-teal-200",
  Ditutup: "bg-slate-100 text-slate-700 border-slate-200",
  Ditolak: "bg-rose-100 text-rose-700 border-rose-200",
};

export const TicketStatusBadge: React.FC<Props> = ({ status }) => (
  <span
    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${statusStyles[status]}`}
  >
    {status}
  </span>
);
