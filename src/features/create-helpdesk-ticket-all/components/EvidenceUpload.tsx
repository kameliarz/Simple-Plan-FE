import FileUpload from "@/components/ui/ui-template/FileUploader";

interface EvidenceUploadProps {
  value: File | null;
  onChange: (file: File | null) => void;
}

export default function EvidenceUpload({ value, onChange }: EvidenceUploadProps) {
  return (
    <FileUpload
      value={value}
      onChange={onChange}
      accept=".jpg,.jpeg,.png,.pdf"
      maxSize={5 * 1024 * 1024}
      title="Tarik & lepas file bukti kerusakan di sini, atau"
      actionText="Pilih Dokumen"
      description="Format: JPG, PNG, atau PDF (Maks. 5MB)"
    />
  );
}
