import { useState } from "react";

import { Image as ImageIcon } from "lucide-react";

import Modal from "@/components/ui/ui-template/Modal";

import Button from "@/components/ui/ui-template/Button";

import TextArea from "@/components/ui/ui-template/TextArea";

import FileUpload from "@/components/ui/ui-template/FileUploader";

import DateInput from "@/components/ui/ui-template/DateInput";

interface HandleTicketModalProps {
  isOpen: boolean;
  ticketId: string;
  startedAtFromDb: string | null;
  onClose: () => void;
  onSave: (data: HandleTicketFormData) => void | Promise<void>;
  isSaving?: boolean;
}

export interface HandleTicketFormData {
  status: "terselesaikan";
  startedAt: string;
  completedAt: string;
  notes: string;
  photo: File | null;
}

const toDateTimeLocalValue = (dateString: string) => {
  const date = new Date(dateString);

  if (Number.isNaN(date.getTime())) return "";

  const localDate = new Date(date.getTime() - date.getTimezoneOffset() * 60000);

  return localDate.toISOString().slice(0, 16);
};

const HandleTicketModal = (props: HandleTicketModalProps) => {
  const { isOpen, ticketId, startedAtFromDb } = props;

  if (!isOpen) return null;

  return <HandleTicketModalContent key={`${ticketId}-${startedAtFromDb ?? ""}`} {...props} />;
};

const HandleTicketModalContent = ({
  startedAtFromDb,
  onClose,
  onSave,
  isSaving = false,
}: HandleTicketModalProps) => {
  const formatted = startedAtFromDb ? toDateTimeLocalValue(startedAtFromDb) : "";

  const [startedAt] = useState(formatted);
  const [completedAt, setCompletedAt] = useState("");
  const [notes, setNotes] = useState("");
  const [photo, setPhoto] = useState<File | null>(null);

  const [startedAtError, setStartedAtError] = useState(
    formatted ? "" : "Waktu mulai SLA belum tersedia di data tiket.",
  );
  const [completedAtError, setCompletedAtError] = useState("");
  const [notesError, setNotesError] = useState("");
  const [submitError, setSubmitError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSave = async () => {
    let hasError = false;

    if (!startedAt) {
      setStartedAtError("Waktu mulai perbaikan wajib diisi.");
      hasError = true;
    } else {
      setStartedAtError("");
    }

    if (!completedAt) {
      setCompletedAtError("Waktu selesai perbaikan wajib diisi.");
      hasError = true;
    } else {
      setCompletedAtError("");
    }

    if (!notes.trim()) {
      setNotesError("Catatan penanganan wajib diisi.");
      hasError = true;
    } else {
      setNotesError("");
    }

    if (
      startedAt &&
      completedAt &&
      new Date(completedAt).getTime() < new Date(startedAt).getTime()
    ) {
      setCompletedAtError("Waktu selesai harus sama dengan atau setelah waktu mulai.");
      hasError = true;
    }

    if (hasError) return;

    setSubmitError("");

    try {
      setIsSubmitting(true);

      await onSave({
        status: "terselesaikan",
        startedAt,
        completedAt,
        notes: notes.trim(),
        photo,
      });
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : "Gagal menyimpan penanganan tiket.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (isSubmitting) return;
    onClose();
  };

  return (
    <Modal
      show
      onClose={handleClose}
      closeable={!isSubmitting}
      showHeader
      title="Catatan Penanganan"
      icon={<ImageIcon size={18} />}
      maxWidth="xl"
    >
      <div className="space-y-5">
        {/* Waktu perbaikan */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-xs font-medium text-text-primary">
              Waktu Mulai Perbaikan
            </label>
            <DateInput
              variant="datetime"
              value={startedAt}
              disabled
              required
              error={startedAtError}
            />
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-medium text-text-primary">
              Waktu Selesai Perbaikan <span className="text-red-500">*</span>
            </label>
            <DateInput
              variant="datetime"
              value={completedAt}
              onChange={(value) => {
                setCompletedAt(value);
                setCompletedAtError("");
              }}
              required
              error={completedAtError}
            />
          </div>
        </div>

        {/* Catatan penanganan */}
        <div>
          <label className="mb-1.5 block text-xs font-medium text-text-primary">
            Catatan Penanganan <span className="text-red-500">*</span>
          </label>
          <TextArea
            value={notes}
            onChange={(event) => {
              setNotes(event.target.value);
              setNotesError("");
            }}
            placeholder="Tuliskan catatan penanganan tiket..."
            rows={3}
            error={notesError}
          />
        </div>

        {/* Foto hasil perbaikan */}
        <div>
          <label className="mb-1.5 block text-xs font-medium text-text-primary">
            Foto Hasil Perbaikan{" "}
            <span className="text-[11px] font-normal text-text-secondary">(Bukti Selesai)</span>
          </label>
          <FileUpload
            value={photo}
            onChange={setPhoto}
            accept=".jpg,.jpeg,.png"
            maxSize={5 * 1024 * 1024}
            title="Tarik & lepas foto di sini, atau"
            actionText="Pilih Foto"
            description="Format: JPG, JPEG, atau PNG (Maks. 5MB)"
          />
        </div>
      </div>

      {/* Error dari request API */}
      {submitError && (
        <p className="mt-4 text-sm text-red-600" role="alert">
          {submitError}
        </p>
      )}

      {/* Footer */}
      <div className="mt-6 flex justify-end border-t border-slate-100 pt-3">
        <Button
          label={isSubmitting || isSaving ? "Mengirim..." : "Kirim"}
          variant="primary"
          size="sm"
          onClick={handleSave}
          disabled={isSubmitting || isSaving}
        />
      </div>
    </Modal>
  );
};

export default HandleTicketModal;
