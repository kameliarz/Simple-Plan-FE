import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";

import DetailField from "./DetailField";
import FileAttachment from "./FileAttachment";

import type { GraphicDesignDetail } from "../types/graphicDesignDetail.types";

type Draft = NonNullable<GraphicDesignDetail["draft"]>;
type DraftFile = NonNullable<Draft["file"]>;

export interface DraftHistoryItem {
  id: string;
  number: number;
  date: string;
  notes: string;
  file?: DraftFile | null;
  revisionNote?: string | null;
}

interface DraftDesignCardProps {
  draft: Draft;
  revisionNote?: string | null;
  draftNumber?: number;
  history?: DraftHistoryItem[];
}

interface DraftItemProps {
  number: number;
  date: string;
  notes: string;
  file?: DraftFile | null;
  revisionNote?: string | null;
  isLatest?: boolean;
}

function DraftItem({ number, date, notes, file, revisionNote, isLatest = false }: DraftItemProps) {
  return (
    <div
      className="
        rounded-lg
        border border-slate-200
        bg-slate-50/70
        p-4
        dark:border-slate-700
        dark:bg-slate-800/40
        sm:p-5
      "
    >
      {/* DRAFT HEADER */}
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <h3 className="text-sm font-medium text-text-title">Draft {number}</h3>

        {isLatest && (
          <span
            className="
              rounded-full
              border border-slate-200
              bg-slate-100
              px-2.5 py-0.5
              text-[10px]
              font-medium
              text-text-secondary
              dark:border-slate-600
              dark:bg-slate-700
            "
          >
            Terbaru
          </span>
        )}
      </div>

      {/* DRAFT INFORMATION */}
      <dl className="space-y-3">
        <DetailField label="Tanggal Draft">{date || "-"}</DetailField>

        <DetailField label="Catatan Draft">
          <p className="max-w-3xl whitespace-pre-wrap leading-relaxed">{notes || "-"}</p>
        </DetailField>

        <DetailField label="File Draft">
          {file ? <FileAttachment file={file} /> : <span className="text-text-secondary">-</span>}
        </DetailField>

        {/* REVISION NOTE INSIDE DRAFT */}
        {revisionNote?.trim() && (
          <div
            className="
              mt-4
              border-t border-slate-200
              pt-4
              dark:border-slate-700
            "
          >
            <DetailField label="Catatan Revisi">
              <p className="whitespace-pre-wrap leading-relaxed">{revisionNote}</p>
            </DetailField>
          </div>
        )}
      </dl>
    </div>
  );
}

export default function DraftDesignCard({
  draft,
  revisionNote,
  draftNumber,
  history = [],
}: DraftDesignCardProps) {
  const [showHistory, setShowHistory] = useState(false);

  const sortedHistory = [...history].sort((a, b) => b.number - a.number);

  const latestNumber =
    draftNumber ??
    (sortedHistory.length > 0 ? Math.max(...sortedHistory.map((item) => item.number)) + 1 : 1);

  return (
    <div className="space-y-4">
      {/* LATEST DRAFT */}
      <DraftItem
        number={latestNumber}
        date={draft.date}
        notes={draft.notes}
        file={draft.file}
        revisionNote={revisionNote}
        isLatest
      />

      {/* PREVIOUS HISTORY */}
      {showHistory && sortedHistory.length > 0 && (
        <div className="space-y-3">
          <h4 className="text-xs font-medium text-text-secondary">Riwayat sebelumnya</h4>

          <div
            className="
              relative
              ml-2
              space-y-3
              border-l
              border-slate-200
              pl-5
              dark:border-slate-700
            "
          >
            {sortedHistory.map((item) => (
              <div key={item.id} className="relative">
                {/* TIMELINE DOT */}
                <span
                  className="
                    absolute
                    -left-6.5
                    top-5
                    h-2.5 w-2.5
                    rounded-full
                    border-2 border-white
                    bg-slate-400
                    dark:border-slate-900
                  "
                />

                <DraftItem
                  number={item.number}
                  date={item.date}
                  notes={item.notes}
                  file={item.file}
                  revisionNote={item.revisionNote}
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SHOW MORE / SHOW LESS */}
      {sortedHistory.length > 0 && (
        <button
          type="button"
          onClick={() => setShowHistory((prev) => !prev)}
          aria-expanded={showHistory}
          className="
            flex
            w-full
            items-center
            justify-center
            gap-1
            rounded-md
            border border-slate-200
            px-3 py-2
            text-xs
            text-text-secondary
            transition-colors
            hover:bg-slate-50
            dark:border-slate-700
            dark:hover:bg-slate-800
          "
        >
          {showHistory ? (
            <>
              <span>Show less</span>
              <ChevronUp size={14} strokeWidth={1.7} />
            </>
          ) : (
            <>
              <span>Show more</span>
              <ChevronDown size={14} strokeWidth={1.7} />
            </>
          )}
        </button>
      )}
    </div>
  );
}
