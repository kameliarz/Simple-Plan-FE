import { useState } from "react";

import Modal from "@/components/ui/ui-template/Modal";
import Button from "@/components/ui/ui-template/Button";
import FileUpload from "@/components/ui/ui-template/FileUploader";
import TextArea from "@/components/ui/ui-template/TextArea";

interface UploadDraftModalProps {
  isOpen: boolean;
  isSubmitting: boolean;
  onClose: () => void;
  onSubmit: (file: File, notes: string) => void;
}

export default function UploadDraftModal({
  isOpen,
  isSubmitting,
  onClose,
  onSubmit,
}: UploadDraftModalProps) {
  const [file, setFile] = useState<File | null>(null);
  const [notes, setNotes] = useState("");
  const [fileError, setFileError] = useState("");

  const handleFileChange = (selectedFile: File | null) => {
    setFile(selectedFile);

    if (selectedFile) {
      setFileError("");
    }
  };

  const handleSubmit = () => {
    if (isSubmitting) return;

    if (!file) {
      setFileError("File draft wajib diunggah!");
      return;
    }

    onSubmit(file, notes.trim());
  };

  const handleClose = () => {
    if (isSubmitting) return;

    setFile(null);
    setNotes("");
    setFileError("");
    onClose();
  };

  return (
    <Modal
      show={isOpen}
      onClose={handleClose}
      showHeader={false}
      maxWidth="md"
      closeable={!isSubmitting}
    >
      <div className="flex items-center justify-between border-b border-slate-200 px-5 py-3 dark:border-slate-700">
        <h2 className="text-sm font-medium text-text-title">Unggah Draft</h2>

        <button
          type="button"
          onClick={handleClose}
          disabled={isSubmitting}
          aria-label="Tutup modal"
          className="text-text-secondary hover:text-text-title disabled:opacity-50"
        >
          ×
        </button>
      </div>

      <div className="space-y-5 px-5 py-5">
        {/* FILE DRAFT */}
        <div>
          <label className="mb-2 block text-sm font-medium text-text-title">
            File Draft <span className="text-red-500">*</span>
          </label>

          <FileUpload
            value={file}
            onChange={handleFileChange}
            accept=".pdf,.jpg,.jpeg,.png"
            maxSize={5 * 1024 * 1024}
            title="Tarik & lepas file di sini, atau"
            actionText="Pilih Dokumen"
            description="Format: PDF, JPG, PNG (Maksimal 5MB)"
            error={fileError}
          />
        </div>

        {/* CATATAN DRAFT */}
        <div>
          <label
            htmlFor="design-draft-notes"
            className="mb-2 block text-sm font-medium text-text-title"
          >
            Catatan Draft <span className="font-normal text-text-secondary">(opsional)</span>
          </label>

          <TextArea
            id="design-draft-notes"
            value={notes}
            onChange={(event) => setNotes(event.target.value)}
            placeholder="Masukkan catatan draft..."
            rows={4}
            disabled={isSubmitting}
          />
        </div>

        {/* ACTION */}
        <Button
          type="button"
          label={isSubmitting ? "Mengirim..." : "Kirim Draft"}
          variant="primary"
          className="w-full"
          disabled={isSubmitting}
          onClick={handleSubmit}
        />
      </div>
    </Modal>
  );
}
