import { FileText, Image as ImageIcon } from "lucide-react";
import DetailCard from "./DetailCard";

type Attachment = {
  id: string | number;
  name: string;
  size: string;
  url?: string | null;
};

type DescriptionCardProps = {
  description: string;
  attachments?: Attachment[] | null;
};

export default function DescriptionCard({ description, attachments }: DescriptionCardProps) {
  return (
    <DetailCard title="Deskripsi" icon={<FileText size={17} className="text-text-title" />}>
      <div className="px-12 py-5">
        <p className="mb-2 text-sm text-slate-400">Deskripsi Masalah</p>

        <div
          className="
            rounded-lg
            border
            border-slate-200
            bg-slate-50
            px-3.5
            py-3.5
            dark:border-slate-700
            dark:bg-slate-800
          "
        >
          <p className="whitespace-pre-line text-sm leading-5 text-text-secondary">{description}</p>
        </div>

        <div className="mt-4">
          <p className="mb-2 text-sm text-slate-400">Foto Bukti Awal</p>

          {attachments && attachments.length > 0 ? (
            <div className="space-y-2">
              {attachments.map((attachment) => (
                <div
                  key={attachment.id}
                  className="
                    flex
                    items-center
                    justify-between
                    rounded-lg
                    border
                    border-slate-200
                    bg-white
                    px-3
                    py-2.5
                    dark:border-slate-700
                    dark:bg-slate-800
                  "
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <div
                      className="
                        flex
                        h-9
                        w-9
                        shrink-0
                        items-center
                        justify-center
                        rounded-md
                        bg-blue-50
                        text-primary-600
                        dark:bg-blue-950/40
                      "
                    >
                      <ImageIcon size={18} />
                    </div>

                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-text-title">
                        {attachment.name}
                      </p>

                      <p className="mt-0.5 text-[11px] text-slate-400">{attachment.size}</p>
                    </div>
                  </div>

                  {attachment.url && (
                    <a
                      href={attachment.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="
                        ml-4
                        flex
                        shrink-0
                        items-center
                        gap-1.5
                        text-sm
                        font-medium
                        text-primary-600
                        transition
                        hover:text-primary-700
                      "
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="15"
                        height="15"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M12 15V3" />
                        <path d="m7 10 5 5 5-5" />
                        <path d="M5 21h14" />
                      </svg>
                      Unduh
                    </a>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div
              className="
                rounded-lg
                border
                border-dashed
                border-slate-200
                bg-slate-50
                px-4
                py-4
                text-center
                dark:border-slate-700
                dark:bg-slate-800
              "
            >
              <ImageIcon size={22} className="mx-auto mb-2 text-slate-300" />

              <p className="text-xs text-slate-400">Belum ada foto bukti awal.</p>
            </div>
          )}
        </div>
      </div>
    </DetailCard>
  );
}
