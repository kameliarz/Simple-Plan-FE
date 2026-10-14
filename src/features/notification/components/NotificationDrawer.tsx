import { useState } from "react";

import Modal from "@/components/ui/ui-template/Modal";

import NotificationItem from "./NotificationItem";

import { dummyNotifications } from "../data/dummyNotifications";

import type { Notification } from "../types/notification.types";

type NotificationTab = "all" | "unread";

interface NotificationDrawerProps {
  show: boolean;
  onClose: () => void;
}

export default function NotificationDrawer({ show, onClose }: NotificationDrawerProps) {
  const [activeTab, setActiveTab] = useState<NotificationTab>("all");

  const [notifications, setNotifications] = useState<Notification[]>(dummyNotifications);

  // Hitung jumlah belum dibaca
  const unreadCount = notifications.filter((notification) => !notification.isRead).length;

  // Filter berdasarkan tab
  const filteredNotifications =
    activeTab === "unread"
      ? notifications.filter((notification) => !notification.isRead)
      : notifications;

  // Ubah status notifikasi menjadi sudah dibaca
  const handleRead = (id: string) => {
    setNotifications((previous) =>
      previous.map((notification) =>
        notification.id === id ? { ...notification, isRead: true } : notification,
      ),
    );
  };

  return (
    <Modal show={show} onClose={onClose} title="Notifikasi" type="slide-over" maxWidth="md">
      <div className="-mx-4 -my-6 sm:-mx-6">
        {/* TAB NAVIGATION */}
        <div
          className="
            sticky top-0 z-10
            flex items-center gap-5
            border-b border-slate-200
            bg-white px-5
            dark:border-slate-800
            dark:bg-slate-900
          "
        >
          {/* SEMUA NOTIFIKASI */}
          <button
            type="button"
            onClick={() => setActiveTab("all")}
            className={`
              relative py-3 text-xs font-medium
              transition-colors
              ${activeTab === "all" ? "text-primary-600" : "text-slate-500 hover:text-slate-700"}
            `}
          >
            Semua notifikasi
            {activeTab === "all" && (
              <span
                className="
                  absolute inset-x-0 bottom-0
                  h-0.5 rounded-full bg-primary-600
                "
              />
            )}
          </button>

          {/* BELUM DIBACA */}
          <button
            type="button"
            onClick={() => setActiveTab("unread")}
            className={`
              relative py-3 text-xs font-medium
              transition-colors
              ${activeTab === "unread" ? "text-primary-600" : "text-slate-500 hover:text-slate-700"}
            `}
          >
            Belum dibaca ({unreadCount})
            {activeTab === "unread" && (
              <span
                className="
                  absolute inset-x-0 bottom-0
                  h-0.5 rounded-full bg-primary-600
                "
              />
            )}
          </button>
        </div>

        {/* DAFTAR NOTIFIKASI */}
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
            <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
              <p className="text-sm font-medium text-slate-600 dark:text-slate-300">
                Tidak ada notifikasi
              </p>

              <p className="mt-1 text-xs text-slate-400">Semua notifikasi sudah dibaca.</p>
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
}
