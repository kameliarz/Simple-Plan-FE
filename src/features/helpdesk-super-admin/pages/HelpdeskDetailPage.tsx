import { useEffect, useRef, useState } from "react";

import {
  ArrowLeft,
  Calendar,
  Check,
  Clock,
  FileText,
  Image as ImageIcon,
  Info,
  Monitor,
  X,
} from "lucide-react";

import { useNavigate, useParams } from "react-router-dom";

import type { ApiTicket } from "../types/ticket";
import type { TicketItem } from "../types/helpdesk";

import { getTicket } from "../services/ticketApi";

import { RejectTicketModal } from "../components/RejectTicketModal";
import { TicketStatusBadge } from "../components/TicketStatusBadge";
import { TicketHistoryItem } from "../components/TicketHistoryItem";

import { Toast } from "../../../components/ui/Toast";
import Dropdown from "../../../components/ui/ui-template/Dropdown";

// ==========================================
// STATUS
// ==========================================

const mapStatus = (status: ApiTicket["status"]): TicketItem["status"] => {
  const statusMap: Record<ApiTicket["status"], TicketItem["status"]> = {
    baru: "Baru",
    terverifikasi: "Terverifikasi",
    diproses: "Diproses",
    selesai: "Selesai",
    ditolak: "Ditolak",
    diklasifikasi: "Diklasifikasi",
    eskalasi: "Eskalasi",
  };

  return statusMap[status];
};

// ==========================================
// FORMAT TANGGAL
// ==========================================

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
    .replace(".", ",");
};

const formatHistoryDate = (dateString: string): string => {
  const date = new Date(dateString);

  if (Number.isNaN(date.getTime())) {
    return "-";
  }

  const formatted = new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(date);

  return formatted.replace(",", " •");
};

// ==========================================
// FORMAT FILE
// ==========================================

