import React, { useState } from "react";
import { ArrowLeft, User, Calendar, Tag, Clock, ImageIcon, Download, X, Check } from "lucide-react";
import type { TicketItem } from "../types/helpdesk";
import { RejectTicketModal } from "../components/RejectTicketModal";
import { Toast } from "../../../components/ui/Toast";
import { cn } from "../../../lib/utils";

interface HelpdeskDetailPageProps {
  ticket?: TicketItem;
  onBack?: () => void;
  onStatusChange?: (ticketId: string, newStatus: TicketItem["status"]) => void;
}

const DEFAULT_TICKET: TicketItem = {
  id: "1",
  code: "TIK-2023-045",
  title: "Jaringan Wi-Fi Lantai 3 Mati Total",
  description:
    "Jaringan Wi-Fi Lantai 3 Mati Total. Koneksi internet di seluruh area lantai 3 terputus sejak pagi ini. Sudah coba restart router tapi tetap tidak bisa.",
  category: "Ketidakstabilan System",
  status: "Baru",
  reporter: {
    name: "Ahmad Subagyo",
    unit: "Poli Umum",
    avatarInitials: "AS",
  },
  createdAt: "10 Okt 2023, 08:30",
  attachments: [
    {
      id: "att-1",
      name: "sebelum_perbaikan.jpg",
      size: "920 KB",
      url: "#",
    },
  ],
  history: [
    {
      id: "log-1",
      action: "Menunggu Verifikasi",
      timestamp: "10 Okt 08:45",
      isCompleted: true,
    },
    {
      id: "log-2",
      action: "Tiket dibuat.",
      timestamp: "10 Okt 08:30",
      isCompleted: false,
    },
  ],
};

