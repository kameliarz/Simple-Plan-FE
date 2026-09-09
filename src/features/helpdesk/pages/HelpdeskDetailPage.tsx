import React, { useState } from "react";
import { ArrowLeft, User, Calendar, Tag, Clock, X, Check } from "lucide-react";
import type { TicketItem } from "../types/helpdesk";
import { RejectTicketModal } from "../components/RejectTicketModal";
import { Toast } from "../../../components/ui/Toast";
import Badge from "../../../components/ui/Badge";
import InfoCard from "../../../components/ui/InfoCard";
import AttachmentCard from "../../../components/ui/AttachmentCard";
import Timeline, { type TimelineEntry } from "../../../components/ui/Timeline";
import BottomActionBar from "../../../components/ui/BottomActionBar";

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

  const timelineItems: TimelineEntry[] = (currentTicket.history || []).map((log, index) => ({
    id: log.id,
    timestamp: log.timestamp,
    action: log.action,
    isCompleted: log.isCompleted,
    variant: index === 0 && isRejected ? "danger" : index === 0 ? "warning" : "default",
  }));

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
            <Badge variant="danger" dot>
              Ditolak
            </Badge>
          ) : isVerified ? (
            <Badge variant="warning" dot>
              Terverifikasi
            </Badge>
          ) : (
            <Badge variant="warning">{currentTicket.status}</Badge>
          )}
        </div>
      </div>

      {/* 2. Card 1: Informasi Pelapor & Kategori */}
      <InfoCard>
        <div className="grid grid-cols-2 gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
          {/* Pelapor */}
          <div className="space-y-1">
            <div className="flex items-center gap-1.5 text-slate-400 text-[11px] font-medium">
              <User className="w-3.5 h-3.5 text-[#003178] dark:text-blue-400" />
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

          <Badge variant="primary" size="sm">
            {currentTicket.category}
          </Badge>
        </div>
      </InfoCard>

      {/* 3. Card 2: Deskripsi & Lampiran */}
      <InfoCard title="Deskripsi">
        <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed font-normal">
          &ldquo;{currentTicket.description}&rdquo;
        </p>

        {/* Foto Bukti Awal */}
        {currentTicket.attachments && currentTicket.attachments.length > 0 && (
          <div className="pt-2 space-y-2 border-t border-slate-100 dark:border-slate-800">
            <span className="text-[11px] text-slate-400 font-medium block">Foto Bukti Awal</span>

            {currentTicket.attachments.map((att) => (
              <AttachmentCard key={att.id} name={att.name} size={att.size} url={att.url} />
            ))}
          </div>
        )}
      </InfoCard>

      {/* 4. Card 3: Riwayat Penanganan (Timeline) */}
      <InfoCard title="Riwayat Penanganan" icon={<Clock className="w-4 h-4 text-slate-500" />}>
        <Timeline items={timelineItems} />
      </InfoCard>

      {/* 5. Sticky Action Bar di Bawah */}
      {!isRejected && (
        <BottomActionBar>
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
        </BottomActionBar>
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
