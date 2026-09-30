import { useState } from "react";
import { X } from "lucide-react";
import { toggleUserStatus } from "../services/userApi";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  userId: number | string;
  onSuccess: () => void;
}

export default function UserStatusModal({ isOpen, onClose, userId, onSuccess }: Props) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleActivate = async () => {
    setIsLoading(true);
    setError(null);
    try {
      await toggleUserStatus(userId, { status_user: "Aktif" });
      onSuccess();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Terjadi kesalahan saat mengaktifkan user");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="relative w-full max-w-sm rounded-3xl bg-white p-8 text-center shadow-xl">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 p-1 text-slate-400 hover:text-slate-600"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full border-[3px] border-orange-100 text-orange-400">
          <span className="text-[40px] font-bold">?</span>
        </div>

        <h3 className="mb-8 text-[19px] font-bold text-slate-900">Aktifkan kembali user ini?</h3>

        {error && <p className="mb-4 text-sm text-red-600">{error}</p>}

        <div className="flex justify-center">
          <button
            onClick={handleActivate}
            disabled={isLoading}
            className="rounded-xl bg-[#113a77] px-8 py-3 text-[15px] font-semibold text-white transition hover:bg-[#0b2957] disabled:opacity-70"
          >
            {isLoading ? "Menyimpan..." : "Ya, Aktifkan"}
          </button>
        </div>
      </div>
    </div>
  );
}
