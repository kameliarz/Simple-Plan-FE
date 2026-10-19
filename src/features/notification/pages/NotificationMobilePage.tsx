import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import NotificationItem from "../components/NotificationItem";
import type { Notification } from "../types/notification.types";
import { notificationService, mapNotification } from "../services/notificationService";

type NotificationTab = "all" | "unread";

export default function NotificationMobilePage() {
  const [activeTab, setActiveTab] = useState<NotificationTab>("all");

  const [notifications, setNotifications] = useState<Notification[]>([]);

  const [unreadCount, setUnreadCount] = useState(0);

  const [isLoading, setIsLoading] = useState(true);

  const [error, setError] = useState<string | null>(null);

  const readingIds = useRef(new Set<string>());

  const navigate = useNavigate();

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

  useEffect(() => {
    let active = true;

    const fetchNotifications = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const response = await notificationService.getNotifications();

        if (!active) return;

        setNotifications(response.data.map(mapNotification));
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

    fetchNotifications();

    return () => {
      active = false;
    };
  }, []);

  const filteredNotifications =
    activeTab === "unread"
      ? notifications.filter((notification) => !notification.isRead)
      : notifications;

  const handleRead = async (id: string) => {
    const notification = notifications.find((item) => item.id === id);

    if (!notification || notification.isRead || readingIds.current.has(id)) {
      return;
    }

    readingIds.current.add(id);

    try {
      await notificationService.markAsRead(id);

      setNotifications((previous) =>
        previous.map((item) => (item.id === id ? { ...item, isRead: true } : item)),
      );

      setUnreadCount((previous) => Math.max(0, previous - 1));
    } catch (error) {
      console.error("Gagal menandai notifikasi:", error);

      window.alert("Gagal menandai notifikasi sebagai sudah dibaca.");
    } finally {
      readingIds.current.delete(id);
    }
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
        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <p className="text-sm text-slate-500">Memuat notifikasi...</p>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
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
          <div className="flex flex-col items-center justify-center py-16">
            <p className="text-sm font-medium text-slate-600">Tidak ada notifikasi</p>

            <p className="mt-1 text-xs text-slate-400">Tidak ada notifikasi yang tersedia.</p>
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
