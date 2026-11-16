import { useState } from "react";
import { X, AlertCircle } from "lucide-react";
import { toggleUserStatus } from "../services/userApi";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  userId: number | string;
  onSuccess: () => void;
}

const ALASAN_OPTIONS = ["Resign", "Cuti Panjang", "Mutasi", "Lainnya"];

export default function UserDeactivateModal({ isOpen, onClose, userId, onSuccess }: Props) {
  const [alasan, setAlasan] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [validationError, setValidationError] = useState("");
  const [apiError, setApiError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleDeactivate = async () => {
    setValidationError("");
    setApiError(null);

    if (!alasan) {
      setValidationError("Alasan nonaktif wajib dipilih!");
      return;
    }

    setIsLoading(true);
    try {
      await toggleUserStatus(userId, {
        status_user: "Nonaktif",
        alasan_nonaktif: alasan as "Resign" | "Cuti Panjang" | "Mutasi" | "Lainnya",
      });
      onSuccess();
    } catch (err: unknown) {
      setApiError(err instanceof Error ? err.message : "Terjadi kesalahan saat menonaktifkan user");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="relative w-full max-w-md rounded-2xl bg-white shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
          <h3 className="text-lg font-bold text-gray-900">Nonaktifkan User</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6">
          <div className="mb-6">
            <label className="mb-2.5 block text-[13px] font-bold text-slate-700">
              Alasan Nonaktif<span className="text-red-500">*</span>
            </label>
            <select
              value={alasan}
              onChange={(e) => {
                setAlasan(e.target.value);
                if (e.target.value) setValidationError("");
              }}
              className={`w-full rounded-xl border px-4 py-3 text-[14px] text-slate-700 outline-none transition-colors focus:border-blue-500 focus:ring-1 focus:ring-blue-500 ${
                validationError ? "border-red-500" : "border-slate-300"
              }`}
            >
              <option value="" disabled>
                Pilih alasan nonaktif
              </option>
              {ALASAN_OPTIONS.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
            {validationError && (
              <div className="mt-2 flex items-center gap-1.5 text-xs text-red-500">
                <AlertCircle className="h-4 w-4" />
                <span>{validationError}</span>
              </div>
            )}
            {apiError && <div className="mt-2 text-xs text-red-500">{apiError}</div>}
          </div>

          {/* Footer Buttons */}
          <div className="flex items-center justify-center gap-3 mt-4">
            <button
              onClick={onClose}
              disabled={isLoading}
              className="rounded-xl border border-slate-300 bg-white px-8 py-3 text-[15px] font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-70"
            >
              Batal
            </button>
            <button
              onClick={handleDeactivate}
              disabled={isLoading}
              className="rounded-xl bg-[#113a77] px-8 py-3 text-[15px] font-semibold text-white transition hover:bg-[#0b2957] disabled:opacity-70"
            >
              {isLoading ? "..." : "Nonaktifkan"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
