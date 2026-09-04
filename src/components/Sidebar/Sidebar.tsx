import { Menu } from "lucide-react";
import DashboardTab from "./DashboardTab";
import MasterDataTab from "./MasterDataTab";
import InventarisAsetTab from "./InventarisAsetTab";
import HelpdeskTab from "./HelpdeskTab";
import MaintenanceTab from "./MaintenanceTab";
import CadanganDataTab from "./CadanganDataTab";
import LaporanTab from "./LaporanTab";
import NotifikasiTab from "./NotifikasiTab";
import LogoutTab from "./LogoutTab";

export default function Sidebar() {
  const handleLogout = () => {
    // Logika logout kamu
    console.log("User logged out");
  };

  return (
    <aside className="flex h-screen w-64 flex-col border-r border-gray-200 bg-white">
      
      {/* 1. Header Sidebar */}
      <div className="flex items-center gap-3 p-4 border-b border-gray-100">
        <button className="text-gray-600 hover:text-gray-900">
          <Menu className="h-5 w-5" />
        </button>
        <div>
          <h1 className="text-sm font-bold text-blue-950">Simple-Plan</h1>
          <p className="text-[11px] text-gray-500">Rumah Sakit Citra Husada</p>
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
      <div className="border-t border-gray-100 p-4 space-y-4">
        {/* Toggle Mode */}
        <div className="flex items-center justify-between text-xs font-medium text-gray-600">
          <span>Mode</span>
          <input type="checkbox" className="toggle toggle-sm" />
        </div>

        {/* User Card */}
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold">
            🏥
          </div>
          <div className="leading-tight">
            <p className="text-sm font-bold text-gray-800">Super Admin</p>
            <p className="text-xs text-gray-500">Administrator</p>
          </div>
        </div>
      </div>

    </aside>
  );
}
