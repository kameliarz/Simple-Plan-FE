import Input from "@/components/ui/ui-template/Input";
import Dropdown from "@/components/ui/ui-template/Dropdown";
import type { HelpdeskCategory } from "../types";
import { unitOptions } from "../data/helpdeskTicketData";

interface ReporterSectionProps {
  reporterName: string;
  unit: string | null;
  category: HelpdeskCategory;
  reporterNameError?: string;
  unitError?: string;
  onReporterNameChange: (value: string) => void;
  onUnitChange: (value: string) => void;
  onCategoryChange: (value: HelpdeskCategory) => void;
}

export default function ReporterSection({
  reporterName,
  unit,
  category,
  reporterNameError,
  unitError,
  onUnitChange,
  onCategoryChange,
}: ReporterSectionProps) {
  return (
    <div className="space-y-5">
      {/* Nama Pelapor + Unit Pelapor */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Input
          label="Nama Pelapor"
          required
          value={reporterName}
          onChange={() => {}}
          placeholder="Nama pelapor"
          error={reporterNameError}
          readOnly
          className="cursor-default"
        />

        <div>
          <label className="mb-2 block text-base font-medium text-text-primary">
            Unit Pelapor
            <span className="ml-0.5 text-red-500">*</span>
          </label>

          <Dropdown
            value={unit ?? ""}
            options={unitOptions}
            onChange={onUnitChange}
            placeholder="Pilih unit"
            error={unitError}
            className="w-full"
          />
        </div>
      </div>

      {/* Kategori Helpdesk */}
      <div>
        <label className="mb-1.5 block text-base font-medium text-text-primary">
          Kategori Helpdesk
          <span className="ml-0.5 text-red-500">*</span>
        </label>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <label
            className={`
              flex cursor-pointer items-center gap-2.5
              rounded-lg border px-3 py-3
              transition
              ${
                category === "tik"
                  ? "border-blue-500 bg-blue-50/40"
                  : "border-slate-200 bg-white hover:border-slate-300"
              }
            `}
          >
            <input
              type="radio"
              name="helpdesk-category"
              value="tik"
              checked={category === "tik"}
              onChange={() => onCategoryChange("tik")}
              className="h-4 w-4 accent-blue-600"
            />

            <span className="text-base text-text-title">
              Teknologi Informasi & Komunikasi (TIK)
            </span>
          </label>

          <label
            className={`
              flex cursor-pointer items-center gap-2.5
              rounded-lg border px-3 py-3
              transition
              ${
                category === "sarpras"
                  ? "border-blue-500 bg-blue-50/40"
                  : "border-slate-200 bg-white hover:border-slate-300"
              }
            `}
          >
            <input
              type="radio"
              name="helpdesk-category"
              value="sarpras"
              checked={category === "sarpras"}
              onChange={() => onCategoryChange("sarpras")}
              className="h-4 w-4 accent-blue-600"
            />

            <span className="text-base text-text-title">Sarana & Prasarana (Sarpras)</span>
          </label>
        </div>
      </div>
    </div>
  );
}
