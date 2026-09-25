import { useEffect, useRef, useState } from "react";

import { ArrowLeft } from "lucide-react";

import { useLocation, useNavigate, useParams } from "react-router-dom";

import type { ApiTicket } from "../types/ticket";
import type { TicketItem, TicketPriority } from "../types/helpdesk";

import { getTicket } from "../services/ticketApi";

import RejectTicketModal from "../components/RejectTicketModal";
import AssignOfficerModal from "../components/AssignOfficerModal";
import type { Officer } from "../components/AssignOfficerModal";
import { TicketStatusBadge } from "../components/TicketStatusBadge";
import { TicketPriorityBadge } from "../components/TicketPriorityBadge";
import HandleTicketModal, { type HandleTicketFormData } from "../components/HandleTicketModal";
import RejectResolutionModal from "../components/RejectResolutionModal";
import EscalationModal from "../components/EscalationModal";

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

const kategoriMutuOptions = [
  "Kepatuhan Input Operator",
  "Ketidakstabilan System",
  "Ketidaksesuaian Program",
  "Akun dan Hak Akses System",
  "Waktu Tanggap Kerusakan Hardware",
  "Waktu Tanggap Kerusakan Software",
];

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

const kategoriSarprasOptions = ["Sarpras", "Elektronik", "Alkes"];

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

  const [isClassifying] = useState(false);

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

            <ReporterInfoCard
              name={currentTicket.reporter.name}
              unit={currentTicket.reporter.unit}
              createdAt={formatDateTime(currentTicket.createdAt)}
            />

            {/* =================================
                DATA INVENTARIS
            ================================= */}

            <InventoryCard unit={currentTicket.reporter.unit} />

            {/* =================================
                DESKRIPSI
            ================================= */}

            <DescriptionCard
              description={currentTicket.description}
              attachments={currentTicket.attachments}
            />

            {/* =================================
                KLASIFIKASI TIKET
            ================================= */}

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
              tagsIT={tagsIT}
              setTagsIT={setTagsIT}
              tagsITOptions={tagsITOptions}
              tagsITError={tagsITError}
              setTagsITError={setTagsITError}
            />

            {/* =================================
                TINGKAT PRIORITAS
            ================================= */}

            <PriorityCard
              isAssignmentMode={isAssignmentMode}
              isAssignmentSaved={isAssignmentSaved}
              priority={priority}
              setPriority={setPriority}
              priorityOptions={priorityOptions}
              savedPriority={savedPriority}
              priorityConfig={priorityConfig}
            />

            {/* =================================
                PETUGAS
            ================================= */}
            <OfficerCard
              isAssignmentMode={isAssignmentMode}
              isAssignmentSaved={isAssignmentSaved}
              assignedOfficer={assignedOfficer}
              savedOfficer={savedOfficer}
              onOpenAssignModal={handleOpenAssignModal}
            />

            {/* ======================================
    ACTION BUTTONS
    BOTTOM RIGHT
====================================== */}

            {!isRejected && !isAssignmentSaved && (
              <div className="mt-6 flex w-full justify-end">
                {!isClassifying && !isClassificationSaved && !isAssignmentMode && (
                  <div className="flex w-full gap-3 sm:w-auto">
                    <Button
                      type="button"
                      label="Tolak Tiket"
                      variant="secondary"
                      size="sm"
                      onClick={() => setIsRejectModalOpen(true)}
                    />
                    <Button
                      type="button"
                      label="Klasifikasikan"
                      variant="primary"
                      size="sm"
                      onClick={handleOpenClassification}
                    />
                  </div>
                )}

                {isClassifying && (
                  <div className="flex w-full gap-3 sm:w-auto">
                    <Button
                      type="button"
                      label="Batal"
                      variant="secondary"
                      size="sm"
                      onClick={handleCancelClassification}
                    />
                    <Button
                      type="button"
                      label="Simpan"
                      variant="primary"
                      size="sm"
                      onClick={handleSaveClassification}
                    />
                  </div>
                )}

                {isAssignmentMode && (
                  <div className="flex w-full gap-3 sm:w-auto">
                    <Button
                      type="button"
                      label="Batal"
                      variant="secondary"
                      size="sm"
                      onClick={handleCancelAssignment}
                    />
                    <Button
                      type="button"
                      label="Simpan"
                      variant="primary"
                      size="sm"
                      onClick={handleSaveAssignment}
                    />
                  </div>
                )}
              </div>
            )}

            {currentTicket.status === "Terselesaikan" && (
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
            <HistoryCard history={currentTicket.history} />
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
          onSave={handleSaveHandling}
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