export const HelpdeskDetailPage: React.FC<HelpdeskDetailPageProps> = ({
  ticket = DEFAULT_TICKET,
  onBack,
  onStatusChange,
}) => {
  const [currentTicket, setCurrentTicket] = useState<TicketItem>(ticket);
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");

  const handleConfirmReject = (reason: string) => {
    setIsRejectModalOpen(false);
    const updatedHistory = [
      {
        id: `log-${Date.now()}`,
        action: `Tiket ditolak: ${reason}`,
        timestamp: "10 Okt 08:50",
        isCompleted: true,
      },
      ...(currentTicket.history || []),
    ];

    const updatedTicket: TicketItem = {
      ...currentTicket,
      status: "Ditolak",
      history: updatedHistory,
    };

    setCurrentTicket(updatedTicket);
    onStatusChange?.(currentTicket.id, "Ditolak");
    setToastMessage("Tiket ditolak");
    setShowToast(true);
  };

  const handleVerify = () => {
    const updatedTicket: TicketItem = {
      ...currentTicket,
      status: "Terverifikasi",
    };
    setCurrentTicket(updatedTicket);
    onStatusChange?.(currentTicket.id, "Terverifikasi");
    setToastMessage("Tiket berhasil diverifikasi");
    setShowToast(true);
  };

  const isRejected = currentTicket.status === "Ditolak";
  const isVerified = currentTicket.status === "Terverifikasi";

  return (
    <div className="w-full pb-24 px-4 pt-2 space-y-3.5">
      {/* Toast Feedback */}
      <Toast
        show={showToast}
        message={toastMessage}
        onClose={() => setShowToast(false)}
        variant={isRejected ? "danger" : "success"}
      />

      {/* 1. Sub-Header: Back Button, Judul, & Badge Status */}
      <div className="space-y-2">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onBack}
            className="w-8 h-8 rounded-full bg-slate-900 dark:bg-slate-800 text-white flex items-center justify-center hover:bg-slate-800 dark:hover:bg-slate-700 transition cursor-pointer shadow-xs shrink-0"
            title="Kembali ke Daftar"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>

          <div>
            <h1 className="text-sm font-bold text-slate-900 dark:text-slate-100 leading-tight">
              Detail Tiket
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold">
              #{currentTicket.code}
            </p>
          </div>
        </div>

        {/* Dynamic Status Badge */}
        <div>
          {isRejected ? (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-rose-50 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-900/60">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
              Ditolak
            </span>
          ) : isVerified ? (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-900/60">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
              Terverifikasi
            </span>
          ) : (
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-amber-100/90 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-900/50">
              {currentTicket.status}
            </span>
          )}
        </div>
      </div>

      {/* 2. Card 1: Informasi Pelapor & Kategori */}
      <div className="bg-white dark:bg-[#1e293b] rounded-2xl border border-slate-100 dark:border-slate-800 p-4 space-y-3 shadow-xs">
        <div className="grid grid-cols-2 gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
          {/* Pelapor */}
          <div className="space-y-1">
            <div className="flex items-center gap-1.5 text-slate-400 text-[11px] font-medium">
              <User className="w-3.5 h-3.5 text-blue-900 dark:text-blue-400" />
              <span>Pelapor</span>
            </div>
            <p className="text-xs font-bold text-slate-800 dark:text-slate-100">
              {currentTicket.reporter.name}
            </p>
            <p className="text-[11px] text-slate-400 font-medium">{currentTicket.reporter.unit}</p>
          </div>

          {/* Tanggal Dibuat */}
          <div className="space-y-1">
            <div className="flex items-center gap-1.5 text-slate-400 text-[11px] font-medium">
              <Calendar className="w-3.5 h-3.5" />
              <span>Tanggal Dibuat</span>
            </div>
            <p className="text-xs font-semibold text-slate-700 dark:text-slate-200">
              {currentTicket.createdAt}
            </p>
          </div>
        </div>

        {/* Kategori */}
        <div className="flex items-center justify-between text-xs pt-0.5">
          <div className="flex items-center gap-1.5 text-slate-400 text-[11px] font-medium">
            <Tag className="w-3.5 h-3.5" />
            <span>Kategori:</span>
          </div>

          <span className="inline-flex items-center px-3 py-1 rounded-lg text-xs font-semibold border border-blue-900/30 text-blue-950 dark:border-blue-400/40 dark:text-blue-300 bg-blue-50/40 dark:bg-blue-950/20">
            {currentTicket.category}
          </span>
        </div>
      </div>

      {/* 3. Card 2: Deskripsi & Lampiran */}
      <div className="bg-white dark:bg-[#1e293b] rounded-2xl border border-slate-100 dark:border-slate-800 p-4 space-y-3 shadow-xs">
        <h2 className="text-xs font-bold text-slate-900 dark:text-slate-100">Deskripsi</h2>
        <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed font-normal">
          &ldquo;{currentTicket.description}&rdquo;
        </p>

        {/* Foto Bukti Awal */}
        {currentTicket.attachments && currentTicket.attachments.length > 0 && (
          <div className="pt-2 space-y-2 border-t border-slate-100 dark:border-slate-800">
            <span className="text-[11px] text-slate-400 font-medium block">Foto Bukti Awal</span>

            {currentTicket.attachments.map((att) => (
              <div
                key={att.id}
                className="flex items-center justify-between p-2.5 rounded-xl border border-slate-200/80 dark:border-slate-700/80 bg-slate-50/60 dark:bg-slate-900/40"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-9 h-9 rounded-lg bg-[#003178] dark:bg-blue-900 flex items-center justify-center text-white shrink-0 shadow-xs">
                    <ImageIcon className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate">
                      {att.name}
                    </p>
                    <span className="text-[10px] text-slate-400">{att.size}</span>
                  </div>
                </div>

                <a
                  href={att.url}
                  download
                  className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-lg hover:bg-slate-200/60 dark:hover:bg-slate-800 transition shrink-0"
                  title="Unduh Lampiran"
                >
                  <Download className="w-4 h-4" />
                </a>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 4. Card 3: Riwayat Penanganan (Timeline) */}
      <div className="bg-white dark:bg-[#1e293b] rounded-2xl border border-slate-100 dark:border-slate-800 p-4 space-y-3.5 shadow-xs">
        <div className="flex items-center gap-2 text-xs font-bold text-slate-900 dark:text-slate-100">
          <Clock className="w-4 h-4 text-slate-500" />
          <span>Riwayat Penanganan</span>
        </div>

        <div className="pl-1 pt-1 space-y-4">
          {currentTicket.history?.map((log, index) => {
            const isLatest = index === 0;
            const isLastItem = index === (currentTicket.history?.length ?? 1) - 1;

            return (
              <div key={log.id} className="relative flex items-start gap-3">
                {/* Timeline vertical connector line */}
                {!isLastItem && (
                  <div className="absolute left-1.5 top-3.5 bottom-[-16px] w-[1.5px] bg-slate-200 dark:bg-slate-700" />
                )}

                {/* Dot */}
                <div
                  className={cn(
                    "w-3 h-3 rounded-full mt-0.5 shrink-0 z-10 ring-2 ring-white dark:ring-[#1e293b]",
                    isLatest
                      ? isRejected
                        ? "bg-rose-500"
                        : "bg-amber-500"
                      : "bg-slate-300 dark:bg-slate-600",
                  )}
                />

                <div className="min-w-0 flex-1 text-xs">
                  <span
                    className={cn(
                      "font-semibold block",
                      isLatest
                        ? isRejected
                          ? "text-rose-600 dark:text-rose-400"
                          : "text-amber-700 dark:text-amber-400"
                        : "text-slate-400 dark:text-slate-500",
                    )}
                  >
                    {log.timestamp}
                  </span>
                  <p className="text-slate-700 dark:text-slate-300 font-medium mt-0.5">
                    {log.action}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 5. Sticky Action Bar di Bawah */}
      {!isRejected && (
        <div className="flex items-center gap-3 pt-2">
          <button
            type="button"
            onClick={() => setIsRejectModalOpen(true)}
            className="flex-1 py-3 px-4 rounded-xl border border-rose-300 dark:border-rose-800/80 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 text-xs font-semibold transition flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
          >
            <X className="w-4 h-4" />
            <span>Tolak</span>
          </button>

          <button
            type="button"
            onClick={handleVerify}
            className="flex-1 py-3 px-4 rounded-xl bg-[#003178] hover:bg-[#00255a] text-white text-xs font-semibold transition flex items-center justify-center gap-1.5 cursor-pointer shadow-md"
          >
            <Check className="w-4 h-4" />
            <span>Verifikasi</span>
          </button>
        </div>
      )}

      {/* Modal Tolak Tiket */}
      <RejectTicketModal
        isOpen={isRejectModalOpen}
        ticketCode={currentTicket.code}
        onClose={() => setIsRejectModalOpen(false)}
        onConfirmReject={handleConfirmReject}
      />
    </div>
  );
};

export default HelpdeskDetailPage;
