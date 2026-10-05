import { UserRound } from "lucide-react";
import Button from "@/components/ui/ui-template/Button";
import DetailCard from "./DetailCard";

type OfficerSummary = {
  initials: string;
  name: string;
  role: string;
};

type OfficerCardProps = {
  isAssignmentMode: boolean;
  isAssignmentSaved: boolean;
  assignedOfficer: OfficerSummary | null;
  savedOfficer: OfficerSummary | null;
  onOpenAssignModal: () => void;
};

export default function OfficerCard({
  isAssignmentMode,
  isAssignmentSaved,
  assignedOfficer,
  savedOfficer,
  onOpenAssignModal,
}: OfficerCardProps) {
  return (
    <>
      {isAssignmentMode && (
        <DetailCard title="Petugas *" icon={<UserRound size={17} className="text-text-title" />}>
          <div className="px-5 py-4">
            {assignedOfficer ? (
              <div
                className="
                  flex
                  items-center
                  justify-between
                  rounded-lg
                  border
                  border-slate-200
                  bg-button
                  px-3
                  py-2.5
                  dark:border-slate-700
                  dark:bg-slate-800
                "
              >
                <div className="flex min-w-0 items-center gap-3">
                  <div
                    className="
                      flex
                      h-9
                      w-9
                      shrink-0
                      items-center
                      justify-center
                      rounded-full
                      bg-primary-600
                      text-sm
                      font-semibold
                      text-slate-100
                    "
                  >
                    {assignedOfficer.initials}
                  </div>

                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-text-title">
                      {assignedOfficer.name}
                    </p>

                    <p className="mt-0.5 truncate text-xs text-slate-400">{assignedOfficer.role}</p>
                  </div>
                </div>

                <Button
                  type="button"
                  variant="ghost"
                  onClick={onOpenAssignModal}
                  label="Ubah"
                  className="text-xs"
                />
              </div>
            ) : (
              <Button
                type="button"
                variant="primary"
                onClick={onOpenAssignModal}
                icon="+"
                label="Assign Petugas"
                className="w-full"
              />
            )}
          </div>
        </DetailCard>
      )}

      {isAssignmentSaved && savedOfficer && (
        <div
          className="
            overflow-hidden
            rounded-xl
            border
            border-slate-100
            bg-white
            shadow-sm
            dark:border-slate-700
            dark:bg-table-card
          "
        >
          <div className="px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <UserRound size={17} className="text-text-title" />

                <h2 className="text-base font-semibold text-text-title">Petugas</h2>
              </div>

              <span
                className="
                  rounded-md
                  border
                  border-green-200
                  bg-emerald-50
                  px-2
                  py-1
                  text-[11px]
                  font-medium
                  text-green-600
                  dark:bg-emerald-200
                  dark:text-green-700
                "
              >
                Ditugaskan
              </span>
            </div>

            <div className="my-3 border-t border-slate-100 dark:border-slate-700" />

            <div className="flex items-center gap-3">
              <div
                className="
                  flex
                  h-9
                  w-9
                  shrink-0
                  items-center
                  justify-center
                  rounded-full
                  bg-primary-600
                  text-xs
                  font-semibold
                  text-white
                "
              >
                {savedOfficer.initials}
              </div>

              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-text-title">
                  {savedOfficer.name}
                </p>

                <p className="mt-0.5 truncate text-xs text-text-secondary">{savedOfficer.role}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
