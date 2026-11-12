import { Download, File, FileImage, FileText } from "lucide-react";

import type { DesignFile } from "../types/graphicDesignDetail.types";

interface FileAttachmentProps {
  file: DesignFile;
}

export default function FileAttachment({ file }: FileAttachmentProps) {
  const extension = file.name.split(".").pop()?.toLowerCase();

  const isImage = ["jpg", "jpeg", "png", "webp", "gif"].includes(extension ?? "");

  const FileIcon = extension === "pdf" ? FileText : isImage ? FileImage : File;

  return (
    <div
      className="
        flex w-full max-w-72
        items-center justify-between
        gap-3
        rounded-lg
        border border-slate-200
        bg-slate-50
        px-3 py-2.5
        dark:border-slate-700
        dark:bg-slate-800
      "
    >
      {/* File Information */}
      <div className="flex min-w-0 items-center gap-3">
        <FileIcon size={21} strokeWidth={1.5} className="shrink-0 text-blue-600" />

        <div className="min-w-0">
          <p
            className="
              truncate
              text-xs
              font-medium
              text-text-title
            "
            title={file.name}
          >
            {file.name}
          </p>

          <p className="text-[11px] text-text-secondary">{file.size}</p>
        </div>
      </div>

      {/* Download Button */}
      {file.url ? (
        <a
          href={file.url}
          download={file.name}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`Download ${file.name}`}
          title={`Download ${file.name}`}
          className="
            inline-flex
            shrink-0
            items-center justify-center
            rounded-md
            p-1.5
            text-blue-600
            transition-colors
            hover:bg-blue-100
            dark:hover:bg-slate-700
          "
        >
          <Download size={17} strokeWidth={1.5} />
        </a>
      ) : (
        <span className="p-1.5 text-slate-400" title="File tidak tersedia">
          <Download size={17} strokeWidth={1.5} />
        </span>
      )}
    </div>
  );
}
