import { Menu, User } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../features/auth-login/context/AuthContext";

import SwitchToggle from "../ui/SwitchToggle";
import DashboardTab from "./DashboardTab";
import MasterDataTab from "./MasterDataTab";
import InventarisAsetTab from "./InventarisAsetTab";
import HelpdeskTab from "./HelpdeskTab";
import MaintenanceTab from "./MaintenanceTab";
import CadanganDataTab from "./CadanganDataTab";
import DesignGraphicTab from "./DesignGraphicTab";
import LaporanTab from "./LaporanTab";
import LogoutTab from "./LogoutTab";

import { getUser } from "@/features/auth-login/services/authStorage";

interface SidebarProps {
  isDarkMode?: boolean;
  toggleDarkMode?: () => void;
  onClose?: () => void;
}

export default function Sidebar({ isDarkMode, toggleDarkMode, onClose }: SidebarProps) {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const user = getUser();

  const handleLogout = () => {
    logout();
    onClose?.();
    navigate("/login", { replace: true });
  };

  const roleLabels: Record<string, string> = {
    "super-admin": "Super Admin",
    "koordinator-sarpras": "Koordinator Sarpras",
    "petugas-tik": "Petugas TIK",
    "petugas-sarpras": "Petugas Sarpras",
    user: "User",
    management: "Manajemen",
  };

  const roleName =
    user?.role === "user"
      ? user?.jabatan || "Jabatan belum tersedia"
      : user?.role
        ? (roleLabels[user.role] ?? user.role)
        : "Role belum tersedia";

  return (
    <aside
      className="
        flex h-full w-64 flex-col
        border-r border-gray-200
        bg-sidebar transition-colors
        dark:border-slate-800
      "
    >
      {/* ======================================
          SIDEBAR HEADER
      ====================================== */}
      <div
        className="
          flex h-18 shrink-0 items-center gap-3
          border-b border-soft-border px-3
        "
      >
        {/* DESKTOP: LOGO */}
        <img
          src="/logo-simple-plan.png"
          alt="Logo Simple-Plan"
          className="
            hidden h-7 w-7 shrink-0
            object-contain lg:block
          "
        />

        {/* MOBILE: HAMBURGER MENU */}
        <button
          type="button"
          onClick={onClose}
          aria-label="Tutup menu sidebar"
          className="
            flex h-7 w-7 shrink-0
            items-center justify-center
            rounded-md text-gray-600
            transition-colors
            hover:bg-gray-100
            dark:text-slate-300
            dark:hover:bg-slate-800
            lg:hidden
          "
        >
          <Menu className="h-5 w-5" />
        </button>

        {/* APP NAME */}
        <div className="min-w-0">
          <h1 className="text-sm font-bold text-blue-950 dark:text-blue-300">Simple-Plan</h1>

          <p className="truncate text-[11px] text-gray-500 dark:text-slate-400">
            Rumah Sakit Citra Husada
          </p>
        </div>
      </div>

      {/* ======================================
          SIDEBAR NAVIGATION
      ====================================== */}
      <nav className="flex-1 space-y-1 overflow-y-auto py-3">
        <DashboardTab />
        <MasterDataTab />
        <InventarisAsetTab />
        <HelpdeskTab />
        <MaintenanceTab />
        <CadanganDataTab />
        <DesignGraphicTab />
        <LaporanTab />
        <LogoutTab onLogout={handleLogout} />
      </nav>

      {/* ======================================
          SIDEBAR FOOTER
      ====================================== */}
      <div className="space-y-4 border-t border-soft-border p-4">
        {/* DARK MODE */}
        <div className="flex items-center justify-between text-xs font-medium text-gray-600 dark:text-slate-400">
          <span>Mode</span>

          <SwitchToggle checked={isDarkMode} onChange={toggleDarkMode} />
        </div>

        {/* USER PROFILE */}
        <div className="flex items-center gap-3">
          <div
            className="
              flex h-9 w-9 shrink-0
              items-center justify-center
              rounded-full bg-slate-100
              text-slate-600
              dark:bg-slate-700/80
              dark:text-slate-400
            "
          >
            <User className="h-5 w-5" />
          </div>

          <div className="min-w-0 leading-tight">
            <p className="truncate text-sm font-bold text-gray-800 dark:text-slate-200">
              {roleName}
            </p>

            <p className="truncate text-xs text-gray-500 dark:text-slate-400">
              {user?.nama || "Nama belum tersedia"}
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
}
