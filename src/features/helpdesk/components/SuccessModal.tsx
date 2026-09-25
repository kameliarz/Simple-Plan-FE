import React from "react";
import { Check, X } from "lucide-react";

interface SuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  message: string;
}

export const SuccessModal: React.FC<SuccessModalProps> = ({
  isOpen,
  onClose,
  title,
  message,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl w-full max-w-sm flex flex-col items-center text-center p-8 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition"
        >
          <X className="w-5 h-5" />
        </button>
        
        <div className="w-16 h-16 bg-emerald-50 dark:bg-emerald-900/30 rounded-full flex items-center justify-center text-emerald-500 mb-6 ring-8 ring-emerald-50/50 dark:ring-emerald-900/20">
          <Check className="w-8 h-8" />
        </div>
        
        <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-2">{title}</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400">{message}</p>
      </div>
    </div>
  );
};

export default SuccessModal;
