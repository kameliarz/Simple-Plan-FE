import type { DesignRequestStatus } from "../types/designGraphic.types";

interface DesignStatusBadgeProps {
  status: DesignRequestStatus;
}

const statusStyles: Record<DesignRequestStatus, string> = {
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

export default function DesignStatusBadge({ status }: DesignStatusBadgeProps) {
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${
        statusStyles[status] ?? "bg-badge-new-fill text-badge-new-text border-badge-new-stroke"
      }`}
    >
      {status}
    </span>
  );
}
