import { IconChevronDown } from "@tabler/icons-react";
import { useState } from "react";

import type { Notification } from "../types/notification.types";

interface NotificationItemProps {
  notification: Notification;
  onRead: (id: string) => void;
}

export default function NotificationItem({ notification, onRead }: NotificationItemProps) {
  const [expanded, setExpanded] = useState(false);

  const handleClick = () => {
    setExpanded((previous) => !previous);

    if (!notification.isRead) {
      onRead(notification.id);
    }
  };

  return (
    <div
      className={`
        border-b border-slate-100
        transition-colors
        dark:border-slate-800
        ${notification.isRead ? "bg-white dark:bg-slate-900" : "bg-blue-50/50 dark:bg-blue-950/20"}
      `}
    >
      <button
        type="button"
        onClick={handleClick}
        aria-expanded={expanded}
        className="
          flex w-full items-start gap-2
          px-4 py-3 text-left
          transition-colors
          hover:bg-slate-50
          dark:hover:bg-slate-800
        "
      >
        {/* INDIKATOR BELUM DIBACA */}
        <span className="flex h-5 shrink-0 items-center">
          {!notification.isRead && <span className="h-2 w-2 rounded-full bg-primary-600" />}
        </span>

        {/* INFORMASI NOTIFIKASI */}
        <div className="min-w-0 flex-1">
          <p
            className={`
              text-xs leading-5 text-slate-700
              dark:text-slate-200
              ${!notification.isRead ? "font-semibold" : "font-normal"}
            `}
          >
            {notification.title}
          </p>

          <p className="mt-1 text-[10px] text-slate-400">{notification.createdAt}</p>
        </div>

        {/* ICON EXPAND */}
        <IconChevronDown
          size={16}
          strokeWidth={1.5}
          className={`
            mt-0.5 shrink-0 text-slate-400
            transition-transform duration-200
            ${expanded ? "rotate-180" : ""}
          `}
        />
      </button>

      {/* DETAIL NOTIFIKASI */}
      {expanded && (
        <div className="px-4 pb-4 pl-10">
          <p className="text-xs leading-5 text-slate-600 dark:text-slate-300">
            {notification.message}
          </p>
        </div>
      )}
    </div>
  );
}
