import { createContext } from "react";

export type ToastType = "success" | "error" | "warning" | "info";

export interface ToastContextType {
  showToast: (message: string, type?: ToastType, duration?: number) => void;
}

export const ToastContext = createContext<ToastContextType | null>(null);
