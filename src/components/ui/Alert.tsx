import React from "react";
import { AlertCircle, CheckCircle, Info, XCircle } from "lucide-react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export type AlertType = "info" | "success" | "warning" | "error";

export interface AlertProps {
  type?: AlertType;
  title?: string;
  children: React.ReactNode;
  className?: string;
}

const alertConfig = {
  info: {
    icon: Info,
    containerClass:
      "bg-blue-50 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800",
    iconClass: "text-blue-500 dark:text-blue-400",
  },
  success: {
    icon: CheckCircle,
    containerClass:
      "bg-green-50 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-800",
    iconClass: "text-green-500 dark:text-green-400",
  },
  warning: {
    icon: AlertCircle,
    containerClass:
      "bg-yellow-50 text-yellow-800 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-300 dark:border-yellow-800",
    iconClass: "text-yellow-500 dark:text-yellow-400",
  },
  error: {
    icon: XCircle,
    containerClass:
      "bg-red-50 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-300 dark:border-red-800",
    iconClass: "text-red-500 dark:text-red-400",
  },
};

export function Alert({ type = "info", title, children, className }: AlertProps) {
  const config = alertConfig[type];
  const Icon = config.icon;

  return (
    <div
      className={cn(
        "p-4 border rounded-lg flex items-start space-x-3",
        config.containerClass,
        className,
      )}
    >
      <Icon className={cn("w-5 h-5 shrink-0 mt-0.5", config.iconClass)} />
      <div>
        {title && <h3 className="font-semibold mb-1">{title}</h3>}
        <div className="text-sm opacity-90">{children}</div>
      </div>
    </div>
  );
}

export default Alert;
