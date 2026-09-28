import React, { useState } from "react";
import { Check } from "lucide-react";
import BottomSheet from "../../../../components/ui/BottomSheet";
import Button from "../../../../components/ui/Button";
import { cn } from "../../../../lib/utils";

interface UserFilterBottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  units: { id: number; name: string }[];
  currentUnitFilter: number | "";
  currentStatusFilter: string;
  onApply: (unitId: number | "", status: string) => void;
}

export const UserFilterBottomSheet: React.FC<UserFilterBottomSheetProps> = ({
  isOpen,
  onClose,
  units,
  currentUnitFilter,
  currentStatusFilter,
  onApply,
}) => {
  const [selectedUnit, setSelectedUnit] = useState<number | "">(currentUnitFilter);
  const [selectedStatus, setSelectedStatus] = useState<string>(currentStatusFilter);

  // Sync state when opened
  React.useEffect(() => {
    if (isOpen) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setSelectedUnit(currentUnitFilter);

      setSelectedStatus(currentStatusFilter);
    }
  }, [isOpen, currentUnitFilter, currentStatusFilter]);

  const handleReset = () => {
    setSelectedUnit("");
    setSelectedStatus("");
  };

  const handleApply = () => {
    onApply(selectedUnit, selectedStatus);
    onClose();
  };

  const footerContent = (
    <div className="flex items-center gap-3 w-full">
      <Button variant="outline" className="flex-1 rounded-xl h-11" onClick={handleReset}>
        Reset
      </Button>
      <Button
        className="flex-1 rounded-xl h-11 bg-blue-900 hover:bg-blue-950 text-white"
        onClick={handleApply}
      >
        Terapkan
      </Button>
    </div>
  );

  return (
    <BottomSheet isOpen={isOpen} onClose={onClose} title="Filter Unit" footer={footerContent}>
      <div className="space-y-4 max-h-[60vh] overflow-y-auto pb-4 px-1">
        {/* Unit Filter */}
        <div className="space-y-2.5">
          <button
            type="button"
            onClick={() => setSelectedUnit("")}
            className={cn(
              "w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-medium border transition cursor-pointer text-left",
              selectedUnit === ""
                ? "border-blue-900 text-blue-900 bg-blue-50/50"
                : "border-slate-200 text-slate-700 hover:border-slate-300",
            )}
          >
            <div className="flex items-center gap-3">
              <div
                className={cn(
                  "w-2 h-2 rounded-full",
                  selectedUnit === "" ? "bg-blue-900" : "bg-slate-200",
                )}
              />
              Semua Unit
            </div>
            {selectedUnit === "" && <Check className="w-4 h-4 text-blue-900" />}
          </button>

          {units.map((unit) => {
            const isSelected = selectedUnit === unit.id;
            return (
              <button
                key={unit.id}
                type="button"
                onClick={() => setSelectedUnit(isSelected ? "" : unit.id)}
                className={cn(
                  "w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-medium border transition cursor-pointer text-left",
                  isSelected
                    ? "border-blue-900 text-blue-900 bg-blue-50/50"
                    : "border-slate-200 text-slate-700 hover:border-slate-300",
                )}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={cn(
                      "w-2 h-2 rounded-full",
                      isSelected ? "bg-blue-900" : "bg-slate-200",
                    )}
                  />
                  {unit.name}
                </div>
                {isSelected && <Check className="w-4 h-4 text-blue-900" />}
              </button>
            );
          })}
        </div>

        {/* Status Filter */}
        <div className="space-y-2.5 pt-2">
          <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 block">
            Status
          </span>
          <div className="flex flex-wrap gap-2">
            {["", "Aktif", "Nonaktif"].map((st) => {
              const isSelected = selectedStatus === st;
              const label = st === "" ? "Semua Status" : st;
              return (
                <button
                  key={st}
                  type="button"
                  onClick={() => setSelectedStatus(isSelected ? "" : st)}
                  className={cn(
                    "px-4 py-2 rounded-xl text-xs font-medium border transition select-none cursor-pointer",
                    isSelected
                      ? "border-blue-900 bg-blue-900 text-white"
                      : "border-slate-200 text-slate-600 hover:bg-slate-50",
                  )}
                >
                  {label}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </BottomSheet>
  );
};

export default UserFilterBottomSheet;
