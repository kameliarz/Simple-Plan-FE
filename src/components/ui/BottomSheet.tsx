import React, { useEffect } from "react";
import { X } from "lucide-react";
import { cn } from "../../lib/utils";

export interface BottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  className?: string;
}

export const BottomSheet: React.FC<BottomSheetProps> = ({
  isOpen,
  onClose,
  title,
  children,
  footer,
  className,
}) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Sheet Drawer */}
      <div
        className={cn(
          "relative w-full max-w-md bg-white dark:bg-[#1e293b] rounded-t-3xl p-5 shadow-2xl z-10 space-y-5 animate-in slide-in-from-bottom duration-300 border-t border-slate-100 dark:border-slate-800",
          className,
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between">
          {title && (
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">{title}</h3>
          )}
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition ml-auto cursor-pointer"
            aria-label="Tutup"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="space-y-4">{children}</div>

        {/* Optional Footer */}
        {footer && <div className="pt-2">{footer}</div>}
      </div>
    </div>
  );
};

export default BottomSheet;
