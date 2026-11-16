import { Calendar, Info } from "lucide-react";
import DetailCard from "./DetailCard";

type ReporterInfoCardProps = {
  name: string;
  unit: string;
  createdAt: string;
};

export default function ReporterInfoCard({ name, unit, createdAt }: ReporterInfoCardProps) {
  return (
    <DetailCard title="Informasi Pelapor" icon={<Info size={18} className="text-text-title" />}>
      <div className="px-12 py-5">
        <div
          className="
            grid
            grid-cols-1
            gap-x-10
            gap-y-5
            sm:grid-cols-2
          "
        >
          <div>
            <p className="text-sm text-slate-400">Nama Pelapor</p>

            <p className="mt-1 text-sm font-medium text-text-title">{name}</p>
          </div>

          <div>
            <p className="text-sm text-slate-400">Unit Pelapor</p>

            <p className="mt-1 text-sm font-medium text-text-title">{unit}</p>
          </div>
        </div>

        <div
          className="
            mt-5
            border-t
            border-slate-100
            pt-4
            dark:border-slate-700
          "
        >
          <div className="flex items-center gap-3">
            <p className="text-sm text-slate-400">Dibuat pada</p>

            <div
              className="
                flex
                items-center
                gap-2
                rounded-md
                border
                border-slate-200
                bg-slate-50
                px-3
                py-1.5
                dark:border-slate-700
                dark:bg-slate-800
              "
            >
              <Calendar size={14} className="text-slate-500" />

              <span className="text-sm text-text-title">{createdAt}</span>
            </div>
          </div>
        </div>
      </div>
    </DetailCard>
  );
}
