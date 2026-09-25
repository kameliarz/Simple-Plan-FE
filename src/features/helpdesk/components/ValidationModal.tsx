import React from "react";
import { X, AlertTriangle } from "lucide-react";
import Button from "../../../components/ui/Button";

interface ValidationModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  message: string;
}

export const ValidationModal: React.FC<ValidationModalProps> = ({
  isOpen,
  onClose,
  title = "Data Belum Lengkap!",
  message,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-sm shadow-xl p-6 text-center animate-in zoom-in-95 duration-200 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="w-12 h-12 rounded-full bg-amber-50 dark:bg-amber-900/30 flex items-center justify-center mx-auto mb-4">
          <AlertTriangle className="w-6 h-6 text-amber-500" />
        </div>

        <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-2">{title}</h3>
        <p className="text-sm text-slate-600 dark:text-slate-400 mb-6">{message}</p>

        <Button
          variant="outline"
          onClick={onClose}
          className="w-full justify-center"
        >
          Mengerti
        </Button>
      </div>
    </div>
  );
};
