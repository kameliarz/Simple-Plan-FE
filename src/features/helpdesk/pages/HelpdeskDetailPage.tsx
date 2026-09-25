import React, { useState } from "react";
import { ArrowLeft, Calendar, X, Check, ChevronDown } from "lucide-react";
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


interface HelpdeskDetailPageProps {
  ticket: TicketItem;
  onBack: () => void;
  onStatusChange?: (ticketId: string, newStatus: TicketItem["status"]) => void;
}

export const HelpdeskDetailPage: React.FC<HelpdeskDetailPageProps> = ({
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
        action: validStatus === "Terselesaikan" ? "Tiket Selesai" : `Status diubah menjadi ${validStatus}`,
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
    setShowSuccessAlert("Status dan riwayat perbaikan tiket berhasil diperbarui!");
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
    const updatedHistory = [
      {
        id: `log-${Date.now()}`,
        action: `Tiket Ditutup`,
        timestamp: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: 'short' }),
        isCompleted: true,
      },
      ...(currentTicket.history || []),
    ];
    
    const updatedTicket: TicketItem = {
      ...currentTicket,
      status: "Ditutup",
      history: updatedHistory,
    };
    
    setCurrentTicket(updatedTicket);
    setShowSuccessAlert("Tiket telah ditutup!");
    onStatusChange?.(currentTicket.id, "Ditutup");
  };

  const isRejected = currentTicket.status === "Ditolak";
  const isDiklasifikasi = currentTicket.status === "Diklasifikasi";
  const isDiproses = currentTicket.status === "Diproses";
  const isTerselesaikan = currentTicket.status === "Terselesaikan";
  const isDitutup = currentTicket.status === "Ditutup";

  const timelineItems: TimelineEntry[] = (currentTicket.history || []).map((log) => {
    let variant: TimelineEntry["variant"] = "default";
    if (log.action.toLowerCase().includes("ditolak")) variant = "danger";
    else if (log.action.toLowerCase().includes("ditutup")) variant = "warning";
    else if (log.action.toLowerCase().includes("pengerjaan ulang")) variant = "warning";
    else if (log.action.toLowerCase().includes("selesai")) variant = "success";
    
    return {
      id: log.id,
      timestamp: log.timestamp,
      action: log.action,
      isCompleted: log.isCompleted,
      variant,
    };
  });

  return (
    <div className="w-full flex flex-col min-h-screen bg-slate-50 dark:bg-slate-950 relative pb-24">
      {/* Top Alerts fixed to top */}
      <div className="fixed top-4 left-4 right-4 z-50 space-y-2 pointer-events-none">
        {showAlert && isRejected && (
          <div className="bg-rose-50 border border-rose-200 text-rose-600 dark:bg-rose-950/90 dark:border-rose-900/50 dark:text-rose-400 px-4 py-3 rounded-full flex items-center justify-between shadow-lg backdrop-blur-sm pointer-events-auto">
            <div className="flex items-center gap-2 text-sm font-medium">
              <div className="w-5 h-5 rounded-full bg-rose-100 dark:bg-rose-900/50 flex items-center justify-center">
                <Check className="w-3.5 h-3.5" />
              </div>
              Tiket ditolak!
            </div>
            <button onClick={() => setShowAlert(false)} className="text-rose-500 hover:text-rose-700">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}
        {showSuccessAlert && (
          <div className="bg-emerald-50 border border-emerald-100 text-emerald-800 dark:bg-emerald-950/90 dark:border-emerald-900/50 dark:text-emerald-500 px-4 py-3 rounded-full flex items-center justify-between shadow-[0_8px_30px_rgb(0,0,0,0.08)] backdrop-blur-sm pointer-events-auto">
            <div className="flex items-center gap-2 text-sm font-semibold">
              <div className="w-5 h-5 rounded-full bg-emerald-500 dark:bg-emerald-600 flex items-center justify-center text-white shrink-0">
                <Check className="w-3.5 h-3.5" strokeWidth={3} />
              </div>
              {showSuccessAlert}
            </div>
          </div>
        )}
        {showErrorAlert && (
          <div className="bg-rose-50 border border-rose-200 text-rose-600 dark:bg-rose-950/90 dark:border-rose-900/50 dark:text-rose-400 px-4 py-3 rounded-full flex items-center justify-between shadow-lg backdrop-blur-sm pointer-events-auto">
            <div className="flex items-center gap-2 text-sm font-medium">
              <div className="w-5 h-5 rounded-full bg-rose-200/50 dark:bg-rose-900/50 flex items-center justify-center text-xs font-bold">
                !
              </div>
              {showErrorAlert}
            </div>
            <button onClick={() => setShowErrorAlert(null)} className="text-rose-500 hover:text-rose-700">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      <div className="flex-1 overflow-y-auto px-4 pt-4 pb-8 space-y-4">
        {/* Header Area */}
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onBack}
              className="w-8 h-8 rounded-full bg-slate-900 dark:bg-slate-800 text-white flex items-center justify-center hover:bg-slate-800 transition cursor-pointer shadow-sm shrink-0"
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
          
          <div className="flex flex-wrap items-center gap-2">
            {isRejected ? (
              <Badge variant="danger" dot>Ditolak</Badge>
            ) : isTerselesaikan ? (
              <Badge variant="success" dot>Terselesaikan</Badge>
            ) : isDiproses ? (
              <Badge variant="primary" dot>Diproses</Badge>
            ) : isDiklasifikasi ? (
              <Badge variant="warning" dot>Diklasifikasi</Badge>
            ) : isDitutup ? (
              <Badge variant="default" className="bg-white border-slate-300 text-slate-600 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-300">Ditutup</Badge>
            ) : (
              <Badge variant="default" dot className="bg-white border-slate-300 text-slate-600 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-300">{currentTicket.status}</Badge>
            )}
            {isDiproses && currentTicket.priority && (
              <span className="text-[11px] font-semibold text-rose-500 border border-rose-200 bg-white dark:bg-rose-950/30 dark:border-rose-900/50 px-2 py-1 rounded-full">
                Prioritas: {currentTicket.priority}
              </span>
            )}
          </div>
        </div>

        <div className="space-y-4 pt-2">
          {/* Informasi Pelapor & Kategori */}
          <InfoCard title="Informasi Pelapor">
            <div className="grid grid-cols-1 gap-y-4 mt-2">
              <div className="space-y-1 bg-slate-50 dark:bg-slate-800/50 rounded-lg p-3">
                <div className="text-[11px] text-slate-400 font-medium">Nama Pelapor</div>
                <div className="text-xs font-semibold text-slate-700 dark:text-slate-200">{currentTicket.reporter.name}</div>
              </div>
              <div className="space-y-1 bg-slate-50 dark:bg-slate-800/50 rounded-lg p-3">
                <div className="text-[11px] text-slate-400 font-medium">Unit Pelapor</div>
                <div className="text-xs font-semibold text-slate-700 dark:text-slate-200">{currentTicket.reporter.unit}</div>
              </div>
              <div className="space-y-1 bg-slate-50 dark:bg-slate-800/50 rounded-lg p-3">
                <div className="text-[11px] text-slate-400 font-medium">Kategori Sarpras</div>
                <div className="text-xs font-semibold text-slate-700 dark:text-slate-200">{currentTicket.category}</div>
              </div>
              <div className="flex items-center gap-2 mt-1">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                <span className="text-[11px] text-slate-500">Dibuat Pada: <span className="font-semibold text-slate-700 dark:text-slate-300">{currentTicket.createdAt}</span></span>
              </div>
            </div>
          </InfoCard>

          {currentTicket.inventaris && (
            <InfoCard title="Data Inventaris">
              <div className="grid grid-cols-1 gap-y-3 mt-2">
                <div className="space-y-1 bg-slate-50 dark:bg-slate-800/50 rounded-lg p-3">
                  <div className="text-[11px] text-slate-400 font-medium">No. Inventaris</div>
                  <div className="text-xs font-semibold text-slate-700 dark:text-slate-200">{currentTicket.inventaris.no}</div>
                </div>
                <div className="space-y-1 bg-slate-50 dark:bg-slate-800/50 rounded-lg p-3">
                  <div className="text-[11px] text-slate-400 font-medium">Nama Inventaris</div>
                  <div className="text-xs font-semibold text-slate-700 dark:text-slate-200">{currentTicket.inventaris.name}</div>
                </div>
                <div className="space-y-1 bg-slate-50 dark:bg-slate-800/50 rounded-lg p-3">
                  <div className="text-[11px] text-slate-400 font-medium">Merk Inventaris</div>
                  <div className="text-xs font-semibold text-slate-700 dark:text-slate-200">{currentTicket.inventaris.merk}</div>
                </div>
                <div className="space-y-1 bg-slate-50 dark:bg-slate-800/50 rounded-lg p-3">
                  <div className="text-[11px] text-slate-400 font-medium">Unit Inventaris</div>
                  <div className="text-xs font-semibold text-slate-700 dark:text-slate-200">{currentTicket.inventaris.unit}</div>
                </div>
                <div className="space-y-1 bg-slate-50 dark:bg-slate-800/50 rounded-lg p-3">
                  <div className="text-[11px] text-slate-400 font-medium">Lokasi Inventaris</div>
                  <div className="text-xs font-semibold text-slate-700 dark:text-slate-200">{currentTicket.inventaris.lokasi}</div>
                </div>
              </div>
            </InfoCard>
          )}

          {/* Deskripsi & Lampiran */}
          <InfoCard title="Deskripsi">
            <div className="mt-3 space-y-4">
              <div>
                <div className="text-[11px] text-slate-400 font-medium mb-1.5">Deskripsi Masalah</div>
                <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed font-medium bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-100 dark:border-slate-800">
                  {currentTicket.description}
                </p>
              </div>

              {currentTicket.attachments && currentTicket.attachments.length > 0 && (
                <div className="pt-2">
                  <div className="text-[11px] text-slate-400 font-medium mb-2">Foto Bukti Awal</div>
                  <div className="flex flex-col gap-3">
                    {currentTicket.attachments.map((att) => (
                      <AttachmentCard key={att.id} name={att.name} size={att.size} url={att.url} />
                    ))}
                  </div>
                </div>
              )}
            </div>
          </InfoCard>

          {/* Klasifikasi Tiket Sarpras Section */}
          {isClassifying && currentTicket.status === "Baru" && (
            <InfoCard title="Klasifikasi Tiket Sarpras">
              <div className="space-y-1 mt-3">
                <label className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                  Kategori Sarpras<span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <select 
                    value={selectedKategori}
                    onChange={(e) => {
                      setSelectedKategori(e.target.value);
                      setShowKategoriError(false);
                    }}
                    className={`w-full appearance-none bg-white dark:bg-slate-900 border ${showKategoriError ? 'border-rose-500' : 'border-slate-200 dark:border-slate-700'} rounded-xl px-4 py-3 text-sm text-slate-700 dark:text-slate-200 focus:outline-none focus:border-blue-500`}
                  >
                    <option value="" disabled>Pilih kategori sarpras</option>
                    <option value="Elektronik">Elektronik</option>
                    <option value="Non Elektronik">Non Elektronik</option>
                    <option value="Ketidakstabilan System">Ketidakstabilan System</option>
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center px-4 pointer-events-none text-slate-400">
                    <ChevronDown className="w-4 h-4" />
                  </div>
                </div>
                {showKategoriError && (
                  <p className="text-xs text-rose-500 flex items-center mt-1.5">
                    <span className="w-3.5 h-3.5 rounded-full border border-rose-500 flex items-center justify-center mr-1">!</span>
                    Kategori sarpras wajib dipilih
                  </p>
                )}
              </div>
            </InfoCard>
          )}

          {/* Klasifikasi Tiket Sarpras Read-only View */}
          {(isDiklasifikasi || isDiproses || isTerselesaikan || isDitutup) && (
            <InfoCard title="Klasifikasi Tiket Sarpras">
              <div className="space-y-1 mt-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg p-3">
                <div className="text-[11px] text-slate-400 font-medium">Kategori Sarpras</div>
                <div className="text-xs font-semibold text-slate-700 dark:text-slate-200">{currentTicket.category}</div>
              </div>
            </InfoCard>
          )}

          {/* Verified Sections: Priority & Assign */}
          {(isDiklasifikasi || isDiproses || isTerselesaikan || isDitutup) && (
            <>
              {/* Tingkat Prioritas */}
              <InfoCard title="Tingkat Prioritas">
                <div className="flex items-center justify-between mt-[-32px] mb-4 pointer-events-none">
                  <span className="opacity-0">.</span>
                  {!isDiproses && !isTerselesaikan && !isDitutup ? (
                    <span className="text-[10px] text-slate-400 font-medium">Tentukan SLA penanganan</span>
                  ) : currentTicket.resolutionNotes ? (
                    <span className="text-[10px] font-bold text-emerald-600 border border-emerald-200 bg-emerald-50 dark:bg-emerald-900/30 dark:border-emerald-800/50 px-2 py-1 rounded-full">SLA Terpenuhi</span>
                  ) : (
                    <span className="text-[10px] font-bold text-rose-500 border border-rose-200 bg-white dark:bg-rose-950/30 dark:border-rose-900/50 px-2 py-1 rounded-full">Batas 2 jam</span>
                  )}
                </div>
                
                {!isDiproses && !isTerselesaikan && !isDitutup ? (
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
                          className={`flex items-center justify-between p-3.5 rounded-xl border cursor-pointer transition-all ${
                            isSelected ? 'border-[#1e3a8a] bg-blue-50/50 dark:bg-blue-900/20' : 'border-slate-200 dark:border-slate-700'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            {isSelected ? (
                              <div className="w-5 h-5 rounded-full border-[5px] border-[#1e3a8a] bg-white" />
                            ) : (
                              <div className="w-5 h-5 rounded-full border border-slate-300 dark:border-slate-600" />
                            )}
                            <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">{item.label}</span>
                          </div>
                          <div className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${item.variant === 'rose' ? 'bg-rose-100 text-rose-600 border border-rose-200' : 'bg-slate-100 text-slate-500 border border-slate-200 dark:bg-slate-800 dark:text-slate-400'}`}>
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
                        {currentTicket.priority || "Critical"}
                      </p>
                      <p className="text-[11px] text-slate-500 mt-1">Batas waktu penanganan maksimal 2 jam</p>
                    </div>
                  </div>
                )}
              </InfoCard>

              {/* Petugas */}
              <InfoCard title="Petugas">
                <div className="flex items-center justify-between mt-[-32px] mb-4 pointer-events-none">
                  <span className="opacity-0">.</span>
                  {(isDiproses || isTerselesaikan || isDitutup) && (
                    <span className="text-[10px] font-bold text-emerald-500 bg-emerald-50 border border-emerald-200 dark:bg-emerald-950/30 dark:border-emerald-900/50 px-2 py-1 rounded-full">Ditugaskan</span>
                  )}
                </div>
                
                {!isDiproses && !isTerselesaikan && !isDitutup ? (
                  assignedPetugas ? (
                    <div className="flex items-center justify-between p-3 border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-[#003178] text-white flex items-center justify-center font-bold text-sm">
                          {assignedPetugas.initials}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-slate-800 dark:text-slate-100">{assignedPetugas.name}</p>
                          <p className="text-[11px] text-slate-500">{assignedPetugas.role}</p>
                        </div>
                      </div>
                      <Button variant="outline" className="px-3 py-1.5 text-xs rounded-lg" onClick={() => setIsAssignModalOpen(true)}>
                        Ubah
                      </Button>
                    </div>
                  ) : (
                    <button onClick={() => setIsAssignModalOpen(true)} className="w-full py-3.5 rounded-xl bg-[#003178] hover:bg-[#003178]/90 text-white font-semibold text-sm transition shadow-sm">
                      + Assign Petugas
                    </button>
                  )
                ) : (
                  <div className="flex items-center gap-3 bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl border border-slate-200 dark:border-slate-700">
                    <div className="w-10 h-10 rounded-full bg-[#003178] text-white flex items-center justify-center font-bold text-sm">
                      {currentTicket.assignee?.avatarInitials || 'PT'}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-800 dark:text-slate-100">{currentTicket.assignee?.name || 'Budi Santoso'}</p>
                      <p className="text-[11px] text-slate-500">{currentTicket.assignee?.role || 'IT Support'}</p>
                    </div>
                  </div>
                )}
              </InfoCard>
            </>
          )}

          {/* Riwayat Penanganan */}
          <InfoCard title="Riwayat Penanganan">
            <div className="mt-5 pl-2">
              <Timeline items={timelineItems} />
            </div>
          </InfoCard>

          {currentTicket.resolutionNotes && (
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm">
              <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Catatan Penanganan</h4>
              <p className="text-sm text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-100 dark:border-slate-700 leading-relaxed">
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

      {/* Sticky Bottom Actions */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] z-40">
        
        {/* Action Area for Baru */}
        {currentTicket.status === "Baru" && (
          <div className="flex justify-between gap-3">
            {!isClassifying ? (
              <>
                <button 
                  onClick={() => setIsRejectModalOpen(true)}
                  className="flex-1 h-[46px] rounded-xl border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-600 flex items-center justify-center gap-2 transition font-semibold text-sm"
                >
                  <X className="w-4 h-4" /> Tolak Tiket
                </button>
                <button 
                  onClick={() => setIsClassifying(true)}
                  className="flex-1 h-[46px] rounded-xl bg-[#1e3a8a] hover:bg-[#1e3a8a]/90 text-white font-semibold text-sm transition shadow-sm"
                >
                  Klasifikasikan
                </button>
              </>
            ) : (
              <>
                <button 
                  onClick={() => { setIsClassifying(false); setShowKategoriError(false); }}
                  className="flex-1 h-[46px] rounded-xl border border-rose-200 bg-white text-rose-600 font-semibold text-sm transition flex items-center justify-center"
                >
                  Batal
                </button>
                <button 
                  onClick={() => {
                    if (!selectedKategori) {
                      setShowKategoriError(true);
                    } else {
                      setIsClassifying(false);
                      handleVerify();
                    }
                  }}
                  className="flex-1 h-[46px] rounded-xl bg-[#1e3a8a] hover:bg-[#1e3a8a]/90 text-white font-semibold text-sm transition shadow-sm"
                >
                  Simpan
                </button>
              </>
            )}
          </div>
        )}

        {/* Action Area for Diklasifikasi State */}
        {isDiklasifikasi && (
          <div className="flex justify-between gap-3">
            <button onClick={() => { /* Handle Batal */ }} className="flex-1 h-[46px] rounded-xl border border-rose-200 bg-white text-rose-600 font-semibold text-sm transition flex items-center justify-center">
              Batal
            </button>
            <button onClick={handleSimpan} className="flex-1 h-[46px] rounded-xl bg-[#1e3a8a] hover:bg-[#1e3a8a]/90 text-white font-semibold text-sm transition shadow-sm">
              Simpan
            </button>
          </div>
        )}

        {/* Action Area for Diproses State */}
        {isDiproses && (
          <div className="flex justify-between gap-3">
            <button onClick={() => setIsEskalasiModalOpen(true)} className="flex-1 h-[46px] rounded-xl border border-slate-300 bg-white text-slate-700 font-semibold text-sm transition hover:bg-slate-50 flex items-center justify-center">
              Eskalasi
            </button>
            <button onClick={() => setIsUpdateStatusModalOpen(true)} className="flex-1 h-[46px] rounded-xl bg-[#1e3a8a] hover:bg-[#1e3a8a]/90 text-white font-semibold text-sm transition shadow-sm flex items-center justify-center">
              Tangani Tiket
            </button>
          </div>
        )}

        {/* Action Area for Terselesaikan State */}
        {isTerselesaikan && (
          <div className="flex flex-col sm:flex-row justify-between gap-3">
            <button 
              onClick={() => setIsTolakModalOpen(true)} 
              className="flex-1 h-[46px] rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 font-semibold text-sm transition flex items-center gap-2 justify-center"
            >
              Tolak Penyelesaian
            </button>
            <button 
              onClick={handleSetujui} 
              className="flex-1 h-[46px] rounded-xl bg-[#1e3a8a] hover:bg-[#1e3a8a]/90 text-white font-semibold text-sm transition shadow-sm text-center"
            >
              Setujui Penyelesaian
            </button>
          </div>
        )}
      </div>

      {/* Modals */}
      <RejectTicketModal
        isOpen={isRejectModalOpen}
        ticketCode={currentTicket.code}
        onClose={() => setIsRejectModalOpen(false)}
        onConfirmReject={handleConfirmReject}
      />
      <AssignPetugasModal
        isOpen={isAssignModalOpen}
        onClose={() => setIsAssignModalOpen(false)}
        onAssign={setAssignedPetugas}
        selectedPetugasId={assignedPetugas?.id}
      />
      <ValidationModal
        isOpen={isValidationModalOpen}
        onClose={() => setIsValidationModalOpen(false)}
        message="Prioritas dan Petugas wajib dipilih."
      />
      <UpdateStatusModal
        isOpen={isUpdateStatusModalOpen}
        onClose={() => setIsUpdateStatusModalOpen(false)}
        onSubmit={handleUpdateStatus}
      />
      <EskalasiModal
        isOpen={isEskalasiModalOpen}
        onClose={() => setIsEskalasiModalOpen(false)}
        onSubmit={handleEskalasi}
      />
      <TolakPenyelesaianModal
        isOpen={isTolakModalOpen}
        onClose={() => setIsTolakModalOpen(false)}
        onSubmit={handleTolakPenyelesaian}
      />
      <SuccessModal
        isOpen={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        title="Berhasil Diperbarui"
        message="Status dan riwayat perbaikan tiket berhasil diperbarui"
      />
    </div>
  );
};

export default HelpdeskDetailPage;
