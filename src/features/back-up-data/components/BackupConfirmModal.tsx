import Modal from "@/components/ui/ui-template/Modal";
import Button from "@/components/ui/ui-template/Button";

interface BackupConfirmModalProps {
  show: boolean;
  onClose: () => void;
  onConfirm: () => void | Promise<void>;
  isLoading?: boolean;
}

export default function BackupConfirmModal({
  show,
  onClose,
  onConfirm,
  isLoading = false,
}: BackupConfirmModalProps) {
  return (
    <Modal show={show} onClose={onClose} closeable={!isLoading} showHeader={false} maxWidth="sm">
      <div className="rounded-xl bg-table-card px-6 py-5">
        {/* JUDUL */}
        <h2 className="font-semibold text-slate-900 dark:text-slate-100 mb-2">Back Up Sekarang?</h2>

        {/* DESKRIPSI */}
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Back up mencakup seluruh data sistem.
        </p>

        {/* TOMBOL AKSI */}
        <div className="mt-6 grid grid-cols-2 gap-2">
          <Button
            type="button"
            label="Batal"
            variant="secondary"
            onClick={onClose}
            disabled={isLoading}
            className="
              w-full
              border-primary-600
              text-primary-600
              hover:bg-blue-50
              dark:border-blue-400
              dark:text-blue-400
              dark:hover:bg-slate-800
            "
          />

          <Button
            type="button"
            label={isLoading ? "Memproses..." : "Ya"}
            variant="primary"
            onClick={() => void onConfirm()}
            disabled={isLoading}
            className="w-full"
          />
        </div>
      </div>
    </Modal>
  );
}
