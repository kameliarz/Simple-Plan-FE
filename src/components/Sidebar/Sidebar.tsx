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

export default function Sidebar({ isDarkMode, toggleDarkMode }: SidebarProps) {
  const handleLogout = () => {
    // Logika logout kamu
    console.log("User logged out");
  };

  return (
    <aside className="flex h-screen w-64 flex-col border-r border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 transition-colors">
      {/* 1. Header Sidebar */}
      <div className="flex items-center gap-3 p-4 border-b border-gray-100 dark:border-slate-800">
        <button className="text-gray-600 hover:text-gray-900 dark:text-slate-400 dark:hover:text-slate-200">
          <Menu className="h-5 w-5" />
        </button>
        <div>
          <h1 className="text-sm font-bold text-blue-950 dark:text-blue-300">Simple-Plan</h1>
          <p className="text-[11px] text-gray-500 dark:text-slate-400">Rumah Sakit Citra Husada</p>
        </div>
      </div>

      {/* 2. List Menu / Navigasi (Tinggal panggil komponennya) */}
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

      {/* 3. Footer Sidebar (Mode Switch & Profil) */}
      <div className="border-t border-gray-100 dark:border-slate-800 p-4 space-y-4">
        {/* Toggle Mode */}
        <div className="flex items-center justify-between text-xs font-medium text-gray-600 dark:text-slate-400">
          <div className="flex items-center gap-2">
            {isDarkMode ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
            <span>{isDarkMode ? "Dark Mode" : "Light Mode"}</span>
          </div>
          <SwitchToggle checked={isDarkMode} onChange={toggleDarkMode} />
        </div>

        {/* User Card */}
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-full bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center text-blue-700 dark:text-blue-400 font-bold">
            🏥
          </div>
          <div className="leading-tight">
            <p className="text-sm font-bold text-gray-800 dark:text-slate-200">Super Admin</p>
            <p className="text-xs text-gray-500 dark:text-slate-400">Administrator</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
