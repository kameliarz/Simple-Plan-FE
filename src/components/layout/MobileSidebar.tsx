import { useEffect } from "react";
import { createPortal } from "react-dom";

import Sidebar from "@/components/Sidebar/Sidebar";

interface MobileSidebarProps {
  show: boolean;
  onClose: () => void;
  isDarkMode: boolean;
  toggleDarkMode: () => void;
}

export default function MobileSidebar({
  show,
  onClose,
  isDarkMode,
  toggleDarkMode,
}: MobileSidebarProps) {
  // ==========================================
  // ESCAPE & BODY SCROLL LOCK
  // ==========================================
  useEffect(() => {
    if (!show) return;

    const previousOverflow = document.body.style.overflow;

    document.body.style.overflow = "hidden";

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("keydown", handleEscape);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleEscape);
    };
  }, [show, onClose]);

  // ==========================================
  // CLOSE SIDEBAR ON NAVIGATION
  // ==========================================
  const handleNavigationClick = (event: React.MouseEvent<HTMLDivElement>) => {
    const target = event.target;

    if (!(target instanceof Element)) return;

    const link = target.closest("a[href]");

    if (link) {
      onClose();
    }
  };

  return createPortal(
    <div
      aria-hidden={!show}
      inert={!show}
      className={`
        fixed inset-0 z-100 lg:hidden
        transition-[visibility] duration-300
        ${show ? "visible pointer-events-auto" : "invisible pointer-events-none delay-300"}
      `}
    >
      {/* BACKDROP */}
      <button
        type="button"
        aria-label="Tutup sidebar"
        onClick={onClose}
        tabIndex={show ? 0 : -1}
        className={`
          absolute inset-0 h-full w-full
          bg-black/40
          transition-opacity duration-300 ease-in-out
          motion-reduce:transition-none
          ${show ? "opacity-100" : "opacity-0"}
        `}
      />

      {/* SIDEBAR PANEL */}
      <div
        role="dialog"
        aria-modal={show ? true : undefined}
        aria-label="Menu navigasi"
        onClickCapture={handleNavigationClick}
        className={`
          absolute inset-y-0 left-0
          w-64 max-w-[85vw]
          bg-sidebar shadow-xl
          transform-gpu
          transition-transform duration-300 ease-in-out
          motion-reduce:transition-none
          ${show ? "translate-x-0" : "-translate-x-full"}
        `}
      >
        <Sidebar isDarkMode={isDarkMode} toggleDarkMode={toggleDarkMode} onClose={onClose} />
      </div>
    </div>,
    document.body,
  );
}
