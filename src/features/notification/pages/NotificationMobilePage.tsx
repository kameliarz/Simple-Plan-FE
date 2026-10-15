import { useState } from "react";

import NotificationItem from "../components/NotificationItem";
import { dummyNotifications } from "../data/dummyNotifications";
import type { Notification } from "../types/notification.types";

type NotificationTab = "all" | "unread";

export default function NotificationMobilePage() {
  const [activeTab, setActiveTab] = useState<NotificationTab>("all");

  const [notifications, setNotifications] = useState<Notification[]>(dummyNotifications);

  const unreadCount = notifications.filter((notification) => !notification.isRead).length;

  const filteredNotifications =
    activeTab === "unread"
      ? notifications.filter((notification) => !notification.isRead)
      : notifications;

  const handleRead = (id: string) => {
    setNotifications((previous) =>
      previous.map((notification) =>
        notification.id === id
          ? {
              ...notification,
              isRead: true,
            }
          : notification,
      ),
    );
  };

  return (
    <div
      className="
        min-h-screen
        bg-white
        pb-16
      "
    >
      <div
        className="
          px-4
          pt-4
        "
      >
        <h1
          className="
            text-sm
            font-semibold
          "
        >
          Notifikasi
        </h1>
      </div>

      {/* TAB */}
      <div
        className="
          flex
          gap-5
          border-b
          px-4
          mt-3
        "
      >
        <button
          type="button"
          onClick={() => setActiveTab("all")}
          className={`
            relative
            py-3
            text-xs
            ${activeTab === "all" ? "font-semibold text-blue-600" : "text-slate-500"}
          `}
        >
          Semua notifikasi
          {activeTab === "all" && (
            <span
              className="
                  absolute
                  bottom-0
                  left-0
                  right-0
                  h-0.5
                  bg-blue-600
                "
            />
          )}
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("unread")}
          className={`
            relative
            py-3
            text-xs
            ${activeTab === "unread" ? "font-semibold text-blue-600" : "text-slate-500"}
          `}
        >
          Belum dibaca ({unreadCount})
          {activeTab === "unread" && (
            <span
              className="
                  absolute
                  bottom-0
                  left-0
                  right-0
                  h-0.5
                  bg-blue-600
                "
            />
          )}
        </button>
      </div>

      {/* LIST NOTIFICATION */}
      <div>
        {filteredNotifications.length > 0 ? (
          filteredNotifications.map((notification) => (
            <NotificationItem
              key={notification.id}
              notification={notification}
              onRead={handleRead}
            />
          ))
        ) : (
          <div
            className="
                flex
                flex-col
                items-center
                justify-center
                py-16
              "
          >
            <p
              className="
                  text-sm
                  font-medium
                  text-slate-600
                "
            >
              Tidak ada notifikasi
            </p>

            <p
              className="
                  mt-1
                  text-xs
                  text-slate-400
                "
            >
              Semua notifikasi sudah dibaca.
            </p>
          </div>
        )}
      </div>

      {/* BOTTOM NAV */}
      <nav
        className="
          fixed
          bottom-0
          left-0
          right-0
          flex
          h-14
          items-center
          justify-around
          border-t
          bg-white
        "
      >
        <span
          className="
            text-[10px]
            text-slate-500
          "
        >
          Dashboard
        </span>

        <span
          className="
            text-[10px]
            font-semibold
            text-blue-600
          "
        >
          Notifikasi
        </span>

        <span
          className="
            text-[10px]
            text-slate-500
          "
        >
          Profil
        </span>
      </nav>
    </div>
  );
}
