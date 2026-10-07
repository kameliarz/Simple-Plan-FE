import { useEffect, useRef, useState } from "react";
import { ArrowLeft } from "lucide-react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import type { ApiTicket } from "../types/ticket";
import type { TicketItem, TicketPriority } from "../types/helpdesk";
import type { DropdownOption } from "../../../components/ui/ui-template/Dropdown";

import {
  verifyTicketResolution,
  getTicket,
  classifyTicket,
  assignTicket,
  rejectTicket,
  createTicketHandling,
  escalateTicket,
  deEscalateTicket,
  getTicketClassificationOptions,
} from "../services/ticketApi";

import RejectTicketModal from "../components/RejectTicketModal";
import AssignOfficerModal from "../components/AssignOfficerModal";
import type { Officer } from "../components/AssignOfficerModal";
import { TicketStatusBadge } from "../components/TicketStatusBadge";
import { TicketPriorityBadge } from "../components/TicketPriorityBadge";
import HandleTicketModal, { type HandleTicketFormData } from "../components/HandleTicketModal";
import RejectResolutionModal from "../components/RejectResolutionModal";
import EscalationModal, { type EscalationFormData } from "../components/EscalationModal";
import Alert from "../../../components/ui/ui-template/Alert";
import Button from "../../../components/ui/ui-template/Button";

import ReporterInfoCard from "../components/detail/ReporterInfoCard";
import InventoryCard from "../components/detail/InventoryCard";
import DescriptionCard from "../components/detail/DescriptionCard";
import ClassificationCard from "../components/detail/ClassificationCard";
import PriorityCard from "../components/detail/PriorityCard";
import OfficerCard from "../components/detail/OfficerCard";
import HistoryCard from "../components/detail/HistoryCard";

// ==========================================
// TYPE PRIORITAS
// ==========================================

type Priority = "critical" | "high" | "medium" | "low";

// ==========================================
// STATUS
// ==========================================

