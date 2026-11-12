import { useEffect, useRef, useState } from "react";

import Modal from "@/components/ui/ui-template/Modal";
import NotificationItem from "./NotificationItem";

import { notificationService, mapNotification } from "../services/notificationService";

import { notifyNotificationUpdated } from "../utils/notificationEvents";

import type { Notification } from "../types/notification.types";

type NotificationTab = "all" | "unread";
type NotificationGroup = "today" | "yesterday" | "previous";

const GROUP_LABELS: Record<NotificationGroup, string> = {
  today: "HARI INI",
  yesterday: "KEMARIN",
  previous: "SEBELUMNYA",
};

interface NotificationDrawerProps {
  show: boolean;
  onClose: () => void;
}

function getJakartaDateKey(date: Date): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Jakarta",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}

function getNotificationGroup(createdAt: string, now: Date): NotificationGroup {
  const notificationDate = new Date(createdAt);

  if (Number.isNaN(notificationDate.getTime())) {
    return "previous";
  }

  const todayKey = getJakartaDateKey(now);

  const yesterday = new Date(now);
  yesterday.setTime(yesterday.getTime() - 24 * 60 * 60 * 1000);

  const yesterdayKey = getJakartaDateKey(yesterday);
  const notificationKey = getJakartaDateKey(notificationDate);

  if (notificationKey === todayKey) return "today";
  if (notificationKey === yesterdayKey) return "yesterday";

  return "previous";
}

export default function NotificationDrawer({ show, onClose }: NotificationDrawerProps) {
  const [activeTab, setActiveTab] = useState<NotificationTab>("all");

  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Menyimpan ID notifikasi yang detailnya sedang terbuka
  const [expandedIds, setExpandedIds] = useState<Set<string>>(() => new Set());

  // Menyimpan notifikasi yang sudah dibaca tetapi
  // masih perlu ditampilkan sampai detailnya ditutup
  const [visibleReadIds, setVisibleReadIds] = useState<Set<string>>(() => new Set());

  const readingIds = useRef(new Set<string>());
  const notificationsRef = useRef<Notification[]>([]);
  const unreadCountRef = useRef(0);

  const handleClose = () => {
    setExpandedIds(new Set());
    setVisibleReadIds(new Set());
    setActiveTab("all");

    onClose();
  };

  // FETCH NOTIFIKASI
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
      ? notifications.filter(
          (notification) => !notification.isRead || visibleReadIds.has(notification.id),
        )
      : notifications;

  const now = new Date();

  const groupedNotifications = {
    today: [] as Notification[],
    yesterday: [] as Notification[],
    previous: [] as Notification[],
  };

  filteredNotifications.forEach((notification) => {
    const group = getNotificationGroup(notification.createdAtRaw, now);

    groupedNotifications[group].push(notification);
  });

  const groupOrder: NotificationGroup[] = ["today", "yesterday", "previous"];

  // MENANDAI NOTIFIKASI SUDAH DIBACA
  const handleRead = async (id: string) => {
    const notification = notificationsRef.current.find((item) => item.id === id);

    if (!notification || notification.isRead || readingIds.current.has(id)) {
      return;
    }

    readingIds.current.add(id);

    // Pertahankan notifikasi selama detailnya terbuka
    // khusus ketika dibuka dari tab Belum dibaca
    if (activeTab === "unread") {
      setVisibleReadIds((prev) => {
        const next = new Set(prev);
        next.add(id);
        return next;
      });
    }

    try {
      // Update status di backend
      await notificationService.markAsRead(id);

      // Update daftar lokal
      const updatedNotifications = notificationsRef.current.map((item) =>
        item.id === id ? { ...item, isRead: true } : item,
      );

      notificationsRef.current = updatedNotifications;
      setNotifications(updatedNotifications);

      // Kurangi jumlah notifikasi belum dibaca
      const newUnreadCount = Math.max(0, unreadCountRef.current - 1);

      unreadCountRef.current = newUnreadCount;
      setUnreadCount(newUnreadCount);

      // Perbarui badge notifikasi di header
      notifyNotificationUpdated();
    } catch (error) {
      console.error("Gagal menandai notifikasi:", error);

      // Hapus dari daftar sementara jika API gagal
      setVisibleReadIds((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });

      window.alert("Gagal menandai notifikasi sebagai sudah dibaca.");
    } finally {
      readingIds.current.delete(id);
    }
  };

  // BUKA / TUTUP DETAIL NOTIFIKASI
  const handleToggleExpanded = (id: string, expanded: boolean) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);

      if (expanded) {
        next.add(id);
      } else {
        next.delete(id);
      }

      return next;
    });

    // Ketika detail ditutup, hapus dari daftar
    // yang dipertahankan di tab Belum dibaca
    if (!expanded) {
      setVisibleReadIds((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    }
  };

  return (
    <Modal show={show} onClose={handleClose} title="Notifikasi" type="slide-over" maxWidth="md">
      <div className="-mx-4 -my-6 sm:-mx-6">
        {/* TAB NAVIGATION */}
        <div
          className="
            sticky top-0 z-10
            flex items-center gap-5
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
              ${activeTab === "all" ? "text-primary-500" : "text-slate-500 hover:text-slate-700"}
            `}
          >
            Semua notifikasi
            {activeTab === "all" && (
              <span
                className="
                  absolute inset-x-0 bottom-0
                  h-0.5 rounded-full bg-primary-500
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
              ${activeTab === "unread" ? "text-primary-500" : "text-slate-500 hover:text-slate-700"}
            `}
          >
            Belum dibaca ({unreadCount})
            {activeTab === "unread" && (
              <span
                className="
                  absolute inset-x-0 bottom-0
                  h-0.5 rounded-full bg-primary-500
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
            groupOrder.map((group) => {
              const items = groupedNotifications[group];

              if (items.length === 0) return null;

              return (
                <div key={group} className="mb-4">
                  <div className="px-5 pt-2">
                    <p
                      className="
                        text-[11px] font-medium
                        uppercase tracking-wider
                        text-slate-500
                        dark:text-slate-500
                      "
                    >
                      {GROUP_LABELS[group]}
                    </p>
                  </div>

                  {/* DAFTAR NOTIFIKASI */}
                  <div>
                    {items.map((notification) => (
                      <NotificationItem
                        key={notification.id}
                        notification={notification}
                        onRead={handleRead}
                        expanded={expandedIds.has(notification.id)}
                        onToggleExpanded={handleToggleExpanded}
                      />
                    ))}
                  </div>
                </div>
              );
            })
          ) : (
            <div
              className="
                flex flex-col items-center justify-center
                px-6 py-16 text-center
              "
            >
              <p
                className="
                  text-sm font-medium
                  text-slate-600
                  dark:text-slate-300
                "
              >
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
