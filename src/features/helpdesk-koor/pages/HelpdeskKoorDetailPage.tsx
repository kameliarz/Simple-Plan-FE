import { useEffect, useRef, useState } from "react";

import {
  ArrowLeft,
  Calendar,
  Clock,
  Image as ImageIcon,
  UserRound,
  Download,
  Info,
} from "lucide-react";

import { useLocation, useNavigate, useParams } from "react-router-dom";

import type { ApiTicket } from "../types/ticket";
import type { TicketItem, TicketPriority } from "../types/helpdesk";

import {
  getTicket,
  classifyTicket,
  assignOfficerToTicket,
  resolveTicket,
  rejectTicketResolution,
  escalateTicket,
} from "../services/ticketApi";

import RejectTicketModal from "../components/RejectTicketModal";
import AssignOfficerModal from "../components/AssignOfficerModal";
import type { Officer } from "../components/AssignOfficerModal";
import { TicketStatusBadge } from "../components/TicketStatusBadge";
import { TicketPriorityBadge } from "../components/TicketPriorityBadge";
import { TicketHistoryItem } from "../components/TicketHistoryItem";
import HandleTicketModal, { type HandleTicketFormData } from "../components/HandleTicketModal";
import RejectResolutionModal from "../components/RejectResolutionModal";
import EscalationModal from "../components/EscalationModal";

