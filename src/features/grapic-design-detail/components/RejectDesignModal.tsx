import { useState } from "react";
import { IconAlertCircle, IconAlertTriangle } from "@tabler/icons-react";

import Modal from "@/components/ui/ui-template/Modal";
import Button from "@/components/ui/ui-template/Button";

interface RejectDesignModalProps {
  isOpen: boolean;
  isSubmitting: boolean;
  onClose: () => void;
  onConfirm: (reason: string) => void;
}

export default function RejectDesignModal({
  isOpen,
  isSubmitting,
  onClose,
  onConfirm,
}: RejectDesignModalProps) {
  const [reason, setReason] = useState("");
  const [error, setError] = useState("");

  const handleConfirm = () => {
    const trimmedReason = reason.trim();

    if (!trimmedReason) {
      setError("Catatan penolakan wajib diisi!");
      return;
    }

    setError("");
    onConfirm(trimmedReason);
  };

  const handleClose = () => {
    if (isSubmitting) return;

    setReason("");
    setError("");
    onClose();
  };

  return (
    <Modal
      show={isOpen}
      onClose={handleClose}
      closeable={!isSubmitting}
      showHeader={false}
      maxWidth="md"
    >
      {/* HEADER */}
      <div className="flex items-center gap-3 border-b border-slate-100 px-5 py-5 dark:border-slate-800">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-red-100 bg-red-50 text-red-500">
          <IconAlertTriangle size={21} strokeWidth={1.8} />
        </div>

        <h2 className="text-lg font-semibold text-text-title">Tolak Request</h2>
      </div>

      {/* BODY */}
      <div className="px-5 py-6">
        <div className="mb-4 flex items-center justify-between gap-2">
          <label htmlFor="design-rejection-note" className="text-sm font-medium text-text-title">
            Catatan Penolakan <span className="text-red-500">*</span>
          </label>

          <span className="text-xs text-text-secondary">Wajib diisi</span>
        </div>

        <textarea
          id="design-rejection-note"
          value={reason}
          disabled={isSubmitting}
          rows={4}
          onChange={(event) => {
            setReason(event.target.value);

            if (error) {
              setError("");
            }
          }}
          placeholder="Tuliskan catatan penolakan secara jelas..."
          aria-invalid={Boolean(error)}
          aria-describedby={error ? "design-rejection-error" : undefined}
          className={`
            w-full resize-none
            rounded-xl border
            bg-table-card px-3 py-3
            text-sm text-text-title
            outline-none transition
            placeholder:text-slate-400
            focus:ring-2 focus:ring-primary-600/10
            ${
              error
                ? "border-danger-500 focus:border-danger-500"
                : "border-slate-300 focus:border-primary-600 dark:border-slate-600"
            }
          `}
        />

        {error && (
          <small
            id="design-rejection-error"
            className="mt-1 flex items-center gap-1 text-xs text-danger-500"
          >
            <IconAlertCircle size={14} strokeWidth={2} />
            <span>{error}</span>
          </small>
        )}
      </div>

      {/* FOOTER */}
      <div className="flex gap-2 border-t border-slate-100 bg-slate-50 px-5 py-4 dark:border-slate-800 dark:bg-slate-900">
        <Button
          label="Batal"
          variant="secondary"
          className="flex-1"
          disabled={isSubmitting}
          onClick={handleClose}
        />

        <Button
          label={isSubmitting ? "Memproses..." : "Tolak"}
          variant="danger"
          className="flex-1"
          disabled={isSubmitting}
          onClick={handleConfirm}
        />
      </div>
    </Modal>
  );
}
