import React from "react";
import { Calendar } from "lucide-react";

import type { ApiTicket, ApiTicketStatus, ApiTicketPriority } from "../types/ticket";

import type { TicketStatus, TicketPriority } from "../types/helpdesk";

import { TicketStatusBadge } from "./TicketStatusBadge";
import { TicketPriorityBadge } from "./TicketPriorityBadge";

import { cn } from "../../../lib/utils";

/* =========================
   PROPS
========================= */

interface TicketCardMobileProps {
  ticket: ApiTicket;
  onClick?: (ticket: ApiTicket) => void;
  className?: string;
}

/* =========================
   STATUS LABEL
========================= */

const statusLabelMap: Record<ApiTicketStatus, TicketStatus> = {
  baru: "Baru",
  diklasifikasi: "Diklasifikasi",
  ditolak: "Ditolak",
  diproses: "Diproses",
  eskalasi: "Eskalasi",
  terselesaikan: "Terselesaikan",
  ditutup: "Ditutup",
};

/* =========================
   PRIORITY LABEL
========================= */

const priorityLabelMap: Record<ApiTicketPriority, TicketPriority> = {
  critical: "Critical",
  high: "High",
  medium: "Medium",
  low: "Low",
};

/* =========================
   LEFT BORDER COLOR
   Mengikuti warna border badge status
========================= */

const borderAccentMap: Record<TicketStatus, string> = {
  Baru: "border-l-badge-new-text",
  Diklasifikasi: "border-l-badge-classificated-text",
  Ditolak: "border-l-badge-denied-text",
  Diproses: "border-l-badge-process-text",
  Eskalasi: "border-l-badge-escalation-text",
  Terselesaikan: "border-l-badge-done-text",
  Ditutup: "border-l-badge-new-text",
};

/* =========================
   DATE FORMAT
========================= */

const formatDateTime = (dateString: string): string => {
  const date = new Date(dateString);

  if (Number.isNaN(date.getTime())) {
    return "-";
  }

  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  })
    .format(date)
    .replace(".", ":");
};

/* =========================
   AVATAR INITIALS
========================= */

const getInitials = (name: string): string => {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((word) => word.charAt(0).toUpperCase())
    .join("");
};

/* =========================
   COMPONENT
========================= */

export const TicketCardMobile: React.FC<TicketCardMobileProps> = ({
  ticket,
  onClick,
  className,
}) => {
  const status = statusLabelMap[ticket.status];

  const priority = ticket.priority ? priorityLabelMap[ticket.priority] : null;

  return (
    <button
      type="button"
      onClick={() => onClick?.(ticket)}
      className={cn(
        "relative w-full overflow-hidden",
        "rounded-lg border border-slate-200",
        "border-l-4 bg-table-card p-3",
        "text-left shadow-sm transition-colors",
        "hover:bg-slate-50 active:bg-slate-100",
        "focus-visible:outline-none",
        "focus-visible:ring-2 focus-visible:ring-blue-500",
        "focus-visible:ring-offset-2",
        "dark:border-slate-700",
        "dark:hover:bg-slate-800",
        "dark:active:bg-slate-700",
        borderAccentMap[status],
        className,
      )}
    >
      {/* =========================
          ROW 1: TICKET + BADGES
      ========================= */}

      <div className="flex items-start justify-between gap-2">
        {/* Ticket number */}
        <div className="min-w-0">
          <span
            className={cn(
              "block text-[10px] font-semibold",
              "uppercase tracking-wider",
              "text-slate-500 dark:text-slate-400",
            )}
          >
            Nomor Tiket
          </span>

          <p className={cn("mt-0.5 truncate text-xs font-semibold", "text-text-secondary")}>
            {ticket.ticket_number}
          </p>
        </div>

        {/* Status and priority */}
        <div className="flex shrink-0 flex-wrap items-center justify-end gap-1">
          <TicketStatusBadge status={status} />

          {priority && <TicketPriorityBadge priority={priority} />}
        </div>
      </div>

      {/* =========================
          ROW 2: REPORTER + DATE
      ========================= */}

      <div
        className={cn(
          "mt-3 flex items-center justify-between gap-2",
          "border-t border-slate-100 pt-2.5",
          "dark:border-slate-700",
        )}
      >
        {/* Reporter information */}
        <div className="flex min-w-0 items-center gap-2">
          {/* Avatar */}
          <div
            className={cn(
              "flex h-7 w-7 shrink-0 items-center",
              "justify-center rounded-full",
              "bg-blue-100 text-[10px] font-semibold",
              "text-blue-700",
              "dark:bg-blue-950 dark:text-blue-300",
            )}
          >
            {getInitials(ticket.reporter.name)}
          </div>

          {/* Name + unit */}
          <div className="min-w-0">
            <p className={cn("truncate text-xs font-semibold", "text-text")}>
              {ticket.reporter.name}
            </p>

            <p className={cn("truncate text-[11px]", "text-text-secondary")}>{ticket.unit.name}</p>
          </div>
        </div>

        {/* Date */}
        <div className={cn("flex shrink-0 items-center gap-1", "text-[10px] text-text-secondary")}>
          <Calendar size={12} strokeWidth={1.8} className="shrink-0 text-text-secondary" />

          <span>{formatDateTime(ticket.created_at)}</span>
        </div>
      </div>
    </button>
  );
};

export default TicketCardMobile;
