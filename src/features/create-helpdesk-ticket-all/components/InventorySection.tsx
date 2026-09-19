import Input from "@/components/ui/ui-template/Input";

import Dropdown from "@/components/ui/ui-template/Dropdown";

import { unitOptions } from "../data/helpdeskTicketData";

interface InventorySectionProps {
  inventoryNumber: string;
  inventoryName: string;
  brandSeries: string;
  unit: string | null;

  inventoryNumberError?: string;
  inventoryNameError?: string;
  unitError?: string;

  onInventoryNumberChange: (value: string) => void;
  onInventoryNameChange: (value: string) => void;
  onBrandSeriesChange: (value: string) => void;
  onUnitChange: (value: string) => void;
}

export default function InventorySection({
  inventoryNumber,
  inventoryName,
  brandSeries,
  unit,
  inventoryNumberError,
  inventoryNameError,
  unitError,
  onInventoryNumberChange,
  onInventoryNameChange,
  onBrandSeriesChange,
  onUnitChange,
}: InventorySectionProps) {
  return (
    <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
      <Input
        label="No. Inventaris"
        required
        value={inventoryNumber}
        onChange={(event) => onInventoryNumberChange(event.target.value)}
        placeholder="Contoh: INV-TIK-2023-089"
        error={inventoryNumberError}
      />

      <Input
        label="Nama Inventaris"
        required
        value={inventoryName}
        onChange={(event) => onInventoryNameChange(event.target.value)}
        placeholder="Contoh: PC All-in-One Core i5 Poli Dalam"
        error={inventoryNameError}
      />

      <Input
        label="Merk / Seri"
        value={brandSeries}
        onChange={(event) => onBrandSeriesChange(event.target.value)}
        placeholder="Contoh: Lenovo ThinkCentre M70q / RAM 16GB"
      />

      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <label className="text-base font-semibold text-text-secondary">
            Unit
            <span className="ml-1 text-red-500">*</span>
          </label>
        </div>

        <Dropdown
          value={unit ?? ""}
          options={unitOptions}
          onChange={onUnitChange}
          placeholder="Pilih unit"
          className="w-full"
          error={unitError}
        />
      </div>
    </div>
  );
}
