import { useEffect, useState, type ReactNode } from "react";

import { useLocation } from "react-router-dom";

import BottomNav, { type MobileNavTab } from "@/components/layout/BottomNav";
import { getUser } from "@/features/auth-login/services/authStorage";

import MobileHeader from "@/components/layout/MobileHeader";
import NavbarHeader from "@/components/layout/NavbarHeader";
import Sidebar from "@/components/Sidebar/Sidebar";
import { useNavigate } from "react-router-dom";

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
  // Menyimpan status dark mode
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Menyimpan tab aktif pada navigasi mobile
  const [activeTab, setActiveTab] = useState<MobileNavTab>("helpdesk");

  // Membaca URL halaman saat ini
  const location = useLocation();

  // Mengubah mode terang/gelap
  const toggleDarkMode = () => {
    setIsDarkMode((prev) => !prev);
  };

  // Menerapkan dark mode ke seluruh dokumen
  useEffect(() => {
    document.documentElement.classList.toggle("dark", isDarkMode);

    return () => {
      document.documentElement.classList.remove("dark");
    };
  }, [isDarkMode]);

  // Breadcrumb default berdasarkan halaman
  const getCurrentBreadcrumbs = () => {
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
      if (path === "/helpdesk/sarpras") return [...base, { label: "Helpdesk Sarpras" }];
      return [...base, { label: "Detail Tiket" }];
    }

    if (path.startsWith("/helpdesk/tik")) {
      const user = getUser();
      const role = user?.role;
      let label = "Super Admin";
      if (role === "petugas-tik") label = "Petugas TIK";
      if (role === "petugas-sarpras") label = "Petugas Sarpras";

      const base = [{ label }, { label: "Helpdesk" }];
      if (path === "/helpdesk/tik") return [...base, { label: "Helpdesk TIK" }];
      return [...base, { label: "Detail Tiket" }];
    }

    if (path.startsWith("/manajemen/helpdesk/tik")) {
      const base = [{ label: "Manajemen" }, { label: "Helpdesk" }];
      if (path === "/manajemen/helpdesk/tik") return [...base, { label: "Helpdesk TIK" }];
      return [...base, { label: "Detail Tiket" }];
    }

    if (path.startsWith("/manajemen/helpdesk/sarpras")) {
      const base = [{ label: "Manajemen" }, { label: "Helpdesk" }];
      if (path === "/manajemen/helpdesk/sarpras") return [...base, { label: "Helpdesk Sarpras" }];
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
    <div className="min-h-screen bg-background text-text transition-colors">
      <div className="flex h-screen overflow-hidden">
        {/* =========================
            SIDEBAR (DESKTOP)
            ========================= */}
        <div className="hidden lg:flex shrink-0">
          <Sidebar isDarkMode={isDarkMode} toggleDarkMode={toggleDarkMode} />
        </div>

        {/* =========================
            MAIN AREA (MOBILE & DESKTOP)
            ========================= */}
        <div className="flex min-w-0 flex-1 flex-col bg-background h-screen overflow-hidden">
          {/* Header Mobile */}
          <div className="lg:hidden shrink-0">
            <MobileHeader
              isDarkMode={isDarkMode}
              onToggleDarkMode={toggleDarkMode}
              onNotificationClick={() => navigate("/notification")}
            />
          </div>

          {/* Header Desktop */}
          <div className="hidden lg:block shrink-0">
            <NavbarHeader breadcrumbs={currentBreadcrumbs} notificationCount={notificationCount} />
          </div>

          {/* Content (HANYA SATU KALI DI-MOUNT) */}
          <main className="min-h-0 min-w-0 flex-1 overflow-y-auto bg-background pb-20 lg:pb-0">
            {children}
          </main>

          {/* Bottom Nav Mobile */}
          <div className="lg:hidden shrink-0">
            <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />
          </div>
        </div>
      </div>
    </div>
  );
}
