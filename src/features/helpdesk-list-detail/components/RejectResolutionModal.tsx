import { useState } from "react";
import { Tag } from "lucide-react";

import Modal from "@/components/ui/ui-template/Modal";
import Button from "@/components/ui/ui-template/Button";
import TextArea from "@/components/ui/ui-template/TextArea";

interface RejectResolutionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (reason: string) => void;
}

const RejectResolutionModal = ({ isOpen, onClose, onSave }: RejectResolutionModalProps) => {
  const [reason, setReason] = useState("");
  const [reasonError, setReasonError] = useState("");

  const handleSave = () => {
    if (!reason.trim()) {
      setReasonError("Keterangan kendala wajib diisi.");
      return;
    }

    setReasonError("");

    onSave(reason.trim());
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
      title="Keterangan Kendala"
      icon={<Tag size={18} />}
      maxWidth="xl"
    >
      <div className="space-y-5">
        {/* Keterangan Kendala */}
        <div>
          <label className="mb-1.5 block text-xs font-medium text-text-primary">
            Keterangan Kendala
            <span className="text-red-500">*</span>
          </label>

          <TextArea
            value={reason}
            onChange={(event) => {
              setReason(event.target.value);
              setReasonError("");
            }}
            placeholder=""
            rows={3}
            error={reasonError}
          />
        </div>
      </div>

      {/* Footer */}
      <div className="mt-6 flex justify-end gap-2 border-t border-slate-100 pt-3">
        <Button type="button" label="Batal" variant="secondary" size="sm" onClick={handleClose} />

        <Button
          type="button"
          label="Tolak Penyelesaian"
          variant="primary"
          size="sm"
          onClick={handleSave}
        />
      </div>
    </Modal>
  );
};

export default RejectResolutionModal;
