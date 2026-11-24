import { useEffect, useRef, useState, type ReactNode } from "react";

import { useLocation, useNavigate } from "react-router-dom";

import BottomNav, { type MobileNavTab } from "@/components/layout/BottomNav";

import MobileHeader from "@/components/layout/MobileHeader";
import NavbarHeader from "@/components/layout/NavbarHeader";
import MobileSidebar from "@/components/layout/MobileSidebar";
import Sidebar from "@/components/Sidebar/Sidebar";

import { getUser } from "@/features/auth-login/services/authStorage";

import NotificationDrawer from "@/features/notification/components/NotificationDrawer";

import { notificationService } from "@/features/notification/services/notificationService";

import { NOTIFICATION_UPDATED_EVENT } from "@/features/notification/utils/notificationEvents";

// ==========================================
// TYPES
// ==========================================

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface MainLayoutProps {
  children: ReactNode;
  breadcrumbs?: BreadcrumbItem[];
  notificationCount?: number;
}

// ==========================================
// NOTIFICATION BREAKPOINT
// ==========================================

// Di bawah 768px: halaman notifikasi.
// Mulai 768px: notification slide-over.
//
// Mengikuti breakpoint "md" Tailwind.
const NOTIFICATION_DRAWER_BREAKPOINT = "(min-width: 768px)";

// ==========================================
// MAIN LAYOUT
// ==========================================

