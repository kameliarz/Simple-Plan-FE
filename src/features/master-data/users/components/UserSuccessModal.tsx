import { Check, X } from "lucide-react";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  message: string;
}

export default function UserSuccessModal({ isOpen, onClose, title, message }: Props) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-4">
      <div className="relative w-full max-w-sm rounded-3xl bg-white p-8 text-center shadow-xl">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-gray-400 hover:text-gray-600 p-1"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full border-[3px] border-emerald-100 text-emerald-500">
          <Check className="h-8 w-8" strokeWidth={3} />
        </div>

        <h3 className="mb-2.5 text-[22px] font-bold text-gray-900">{title}</h3>
        <p className="text-[15px] text-gray-500">{message}</p>
      </div>
    </div>
  );
}