import Alert from "../../../components/ui/ui-template/Alert";
import Dropdown from "../../../components/ui/ui-template/Dropdown";
import Button from "../../../components/ui/ui-template/Button";

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
    ditugaskan: "Ditugaskan",
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

    finishedAt: ticket.completed_at ?? undefined,

    attachments: ticket.initial_evidence
      ? [
          {
            id: ticket.initial_evidence.object_key || ticket.initial_evidence.url || "",
            name: ticket.initial_evidence.original_name,
            size: formatFileSize(ticket.initial_evidence.size),
            url: (
              ticket.initial_evidence.object_key ||
              ticket.initial_evidence.url ||
              ""
            ).startsWith("http")
              ? ticket.initial_evidence.object_key || ticket.initial_evidence.url || ""
              : `/storage/${ticket.initial_evidence.object_key || ticket.initial_evidence.url || ""}`,
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

const kategoriMutuOptions = [
  "Kepatuhan Input Operator",
  "Ketidakstabilan System",
  "Ketidaksesuaian Program",
  "Akun dan Hak Akses System",
  "Waktu Tanggap Kerusakan Hardware",
  "Waktu Tanggap Kerusakan Software",
];

const kategoriMutuIdMap: Record<string, number> = {
  "Kepatuhan Input Operator": 1,
  "Ketidakstabilan System": 2,
  "Ketidaksesuaian Program": 3,
  "Akun dan Hak Akses System": 4,
  "Waktu Tanggap Kerusakan Hardware": 5,
  "Waktu Tanggap Kerusakan Software": 6,
};

const tagsITOptions = [
  "Manage Batal Kunjungan Pasien",
  "Edit Asesmen Medis Dokter (Form Perubahan Data)",
  "Support Apps Hapus Asesmen Medis Dokter",
  "Edit Asesmen Keperawatan (Form Perubahan Data)",
  "Support Apps Hapus Asesmen Keperawatan",
  "Edit Data Operasi dari Modul Operasi",
  "Hapus Request, Regis dan ID Penjualan LAB",
  "Hapus Request, Regis dan ID Penjualan RAD",
  "Manage Edit ID Penjualan LAB",
  "Manage Edit ID Penjualan RAD",
  "Manage ACC dan Ticketing Unit",
  "Hapus Request BMHP Farmasi",
  "Manage Master Baru (Jasa, Rikjang, Fasilitas)",
  "Manage Mapping Master (Jasa, Rikjang, Fasilitas)",
  "Manage Mapping untuk Bridging IT",
  "Manage Master LAB Test",
  "Manage Master RAD Test",
  "Manage Casemix Tidak Muncul",
  "Manage Unvalidasi RPP",
  "Manage Program Reham Medik Poli Fisioterapi",
  "Manage Master Barang Medis Farmasi",
  "Manage Tambah Hak Akses User NUHA",
  "Manage Edit Hak Akses User NUHA",
  "Manage Hapus Hak Akses User NUHA",
  "Manage Pelatihan Modul ke Unit",
  "Manage Input Diagnostik Medis",
  "Manage Input Tindakan Kunjungan di Modul Vaksin",
  "Manage Tambah Master Jam Kerja + Mapping Unit",
  "Manage Transfer Mutasi Saldo di Kas V3",
  "Manage Master Tenaga Medis",
  "Manage Mapping Master Ruangan Operasi",
  "Pergantian Sparepart",
  "Perbaikan Perangkat",
  "Lain-lain",
];

const tagsITIdMap: Record<string, number> = {
  "Manage Batal Kunjungan Pasien": 1,
  "Edit Asesmen Medis Dokter (Form Perubahan Data)": 2,
  "Support Apps Hapus Asesmen Medis Dokter": 3,
  "Edit Asesmen Keperawatan (Form Perubahan Data)": 4,
  "Support Apps Hapus Asesmen Keperawatan": 5,
  "Edit Data Operasi dari Modul Operasi": 6,
  "Hapus Request, Regis dan ID Penjualan LAB": 7,
  "Hapus Request, Regis dan ID Penjualan RAD": 8,
  "Manage Edit ID Penjualan LAB": 9,
  "Manage Edit ID Penjualan RAD": 10,
  "Manage ACC dan Ticketing Unit": 11,
  "Hapus Request BMHP Farmasi": 12,
  "Manage Master Baru (Jasa, Rikjang, Fasilitas)": 13,
  "Manage Mapping Master (Jasa, Rikjang, Fasilitas)": 14,
  "Manage Mapping untuk Bridging IT": 15,
  "Manage Master LAB Test": 16,
  "Manage Master RAD Test": 17,
  "Manage Casemix Tidak Muncul": 18,
  "Manage Unvalidasi RPP": 19,
  "Manage Program Reham Medik Poli Fisioterapi": 20,
  "Manage Master Barang Medis Farmasi": 21,
  "Manage Tambah Hak Akses User NUHA": 22,
  "Manage Edit Hak Akses User NUHA": 23,
  "Manage Hapus Hak Akses User NUHA": 24,
  "Manage Pelatihan Modul ke Unit": 25,
  "Manage Input Diagnostik Medis": 26,
  "Manage Input Tindakan Kunjungan di Modul Vaksin": 27,
  "Manage Tambah Master Jam Kerja + Mapping Unit": 28,
  "Manage Transfer Mutasi Saldo di Kas V3": 29,
  "Manage Master Tenaga Medis": 30,
  "Manage Mapping Master Ruangan Operasi": 31,
  "Pergantian Sparepart": 32,
  "Perbaikan Perangkat": 33,
  "Lain-lain": 34,
};

const kategoriSarprasOptions = ["Sarpras", "Elektronik", "Alkes"];

const kategoriSarprasIdMap: Record<string, number> = {
  Sarpras: 1,
  Elektronik: 2,
  Alkes: 3,
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
// MOCK PETUGAS
// ==========================================

const MOCK_OFFICERS: Officer[] = [
  {
    id: 1,
    name: "Hendra Wijaya",
    role: "IT Support - SIS",
    initials: "HW",
  },
  {
    id: 2,
    name: "Rian Pratama",
    role: "Teknisi Lapangan",
    initials: "RP",
  },
  {
    id: 3,
    name: "Siti Lestari",
    role: "IT Helpdesk",
    initials: "SL",
  },
  {
    id: 4,
    name: "Ahmad Fauzi",
    role: "IT Support - Hardware",
    initials: "AF",
  },
];

// ==========================================
// COMPONENT
// ==========================================

export default function HelpdeskKoorDetailPage() {
  const navigate = useNavigate();
  const location = useLocation();

  const service = location.pathname.includes("tik") ? "tik" : "sarpras";

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

  const [kategoriSarpras, setKategoriSarpras] = useState("");

  const [kategoriSarprasError, setKategoriSarprasError] = useState("");

  const [kategoriMutuError, setKategoriMutuError] = useState("");

  const [tagsITError, setTagsITError] = useState("");

  const classificationRef = useRef<HTMLDivElement | null>(null);

  // ==========================================
  // ASSIGNMENT
  // ==========================================

  const [isAssignmentMode, setIsAssignmentMode] = useState(false);

  const [isAssignmentSaved, setIsAssignmentSaved] = useState(false);

  // Prioritas sementara
  const [priority, setPriority] = useState<Priority | null>(null);
  const [priorityError, setPriorityError] = useState("");

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

        setKategoriMutu(data.tik_detail?.quality_category?.name ?? "");
        setTagsIT(data.tik_detail?.it_tag?.name ?? "");
        setKategoriSarpras(data.category ?? "");

        if (!isMounted) {
          return;
        }

        const mappedTicket = mapApiTicketToTicketItem(data);

        setCurrentTicket(mappedTicket);

        const status = String(data.status ?? "").toLowerCase();

        const classifiedStatuses = [
          "diklasifikasi",
          "ditugaskan",
          "diproses",
          "eskalasi",
          "terselesaikan",
          "ditutup",
        ];

        const assignedStatuses = ["ditugaskan", "diproses", "eskalasi", "terselesaikan", "ditutup"];

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
          const apiOfficer = MOCK_OFFICERS.find(
            (officer) => officer.name === data.assigned_officer?.name,
          );

          const officer: Officer = apiOfficer ?? {
            id: 0,
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
  // JENIS TIKET
  // ==========================================

  const isSarpras = currentTicket.category === "Sarpras";

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

    showAlertMessage("Tiket ditolak", "error");

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
    setKategoriSarpras("");

    setKategoriMutuError("");
    setTagsITError("");
    setKategoriSarprasError("");
  };

  // ==========================================
  // SAVE CLASSIFICATION
  // ==========================================

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
    }

    if (hasError) return;

    const qualityCategoryId = kategoriMutuIdMap[kategoriMutu];
    const itTagId = tagsITIdMap[tagsIT];
    const sarprasCategoryId = kategoriSarprasIdMap[kategoriSarpras];

    if (!isSarpras && (!qualityCategoryId || !itTagId)) {
      showAlertMessage("ID kategori atau tag IT tidak valid.", "error");
      return;
    }

    if (isSarpras && !sarprasCategoryId) {
      showAlertMessage("ID kategori sarpras tidak valid.", "error");
      return;
    }

    try {
      if (isSarpras) {
        await classifyTicket(ticketId, {
          sarpras_category_id: sarprasCategoryId,
        });
      } else {
        await classifyTicket(ticketId, {
          quality_category_id: qualityCategoryId,
          it_tag_id: itTagId,
          custom_it_tag_text: tagsIT === "Lain-lain" ? "Lain-lain" : undefined,
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
    setAssignedOfficer(officer);

    setIsAssignModalOpen(false);
  };

  // ==========================================
  // SAVE ASSIGNMENT
  // ==========================================

  const handleSaveAssignment = async () => {
    let hasError = false;

    if (!priority) {
      setPriorityError("Tingkat prioritas wajib dipilih!");
      hasError = true;
    } else {
      setPriorityError("");
    }

    if (!assignedOfficer) {
      showAlertMessage("Petugas wajib dipilih!", "error");
      hasError = true;
    }

    if (hasError) return;

    try {
      await assignOfficerToTicket(ticketId, {
        officer_id: assignedOfficer!.id,
        priority: priority as string,
      });

      // Simpan prioritas sebagai data final
      setSavedPriority(priority);

      // Simpan petugas sebagai data final
      setSavedOfficer(assignedOfficer);

      // Keluar dari mode edit
      setIsAssignmentMode(false);

      // Semua data sudah final
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
        ...currentTicket,
        status: "Diproses",
        priority:
          priority === "critical"
            ? "Critical"
            : priority === "high"
              ? "High"
              : priority === "medium"
                ? "Medium"
                : "Low",
        history: updatedHistory,
      });

      showAlertMessage("Prioritas dan petugas berhasil disimpan.", "success");
    } catch (err: any /* eslint-disable-line @typescript-eslint/no-explicit-any */) {
      showAlertMessage(err.message || "Gagal menyimpan penugasan petugas.", "error");
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
    const wasContinuing = isContinuingHandling;
    const formData = new FormData();
    const statusApi = data.status.toLowerCase() === "selesai" ? "terselesaikan" : "diproses";
    formData.append("status", statusApi);
    formData.append("notes", data.notes);
    formData.append("started_at", data.startedAt);
    formData.append("completed_at", data.completedAt);
    if (data.photo) {
      formData.append("result_photo", data.photo);
    }
    if (wasContinuing) {
      formData.append("is_continuing", "true");
    }

    try {
      await resolveTicket(ticketId, formData);

      // Buat foto khusus untuk aktivitas ini
      let handlingPhoto;

      if (data.photo) {
        const photoUrl = URL.createObjectURL(data.photo);

        handlingPhoto = {
          name: data.photo.name,
          size: formatFileSize(data.photo.size),
          url: photoUrl,
        };
      }

      // Buat history baru.
      const newHistoryItem = {
        id: `handling-${Date.now()}`,
        action: "Pengerjaan Teknisi",
        timestamp: formatHistoryDate(new Date().toISOString()),
        isCompleted: true,

        handlingNote: data.notes,

        ...(handlingPhoto && {
          handlingPhoto,
        }),
      };

      const updatedHistory = [newHistoryItem, ...(currentTicket.history || [])];

      setCurrentTicket({
        ...currentTicket,
        status: wasContinuing ? "Diproses" : "Terselesaikan",
        history: updatedHistory,
      });

      setIsHandleModalOpen(false);
      setIsContinuingHandling(false);

      showAlertMessage(
        wasContinuing
          ? "Penanganan dilanjutkan. Tiket kembali ke status diproses."
          : "Status dan riwayat perbaikan tiket berhasil diperbarui!",
        "success",
      );
    } catch (err: any /* eslint-disable-line @typescript-eslint/no-explicit-any */) {
      showAlertMessage(err.message || "Gagal menyimpan penanganan.", "error");
    }
  };

  // ==========================================
  // UI
  // ==========================================

  const handleApproveResolution = () => {
    if (!currentTicket) return;

    const newHistoryItem = {
      id: `closed-${Date.now()}`,
      action: "Tiket Ditutup",
      timestamp: formatHistoryDate(new Date().toISOString()),
      isCompleted: true,
    };

    const updatedHistory = [newHistoryItem, ...(currentTicket.history || [])];

    setCurrentTicket({
      ...currentTicket,
      status: "Ditutup",
      history: updatedHistory,
    });

    showAlertMessage("Tiket telah ditutup!", "success");
  };

  return (
    <div className="min-h-full bg-background p-4 pb-24 lg:p-5 lg:pb-10">
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
            HEADER TIKET
        ==================================== */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-5 px-1 pt-1">
          <div className="flex items-start gap-3">
            <button
              type="button"
              onClick={() => navigate(`/helpdesk/${service}`)}
              className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#1e293b] text-white transition hover:bg-slate-700"
            >
              <ArrowLeft size={16} strokeWidth={2.5} />
            </button>
            <div>
              <h1 className="text-[15px] font-bold text-[#003178] dark:text-blue-400 leading-tight">
                Detail Tiket
              </h1>
              <p className="text-xs text-slate-500 font-medium mt-0.5">#{currentTicket.code}</p>
              <div className="flex flex-wrap items-center gap-2 mt-2.5">
                <TicketStatusBadge status={currentTicket.status} />
                <TicketPriorityBadge priority={currentTicket.priority} />
              </div>
            </div>
          </div>

          {currentTicket.status === "Diproses" && !isAssignmentMode && (
            <div className="flex items-center gap-2 ml-11 md:ml-0">
              <Button
                type="button"
                variant="secondary"
                onClick={() => setIsEscalationModalOpen(true)}
                label="Eskalasi"
                className="text-xs py-1.5 px-3 bg-[#003178] text-white hover:bg-[#002255] border-none dark:bg-blue-600 dark:hover:bg-blue-700"
              />
              <Button
                type="button"
                variant="primary"
                onClick={() => setIsHandleModalOpen(true)}
                label="Tangani Tiket"
                className="text-xs py-1.5 px-3"
              />
            </div>
          )}
        </div>

        {/* ====================================
            CONTENT
        ==================================== */}

        <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
          {/* ==================================
              LEFT CONTENT
          ================================== */}

          <div className="space-y-5 lg:col-span-2">
            {/* =================================
                INFORMASI PELAPOR
            ================================= */}
            <div className="overflow-hidden bg-white dark:bg-table-card rounded-xl border border-[#e2e8f0] border-l-4 border-l-[#003178] shadow-sm dark:border-slate-700">
              <div className="flex items-center gap-2 px-4 py-3 pb-1">
                <h2 className="text-[13px] font-bold text-[#003178] dark:text-blue-400">
                  Informasi Pelapor
                </h2>
              </div>

              <div className="p-4 pt-2">
                <div className="grid grid-cols-1 gap-y-3 sm:grid-cols-2 sm:gap-x-10 sm:gap-y-5">
                  <div className="bg-slate-50 dark:bg-slate-800/50 p-2.5 rounded-lg">
                    <p className="text-[11px] font-medium text-slate-400">Nama Pelapor</p>
                    <p className="mt-0.5 text-xs font-semibold text-slate-800 dark:text-slate-200">
                      {currentTicket.reporter.name}
                    </p>
                  </div>

                  <div className="bg-slate-50 dark:bg-slate-800/50 p-2.5 rounded-lg">
                    <p className="text-[11px] font-medium text-slate-400">Unit Pelapor</p>
                    <p className="mt-0.5 text-xs font-semibold text-slate-800 dark:text-slate-200">
                      {currentTicket.reporter.unit}
                    </p>
                  </div>

                  {service === "sarpras" && (
                    <div className="bg-slate-50 dark:bg-slate-800/50 p-2.5 rounded-lg">
                      <p className="text-[11px] font-medium text-slate-400">Kategori Sarpras</p>
                      <p className="mt-0.5 text-xs font-semibold text-slate-800 dark:text-slate-200">
                        {currentTicket.category || "-"}
                      </p>
                    </div>
                  )}
                </div>

                <div className="bg-slate-50 dark:bg-slate-800/50 p-2.5 rounded-lg mt-3 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-slate-500">
                    <Calendar size={14} className="text-[#003178] dark:text-blue-400" />
                    <span className="text-[11px] font-medium">Dibuat Pada:</span>
                  </div>
                  <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                    {formatDateTime(currentTicket.createdAt)}
                  </span>
                </div>
              </div>
            </div>

            {/* =================================
                DATA INVENTARIS
            ================================= */}
            <div className="overflow-hidden bg-white dark:bg-table-card rounded-xl border border-[#e2e8f0] border-l-4 border-l-[#003178] shadow-sm dark:border-slate-700">
              <div className="flex items-center gap-2 px-4 py-3 pb-1">
                <h2 className="text-[13px] font-bold text-[#003178] dark:text-blue-400">
                  Data Inventaris
                </h2>
              </div>

              <div className="p-4 pt-2">
                <div className="grid grid-cols-1 gap-y-3 sm:grid-cols-2 sm:gap-x-10 sm:gap-y-5">
                  <div className="bg-slate-50 dark:bg-slate-800/50 p-2.5 rounded-lg">
                    <p className="text-[11px] font-medium text-slate-400">No. Inventaris</p>
                    <p className="mt-0.5 text-xs font-semibold text-slate-800 dark:text-slate-200">
                      -
                    </p>
                  </div>

                  <div className="bg-slate-50 dark:bg-slate-800/50 p-2.5 rounded-lg">
                    <p className="text-[11px] font-medium text-slate-400">Nama Inventaris</p>
                    <p className="mt-0.5 text-xs font-semibold text-slate-800 dark:text-slate-200">
                      -
                    </p>
                  </div>

                  <div className="bg-slate-50 dark:bg-slate-800/50 p-2.5 rounded-lg">
                    <p className="text-[11px] font-medium text-slate-400">Merk Inventaris</p>
                    <p className="mt-0.5 text-xs font-semibold text-slate-800 dark:text-slate-200">
                      -
                    </p>
                  </div>

                  <div className="bg-slate-50 dark:bg-slate-800/50 p-2.5 rounded-lg">
                    <p className="text-[11px] font-medium text-slate-400">Unit Inventaris</p>
                    <p className="mt-0.5 text-xs font-semibold text-slate-800 dark:text-slate-200">
                      {currentTicket.reporter.unit}
                    </p>
                  </div>

                  <div className="bg-slate-50 dark:bg-slate-800/50 p-2.5 rounded-lg">
                    <p className="text-[11px] font-medium text-slate-400">Lokasi Inventaris</p>
                    <p className="mt-0.5 text-xs font-semibold text-slate-800 dark:text-slate-200">
                      -
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* =================================
                DESKRIPSI
            ================================= */}
            <div className="overflow-hidden bg-white dark:bg-table-card rounded-xl border border-[#e2e8f0] border-l-4 border-l-[#003178] shadow-sm dark:border-slate-700">
              <div className="flex items-center gap-2 px-4 py-3 pb-1">
                <h2 className="text-[13px] font-bold text-[#003178] dark:text-blue-400">
                  Deskripsi
                </h2>
              </div>

              <div className="p-4 pt-2">
                <p className="text-[11px] font-medium text-slate-400 mb-1.5">Deskripsi Masalah</p>
                <div className="rounded-lg border border-slate-100 bg-slate-50 dark:border-slate-700 dark:bg-slate-800/50 p-3 mb-4">
                  <p className="whitespace-pre-line text-[13px] leading-relaxed text-slate-700 dark:text-slate-300">
                    {currentTicket.description}
                  </p>
                </div>

                <p className="text-[11px] font-medium text-slate-400 mb-2">Foto Bukti Awal</p>
                {currentTicket.attachments && currentTicket.attachments.length > 0 ? (
                  <div className="space-y-2">
                    {currentTicket.attachments.map((attachment) => (
                      <div
                        key={attachment.id}
                        className="flex items-center justify-between rounded-lg border border-slate-100 bg-white p-2.5 shadow-sm dark:border-slate-700 dark:bg-slate-800"
                      >
                        <div className="flex min-w-0 items-center gap-3">
                          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-[#003178]/5 text-[#003178] dark:bg-blue-900/20 dark:text-blue-400">
                            <ImageIcon size={15} />
                          </div>
                          <div className="min-w-0">
                            <p className="truncate text-xs font-semibold text-slate-800 dark:text-slate-200">
                              {attachment.name}
                            </p>
                            <p className="mt-0.5 text-[10px] text-slate-400">{attachment.size}</p>
                          </div>
                        </div>

                        {attachment.url && (
                          <a
                            href={attachment.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-slate-50 text-slate-500 hover:bg-slate-100 dark:bg-slate-700 dark:text-slate-400"
                          >
                            <Download size={14} />
                          </a>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="rounded-lg border border-dashed border-slate-200 bg-slate-50 p-4 text-center dark:border-slate-700 dark:bg-slate-800/50">
                    <ImageIcon size={20} className="mx-auto mb-1.5 text-slate-300" />
                    <p className="text-[11px] text-slate-400">Belum ada foto bukti awal.</p>
                  </div>
                )}
              </div>
            </div>

            {/* =================================
                KLASIFIKASI TIKET
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
                {/* HEADER */}
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
                  <h2 className="text-sm font-semibold text-text-title">
                    Klasifikasi Tiket {isSarpras ? "Sarpras" : "TIK"}
                  </h2>
                </div>

                {/* FORM */}
                <div className="px-6 py-5">
                  {isSarpras ? (
                    <div>
                      <label className="mb-1.5 block text-sm font-medium text-text-title">
                        Kategori Sarpras
                        <span className="ml-0.5 text-red-500">*</span>
                      </label>

                      <Dropdown
                        value={kategoriSarpras}
                        options={kategoriSarprasOptions}
                        onChange={(value) => {
                          setKategoriSarpras(value);

                          if (value) {
                            setKategoriSarprasError("");
                          }
                        }}
                        placeholder="Pilih kategori sarpras"
                        className="w-full"
                        error={kategoriSarprasError}
                      />
                    </div>
                  ) : (
                    <>
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
                    </>
                  )}
                </div>
              </div>
            )}

            {/* =================================
                KLASIFIKASI FIXED
            ================================= */}

            {isClassificationSaved && (
              <div className="overflow-hidden bg-white dark:bg-table-card rounded-xl border border-[#e2e8f0] border-l-4 border-l-[#003178] shadow-sm dark:border-slate-700">
                <div className="flex items-center gap-2 px-4 py-3 pb-1">
                  <h2 className="text-[13px] font-bold text-[#003178] dark:text-blue-400">
                    Klasifikasi Tiket {isSarpras ? "Sarpras" : "TIK"}
                  </h2>
                </div>

                <div className="p-4 pt-2">
                  <div className="grid grid-cols-1 gap-y-3 sm:grid-cols-2 sm:gap-x-10 sm:gap-y-5">
                    {isSarpras ? (
                      <div className="bg-slate-50 dark:bg-slate-800/50 p-2.5 rounded-lg">
                        <p className="text-[11px] font-medium text-slate-400">Kategori Sarpras</p>
                        <p className="mt-0.5 text-xs font-semibold text-slate-800 dark:text-slate-200">
                          {kategoriSarpras}
                        </p>
                      </div>
                    ) : (
                      <>
                        <div className="bg-slate-50 dark:bg-slate-800/50 p-2.5 rounded-lg">
                          <p className="text-[11px] font-medium text-slate-400">Kategori Mutu</p>
                          <p className="mt-0.5 text-xs font-semibold text-slate-800 dark:text-slate-200">
                            {kategoriMutu}
                          </p>
                        </div>

                        <div className="bg-slate-50 dark:bg-slate-800/50 p-2.5 rounded-lg">
                          <p className="text-[11px] font-medium text-slate-400">Tags IT</p>
                          <p className="mt-0.5 text-xs font-semibold text-slate-800 dark:text-slate-200">
                            {tagsIT}
                          </p>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* =================================
                TINGKAT PRIORITAS
            ================================= */}

            {isAssignmentMode && (
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
                    justify-between
                    border-b
                    border-slate-200
                    px-5
                    py-3.5
                    dark:border-slate-700
                  "
                >
                  <h2 className="text-sm font-semibold text-text-title">
                    Tingkat Prioritas
                    <span className="ml-0.5 text-red-500">*</span>
                  </h2>

                  <span className="text-xs text-slate-400">Tentukan SLA penanganan</span>
                </div>

                <div className="space-y-2.5 px-3.5 py-4">
                  {priorityOptions.map((option) => {
                    const isSelected = priority === option.value;

                    return (
                      <label
                        key={option.value}
                        className={`
                          flex
                          cursor-pointer
                          items-center
                          justify-between
                          rounded-xl
                          border
                          px-3
                          py-3
                          transition
                          ${
                            isSelected
                              ? "border-primary-500 bg-blue-50/50"
                              : "border-slate-200 bg-white hover:border-slate-300"
                          }
                          dark:border-slate-700
                          dark:bg-slate-800
                        `}
                      >
                        <div className="flex items-center gap-2.5">
                          <input
                            type="radio"
                            name="priority"
                            value={option.value}
                            checked={isSelected}
                            onChange={() => setPriority(option.value)}
                            className="
                              h-4
                              w-4
                              cursor-pointer
                              accent-primary-500
                            "
                          />

                          <span
                            className={`
                              text-xs
                              ${isSelected ? "font-medium text-text-title" : "text-text-secondary"}
                            `}
                          >
                            {option.label}
                          </span>
                        </div>

                        <span
                          className={`
                            rounded-md
                            border
                            px-2
                            py-1
                            text-xs
                            ${
                              isSelected && option.label === "Critical"
                                ? "border-red-200 bg-red-50 text-red-500"
                                : "border-slate-200 bg-slate-50 text-slate-400"
                            }
                          `}
                        >
                          {option.sla}
                        </span>
                      </label>
                    );
                  })}
                </div>
                {priorityError && (
                  <div className="flex items-center gap-1.5 px-6 pb-4 text-xs font-medium text-red-500">
                    <Info className="h-4 w-4" />
                    <span>{priorityError}</span>
                  </div>
                )}
              </div>
            )}

            {/* =================================
                TINGKAT PRIORITAS FIXED
            ================================= */}

            {isAssignmentSaved && savedPriority && (
              <div className="overflow-hidden bg-white dark:bg-table-card rounded-xl border border-[#e2e8f0] border-l-4 border-l-[#003178] shadow-sm dark:border-slate-700">
                <div className="flex items-center justify-between px-4 py-3 pb-1">
                  <h2 className="text-[13px] font-bold text-[#003178] dark:text-blue-400">
                    Tingkat Prioritas
                  </h2>
                  <span className="rounded-md border border-red-200 bg-red-50 dark:bg-red-200 px-2 py-1 text-[10px] font-medium text-red-500">
                    {priorityConfig[savedPriority].limit}
                  </span>
                </div>

                <div className="p-4 pt-2">
                  <div className="flex items-start gap-3 bg-slate-50 dark:bg-slate-800/50 p-2.5 rounded-lg">
                    <span
                      className={`mt-1 h-2.5 w-2.5 shrink-0 rounded-full ${priorityConfig[savedPriority].dot}`}
                    />
                    <div>
                      <p className="text-[11px] font-semibold text-slate-800 dark:text-slate-200">
                        {priorityOptions.find((item) => item.value === savedPriority)?.label}
                      </p>
                      <p className="mt-0.5 text-[10px] font-medium text-slate-500">
                        {priorityConfig[savedPriority].description}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* =================================
                PETUGAS
            ================================= */}

            {isAssignmentMode && (
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
                  <UserRound size={17} className="text-text-title" />

                  <h2 className="text-sm font-semibold text-text-title">
                    Petugas
                    <span className="ml-0.5 text-red-500">*</span>
                  </h2>
                </div>

                <div className="px-5 py-4">
                  {assignedOfficer ? (
                    <div
                      className="
                        flex
                        items-center
                        justify-between
                        rounded-lg
                        border
                        border-slate-200
                        bg-button
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
                            rounded-full
                            bg-primary-600
                            text-sm
                            font-semibold
                            text-slate-100
                          "
                        >
                          {assignedOfficer.initials}
                        </div>

                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold text-text-title">
                            {assignedOfficer.name}
                          </p>

                          <p className="mt-0.5 truncate text-xs text-slate-400">
                            {assignedOfficer.role}
                          </p>
                        </div>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        onClick={handleOpenAssignModal}
                        label="Ubah"
                        className="text-xs"
                      />
                    </div>
                  ) : (
                    <Button
                      type="button"
                      variant="primary"
                      onClick={handleOpenAssignModal}
                      icon="+"
                      label="Assign Petugas"
                      className="w-full"
                    />
                  )}
                </div>
              </div>
            )}

            {/* =================================
                PETUGAS FIXED
            ================================= */}

            {isAssignmentSaved && savedOfficer && (
              <div className="overflow-hidden bg-white dark:bg-table-card rounded-xl border border-[#e2e8f0] border-l-4 border-l-[#003178] shadow-sm dark:border-slate-700">
                <div className="flex items-center justify-between px-4 py-3 pb-1">
                  <h2 className="text-[13px] font-bold text-[#003178] dark:text-blue-400">
                    Petugas
                  </h2>
                  <span className="rounded-md border border-green-200 bg-emerald-50 dark:bg-emerald-200 px-2 py-1 text-[10px] font-medium text-green-600 dark:text-green-700">
                    Ditugaskan
                  </span>
                </div>

                <div className="p-4 pt-2">
                  <div className="flex items-center gap-3 bg-slate-50 dark:bg-slate-800/50 p-2.5 rounded-lg">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#003178] text-[11px] font-semibold text-white">
                      {savedOfficer.initials}
                    </div>

                    <div className="min-w-0">
                      <p className="truncate text-[11px] font-semibold text-slate-800 dark:text-slate-200">
                        {savedOfficer.name}
                      </p>
                      <p className="mt-0.5 truncate text-[10px] font-medium text-slate-500">
                        {savedOfficer.role}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* =================================
                ESKALASI TIKET
            ================================= */}

            {currentTicket.status === "Eskalasi" && currentTicket.escalation && (
              <div className="overflow-hidden bg-white dark:bg-table-card rounded-xl border border-[#e2e8f0] border-l-4 border-l-[#003178] shadow-sm dark:border-slate-700">
                <div className="flex items-center gap-2 px-4 py-3 pb-1">
                  <h2 className="text-[13px] font-bold text-[#003178] dark:text-blue-400">
                    Eskalasi Tiket
                  </h2>
                </div>

                <div className="p-4 pt-2 space-y-3">
                  <div className="bg-slate-50 dark:bg-slate-800/50 p-2.5 rounded-lg">
                    <p className="text-[11px] font-medium text-slate-400">Tujuan Eskalasi</p>
                    <p className="mt-0.5 text-xs font-semibold text-slate-800 dark:text-slate-200 capitalize">
                      {currentTicket.escalation.destination}
                    </p>
                  </div>

                  <div className="bg-slate-50 dark:bg-slate-800/50 p-2.5 rounded-lg">
                    <p className="text-[11px] font-medium text-slate-400">Deskripsi Masalah</p>
                    <p className="mt-0.5 text-[13px] leading-relaxed text-slate-700 dark:text-slate-300">
                      {currentTicket.escalation.notes}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* ==================================
              RIGHT CONTENT
          ================================== */}

          <div className="space-y-5">
            <div className="overflow-hidden bg-white dark:bg-table-card rounded-xl border border-[#e2e8f0] border-l-4 border-l-[#003178] shadow-sm dark:border-slate-700">
              <div className="flex items-center gap-2 px-4 py-3 pb-1">
                <h2 className="text-[13px] font-bold text-[#003178] dark:text-blue-400">
                  Riwayat Penanganan
                </h2>
              </div>

              <div className="relative p-4 pt-2">
                {currentTicket.history && currentTicket.history.length > 0 ? (
                  <>
                    {/* GARIS TIMELINE */}
                    <div className="pointer-events-none absolute left-8 top-5 bottom-5 w-px bg-slate-200 dark:bg-slate-700" />

                    {currentTicket.history.map((item, index) => (
                      <div key={item.id}>
                        <TicketHistoryItem
                          action={item.action}
                          timestamp={item.timestamp}
                          isLatest={index === 0}
                        />

                        {/* KETERANGAN KENDALA */}
                        {item.action === "Pengerjaan Ulang oleh Teknisi" && item.retryNote && (
                          <div className="ml-14 mt-1.5 mb-4">
                            <p className="mb-1 text-[11px] font-medium text-slate-400">
                              Keterangan Kendala
                            </p>
                            <div className="rounded-lg border border-slate-100 bg-slate-50 p-2.5 dark:border-slate-700 dark:bg-slate-800/50">
                              <p className="whitespace-pre-line text-xs leading-relaxed text-slate-700 dark:text-slate-300">
                                {item.retryNote}
                              </p>
                            </div>
                          </div>
                        )}

                        {/* HASIL PENANGANAN */}
                        {(item.handlingNote || item.handlingPhoto) && (
                          <div className="ml-14 mt-2 mb-4">
                            {/* CATATAN */}
                            {item.handlingNote && (
                              <div>
                                <p className="mb-1 text-[11px] font-medium text-slate-400">
                                  Catatan Penanganan
                                </p>
                                <div className="rounded-lg border border-slate-100 bg-slate-50 p-2.5 dark:border-slate-700 dark:bg-slate-800/50">
                                  <p className="whitespace-pre-line text-xs leading-relaxed text-slate-700 dark:text-slate-300">
                                    {item.handlingNote}
                                  </p>
                                </div>
                              </div>
                            )}

                            {/* FOTO */}
                            {item.handlingPhoto && (
                              <div className="mt-3">
                                <p className="mb-1 text-[11px] font-medium text-slate-400">
                                  Foto Bukti Hasil Perbaikan
                                </p>
                                <div className="flex items-center justify-between rounded-lg border border-slate-100 bg-white p-2.5 shadow-sm dark:border-slate-700 dark:bg-slate-800">
                                  <a
                                    href={item.handlingPhoto.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex min-w-0 items-center gap-3"
                                  >
                                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-[#003178]/5 text-[#003178] dark:bg-blue-900/20 dark:text-blue-400">
                                      <ImageIcon size={15} />
                                    </div>
                                    <div className="min-w-0">
                                      <p className="truncate text-xs font-semibold text-slate-800 dark:text-slate-200">
                                        {item.handlingPhoto.name}
                                      </p>
                                      <p className="mt-0.5 text-[10px] text-slate-400">
                                        {item.handlingPhoto.size}
                                      </p>
                                    </div>
                                  </a>
                                  <a
                                    href={item.handlingPhoto.url}
                                    download={item.handlingPhoto.name}
                                    onClick={(e) => e.stopPropagation()}
                                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-slate-50 text-slate-500 hover:bg-slate-100 dark:bg-slate-700 dark:text-slate-400"
                                    title="Download"
                                  >
                                    <Download size={14} />
                                  </a>
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                  </>
                ) : (
                  <div className="py-6 text-center">
                    <Clock size={20} className="mx-auto mb-2 text-slate-300" />
                    <p className="text-[11px] text-slate-400">Belum ada riwayat penanganan.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* ====================================
            ACTION BUTTONS
        ==================================== */}
        <div className="fixed bottom-0 left-0 right-0 z-40 flex items-center gap-3 border-t border-slate-200 bg-white p-4 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] dark:border-slate-700 dark:bg-table-card md:static md:mt-6 md:border-none md:p-0 md:shadow-none md:bg-transparent">
          {currentTicket.status === "Terselesaikan" && (
            <>
              <Button
                type="button"
                label="Tolak Penyelesaian"
                variant="secondary"
                className="flex-1 md:flex-none"
                onClick={() => setIsRejectResolutionModalOpen(true)}
              />
              <Button
                type="button"
                label="Setujui Penyelesaian"
                variant="primary"
                className="flex-1 md:flex-none"
                onClick={handleApproveResolution}
              />
            </>
          )}

          {!isRejected &&
            !isAssignmentSaved &&
            !isClassifying &&
            !isClassificationSaved &&
            !isAssignmentMode &&
            currentTicket.status !== "Terselesaikan" && (
              <>
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => setIsRejectModalOpen(true)}
                  label="Tolak Tiket"
                  className="flex-1 md:flex-none"
                />
                <Button
                  type="button"
                  variant="primary"
                  onClick={handleOpenClassification}
                  label="Klasifikasikan"
                  className="flex-1 md:flex-none"
                />
              </>
            )}
          {isClassifying && (
            <>
              <Button
                type="button"
                variant="secondary"
                onClick={handleCancelClassification}
                label="Batal"
                className="flex-1 md:flex-none"
              />
              <Button
                type="button"
                variant="primary"
                onClick={handleSaveClassification}
                label="Simpan"
                className="flex-1 md:flex-none"
              />
            </>
          )}
          {isAssignmentMode && (
            <>
              <Button
                type="button"
                variant="secondary"
                onClick={handleCancelAssignment}
                label="Batal"
                className="flex-1 md:flex-none"
              />
              <Button
                type="button"
                variant="primary"
                onClick={handleSaveAssignment}
                label="Simpan"
                className="flex-1 md:flex-none"
              />
            </>
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
          onClose={() => setIsHandleModalOpen(false)}
          onSave={handleSaveHandling}
        />

        <RejectResolutionModal
          isOpen={isRejectResolutionModalOpen}
          onClose={() => setIsRejectResolutionModalOpen(false)}
          onSave={async (reason) => {
            try {
              await rejectTicketResolution(ticketId, { reason });

              const updatedHistory = [
                {
                  id: `rework-${Date.now()}`,
                  action: "Pengerjaan ulang oleh teknisi",
                  timestamp: formatHistoryDate(new Date().toISOString()),
                  isCompleted: true,
                  retryNote: reason,
                },
                ...(currentTicket.history || []),
              ];

              setCurrentTicket({
                ...currentTicket,
                status: "Diproses",
                history: updatedHistory,
              });

              setIsRejectResolutionModalOpen(false);
              showAlertMessage(
                "Penyelesaian ditolak. Tiket kembali ke status diproses.",
                "success",
              );
            } catch (err: any /* eslint-disable-line @typescript-eslint/no-explicit-any */) {
              showAlertMessage(err.message || "Gagal menolak penyelesaian.", "error");
            }
          }}
        />

        <EscalationModal
          isOpen={isEscalationModalOpen}
          onClose={() => setIsEscalationModalOpen(false)}
          onSave={async (data) => {
            try {
              await escalateTicket(ticketId, {
                target: data.destination,
                notes: data.notes,
              });

              const updatedHistory = [
                {
                  id: `escalated-${Date.now()}`,
                  action: "Tiket Dieskalasi",
                  timestamp: new Date().toLocaleString("id-ID", {
                    day: "2-digit",
                    month: "short",
                    hour: "2-digit",
                    minute: "2-digit",
                  }),
                },
                ...(currentTicket.history || []),
              ];

              setCurrentTicket({
                ...currentTicket,
                status: "Eskalasi",
                history: updatedHistory,
                escalation: {
                  destination: data.destination,
                  notes: data.notes,
                },
              });

              setIsEscalationModalOpen(false);
              showAlertMessage("Tiket berhasil dieskalasikan!", "success");
            } catch (err: any /* eslint-disable-line @typescript-eslint/no-explicit-any */) {
              showAlertMessage(err.message || "Gagal melakukan eskalasi tiket.", "error");
            }
          }}
        />
      </div>
    </div>
  );
}
