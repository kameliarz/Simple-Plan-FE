import { useState } from "react";

import { ArrowLeft, Calendar, Check, Clock, Info, Tag, X } from "lucide-react";

import { useNavigate, useParams } from "react-router-dom";

import type { TicketItem } from "../types/helpdesk";

import { MOCK_TICKETS } from "../data/mockTickets";

import { RejectTicketModal } from "../components/RejectTicketModal";

import { Toast } from "../../../components/ui/Toast";

import Badge from "../../../components/ui/Badge";

import AttachmentCard from "../../../components/ui/AttachmentCard";

import Timeline, { type TimelineEntry } from "../../../components/ui/Timeline";

export default function HelpdeskDetailPage() {
  // Mengambil fungsi navigasi dari React Router
  const navigate = useNavigate();

  // Mengambil ID tiket dari URL
  // Contoh: /helpdesk/tik/1
  const { ticketId } = useParams<{
    ticketId: string;
  }>();

  // Mencari tiket berdasarkan ID dari mock data
  const ticket = MOCK_TICKETS.find((item) => String(item.id) === ticketId);

  // Menyimpan data tiket yang sedang ditampilkan
  const [currentTicket, setCurrentTicket] = useState<TicketItem | null>(ticket ?? null);

  // State modal penolakan
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);

  // State toast
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");

  // Jika tiket tidak ditemukan
  if (!currentTicket) {
    return (
      <div className="flex min-h-full items-center justify-center bg-background p-6">
        <div className="text-center">
          <h1 className="text-sm font-semibold text-text-title">Tiket Tidak Ditemukan</h1>

          <p className="mt-1 text-xs text-text-secondary">
            Data tiket yang kamu cari tidak tersedia.
          </p>

          <button
            type="button"
            onClick={() => navigate("/helpdesk/tik")}
            className="
              mt-4
              cursor-pointer
              rounded-md
              bg-primary-600
              px-4
              py-2
              text-xs
              font-medium
              text-white
              transition
              hover:bg-primary-700
            "
          >
            Kembali ke Helpdesk
          </button>
        </div>
      </div>
    );
  }

  // Menangani penolakan tiket
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

    setToastMessage("Tiket ditolak");
    setShowToast(true);
  };

  // Menangani klasifikasi/verifikasi tiket
  const handleVerify = () => {
    const updatedTicket: TicketItem = {
      ...currentTicket,
      status: "Terverifikasi",
    };

    setCurrentTicket(updatedTicket);

    setToastMessage("Tiket berhasil diklasifikasikan");
    setShowToast(true);
  };

  // Mengecek status tiket
  const isRejected = currentTicket.status === "Ditolak";

  const isVerified = currentTicket.status === "Terverifikasi";

  // Mengubah history menjadi format Timeline
  const timelineItems: TimelineEntry[] = (currentTicket.history || []).map((log, index) => ({
    id: log.id,
    timestamp: log.timestamp,
    action: log.action,
    isCompleted: log.isCompleted,
    variant: index === 0 && isRejected ? "danger" : index === 0 ? "warning" : "default",
  }));

  return (
    <div
      className="
        min-h-full
        w-full
        bg-background
        px-4
        pb-8
        pt-5
        text-text
        lg:px-8
        lg:pt-7
      "
    >
      <div className="mx-auto max-w-350">
        {/* =====================================================
            TOAST
            ===================================================== */}
        <Toast
          show={showToast}
          message={toastMessage}
          onClose={() => setShowToast(false)}
          variant={isRejected ? "danger" : "success"}
        />

        {/* =====================================================
            HEADER DETAIL
            ===================================================== */}
        <div
          className="
            mb-5
            flex
            min-h-16
            flex-wrap
            items-center
            justify-between
            gap-4
            rounded-lg
            border
            border-slate-200
            bg-table-card
            px-4
            py-3
            shadow-sm
            dark:border-slate-700
          "
        >
          {/* Kiri: tombol kembali + nomor tiket + status */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => navigate("/helpdesk/tik")}
              className="
                flex
                h-8
                w-8
                cursor-pointer
                items-center
                justify-center
                rounded-md
                text-slate-500
                transition
                hover:bg-slate-100
                hover:text-slate-700
                dark:hover:bg-slate-800
              "
              title="Kembali ke Daftar Tiket"
            >
              <ArrowLeft className="h-5 w-5" strokeWidth={1.8} />
            </button>

            <div className="flex items-center gap-3">
              <h1
                className="
                  text-base
                  font-semibold
                  text-text-title
                "
              >
                Ticket #{currentTicket.code}
              </h1>

              {isRejected ? (
                <Badge variant="danger" dot size="sm">
                  Ditolak
                </Badge>
              ) : isVerified ? (
                <Badge variant="warning" dot size="sm">
                  Terverifikasi
                </Badge>
              ) : (
                <Badge variant="warning" dot size="sm">
                  {currentTicket.status}
                </Badge>
              )}
            </div>
          </div>

          {/* Kanan: tombol aksi */}
          {!isRejected && (
            <div className="flex items-center gap-3">
              {/* Tolak */}
              <button
                type="button"
                onClick={() => setIsRejectModalOpen(true)}
                className="
                  flex
                  h-9
                  cursor-pointer
                  items-center
                  gap-2
                  rounded-md
                  border
                  border-rose-200
                  bg-white
                  px-4
                  text-xs
                  font-medium
                  text-rose-500
                  transition
                  hover:bg-rose-50
                  dark:border-rose-800
                  dark:bg-slate-900
                  dark:text-rose-400
                "
              >
                <X className="h-4 w-4" strokeWidth={1.8} />
                Tolak
              </button>

              {/* Klasifikasikan */}
              <button
                type="button"
                onClick={handleVerify}
                className="
                  flex
                  h-9
                  cursor-pointer
                  items-center
                  gap-2
                  rounded-md
                  bg-primary-600
                  px-5
                  text-xs
                  font-semibold
                  text-white
                  transition
                  hover:bg-primary-700
                "
              >
                <Check className="h-4 w-4" strokeWidth={2} />
                Klasifikasikan
              </button>
            </div>
          )}
        </div>

        {/* =====================================================
            CONTENT
            KIRI = DETAIL
            KANAN = RIWAYAT
            ===================================================== */}
        <div
          className="
            grid
            grid-cols-1
            gap-4
            lg:grid-cols-[minmax(0,2fr)_313px]
          "
        >
          {/* ===================================================
              LEFT COLUMN
              =================================================== */}
          <div className="min-w-0 space-y-4">
            {/* =================================================
                INFORMASI TIKET
                ================================================= */}
            <section
              className="
                overflow-hidden
                rounded-lg
                border
                border-slate-200
                bg-table-card
                shadow-sm
                dark:border-slate-700
              "
            >
              {/* Card Header */}
              <div
                className="
                  flex
                  h-13
                  items-center
                  gap-2
                  border-b
                  border-slate-200
                  px-5
                  dark:border-slate-700
                "
              >
                <Info className="h-5 w-5 text-slate-500" strokeWidth={1.8} />

                <h2
                  className="
                    text-sm
                    font-semibold
                    text-text-title
                  "
                >
                  Informasi Tiket
                </h2>
              </div>

              {/* Card Body */}
              <div className="px-6 py-5">
                <div
                  className="
                    grid
                    grid-cols-1
                    gap-6
                    md:grid-cols-2
                  "
                >
                  {/* Pelapor */}
                  <div>
                    <p
                      className="
                        mb-1.5
                        text-xs
                        font-medium
                        text-slate-400
                      "
                    >
                      Nama Pelapor
                    </p>

                    <p
                      className="
                        text-sm
                        font-medium
                        text-text-title
                      "
                    >
                      {currentTicket.reporter.name}
                    </p>
                  </div>

                  {/* Unit */}
                  <div>
                    <p
                      className="
                        mb-1.5
                        text-xs
                        font-medium
                        text-slate-400
                      "
                    >
                      Unit Pelapor
                    </p>

                    <p
                      className="
                        text-sm
                        font-medium
                        text-text-title
                      "
                    >
                      {currentTicket.reporter.unit}
                    </p>
                  </div>
                </div>

                {/* Divider */}
                <div
                  className="
                    my-5
                    border-t
                    border-slate-100
                    dark:border-slate-800
                  "
                />

                {/* Tanggal + Kategori */}
                <div
                  className="
                    grid
                    grid-cols-1
                    gap-5
                    md:grid-cols-2
                  "
                >
                  {/* Tanggal */}
                  <div>
                    <p
                      className="
                        mb-1.5
                        text-xs
                        font-medium
                        text-slate-400
                      "
                    >
                      Dibuat pada
                    </p>

                    <div
                      className="
                        inline-flex
                        items-center
                        gap-2
                        rounded-md
                        border
                        border-slate-200
                        bg-slate-50
                        px-3
                        py-1.5
                        text-xs
                        text-slate-600
                        dark:border-slate-700
                        dark:bg-slate-800
                        dark:text-slate-300
                      "
                    >
                      <Calendar className="h-4 w-4 text-slate-500" strokeWidth={1.8} />

                      {currentTicket.createdAt}
                    </div>
                  </div>

                  {/* Kategori */}
                  <div>
                    <p
                      className="
                        mb-1.5
                        text-xs
                        font-medium
                        text-slate-400
                      "
                    >
                      Kategori
                    </p>

                    <div className="flex items-center gap-2">
                      <Tag className="h-4 w-4 text-slate-400" strokeWidth={1.8} />

                      <Badge variant="primary" size="sm">
                        {currentTicket.category}
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* =================================================
                DESKRIPSI
                ================================================= */}
            <section
              className="
                overflow-hidden
                rounded-lg
                border
                border-slate-200
                bg-table-card
                shadow-sm
                dark:border-slate-700
              "
            >
              {/* Header */}
              <div
                className="
                  flex
                  h-13
                  items-center
                  gap-2
                  border-b
                  border-slate-200
                  px-5
                  dark:border-slate-700
                "
              >
                <div
                  className="
                    flex
                    h-5
                    w-5
                    items-center
                    justify-center
                    rounded
                    border
                    border-slate-400
                  "
                >
                  <span className="text-[9px] text-slate-500">≡</span>
                </div>

                <h2
                  className="
                    text-sm
                    font-semibold
                    text-text-title
                  "
                >
                  Deskripsi
                </h2>
              </div>

              {/* Body */}
              <div className="px-6 py-5">
                <p
                  className="
                    mb-2
                    text-xs
                    font-medium
                    text-slate-400
                  "
                >
                  Deskripsi Masalah
                </p>

                {/* Description box */}
                <div
                  className="
                    rounded-lg
                    border
                    border-slate-200
                    bg-slate-50
                    px-4
                    py-4
                    dark:border-slate-700
                    dark:bg-slate-800/50
                  "
                >
                  <p
                    className="
                      text-xs
                      leading-5
                      text-text-secondary
                    "
                  >
                    {currentTicket.description}
                  </p>
                </div>

                {/* Attachment */}
                {currentTicket.attachments && currentTicket.attachments.length > 0 && (
                  <div className="mt-4">
                    <p
                      className="
                          mb-2
                          text-xs
                          font-medium
                          text-slate-400
                        "
                    >
                      Foto Bukti Awal
                    </p>

                    <div className="space-y-2">
                      {currentTicket.attachments.map((att) => (
                        <AttachmentCard
                          key={att.id}
                          name={att.name}
                          size={att.size}
                          url={att.url}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </section>
          </div>

          {/* ===================================================
              RIGHT COLUMN
              =================================================== */}
          <section
            className="
              h-fit
              min-h-125
              overflow-hidden
              rounded-lg
              border
              border-slate-200
              bg-table-card
              shadow-sm
              dark:border-slate-700
              lg:min-h-130
            "
          >
            {/* Header */}
            <div
              className="
                flex
                h-13
                items-center
                gap-2
                border-b
                border-slate-200
                px-5
                dark:border-slate-700
              "
            >
              <Clock className="h-5 w-5 text-slate-500" strokeWidth={1.8} />

              <h2
                className="
                  text-sm
                  font-semibold
                  text-text-title
                "
              >
                Riwayat Penanganan
              </h2>
            </div>

            {/* Timeline */}
            <div className="px-5 py-5">
              {timelineItems.length > 0 ? (
                <Timeline items={timelineItems} />
              ) : (
                <div
                  className="
                    flex
                    min-h-75
                    items-center
                    justify-center
                    text-center
                  "
                >
                  <div>
                    <Clock
                      className="
                        mx-auto
                        h-8
                        w-8
                        text-slate-300
                      "
                      strokeWidth={1.5}
                    />

                    <p
                      className="
                        mt-3
                        text-xs
                        font-medium
                        text-slate-400
                      "
                    >
                      Belum ada riwayat
                    </p>
                  </div>
                </div>
              )}
            </div>
          </section>
        </div>
      </div>

      {/* =======================================================
          MODAL TOLAK
          ======================================================= */}
      <RejectTicketModal
        isOpen={isRejectModalOpen}
        ticketCode={currentTicket.code}
        onClose={() => setIsRejectModalOpen(false)}
        onConfirmReject={handleConfirmReject}
      />
    </div>
  );
}
