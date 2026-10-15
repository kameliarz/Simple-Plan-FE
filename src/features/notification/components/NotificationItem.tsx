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
    setExpanded((prev) => !prev);

    if (!notification.isRead) {
      onRead(notification.id);
    }
  };

  return (
    <div
      className={`
        mx-3 mb-2
        rounded-lg
        border
        border-slate-100
        overflow-hidden
        transition-all
        ${notification.isRead ? "bg-white" : "bg-blue-50/70"}
      `}
    >
      {/* ITEM HEADER */}
      <button
        onClick={handleClick}
        className="
          flex
          w-full
          items-start
          gap-2
          px-3
          py-3
          text-left
        "
      >
        {/* DOT */}
        <div className="pt-1">
          {!notification.isRead && (
            <span
              className="
                block
                h-2
                w-2
                rounded-full
                bg-blue-600
              "
            />
          )}
        </div>

        {/* CONTENT */}
        <div className="flex-1">
          <p
            className={`
              text-[11px]
              leading-4
              text-slate-700
              ${!notification.isRead ? "font-semibold" : "font-normal"}
            `}
          >
            {notification.title}
          </p>

          <p
            className="
              mt-1
              text-[10px]
              text-slate-400
            "
          >
            {notification.createdAt}
          </p>
        </div>

        {/* CHEVRON */}
        <IconChevronDown
          size={15}
          className={`
            mt-1
            text-slate-400
            transition-transform
            ${expanded ? "rotate-180" : ""}
          `}
        />
      </button>

      {/* DETAIL */}
      {expanded && (
        <div
          className="
            border-t
            border-slate-100
            px-3
            py-3
            pl-7
            bg-white
          "
        >
          <p
            className="
              text-[11px]
              leading-5
              text-slate-600
            "
          >
            {notification.message}
          </p>
        </div>
      )}
    </div>
  );
}
