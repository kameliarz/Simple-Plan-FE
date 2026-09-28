import { Menu } from "lucide-react";
import { useNavigate } from "react-router-dom";
import SwitchToggle from "../ui/SwitchToggle";
import DashboardTab from "./DashboardTab";
import MasterDataTab from "./MasterDataTab";
import InventarisAsetTab from "./InventarisAsetTab";
import HelpdeskTab from "./HelpdeskTab";
import MaintenanceTab from "./MaintenanceTab";
import CadanganDataTab from "./CadanganDataTab";
import LaporanTab from "./LaporanTab";
import LogoutTab from "./LogoutTab";
import { User } from "lucide-react";
import { clearAuth } from "@/features/auth-login/services/authStorage";

interface SidebarProps {
  isDarkMode?: boolean;
  toggleDarkMode?: () => void;
}

export default function Sidebar({ isDarkMode, toggleDarkMode }: SidebarProps) {
  const navigate = useNavigate();

  const handleLogout = () => {
    clearAuth();
    navigate("/login");
  };

  return (
    <aside className="flex h-screen w-64 flex-col border-r border-gray-200 dark:border-slate-800 bg-sidebar transition-colors">
      {/* 1. Header Sidebar */}
      <div className="flex h-[72px] items-center gap-3 px-4 border-b border-gray-200 dark:border-slate-800">
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
        <LogoutTab onLogout={handleLogout} />
      </nav>

      {/* 3. Footer Sidebar (Mode Switch & Profil) */}
      <div className="border-t border-gray-100 dark:border-slate-800 p-4 space-y-4">
        {/* Toggle Mode */}
        <div className="flex items-center justify-between text-xs font-medium text-gray-600 dark:text-slate-400">
          <span>Mode</span>
          <SwitchToggle checked={isDarkMode} onChange={toggleDarkMode} />
        </div>

        {/* User Card */}
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-400">
            <User className="h-5 w-5" />
          </div>
          <div className="leading-tight">
            <p className="text-sm font-bold text-gray-800 dark:text-slate-200">
              Koordinator Sarpas
            </p>
            <p className="text-xs text-gray-500 dark:text-slate-400">Nur Colis</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
