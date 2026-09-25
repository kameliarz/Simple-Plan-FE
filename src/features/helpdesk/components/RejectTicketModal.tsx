import React, { useState } from "react";
import { AlertTriangle, X } from "lucide-react";
import Button from "../../../components/ui/Button";

interface RejectTicketModalProps {
  isOpen: boolean;
  ticketCode?: string;
  onClose: () => void;
  onConfirmReject: (reason: string) => void;
}

export const RejectTicketModal: React.FC<RejectTicketModalProps> = ({
  isOpen,
  ticketCode = "TIK-2023-045",
  onClose,
  onConfirmReject,
}) => {
  const [reason, setReason] = useState("");
  const [error, setError] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason.trim()) {
      setError(true);
      return;
    }
    onConfirmReject(reason);
    setReason("");
    setError(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop Overlay */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Modal Dialog Box */}
      <div className="relative w-full sm:max-w-md bg-white dark:bg-[#1e293b] rounded-t-2xl sm:rounded-2xl p-5 pt-7 sm:pt-5 shadow-2xl z-10 space-y-4 border border-slate-100 dark:border-slate-800 animate-in slide-in-from-bottom-full sm:zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
        {/* Drag handle for mobile */}
        <div className="w-full flex justify-center py-2 sm:hidden absolute top-0 left-0 right-0 z-10">
          <div className="w-12 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full"></div>
        </div>

        {/* Header Modal */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-100 dark:border-rose-900/60 flex items-center justify-center text-rose-500 shrink-0">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                Tolak Tiket
              </h3>
              <p className="text-xs text-slate-400 font-medium">#{ticketCode}</p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Alasan Penolakan */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <label
                htmlFor="alasan-penolakan"
                className="font-semibold text-slate-800 dark:text-slate-200"
              >
                Alasan Penolakan <span className="text-rose-500">*</span>
              </label>
              <span className="text-[11px] text-slate-400">Wajib diisi</span>
            </div>

            <textarea
              id="alasan-penolakan"
              rows={4}
              value={reason}
              onChange={(e) => {
                setReason(e.target.value);
                if (error) setError(false);
              }}
              placeholder="Tuliskan alasan penolakan tiket secara jelas (contoh: deskripsi kurang lengkap, salah kategori, atau duplikasi laporan)..."
              className={`w-full text-xs rounded-xl border p-3 focus:outline-none focus:ring-2 transition resize-none bg-slate-50/50 dark:bg-slate-900/50 dark:text-slate-100 placeholder:text-slate-400 ${
                error
                  ? "border-rose-400 focus:ring-rose-200"
                  : "border-slate-200 dark:border-slate-700 focus:ring-blue-200 dark:focus:ring-blue-900"
              }`}
            />
            {error && (
              <p className="text-[11px] text-rose-500 font-medium">
                Alasan penolakan tidak boleh kosong.
              </p>
            )}
          </div>

          {/* Tombol Aksi */}
          <div className="flex items-center gap-2.5 pt-1">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1 py-2 text-xs font-semibold rounded-xl dark:bg-slate-800 dark:text-slate-200 dark:border-slate-700"
            >
              Batal
            </Button>
            <button
              type="submit"
              className="flex-1 inline-flex items-center justify-center gap-1.5 py-2.5 px-3 text-xs font-semibold rounded-xl text-white bg-rose-600 hover:bg-rose-700 active:scale-[0.99] transition shadow-sm"
            >
              <X className="w-3.5 h-3.5" />
              <span>Tolak Tiket</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RejectTicketModal;
