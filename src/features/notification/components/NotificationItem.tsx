import { IconChevronDown, IconExternalLink } from "@tabler/icons-react";

import type { Notification } from "../types/notification.types";

interface NotificationItemProps {
  notification: Notification;
  onRead: (id: string) => void;
  expanded: boolean;
  onToggleExpanded: (id: string, expanded: boolean) => void;
}

export default function NotificationItem({
  notification,
  onRead,
  expanded,
  onToggleExpanded,
}: NotificationItemProps) {
  const handleClick = () => {
    const nextExpanded = !expanded;

    onToggleExpanded(notification.id, nextExpanded);

    if (nextExpanded && !notification.isRead) {
      onRead(notification.id);
    }
  };

  return (
    <div
      className={`
        mx-3 my-2 overflow-hidden rounded-xl
        border border-soft-border
        transition-all duration-200
        ${notification.isRead ? "bg-white dark:bg-slate-900" : "bg-[#EBF2FF] dark:bg-slate-800"}
      `}
    >
      {/* HEADER NOTIFIKASI */}
      <button
        type="button"
        onClick={handleClick}
        aria-expanded={expanded}
        className="
          flex w-full items-start gap-2
          px-4 py-3 text-left
        "
      >
        {/* TITIK STATUS */}
        <div className="flex w-3 shrink-0 justify-center pt-2">
          {!notification.isRead && <span className="h-3 w-3 rounded-full bg-[#1554B4]" />}
        </div>

        {/* JUDUL DAN TANGGAL */}
        <div className="min-w-0 flex-1">
          <p
            className={`
              text-xs leading-5 text-slate-700
              dark:text-slate-200
              ${!notification.isRead ? "font-semibold" : "font-medium"}
            `}
          >
            {notification.title}
          </p>

          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            {notification.createdAt}
          </p>
        </div>

        {/* CHEVRON */}
        <IconChevronDown
          size={19}
          stroke={2}
          className={`
            mt-2 shrink-0 text-slate-500
            transition-transform duration-200
            ${expanded ? "rotate-180" : ""}
          `}
        />
      </button>

      {/* DETAIL NOTIFIKASI */}
      {expanded && (
        <div className="pb-2 pl-12 pr-4">
          <div
            className="
              rounded-xl border border-slate-100
              bg-white/70 p-1 pl-2
              dark:border-slate-700
              dark:bg-slate-900/70
            "
          >
            {/* PESAN */}
            <p
              className="
                whitespace-pre-line
                text-xs leading-5
                text-slate-600
                dark:text-slate-300
              "
            >
              {notification.message}
            </p>

            {/* LINK TIKET */}
            {notification.url && (
              <a
                href={notification.url}
                target="_blank"
                rel="noopener noreferrer"
                className="
                  mt-3 mb-1 flex items-center gap-2
                  rounded-lg bg-[#EBF2FF]
                  px-3 py-2.5
                  text-xs font-medium text-[#124A9C]
                  transition-colors
                  hover:bg-blue-100
                  dark:bg-slate-800
                  dark:text-blue-300
                "
              >
                <IconExternalLink size={19} stroke={2} />
                <span>Buka halaman tiket masuk</span>
              </a>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
