import { useState } from "react";
import { IconX } from "@tabler/icons-react";

import Modal from "@/components/ui/ui-template/Modal";
import Button from "@/components/ui/ui-template/Button";
import TextArea from "@/components/ui/ui-template/TextArea";

interface RequestRevisionModalProps {
  isOpen: boolean;
  isSubmitting: boolean;
  onClose: () => void;
  onConfirm: (notes: string) => void;
}

export default function RequestRevisionModal({
  isOpen,
  isSubmitting,
  onClose,
  onConfirm,
}: RequestRevisionModalProps) {
  const [notes, setNotes] = useState("");
  const [error, setError] = useState("");

  const handleClose = () => {
    if (isSubmitting) return;

    setNotes("");
    setError("");
    onClose();
  };

  const handleSubmit = () => {
    if (isSubmitting) return;

    const trimmedNotes = notes.trim();

    if (!trimmedNotes) {
      setError("Catatan revisi wajib diisi!");
      return;
    }

    setError("");
    onConfirm(trimmedNotes);
  };

  return (
    <Modal
      show={isOpen}
      onClose={handleClose}
      showHeader={false}
      maxWidth="md"
      closeable={!isSubmitting}
    >
      {/* HEADER */}
      <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4 dark:border-slate-700">
        <h2 className="text-base font-medium text-text-title">Ajukan Revisi</h2>

        <button
          type="button"
          aria-label="Tutup modal"
          disabled={isSubmitting}
          onClick={handleClose}
          className="rounded-md p-1 text-text-secondary transition hover:bg-slate-100 hover:text-text-title disabled:opacity-50 dark:hover:bg-slate-800"
        >
          <IconX size={19} strokeWidth={1.7} />
        </button>
      </div>

      {/* BODY */}
      <div className="space-y-5 p-5">
        <TextArea
          id="design-revision-notes"
          label="Catatan Revisi"
          required
          rows={5}
          value={notes}
          onChange={(event) => {
            setNotes(event.target.value);

            if (error) {
              setError("");
            }
          }}
          placeholder="Masukkan catatan revisi..."
          disabled={isSubmitting}
          error={error}
          aria-invalid={Boolean(error)}
        />

        <Button
          type="button"
          label={isSubmitting ? "Mengirim..." : "Kirim Revisi"}
          variant="primary"
          className="w-full"
          disabled={isSubmitting}
          onClick={handleSubmit}
        />
      </div>
    </Modal>
  );
}
