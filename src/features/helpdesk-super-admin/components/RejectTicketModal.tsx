import { useState } from "react";
import { AlertTriangle } from "lucide-react";

import Modal from "@/components/ui/ui-template/Modal";
import Button from "@/components/ui/ui-template/Button";
import TextArea from "@/components/ui/ui-template/TextArea";

interface RejectTicketModalProps {
  isOpen: boolean;
  ticketCode?: string;
  onClose: () => void;
  onConfirmReject: (reason: string) => void;
}

const RejectTicketModal = ({
  isOpen,
  ticketCode = "TIK-2023-045",
  onClose,
  onConfirmReject,
}: RejectTicketModalProps) => {
  const [reason, setReason] = useState("");
  const [reasonError, setReasonError] = useState("");

  const handleSubmit = () => {
    if (!reason.trim()) {
      setReasonError("Alasan penolakan tidak boleh kosong.");
      return;
    }

    setReasonError("");

    onConfirmReject(reason.trim());

    setReason("");
  };

  const handleClose = () => {
    setReason("");
    setReasonError("");
    onClose();
  };

  return (
    <Modal
      show={isOpen}
      onClose={handleClose}
      closeable
      showHeader
      title={
        <div className="flex flex-col">
          <span className="text-sm font-semibold text-text-title">Tolak Tiket</span>

          <span className="mt-0.5 text-[11px] font-medium text-text-secondary">#{ticketCode}</span>
        </div>
      }
      icon={
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-rose-50 text-rose-500 dark:bg-rose-950/40 dark:text-rose-400">
          <AlertTriangle size={17} strokeWidth={2} />
        </div>
      }
      maxWidth="md"
    >
      <div className="space-y-5">
        {/* Alasan Penolakan */}
        <div>
          <label className="mb-1.5 block text-sm font-medium text-text-primary">
            Alasan Penolakan
            <span className="text-rose-500">*</span>
          </label>

          <TextArea
            value={reason}
            onChange={(event) => {
              setReason(event.target.value);
              setReasonError("");
            }}
            placeholder="Tuliskan alasan penolakan tiket secara jelas..."
            rows={4}
            error={reasonError}
          />
        </div>
      </div>

      {/* Footer */}
      <div className="mt-6 flex justify-end gap-2 border-t border-slate-100 pt-3 dark:border-slate-700">
        <Button type="button" label="Batal" variant="secondary" size="sm" onClick={handleClose} />

        <Button
          type="button"
          label="Tolak Tiket"
          variant="danger"
          size="sm"
          onClick={handleSubmit}
        />
      </div>
    </Modal>
  );
};

export default RejectTicketModal;
