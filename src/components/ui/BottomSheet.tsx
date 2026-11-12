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
    if (!isOpen) return;

    const previousOverflow = document.body.style.overflow;

    document.body.style.overflow = "hidden";

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="
        fixed inset-0 z-50
        flex items-end justify-center
      "
    >
      {/* Backdrop */}
      <button
        type="button"
        aria-label="Tutup filter"
        tabIndex={-1}
        onClick={onClose}
        className="
          absolute inset-0
          cursor-default
          bg-black/50
          backdrop-blur-[1px]
          animate-in fade-in
          duration-200
        "
      />

      {/* Bottom sheet */}
      <section
        role="dialog"
        aria-modal="true"
        aria-label={title || "Filter"}
        className={cn(
          `
            relative z-10
            flex w-full flex-col
            max-h-[90dvh]
            overflow-hidden
            rounded-t-[22px]
            border border-b-0
            border-slate-200
            bg-white
            shadow-2xl
            dark:border-slate-700
            dark:bg-[#1e293b]
            animate-in slide-in-from-bottom
            duration-300
          `,
          className,
        )}
      >
        {/* Header */}
        <div
          className="
            flex shrink-0 items-center
            justify-between
            px-5 pb-3 pt-5
          "
        >
          {title && (
            <h3
              className="
                text-base font-semibold
                text-slate-900
                dark:text-slate-100
              "
            >
              {title}
            </h3>
          )}

          <button
            type="button"
            onClick={onClose}
            aria-label="Tutup"
            className="
              ml-auto rounded-full p-1
              text-slate-500
              transition-colors
              hover:bg-slate-100
              hover:text-slate-800
              focus-visible:outline-none
              focus-visible:ring-2
              focus-visible:ring-blue-500
              dark:text-slate-400
              dark:hover:bg-slate-800
              dark:hover:text-white
            "
          >
            <X size={21} strokeWidth={1.8} />
          </button>
        </div>

        {/* Scrollable content */}
        <div
          className="
            min-h-0 flex-1
            overflow-y-auto
            overscroll-contain
            px-5 pb-5
          "
        >
          {children}
        </div>

        {/* Footer */}
        {footer && (
          <div
            className="
              shrink-0
              border-t border-slate-100
              bg-white
              px-5 pb-[max(20px,env(safe-area-inset-bottom))]
              pt-4
              dark:border-slate-700
              dark:bg-[#1e293b]
            "
          >
            {footer}
          </div>
        )}
      </section>
    </div>
  );
};

export default BottomSheet;
