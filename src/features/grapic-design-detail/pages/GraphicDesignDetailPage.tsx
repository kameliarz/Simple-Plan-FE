import { useEffect, useState } from "react";
import { ArrowLeft, Download } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "@/features/auth-login/context/AuthContext";
import Button from "@/components/ui/ui-template/Button";
import { useToast } from "@/components/ui/ui-template/UseToast";
import DetailSection from "../components/DetailSection";
import DetailField from "../components/DetailField";
import FileAttachment from "../components/FileAttachment";
import StatusBadge from "../components/StatusBadge";
import AssignmentCard from "../components/AssignmentCard";
import AssignDesignOfficerModal from "../components/AssignDesignOfficerModal";
import RejectDesignModal from "../components/RejectDesignModal";
import UploadDraftModal from "../components/UploadDraftModal";
import ApproveDraftModal from "../components/ApproveDraftModal";
import RequestRevisionModal from "../components/RequestRevisionModal";
import {
  getGraphicDesignDetail,
  assignGraphicDesign,
  rejectGraphicDesign,
  uploadGraphicDesignDraft,
  approveGraphicDesignDraft,
  requestGraphicDesignRevision,
} from "../services/graphicDesignDetail";
import type {
  DesignOfficer,
  DesignPriority,
  GraphicDesignDetail,
} from "../types/graphicDesignDetail.types";
export default function GraphicDesignDetailPage() {
  const navigate = useNavigate();
  const { designId } = useParams<{ designId: string }>();
  const { user } = useAuth();
  const { showToast } = useToast();
  const isSuperAdmin = user?.role === "super-admin";
  const graphicDesignListPath = "/graphic-design";
  // ==========================================
  // DETAIL STATE
  // ==========================================
  const [currentDesign, setCurrentDesign] = useState<GraphicDesignDetail | null>(null);
  const [loadedDesignId, setLoadedDesignId] = useState<string | null>(null);
  const isLoading = Boolean(designId) && loadedDesignId !== designId;
  const [error, setError] = useState<string | null>(null);
  // ==========================================
  // ASSIGNMENT STATE
  // ==========================================
  const [isAssignmentMode, setIsAssignmentMode] = useState(false);
  const [priority, setPriority] = useState<DesignPriority | "">("");
  const [selectedOfficer, setSelectedOfficer] = useState<DesignOfficer | null>(null);
  const [priorityError, setPriorityError] = useState("");
  const [officerError, setOfficerError] = useState("");
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [isSavingAssignment, setIsSavingAssignment] = useState(false);
  // ==========================================
  // REJECTION STATE
  // ==========================================
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [isRejecting, setIsRejecting] = useState(false);
  // ==========================================
  // UPLOAD DRAFT STATE
  // ==========================================
  const [isUploadDraftModalOpen, setIsUploadDraftModalOpen] = useState(false);
  const [isUploadingDraft, setIsUploadingDraft] = useState(false);
  // ==========================================
  // APPROVAL STATE
  // ==========================================
  const [isApproveModalOpen, setIsApproveModalOpen] = useState(false);
  const [isApproving, setIsApproving] = useState(false);
  // ==========================================
  // REVISION STATE
  // ==========================================
  const [isRevisionModalOpen, setIsRevisionModalOpen] = useState(false);
  const [isSendingRevision, setIsSendingRevision] = useState(false);
  // ==========================================
  // NAVIGATION
  // ==========================================
  const handleBack = () => {
    navigate(graphicDesignListPath);
  };
  // ==========================================
  // FETCH DETAIL
  // ==========================================
  useEffect(() => {
    if (!designId) return;
    let isMounted = true;
    const fetchDesignDetail = async () => {
      try {
        const data = await getGraphicDesignDetail(designId);
        if (!isMounted) {
          if (data.draft?.file?.url.startsWith("blob:")) {
            URL.revokeObjectURL(data.draft.file.url);
          }
          return;
        }
        setCurrentDesign(data);
        setError(null);
        setIsAssignmentMode(false);
        setPriority("");
        setSelectedOfficer(null);
        setPriorityError("");
        setOfficerError("");
        setIsAssignModalOpen(false);
        setIsRejectModalOpen(false);
        setIsUploadDraftModalOpen(false);
        setIsApproveModalOpen(false);
        setIsRevisionModalOpen(false);
      } catch (err) {
        if (!isMounted) return;
        console.error("Gagal mengambil detail request desain:", err);
        setCurrentDesign(null);
        setError(err instanceof Error ? err.message : "Gagal mengambil detail request desain.");
      } finally {
        if (isMounted) {
          setLoadedDesignId(designId);
        }
      }
    };
    void fetchDesignDetail();
    return () => {
      isMounted = false;
    };
  }, [designId]);
  // ==========================================
  // CLEANUP OBJECT URL
  // ==========================================
  const draftFileUrl = currentDesign?.draft?.file?.url;
  useEffect(() => {
    return () => {
      if (draftFileUrl?.startsWith("blob:")) {
        URL.revokeObjectURL(draftFileUrl);
      }
    };
  }, [draftFileUrl]);
  // ==========================================
  // ROLE PERMISSIONS
  // ==========================================
  const isAssignedOfficer =
    !!user && !!currentDesign?.assignee && String(user.id) === String(currentDesign.assignee.id);
  const isRequester =
    !!user &&
    !!currentDesign &&
    currentDesign.requesterId != null &&
    String(user.id) === String(currentDesign.requesterId);
  const isNew = currentDesign?.status === "Baru";
  const isRejected = currentDesign?.status === "Ditolak";
  const isAssigned =
    currentDesign?.status === "Ditugaskan" ||
    currentDesign?.status === "Menunggu Persetujuan" ||
    currentDesign?.status === "Perlu Revisi" ||
    currentDesign?.status === "Selesai";
  const canManageRequest = isSuperAdmin && isNew;
  const canUploadDraft = isAssignedOfficer && currentDesign?.status === "Ditugaskan";
  const canReviewDraft = isRequester && currentDesign?.status === "Menunggu Persetujuan";
  const isCompleted = currentDesign?.status === "Selesai";
  // ==========================================
  // OPEN ASSIGNMENT
  // ==========================================
  const handleOpenAssignment = () => {
    if (!canManageRequest) return;
    setPriority("");
    setSelectedOfficer(null);
    setPriorityError("");
    setOfficerError("");
    setIsAssignmentMode(true);
  };
  const handlePriorityChange = (value: DesignPriority | "") => {
    setPriority(value);
    setPriorityError("");
  };
  const handleSelectOfficer = (officer: DesignOfficer) => {
    setSelectedOfficer(officer);
    setOfficerError("");
    setIsAssignModalOpen(false);
  };
  // ==========================================
  // SAVE ASSIGNMENT
  // ==========================================
  const handleSaveAssignment = async () => {
    if (!canManageRequest || !designId || isSavingAssignment) {
      return;
    }
    let hasError = false;
    if (!priority) {
      setPriorityError("Prioritas wajib diisi!");
      hasError = true;
    } else {
      setPriorityError("");
    }
    if (!selectedOfficer) {
      setOfficerError("Petugas wajib diisi!");
      hasError = true;
    } else {
      setOfficerError("");
    }
    if (hasError || !priority || !selectedOfficer) {
      return;
    }
    try {
      setIsSavingAssignment(true);
      const updatedDesign = await assignGraphicDesign(designId, {
        priority,
        officerId: selectedOfficer.id,
      });
      setCurrentDesign(updatedDesign);
      setIsAssignmentMode(false);
      setIsAssignModalOpen(false);
      setPriority("");
      setSelectedOfficer(null);
      setPriorityError("");
      setOfficerError("");
      showToast("Request desain berhasil ditugaskan!", "success");
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Gagal menugaskan request desain.", "error");
    } finally {
      setIsSavingAssignment(false);
    }
  };
  // ==========================================
  // REJECT REQUEST
  // ==========================================
  const handleRejectRequest = async (reason: string) => {
    if (!canManageRequest || !designId || isRejecting) {
      return;
    }
    try {
      setIsRejecting(true);
      const updatedDesign = await rejectGraphicDesign(designId, reason);
      setCurrentDesign(updatedDesign);
      setIsRejectModalOpen(false);
      setIsAssignmentMode(false);
      showToast("Request desain berhasil ditolak!", "success");
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Gagal menolak request desain.", "error");
    } finally {
      setIsRejecting(false);
    }
  };
  // ==========================================
  // UPLOAD DRAFT
  // ==========================================
  const handleUploadDraft = async (file: File, notes: string) => {
    if (!designId || !canUploadDraft || !user || isUploadingDraft) {
      return;
    }
    try {
      setIsUploadingDraft(true);
      const updatedDesign = await uploadGraphicDesignDraft(designId, {
        file,
        notes,
        officerId: Number(user.id),
      });
      setCurrentDesign(updatedDesign);
      setIsUploadDraftModalOpen(false);
      showToast("Draft desain berhasil dikirim!", "success");
    } catch (err) {
      console.error("Gagal mengunggah draft desain:", err);
      showToast(err instanceof Error ? err.message : "Gagal mengunggah draft desain.", "error");
    } finally {
      setIsUploadingDraft(false);
    }
  };
  // ==========================================
  // APPROVE DRAFT
  // ==========================================
  const handleApproveDraft = async () => {
    if (!designId || !canReviewDraft || !user || isApproving) {
      return;
    }
    try {
      setIsApproving(true);
      await approveGraphicDesignDraft(designId, Number(user.id));
      // Ambil ulang file dari IndexedDB agar
      // URL unduhan tetap tersedia setelah approval.
      const updatedDesign = await getGraphicDesignDetail(designId);
      setCurrentDesign(updatedDesign);
      setIsApproveModalOpen(false);
      showToast("Draft berhasil disetujui!", "success");
    } catch (err) {
      console.error("Gagal menyetujui draft:", err);
      showToast(err instanceof Error ? err.message : "Gagal menyetujui draft.", "error");
    } finally {
      setIsApproving(false);
    }
  };
  // ==========================================
  // REQUEST REVISION
  // ==========================================
  const handleRequestRevision = async (notes: string) => {
    if (!designId || !canReviewDraft || !user || isSendingRevision) {
      return;
    }
    try {
      setIsSendingRevision(true);
      await requestGraphicDesignRevision(designId, {
        requesterId: Number(user.id),
        notes,
      });
      // Muat kembali URL draft yang tersimpan
      // supaya file tetap dapat diunduh.
      const updatedDesign = await getGraphicDesignDetail(designId);
      setCurrentDesign(updatedDesign);
      setIsRevisionModalOpen(false);
      showToast("Revisi berhasil dikirim!", "success");
    } catch (err) {
      console.error("Gagal mengajukan revisi:", err);
      showToast(err instanceof Error ? err.message : "Gagal mengajukan revisi.", "error");
    } finally {
      setIsSendingRevision(false);
    }
  };
  // ==========================================
  // DOWNLOAD FINAL
  // ==========================================
  const handleDownloadFinal = () => {
    if (!isCompleted || !currentDesign?.draft?.file) {
      return;
    }
    const file = currentDesign.draft.file;
    if (!file.url) {
      showToast("File hasil final tidak tersedia.", "error");
      return;
    }
    const link = document.createElement("a");
    link.href = file.url;
    link.download = file.name;
    document.body.appendChild(link);
    link.click();
    link.remove();
  };
  // ==========================================
  // NO DESIGN ID
  // ==========================================
  if (!designId) {
    return (
      <div className="flex min-h-full items-center justify-center bg-background p-6">
        <div className="text-center">
          <h1 className="text-sm font-semibold text-text-title">
            ID Request Desain Tidak Ditemukan
          </h1>
          <p className="mt-1 text-xs text-text-secondary">
            ID request desain tidak tersedia pada URL.
          </p>
          <Button
            label="Kembali ke Daftar Desain"
            variant="ghost"
            className="mt-4"
            onClick={handleBack}
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
          <div className="mx-auto mb-3 h-6 w-6 animate-spin rounded-full border-2 border-primary-600 border-t-transparent" />
          <h1 className="text-sm font-semibold text-text-title">Memuat detail request desain...</h1>
        </div>
      </div>
    );
  }
  // ==========================================
  // ERROR / NOT FOUND
  // ==========================================
  if (!currentDesign) {
    return (
      <div className="flex min-h-full items-center justify-center bg-background p-6">
        <div className="text-center">
          <h1 className="text-sm font-semibold text-text-title">Request Desain Tidak Ditemukan</h1>
          <p className="mt-1 text-xs text-text-secondary">
            {error ?? "Data request desain tidak tersedia."}
          </p>
          <Button
            label="Kembali ke Daftar Desain"
            variant="ghost"
            className="mt-4"
            onClick={handleBack}
          />
        </div>
      </div>
    );
  }
  // ==========================================
  // UI
  // ==========================================
  return (
    <div className="min-h-full bg-background p-4 pb-10 lg:p-5">
      <div className="mx-auto max-w-350">
        {/* HEADER */}
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <button
            type="button"
            onClick={handleBack}
            className="inline-flex items-center gap-2 rounded-md px-1 py-1.5 text-sm font-medium text-text-title transition-colors hover:text-primary-600"
          >
            <ArrowLeft size={18} strokeWidth={1.5} />
            <span>Detail Request Desain</span>
          </button>
          {/* DOWNLOAD FINAL */}
          {isCompleted && (
            <Button
              type="button"
              label="Unduh Hasil Final"
              icon={<Download size={16} strokeWidth={1.8} />}
              variant="primary"
              size="sm"
              onClick={handleDownloadFinal}
            />
          )}
        </div>
        <div className="space-y-5">
          {/* REQUEST INFORMATION */}
          <DetailSection
            title={currentDesign.title}
            actions={
              <>
                {currentDesign.priority && (
                  <StatusBadge type="priority" value={currentDesign.priority} />
                )}
                <StatusBadge type="status" value={currentDesign.status} />
              </>
            }
          >
            <dl className="space-y-3">
              <DetailField label="Nomor Request">{currentDesign.id}</DetailField>
              <DetailField label="Jenis Desain">{currentDesign.designType}</DetailField>
              <DetailField label="Deskripsi Kebutuhan">
                <p className="max-w-3xl leading-relaxed">{currentDesign.description}</p>
              </DetailField>
              <DetailField label="Tanggal Dibutuhkan">{currentDesign.requiredDate}</DetailField>
              <DetailField label="Nama Pelapor">{currentDesign.requesterName}</DetailField>
              <DetailField label="Unit">{currentDesign.unit}</DetailField>
              <DetailField label="Tanggal Request">{currentDesign.requestDate}</DetailField>
              {isAssigned && currentDesign.assignee && (
                <DetailField label="Petugas">{currentDesign.assignee.name}</DetailField>
              )}
              <DetailField label="File Referensi">
                {currentDesign.referenceFile ? (
                  <FileAttachment file={currentDesign.referenceFile} />
                ) : (
                  <span className="text-text-secondary">-</span>
                )}
              </DetailField>
            </dl>
          </DetailSection>
          {/* SUPER ADMIN - REQUEST BARU */}
          {canManageRequest && !isAssignmentMode && (
            <div className="flex flex-col gap-3 sm:flex-row">
              <Button
                label="Tolak"
                variant="secondary"
                className="flex-1 border-red-400 text-red-600 hover:bg-red-50"
                onClick={() => setIsRejectModalOpen(true)}
              />
              <Button
                label="Proses"
                variant="primary"
                className="flex-1"
                onClick={handleOpenAssignment}
              />
            </div>
          )}
          {/* SUPER ADMIN - ASSIGNMENT */}
          {canManageRequest && isAssignmentMode && (
            <AssignmentCard
              priority={priority}
              officer={selectedOfficer}
              priorityError={priorityError}
              officerError={officerError}
              isSaving={isSavingAssignment}
              onPriorityChange={handlePriorityChange}
              onOpenOfficerModal={() => setIsAssignModalOpen(true)}
              onSave={handleSaveAssignment}
            />
          )}
          {/* DRAFT DESAIN */}
          {isAssigned && (
            <DetailSection title="Draft Desain">
              {currentDesign.draft ? (
                <dl className="space-y-3">
                  <DetailField label="Tanggal Draft">{currentDesign.draft.date}</DetailField>
                  <DetailField label="Catatan Draft">
                    <p className="max-w-3xl whitespace-pre-wrap leading-relaxed">
                      {currentDesign.draft.notes || "-"}
                    </p>
                  </DetailField>
                  <DetailField label="File Draft">
                    {currentDesign.draft.file ? (
                      <FileAttachment file={currentDesign.draft.file} />
                    ) : (
                      <span className="text-text-secondary">-</span>
                    )}
                  </DetailField>
                </dl>
              ) : (
                <div className="flex min-h-28 items-center justify-center">
                  <p className="text-center text-sm text-text-secondary">
                    Draft desain belum tersedia
                  </p>
                </div>
              )}
            </DetailSection>
          )}
          {/* ASSIGNED OFFICER - UPLOAD DRAFT */}
          {canUploadDraft && (
            <Button
              label="Unggah Draft"
              variant="primary"
              className="w-full"
              onClick={() => setIsUploadDraftModalOpen(true)}
            />
          )}
          {/* REQUESTER - REVIEW ACTIONS */}
          {canReviewDraft && (
            <div className="flex flex-col gap-3 sm:flex-row">
              <Button
                label="Ajukan Revisi"
                variant="secondary"
                className="flex-1 border-primary-600 text-primary-600 hover:bg-blue-50"
                onClick={() => setIsRevisionModalOpen(true)}
              />
              <Button
                label="Setujui"
                variant="primary"
                className="flex-1"
                onClick={() => setIsApproveModalOpen(true)}
              />
            </div>
          )}
          {/* REVISION NOTE */}
          {currentDesign.status === "Perlu Revisi" && (
            <DetailSection title="Catatan Revisi">
              <DetailField label="Catatan Revisi (terbaru)">
                <p className="whitespace-pre-wrap wrap-break-word leading-relaxed">
                  {currentDesign.revisionNote || "-"}
                </p>
              </DetailField>
            </DetailSection>
          )}
          {/* REJECTION NOTE */}
          {isRejected && (
            <DetailSection title="Catatan Penolakan">
              <p className="whitespace-pre-wrap wrap-break-word text-sm leading-relaxed text-text-title">
                {currentDesign.rejectionNote || "-"}
              </p>
            </DetailSection>
          )}
        </div>
      </div>
      {/* ASSIGN OFFICER MODAL */}
      {canManageRequest && isAssignModalOpen && (
        <AssignDesignOfficerModal
          isOpen={isAssignModalOpen}
          selectedOfficer={selectedOfficer}
          onClose={() => setIsAssignModalOpen(false)}
          onAssign={handleSelectOfficer}
        />
      )}
      {/* REJECT REQUEST MODAL */}
      {canManageRequest && isRejectModalOpen && (
        <RejectDesignModal
          isOpen={isRejectModalOpen}
          isSubmitting={isRejecting}
          onClose={() => setIsRejectModalOpen(false)}
          onConfirm={handleRejectRequest}
        />
      )}
      {/* UPLOAD DRAFT MODAL */}
      {canUploadDraft && isUploadDraftModalOpen && (
        <UploadDraftModal
          isOpen={isUploadDraftModalOpen}
          isSubmitting={isUploadingDraft}
          onClose={() => setIsUploadDraftModalOpen(false)}
          onSubmit={handleUploadDraft}
        />
      )}
      {/* APPROVE DRAFT MODAL */}
      {canReviewDraft && (
        <ApproveDraftModal
          isOpen={isApproveModalOpen}
          isSubmitting={isApproving}
          onClose={() => setIsApproveModalOpen(false)}
          onConfirm={handleApproveDraft}
        />
      )}
      {/* REQUEST REVISION MODAL */}
      {canReviewDraft && isRevisionModalOpen && (
        <RequestRevisionModal
          isOpen={isRevisionModalOpen}
          isSubmitting={isSendingRevision}
          onClose={() => setIsRevisionModalOpen(false)}
          onConfirm={handleRequestRevision}
        />
      )}
    </div>
  );
}
