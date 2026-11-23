import { Download, File, FileImage, FileText } from "lucide-react";

import type { DesignFile } from "../types/graphicDesignDetail.types";

interface FileAttachmentProps {
  file: DesignFile;
}

export default function FileAttachment({ file }: FileAttachmentProps) {
  const extension = file.name.split(".").pop()?.toLowerCase();

  const isImage = ["jpg", "jpeg", "png", "webp", "gif"].includes(extension ?? "");

  const FileIcon = extension === "pdf" ? FileText : isImage ? FileImage : File;

  // Download file tanpa membuka tab baru
  const handleDownload = async () => {
    if (!file.url) return;

    try {
      const response = await fetch(file.url);

      if (!response.ok) {
        throw new Error("Gagal mengambil file");
      }

      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = file.name;

      document.body.appendChild(link);
      link.click();
      link.remove();

      window.setTimeout(() => {
        window.URL.revokeObjectURL(blobUrl);
      }, 1000);
    } catch (error) {
      console.error("Gagal download file:", error);
    }
  };

  return (
    <div
      className="
        relative flex w-full max-w-72
        items-center justify-between
        gap-3 rounded-lg
        border border-slate-200
        bg-slate-50 px-3 py-2.5
        transition-colors
        hover:bg-slate-100
        dark:border-slate-700
        dark:bg-slate-800
        dark:hover:bg-slate-700
      "
    >
      {/* Preview file saat kotak diklik */}
      {file.url && (
        <a
          href={file.url}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`Preview ${file.name}`}
          className="absolute inset-0 rounded-lg"
        />
      )}

      {/* File Information */}
      <div className="pointer-events-none flex min-w-0 items-center gap-3">
        <FileIcon size={21} strokeWidth={1.5} className="shrink-0 text-blue-600" />

        <div className="min-w-0">
          <p
            className="
              truncate text-xs font-medium text-text-title
            "
            title={file.name}
          >
            {file.name}
          </p>

          <p className="text-[11px] text-text-secondary">{file.size}</p>
        </div>
      </div>

      {/* Download Button */}
      <button
        type="button"
        onClick={handleDownload}
        disabled={!file.url}
        aria-label={`Download ${file.name}`}
        title={file.url ? `Download ${file.name}` : "File tidak tersedia"}
        className="
          relative z-10 inline-flex
          shrink-0 items-center justify-center
          rounded-md p-1.5
          text-blue-600
          transition-colors
          hover:bg-blue-100
          disabled:cursor-not-allowed
          disabled:text-slate-400
          dark:hover:bg-slate-600
        "
      >
        <Download size={17} strokeWidth={1.5} />
      </button>
    </div>
  );
}
