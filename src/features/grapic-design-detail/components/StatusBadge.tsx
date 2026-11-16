import type { DesignPriority, DesignStatus } from "../types/graphicDesignDetail.types";

type StatusBadgeProps =
  | {
      type: "priority";
      value: DesignPriority;
    }
  | {
      type: "status";
      value: DesignStatus;
    };

const priorityStyles: Record<DesignPriority, string> = {
  Tinggi: "bg-badge-denied-fill text-badge-denied-text border-badge-denied-stroke",
  Sedang:
    "bg-badge-classificated-fill text-badge-classificated-text border-badge-classificated-stroke",
  Rendah: "bg-badge-process-fill text-badge-process-text border-badge-process-stroke",
};

const statusStyles: Record<DesignStatus, string> = {
  Baru: "bg-badge-new-fill text-badge-new-text border-badge-new-stroke",
  Ditugaskan:
    "bg-badge-classificated-fill text-badge-classificated-text border-badge-classificated-stroke",
  "Menunggu Persetujuan":
    "bg-badge-process-fill text-badge-process-text border-badge-process-stroke",
  "Perlu Revisi":
    "bg-badge-escalation-fill text-badge-escalation-text border-badge-escalation-stroke",
  Selesai: "bg-badge-done-fill text-badge-done-text border-badge-done-stroke",
  Ditolak: "bg-badge-denied-fill text-badge-denied-text border-badge-denied-stroke",
};

export default function StatusBadge(props: StatusBadgeProps) {
  const isPriority = props.type === "priority";

  const styles = isPriority ? priorityStyles[props.value] : statusStyles[props.value];

  const label = isPriority ? `Prioritas: ${props.value}` : props.value;

  return (
    <span
      className={`
        inline-flex
        items-center
        gap-1.5
        rounded-full
        border
        px-2.5 py-1
        text-xs
        font-medium
        whitespace-nowrap
        ${styles}
      `}
    >
      {!isPriority && (
        <span
          className="
            h-1.5 w-1.5
            rounded-full
            bg-current
          "
        />
      )}

      {label}
    </span>
  );
}
