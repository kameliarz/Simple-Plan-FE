import React, { useState } from "react";
import { ArrowLeft, User, Calendar, Clock, X, Check, ChevronDown } from "lucide-react";
import type { TicketItem } from "../types/helpdesk";
import { RejectTicketModal } from "../components/RejectTicketModal";
import Badge from "../../../components/ui/Badge";
import InfoCard from "../../../components/ui/InfoCard";
import AttachmentCard from "../../../components/ui/AttachmentCard";
import Timeline, { type TimelineEntry } from "../../../components/ui/Timeline";
import Button from "../../../components/ui/Button";
import { AssignPetugasModal } from "../components/AssignPetugasModal";
import { ValidationModal } from "../components/ValidationModal";
import { UpdateStatusModal } from "../components/UpdateStatusModal";
import { EskalasiModal } from "../components/EskalasiModal";
import { TolakPenyelesaianModal } from "../components/TolakPenyelesaianModal";
import { SuccessModal } from "../components/SuccessModal";
import { Circle, CheckCircle2 } from "lucide-react";

interface DesktopHelpdeskDetailPageProps {
  ticket: TicketItem;
  onBack: () => void;
  onStatusChange?: (ticketId: string, newStatus: TicketItem["status"]) => void;
}

export const DesktopHelpdeskDetailPage: React.FC<DesktopHelpdeskDetailPageProps> = ({
  ticket,
  onBack,
  onStatusChange,
}) => {
  const [currentTicket, setCurrentTicket] = useState<TicketItem>(ticket);
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [showAlert, setShowAlert] = useState(ticket.status === "Ditolak");
  const [showSuccessAlert, setShowSuccessAlert] = useState<string | null>(null);
  const [showErrorAlert, setShowErrorAlert] = useState<string | null>(null);
  const [isUpdateStatusModalOpen, setIsUpdateStatusModalOpen] = useState(false);
  const [isEskalasiModalOpen, setIsEskalasiModalOpen] = useState(false);
  const [isTolakModalOpen, setIsTolakModalOpen] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  
  // Assign Tugas States
  const [priority, setPriority] = useState<string | null>(null);
  const [assignedPetugas, setAssignedPetugas] = useState<{ id?: string; name: string; role: string; initials: string; } | null>(null);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [isValidationModalOpen, setIsValidationModalOpen] = useState(false);
  const [isClassifying, setIsClassifying] = useState(false);
  const [selectedKategori, setSelectedKategori] = useState("");
  const [showKategoriError, setShowKategoriError] = useState(false);

  const [validationError, setValidationError] = useState<{priority?: string, petugas?: string}>({});

  const handleConfirmReject = (reason: string) => {
    setIsRejectModalOpen(false);
    const updatedHistory = [
      {
        id: `log-${Date.now()}`,
        action: `Tiket Ditolak: ${reason}`,
        timestamp: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: 'short' }),
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
    setShowAlert(true);
    onStatusChange?.(currentTicket.id, "Ditolak");
  };

  const handleVerify = () => {
    const updatedHistory = [
      {
        id: `log-${Date.now()}`,
        action: `Tiket diklasifikasi`,
        timestamp: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: 'short' }),
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
    setShowSuccessAlert("Tiket Berhasil Diklasifikasikan");
    onStatusChange?.(currentTicket.id, "Diklasifikasi");
  };

  const handleSimpan = () => {
    const errors: {priority?: string, petugas?: string} = {};
    if (!priority) errors.priority = "Tingkat prioritas wajib dipilih!";
    if (!assignedPetugas) errors.petugas = "Petugas wajib dipilih!";
    
    if (Object.keys(errors).length > 0) {
      setValidationError(errors);
      if (errors.petugas) {
        setShowErrorAlert(errors.petugas);
      }
      return;
    }
    
    setValidationError({});
    setShowErrorAlert(null);

    const formattedPriority = priority!.charAt(0).toUpperCase() + priority!.slice(1);
    const updatedHistory = [
      {
        id: `log-${Date.now()}-2`,
        action: `Pengerjaan Teknisi`,
        timestamp: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: 'short' }),
        isCompleted: false,
      },
      {
        id: `log-${Date.now()}-1`,
        action: `Petugas Ditugaskan`,
        timestamp: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: 'short' }),
        isCompleted: true,
      },
      ...(currentTicket.history || []),
    ];

    const updatedTicket: TicketItem = {
      ...currentTicket,
      status: "Diproses",
      assignee: {
        name: assignedPetugas!.name,
        role: assignedPetugas!.role,
        avatarInitials: assignedPetugas!.initials
      },
      priority: formattedPriority as TicketItem["priority"],
      history: updatedHistory,
    };

    setCurrentTicket(updatedTicket);
    setShowSuccessAlert("Prioritas dan Petugas berhasil disimpan");
    onStatusChange?.(currentTicket.id, "Diproses");
  };

  const handleUpdateStatus = (data: { status: string; startTime?: string; endTime?: string; notes: string; photo?: any }) => {
    setIsUpdateStatusModalOpen(false);
    
    const validStatus = data.status as TicketItem["status"];
    // Update history
    const updatedHistory = [
      {
        id: `log-${Date.now()}`,
        action: validStatus === "Terselesaikan" ? "Penanganan Selesai" : `Status diubah menjadi ${validStatus}`,
        timestamp: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: 'short' }),
        isCompleted: true,
      },
      ...(currentTicket.history || []),
    ];
    
    const updatedTicket: TicketItem = {
      ...currentTicket,
      status: validStatus,
      resolutionNotes: data.notes,
      resolutionAttachments: data.photo ? [
        {
          id: `att-${Date.now()}`,
          name: "foto_perbaikan.jpg",
          size: "1.2 MB",
          url: data.photo
        }
      ] : undefined,
      history: updatedHistory,
    };
    
    setCurrentTicket(updatedTicket);
    setShowSuccessAlert("Status tiket berhasil diperbarui");
    onStatusChange?.(currentTicket.id, validStatus);
  };

  const handleEskalasi = (data: { tujuan: string; catatan: string }) => {
    setIsEskalasiModalOpen(false);
    
    const updatedHistory = [
      {
        id: `log-${Date.now()}`,
        action: `Eskalasi ke ${data.tujuan}`,
        timestamp: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: 'short' }),
        isCompleted: true,
      },
      ...(currentTicket.history || []),
    ];
    
    const updatedTicket: TicketItem = {
      ...currentTicket,
      status: "Eskalasi",
      history: updatedHistory,
    };
    
    setCurrentTicket(updatedTicket);
    setShowSuccessAlert("Tiket berhasil dieskalasikan");
    onStatusChange?.(currentTicket.id, "Eskalasi");
  };

  const handleTolakPenyelesaian = (_data: { keterangan: string }) => {
    setIsTolakModalOpen(false);
    
    const updatedHistory = [
      {
        id: `log-${Date.now()}`,
        action: `Pengerjaan ulang oleh teknisi`,
        timestamp: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: 'short' }),
        isCompleted: true,
      },
      ...(currentTicket.history || []),
    ];
    
    const updatedTicket: TicketItem = {
      ...currentTicket,
      status: "Diproses",
      history: updatedHistory,
      // We keep resolutionNotes to show it was resolved before.
    };
    
    setCurrentTicket(updatedTicket);
    setShowSuccessAlert("Status tiket dikembalikan menjadi Diproses");
    onStatusChange?.(currentTicket.id, "Diproses");
  };

  const handleSetujui = () => {
    // Logic for approving resolution (maybe changing state to Closed, or just show success)
    setShowSuccessAlert("Penyelesaian tiket disetujui");
  };

  const isRejected = currentTicket.status === "Ditolak";
  const isDiklasifikasi = currentTicket.status === "Diklasifikasi";
  const isDiproses = currentTicket.status === "Diproses";
  const isTerselesaikan = currentTicket.status === "Terselesaikan";

  const timelineItems: TimelineEntry[] = (currentTicket.history || []).map((log) => {
    let variant: TimelineEntry["variant"] = "default";
    if (log.action.toLowerCase().includes("ditolak")) variant = "danger";
    else if (log.action.toLowerCase().includes("pengerjaan")) variant = "primary";
    else if (log.action.toLowerCase().includes("ditugaskan")) variant = "warning";
    else if (log.action.toLowerCase().includes("verifikasi")) variant = "warning";
    else if (log.action.toLowerCase().includes("terselesaikan")) variant = "success";
    
    return {
      id: log.id,
      timestamp: log.timestamp,
      action: log.action,
      isCompleted: log.isCompleted,
      variant,
    };
  });

  return (
    <div className="w-full flex flex-col min-h-0 relative">
      {/* Scrollable Container */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        
        {/* Breadcrumb / Alert Area */}
        <div className="max-w-[1200px] mx-auto space-y-4">
          
          {/* Top Alert */}
          {showAlert && isRejected && (
            <div className="bg-rose-50 border border-rose-200 text-rose-600 dark:bg-rose-950/30 dark:border-rose-900/50 dark:text-rose-400 px-4 py-3 rounded-lg flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm font-medium">
                <div className="w-5 h-5 rounded-full bg-rose-100 dark:bg-rose-900/50 flex items-center justify-center">
                  <Check className="w-3.5 h-3.5" />
                </div>
                Tiket ditolak!
              </div>
              <button onClick={() => setShowAlert(false)} className="text-rose-500 hover:text-rose-700 dark:hover:text-rose-300">
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Top Alert for Success */}
          {showSuccessAlert && (
            <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 dark:bg-emerald-950/30 dark:border-emerald-900/50 dark:text-emerald-500 px-4 py-3 rounded-lg flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm font-medium">
                <div className="w-5 h-5 rounded-full bg-emerald-200/50 dark:bg-emerald-900/50 flex items-center justify-center">
                  <Check className="w-3.5 h-3.5" />
                </div>
                {showSuccessAlert}
              </div>
              <button onClick={() => setShowSuccessAlert(null)} className="text-emerald-500 hover:text-emerald-700 dark:hover:text-emerald-300">
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Top Alert for Error */}
          {showErrorAlert && (
            <div className="bg-rose-50 border border-rose-200 text-rose-600 dark:bg-rose-950/30 dark:border-rose-900/50 dark:text-rose-400 px-4 py-3 rounded-lg flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm font-medium">
                <div className="w-5 h-5 rounded-full bg-rose-200/50 dark:bg-rose-900/50 flex items-center justify-center">
                  <span className="w-3.5 h-3.5 flex items-center justify-center text-xs font-bold">!</span>
                </div>
                {showErrorAlert}
              </div>
              <button onClick={() => setShowErrorAlert(null)} className="text-rose-500 hover:text-rose-700 dark:hover:text-rose-300">
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Sub Header */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm">
            <div className="flex items-center gap-4">
              <button
                type="button"
                onClick={onBack}
                className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 transition cursor-pointer"
                title="Kembali ke Daftar"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div className="flex items-center gap-3">
                <h1 className="text-base font-semibold text-slate-800 dark:text-slate-100">
                  Ticket #{currentTicket.code}
                </h1>
                {isRejected ? (
                  <Badge variant="danger" dot>Ditolak</Badge>
                ) : isTerselesaikan ? (
                  <Badge variant="success" dot>Terselesaikan</Badge>
                ) : isDiproses ? (
                  <Badge variant="primary" dot>Diproses</Badge>
                ) : isDiklasifikasi ? (
                  <Badge variant="warning" dot>Diklasifikasi</Badge>
                ) : (
                  <Badge variant="default" dot className="bg-white border-slate-300 text-slate-600 dark:bg-slate-800 dark:border-slate-700">{currentTicket.status}</Badge>
                )}
                {isDiproses && currentTicket.priority && (
                  <span className="text-[11px] font-semibold text-rose-500 bg-rose-50 px-2 py-1 rounded ml-2">
                    Prioritas: {currentTicket.priority}
                  </span>
                )}
              </div>
            </div>
            
            {/* Header Actions */}
            {isDiproses && (
              <div className="flex items-center gap-3 mt-4 sm:mt-0">
                <button onClick={() => setIsEskalasiModalOpen(true)} className="px-5 py-2 rounded-xl text-sm font-semibold bg-[#1e3a8a] text-white transition hover:bg-[#1e3a8a]/90">
                  Eskalasi
                </button>
                <button onClick={() => setIsUpdateStatusModalOpen(true)} className="px-5 py-2 rounded-xl text-sm font-semibold bg-[#1e3a8a] text-white transition hover:bg-[#1e3a8a]/90">
                  Tangani Tiket
                </button>
              </div>
            )}
          </div>
          
          {/* Main Content Layout */}
          <div className="flex flex-col lg:flex-row gap-6">
            
            {/* Left Column */}
            <div className="flex-1 space-y-6">
              {/* Informasi Pelapor & Kategori */}
              <InfoCard title="Informasi Pelapor" icon={<i className="w-4 h-4 text-slate-500 rounded-full border border-slate-400 flex items-center justify-center text-[10px] italic">i</i>}>
                <div className="grid grid-cols-2 gap-y-6 gap-x-4 mt-2">
                  <div className="space-y-1">
                    <div className="text-xs text-slate-400">Nama Pelapor</div>
                    <div className="text-sm font-semibold text-slate-700 dark:text-slate-200">{currentTicket.reporter.name}</div>
                  </div>
                  <div className="space-y-1">
                    <div className="text-xs text-slate-400">Unit Pelapor</div>
                    <div className="text-sm font-semibold text-slate-700 dark:text-slate-200">{currentTicket.reporter.unit}</div>
                  </div>
                  
                  <div className="col-span-2 my-2 border-t border-slate-100 dark:border-slate-800" />
                  
                  <div className="space-y-1">
                    <div className="text-xs text-slate-400">Kategori Sarpras</div>
                    <div className="text-sm font-semibold text-slate-700 dark:text-slate-200">{currentTicket.category}</div>
                  </div>
                  <div className="space-y-1">
                    <div className="text-xs text-slate-400">Dibuat pada</div>
                    <div className="flex items-center gap-2 border border-slate-200 dark:border-slate-700 rounded-md px-3 py-1.5 w-max bg-slate-50/50 dark:bg-slate-800/50 text-xs text-slate-600 dark:text-slate-300 font-medium">
                      <Calendar className="w-4 h-4 text-slate-400" />
                      {currentTicket.createdAt}
                    </div>
                  </div>
                </div>
              </InfoCard>

              {currentTicket.inventaris && (
                <InfoCard title="Data Inventaris" icon={<div className="w-4 h-4 flex items-center justify-center"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-slate-500"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect><line x1="8" y1="21" x2="16" y2="21"></line><line x1="12" y1="17" x2="12" y2="21"></line></svg></div>}>
                  <div className="grid grid-cols-2 gap-y-6 gap-x-4 mt-2">
                    <div className="space-y-1">
                      <div className="text-xs text-slate-400">No. Inventaris</div>
                      <div className="text-sm font-semibold text-slate-700 dark:text-slate-200">{currentTicket.inventaris.no}</div>
                    </div>
                    <div className="space-y-1">
                      <div className="text-xs text-slate-400">Nama Inventaris</div>
                      <div className="text-sm font-semibold text-slate-700 dark:text-slate-200">{currentTicket.inventaris.name}</div>
                    </div>
                    <div className="space-y-1">
                      <div className="text-xs text-slate-400">Merk Inventaris</div>
                      <div className="text-sm font-semibold text-slate-700 dark:text-slate-200">{currentTicket.inventaris.merk}</div>
                    </div>
                    <div className="space-y-1">
                      <div className="text-xs text-slate-400">Unit Inventaris</div>
                      <div className="text-sm font-semibold text-slate-700 dark:text-slate-200">{currentTicket.inventaris.unit}</div>
                    </div>
                    <div className="space-y-1 col-span-2">
                      <div className="text-xs text-slate-400">Lokasi Inventaris</div>
                      <div className="text-sm font-semibold text-slate-700 dark:text-slate-200">{currentTicket.inventaris.lokasi}</div>
                    </div>
                  </div>
                </InfoCard>
              )}

              {/* Deskripsi & Lampiran */}
              <InfoCard title="Deskripsi" icon={<div className="w-4 h-4 flex items-center justify-center"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-slate-500"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg></div>}>
                <div className="mt-4 space-y-4">
                  <div>
                    <div className="text-xs text-slate-400 mb-2">Deskripsi Masalah</div>
                    <div className="bg-slate-50 dark:bg-slate-800/50 rounded-lg p-4 border border-slate-100 dark:border-slate-700">
                      <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                        {currentTicket.description}
                      </p>
                    </div>
                  </div>

                  {/* Foto Bukti Awal */}
                  {currentTicket.attachments && currentTicket.attachments.length > 0 && (
                    <div>
                      <div className="text-xs text-slate-400 mb-2">Foto Bukti Awal</div>
                      <div className="flex gap-4">
                        {currentTicket.attachments.map((att) => (
                          <div key={att.id} className="w-full">
                            <AttachmentCard name={att.name} size={att.size} url={att.url} />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </InfoCard>

              {/* Klasifikasi Tiket Sarpras Read-only View */}
              {(isDiklasifikasi || isDiproses || isTerselesaikan) && (
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-6 shadow-sm">
                  <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 mb-4">Klasifikasi Tiket Sarpras</h3>
                  <div className="space-y-1">
                    <div className="text-xs text-slate-400">Kategori Sarpras</div>
                    <div className="text-sm font-semibold text-slate-700 dark:text-slate-200">{currentTicket.category}</div>
                  </div>
                </div>
              )}

              {/* Verified Sections: Priority & Assign */}
              {(isDiklasifikasi || isDiproses || isTerselesaikan) && (
                <>
                  {/* Tingkat Prioritas */}
                  <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-6 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100">
                        Tingkat Prioritas<span className="text-rose-500">*</span>
                      </h3>
                      {!isDiproses && !isTerselesaikan ? (
                        <span className="text-[11px] text-slate-400">Tentukan SLA penanganan</span>
                      ) : currentTicket.resolutionNotes ? (
                        <span className="text-[11px] font-semibold text-emerald-600 border border-emerald-200 bg-emerald-50 dark:bg-emerald-900/30 dark:border-emerald-800/50 px-2 py-1 rounded">SLA Terpenuhi</span>
                      ) : (
                        <span className="text-[11px] font-semibold text-rose-500 border border-rose-200 bg-white dark:bg-rose-950/30 dark:border-rose-900/50 px-2 py-1 rounded">Batas 2 jam</span>
                      )}
                    </div>
                    
                    {!isDiproses && !isTerselesaikan ? (
                      <div className="space-y-3">
                        {[
                          { id: 'critical', label: 'Critical', sla: '< 2 Jam', variant: 'rose' },
                          { id: 'high', label: 'High', sla: '< 4 Jam', variant: 'slate' },
                          { id: 'medium', label: 'Medium', sla: '< 1 Hari', variant: 'slate' },
                          { id: 'low', label: 'Low', sla: '< 3 Hari', variant: 'slate' },
                        ].map((item) => {
                          const isSelected = priority === item.id;
                          return (
                            <div 
                              key={item.id}
                              onClick={() => {
                                setPriority(item.id);
                                setValidationError(prev => ({ ...prev, priority: undefined }));
                              }}
                              className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-all ${
                                isSelected ? 'border-blue-500 bg-blue-50/30 dark:bg-blue-900/10' : 'border-slate-200 dark:border-slate-700 hover:border-blue-300'
                              }`}
                            >
                              <div className="flex items-center gap-3">
                                {isSelected ? (
                                  <CheckCircle2 className="w-5 h-5 fill-blue-600 text-white dark:fill-blue-500" />
                                ) : (
                                  <Circle className="w-5 h-5 text-slate-300 dark:text-slate-600" />
                                )}
                                <span className="text-sm font-medium text-slate-700 dark:text-slate-200">{item.label}</span>
                              </div>
                              <div className={`px-2 py-1 rounded text-xs font-semibold ${item.variant === 'rose' ? 'bg-rose-50 text-rose-500' : 'bg-slate-50 text-slate-500 dark:bg-slate-800 dark:text-slate-400'}`}>
                                {item.sla}
                              </div>
                            </div>
                          );
                        })}
                        {validationError.priority && (
                          <p className="text-xs text-rose-500 flex items-center pt-2">
                            <span className="w-3.5 h-3.5 rounded-full border border-rose-500 flex items-center justify-center mr-1">!</span>
                            {validationError.priority}
                          </p>
                        )}
                      </div>
                    ) : (
                      <div className="flex items-center gap-3 mt-4">
                        <div className="w-2 h-2 rounded-full bg-rose-500" />
                        <div>
                          <p className="text-sm font-bold text-slate-800 dark:text-slate-100">
                            {currentTicket.priority}
                          </p>
                          <p className="text-[11px] text-slate-500 mt-1">Batas waktu penanganan maksimal 2 jam</p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Petugas */}
                  <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-6 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                        <User className="w-4 h-4 text-slate-500" />
                        <span>Petugas<span className="text-rose-500">*</span></span>
                      </h3>
                      {(isDiproses || isTerselesaikan) && (
                        <span className="text-xs font-semibold text-emerald-500 bg-emerald-50 border border-emerald-200 dark:bg-emerald-950/30 dark:border-emerald-900/50 px-2 py-1 rounded">Ditugaskan</span>
                      )}
                    </div>
                    
                    {!isDiproses && !isTerselesaikan ? (
                      assignedPetugas ? (
                        <div className="flex items-center justify-between p-3 border border-slate-200 dark:border-slate-700 rounded-lg">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-[#003178] text-white flex items-center justify-center font-bold text-sm">
                              {assignedPetugas.initials}
                            </div>
                            <div>
                              <p className="text-sm font-bold text-slate-800 dark:text-slate-100">{assignedPetugas.name}</p>
                              <p className="text-[11px] text-slate-500">{assignedPetugas.role}</p>
                            </div>
                          </div>
                          <Button variant="outline" className="px-3 py-1.5 text-xs" onClick={() => setIsAssignModalOpen(true)}>
                            Ubah
                          </Button>
                        </div>
                      ) : (
                        <button onClick={() => setIsAssignModalOpen(true)} className="w-full py-2.5 rounded-full bg-[#1e3a8a] hover:bg-[#1e3a8a]/90 text-white font-semibold text-sm transition shadow-sm">
                          + Assign Petugas
                        </button>
                      )
                    ) : (
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-[#003178] text-white flex items-center justify-center font-bold text-sm">
                          {currentTicket.assignee?.avatarInitials}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-slate-800 dark:text-slate-100">{currentTicket.assignee?.name}</p>
                          <p className="text-[11px] text-slate-500">{currentTicket.assignee?.role}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </>
              )}
              {/* Klasifikasi Tiket Sarpras Section */}
              {isClassifying && currentTicket.status === "Baru" && (
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-6 shadow-sm">
                  <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 mb-4">Klasifikasi Tiket Sarpras</h3>
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                      Kategori Sarpras<span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <select 
                        value={selectedKategori}
                        onChange={(e) => {
                          setSelectedKategori(e.target.value);
                          setShowKategoriError(false);
                        }}
                        className={`w-full appearance-none bg-white dark:bg-slate-900 border ${showKategoriError ? 'border-rose-500' : 'border-slate-200 dark:border-slate-700'} rounded-lg px-4 py-2.5 text-sm text-slate-700 dark:text-slate-200 focus:outline-none focus:border-blue-500`}
                      >
                        <option value="" disabled>Pilih kategori sarpras</option>
                        <option value="Elektronik">Elektronik</option>
                        <option value="Non Elektronik">Non Elektronik</option>
                      </select>
                      <div className="absolute inset-y-0 right-0 flex items-center px-4 pointer-events-none text-slate-400">
                        <ChevronDown className="w-4 h-4" />
                      </div>
                    </div>
                    {showKategoriError && (
                      <p className="text-xs text-rose-500 flex items-center mt-1">
                        <span className="w-3.5 h-3.5 rounded-full border border-rose-500 flex items-center justify-center mr-1">!</span>
                        Kategori sarpras wajib diisi!
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* Bottom Action Area inside Left Column */}
              {currentTicket.status === "Baru" && (
                <div className="flex justify-end gap-3 pt-2">
                  {!isClassifying ? (
                    <>
                      <button 
                        onClick={() => setIsRejectModalOpen(true)}
                        className="h-[46px] px-4 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 flex items-center gap-2 transition"
                      >
                        <X className="w-4 h-4 text-slate-500" />
                        <div className="text-left text-sm font-semibold leading-tight">
                          <div>Tolak</div>
                          <div>Tiket</div>
                        </div>
                      </button>
                      <button 
                        onClick={() => setIsClassifying(true)}
                        className="h-[46px] px-8 rounded-xl bg-[#1e3a8a] hover:bg-[#1e3a8a]/90 text-white font-semibold text-sm transition shadow-sm"
                      >
                        Klasifikasikan
                      </button>
                    </>
                  ) : (
                    <>
                      <button 
                        onClick={() => { setIsClassifying(false); setShowKategoriError(false); }}
                        className="h-[42px] px-8 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 font-semibold text-sm transition"
                      >
                        Batal
                      </button>
                      <button 
                        onClick={() => {
                          if (!selectedKategori) {
                            setShowKategoriError(true);
                          } else {
                            // Submit logic
                            setIsClassifying(false);
                            handleVerify(); // This progresses to the next status
                          }
                        }}
                        className="h-[42px] px-8 rounded-xl bg-[#1e3a8a] hover:bg-[#1e3a8a]/90 text-white font-semibold text-sm transition shadow-sm"
                      >
                        Simpan
                      </button>
                    </>
                  )}
                </div>
              )}

              {/* Action Area for Diklasifikasi State */}
              {isDiklasifikasi && (
                <div className="flex justify-end gap-3 pt-4">
                  <button onClick={() => { /* Handle Batal */ }} className="h-[42px] px-8 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 font-semibold text-sm transition">
                    Batal
                  </button>
                  <button onClick={handleSimpan} className="h-[42px] px-8 rounded-xl bg-[#1e3a8a] hover:bg-[#1e3a8a]/90 text-white font-semibold text-sm transition shadow-sm">
                    Simpan
                  </button>
                </div>
              )}

              {/* Action Area for Terselesaikan State */}
              {isTerselesaikan && (
                <div className="flex flex-col sm:flex-row justify-between sm:justify-end gap-3 pt-6 border-t border-slate-200 dark:border-slate-800 mt-4">
                  <button 
                    onClick={() => setIsTolakModalOpen(true)} 
                    className="h-[46px] px-6 sm:px-8 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 font-semibold text-sm transition flex items-center gap-2 justify-center"
                  >
                    <X className="w-4 h-4" /> Tolak Penyelesaian
                  </button>
                  <button 
                    onClick={handleSetujui} 
                    className="h-[46px] px-6 sm:px-8 rounded-xl bg-[#1e3a8a] hover:bg-[#1e3a8a]/90 text-white font-semibold text-sm transition shadow-sm text-center"
                  >
                    Setujui Penyelesaian
                  </button>
                </div>
              )}
            </div>

            {/* Right Column: Timeline */}
            <div className="w-full lg:w-[350px] space-y-6">
              <InfoCard title="Riwayat Penanganan" icon={<Clock className="w-4 h-4 text-slate-500" />}>
                <div className="mt-4">
                  <Timeline items={timelineItems} />
                </div>
              </InfoCard>

              {currentTicket.resolutionNotes && (
                <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-5 border border-slate-200 dark:border-slate-800">
                  <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Catatan Penanganan</h4>
                  <p className="text-sm text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-900 p-3 rounded-lg border border-slate-200 dark:border-slate-700 leading-relaxed">
                    {currentTicket.resolutionNotes}
                  </p>
                  
                  {currentTicket.resolutionAttachments && currentTicket.resolutionAttachments.length > 0 && (
                    <div className="mt-5">
                      <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Foto Bukti Hasil Perbaikan</h4>
                      <div className="space-y-3">
                        {currentTicket.resolutionAttachments.map(att => (
                          <div key={att.id || att.name} className="w-full">
                            <AttachmentCard name={att.name} size={att.size} url={att.url} />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Modal Tolak Tiket */}
      <RejectTicketModal
        isOpen={isRejectModalOpen}
        ticketCode={currentTicket.code}
        onClose={() => setIsRejectModalOpen(false)}
        onConfirmReject={handleConfirmReject}
      />

      {/* Modal Assign Petugas */}
      <AssignPetugasModal
        isOpen={isAssignModalOpen}
        onClose={() => setIsAssignModalOpen(false)}
        onAssign={setAssignedPetugas}
        selectedPetugasId={assignedPetugas?.id}
      />

      {/* Modal Validasi Belum Lengkap */}
      <ValidationModal
        isOpen={isValidationModalOpen}
        onClose={() => setIsValidationModalOpen(false)}
        message="Prioritas dan Petugas wajib dipilih."
      />

      {/* Modal Update Status */}
      <UpdateStatusModal
        isOpen={isUpdateStatusModalOpen}
        onClose={() => setIsUpdateStatusModalOpen(false)}
        onSubmit={handleUpdateStatus}
      />

      {/* Modal Eskalasi */}
      <EskalasiModal
        isOpen={isEskalasiModalOpen}
        onClose={() => setIsEskalasiModalOpen(false)}
        onSubmit={handleEskalasi}
      />

      {/* Modal Tolak Penyelesaian */}
      <TolakPenyelesaianModal
        isOpen={isTolakModalOpen}
        onClose={() => setIsTolakModalOpen(false)}
        onSubmit={handleTolakPenyelesaian}
      />

      {/* Modal Sukses Update Status */}
      <SuccessModal
        isOpen={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        title="Berhasil Diperbarui"
        message="Status dan riwayat perbaikan tiket berhasil diperbarui"
      />
    </div>
  );
};

export default DesktopHelpdeskDetailPage;
