import React from "react";
import { Calendar } from "lucide-react";
import type { TicketItem, TicketStatus } from "../types/helpdesk";
import { Avatar } from "../../../components/ui/Avatar";
import Badge, { type BadgeVariant } from "../../../components/ui/Badge";
import { cn } from "../../../lib/utils";

interface TicketCardMobileProps {
  ticket: TicketItem;
  onClick?: (ticket: TicketItem) => void;
  className?: string;
}

const borderAccentMap: Record<TicketStatus, string> = {
  Baru: "border-l-amber-500",
  Terverifikasi: "border-l-amber-500",
  Diproses: "border-l-blue-600",
  Selesai: "border-l-emerald-500",
  Ditolak: "border-l-rose-500",
};

const statusVariantMap: Record<TicketStatus, BadgeVariant> = {
  Baru: "primary",
  Terverifikasi: "warning",
  Diproses: "info",
  Selesai: "success",
  Ditolak: "danger",
};

export const TicketCardMobile: React.FC<TicketCardMobileProps> = ({
  ticket,
  onClick,
  className,
}) => {
  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => onClick?.(ticket)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") onClick?.(ticket);
      }}
      className={cn(
        "w-full text-left bg-white dark:bg-[#1e293b] rounded-xl border border-slate-100 dark:border-slate-800 shadow-sm p-3.5 space-y-3 transition-all hover:shadow-md active:scale-[0.99] border-l-4",
        borderAccentMap[ticket.status] || "border-l-slate-300",
        className,
      )}
    >
      {/* Baris 1: Nomor Tiket & Badge Status */}
      <div className="flex items-start justify-between gap-2">
        <div>
          <span className="text-[10px] uppercase tracking-wider text-slate-400 dark:text-slate-400 font-semibold block">
            Nomor Tiket
          </span>
          <p className="text-xs font-bold text-slate-800 dark:text-slate-200">{ticket.code}</p>
        </div>

        <Badge variant={statusVariantMap[ticket.status] || "default"} size="sm">
          {ticket.status}
        </Badge>
      </div>

      {/* Baris 2: Profil Pelapor & Tanggal */}
      <div className="flex items-center justify-between pt-1 border-t border-slate-50 dark:border-slate-800/80">
        <div className="flex items-center gap-2.5 min-w-0">
          <Avatar
            initials={ticket.reporter.avatarInitials}
            src={ticket.reporter.avatarUrl}
            size="md"
          />
          <div className="min-w-0">
            <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate">
              {ticket.reporter.name}
            </p>
            <p className="text-[11px] text-slate-400 dark:text-slate-400 truncate">
              {ticket.reporter.unit}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 text-[11px] text-slate-500 dark:text-slate-400 shrink-0">
          <Calendar className="w-3.5 h-3.5 text-slate-400" />
          <span>{ticket.createdAt}</span>
        </div>
      </div>
    </div>
  );
};

export default TicketCardMobile;