const formatFileSize = (bytes: number): string => {
  if (bytes < 1024) {
    return `${bytes} B`;
  }

  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(1)} KB`;
  }

  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

// ==========================================
// MAPPING API → UI
// ==========================================

const mapApiTicketToTicketItem = (ticket: ApiTicket): TicketItem => {
  return {
    id: String(ticket.id),

    code: ticket.ticket_number,

    title: ticket.category ?? "-",

    description: ticket.description,

    category: ticket.service === "tik" ? "TIK" : "Sarpras",

    status: mapStatus(ticket.status),

    reporter: {
      name: ticket.reporter.name,
      unit: ticket.unit.name,
    },

    assignee: ticket.assigned_officer
      ? {
          name: ticket.assigned_officer.name,
          role: "Petugas",
        }
      : undefined,

    createdAt: ticket.created_at,

    finishedAt: ticket.completed_at ?? undefined,

    attachments: ticket.initial_evidence
      ? [
          {
            id: ticket.initial_evidence.object_key,

            name: ticket.initial_evidence.original_name,

            size: formatFileSize(ticket.initial_evidence.size),

            url: ticket.initial_evidence.object_key.startsWith("http")
              ? ticket.initial_evidence.object_key
              : `/storage/${ticket.initial_evidence.object_key}`,
          },
        ]
      : [],

    history: [
      {
        id: `created-${ticket.id}`,
        action: "Tiket Dibuat",
        timestamp: formatHistoryDate(ticket.created_at),
        isCompleted: true,
      },
    ],
  };
};

// ==========================================
// OPTIONS KLASIFIKASI
// ==========================================

const kategoriMutuOptions = ["Hardware", "Software", "Jaringan", "Aplikasi", "Lainnya"];

const tagsITOptions = ["Hardware", "Software", "Network", "SIMRS", "Aplikasi"];

// ==========================================
// COMPONENT
// ==========================================

export default function HelpdeskDetailPage() {
  const navigate = useNavigate();

  const { ticketId } = useParams<{
    ticketId: string;
  }>();

  // ==========================================
  // STATE
  // ==========================================

  const [currentTicket, setCurrentTicket] = useState<TicketItem | null>(null);

  const [isLoading, setIsLoading] = useState(true);

  const [error, setError] = useState<string | null>(null);

  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);

  const [showToast, setShowToast] = useState(false);

  const [toastMessage, setToastMessage] = useState("");

  const [isClassifying, setIsClassifying] = useState(false);

  const [kategoriMutu, setKategoriMutu] = useState("");

  const [tagsIT, setTagsIT] = useState("");

  const [kategoriMutuError, setKategoriMutuError] = useState("");

  const [tagsITError, setTagsITError] = useState("");

  const classificationRef = useRef<HTMLDivElement | null>(null);

  // ==========================================
  // GET DETAIL TICKET
  // ==========================================

  useEffect(() => {
    if (!ticketId) {
      return;
    }

    let isMounted = true;

    const fetchTicketDetail = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const data = await getTicket(ticketId);

        if (!isMounted) {
          return;
        }

        const mappedTicket = mapApiTicketToTicketItem(data);

        setCurrentTicket(mappedTicket);
      } catch (error) {
        if (!isMounted) {
          return;
        }

        console.error("Gagal mengambil detail tiket:", error);

        setCurrentTicket(null);

        setError(error instanceof Error ? error.message : "Gagal mengambil detail tiket.");
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    fetchTicketDetail();

    return () => {
      isMounted = false;
    };
  }, [ticketId]);

  // ==========================================
  // NO TICKET ID
  // ==========================================

  if (!ticketId) {
    return (
      <div className="flex min-h-full items-center justify-center bg-background p-6">
        <div className="text-center">
          <h1 className="text-sm font-semibold text-text-title">ID Tiket Tidak Ditemukan</h1>

          <p className="mt-1 text-xs text-text-secondary">ID tiket tidak tersedia pada URL.</p>

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
              text-sm
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

  // ==========================================
  // LOADING
  // ==========================================

  if (isLoading) {
    return (
      <div className="flex min-h-full items-center justify-center bg-background p-6">
        <div className="text-center">
          <div className="mx-auto mb-3 h-6 w-6 animate-spin rounded-full border-2 border-primary-600 border-t-transparent" />

          <h1 className="text-sm font-semibold text-text-title">Memuat detail tiket...</h1>

          <p className="mt-1 text-xs text-text-secondary">Mengambil data tiket dari server.</p>
        </div>
      </div>
    );
  }

  // ==========================================
  // ERROR / DATA TIDAK DITEMUKAN
  // ==========================================

  if (!currentTicket) {
    return (
      <div className="flex min-h-full items-center justify-center bg-background p-6">
        <div className="text-center">
          <h1 className="text-sm font-semibold text-text-title">Tiket Tidak Ditemukan</h1>

          <p className="mt-1 text-xs text-text-secondary">
            {error ?? "Data tiket yang kamu cari tidak tersedia."}
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
              text-sm
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

  // ==========================================
  // REJECT
  // ==========================================

  const handleConfirmReject = (reason: string) => {
    setIsRejectModalOpen(false);

    const updatedHistory = [
      {
        id: `rejected-${Date.now()}`,
        action: "Tiket Ditolak",
        timestamp: formatHistoryDate(new Date().toISOString()),
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

    console.log("Alasan penolakan:", reason);
  };

  // ==========================================
  // OPEN CLASSIFICATION
  // ==========================================

  const handleOpenClassification = () => {
    setIsClassifying(true);

    setKategoriMutuError("");
    setTagsITError("");

    setTimeout(() => {
      classificationRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }, 50);
  };

  // ==========================================
  // CANCEL CLASSIFICATION
  // ==========================================

  const handleCancelClassification = () => {
    setIsClassifying(false);

    setKategoriMutu("");
    setTagsIT("");

    setKategoriMutuError("");
    setTagsITError("");
  };

  // ==========================================
  // SAVE CLASSIFICATION
  // ==========================================

  const handleSaveClassification = () => {
    let hasError = false;

    if (!kategoriMutu) {
      setKategoriMutuError("Kategori mutu wajib dipilih.");

      hasError = true;
    } else {
      setKategoriMutuError("");
    }

    if (!tagsIT) {
      setTagsITError("Tags IT wajib dipilih.");

      hasError = true;
    } else {
      setTagsITError("");
    }

    if (hasError) {
      return;
    }

    const updatedHistory = [
      {
        id: `verified-${Date.now()}`,
        action: "Tiket Diklasifikasi",
        timestamp: formatHistoryDate(new Date().toISOString()),
        isCompleted: true,
      },
      ...(currentTicket.history || []),
    ];

    const updatedTicket: TicketItem = {
      ...currentTicket,
      status: "Diklasifikasi",
      history: updatedHistory,
    };

    setCurrentTicket(updatedTicket);

    setIsClassifying(false);

    setToastMessage("Tiket berhasil diklasifikasikan");

    setShowToast(true);

    console.log("Kategori Mutu:", kategoriMutu);
    console.log("Tags IT:", tagsIT);
  };

  // ==========================================
  // STATUS
  // ==========================================

  const isRejected = currentTicket.status === "Ditolak";

  const isVerified = currentTicket.status === "Terverifikasi";

  // ==========================================
  // UI
  // ==========================================

  return (
    <div
      className="
        min-h-full
        bg-background
        p-4
        pb-24
        lg:p-5
        lg:pb-28
      "
    >
      <div className="mx-auto max-w-350">
        {/* ====================================
            HEADER TIKET
        ==================================== */}

        <div
          className="
            mb-5
            rounded-lg
            border
            border-slate-200
            bg-white
            px-4
            py-3
            dark:border-slate-700
            dark:bg-table-card
          "
        >
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => navigate("/helpdesk/tik")}
              className="
                cursor-pointer
                rounded-md
                p-1.5
                text-text-secondary
                transition
                hover:bg-slate-100
                dark:hover:bg-slate-700
              "
              title="Kembali"
            >
              <ArrowLeft size={19} />
            </button>

            <h1 className="text-base font-semibold text-text-title">
              Ticket #{currentTicket.code}
            </h1>

            <TicketStatusBadge status={currentTicket.status} />
          </div>
        </div>

        {/* ====================================
            CONTENT
        ==================================== */}

        <div
          className="
            grid
            grid-cols-1
            gap-5
            lg:grid-cols-3
          "
        >
          {/* ==================================
              LEFT CONTENT
          ================================== */}

          <div className="space-y-5 lg:col-span-2">
            {/* ================================
                INFORMASI PELAPOR
            ================================= */}

            <div
              className="
                overflow-hidden
                rounded-lg
                border
                border-slate-200
                bg-white
                dark:border-slate-700
                dark:bg-table-card
              "
            >
              <div
                className="
                  flex
                  items-center
                  gap-2
                  border-b
                  border-slate-200
                  px-5
                  py-3.5
                  dark:border-slate-700
                "
              >
                <Info size={18} className="text-text-title" />

                <h2 className="text-sm font-semibold text-text-title">Informasi Pelapor</h2>
              </div>

              <div className="px-12 py-5">
                <div
                  className="
                    grid
                    grid-cols-1
                    gap-x-10
                    gap-y-5
                    sm:grid-cols-2
                  "
                >
                  <div>
                    <p className="text-sm text-slate-400">Nama Pelapor</p>

                    <p className="mt-1 text-sm font-medium text-text-title">
                      {currentTicket.reporter.name}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm text-slate-400">Unit Pelapor</p>

                    <p className="mt-1 text-sm font-medium text-text-title">
                      {currentTicket.reporter.unit}
                    </p>
                  </div>
                </div>

                <div
                  className="
                    mt-5
                    border-t
                    border-slate-100
                    pt-4
                    dark:border-slate-700
                  "
                >
                  <div className="flex items-center gap-3">
                    <p className="text-sm text-slate-400">Dibuat pada</p>

                    <div
                      className="
                        flex
                        items-center
                        gap-2
                        rounded-md
                        border
                        border-slate-200
                        bg-slate-50
                        px-3
                        py-1.5
                        dark:border-slate-700
                        dark:bg-slate-800
                      "
                    >
                      <Calendar size={14} className="text-slate-500" />

                      <span className="text-sm text-text-title">
                        {formatDateTime(currentTicket.createdAt)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* ================================
                DATA INVENTARIS
            ================================= */}

            <div
              className="
                overflow-hidden
                rounded-lg
                border
                border-slate-200
                bg-white
                dark:border-slate-700
                dark:bg-table-card
              "
            >
              <div
                className="
                  flex
                  items-center
                  gap-2
                  border-b
                  border-slate-200
                  px-5
                  py-3.5
                  dark:border-slate-700
                "
              >
                <Monitor size={17} className="text-text-title" />

                <h2 className="text-sm font-semibold text-text-title">Data Inventaris</h2>
              </div>

              <div className="px-12 py-5">
                <div
                  className="
                    grid
                    grid-cols-1
                    gap-x-10
                    gap-y-5
                    sm:grid-cols-2
                  "
                >
                  <div>
                    <p className="text-sm text-slate-400">No. Inventaris</p>

                    <p className="mt-1 text-sm font-medium text-text-title">-</p>
                  </div>

                  <div>
                    <p className="text-sm text-slate-400">Nama Inventaris</p>

                    <p className="mt-1 text-sm font-medium text-text-title">-</p>
                  </div>

                  <div>
                    <p className="text-sm text-slate-400">Merk Inventaris</p>

                    <p className="mt-1 text-sm font-medium text-text-title">-</p>
                  </div>

                  <div>
                    <p className="text-sm text-slate-400">Unit Inventaris</p>

                    <p className="mt-1 text-sm font-medium text-text-title">
                      {currentTicket.reporter.unit}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm text-slate-400">Lokasi Inventaris</p>

                    <p className="mt-1 text-sm font-medium text-text-title">-</p>
                  </div>
                </div>
              </div>
            </div>

            {/* ================================
                DESKRIPSI
            ================================= */}

            <div
              className="
                overflow-hidden
                rounded-lg
                border
                border-slate-200
                bg-white
                dark:border-slate-700
                dark:bg-table-card
              "
            >
              <div
                className="
                  flex
                  items-center
                  gap-2
                  border-b
                  border-slate-200
                  px-5
                  py-3.5
                  dark:border-slate-700
                "
              >
                <FileText size={17} className="text-text-title" />

                <h2 className="text-sm font-semibold text-text-title">Deskripsi</h2>
              </div>

              <div className="px-12 py-5">
                <p className="mb-2 text-sm text-slate-400">Deskripsi Masalah</p>

                <div
                  className="
                    rounded-lg
                    border
                    border-slate-200
                    bg-slate-50
                    px-3.5
                    py-3.5
                    dark:border-slate-700
                    dark:bg-slate-800
                  "
                >
                  <p className="whitespace-pre-line text-sm leading-5 text-text-secondary">
                    {currentTicket.description}
                  </p>
                </div>

                <div className="mt-4">
                  <p className="mb-2 text-sm text-slate-400">Foto Bukti Awal</p>

                  {currentTicket.attachments && currentTicket.attachments.length > 0 ? (
                    currentTicket.attachments.map((attachment) => (
                      <div
                        key={attachment.id}
                        className="
                            flex
                            items-center
                            justify-between
                            rounded-lg
                            border
                            border-slate-200
                            bg-white
                            px-3
                            py-2.5
                            dark:border-slate-700
                            dark:bg-slate-800
                          "
                      >
                        <div className="flex min-w-0 items-center gap-3">
                          <div
                            className="
                                flex
                                h-9
                                w-9
                                shrink-0
                                items-center
                                justify-center
                                rounded-md
                                bg-blue-50
                                text-primary-600
                                dark:bg-blue-950/40
                              "
                          >
                            <ImageIcon size={18} />
                          </div>

                          <div className="min-w-0">
                            <p className="truncate text-sm font-medium text-text-title">
                              {attachment.name}
                            </p>

                            <p className="mt-0.5 text-[11px] text-slate-400">{attachment.size}</p>
                          </div>
                        </div>

                        {attachment.url && (
                          <a
                            href={attachment.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="
                                ml-4
                                flex
                                shrink-0
                                items-center
                                gap-1.5
                                text-sm
                                font-medium
                                text-primary-600
                                transition
                                hover:text-primary-700
                              "
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="15"
                              height="15"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            >
                              <path d="M12 15V3" />
                              <path d="m7 10 5 5 5-5" />
                              <path d="M5 21h14" />
                            </svg>
                            Unduh
                          </a>
                        )}
                      </div>
                    ))
                  ) : (
                    <div
                      className="
                        rounded-lg
                        border
                        border-dashed
                        border-slate-200
                        bg-slate-50
                        px-4
                        py-4
                        text-center
                        dark:border-slate-700
                        dark:bg-slate-800
                      "
                    >
                      <ImageIcon size={22} className="mx-auto mb-2 text-slate-300" />

                      <p className="text-xs text-slate-400">Belum ada foto bukti awal.</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* ================================
                KLASIFIKASI TIKET TIK
            ================================= */}

            {isClassifying && (
              <div
                ref={classificationRef}
                className="
                  overflow-visible
                  rounded-lg
                  border
                  border-slate-200
                  bg-white
                  dark:border-slate-700
                  dark:bg-table-card
                "
              >
                <div
                  className="
                    flex
                    items-center
                    gap-2
                    border-b
                    border-slate-200
                    px-5
                    py-3.5
                    dark:border-slate-700
                  "
                >
                  <h2 className="text-sm font-semibold text-text-title">Klasifikasi Tiket TIK</h2>
                </div>

                <div className="px-6 py-5">
                  <div className="mb-4">
                    <label className="mb-1.5 block text-sm font-medium text-text-title">
                      Kategori Mutu
                      <span className="ml-0.5 text-red-500">*</span>
                    </label>

                    <Dropdown
                      value={kategoriMutu}
                      options={kategoriMutuOptions}
                      onChange={(value) => {
                        setKategoriMutu(value);

                        if (value) {
                          setKategoriMutuError("");
                        }
                      }}
                      placeholder="Pilih kategori mutu"
                      className="w-full"
                      error={kategoriMutuError}
                    />
                  </div>

                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-text-title">
                      Tags IT
                      <span className="ml-0.5 text-red-500">*</span>
                    </label>

                    <Dropdown
                      value={tagsIT}
                      options={tagsITOptions}
                      onChange={(value) => {
                        setTagsIT(value);

                        if (value) {
                          setTagsITError("");
                        }
                      }}
                      placeholder="Pilih tags IT"
                      className="w-full"
                      error={tagsITError}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* ==================================
              RIGHT CONTENT
          ================================== */}

          <div>
            <div
              className="
                overflow-hidden
                rounded-lg
                border
                border-slate-200
                bg-white
                dark:border-slate-700
                dark:bg-table-card
              "
            >
              <div
                className="
                  flex
                  items-center
                  gap-2
                  border-b
                  border-slate-200
                  px-5
                  py-3.5
                  dark:border-slate-700
                "
              >
                <Clock size={18} className="text-text-title" />

                <h2 className="text-sm font-semibold text-text-title">Riwayat Penanganan</h2>
              </div>

              <div className="px-4 py-4">
                {currentTicket.history && currentTicket.history.length > 0 ? (
                  currentTicket.history.map((item, index) => (
                    <TicketHistoryItem
                      key={item.id}
                      action={item.action}
                      timestamp={item.timestamp}
                      isLatest={index === 0}
                      isLast={index === currentTicket.history!.length - 1}
                    />
                  ))
                ) : (
                  <div className="py-6 text-center">
                    <Clock size={22} className="mx-auto mb-2 text-slate-300" />

                    <p className="text-xs text-text-secondary">Belum ada riwayat penanganan.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ======================================
          FIXED ACTION BAR
      ====================================== */}

      {!isRejected && !isVerified && (
        <div
          className="
            fixed
            bottom-0
            left-0
            right-0
            z-40
            border-t
            border-slate-200
            bg-white
            px-4
            py-3
            shadow-[0_-4px_12px_rgba(15,23,42,0.06)]
            dark:border-slate-700
            dark:bg-slate-900
            lg:left-64
          "
        >
          <div className="mx-auto max-w-350">
            {!isClassifying && (
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setIsRejectModalOpen(true)}
                  className="
                    flex
                    cursor-pointer
                    items-center
                    justify-center
                    gap-2
                    rounded-lg
                    border
                    border-slate-200
                    bg-white
                    px-4
                    py-2.5
                    text-sm
                    font-medium
                    text-slate-600
                    transition
                    hover:bg-slate-50
                    active:scale-[0.99]
                    dark:border-slate-700
                    dark:bg-slate-800
                    dark:text-slate-300
                    dark:hover:bg-slate-700
                  "
                >
                  <X size={15} />
                  Tolak Tiket
                </button>

                <button
                  type="button"
                  onClick={handleOpenClassification}
                  className="
                    flex
                    cursor-pointer
                    items-center
                    justify-center
                    gap-2
                    rounded-lg
                    bg-primary-600
                    px-4
                    py-2.5
                    text-sm
                    font-semibold
                    text-white
                    transition
                    hover:bg-primary-700
                    active:scale-[0.99]
                  "
                >
                  <Check size={15} />
                  Klasifikasikan
                </button>
              </div>
            )}

            {isClassifying && (
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={handleCancelClassification}
                  className="
                    flex
                    cursor-pointer
                    items-center
                    justify-center
                    gap-2
                    rounded-lg
                    border
                    border-slate-200
                    bg-white
                    px-4
                    py-2.5
                    text-sm
                    font-medium
                    text-slate-600
                    transition
                    hover:bg-slate-50
                    active:scale-[0.99]
                    dark:border-slate-700
                    dark:bg-slate-800
                    dark:text-slate-300
                    dark:hover:bg-slate-700
                  "
                >
                  Batal
                </button>

                <button
                  type="button"
                  onClick={handleSaveClassification}
                  className="
                    flex
                    cursor-pointer
                    items-center
                    justify-center
                    gap-2
                    rounded-lg
                    bg-primary-600
                    px-4
                    py-2.5
                    text-sm
                    font-semibold
                    text-white
                    transition
                    hover:bg-primary-700
                    active:scale-[0.99]
                  "
                >
                  <Check size={15} />
                  Simpan
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ======================================
          REJECT MODAL
      ====================================== */}

      <RejectTicketModal
        isOpen={isRejectModalOpen}
        ticketCode={currentTicket.code}
        onClose={() => setIsRejectModalOpen(false)}
        onConfirmReject={handleConfirmReject}
      />

      {/* ======================================
          TOAST
      ====================================== */}

      <Toast show={showToast} message={toastMessage} onClose={() => setShowToast(false)} />
    </div>
  );
}
