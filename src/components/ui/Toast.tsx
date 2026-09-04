import React, { useEffect } from "react";
import { X } from "lucide-react";
import { cn } from "../../lib/utils";

interface ToastProps {
  show: boolean;
  message: string;
  onClose: () => void;
  duration?: number;
  variant?: "danger" | "success" | "info";
  className?: string;
}

export const Toast: React.FC<ToastProps> = ({
  show,
  message,
  onClose,
  duration = 3500,
  variant = "danger",
  className,
}) => {
  useEffect(() => {
    if (!show) return;
    const timer = setTimeout(() => {
      onClose();
    }, duration);
    return () => clearTimeout(timer);
  }, [show, duration, onClose]);

  if (!show) return null;

  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 animate-in fade-in slide-in-from-top-4 duration-300 pointer-events-auto">
      <div
        className={cn(
          "flex items-center gap-2.5 px-4 py-2.5 rounded-full shadow-lg text-white text-xs font-medium backdrop-blur-md",
          variant === "danger"
            ? "bg-[#1e3a8a]/95 border border-blue-400/30"
            : "bg-slate-900/95 border border-slate-700",
          className,
        )}
      >
        <span className="flex items-center justify-center w-5 h-5 rounded-full bg-rose-500/90 text-white shrink-0">
          <X className="w-3.5 h-3.5" />
        </span>
        <span className="tracking-wide">{message}</span>
        <button
          type="button"
          onClick={onClose}
          className="ml-1 text-white/70 hover:text-white transition"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};

export default Toast;
