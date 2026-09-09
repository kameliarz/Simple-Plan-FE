import React from "react";
import { Download, ImageIcon } from "lucide-react";
import { cn } from "../../lib/utils";

export interface AttachmentCardProps {
  name: string;
  size: string;
  url?: string;
  onDownload?: () => void;
  className?: string;
}

export const AttachmentCard: React.FC<AttachmentCardProps> = ({
  name,
  size,
  url = "#",
  onDownload,
  className,
}) => {
  return (
    <div
      className={cn(
        "flex items-center justify-between p-2.5 rounded-xl border border-slate-200/80 dark:border-slate-700/80 bg-slate-50/60 dark:bg-slate-900/40",
        className,
      )}
    >
      <div className="flex items-center gap-2.5 min-w-0">
        <div className="w-9 h-9 rounded-lg bg-[#003178] dark:bg-blue-900 flex items-center justify-center text-white shrink-0 shadow-xs">
          <ImageIcon className="w-4 h-4" />
        </div>
        <div className="min-w-0">
          <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate">
            {name}
          </p>
          <span className="text-[10px] text-slate-400">{size}</span>
        </div>
      </div>

      <a
        href={url}
        onClick={(e) => {
          if (onDownload) {
            e.preventDefault();
            onDownload();
          }
        }}
        download
        className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-lg hover:bg-slate-200/60 dark:hover:bg-slate-800 transition shrink-0 cursor-pointer"
        title="Unduh Lampiran"
      >
        <Download className="w-4 h-4" />
      </a>
    </div>
  );
};

export default AttachmentCard;