const mapStatus = (status: ApiTicket["status"]): TicketItem["status"] => {
  const statusMap: Record<ApiTicket["status"], TicketItem["status"]> = {
    baru: "Baru",
    diklasifikasi: "Diklasifikasi",
    ditolak: "Ditolak",
    diproses: "Diproses",
    eskalasi: "Eskalasi",
    terselesaikan: "Terselesaikan",
    ditutup: "Ditutup",
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
  const getHistoryAction = (fromStatus: string, toStatus: string): string => {
    const transitions: Record<string, string> = {
      "baru-diklasifikasi": "Tiket Diklasifikasi",
      "diklasifikasi-diproses": "Petugas Ditugaskan",
      "diproses-terselesaikan": "Tiket Selesai",
      "terselesaikan-ditutup": "Tiket Ditutup",
      "terselesaikan-diproses": "Pengerjaan Ulang oleh Teknisi",
      "diproses-eskalasi": "Tiket Dieskalasi",
      "baru-ditolak": "Tiket Ditolak",
    };

    return (
      transitions[`${fromStatus}-${toStatus}`] ?? `Status berubah: ${fromStatus} → ${toStatus}`
    );
  };

  const history = [
    {
      id: `created-${ticket.id}`,
      action: "Tiket Dibuat",
      rawTimestamp: ticket.created_at,
      isCompleted: true,
    },

    ...(ticket.status_histories ?? []).map((item) => {
      const isTicketCompleted =
        item.from_status === "diproses" && item.to_status === "terselesaikan";

      return {
        id: `status-${item.id}`,
        action: getHistoryAction(item.from_status, item.to_status),
        rawTimestamp: item.created_at,
        isCompleted: true,
        ...(!isTicketCompleted && item.notes ? { handlingNote: item.notes } : {}),
      };
    }),

    ...(ticket.handlings ?? []).map((item) => ({
      id: `handling-${item.id}`,
      action: "Pengerjaan Teknisi",
      rawTimestamp: item.created_at,
      isCompleted: true,
      handlingNote: item.notes ?? undefined,

      ...(item.result_photo
        ? {
            handlingPhoto: {
              name: item.result_photo.original_name,
              size: formatFileSize(item.result_photo.size),
              url: item.result_photo.object_key.startsWith("http")
                ? item.result_photo.object_key
                : `http://localhost:8000/storage/${item.result_photo.object_key}`,
            },
          }
        : {}),
    })),
  ]
    .sort((a, b) => new Date(b.rawTimestamp).getTime() - new Date(a.rawTimestamp).getTime())
    .map(({ rawTimestamp, ...item }) => ({
      ...item,
      timestamp: formatHistoryDate(rawTimestamp),
    }));

  return {
    id: String(ticket.id),
    code: ticket.ticket_number,
    title: ticket.category ?? "-",
    description: ticket.description,
    category: ticket.service === "tik" ? "TIK" : "Sarpras",
    status: mapStatus(ticket.status),
    priority: ticket.priority
      ? ({
          critical: "Critical",
          high: "High",
          medium: "Medium",
          low: "Low",
        }[ticket.priority] as TicketPriority)
      : null,
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
    sla_started_at: ticket.sla_started_at ?? null,
    finishedAt: ticket.completed_at ?? undefined,
    attachments: ticket.initial_evidence?.url
      ? [
          {
            id: ticket.initial_evidence.url,
            name: ticket.initial_evidence.original_name,
            size: formatFileSize(ticket.initial_evidence.size),
            url: ticket.initial_evidence.url,
          },
        ]
      : [],
    history,
  };
};

// ==========================================
// OPTIONS PRIORITAS
// ==========================================

const priorityOptions: {
  value: Priority;
  label: string;
  sla: string;
}[] = [
  {
    value: "critical",
    label: "Critical",
    sla: "< 2 Jam",
  },
  {
    value: "high",
    label: "High",
    sla: "< 4 Jam",
  },
  {
    value: "medium",
    label: "Medium",
    sla: "< 1 Hari",
  },
  {
    value: "low",
    label: "Low",
    sla: "< 3 Hari",
  },
];

// ==========================================
// CONFIG PRIORITAS
// ==========================================

const priorityConfig: Record<
  Priority,
  {
    description: string;
    limit: string;
    dot: string;
  }
> = {
  critical: {
    description: "Batas waktu penanganan maksimal 2 jam",
    limit: "Batas 2 jam",
    dot: "bg-red-500",
  },

  high: {
    description: "Batas waktu penanganan maksimal 4 jam",
    limit: "Batas 4 jam",
    dot: "bg-orange-500",
  },

  medium: {
    description: "Batas waktu penanganan maksimal 1 hari",
    limit: "Batas 1 hari",
    dot: "bg-yellow-500",
  },

  low: {
    description: "Batas waktu penanganan maksimal 3 hari",
    limit: "Batas 3 hari",
    dot: "bg-green-500",
  },
};

// ==========================================
// COMPONENT
// ==========================================

export default function HelpdeskDetailPage() {
  const navigate = useNavigate();
  const location = useLocation();

  const service = location.pathname.includes("/helpdesk/sarpras") ? "sarpras" : "tik";

  const { ticketId } = useParams<{
    ticketId: string;
  }>();

  // ==========================================
  // TICKET
  // ==========================================

  const [currentTicket, setCurrentTicket] = useState<TicketItem | null>(null);

  const [isLoading, setIsLoading] = useState(true);

  const [error, setError] = useState<string | null>(null);

  // ==========================================
  // REJECT
  // ==========================================

  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);

  const [isRejectResolutionModalOpen, setIsRejectResolutionModalOpen] = useState(false);

  const [isRejecting, setIsRejecting] = useState(false);

  // ==========================================
  // Escalation
  // ==========================================

  const [isEscalationModalOpen, setIsEscalationModalOpen] = useState(false);

  // ==========================================
  // ALERT
  // ==========================================

  type AlertVariant = "success" | "error";

  const [showAlert, setShowAlert] = useState(false);

  const [alertMessage, setAlertMessage] = useState("");

  const [alertVariant, setAlertVariant] = useState<AlertVariant>("success");

  const showAlertMessage = (message: string, variant: AlertVariant = "success") => {
    setAlertMessage(message);
    setAlertVariant(variant);
    setShowAlert(true);
  };

  // ==========================================
  // CLASSIFICATION
  // ==========================================

  const [isClassifying, setIsClassifying] = useState(false);

  const [isClassificationSaved, setIsClassificationSaved] = useState(false);

  const [kategoriMutu, setKategoriMutu] = useState("");

  const [tagsIT, setTagsIT] = useState("");

  const [customITTag, setCustomITTag] = useState("");

  const [customITTagError, setCustomITTagError] = useState("");

  const [kategoriSarpras, setKategoriSarpras] = useState("");

  const [kategoriSarprasError, setKategoriSarprasError] = useState("");

  const [kategoriMutuError, setKategoriMutuError] = useState("");

  const [tagsITError, setTagsITError] = useState("");

  const classificationRef = useRef<HTMLDivElement | null>(null);

  const [kategoriSarprasOptions, setKategoriSarprasOptions] = useState<DropdownOption[]>([]);

  const [kategoriMutuOptions, setKategoriMutuOptions] = useState<DropdownOption[]>([]);

  const [tagsITOptions, setTagsITOptions] = useState<DropdownOption[]>([]);

  // ==========================================
  // ASSIGNMENT
  // ==========================================

  const [isAssignmentMode, setIsAssignmentMode] = useState(false);

  const [isAssignmentSaved, setIsAssignmentSaved] = useState(false);

  // Prioritas sementara
  const [priority, setPriority] = useState<Priority | null>(null);

  // Prioritas final
  const [savedPriority, setSavedPriority] = useState<Priority | null>(null);

  // Petugas sementara
  const [assignedOfficer, setAssignedOfficer] = useState<Officer | null>(null);

  // Petugas final
  const [savedOfficer, setSavedOfficer] = useState<Officer | null>(null);

  // ==========================================
  // ASSIGN OFFICER MODAL
  // ==========================================

  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);

  // ==========================================
  // HANDLE TICKET MODAL
  // ==========================================
  const [isHandleModalOpen, setIsHandleModalOpen] = useState(false);

  const [isContinuingHandling, setIsContinuingHandling] = useState(false);

  const [isSavingHandling, setIsSavingHandling] = useState(false);

  const [isVerifying, setIsVerifying] = useState(false);

  // ==========================================
  // ESCALATION
  // ==========================================
  const [isEscalating, setIsEscalating] = useState(false);

  // ==========================================
  // DE-ESCALATION
  // ==========================================
  const [isDeEscalating, setIsDeEscalating] = useState(false);

  // ==========================================
  // JENIS TIKET
  // ==========================================

  const isSarpras = currentTicket?.category === "Sarpras";

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

        setKategoriMutu(
          data.tik_detail?.quality_category?.id ? String(data.tik_detail.quality_category.id) : "",
        );

        setTagsIT(data.tik_detail?.it_tag?.id ? String(data.tik_detail.it_tag.id) : "");

        setCustomITTag(data.tik_detail?.custom_it_tag_text ?? "");

        if (!isMounted) {
          return;
        }

        const mappedTicket = mapApiTicketToTicketItem(data);

        setCurrentTicket(mappedTicket);

        const status = String(data.status ?? "").toLowerCase();

        const classifiedStatuses = [
          "diklasifikasi",
          "diproses",
          "eskalasi",
          "terselesaikan",
          "ditutup",
        ];

        const assignedStatuses = ["diproses", "eskalasi", "terselesaikan", "ditutup"];

        const isClassified = classifiedStatuses.includes(status);
        const isAssigned = assignedStatuses.includes(status);

        setIsClassificationSaved(isClassified);
        setIsAssignmentSaved(isAssigned);
        setIsAssignmentMode(isClassified && !isAssigned);

        // Pulihkan prioritas dari data API
        const apiPriority = data.priority ?? null;

        setPriority(apiPriority);
        setSavedPriority(apiPriority);

        // Sync petugas dari API
        if (data.assigned_officer) {
          const officer: Officer = {
            id: data.assigned_officer.id,
            name: data.assigned_officer.name,
            role: "Petugas",
            initials: data.assigned_officer.name
              .split(" ")
              .map((name) => name[0])
              .join("")
              .slice(0, 2)
              .toUpperCase(),
          };

          setAssignedOfficer(officer);
          setSavedOfficer(officer);
        } else {
          setAssignedOfficer(null);
          setSavedOfficer(null);
        }
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
  // GET CLASSIFICATION OPTIONS
  // ==========================================

  useEffect(() => {
    const fetchClassificationOptions = async () => {
      try {
        const response = await getTicketClassificationOptions(isSarpras ? "sarpras" : "tik");

        setKategoriSarprasOptions(
          (response.sarpras_categories ?? []).map((item) => ({
            label: item.name,
            value: String(item.id),
          })),
        );

        setKategoriMutuOptions(
          (response.quality_categories ?? []).map((item) => ({
            label: item.name,
            value: String(item.id),
          })),
        );

        const itTags = (response.it_tags ?? []).map((item) => ({
          label: item.name,
          value: String(item.id),
        }));

        const lainLain = itTags.filter((item) => item.label.toLowerCase() === "lain-lain");

        const otherTags = itTags.filter((item) => item.label.toLowerCase() !== "lain-lain");

        setTagsITOptions([...otherTags, ...lainLain]);
      } catch (error) {
        console.error("Gagal mengambil opsi klasifikasi:", error);

        setKategoriSarprasOptions([]);
        setKategoriMutuOptions([]);
        setTagsITOptions([]);

        showAlertMessage(
          error instanceof Error ? error.message : "Gagal mengambil opsi klasifikasi tiket.",
          "error",
        );
      }
    };

    fetchClassificationOptions();
  }, [isSarpras, showAlertMessage]);

  // ==========================================
  // NO TICKET ID
  // ==========================================

  if (!ticketId) {
    return (
      <div className="flex min-h-full items-center justify-center bg-background p-6">
        <div className="text-center">
          <h1 className="text-sm font-semibold text-text-title">ID Tiket Tidak Ditemukan</h1>

          <p className="mt-1 text-xs text-text-secondary">ID tiket tidak tersedia pada URL.</p>

          <Button
            type="button"
            variant="ghost"
            onClick={() => navigate(`/helpdesk/${service}`)}
            label="Kembali ke Helpdesk"
          />
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
          <div
            className="
              mx-auto
              mb-3
              h-6
              w-6
              animate-spin
              rounded-full
              border-2
              border-primary-600
              border-t-transparent
            "
          />

          <h1 className="text-sm font-semibold text-text-title">Memuat detail tiket...</h1>
        </div>
      </div>
    );
  }

  // ==========================================
  // ERROR
  // ==========================================

  if (!currentTicket) {
    return (
      <div className="flex min-h-full items-center justify-center bg-background p-6">
        <div className="text-center">
          <h1 className="text-sm font-semibold text-text-title">Tiket Tidak Ditemukan</h1>

          <p className="mt-1 text-xs text-text-secondary">
            {error ?? "Data tiket yang kamu cari tidak tersedia."}
          </p>

          <Button
            type="button"
            variant="ghost"
            onClick={() => navigate(`/helpdesk/${service}`)}
            label="Kembali ke Helpdesk"
          />
        </div>
      </div>
    );
  }

  // ==========================================
  // REJECT
  // ==========================================

  const handleConfirmReject = async (reason: string) => {
    const trimmedReason = reason.trim();

    if (!ticketId) {
      showAlertMessage("ID tiket tidak ditemukan.", "error");
      return;
    }

    if (!trimmedReason) {
      showAlertMessage("Masukkan alasan penolakan terlebih dahulu.", "error");
      return;
    }

    if (isRejecting) return;

    setIsRejecting(true);

    try {
      // Kirim permintaan penolakan ke backend
      await rejectTicket(ticketId, {
        reason: trimmedReason,
      });

      // Hanya perbarui tampilan jika API berhasil
      const updatedHistory = [
        {
          id: `rejected-${Date.now()}`,
          action: "Tiket Ditolak",
          timestamp: formatHistoryDate(new Date().toISOString()),
          isCompleted: true,
        },
        ...(currentTicket.history || []),
      ];

      setCurrentTicket({
        ...currentTicket,
        status: "Ditolak",
        history: updatedHistory,
      });

      setIsRejectModalOpen(false);
      showAlertMessage("Tiket berhasil ditolak.", "success");
    } catch (error) {
      console.error("Gagal menolak tiket:", error);

      showAlertMessage(
        error instanceof Error ? error.message : "Terjadi kesalahan saat menolak tiket.",
        "error",
      );
    } finally {
      setIsRejecting(false);
    }
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

  const qualityCategoryId = Number(kategoriMutu);

  const itTagId = Number(tagsIT);

  const handleSaveClassification = async () => {
    let hasError = false;

    if (isSarpras) {
      if (!kategoriSarpras) {
        setKategoriSarprasError("Kategori Sarpras wajib dipilih.");
        hasError = true;
      } else {
        setKategoriSarprasError("");
      }
    } else {
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

      if (tagsIT === "1" && !customITTag.trim()) {
        setCustomITTagError("Tags IT lainnya wajib diisi.");
        hasError = true;
      }
    }

    if (hasError) return;

    try {
      if (isSarpras) {
        await classifyTicket(ticketId, {
          quality_category_id: Number(kategoriSarpras),
        });
      } else {
        await classifyTicket(ticketId, {
          quality_category_id: qualityCategoryId,
          it_tag_id: itTagId,
          custom_it_tag_text: tagsIT === "1" ? customITTag.trim() : "",
        });
      }

      const updatedHistory = [
        {
          id: `classified-${Date.now()}`,
          action: "Tiket Diklasifikasi",
          timestamp: formatHistoryDate(new Date().toISOString()),
          isCompleted: true,
        },
        ...(currentTicket.history || []),
      ];

      setCurrentTicket({
        ...currentTicket,
        status: "Diklasifikasi",
        history: updatedHistory,
      });

      setIsClassifying(false);
      setIsClassificationSaved(true);
      setIsAssignmentMode(true);
      setIsAssignmentSaved(false);

      showAlertMessage("Tiket berhasil diklasifikasikan", "success");
    } catch (error) {
      console.error("Error klasifikasi tiket:", error);

      showAlertMessage(
        error instanceof Error ? error.message : "Gagal mengklasifikasikan tiket",
        "error",
      );
    }
  };

  const handleConfirmEscalation = async (data: EscalationFormData) => {
    if (!ticketId) {
      showAlertMessage("ID tiket tidak ditemukan.", "error");
      return;
    }

    if (isEscalating) return;

    setIsEscalating(true);

    try {
      // Kirim data ke API (bisa sesuaikan key-nya dengan kebutuhan backend, misal: target)
      await escalateTicket(ticketId, {
        target: data.destination,
        notes: data.notes,
      });

      const updatedHistory = [
        {
          id: `escalated-${Date.now()}`,
          action: "Tiket Dieskalasi",
          timestamp: formatHistoryDate(new Date().toISOString()),
          isCompleted: true,
        },
        ...(currentTicket.history || []),
      ];

      setCurrentTicket({
        ...currentTicket,
        status: "Eskalasi",
        history: updatedHistory,
      });

      setIsEscalationModalOpen(false);
      showAlertMessage("Eskalasi tiket berhasil dikirim.", "success");
    } catch (error) {
      console.error("Gagal mengeskalasi tiket:", error);

      showAlertMessage(
        error instanceof Error ? error.message : "Terjadi kesalahan saat mengeskalasi tiket.",
        "error",
      );
    } finally {
      setIsEscalating(false);
    }
  };

  // ==========================================
  // OPEN ASSIGN OFFICER MODAL
  // ==========================================

  const handleOpenAssignModal = () => {
    setIsAssignModalOpen(true);
  };

  // ==========================================
  // SELECT OFFICER
  // ==========================================

  const handleAssignOfficer = (officer: Officer) => {
    // Ini masih pilihan sementara.
    // Belum dianggap final sampai tombol Simpan
    // pada tahap assignment ditekan.
    setAssignedOfficer(officer);

    setIsAssignModalOpen(false);
  };

  // ==========================================
  // SAVE ASSIGNMENT
  // ==========================================

  const handleSaveAssignment = async () => {
    if (!priority) {
      showAlertMessage("Tingkat prioritas wajib dipilih.", "error");
      return;
    }

    if (!assignedOfficer) {
      showAlertMessage("Petugas wajib dipilih.", "error");
      return;
    }

    try {
      await assignTicket(ticketId, {
        assigned_officer_id: assignedOfficer.id,
        priority: priority,
      });

      const updatedTicket = await getTicket(ticketId);
      const mappedUpdatedTicket = mapApiTicketToTicketItem(updatedTicket);

      setSavedPriority(priority);
      setSavedOfficer(assignedOfficer);
      setIsAssignmentMode(false);
      setIsAssignmentSaved(true);

      const updatedHistory = [
        {
          id: `assigned-${Date.now()}`,
          action: "Petugas Ditugaskan",
          timestamp: formatHistoryDate(new Date().toISOString()),
          isCompleted: true,
        },
        ...(currentTicket.history || []),
      ];

      setCurrentTicket({
        ...mappedUpdatedTicket,
        history: updatedHistory,
      });

      showAlertMessage("Prioritas dan petugas berhasil disimpan.", "success");
    } catch (error) {
      console.error("Gagal menyimpan assignment:", error);

      showAlertMessage(
        error instanceof Error ? error.message : "Gagal menyimpan petugas.",
        "error",
      );
    }
  };

  // ==========================================
  // CANCEL ASSIGNMENT
  // ==========================================

  const handleCancelAssignment = () => {
    /*
     * Kalau belum pernah ada data final:
     * kembali ke kondisi setelah klasifikasi.
     */
    if (!isAssignmentSaved) {
      setPriority(null);
      setAssignedOfficer(null);

      setIsAssignmentMode(false);

      return;
    }

    /*
     * Kalau suatu saat mode edit final dipakai,
     * kembalikan ke data yang sudah disimpan.
     */
    setPriority(savedPriority);
    setAssignedOfficer(savedOfficer);

    setIsAssignmentMode(false);
  };

  // ==========================================
  // STATUS
  // ==========================================

  const isRejected = currentTicket.status === "Ditolak";

  // ==========================================
  // HANDLE TICKET
  // ==========================================

  const handleSaveHandling = async (data: HandleTicketFormData) => {
    if (!ticketId) {
      showAlertMessage("ID tiket tidak ditemukan.", "error");
      return;
    }

    const notes = data.notes.trim();
    const startedAt = data.startedAt;
    const completedAt = data.completedAt;

    // Status dari modal: "diproses" | "selesai"
    // Status API: "diproses" | "terselesaikan"
    const apiStatus = isContinuingHandling
      ? "diproses"
      : data.status === "terselesaikan"
        ? "terselesaikan"
        : "diproses";

    if (!notes) {
      showAlertMessage("Catatan penanganan wajib diisi.", "error");
      return;
    }

    if (!startedAt) {
      showAlertMessage("Waktu mulai penanganan wajib diisi.", "error");
      return;
    }

    if (!completedAt) {
      showAlertMessage("Waktu selesai penanganan wajib diisi.", "error");
      return;
    }

    if (new Date(completedAt) < new Date(startedAt)) {
      showAlertMessage("Waktu selesai tidak boleh lebih awal dari waktu mulai.", "error");
      return;
    }

    try {
      setIsSavingHandling(true);

      await createTicketHandling(ticketId, {
        notes,
        status: apiStatus,
        started_at: startedAt,
        completed_at: completedAt,
        result_photo: data.photo ?? null,
      });

      const updatedStatus = apiStatus === "terselesaikan" ? "Terselesaikan" : "Diproses";

      const photoUrl = data.photo ? URL.createObjectURL(data.photo) : undefined;

      setCurrentTicket((prev) => {
        if (!prev) return prev;

        const newHistoryItem = {
          id: `handling-${Date.now()}`,
          action: "Penanganan tiket",
          timestamp: new Date().toISOString(),
          status: updatedStatus,
          handlingNote: notes,
          handlingPhoto: data.photo
            ? {
                name: data.photo.name,
                size: formatFileSize(data.photo.size),
                url: photoUrl!,
              }
            : undefined,
        };

        return {
          ...prev,
          status: updatedStatus,
          history: [...(prev.history ?? []), newHistoryItem],
        };
      });

      setIsHandleModalOpen(false);
      showAlertMessage("Penanganan tiket berhasil disimpan.", "success");
    } catch (error) {
      console.error("Gagal menyimpan penanganan tiket:", error);
      showAlertMessage("Gagal menyimpan penanganan tiket. Silakan coba lagi.", "error");
    } finally {
      setIsSavingHandling(false);
    }
  };

  // Handler fungsi De-Escalate
  const handleDeEscalate = async () => {
    if (!ticketId) {
      showAlertMessage("ID tiket tidak ditemukan.", "error");
      return;
    }

    if (isDeEscalating) return;

    setIsDeEscalating(true);

    try {
      // Kirim permintaan de-escalate ke API
      await deEscalateTicket(ticketId);

      // Tambahkan item riwayat baru & kembalikan status ke "Diproses"
      const updatedHistory = [
        {
          id: `de-escalated-${Date.now()}`,
          action: "Penanganan Dilanjutkan oleh Teknisi",
          timestamp: formatHistoryDate(new Date().toISOString()),
          isCompleted: true,
        },
        ...(currentTicket.history || []),
      ];

      setCurrentTicket({
        ...currentTicket,
        status: "Diproses",
        history: updatedHistory,
      });

      showAlertMessage("Penanganan tiket berhasil dilanjutkan.", "success");
    } catch (error) {
      console.error("Gagal melanjutkan penanganan tiket:", error);

      showAlertMessage(
        error instanceof Error ? error.message : "Gagal melanjutkan penanganan tiket.",
        "error",
      );
    } finally {
      setIsDeEscalating(false);
    }
  };

  const handleApproveResolution = async () => {
    if (!ticketId) {
      showAlertMessage("ID tiket tidak ditemukan.", "error");
      return;
    }

    if (isVerifying) return;

    setIsVerifying(true);

    try {
      // Kirim is_approved: true ke API
      await verifyTicketResolution(ticketId, {
        is_approved: true,
      });

      // Perbarui tampilan lokal ke status Ditutup
      setCurrentTicket((prev) => {
        if (!prev) return prev;

        const updatedHistory = [
          {
            id: `closed-${Date.now()}`,
            action: "Tiket Ditutup",
            timestamp: formatHistoryDate(new Date().toISOString()),
            isCompleted: true,
          },
          ...(prev.history ?? []),
        ];

        return {
          ...prev,
          status: "Ditutup",
          history: updatedHistory,
        };
      });

      showAlertMessage("Penyelesaian tiket disetujui. Tiket telah ditutup.", "success");
    } catch (error) {
      console.error("Gagal menyetujui penyelesaian:", error);

      showAlertMessage(
        error instanceof Error ? error.message : "Gagal menyetujui penyelesaian tiket.",
        "error",
      );
    } finally {
      setIsVerifying(false);
    }
  };

  const handleRejectResolution = async (reason: string) => {
    const trimmedReason = reason.trim();

    if (!ticketId) {
      showAlertMessage("ID tiket tidak ditemukan.", "error");
      return;
    }

    if (!trimmedReason) {
      showAlertMessage("Keterangan kendala wajib diisi.", "error");
      return;
    }

    if (isVerifying) return;

    setIsVerifying(true);

    try {
      // Kirim is_approved: false dan keterangan_kendala ke API
      await verifyTicketResolution(ticketId, {
        is_approved: false,
        keterangan_kendala: trimmedReason,
      });

      // Perbarui tampilan lokal kembali ke status Diproses
      const updatedHistory = [
        {
          id: `rework-${Date.now()}`,
          action: "Pengerjaan Ulang oleh Teknisi",
          timestamp: formatHistoryDate(new Date().toISOString()),
          isCompleted: true,
          retryNote: trimmedReason,
        },
        ...(currentTicket.history || []),
      ];

      setCurrentTicket({
        ...currentTicket,
        status: "Diproses",
        history: updatedHistory,
      });

      setIsRejectResolutionModalOpen(false);
      showAlertMessage("Penyelesaian ditolak. Tiket kembali ke status diproses.", "success");
    } catch (error) {
      console.error("Gagal menolak penyelesaian:", error);

      showAlertMessage(
        error instanceof Error ? error.message : "Gagal menolak penyelesaian tiket.",
        "error",
      );
    } finally {
      setIsVerifying(false);
    }
  };

  // ==========================================
  // UI
  // ==========================================

  return (
    <div
      className="
      min-h-full
      bg-background
      p-4
      pb-10
      lg:p-5
    "
    >
      <div className="mx-auto max-w-350">
        {showAlert && (
          <div className="mb-4">
            <Alert
              variant={alertVariant}
              message={alertMessage}
              onClose={() => setShowAlert(false)}
            />
          </div>
        )}

        {/* ====================================
          HEADER MOBILE
          Khusus layar kecil
      ==================================== */}
        <div className="mb-4 lg:hidden">
          <div className="flex items-start gap-3">
            <button
              type="button"
              onClick={() => navigate(`/helpdesk/${service}`)}
              className="
              mt-0.5
              flex
              h-9
              w-9
              shrink-0
              items-center
              justify-center
              rounded-xl
              bg-primary-600
              text-white
              shadow-sm
              transition
              hover:bg-slate-100
              dark:hover:bg-slate-700
            "
              title="Kembali"
              aria-label="Kembali ke daftar tiket"
            >
              <ArrowLeft size={19} />
            </button>

            <div className="min-w-0 pt-0.5">
              <h1 className="text-base font-semibold leading-5 text-text-title">Detail Tiket</h1>

              <p className="mt-0.5 truncate text-sm text-text-secondary">#{currentTicket.code}</p>

              <div className="mt-2 flex gap-2">
                <TicketStatusBadge status={currentTicket.status} />
                <TicketPriorityBadge priority={currentTicket.priority} />
              </div>
            </div>
          </div>

          {/* Tombol header pada mobile */}
          {currentTicket.status === "Diproses" && (
            <div className="mt-4 flex gap-2">
              <Button
                label="Eskalasi"
                variant="secondary"
                size="sm"
                className="flex-1"
                onClick={() => setIsEscalationModalOpen(true)}
              />

              <Button
                label="Tangani"
                variant="primary"
                size="sm"
                className="flex-1"
                onClick={() => {
                  setIsContinuingHandling(false);
                  setIsHandleModalOpen(true);
                }}
              />
            </div>
          )}

          {currentTicket.status === "Eskalasi" && (
            <div className="mt-4">
              <Button
                type="button"
                label="Lanjutkan Penanganan"
                variant="primary"
                size="sm"
                onClick={handleDeEscalate}
              />
            </div>
          )}
        </div>

        {/* ====================================
          HEADER DESKTOP
          Dipertahankan seperti UI awal
      ==================================== */}
        <div
          className="
          mb-5
          hidden
          rounded-lg
          border
          border-slate-200
          bg-white
          px-4
          py-3
          dark:border-slate-700
          dark:bg-table-card
          lg:block
        "
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => navigate(`/helpdesk/${service}`)}
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

              <TicketPriorityBadge priority={currentTicket.priority} />
            </div>

            {currentTicket.status === "Diproses" && (
              <div className="flex items-center gap-2">
                <Button
                  label="Eskalasi"
                  variant="primary"
                  size="sm"
                  className="py-1"
                  onClick={() => {
                    setIsEscalationModalOpen(true);
                  }}
                />

                <Button
                  label="Tangani"
                  variant="primary"
                  size="sm"
                  className="py-1"
                  onClick={() => {
                    setIsContinuingHandling(false);
                    setIsHandleModalOpen(true);
                  }}
                />
              </div>
            )}

            {currentTicket.status === "Eskalasi" && (
              <Button
                type="button"
                label="Lanjutkan Penanganan"
                variant="primary"
                size="sm"
                onClick={handleDeEscalate}
              />
            )}
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
          <div className="min-w-0 space-y-5 lg:col-span-2">
            <ReporterInfoCard
              name={currentTicket.reporter.name}
              unit={currentTicket.reporter.unit}
              createdAt={formatDateTime(currentTicket.createdAt)}
            />

            <InventoryCard unit={currentTicket.reporter.unit} />

            <DescriptionCard
              description={currentTicket.description}
              attachments={currentTicket.attachments}
            />

            <ClassificationCard
              isClassifying={isClassifying}
              isClassificationSaved={isClassificationSaved}
              isSarpras={isSarpras}
              classificationRef={classificationRef}
              kategoriSarpras={kategoriSarpras}
              setKategoriSarpras={setKategoriSarpras}
              kategoriSarprasOptions={kategoriSarprasOptions}
              kategoriSarprasError={kategoriSarprasError}
              setKategoriSarprasError={setKategoriSarprasError}
              kategoriMutu={kategoriMutu}
              setKategoriMutu={setKategoriMutu}
              kategoriMutuOptions={kategoriMutuOptions}
              kategoriMutuError={kategoriMutuError}
              setKategoriMutuError={setKategoriMutuError}
              customITTag={customITTag}
              setCustomITTag={setCustomITTag}
              customITTagError={customITTagError}
              setCustomITTagError={setCustomITTagError}
              tagsIT={tagsIT}
              setTagsIT={setTagsIT}
              tagsITOptions={tagsITOptions}
              tagsITError={tagsITError}
              setTagsITError={setTagsITError}
            />

            <PriorityCard
              isAssignmentMode={isAssignmentMode}
              isAssignmentSaved={isAssignmentSaved}
              priority={priority}
              setPriority={setPriority}
              priorityOptions={priorityOptions}
              savedPriority={savedPriority}
              priorityConfig={priorityConfig}
            />

            <OfficerCard
              isAssignmentMode={isAssignmentMode}
              isAssignmentSaved={isAssignmentSaved}
              assignedOfficer={assignedOfficer}
              savedOfficer={savedOfficer}
              onOpenAssignModal={handleOpenAssignModal}
            />

            {/* ==================================
              AKSI DESKTOP
              Tetap di bawah kolom kiri
          ================================== */}
            {!isRejected && !isAssignmentSaved && (
              <div className="mt-6 hidden w-full justify-end lg:flex">
                {!isClassifying && !isClassificationSaved && !isAssignmentMode && (
                  <div className="flex w-full gap-3 sm:w-auto">
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={() => setIsRejectModalOpen(true)}
                      label="Tolak Tiket"
                      className="flex-1 sm:min-w-32"
                    />

                    <Button
                      type="button"
                      variant="primary"
                      onClick={handleOpenClassification}
                      label="Klasifikasikan"
                      className="flex-1 sm:min-w-28"
                    />
                  </div>
                )}

                {isClassifying && (
                  <div className="flex w-full gap-3 sm:w-auto">
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={handleCancelClassification}
                      label="Batal"
                      className="flex-1 sm:min-w-28"
                    />

                    <Button
                      type="button"
                      variant="primary"
                      onClick={handleSaveClassification}
                      label="Simpan"
                      className="flex-1 sm:min-w-28"
                    />
                  </div>
                )}

                {isAssignmentMode && (
                  <div className="flex w-full gap-3 sm:w-auto">
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={handleCancelAssignment}
                      label="Batal"
                      className="flex-1 sm:min-w-28"
                    />

                    <Button
                      type="button"
                      variant="primary"
                      onClick={handleSaveAssignment}
                      label="Simpan"
                      className="flex-1 sm:min-w-28"
                    />
                  </div>
                )}
              </div>
            )}

            {/* Aksi verifikasi desktop, posisi lama */}
            {currentTicket.status === "Terselesaikan" && (
              <div className="mt-5 hidden justify-end lg:flex">
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    label="Tolak Penyelesaian"
                    variant="secondary"
                    size="sm"
                    onClick={() => {
                      setIsRejectResolutionModalOpen(true);
                    }}
                  />

                  <Button
                    type="button"
                    label={isVerifying ? "Memproses..." : "Setujui Penyelesaian"}
                    variant="primary"
                    size="sm"
                    onClick={handleApproveResolution}
                    disabled={isVerifying}
                  />
                </div>
              </div>
            )}
          </div>

          {/* ==================================
            RIGHT CONTENT
        ================================== */}
          <div className="min-w-0 lg:col-span-1">
            <HistoryCard history={currentTicket.history} />
          </div>
        </div>

        {/* ====================================
          AKSI MOBILE
          Diletakkan setelah grid/riwayat
          Mengikuti alur halaman, tidak fixed
      ==================================== */}
        <div className="mt-5 w-full lg:hidden">
          {!isRejected && !isAssignmentSaved && (
            <>
              {!isClassifying && !isClassificationSaved && !isAssignmentMode && (
                <div className="flex w-full gap-3">
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => setIsRejectModalOpen(true)}
                    label="Tolak Tiket"
                    className="flex-1"
                  />

                  <Button
                    type="button"
                    variant="primary"
                    onClick={handleOpenClassification}
                    label="Klasifikasikan"
                    className="flex-1"
                  />
                </div>
              )}

              {isClassifying && (
                <div className="flex w-full gap-3">
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={handleCancelClassification}
                    label="Batal"
                    className="flex-1"
                  />

                  <Button
                    type="button"
                    variant="primary"
                    onClick={handleSaveClassification}
                    label="Simpan"
                    className="flex-1"
                  />
                </div>
              )}

              {isAssignmentMode && (
                <div className="flex w-full gap-3">
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={handleCancelAssignment}
                    label="Batal"
                    className="flex-1"
                  />

                  <Button
                    type="button"
                    variant="primary"
                    onClick={handleSaveAssignment}
                    label="Simpan"
                    className="flex-1"
                  />
                </div>
              )}
            </>
          )}

          {currentTicket.status === "Terselesaikan" && (
            <div className="flex w-full gap-3">
              <Button
                type="button"
                label="Tolak Penyelesaian"
                variant="secondary"
                size="sm"
                className="flex-1"
                onClick={() => {
                  setIsRejectResolutionModalOpen(true);
                }}
              />

              <Button
                type="button"
                label={isVerifying ? "Memproses..." : "Setujui Penyelesaian"}
                variant="primary"
                size="sm"
                className="flex-1"
                onClick={handleApproveResolution}
                disabled={isVerifying}
              />
            </div>
          )}
        </div>

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
          ASSIGN OFFICER MODAL
      ====================================== */}
        <AssignOfficerModal
          isOpen={isAssignModalOpen}
          ticketId={ticketId}
          selectedOfficer={assignedOfficer}
          onClose={() => setIsAssignModalOpen(false)}
          onAssign={handleAssignOfficer}
        />

        {/* ======================================
          HANDLE TICKET MODAL
      ====================================== */}
        <HandleTicketModal
          isOpen={isHandleModalOpen}
          ticketId={String(ticketId)}
          startedAtFromDb={currentTicket?.sla_started_at ?? null}
          onClose={() => setIsHandleModalOpen(false)}
          onSave={handleSaveHandling}
          isSaving={isSavingHandling}
        />

        {/* ======================================
          REJECT RESOLUTION MODAL
      ====================================== */}
        <RejectResolutionModal
          isOpen={isRejectResolutionModalOpen}
          onClose={() => setIsRejectResolutionModalOpen(false)}
          onSave={handleRejectResolution}
        />

        {/* ======================================
          ESCALATION MODAL
      ====================================== */}
        <EscalationModal
          isOpen={isEscalationModalOpen}
          onClose={() => setIsEscalationModalOpen(false)}
          onSave={handleConfirmEscalation}
        />
      </div>
    </div>
  );
}
