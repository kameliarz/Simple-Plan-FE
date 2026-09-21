import Input from "@/components/ui/ui-template/Input";

interface ReporterSectionProps {
  value: string;
  onChange: (value: string) => void;
}

export default function ReporterSection({ value, onChange }: ReporterSectionProps) {
  return (
    <div>
      <Input
        label="Nama Pelapor"
        required
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder="Contoh: dr. Budi Santoso, Sp.PD"
      />
    </div>
  );
}
