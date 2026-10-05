/* eslint-disable */

import { useEffect, useState } from "react";
import {
  ArrowLeft,
  Calendar,
  FileText,
  ImageIcon,
  Download,
  AlertCircle,
  Tag,
  UserCheck,
} from "lucide-react";
import { useLocation, useNavigate, useParams } from "react-router-dom";

import type { ApiTicket } from "../../helpdesk-super-admin/types/ticket";
import { getTicket } from "../../helpdesk-super-admin/services/ticketApi";
import { TicketStatusBadge } from "../../helpdesk-super-admin/components/TicketStatusBadge";
import { TicketPriorityBadge } from "../../helpdesk-super-admin/components/TicketPriorityBadge";
import { TicketHistoryItem } from "../../helpdesk-super-admin/components/TicketHistoryItem";
import HandleTicketModal, {
  type HandleTicketFormData,
} from "../../helpdesk-super-admin/components/HandleTicketModal";
import EscalationModal, {
  type EscalationFormData,
} from "../../helpdesk-super-admin/components/EscalationModal";

import Alert from "@/components/ui/ui-template/Alert";
import Button from "@/components/ui/ui-template/Button";

// ==========================================
// FORMATTERS
// ==========================================
const formatDateTime = (dateString: string): string => {
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return "-";
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
  if (Number.isNaN(date.getTime())) return "-";
  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  })
    .format(date)
    .replace(",", " •");
};

const formatFileSize = (bytes: number): string => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

const mapStatusToProperCase = (status: ApiTicket["status"]) => {
  const statusMap: Record<ApiTicket["status"], string> = {
    baru: "Baru",
    diklasifikasi: "Diklasifikasi",
    ditolak: "Ditolak",
    ditugaskan: "Ditugaskan",
    diproses: "Diproses",
    eskalasi: "Eskalasi",
    terselesaikan: "Terselesaikan",
    ditutup: "Ditutup",
  };
  return statusMap[status] || "Baru";
};

export default function HelpdeskPetugasDetailPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const service = location.pathname.includes("/sarpras") ? "sarpras" : "tik";
  const { ticketId } = useParams<{ ticketId: string }>();

  const [currentTicket, setCurrentTicket] = useState<ApiTicket | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [isHandleModalOpen, setIsHandleModalOpen] = useState(false);
  const [isEscalationModalOpen, setIsEscalationModalOpen] = useState(false);

  type AlertVariant = "success" | "error";
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const [alertVariant, setAlertVariant] = useState<AlertVariant>("success");

  const showAlertMessage = (message: string, variant: AlertVariant = "success") => {
    setAlertMessage(message);
    setAlertVariant(variant);
    setShowAlert(true);
    setTimeout(() => setShowAlert(false), 3000);
  };

  const fetchTicketDetail = async () => {
    if (!ticketId) return;
    try {
      setIsLoading(true);
      setError(null);
      const data = await getTicket(ticketId);
      setCurrentTicket(data);
    } catch (error) {
      console.error("Gagal mengambil detail tiket:", error);
      setCurrentTicket(null);
      setError(error instanceof Error ? error.message : "Gagal mengambil detail tiket.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTicketDetail();
  }, [ticketId]);

  const handleSaveHandling = async (data: HandleTicketFormData) => {
    try {
      const formData = new FormData();
      formData.append("status", data.status);
      formData.append("notes", data.notes);
      formData.append("started_at", data.startedAt);
      formData.append("completed_at", data.completedAt);
      if (data.photo) formData.append("result_photo", data.photo);

      const token =
        localStorage.getItem("simple-plan-token") || sessionStorage.getItem("simple-plan-token");
      const res = await fetch(`/api/v1/tickets/${ticketId}/handlings`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      if (!res.ok) throw new Error("Gagal menyimpan penanganan tiket");

      showAlertMessage("Penanganan tiket berhasil disimpan.", "success");
      setIsHandleModalOpen(false);
      fetchTicketDetail();
    } catch (err: any) {
      showAlertMessage(err.message, "error");
    }
  };

  const handleSaveEscalation = async (data: EscalationFormData) => {
    try {
      const token =
        localStorage.getItem("simple-plan-token") || sessionStorage.getItem("simple-plan-token");
      const res = await fetch(`/api/v1/tickets/${ticketId}/escalate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ target: data.destination, notes: data.notes }),
      });

      if (!res.ok) throw new Error("Gagal mengekalasi tiket");

      showAlertMessage("Tiket berhasil dieskalasikan.", "success");
      setIsEscalationModalOpen(false);
      fetchTicketDetail();
    } catch (err: any) {
      showAlertMessage(err.message, "error");
    }
  };

  if (!ticketId) return <div className="p-6 text-center">ID Tiket Tidak Ditemukan</div>;
  if (isLoading) return <div className="p-6 text-center">Memuat detail tiket...</div>;
  if (!currentTicket)
    return <div className="p-6 text-center">{error ?? "Tiket Tidak Ditemukan"}</div>;

  const properStatus = mapStatusToProperCase(currentTicket.status) as any;
  const priority = currentTicket.priority
    ? ((currentTicket.priority.charAt(0).toUpperCase() + currentTicket.priority.slice(1)) as any)
    : null;

  const canAction =
    currentTicket.status === "baru" ||
    currentTicket.status === "ditugaskan" ||
    currentTicket.status === "diproses";

  const attachment = currentTicket.initial_evidence
    ? {
        id: currentTicket.initial_evidence.object_key,
        name: currentTicket.initial_evidence.original_name,
        size: formatFileSize(currentTicket.initial_evidence.size),
        url: currentTicket.initial_evidence.object_key.startsWith("http")
          ? currentTicket.initial_evidence.object_key
          : `/storage/${currentTicket.initial_evidence.object_key}`,
      }
    : null;

  return (
    <div className="flex min-h-[calc(100vh-64px)] flex-col bg-slate-50 p-4 dark:bg-[#0f172a] sm:p-6 lg:p-8">
      {showAlert && (
        <div className="fixed left-1/2 top-4 z-[9999] w-[90%] max-w-md -translate-x-1/2 transform transition-all duration-300">
          <Alert
            variant={alertVariant}
            message={alertMessage}
            onClose={() => setShowAlert(false)}
          />
        </div>
      )}

      {/* HEADER: Title & Actions */}
      <div className="mb-6 flex flex-col gap-4 border-b border-slate-200 pb-4 dark:border-slate-800 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate(`/petugas/${service}/helpdesk`)}
            className="flex h-8 w-8 items-center justify-center rounded-md border border-slate-200 bg-white text-text-secondary transition-colors hover:bg-slate-50 hover:text-text-title dark:border-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>

          <h1 className="text-lg font-bold text-text-title md:text-xl">
            Ticket #{currentTicket.ticket_number}
          </h1>

          <div className="hidden items-center gap-2 md:flex">
            <TicketStatusBadge status={properStatus} />
            {priority && <TicketPriorityBadge priority={priority} />}
          </div>
        </div>

        {canAction && (
          <div className="flex items-center gap-2">
            <Button
              label="Eskalasi"
              variant="secondary"
              className="!bg-[#0f172a] !text-white hover:!bg-slate-800 dark:!bg-slate-800 dark:hover:!bg-slate-700 border-none"
              onClick={() => setIsEscalationModalOpen(true)}
            />
            <Button
              label="Tangani Tiket"
              variant="primary"
              onClick={() => setIsHandleModalOpen(true)}
            />
          </div>
        )}
      </div>

      <div className="flex flex-col gap-6 lg:flex-row lg:items-start">
        {/* LEFT COLUMN: Data Cards */}
        <div className="flex-1 space-y-6">
          {/* Card: Informasi Pelapor */}
          <div className="rounded-xl border border-slate-100 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-[#1e293b]">
            <div className="mb-4 flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-slate-500" />
              <h2 className="text-sm font-bold text-text-title">Informasi Pelapor</h2>
            </div>
            <div className="grid grid-cols-1 gap-y-4 border-t border-slate-100 pt-4 dark:border-slate-800 sm:grid-cols-2">
              <div>
                <p className="text-xs text-text-secondary">Nama Pelapor</p>
                <p className="mt-0.5 text-sm font-semibold text-text-title">
                  {currentTicket.reporter.name}
                </p>
              </div>
              <div>
                <p className="text-xs text-text-secondary">Unit Pelapor</p>
                <p className="mt-0.5 text-sm font-semibold text-text-title">
                  {currentTicket.unit.name}
                </p>
              </div>
              <div className="sm:col-span-2">
                <div className="inline-flex items-center gap-2 rounded-lg bg-slate-50 px-3 py-1.5 dark:bg-slate-800/50">
                  <span className="text-xs text-text-secondary">Dibuat pada</span>
                  <div className="flex items-center gap-1.5 border-l border-slate-200 pl-2 dark:border-slate-700">
                    <Calendar className="h-3.5 w-3.5 text-slate-500" />
                    <span className="text-xs font-medium text-text-title">
                      {formatDateTime(currentTicket.created_at)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Card: Deskripsi */}
          <div className="rounded-xl border border-slate-100 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-[#1e293b]">
            <div className="mb-4 flex items-center gap-2">
              <FileText className="h-4 w-4 text-slate-500" />
              <h2 className="text-sm font-bold text-text-title">Deskripsi</h2>
            </div>

            <div className="border-t border-slate-100 pt-4 dark:border-slate-800">
              <p className="text-xs text-text-secondary mb-2">Deskripsi Masalah</p>
              <div className="rounded-lg bg-slate-50 p-4 text-sm text-slate-700 dark:bg-slate-800/50 dark:text-slate-300">
                {currentTicket.description}
              </div>

              {attachment && (
                <div className="mt-4">
                  <p className="text-xs text-text-secondary mb-2">Foto Bukti Awal</p>
                  <div className="flex items-center justify-between rounded-lg border border-slate-200 p-3 dark:border-slate-700">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400">
                        <ImageIcon className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-text-title">{attachment.name}</p>
                        <p className="text-xs text-text-secondary">{attachment.size}</p>
                      </div>
                    </div>
                    <a
                      href={attachment.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium text-blue-600 transition-colors hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-500/10"
                    >
                      <Download className="h-4 w-4" />
                      Unduh
                    </a>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Card: Klasifikasi Tiket TIK (if TIK service and details exist) */}
          {service === "tik" && currentTicket.tik_detail && (
            <div className="rounded-xl border border-slate-100 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-[#1e293b]">
              <div className="mb-4 flex items-center gap-2">
                <Tag className="h-4 w-4 text-slate-500" />
                <h2 className="text-sm font-bold text-text-title">Klasifikasi Tiket TIK</h2>
              </div>
              <div className="grid grid-cols-1 gap-y-4 border-t border-slate-100 pt-4 dark:border-slate-800 sm:grid-cols-2">
                <div>
                  <p className="text-xs text-text-secondary">Kategori Mutu</p>
                  <p className="mt-0.5 text-sm font-semibold text-text-title">
                    {currentTicket.tik_detail.quality_category?.name || "-"}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-text-secondary">Tags IT</p>
                  <p className="mt-0.5 text-sm font-semibold text-text-title">
                    {currentTicket.tik_detail.it_tag?.name ||
                      currentTicket.tik_detail.custom_it_tag_text ||
                      "-"}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Card: Tingkat Prioritas */}
          <div className="rounded-xl border border-slate-100 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-[#1e293b]">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-bold text-text-title">Tingkat Prioritas</h2>
              {/* Optional SLA badge here */}
            </div>
            <div className="border-t border-slate-100 pt-4 dark:border-slate-800 flex items-center gap-3">
              <div className="h-2 w-2 rounded-full bg-red-500"></div>
              <div>
                <p className="text-sm font-bold text-text-title">{priority || "-"}</p>
                <p className="text-xs text-text-secondary">Batas waktu penanganan maksimal 2 jam</p>
              </div>
            </div>
          </div>

          {/* Card: Petugas */}
          <div className="rounded-xl border border-slate-100 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-[#1e293b]">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <UserCheck className="h-4 w-4 text-slate-500" />
                <h2 className="text-sm font-bold text-text-title">Petugas</h2>
              </div>
              <div className="rounded-md bg-emerald-50 px-2 py-1 text-[11px] font-semibold text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400">
                {currentTicket.assigned_officer ? "Ditugaskan" : "Belum Ditugaskan"}
              </div>
            </div>
            {currentTicket.assigned_officer ? (
              <div className="flex items-center gap-3 border-t border-slate-100 pt-4 dark:border-slate-800">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#0f172a] text-sm font-bold text-white">
                  {currentTicket.assigned_officer.name.substring(0, 2).toUpperCase()}
                </div>
                <div>
                  <p className="text-sm font-bold text-text-title">
                    {currentTicket.assigned_officer.name}
                  </p>
                  <p className="text-xs text-text-secondary">Petugas {service.toUpperCase()}</p>
                </div>
              </div>
            ) : (
              <div className="border-t border-slate-100 pt-4 text-sm text-text-secondary dark:border-slate-800">
                Belum ada petugas yang ditugaskan.
              </div>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: Riwayat Penanganan */}
        <div className="w-full lg:w-[360px] shrink-0">
          <div className="rounded-xl border border-slate-100 bg-white shadow-sm dark:border-slate-800 dark:bg-[#1e293b]">
            <div className="border-b border-slate-100 p-5 dark:border-slate-800/80">
              <h2 className="text-sm font-bold text-text-title">Riwayat Penanganan</h2>
            </div>
            <div className="p-5">
              <div className="space-y-6 relative before:absolute before:inset-0 before:ml-2 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-200 before:to-transparent">
                {currentTicket.status_histories?.map((h, index) => (
                  <TicketHistoryItem
                    key={h.id}
                    action={`Status ke ${mapStatusToProperCase(h.to_status as ApiTicket["status"])}`}
                    timestamp={formatHistoryDate(h.created_at)}
                    isLatest={index === 0}
                  >
                    {h.notes && (
                      <div className="mt-2 rounded-lg bg-slate-50 p-3 border border-slate-100 text-sm text-slate-700 shadow-sm dark:bg-slate-800/50 dark:border-slate-700 dark:text-slate-300">
                        <p className="font-medium text-slate-900 mb-1 dark:text-slate-100">
                          Catatan:
                        </p>
                        <p className="whitespace-pre-wrap">{h.notes}</p>
                      </div>
                    )}
                  </TicketHistoryItem>
                )) || (
                  <TicketHistoryItem
                    action="Tiket Dibuat"
                    timestamp={formatHistoryDate(currentTicket.created_at)}
                    isLatest={true}
                  />
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* MODALS */}
      <HandleTicketModal
        isOpen={isHandleModalOpen}
        onClose={() => setIsHandleModalOpen(false)}
        onSave={handleSaveHandling}
      />
      <EscalationModal
        isOpen={isEscalationModalOpen}
        onClose={() => setIsEscalationModalOpen(false)}
        onSave={handleSaveEscalation}
      />
    </div>
  );
}
