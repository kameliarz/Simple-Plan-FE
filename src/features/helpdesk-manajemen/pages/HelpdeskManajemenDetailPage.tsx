/* eslint-disable no-constant-binary-expression */
import { useEffect, useRef, useState } from "react";

import {
  ArrowLeft,
  Calendar,
  Clock,
  FileText,
  Image as ImageIcon,
  Info,
  Monitor,
  UserRound,
  Download,
} from "lucide-react";

import { useLocation, useNavigate, useParams } from "react-router-dom";

import type { ApiTicket } from "@/features/helpdesk-super-admin/types/ticket";
import type { TicketItem, TicketPriority } from "@/features/helpdesk-super-admin/types/helpdesk";

import { getTicket, classifyTicket } from "@/features/helpdesk-super-admin/services/ticketApi";
import { getUser } from "@/features/auth-login/services/authStorage";

import RejectTicketModal from "@/features/helpdesk-super-admin/components/RejectTicketModal";
import AssignOfficerModal from "@/features/helpdesk-super-admin/components/AssignOfficerModal";
import type { Officer } from "@/features/helpdesk-super-admin/components/AssignOfficerModal";
import { TicketStatusBadge } from "@/features/helpdesk-super-admin/components/TicketStatusBadge";
import { TicketPriorityBadge } from "@/features/helpdesk-super-admin/components/TicketPriorityBadge";
import { TicketHistoryItem } from "@/features/helpdesk-super-admin/components/TicketHistoryItem";
import HandleTicketModal, {
  type HandleTicketFormData,
} from "@/features/helpdesk-super-admin/components/HandleTicketModal";
import RejectResolutionModal from "@/features/helpdesk-super-admin/components/RejectResolutionModal";
import EscalationModal from "@/features/helpdesk-super-admin/components/EscalationModal";

import Alert from "@/components/ui/ui-template/Alert";
import Dropdown from "@/components/ui/ui-template/Dropdown";
import Button from "@/components/ui/ui-template/Button";

type Priority = "critical" | "high" | "medium" | "low";

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
    sla_started_at: ticket.sla_started_at ?? null,

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
      id: ticket.reporter.id,
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

