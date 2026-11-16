import { useCallback, useEffect, useState, type ReactNode } from "react";

import {
  IconCheck,
  IconX,
  IconAlertCircle,
  IconAlertTriangle,
  IconInfoCircle,
} from "@tabler/icons-react";

import { ToastContext, type ToastType } from "./ToastContext";

type ToastItem = {
  id: number;
  type: ToastType;
  message: string;
  duration: number;
};

const toastStyles = {
  success: {
    container: "border-emerald-200 bg-emerald-50 dark:border-emerald-800 dark:bg-emerald-950",
    icon: "bg-emerald-100 text-emerald-600",
    text: "text-emerald-800 dark:text-emerald-200",
    close: "text-emerald-600 hover:bg-emerald-100",
    Icon: IconCheck,
  },
  error: {
    container: "border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950",
    icon: "bg-red-100 text-red-600",
    text: "text-red-800 dark:text-red-200",
    close: "text-red-600 hover:bg-red-100",
    Icon: IconAlertCircle,
  },
  warning: {
    container: "border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-950",
    icon: "bg-amber-100 text-amber-600",
    text: "text-amber-800 dark:text-amber-200",
    close: "text-amber-600 hover:bg-amber-100",
    Icon: IconAlertTriangle,
  },
  info: {
    container: "border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950",
    icon: "bg-blue-100 text-blue-600",
    text: "text-blue-800 dark:text-blue-200",
    close: "text-blue-600 hover:bg-blue-100",
    Icon: IconInfoCircle,
  },
};

interface ToastNotificationProps {
  toast: ToastItem;
  onClose: (id: number) => void;
}

function ToastNotification({ toast, onClose }: ToastNotificationProps) {
  const style = toastStyles[toast.type];
  const Icon = style.Icon;

  useEffect(() => {
    if (toast.duration <= 0) return;

    const timer = window.setTimeout(() => {
      onClose(toast.id);
    }, toast.duration);

    return () => window.clearTimeout(timer);
  }, [toast.id, toast.duration, onClose]);

  return (
    <div
      role={toast.type === "error" ? "alert" : "status"}
      className={`
        pointer-events-auto flex w-full items-center gap-2.5
        rounded-full border px-3 py-2.5 shadow-sm
        ${style.container}
      `}
    >
      <div
        className={`
          flex h-6 w-6 shrink-0 items-center
          justify-center rounded-full
          ${style.icon}
        `}
      >
        <Icon size={15} strokeWidth={2} />
      </div>

      <p
        className={`
          min-w-0 flex-1 text-xs font-medium
          leading-relaxed sm:text-sm
          ${style.text}
        `}
      >
        {toast.message}
      </p>

      <button
        type="button"
        onClick={() => onClose(toast.id)}
        aria-label="Tutup notifikasi"
        className={`
          flex h-6 w-6 shrink-0 items-center
          justify-center rounded-md transition-colors
          ${style.close}
        `}
      >
        <IconX size={15} strokeWidth={2} />
      </button>
    </div>
  );
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const removeToast = useCallback((id: number) => {
    setToasts((previous) => previous.filter((toast) => toast.id !== id));
  }, []);

  const showToast = useCallback((message: string, type: ToastType = "success", duration = 4000) => {
    const id = Date.now() + Math.random();

    setToasts((previous) => [
      ...previous,
      {
        id,
        message,
        type,
        duration,
      },
    ]);
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}

      <div
        className="
          pointer-events-none fixed
          left-1/2 top-5 z-9999
          flex w-[calc(100%-2rem)] max-w-sm
          -translate-x-1/2
          flex-col gap-3
        "
      >
        {toasts.map((toast) => (
          <ToastNotification key={toast.id} toast={toast} onClose={removeToast} />
        ))}
      </div>
    </ToastContext.Provider>
  );
}
