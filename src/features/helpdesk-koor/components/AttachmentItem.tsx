import React from "react";
import type { TicketAttachment } from "../types/helpdesk";

interface Props {
  attachment: TicketAttachment;
}

export const AttachmentItem: React.FC<Props> = ({ attachment }) => (
  <div className="flex items-center justify-between p-2.5 bg-slate-50 border border-slate-200 rounded-lg max-w-xs hover:bg-slate-100 transition">
    <div className="flex items-center space-x-3 truncate">
      <div className="w-10 h-10 rounded bg-slate-700 flex items-center justify-center text-white shrink-0 text-xs font-semibold">
        IMG
      </div>
      <div className="truncate text-left">
        <p className="text-xs font-medium text-slate-800 truncate">{attachment.name}</p>
        <span className="text-[11px] text-slate-500">{attachment.size}</span>
      </div>
    </div>
    <a
      href={attachment.url}
      download
      className="p-1.5 text-slate-500 hover:text-slate-800 ml-2 rounded hover:bg-slate-200/60 transition"
      title="Unduh Berkas"
    >
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
        />
      </svg>
    </a>
  </div>
);
