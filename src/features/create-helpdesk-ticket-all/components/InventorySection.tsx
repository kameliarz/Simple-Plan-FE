import Input from "@/components/ui/ui-template/Input";

import Dropdown from "@/components/ui/ui-template/Dropdown";

import { unitOptions } from "../data/helpdeskTicketData";

interface InventorySectionProps {
  unit: string | null;
  inventoryNumber: string;
  inventoryName: string;
  location: string;

  unitError?: string;

  onUnitChange: (value: string) => void;
  onInventoryNumberChange: (value: string) => void;
  onInventoryNameChange: (value: string) => void;
  onLocationChange: (value: string) => void;
}

export default function InventorySection({
  unit,
  inventoryNumber,
  inventoryName,
  location,
  unitError,
  onUnitChange,
  onInventoryNumberChange,
  onInventoryNameChange,
  onLocationChange,
}: InventorySectionProps) {
  return (
    <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <label className="text-sm font-semibold text-text-secondary">
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
          mobileSheet
        />
      </div>

      <Input
        label="No. Inventaris"
        value={inventoryNumber}
        onChange={(event) => onInventoryNumberChange(event.target.value)}
        placeholder="Contoh: INV-TIK-2023-089"
      />

      <Input
        label="Nama Inventaris"
        value={inventoryName}
        onChange={(event) => onInventoryNameChange(event.target.value)}
        placeholder="Contoh: PC All-in-One Core i5 Poli Dalam"
      />

      <Input
        label="Lokasi"
        value={location}
        onChange={(event) => onLocationChange(event.target.value)}
        placeholder="Masukkan lokasi inventaris"
      />
    </div>
  );
}
