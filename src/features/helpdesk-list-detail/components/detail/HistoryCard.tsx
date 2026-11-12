import { Clock, Download, Image as ImageIcon } from "lucide-react";
import type { TicketItem } from "../../types/helpdesk";
import { TicketHistoryItem } from "../TicketHistoryItem";
import DetailCard from "./DetailCard";

type HistoryCardProps = {
  history: TicketItem["history"];
};

export default function HistoryCard({ history }: HistoryCardProps) {
  return (
    <DetailCard title="Riwayat Penanganan" icon={<Clock size={18} className="text-text-title" />}>
      <div className="relative px-4 py-4">
        {history && history.length > 0 ? (
          <>
            {/* GARIS TIMELINE */}
            <div
              className="
                pointer-events-none
                absolute
                left-8
                top-7
                bottom-7
                w-px
                bg-slate-200
                dark:bg-slate-700
              "
            />

            {history.map((item, index) => (
              <div key={item.id}>
                <TicketHistoryItem
                  action={item.action}
                  timestamp={item.timestamp}
                  isLatest={index === 0}
                />

                {/* KETERANGAN KENDALA */}
                {item.action === "Pengerjaan Ulang oleh Teknisi" && item.retryNote && (
                  <div className="ml-14 mt-2 mb-4">
                    <p className="mb-1.5 pb-1.5 text-xs text-slate-500 dark:text-slate-400">
                      Keterangan Kendala
                    </p>

                    <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-3 dark:border-slate-700 dark:bg-slate-800">
                      <p className="whitespace-pre-line text-xs leading-5 text-text-secondary">
                        {item.retryNote}
                      </p>
                    </div>
                  </div>
                )}

                {/* HASIL PENANGANAN */}
                {(item.handlingNote || item.handlingPhoto) && (
                  <div className="ml-14 -mt- mb-4">
                    {/* CATATAN */}
                    {item.handlingNote && (
                      <div>
                        <p className="mb-1 pb-1 text-xs text-slate-500 dark:text-slate-400">
                          {item.action === "Tiket Ditolak"
                            ? "Alasan Penolakan"
                            : "Catatan Penanganan"}
                        </p>

                        <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-3 dark:border-slate-700 dark:bg-slate-800">
                          <p className="whitespace-pre-line text-xs leading-5 text-text-secondary">
                            {item.handlingNote}
                          </p>
                        </div>
                      </div>
                    )}

                    {/* FOTO */}
                    {item.handlingPhoto && (
                      <div className="mt-4">
                        <p className="mb-2 pb-1.5 text-xs text-slate-500 dark:text-slate-400">
                          Foto Bukti Hasil Perbaikan
                        </p>

                        <div
                          className="
                            flex
                            items-center
                            gap-3
                            rounded-xl
                            border
                            border-slate-200
                            bg-white
                            px-4
                            py-3
                            dark:border-slate-700
                            dark:bg-slate-900
                          "
                        >
                          {/* AREA VIEW */}
                          <a
                            href={item.handlingPhoto.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="
                              flex
                              min-w-0
                              flex-1
                              items-center
                              gap-3
                              rounded-lg
                              transition
                              hover:bg-slate-50
                              dark:hover:bg-slate-800
                            "
                          >
                            {/* ICON */}
                            <div
                              className="
                                flex
                                h-14
                                w-14
                                shrink-0
                                items-center
                                justify-center
                                rounded-xl
                                bg-blue-50
                                text-blue-800
                                dark:bg-blue-950
                                dark:text-blue-300
                              "
                            >
                              <ImageIcon size={26} strokeWidth={1.8} />
                            </div>

                            {/* FILE INFO */}
                            <div className="min-w-0">
                              <p className="truncate text-xs font-medium text-text-title">
                                {item.handlingPhoto.name}
                              </p>

                              <p className="mt-0.5 text-xs text-slate-400">
                                {item.handlingPhoto.size}
                              </p>
                            </div>
                          </a>

                          {/* DOWNLOAD */}
                          <a
                            href={item.handlingPhoto.url}
                            download={item.handlingPhoto.name}
                            onClick={(e) => e.stopPropagation()}
                            className="
                              flex
                              h-9
                              w-9
                              shrink-0
                              items-center
                              justify-center
                              rounded-lg
                              text-blue-800
                              transition
                              hover:bg-blue-50
                              dark:text-blue-300
                              dark:hover:bg-blue-950
                            "
                            title="Download"
                          >
                            <Download size={21} strokeWidth={2} />
                          </a>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </>
        ) : (
          <div className="py-6 text-center">
            <Clock size={22} className="mx-auto mb-2 text-slate-300" />

            <p className="text-xs text-text-secondary">Belum ada riwayat penanganan.</p>
          </div>
        )}
      </div>
    </DetailCard>
  );
}
