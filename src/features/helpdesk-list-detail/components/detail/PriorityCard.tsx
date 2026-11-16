import type { Dispatch, SetStateAction } from "react";
import DetailCard from "./DetailCard";

type Priority = "critical" | "high" | "medium" | "low";

type PriorityOption = {
  value: Priority;
  label: string;
  sla: string;
};

type PriorityConfigItem = {
  limit: string;
  dot: string;
  description: string;
};

type PriorityCardProps = {
  isAssignmentMode: boolean;
  isAssignmentSaved: boolean;
  priority: Priority | null;
  setPriority: Dispatch<SetStateAction<Priority | null>>;
  priorityOptions: PriorityOption[];
  savedPriority: Priority | null;
  priorityConfig: Record<Priority, PriorityConfigItem>;
};

export default function PriorityCard({
  isAssignmentMode,
  isAssignmentSaved,
  priority,
  setPriority,
  priorityOptions,
  savedPriority,
  priorityConfig,
}: PriorityCardProps) {
  return (
    <>
      {isAssignmentMode && (
        <DetailCard
          title="Tingkat Prioritas"
          headerRight={<span className="text-xs text-slate-400">Tentukan SLA penanganan</span>}
        >
          <div className="space-y-2.5 px-3.5 py-4">
            {priorityOptions.map((option) => {
              const isSelected = priority === option.value;

              return (
                <label
                  key={option.value}
                  className={`
                    flex
                    cursor-pointer
                    items-center
                    justify-between
                    rounded-xl
                    border
                    px-3
                    py-3
                    transition
                    ${
                      isSelected
                        ? "border-primary-500 bg-blue-50/50"
                        : "border-slate-200 bg-white hover:border-slate-300"
                    }
                    dark:border-slate-700
                    dark:bg-slate-800
                  `}
                >
                  <div className="flex items-center gap-2.5">
                    <input
                      type="radio"
                      name="priority"
                      value={option.value}
                      checked={isSelected}
                      onChange={() => setPriority(option.value)}
                      className="
                        h-4
                        w-4
                        cursor-pointer
                        accent-primary-500
                      "
                    />

                    <span
                      className={`
                        text-xs
                        ${isSelected ? "font-medium text-text-title" : "text-text-secondary"}
                      `}
                    >
                      {option.label}
                    </span>
                  </div>

                  <span
                    className={`
                      rounded-md
                      border
                      px-2
                      py-1
                      text-xs
                      ${
                        isSelected && option.label === "Critical"
                          ? "border-red-200 bg-red-50 text-red-500"
                          : "border-slate-200 bg-slate-50 text-slate-400"
                      }
                    `}
                  >
                    {option.sla}
                  </span>
                </label>
              );
            })}
          </div>
        </DetailCard>
      )}

      {isAssignmentSaved && savedPriority && (
        <DetailCard
          title="Tingkat Prioritas"
          headerRight={
            <span
              className="
                rounded-md
                bg-red-50
                px-2 py-1
                text-[11px] font-medium
                text-red-500
                dark:bg-red-200/85
              "
            >
              {priorityConfig[savedPriority].limit}
            </span>
          }
        >
          <div className="px-4 py-4 sm:px-6">
            <div className="flex items-start gap-3">
              <span
                className={`
                  mt-1.5
                  h-3 w-3 shrink-0
                  rounded-full
                  ${priorityConfig[savedPriority].dot}
                `}
              />

              <div className="min-w-0">
                <p className="text-sm font-semibold text-text-title">
                  {priorityOptions.find((item) => item.value === savedPriority)?.label}
                </p>

                <p className="mt-1 text-sm text-text-secondary">
                  {priorityConfig[savedPriority].description}
                </p>
              </div>
            </div>
          </div>
        </DetailCard>
      )}
    </>
  );
}