export default function MainLayout({
  children,
  breadcrumbs = [],
  notificationCount = 0,
}: MainLayoutProps) {
  const navigate = useNavigate();
  const location = useLocation();

  const [isDarkMode, setIsDarkMode] = useState(false);

  const [showNotificationDrawer, setShowNotificationDrawer] = useState(false);

  const [unreadCount, setUnreadCount] = useState(notificationCount);

  const [showMobileSidebar, setShowMobileSidebar] = useState(false);

  const knownNotificationIds = useRef<Set<string> | null>(null);
  const notificationAudio = useRef<HTMLAudioElement | null>(null);

  const activeTab: MobileNavTab = (() => {
    if (location.pathname.startsWith("/inventaris") || location.pathname.startsWith("/inventory")) {
      return "inventaris";
    }

    if (
      location.pathname.startsWith("/design-graphic") ||
      location.pathname.startsWith("/graphic-design")
    ) {
      return "design-graphic";
    }

    if (location.pathname.startsWith("/helpdesk")) {
      return "helpdesk";
    }

    if (location.pathname === "/" || location.pathname.startsWith("/dashboard")) {
      return "dashboard";
    }

    if (location.pathname.startsWith("/master-data") || location.pathname.startsWith("/profile")) {
      return "profile";
    }

    return "helpdesk";
  })();

  const handleTabChange = (tab: MobileNavTab) => {
    if (tab === "dashboard") {
      navigate("/");
    } else if (tab === "helpdesk") {
      navigate("/helpdesk/tik");
    } else if (tab === "inventaris") {
      navigate("/inventaris/tik");
    } else if (tab === "design-graphic") {
      navigate("/design-graphic/my-requests");
    } else if (tab === "profile") {
      navigate("/master-data/users");
    }
  };

  const toggleDarkMode = () => {
    setIsDarkMode((prev) => !prev);
  };

  useEffect(() => {
    document.documentElement.classList.toggle("dark", isDarkMode);

    return () => {
      document.documentElement.classList.remove("dark");
    };
  }, [isDarkMode]);

  useEffect(() => {
    const audio = new Audio("/sounds/notification.mp3");

    audio.preload = "auto";
    audio.volume = 0.5;

    notificationAudio.current = audio;

    return () => {
      audio.pause();
      audio.removeAttribute("src");
      audio.load();

      if (notificationAudio.current === audio) {
        notificationAudio.current = null;
      }
    };
  }, []);

  useEffect(() => {
    let active = true;
    let isFetching = false;

    const fetchNotifications = async () => {
      if (isFetching) return;
      isFetching = true;

      try {
        const response = await notificationService.getNotifications();
        if (!active) return;

        setUnreadCount(response.unread_count);

        const currentIds = new Set(response.data.map((notification) => String(notification.id)));

        if (knownNotificationIds.current === null) {
          knownNotificationIds.current = currentIds;
          return;
        }

        const hasNewNotification = response.data.some(
          (notification) =>
            !notification.is_read && !knownNotificationIds.current?.has(String(notification.id)),
        );

        const updatedIds = new Set([...knownNotificationIds.current, ...currentIds]);
        knownNotificationIds.current = updatedIds;

        if (hasNewNotification) {
          const audio = notificationAudio.current;
          if (audio) {
            audio.pause();
            audio.currentTime = 0;
            void audio.play().catch((error) => {
              console.warn("Suara notifikasi diblokir browser atau gagal diputar:", error);
            });
          }
        }
      } catch (error) {
        if (active) {
          console.error("Gagal memperbarui notifikasi:", error);
        }
      } finally {
        isFetching = false;
      }
    };

    void fetchNotifications();

    const interval = window.setInterval(() => {
      void fetchNotifications();
    }, 10000);

    const handleNotificationUpdated = () => {
      void fetchNotifications();
    };

    window.addEventListener(NOTIFICATION_UPDATED_EVENT, handleNotificationUpdated);

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        void fetchNotifications();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    const handleOnline = () => {
      void fetchNotifications();
    };

    window.addEventListener("online", handleOnline);

    return () => {
      active = false;
      window.clearInterval(interval);
      window.removeEventListener(NOTIFICATION_UPDATED_EVENT, handleNotificationUpdated);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("online", handleOnline);
    };
  }, []);

  const handleMobileNotificationClick = () => {
    const isTabletOrLarger = window.matchMedia(NOTIFICATION_DRAWER_BREAKPOINT).matches;

    // TABLET: OPEN SLIDE-OVER
    if (isTabletOrLarger) {
      setShowNotificationDrawer(true);
      return;
    }

    // MOBILE: OPEN NOTIFICATION PAGE
    if (location.pathname === "/notification") {
      return;
    }

    navigate("/notification", {
      state: {
        from: `${location.pathname}${location.search}${location.hash}`,
      },
    });
  };

  const handleNotificationClick = () => {
    setShowNotificationDrawer(true);
  };

  // ==========================================
  // CLOSE NOTIFICATION DRAWER
  // ==========================================

  const handleCloseNotification = () => {
    setShowNotificationDrawer(false);
  };

  const getCurrentBreadcrumbs = (): BreadcrumbItem[] => {
    if (breadcrumbs.length > 0) {
      return breadcrumbs;
    }

    const path = location.pathname;

    // ======================================
    // HELPDESK SARPRAS
    // ======================================
    if (path === "/" || path === "/dashboard") {
      const user = getUser();
      const role = user?.role;
      let label = "Super Admin";
      if (role === "koordinator-sarpras") label = "Koordinator Sarpras";
      if (role === "petugas-tik") label = "Petugas TIK";
      if (role === "petugas-sarpras") label = "Petugas Sarpras";
      if (role === "manajemen" || role === "management") label = "Manajemen";
      if (role === "user") label = user?.jabatan || "User";

      return [{ label }, { label: "Dashboard" }];
    }

    if (path.startsWith("/helpdesk/sarpras")) {
      const user = getUser();
      const role = user?.role;

      let label = "Koordinator Sarpras";

      if (role === "petugas-sarpras") {
        label = "Petugas Sarpras";
      }

      if (role === "manajemen" || role === "management") {
        label = "Manajemen";
      }

      if (role === "petugas-tik") {
        label = "Petugas TIK";
      }

      if (role === "super-admin") {
        label = "Super Admin";
      }

      const base = [{ label }, { label: "Helpdesk" }];

      if (path === "/helpdesk/sarpras") {
        return [...base, { label: "Helpdesk Sarpras" }];
      }

      return [...base, { label: "Detail Tiket" }];
    }

    // ======================================
    // HELPDESK TIK
    // ======================================

    if (path.startsWith("/helpdesk/tik")) {
      const user = getUser();
      const role = user?.role;

      let label = "Super Admin";

      if (role === "petugas-tik") {
        label = "Petugas TIK";
      }

      if (role === "petugas-sarpras") {
        label = "Petugas Sarpras";
      }

      const base = [{ label }, { label: "Helpdesk" }];

      if (path === "/helpdesk/tik") {
        return [...base, { label: "Helpdesk TIK" }];
      }

      return [...base, { label: "Detail Tiket" }];
    }

    // ======================================
    // MANAJEMEN HELPDESK TIK
    // ======================================

    if (path.startsWith("/manajemen/helpdesk/tik")) {
      const base = [{ label: "Manajemen" }, { label: "Helpdesk" }];

      if (path === "/manajemen/helpdesk/tik") {
        return [...base, { label: "Helpdesk TIK" }];
      }

      return [...base, { label: "Detail Tiket" }];
    }

    // ======================================
    // MANAJEMEN HELPDESK SARPRAS
    // ======================================

    if (path.startsWith("/manajemen/helpdesk/sarpras")) {
      const base = [{ label: "Manajemen" }, { label: "Helpdesk" }];

      if (path === "/manajemen/helpdesk/sarpras") {
        return [...base, { label: "Helpdesk Sarpras" }];
      }

      return [...base, { label: "Detail Tiket" }];
    }

    // ======================================
    // CREATE HELPDESK
    // ======================================

    if (path === "/helpdesk/create") {
      return [{ label: "Helpdesk" }, { label: "Buat Tiket" }];
    }

    // ======================================
    // INVENTARIS TIK
    // ======================================

    if (path.startsWith("/inventaris/tik")) {
      const base = [{ label: "Super Admin" }, { label: "Inventaris Aset" }];

      if (path === "/inventaris/tik") {
        return [...base, { label: "Inventaris TIK" }];
      }

      return [...base, { label: "Detail Inventaris TIK" }];
    }

    // ======================================
    // INVENTARIS SARPRAS
    // ======================================

    if (path.startsWith("/inventaris/sarpras")) {
      const base = [{ label: "Super Admin" }, { label: "Inventaris Aset" }];

      if (path === "/inventaris/sarpras") {
        return [...base, { label: "Inventaris Sarpras" }];
      }

      return [...base, { label: "Detail Inventaris Sarpras" }];
    }

    // ======================================
    // MASTER DATA
    // ======================================

    if (path.startsWith("/master-data")) {
      return [{ label: "Super Admin" }, { label: "Master Data" }];
    }

    // ======================================
    // MAINTENANCE
    // ======================================

    if (path.startsWith("/maintenance")) {
      const user = getUser();
      const role = user?.role;

      let label = "Super Admin";

      if (role === "koordinator-sarpras") {
        label = "Koordinator Sarpras";
      }

      if (role === "petugas-tik") {
        label = "Petugas TIK";
      }

      if (role === "petugas-sarpras") {
        label = "Petugas Sarpras";
      }

      return [{ label }, { label: "Maintenance" }];
    }

    // ======================================
    // DESIGN GRAPHIC
    // ======================================

    if (path.startsWith("/design-graphic")) {
      const user = getUser();
      const role = user?.role;

      let label = "Super Admin";

      if (role === "koordinator-sarpras") {
        label = "Koordinator Sarpras";
      }

      if (role === "petugas-tik") {
        label = "Petugas TIK";
      }

      if (role === "petugas-sarpras") {
        label = "Petugas Sarpras";
      }

      if (role === "manajemen" || role === "management") {
        label = "Manajemen";
      }

      if (role === "user") {
        label = user?.jabatan || "User";
      }

      if (path.startsWith("/design-graphic/manage-requests")) {
        const subLabel =
          role === "manajemen" || role === "management" ? "Rekap Desain" : "Kelola Request";
        return [{ label }, { label: "Desain Grafis" }, { label: subLabel }];
      }

      return [{ label }, { label: "Desain Grafis" }, { label: "Request Saya" }];
    }

    // ======================================
    // GRAPHIC DESIGN DETAIL / FALLBACK
    // ======================================

    if (path.startsWith("/design-graphic") || path.startsWith("/graphic-design")) {
      const user = getUser();
      const role = user?.role;

      let label = "Super Admin";

      if (role === "koordinator-sarpras") {
        label = "Koordinator Sarpras";
      }

      if (role === "petugas-tik") {
        label = "Petugas TIK";
      }

      if (role === "petugas-sarpras") {
        label = "Petugas Sarpras";
      }

      if (role === "manajemen" || role === "management") {
        label = "Manajemen";
      }

      if (role === "user") {
        label = user?.jabatan || "User";
      }

      if (
        path.startsWith("/graphic-design/") ||
        (path.startsWith("/design-graphic/") &&
          path !== "/design-graphic/my-requests" &&
          path !== "/design-graphic/manage-requests" &&
          path !== "/design-graphic/assigned-tasks" &&
          path !== "/design-graphic/create")
      ) {
        return [{ label }, { label: "Desain Grafis" }, { label: "Detail Request Desain" }];
      }

      if (path.startsWith("/design-graphic/manage-requests")) {
        const subLabel =
          role === "manajemen" || role === "management" ? "Rekap Desain" : "Kelola Request";
        return [{ label }, { label: "Desain Grafis" }, { label: subLabel }];
      }

      if (path.startsWith("/design-graphic/assigned-tasks")) {
        return [{ label }, { label: "Desain Grafis" }, { label: "Tugas Desain" }];
      }

      if (path.startsWith("/design-graphic/create")) {
        return [{ label }, { label: "Desain Grafis" }, { label: "Buat Request" }];
      }

      if (path.startsWith("/design-graphic/assigned-tasks")) {
        return [{ label }, { label: "Desain Grafis" }, { label: "Tugas Desain" }];
      }

      if (path.startsWith("/design-graphic/create")) {
        return [{ label }, { label: "Desain Grafis" }, { label: "Buat Request" }];
      }

      if (path.startsWith("/design-graphic/assigned-tasks")) {
        return [{ label }, { label: "Desain Grafis" }, { label: "Tugas Desain" }];
      }

      if (path.startsWith("/design-graphic/create")) {
        return [{ label }, { label: "Desain Grafis" }, { label: "Buat Request" }];
      }

      return [{ label }, { label: "Desain Grafis" }, { label: "Request Saya" }];
    }

    return [];
  };

  const currentBreadcrumbs = getCurrentBreadcrumbs();

  return (
    <>
      <div className="min-h-screen bg-background text-text transition-colors">
        <div className="flex h-screen overflow-hidden">
          <div className="hidden shrink-0 lg:flex">
            <Sidebar isDarkMode={isDarkMode} toggleDarkMode={toggleDarkMode} />
          </div>

          <div className="flex h-screen min-w-0 flex-1 flex-col overflow-hidden bg-background">
            <div className="shrink-0 lg:hidden">
              <MobileHeader
                isDarkMode={isDarkMode}
                onToggleDarkMode={toggleDarkMode}
                onNotificationClick={handleMobileNotificationClick}
                notificationCount={unreadCount}
                onMenuClick={() => setShowMobileSidebar(true)}
              />
            </div>

            <div className="hidden shrink-0 lg:block">
              <NavbarHeader
                breadcrumbs={currentBreadcrumbs}
                notificationCount={unreadCount}
                onNotificationClick={handleNotificationClick}
              />
            </div>

            <main className="min-h-0 min-w-0 flex-1 overflow-y-auto bg-background pb-20 lg:pb-0">
              {children}
            </main>

            <div className="shrink-0 lg:hidden">
              <BottomNav activeTab={activeTab} onTabChange={handleTabChange} />
            </div>
          </div>
        </div>
      </div>

      <NotificationDrawer show={showNotificationDrawer} onClose={handleCloseNotification} />

      {/* ====================================== */}
      {/* MOBILE SIDEBAR */}
      {/* ====================================== */}

      <MobileSidebar
        show={showMobileSidebar}
        onClose={() => setShowMobileSidebar(false)}
        isDarkMode={isDarkMode}
        toggleDarkMode={toggleDarkMode}
      />
    </>
  );
}
