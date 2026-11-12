import { IconAlertCircle, IconUsersGroup, IconPlus, IconCheck } from "@tabler/icons-react";

import Button from "@/components/ui/ui-template/Button";

import type { DesignOfficer, DesignPriority } from "../types/graphicDesignDetail.types";

interface AssignmentCardProps {
  priority: DesignPriority | "";
  officer: DesignOfficer | null;
  priorityError: string;
  officerError: string;
  isSaving: boolean;
  onPriorityChange: (value: DesignPriority | "") => void;
  onOpenOfficerModal: () => void;
  onSave: () => void;
}

const priorityOptions: DesignPriority[] = ["Tinggi", "Sedang", "Rendah"];

export default function AssignmentCard({
  priority,
  officer,
  priorityError,
  officerError,
  isSaving,
  onPriorityChange,
  onOpenOfficerModal,
  onSave,
}: AssignmentCardProps) {
  return (
    <div className="space-y-5">
      {/* ==================================
          CARD PRIORITAS
      ================================== */}
      <section className="rounded-xl border border-slate-100 bg-white px-5 py-5 shadow-sm dark:border-slate-700 dark:bg-table-card">
        <h2 className="mb-3 text-sm font-medium text-text-title">
          Prioritas <span className="text-red-500">*</span>
        </h2>

        <div className="space-y-2">
          {priorityOptions.map((option) => {
            const isSelected = priority === option;

            return (
              <label
                key={option}
                className={`
                  flex min-h-11 cursor-pointer
                  items-center gap-3 rounded-lg
                  border px-3 py-2.5 transition
                  ${
                    priorityError
                      ? "border-red-400"
                      : isSelected
                        ? "border-primary-600 bg-blue-50 dark:bg-blue-950/30"
                        : "border-slate-200 bg-white dark:border-slate-700 dark:bg-table-card"
                  }
                `}
              >
                <input
                  type="radio"
                  name="design-priority"
                  value={option}
                  checked={isSelected}
                  disabled={isSaving}
                  onChange={() => onPriorityChange(option)}
                  className="
                    h-4 w-4 shrink-0
                    cursor-pointer
                    accent-primary-600
                "
                />
                <span className="text-sm text-text-title">{option}</span>
              </label>
            );
          })}
        </div>

        {priorityError && (
          <small className="mt-2 flex items-center gap-1 text-xs text-danger-500">
            <IconAlertCircle size={14} strokeWidth={2} />
            <span>{priorityError}</span>
          </small>
        )}
      </section>

      {/* ==================================
          CARD PETUGAS
      ================================== */}
      <section className="rounded-xl border border-slate-100 bg-white px-5 py-5 shadow-sm dark:border-slate-700 dark:bg-table-card">
        <h2 className="mb-3 flex items-center gap-2 text-sm font-medium text-text-title">
          <IconUsersGroup size={18} strokeWidth={1.7} />

          <span>
            Petugas<span className="text-red-500">*</span>
          </span>
        </h2>

        {officer ? (
          <div className="mb-3 flex items-center gap-3 rounded-lg border border-primary-600 bg-blue-50 px-3 py-2.5 dark:bg-blue-950/30">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary-600 text-xs font-semibold text-white">
              {officer.initials}
            </div>

            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-text-title">{officer.name}</p>

              <p className="truncate text-xs text-text-secondary">{officer.role}</p>
            </div>

            <IconCheck size={19} strokeWidth={2} className="shrink-0 text-primary-600" />
          </div>
        ) : null}

        <Button
          type="button"
          variant="primary"
          className="w-full"
          disabled={isSaving}
          onClick={onOpenOfficerModal}
          icon={<IconPlus size={16} strokeWidth={2} />}
          label={officer ? "Ganti Petugas" : "Assign Petugas"}
        />

        {officerError && (
          <small className="mt-2 flex items-center gap-1 text-xs text-danger-500">
            <IconAlertCircle size={14} strokeWidth={2} />
            <span>{officerError}</span>
          </small>
        )}
      </section>

      {/* ==================================
          SIMPAN DAN TUGASKAN
      ================================== */}
      <div className="flex justify-end">
        <Button
          type="button"
          variant="primary"
          label={isSaving ? "Menyimpan..." : "Simpan dan Tugaskan"}
          disabled={isSaving}
          onClick={onSave}
          className="w-full"
        />
      </div>
    </div>
  );
}
