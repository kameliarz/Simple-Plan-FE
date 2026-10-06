import { useEffect, useState, type ReactNode } from "react";

import { useLocation } from "react-router-dom";

import BottomNav, { type MobileNavTab } from "@/components/layout/BottomNav";

import MobileHeader from "@/components/layout/MobileHeader";
import NavbarHeader from "@/components/layout/NavbarHeader";
import Sidebar from "@/components/Sidebar/Sidebar";

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

    if (path.startsWith("/petugas/tik/helpdesk")) {
      const base = [{ label: "Petugas TIK" }, { label: "Helpdesk" }];
      if (path === "/petugas/tik/helpdesk") return [...base, { label: "Daftar Tiket" }];
      return [...base, { label: "Detail Tiket" }];
    }

    if (path.startsWith("/petugas/sarpras/helpdesk")) {
      const base = [{ label: "Petugas Sarpras" }, { label: "Helpdesk" }];
      if (path === "/petugas/sarpras/helpdesk") return [...base, { label: "Daftar Tiket" }];
      return [...base, { label: "Detail Tiket" }];
    }

    if (path.startsWith("/helpdesk/sarpras")) {
      const base = [{ label: "Koordinator Sarpras" }, { label: "Helpdesk" }];
      if (path === "/helpdesk/sarpras") return [...base, { label: "Helpdesk Sarpras" }];
      return [...base, { label: "Detail Tiket" }];
    }

    if (path.startsWith("/helpdesk/tik")) {
      const base = [{ label: "Super Admin" }, { label: "Helpdesk" }];
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

    if (path === "/maintenance") {
      return [{ label: "Maintenance" }];
    }

    return [];
  };

  const currentBreadcrumbs = getCurrentBreadcrumbs();

  return (
    <div className="min-h-screen bg-background text-text transition-colors">
      {/* =========================
          MOBILE
          ========================= */}
      <div className="min-h-screen bg-background lg:hidden">
        <MobileHeader isDarkMode={isDarkMode} onToggleDarkMode={toggleDarkMode} />

        <main className="min-h-screen bg-background pb-20">{children}</main>

        <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />
      </div>

      {/* =========================
          DESKTOP
          ========================= */}
      <div className="hidden h-screen overflow-hidden bg-background lg:flex">
        {/* Sidebar */}
        <Sidebar isDarkMode={isDarkMode} toggleDarkMode={toggleDarkMode} />

        {/* Main Area */}
        <div className="flex min-h-screen min-w-0 flex-1 flex-col bg-background">
          <NavbarHeader breadcrumbs={currentBreadcrumbs} notificationCount={notificationCount} />

          {/* Content */}
          <main className="min-h-0 min-w-0 flex-1 overflow-y-auto bg-background">{children}</main>
        </div>
      </div>
    </div>
  );
}