export default function HelpdeskManajemenDetailPage() {
  const user = getUser();
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
            onClick={() => navigate(`/manajemen/helpdesk/${service}`)}
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
            onClick={() => navigate(`/manajemen/helpdesk/${service}`)}
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

    if (!isSarpras && (!qualityCategoryId || !itTagId)) {
      showAlertMessage("ID kategori atau tag IT tidak valid.", "error");
      return;
    }

    if (isSarpras && !kategoriSarprasIdMap[kategoriSarpras]) {
      showAlertMessage("ID kategori sarpras tidak valid.", "error");
      return;
    }

    try {
      if (isSarpras) {
        const sarprasCategoryId = kategoriSarprasIdMap[kategoriSarpras];
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
    // Ini masih pilihan sementara.
    // Belum dianggap final sampai tombol Simpan
    // pada tahap assignment ditekan.
    setAssignedOfficer(officer);

    setIsAssignModalOpen(false);
  };

  // ==========================================
  // SAVE ASSIGNMENT
  // ==========================================

  const handleSaveAssignment = () => {
    if (!priority) {
      showAlertMessage("Tingkat prioritas wajib dipilih.", "error");
      return;
    }

    if (!assignedOfficer) {
      showAlertMessage("Petugas wajib dipilih.", "error");
      return;
    }

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

    console.log("Prioritas:", priority);
    console.log("Petugas:", assignedOfficer);
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
  console.log({ isClassifying, isAssignmentMode, isRejected });

  // ==========================================
  // HANDLE TICKET
  // ==========================================
  const handleSaveHandling = (data: HandleTicketFormData) => {
    console.log("Data penanganan:", data);

    const wasContinuing = isContinuingHandling;

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
    // Catatan + foto disimpan DI DALAM history item ini.
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
        : "Pengerjaan teknisi berhasil disimpan.",
      "success",
    );
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
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => navigate(`/manajemen/helpdesk/${service}`)}
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

            {false && (
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

            {false && (
              <Button
                type="button"
                label="Lanjutkan Penanganan"
                variant="primary"
                size="sm"
                onClick={() => {
                  setIsContinuingHandling(true);
                  setIsHandleModalOpen(true);
                }}
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

          <div className="space-y-5 lg:col-span-2">
            {/* =================================
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

            {/* =================================
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

            {/* =================================
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

            {/* =================================
                KLASIFIKASI TIKET
            ================================= */}

            {false && (
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
                  <h2 className="text-sm font-semibold text-text-title">
                    Klasifikasi Tiket {isSarpras ? "Sarpras" : "TIK"}
                  </h2>
                </div>

                <div className="px-6 py-5">
                  <div
                    className="
                      grid
                      grid-cols-1
                      gap-5
                      sm:grid-cols-2
                    "
                  >
                    {isSarpras ? (
                      <div>
                        <p className="text-xs text-slate-400">Kategori Sarpras</p>

                        <p className="mt-1.5 text-sm font-medium text-text-title">
                          {kategoriSarpras}
                        </p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                        <div>
                          <p className="text-xs text-slate-400">Kategori Mutu</p>

                          <p className="mt-1.5 text-sm font-medium text-text-title">
                            {kategoriMutu}
                          </p>
                        </div>

                        <div>
                          <p className="text-xs text-slate-400">Tags IT</p>

                          <p className="mt-1.5 text-sm font-medium text-text-title">{tagsIT}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* =================================
                TINGKAT PRIORITAS
            ================================= */}

            {false && (
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
              </div>
            )}

            {/* =================================
                TINGKAT PRIORITAS FIXED
            ================================= */}

            {isAssignmentSaved && savedPriority && (
              <div
                className="
                    overflow-hidden
                    rounded-xl
                    border
                    border-slate-100
                    bg-white
                    shadow-sm
                    dark:border-slate-700
                    dark:bg-table-card
                  "
              >
                <div className="px-6 py-4">
                  <div className="flex items-center justify-between">
                    <h2 className="text-base font-semibold text-text-title">Tingkat Prioritas</h2>

                    <span
                      className="
                          rounded-md
                          border
                          border-red-200
                          bg-red-50 dark:bg-red-200
                          px-2
                          py-1
                          text-[11px]
                          font-medium
                          text-red-500
                        "
                    >
                      {priorityConfig[savedPriority].limit}
                    </span>
                  </div>

                  <div className="my-3 border-t border-slate-100 dark:border-slate-700" />

                  <div className="flex items-start gap-3">
                    <span
                      className={`
                          mt-1.5
                          h-3
                          w-3
                          shrink-0
                          rounded-full
                          ${priorityConfig[savedPriority].dot}
                        `}
                    />

                    <div>
                      <p className="text-sm font-semibold text-text-title">
                        {priorityOptions.find((item) => item.value === savedPriority)?.label}
                      </p>

                      <p className="mt-1 text-sm text-text-secondary">
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

            {false && (
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
                          {assignedOfficer?.initials}
                        </div>

                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold text-text-title">
                            {assignedOfficer?.name}
                          </p>

                          <p className="mt-0.5 truncate text-xs text-slate-400">
                            {assignedOfficer?.role}
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
              <div
                className="
                    overflow-hidden
                    rounded-xl
                    border
                    border-slate-100
                    bg-white
                    shadow-sm
                    dark:border-slate-700
                    dark:bg-table-card
                  "
              >
                <div className="px-6 py-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <UserRound size={17} className="text-text-title" />

                      <h2 className="text-base font-semibold text-text-title">Petugas</h2>
                    </div>

                    <span
                      className="
                          rounded-md
                          border
                          border-green-200 
                          bg-emerald-50 dark:bg-emerald-200
                          px-2
                          py-1
                          text-[11px]
                          font-medium
                          text-green-600 dark:text-green-700
                        "
                    >
                      Ditugaskan
                    </span>
                  </div>

                  <div className="my-3 border-t border-slate-100 dark:border-slate-700" />

                  <div className="flex items-center gap-3">
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
                          text-xs
                          font-semibold
                          text-white
                        "
                    >
                      {savedOfficer.initials}
                    </div>

                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-text-title">
                        {savedOfficer.name}
                      </p>

                      <p className="mt-0.5 truncate text-xs text-text-secondary">
                        {savedOfficer.role}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {false && (
              <div
                className="
                mt-6
                flex
                w-full
                justify-end
              "
              >
                {/* ================================
                  INITIAL
              ================================= */}

                {false && (
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

                {/* ================================
                  CLASSIFICATION
              ================================= */}

                {false && (
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

                {/* ================================
                  ASSIGNMENT
              ================================= */}

                {false && (
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
            {/* ======================================
              ACTION BUTTONS
              BOTTOM RIGHT
          ====================================== */}

            {currentTicket.status === "Terselesaikan" &&
              user?.nama === currentTicket.reporter.name && (
                <div className="mt-5 flex justify-end">
                  <div className="flex items-center gap-2">
                    <Button
                      type="button"
                      label="Tolak Penyelesaian"
                      variant="secondary"
                      size="sm"
                      onClick={() => {
                        setIsRejectResolutionModalOpen(true);
                        showAlertMessage("Penyelesaian tiket ditolak.", "error");
                      }}
                    />

                    <Button
                      type="button"
                      label="Setujui Penyelesaian"
                      variant="primary"
                      size="sm"
                      onClick={() => {
                        const updatedHistory = [
                          {
                            id: `closed-${Date.now()}`,
                            action: "Tiket Ditutup",
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
                          status: "Ditutup",
                          history: updatedHistory,
                        });

                        showAlertMessage(
                          "Penyelesaian tiket disetujui. Tiket telah ditutup.",
                          "success",
                        );
                      }}
                    />
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

              <div className="relative px-4 py-4">
                {currentTicket.history && currentTicket.history.length > 0 ? (
                  <>
                    {/* GARIS TIMELINE */}
                    <div
                      className="
                        pointer-events-none
                        absolute
                        left-8
                        top-7
                        bottom-7
                        w-px
                        bg-slate-200
                        dark:bg-slate-700
                      "
                    />

                    {currentTicket.history.map((item, index) => (
                      <div key={item.id}>
                        <TicketHistoryItem
                          action={item.action}
                          timestamp={item.timestamp}
                          isLatest={index === 0}
                        />

                        {/* KETERANGAN KENDALA */}
                        {item.action === "Pengerjaan Ulang oleh Teknisi" && item.retryNote && (
                          <div className="ml-14 mt-2 mb-4">
                            <p className="mb-1.5 pb-1.5 text-xs text-slate-500 dark:text-slate-400">
                              Keterangan Kendala
                            </p>

                            <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-3 dark:border-slate-700 dark:bg-slate-800">
                              <p className="whitespace-pre-line text-sm leading-5 text-text-secondary">
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
                                <p className="mb-1.5 pb-1.5 text-xs text-slate-500 dark:text-slate-400">
                                  Catatan Penanganan
                                </p>

                                <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-3 dark:border-slate-700 dark:bg-slate-800">
                                  <p className="whitespace-pre-line text-xs leading-5 text-text-secondary">
                                    {item.handlingNote}
                                  </p>
                                </div>
                              </div>
                            )}

                            {/* FOTO */}
                            {item.handlingPhoto && (
                              <div className="mt-4">
                                <p className="mb-2 pb-1.5 text-xs text-slate-500 dark:text-slate-400">
                                  Foto Bukti Hasil Perbaikan
                                </p>

                                <div
                                  className="
                                    flex
                                    items-center
                                    gap-3
                                    rounded-xl
                                    border
                                    border-slate-200
                                    bg-white
                                    px-4
                                    py-3
                                    dark:border-slate-700
                                    dark:bg-slate-900
                                  "
                                >
                                  {/* AREA VIEW */}
                                  <a
                                    href={item.handlingPhoto.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="
                                      flex
                                      min-w-0
                                      flex-1
                                      items-center
                                      gap-3
                                      rounded-lg
                                      transition
                                      hover:bg-slate-50
                                      dark:hover:bg-slate-800
                                    "
                                  >
                                    {/* ICON */}
                                    <div
                                      className="
                                        flex
                                        h-14
                                        w-14
                                        shrink-0
                                        items-center
                                        justify-center
                                        rounded-xl
                                        bg-blue-50
                                        text-blue-800
                                        dark:bg-blue-950
                                        dark:text-blue-300
                                      "
                                    >
                                      <ImageIcon size={26} strokeWidth={1.8} />
                                    </div>

                                    {/* FILE INFO */}
                                    <div className="min-w-0">
                                      <p className="truncate text-xs font-medium text-text-title">
                                        {item.handlingPhoto.name}
                                      </p>

                                      <p className="mt-0.5 text-xs text-slate-400">
                                        {item.handlingPhoto.size}
                                      </p>
                                    </div>
                                  </a>

                                  {/* DOWNLOAD */}
                                  <a
                                    href={item.handlingPhoto.url}
                                    download={item.handlingPhoto.name}
                                    onClick={(e) => e.stopPropagation()}
                                    className="
                                      flex
                                      h-9
                                      w-9
                                      shrink-0
                                      items-center
                                      justify-center
                                      rounded-lg
                                      text-blue-800
                                      transition
                                      hover:bg-blue-50
                                      dark:text-blue-300
                                      dark:hover:bg-blue-950
                                    "
                                    title="Download"
                                  >
                                    <Download size={21} strokeWidth={2} />
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
                    <Clock size={22} className="mx-auto mb-2 text-slate-300" />

                    <p className="text-xs text-text-secondary">Belum ada riwayat penanganan.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
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
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          onSave={handleSaveHandling as any}
          ticketId={ticketId || ""}
          startedAtFromDb={currentTicket?.sla_started_at || null}
        />

        <RejectResolutionModal
          isOpen={isRejectResolutionModalOpen}
          onClose={() => setIsRejectResolutionModalOpen(false)}
          onSave={(reason) => {
            console.log("Alasan penolakan:", reason);

            const updatedHistory = [
              {
                id: `rework-${Date.now()}`,
                action: "Pengerjaan Ulang oleh Teknisi",
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

            showAlertMessage("Penyelesaian ditolak. Tiket kembali ke status diproses.", "success");
          }}
        />

        <EscalationModal
          isOpen={isEscalationModalOpen}
          onClose={() => setIsEscalationModalOpen(false)}
          onSave={(data) => {
            console.log("Data eskalasi:", data);

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
            });

            setIsEscalationModalOpen(false);

            showAlertMessage("Eskalasi tiket berhasil dikirim.", "success");
          }}
        />
      </div>
    </div>
  );
}
