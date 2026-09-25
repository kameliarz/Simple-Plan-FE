import { useState } from "react";
import { Image as ImageIcon } from "lucide-react";

import Modal from "@/components/ui/ui-template/Modal";
import Dropdown from "@/components/ui/ui-template/Dropdown";
import Button from "@/components/ui/ui-template/Button";
import TextArea from "@/components/ui/ui-template/TextArea";
import FileUpload from "@/components/ui/ui-template/FileUploader";
import DateInput from "@/components/ui/ui-template/DateInput";

interface HandleTicketModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: HandleTicketFormData) => void;
}

export interface HandleTicketFormData {
  status: "diproses" | "selesai";
  startedAt: string;
  completedAt: string;
  notes: string;
  photo: File | null;
}

const statusOptions = ["Diproses", "Selesai"];

const HandleTicketModal = ({ isOpen, onClose, onSave }: HandleTicketModalProps) => {
  const [status, setStatus] = useState<"diproses" | "selesai" | "">("");
  const [startedAt, setStartedAt] = useState("");
  const [completedAt, setCompletedAt] = useState("");
  const [notes, setNotes] = useState("");
  const [photo, setPhoto] = useState<File | null>(null);

  const [statusError, setStatusError] = useState("");
  const [startedAtError, setStartedAtError] = useState("");
  const [completedAtError, setCompletedAtError] = useState("");
  const [notesError, setNotesError] = useState("");

  const handleSave = () => {
    let hasError = false;

    if (!status) {
      setStatusError("Status tiket wajib dipilih.");
      hasError = true;
    } else {
      setStatusError("");
    }

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

    if (hasError || !status) {
      return;
    }

    onSave({
      status,
      startedAt,
      completedAt,
      notes: notes.trim(),
      photo,
    });
  };

  const handleClose = () => {
    setStatus("");
    setStartedAt("");
    setCompletedAt("");
    setNotes("");
    setPhoto(null);

    setStatusError("");
    setStartedAtError("");
    setCompletedAtError("");
    setNotesError("");

    onClose();
  };

  return (
    <Modal
      show={isOpen}
      onClose={handleClose}
      closeable
      showHeader
      title="Catatan Penanganan"
      icon={<ImageIcon size={18} />}
      maxWidth="xl"
    >
      <div className="space-y-5">
        {/* Status */}
        <div>
          <label className="mb-1 block text-xs font-medium text-text-primary">
            Status Tiket <span className="text-red-500">*</span>
          </label>

          <Dropdown
            value={status}
            options={statusOptions}
            onChange={(value) => {
              setStatus(value as "diproses" | "selesai");
              setStatusError("");
            }}
            placeholder="Pilih Status"
            error={statusError}
            className="w-full"
          />
        </div>

        {/* Waktu */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-xs font-medium text-text-primary">
              Waktu Mulai Perbaikan <span className="text-red-500">*</span>
            </label>

            <DateInput
              variant="datetime"
              value={startedAt}
              onChange={(value) => {
                setStartedAt(value);
                setStartedAtError("");
              }}
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

        {/* Catatan */}
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

        {/* Foto Hasil Perbaikan */}
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

      {/* Footer */}
      <div className="mt-6 flex justify-end border-t border-slate-100 pt-3">
        <Button label="Simpan" variant="primary" size="sm" onClick={handleSave} />
      </div>
    </Modal>
  );
};

export default HandleTicketModal;
