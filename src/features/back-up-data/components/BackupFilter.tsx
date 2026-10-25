import Search from "@/components/ui/ui-template/Search";
import Dropdown from "@/components/ui/ui-template/Dropdown";
import DateInput from "@/components/ui/ui-template/DateInput";

import { backupTypeOptions, backupStatusOptions } from "../constants/backupOptions";

import type { BackupFilters, BackupType, BackupStatus } from "../types/backup.types";

interface BackupFilterProps {
  filters: BackupFilters;
  onChange: (filters: BackupFilters) => void;
}

export default function BackupFilter({ filters, onChange }: BackupFilterProps) {
  const updateFilter = <K extends keyof BackupFilters>(key: K, value: BackupFilters[K]) => {
    onChange({
      ...filters,
      [key]: value,
    });
  };

  return (
    <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-[minmax(0,1fr)_160px_160px_256px]">
      <Search
        value={filters.search}
        onChange={(value) => updateFilter("search", value)}
        placeholder="Cari data..."
      />

      <Dropdown
        value={filters.type}
        options={backupTypeOptions}
        onChange={(value) => updateFilter("type", value as BackupType | "all")}
        className="w-full"
      />

      <Dropdown
        value={filters.status}
        options={backupStatusOptions}
        onChange={(value) => updateFilter("status", value as BackupStatus | "all")}
        className="w-full"
      />

      <div className="min-w-0">
        <DateInput
          variant="range"
          startValue={filters.startDate}
          endValue={filters.endDate}
          onRangeChange={({ start, end }) => {
            onChange({
              ...filters,
              startDate: start,
              endDate: end,
            });
          }}
        />
      </div>
    </div>
  );
}
