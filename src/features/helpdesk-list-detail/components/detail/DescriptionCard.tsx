import { FileText, Image as ImageIcon, Download } from "lucide-react";
import { BACKEND_URL } from "@/config/api";
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

const getFullUrl = (url?: string | null): string | null => {
  if (!url) return null;

  // Jika URL sudah lengkap, gunakan langsung
  if (/^(https?:\/\/|blob:)/i.test(url)) {
    return url;
  }

  // Pastikan path dimulai dengan /
  const cleanPath = url.startsWith("/") ? url : `/${url}`;

  // Gabungkan dengan domain backend dari config/api.ts
  return `${BACKEND_URL}${cleanPath}`;
};

export default function DescriptionCard({ description, attachments }: DescriptionCardProps) {
  return (
    <DetailCard title="Deskripsi" icon={<FileText size={17} className="text-text-title" />}>
      <div className="px-12 py-5">
        <p className="mb-2 text-sm text-slate-400">Deskripsi Masalah</p>

        <div className="rounded-lg border border-slate-200 bg-slate-50 px-3.5 py-3.5 dark:border-slate-700 dark:bg-slate-800">
          <p className="whitespace-pre-line text-sm leading-5 text-text-secondary">{description}</p>
        </div>

        <div className="mt-4">
          <p className="mb-2 text-sm text-slate-400">Foto Bukti Awal</p>

          {attachments && attachments.length > 0 ? (
            <div className="space-y-2">
              {attachments.map((attachment) => {
                const fullUrl = getFullUrl(attachment.url);

                return (
                  <div
                    key={attachment.id}
                    className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 dark:border-slate-700 dark:bg-slate-900"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {/* AREA VIEW */}
                    {fullUrl ? (
                      <a
                        href={fullUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="flex min-w-0 flex-1 items-center gap-3 rounded-lg transition hover:bg-slate-50 dark:hover:bg-slate-800"
                      >
                        {/* ICON */}
                        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-800 dark:bg-blue-950 dark:text-blue-300">
                          <ImageIcon size={26} strokeWidth={1.8} />
                        </div>

                        {/* FILE INFO */}
                        <div className="min-w-0">
                          <p className="truncate text-xs font-medium text-text-title">
                            {attachment.name}
                          </p>
                          <p className="mt-0.5 text-xs text-slate-400">{attachment.size}</p>
                        </div>
                      </a>
                    ) : (
                      <div className="flex min-w-0 flex-1 items-center gap-3 rounded-lg opacity-60">
                        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400">
                          <ImageIcon size={26} strokeWidth={1.8} />
                        </div>

                        <div className="min-w-0">
                          <p className="truncate text-xs font-medium text-text-title">
                            {attachment.name}
                          </p>
                          <p className="mt-0.5 text-xs text-red-400">URL foto tidak tersedia</p>
                        </div>
                      </div>
                    )}

                    {/* DOWNLOAD */}
                    {fullUrl && (
                      <a
                        href={fullUrl}
                        download={attachment.name}
                        onClick={(e) => e.stopPropagation()}
                        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-blue-800 transition hover:bg-blue-50 dark:text-blue-300 dark:hover:bg-blue-950"
                        title="Download"
                      >
                        <Download size={21} strokeWidth={2} />
                      </a>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="rounded-lg border border-dashed border-slate-200 bg-slate-50 px-4 py-4 text-center dark:border-slate-700 dark:bg-slate-800">
              <ImageIcon size={22} className="mx-auto mb-2 text-slate-300" />
              <p className="text-xs text-slate-400">Belum ada foto bukti awal.</p>
            </div>
          )}
        </div>
      </div>
    </DetailCard>
  );
}
