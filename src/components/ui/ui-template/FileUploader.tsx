import { useRef, useState } from "react";

import {
  IconFile,
  IconFileTypeJpg,
  IconFileTypePdf,
  IconPhoto,
  IconUpload,
  IconX,
} from "@tabler/icons-react";

import { cn } from "@/lib/utils";

export interface FileUploadProps {
  value?: File | null;
  onChange: (file: File | null) => void;

  accept?: string;
  maxSize?: number;

  title?: string;
  actionText?: string;
  description?: string;

  error?: string;
  className?: string;
}

export default function FileUpload({
  value = null,
  onChange,
  accept = ".jpg,.jpeg,.png,.pdf",
  maxSize = 5 * 1024 * 1024,
  title = "Tarik & lepas file di sini, atau",
  actionText = "Pilih Dokumen",
  description = "Format: JPG, PNG, atau PDF (Maks. 5MB)",
  error,
  className,
}: FileUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const [isDragging, setIsDragging] = useState(false);
  const [uploadError, setUploadError] = useState("");

  const validateFile = (file: File) => {
    const extension = `.${file.name.split(".").pop()?.toLowerCase()}`;

    const allowedExtensions = accept.split(",").map((item) => item.trim().toLowerCase());

    if (!allowedExtensions.includes(extension)) {
      return "Format file tidak didukung.";
    }

    if (file.size > maxSize) {
      return `Ukuran file maksimal ${Math.round(maxSize / 1024 / 1024)}MB.`;
    }

    return null;
  };

  const handleFile = (file?: File) => {
    if (!file) return;

    const validationError = validateFile(file);

    if (validationError) {
      setUploadError(validationError);
      onChange(null);
      return;
    }

    setUploadError("");
    onChange(file);
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(false);

    handleFile(event.dataTransfer.files?.[0]);
  };

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    handleFile(event.target.files?.[0]);

    // Reset input agar file yang sama bisa dipilih kembali.
    event.target.value = "";
  };

  const handleRemove = () => {
    setUploadError("");
    onChange(null);
  };

  const getFileIcon = () => {
    if (!value) {
      return <IconPhoto size={24} />;
    }

    const extension = value.name.split(".").pop()?.toLowerCase();

    if (extension === "pdf") {
      return <IconFileTypePdf size={24} />;
    }

    if (extension === "jpg" || extension === "jpeg") {
      return <IconFileTypeJpg size={24} />;
    }

    return <IconFile size={24} />;
  };

  return (
    <div className={cn("w-full", className)}>
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        onChange={handleInputChange}
        className="hidden"
      />

      {!value ? (
        <div
          onClick={() => inputRef.current?.click()}
          onDragOver={(event) => {
            event.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => {
            setIsDragging(false);
          }}
          onDrop={handleDrop}
          className={cn(
            "flex min-h-25 cursor-pointer flex-col items-center justify-center",
            "rounded-lg border-2 border-dashed px-6 py-4 text-center",
            "transition",
            isDragging
              ? "border-primary-600 bg-blue-50"
              : "border-primary-200 hover:border-primary-300 hover:bg-slate-300/10 ",
          )}
        >
          <div className="mb-1 flex h-11 w-11 items-center justify-center rounded-full bg-button text-text-secondary">
            <IconUpload size={22} strokeWidth={1.7} />
          </div>

          <p className="text-sm text-text-secondary">
            {title} <span className="font-semibold ">{actionText}</span>
          </p>

          <p className="mt-1 text-xs text-[#91A4C3]">{description}</p>
        </div>
      ) : (
        <div className="flex items-center justify-between rounded-lg border border-[#DCE4EF] bg-white px-4 py-3">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-bluersch">
              {getFileIcon()}
            </div>

            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-slate-700">{value.name}</p>

              <p className="mt-0.5 text-xs text-[#91A4C3]">
                {(value.size / 1024 / 1024).toFixed(2)} MB
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleRemove}
            className="ml-4 rounded-md p-1.5 text-slate-400 transition hover:bg-red-50 hover:text-red-500"
          >
            <IconX size={18} />
          </button>
        </div>
      )}

      {(error || uploadError) && (
        <small className="mt-2 block text-xs text-danger-500">{error || uploadError}</small>
      )}
    </div>
  );
}
