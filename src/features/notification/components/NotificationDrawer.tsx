import { useEffect, useRef, useState } from "react";

import Modal from "@/components/ui/ui-template/Modal";
import NotificationItem from "./NotificationItem";

import { notificationService, mapNotification } from "../services/notificationService";

import { notifyNotificationUpdated } from "../utils/notificationEvents";

import type { Notification } from "../types/notification.types";

type NotificationTab = "all" | "unread";

interface NotificationDrawerProps {
  show: boolean;
  onClose: () => void;
}

export default function NotificationDrawer({ show, onClose }: NotificationDrawerProps) {
  const [activeTab, setActiveTab] = useState<NotificationTab>("all");

  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const readingIds = useRef(new Set<string>());
  const notificationsRef = useRef<Notification[]>([]);
  const unreadCountRef = useRef(0);

  useEffect(() => {
    if (!show) return;

    let active = true;

    const fetchNotifications = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const response = await notificationService.getNotifications();

        if (!active) return;

        const mappedNotifications = response.data.map(mapNotification);

        notificationsRef.current = mappedNotifications;
        unreadCountRef.current = response.unread_count;

        setNotifications(mappedNotifications);
        setUnreadCount(response.unread_count);
      } catch (error) {
        console.error("Gagal mengambil notifikasi:", error);

        if (active) {
          setError("Gagal memuat notifikasi.");
        }
      } finally {
        if (active) {
          setIsLoading(false);
        }
      }
    };

    void fetchNotifications();

    return () => {
      active = false;
    };
  }, [show]);

  const filteredNotifications =
    activeTab === "unread"
      ? notifications.filter((notification) => !notification.isRead)
      : notifications;

  const handleRead = async (id: string) => {
    const notification = notificationsRef.current.find((item) => item.id === id);

    if (!notification || notification.isRead || readingIds.current.has(id)) {
      return;
    }

    readingIds.current.add(id);

    try {
      // Update status notifikasi di backend
      await notificationService.markAsRead(id);

      // Update daftar notifikasi lokal
      const updatedNotifications = notificationsRef.current.map((item) =>
        item.id === id ? { ...item, isRead: true } : item,
      );

      notificationsRef.current = updatedNotifications;
      setNotifications(updatedNotifications);

      // Update jumlah notifikasi belum dibaca
      const newUnreadCount = Math.max(0, unreadCountRef.current - 1);

      unreadCountRef.current = newUnreadCount;
      setUnreadCount(newUnreadCount);

      // Beritahu MainLayout untuk memperbarui badge header
      notifyNotificationUpdated();
    } catch (error) {
      console.error("Gagal menandai notifikasi:", error);

      window.alert("Gagal menandai notifikasi sebagai sudah dibaca.");
    } finally {
      readingIds.current.delete(id);
    }
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
          {isLoading ? (
            <div className="px-6 py-16 text-center">
              <p className="text-sm text-slate-500">Memuat notifikasi...</p>
            </div>
          ) : error ? (
            <div className="px-6 py-16 text-center">
              <p className="text-sm text-red-500">{error}</p>
            </div>
          ) : filteredNotifications.length > 0 ? (
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

              <p className="mt-1 text-xs text-slate-400">Tidak ada notifikasi yang tersedia.</p>
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
}
