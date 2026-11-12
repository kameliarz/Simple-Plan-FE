import { IconCheck, IconX } from "@tabler/icons-react";
import { cn } from "@/lib/utils";

type AlertVariant = "success" | "error";

interface AlertProps {
  message: string;
  variant?: AlertVariant;
  onClose?: () => void;
  className?: string;
}

const variantStyles = {
  success: {
    container: "border-emerald-200 bg-emerald-50 dark:bg-emerald-600",
    iconWrapper: "bg-emerald-100 dark:bg-emerald-100",
    icon: "text-emerald-500",
    text: "text-emerald-700 dark:text-emerald-200",
    close: "text-emerald-500 dark:text-emerald-200 hover:text-emerald-800",
  },

  error: {
    container: "border-red-200 bg-red-50 dark:bg-red-200",
    iconWrapper: "bg-red-100",
    icon: "text-red-600",
    text: "text-red-600",
    close: "text-red-600 hover:text-red-800",
  },
};

export default function Alert({ message, variant = "success", onClose, className }: AlertProps) {
  const styles = variantStyles[variant];

  return (
    <div
      className={cn(
        "flex w-full items-center justify-between",
        "rounded-lg border px-3 py-3",
        styles.container,
        className,
      )}
    >
      <div className="flex min-w-0 items-center gap-2">
        <div
          className={cn(
            "flex h-4 w-4 shrink-0 items-center justify-center rounded-full",
            styles.iconWrapper,
          )}
        >
          {variant === "success" ? (
            <IconCheck size={10} stroke={2.5} className={styles.icon} />
          ) : (
            <IconX size={10} stroke={2.5} className={styles.icon} />
          )}
        </div>

        <span className={cn("truncate text-sm font-normal", styles.text)}>{message}</span>
      </div>

      {onClose && (
        <button
          type="button"
          onClick={onClose}
          className={cn("ml-3 shrink-0 transition-colors", styles.close)}
          aria-label="Tutup"
        >
          <IconX size={12} stroke={2} />
        </button>
      )}
    </div>
  );
}
