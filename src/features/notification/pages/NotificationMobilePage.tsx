import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

import NotificationItem from "../components/NotificationItem";

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

const GROUP_ORDER: NotificationGroup[] = ["today", "yesterday", "previous"];

// Mengambil tanggal berdasarkan zona waktu WIB
function getJakartaDateKey(date: Date): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Jakarta",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}

// Menentukan kelompok notifikasi
function getNotificationGroup(createdAt: string, now: Date): NotificationGroup {
  const notificationDate = new Date(createdAt);

  if (Number.isNaN(notificationDate.getTime())) {
    return "previous";
  }

  const todayKey = getJakartaDateKey(now);

  const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);

  const yesterdayKey = getJakartaDateKey(yesterday);
  const notificationKey = getJakartaDateKey(notificationDate);

  if (notificationKey === todayKey) {
    return "today";
  }

  if (notificationKey === yesterdayKey) {
    return "yesterday";
  }

  return "previous";
}

export default function NotificationMobilePage() {
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<NotificationTab>("all");

  const [notifications, setNotifications] = useState<Notification[]>([]);

  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Menyimpan notifikasi yang detailnya terbuka
  const [expandedIds, setExpandedIds] = useState<Set<string>>(() => new Set());

  // Menyimpan notifikasi yang sudah dibaca
  // tetapi detailnya masih terbuka
  const [visibleReadIds, setVisibleReadIds] = useState<Set<string>>(() => new Set());

  const readingIds = useRef(new Set<string>());
  const notificationsRef = useRef<Notification[]>([]);
  const unreadCountRef = useRef(0);

  // REDIRECT KETIKA LAYAR DESKTOP
  useEffect(() => {
    const mediaQuery = window.matchMedia("(min-width: 768px)");

    const handleResize = () => {
      if (mediaQuery.matches) {
        navigate("/dashboard", { replace: true });
      }
    };

    handleResize();

    mediaQuery.addEventListener("change", handleResize);

    return () => {
      mediaQuery.removeEventListener("change", handleResize);
    };
  }, [navigate]);

  // FETCH NOTIFIKASI
  useEffect(() => {
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
  }, []);

  // FILTER NOTIFIKASI
  const filteredNotifications =
    activeTab === "unread"
      ? notifications.filter(
          (notification) => !notification.isRead || visibleReadIds.has(notification.id),
        )
      : notifications;

  // PENGELOMPOKAN NOTIFIKASI
  const now = new Date();

  const groupedNotifications: Record<NotificationGroup, Notification[]> = {
    today: [],
    yesterday: [],
    previous: [],
  };

  filteredNotifications.forEach((notification) => {
    const group = getNotificationGroup(notification.createdAtRaw, now);

    groupedNotifications[group].push(notification);
  });

  // MENANDAI NOTIFIKASI SUDAH DIBACA
  const handleRead = async (id: string) => {
    const notification = notificationsRef.current.find((item) => item.id === id);

    if (!notification || notification.isRead || readingIds.current.has(id)) {
      return;
    }

    readingIds.current.add(id);

    // Pertahankan notifikasi apabila dibuka
    // dari tab Belum dibaca
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

      // Update status lokal
      const updatedNotifications = notificationsRef.current.map((item) =>
        item.id === id ? { ...item, isRead: true } : item,
      );

      notificationsRef.current = updatedNotifications;
      setNotifications(updatedNotifications);

      // Kurangi jumlah notifikasi belum dibaca
      const newUnreadCount = Math.max(0, unreadCountRef.current - 1);

      unreadCountRef.current = newUnreadCount;
      setUnreadCount(newUnreadCount);

      // Sinkronkan badge notifikasi di header
      notifyNotificationUpdated();
    } catch (error) {
      console.error("Gagal menandai notifikasi:", error);

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

    // Setelah detail ditutup, notifikasi yang
    // sudah dibaca tidak lagi ditampilkan
    // pada tab Belum dibaca
    if (!expanded) {
      setVisibleReadIds((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    }
  };

  return (
    <div
      className="
        min-h-screen
        bg-white
        pb-16
        dark:bg-slate-950
      "
    >
      {/* HEADER */}
      <div className="px-4 pt-4">
        <h1
          className="
            text-lg font-semibold
            text-text-secondary
            dark:text-slate-100
          "
        >
          Notifikasi
        </h1>
      </div>

      {/* TAB NAVIGATION */}
      <div
        className="
          sticky top-0 z-10
          mt-3 flex gap-5
          border-b border-soft-border
          bg-white px-4
          dark:border-slate-800
          dark:bg-slate-950
        "
      >
        {/* SEMUA NOTIFIKASI */}
        <button
          type="button"
          onClick={() => setActiveTab("all")}
          className={`
            relative py-3 text-xs
            transition-colors
            ${
              activeTab === "all"
                ? "font-semibold text-primary-500"
                : "text-slate-500 hover:text-slate-700"
            }
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
            relative py-3 text-xs
            transition-colors
            ${
              activeTab === "unread"
                ? "font-semibold text-primary-500"
                : "text-slate-500 hover:text-slate-700"
            }
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
          <div className="flex items-center justify-center py-16">
            <p className="text-sm text-slate-500">Memuat notifikasi...</p>
          </div>
        ) : error ? (
          <div
            className="
              flex flex-col items-center
              justify-center px-6 py-16
              text-center
            "
          >
            <p className="text-sm text-red-500">{error}</p>
          </div>
        ) : filteredNotifications.length > 0 ? (
          GROUP_ORDER.map((group) => {
            const items = groupedNotifications[group];

            if (items.length === 0) return null;

            return (
              <div key={group} className="mb-4">
                {/* JUDUL KELOMPOK */}
                <div className="px-5 pt-3 pb-1">
                  <p
                    className="
                      text-[11px] font-medium
                      uppercase tracking-wider
                      text-slate-500
                      dark:text-slate-400
                    "
                  >
                    {GROUP_LABELS[group]}
                  </p>
                </div>

                {/* ITEM NOTIFIKASI */}
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
              flex flex-col items-center
              justify-center px-6 py-16
              text-center
            "
          >
            <p className="text-sm font-medium text-slate-600">Tidak ada notifikasi</p>

            <p className="mt-1 text-xs text-slate-400">Tidak ada notifikasi yang tersedia.</p>
          </div>
        )}
      </div>

      {/* BOTTOM NAVIGATION */}
      <nav
        className="
          fixed bottom-0 left-0 right-0 z-20
          flex h-14 items-center justify-around
          border-t border-soft-border
          bg-white
          dark:bg-slate-950
        "
      >
        <span className="text-[10px] text-slate-500">Dashboard</span>

        <span className="text-[10px] font-semibold text-blue-600">Notifikasi</span>

        <span className="text-[10px] text-slate-500">Profil</span>
      </nav>
    </div>
  );
}
