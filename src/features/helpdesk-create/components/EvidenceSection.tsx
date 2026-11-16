import FileUpload from "@/components/ui/ui-template/FileUploader";

interface EvidenceSectionProps {
  value: File | null;
  onChange: (file: File | null) => void;
}

export default function EvidenceSection({ value, onChange }: EvidenceSectionProps) {
  return (
    <FileUpload
      value={value}
      onChange={onChange}
      accept=".jpg,.jpeg,.png,.pdf"
      maxSize={5 * 1024 * 1024}
      title="Tarik & lepas file bukti kerusakan di sini, atau"
      description="Format: JPG, PNG, atau PDF (Maks. 5MB)"
    />
  );
}
