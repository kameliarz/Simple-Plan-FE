import Modal from "@/components/ui/ui-template/Modal";
import Button from "@/components/ui/ui-template/Button";

interface ApproveDraftModalProps {
  isOpen: boolean;
  isSubmitting: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export default function ApproveDraftModal({
  isOpen,
  isSubmitting,
  onClose,
  onConfirm,
}: ApproveDraftModalProps) {
  return (
    <Modal
      show={isOpen}
      onClose={onClose}
      maxWidth="sm"
      closeable={!isSubmitting}
      showHeader={false}
    >
      <div className="space-y-5 p-5">
        {/* HEADER */}
        <div>
          <h2 className="text-base font-semibold text-text-title">Setujui Draft?</h2>

          <p className="mt-2 text-sm leading-relaxed text-text-secondary">
            Draft desain akan disetujui dan tidak dapat direvisi lagi.
          </p>
        </div>

        {/* ACTIONS */}
        <div className="flex gap-3">
          <Button
            type="button"
            label="Batal"
            variant="secondary"
            className="flex-1"
            disabled={isSubmitting}
            onClick={onClose}
          />

          <Button
            type="button"
            label={isSubmitting ? "Memproses..." : "Setujui"}
            variant="primary"
            className="flex-1"
            disabled={isSubmitting}
            onClick={onConfirm}
          />
        </div>
      </div>
    </Modal>
  );
}
