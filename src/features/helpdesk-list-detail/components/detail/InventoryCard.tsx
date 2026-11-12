import { Monitor } from "lucide-react";
import DetailCard from "./DetailCard";

type InventoryCardProps = {
  inventoryNumber?: string | null;
  inventoryName?: string | null;
  brand?: string | null;
  unit?: string | null;
  location?: string | null;
};

export default function InventoryCard({
  inventoryNumber,
  inventoryName,
  brand,
  unit,
  location,
}: InventoryCardProps) {
  const displayValue = (value?: string | null) => {
    return value?.trim() || "-";
  };

  return (
    <DetailCard title="Data Inventaris" icon={<Monitor size={17} className="text-text-title" />}>
      <div className="px-12 py-5">
        <div className="grid grid-cols-1 gap-x-10 gap-y-5 sm:grid-cols-2">
          <div>
            <p className="text-sm text-slate-400">No. Inventaris</p>
            <p className="mt-1 text-sm font-medium text-text-title">
              {displayValue(inventoryNumber)}
            </p>
          </div>

          <div>
            <p className="text-sm text-slate-400">Nama Inventaris</p>
            <p className="mt-1 text-sm font-medium text-text-title">
              {displayValue(inventoryName)}
            </p>
          </div>

          <div>
            <p className="text-sm text-slate-400">Merk Inventaris</p>
            <p className="mt-1 text-sm font-medium text-text-title">{displayValue(brand)}</p>
          </div>

          <div>
            <p className="text-sm text-slate-400">Unit Inventaris</p>
            <p className="mt-1 text-sm font-medium text-text-title">{displayValue(unit)}</p>
          </div>

          <div>
            <p className="text-sm text-slate-400">Lokasi Inventaris</p>
            <p className="mt-1 text-sm font-medium text-text-title">{displayValue(location)}</p>
          </div>
        </div>
      </div>
    </DetailCard>
  );
}
