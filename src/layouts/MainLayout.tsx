import { useEffect, useState, type ReactNode } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import BottomNav, { type MobileNavTab } from "@/components/layout/BottomNav";

import { getUser } from "@/features/auth-login/services/authStorage";

import MobileHeader from "@/components/layout/MobileHeader";
import NavbarHeader from "@/components/layout/NavbarHeader";
import Sidebar from "@/components/Sidebar/Sidebar";

import NotificationDrawer from "@/features/notification/components/NotificationDrawer";

import { notificationService } from "@/features/notification/services/notificationService";

import { NOTIFICATION_UPDATED_EVENT } from "@/features/notification/utils/notificationEvents";

import MobileSidebar from "@/components/layout/MobileSidebar";

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface MainLayoutProps {
  children: ReactNode;
  breadcrumbs?: BreadcrumbItem[];
  notificationCount?: number;
}

export default function MainLayout({
  children,
  breadcrumbs = [],
  notificationCount = 0,
}: MainLayoutProps) {
  const navigate = useNavigate();
  const location = useLocation();

  // STATE
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [activeTab, setActiveTab] = useState<MobileNavTab>("helpdesk");

  const [showNotificationDrawer, setShowNotificationDrawer] = useState(false);

  const [unreadCount, setUnreadCount] = useState(notificationCount);

  const [showMobileSidebar, setShowMobileSidebar] = useState(false);

  // DARK MODE
  const toggleDarkMode = () => {
    setIsDarkMode((prev) => !prev);
  };

  useEffect(() => {
    document.documentElement.classList.toggle("dark", isDarkMode);

    return () => {
      document.documentElement.classList.remove("dark");
    };
  }, [isDarkMode]);

  // MENGAMBIL DAN MENYINKRONKAN JUMLAH NOTIFIKASI
  useEffect(() => {
    let active = true;
    let requestVersion = 0;

    const fetchUnreadCount = async () => {
      const currentRequest = ++requestVersion;

      try {
        const response = await notificationService.getNotifications();

        if (active && currentRequest === requestVersion) {
          setUnreadCount(response.unread_count);
        }
      } catch (error) {
        if (active && currentRequest === requestVersion) {
          console.error("Gagal memperbarui jumlah notifikasi:", error);
        }
      }
    };

    // Ambil unread count saat MainLayout pertama kali dibuka
    void fetchUnreadCount();

    // Dengarkan perubahan status notifikasi
    window.addEventListener(NOTIFICATION_UPDATED_EVENT, fetchUnreadCount);

    return () => {
      active = false;
      requestVersion++;

      window.removeEventListener(NOTIFICATION_UPDATED_EVENT, fetchUnreadCount);
    };
  }, []);

  // NOTIFIKASI MOBILE
  const handleMobileNotificationClick = () => {
    if (location.pathname === "/notification") return;

    navigate("/notification", {
      state: {
        from: `${location.pathname}${location.search}${location.hash}`,
      },
    });
  };

  // NOTIFIKASI DESKTOP
  const handleNotificationClick = () => {
    setShowNotificationDrawer(true);
  };

  const handleCloseNotification = () => {
    setShowNotificationDrawer(false);
  };

  // BREADCRUMBS
  const getCurrentBreadcrumbs = (): BreadcrumbItem[] => {
    if (breadcrumbs.length > 0) return breadcrumbs;

    const path = location.pathname;

    if (path.startsWith("/helpdesk/sarpras")) {
      const user = getUser();
      const role = user?.role;

      let label = "Koordinator Sarpras";

      if (role === "petugas-sarpras") label = "Petugas Sarpras";
      if (role === "petugas-tik") label = "Petugas TIK";
      if (role === "super-admin") label = "Super Admin";

      const base = [{ label }, { label: "Helpdesk" }];

      if (path === "/helpdesk/sarpras") {
        return [...base, { label: "Helpdesk Sarpras" }];
      }

      return [...base, { label: "Detail Tiket" }];
    }

    if (path.startsWith("/helpdesk/tik")) {
      const user = getUser();
      const role = user?.role;

      let label = "Super Admin";

      if (role === "petugas-tik") label = "Petugas TIK";
      if (role === "petugas-sarpras") label = "Petugas Sarpras";

      const base = [{ label }, { label: "Helpdesk" }];

      if (path === "/helpdesk/tik") {
        return [...base, { label: "Helpdesk TIK" }];
      }

      return [...base, { label: "Detail Tiket" }];
    }

    if (path.startsWith("/manajemen/helpdesk/tik")) {
      const base = [{ label: "Manajemen" }, { label: "Helpdesk" }];

      if (path === "/manajemen/helpdesk/tik") {
        return [...base, { label: "Helpdesk TIK" }];
      }

      return [...base, { label: "Detail Tiket" }];
    }

    if (path.startsWith("/manajemen/helpdesk/sarpras")) {
      const base = [{ label: "Manajemen" }, { label: "Helpdesk" }];

      if (path === "/manajemen/helpdesk/sarpras") {
        return [...base, { label: "Helpdesk Sarpras" }];
      }

      return [...base, { label: "Detail Tiket" }];
    }

    if (path === "/helpdesk/create") {
      return [{ label: "Helpdesk" }, { label: "Buat Tiket" }];
    }

    if (path.startsWith("/master-data")) {
      return [{ label: "Super Admin" }, { label: "Master Data" }];
    }

    if (path === "/maintenance") {
      return [{ label: "Maintenance" }];
    }

    return [];
  };

  const currentBreadcrumbs = getCurrentBreadcrumbs();

  return (
    <>
      <div className="min-h-screen bg-background text-text transition-colors">
        <div className="flex h-screen overflow-hidden">
          {/* SIDEBAR DESKTOP */}
          <div className="hidden lg:flex shrink-0">
            <Sidebar isDarkMode={isDarkMode} toggleDarkMode={toggleDarkMode} />
          </div>

          {/* MAIN AREA */}
          <div className="flex min-w-0 flex-1 flex-col bg-background h-screen overflow-hidden">
            {/* HEADER MOBILE */}
            <div className="lg:hidden shrink-0">
              <MobileHeader
                isDarkMode={isDarkMode}
                onToggleDarkMode={toggleDarkMode}
                onNotificationClick={handleMobileNotificationClick}
                notificationCount={unreadCount}
                onMenuClick={() => setShowMobileSidebar(true)}
              />
            </div>
            {/* HEADER DESKTOP */}
            <div className="hidden lg:block shrink-0">
              <NavbarHeader
                breadcrumbs={currentBreadcrumbs}
                notificationCount={unreadCount}
                onNotificationClick={handleNotificationClick}
              />
            </div>
            {/* PAGE CONTENT */}
            <main className="min-h-0 min-w-0 flex-1 overflow-y-auto bg-background pb-20 lg:pb-0">
              {children}
            </main>

            <div className="lg:hidden shrink-0">
              <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />
            </div>
          </div>
        </div>
      </div>

      {/* NOTIFICATION DRAWER DESKTOP */}
      <NotificationDrawer show={showNotificationDrawer} onClose={handleCloseNotification} />
      {/* MOBILE SIDEBAR */}
      <MobileSidebar
        show={showMobileSidebar}
        onClose={() => setShowMobileSidebar(false)}
        isDarkMode={isDarkMode}
        toggleDarkMode={toggleDarkMode}
      />
    </>
  );
}
