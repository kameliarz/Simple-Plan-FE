import { Menu, Sun, Moon } from "lucide-react";

import SwitchToggle from "../ui/SwitchToggle";

import DashboardTab from "./DashboardTab";
import MasterDataTab from "./MasterDataTab";
import InventarisAsetTab from "./InventarisAsetTab";
import HelpdeskTab from "./HelpdeskTab";
import MaintenanceTab from "./MaintenanceTab";
import CadanganDataTab from "./CadanganDataTab";
import LaporanTab from "./LaporanTab";
import NotifikasiTab from "./NotifikasiTab";
import LogoutTab from "./LogoutTab";

interface SidebarProps {
  isDarkMode?: boolean;
  toggleDarkMode?: () => void;
}

export default function Sidebar({ isDarkMode = false, toggleDarkMode }: SidebarProps) {
  const handleLogout = () => {
    // Logika logout kamu
    console.log("User logged out");
  };

  return (
    <aside className="flex h-screen w-64 flex-col border-r border-gray-200 bg-sidebar transition-colors dark:border-slate-800">
      {/* Header Sidebar */}
      <div className="flex items-center gap-3 border-b border-gray-200 p-4 dark:border-slate-800">
        {/* Tombol Menu */}
        <button
          type="button"
          className="text-text-secondary transition-colors hover:text-text-title"
          aria-label="Menu"
        >
          <Menu className="h-5 w-5" />
        </button>

        {/* Logo / Nama Aplikasi */}
        <div>
          <h1 className="text-sm font-bold text-text-title">Simple-Plan</h1>

          <p className="text-[11px] text-text-secondary">Rumah Sakit Citra Husada</p>
        </div>
      </div>

      {/* List Menu / Navigasi */}
      <nav className="flex-1 space-y-1 overflow-y-auto py-3">
        <DashboardTab />
        <MasterDataTab />
        <InventarisAsetTab />
        <HelpdeskTab />
        <MaintenanceTab />
        <CadanganDataTab />
        <LaporanTab />
        <NotifikasiTab />

        <LogoutTab onLogout={handleLogout} />
      </nav>

      {/* Footer Sidebar */}
      <div className="space-y-4 border-t border-gray-200 p-4 dark:border-slate-800">
        {/* Toggle Mode */}
        <div className="flex items-center justify-between text-xs font-medium text-text-secondary">
          <div className="flex items-center gap-2">
            {isDarkMode ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}

            <span>{isDarkMode ? "Dark Mode" : "Light Mode"}</span>
          </div>

          <SwitchToggle checked={isDarkMode} onChange={toggleDarkMode} />
        </div>

        {/* User Card */}
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-100 font-bold text-blue-700 dark:bg-blue-900/50 dark:text-blue-400">
            🏥
          </div>

          <div className="leading-tight">
            <p className="text-sm font-bold text-text-title">Super Admin</p>

            <p className="text-xs text-text-secondary">Administrator</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
