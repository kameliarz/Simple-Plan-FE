import React, { useEffect } from "react";
import { X, Check, Info } from "lucide-react";
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

  const getVariantStyles = () => {
    switch (variant) {
      case "success":
        return {
          container: "bg-slate-900/95 border border-emerald-500/40",
          iconBg: "bg-emerald-500 text-white",
          icon: <Check className="w-3.5 h-3.5" />,
        };
      case "info":
        return {
          container: "bg-slate-900/95 border border-blue-500/40",
          iconBg: "bg-blue-500 text-white",
          icon: <Info className="w-3.5 h-3.5" />,
        };
      case "danger":
      default:
        return {
          container: "bg-slate-900/95 border border-rose-500/40",
          iconBg: "bg-rose-500 text-white",
          icon: <X className="w-3.5 h-3.5" />,
        };
    }
  };

  const currentVariant = getVariantStyles();

  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 animate-in fade-in slide-in-from-top-4 duration-300 pointer-events-auto">
      <div
        className={cn(
          "flex items-center gap-2.5 px-4 py-2.5 rounded-full shadow-lg text-white text-xs font-medium backdrop-blur-md",
          currentVariant.container,
          className,
        )}
      >
        <span
          className={cn(
            "flex items-center justify-center w-5 h-5 rounded-full shrink-0",
            currentVariant.iconBg,
          )}
        >
          {currentVariant.icon}
        </span>
        <span className="tracking-wide">{message}</span>
        <button
          type="button"
          onClick={onClose}
          className="ml-1 text-white/70 hover:text-white transition"
          aria-label="Tutup notifikasi"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};

export default Toast;
