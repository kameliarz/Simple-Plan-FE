import { useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { Package, ChevronDown, Wrench, Monitor } from "lucide-react";
import { getUser } from "@/features/auth-login/services/authStorage";

export default function InventarisAsetTab() {
  const location = useLocation();
  const isActive = location.pathname.includes("/inventaris");
  const [isOpen, setIsOpen] = useState(isActive);

  const user = getUser();
  const role = user?.role || "";

  // Jika user biasa tidak berhak melihat inventaris aset
  if (role === "user") {
    return null;
  }

  // Hak akses per submenu
  const canAccessTik = role === "super-admin" || role === "petugas-tik" || role === "management";
  const canAccessSarpras =
    role === "super-admin" ||
    role === "petugas-sarpras" ||
    role === "koordinator-sarpras" ||
    role === "management";

  const renderNavLink = (to: string, label: string, Icon: React.ElementType) => (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `flex items-center justify-between pl-12 pr-4 py-2 text-sm transition-colors ${
          isActive
            ? "text-blue-700 dark:text-blue-400 font-medium"
            : "text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-slate-200"
        }`
      }
    >
      {({ isActive }) => (
        <>
          <div className="flex items-center gap-3">
            <Icon className="h-4 w-4" />
            <span>{label}</span>
          </div>
          {isActive && <div className="h-1.5 w-1.5 rounded-full bg-blue-600"></div>}
        </>
      )}
    </NavLink>
  );

  return (
    <div className="flex flex-col">
      <button
        type="button"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setIsOpen((prev) => !prev);
        }}
        className={`flex items-center justify-between px-4 py-2.5 text-sm font-medium transition-colors border-l-2 w-full ${
          isActive
            ? "border-blue-700 text-blue-700 dark:text-blue-400 dark:border-blue-500 bg-blue-50/50 dark:bg-blue-900/10"
            : "border-transparent text-gray-600 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-slate-800/50"
        }`}
      >
        <div className="flex items-center gap-3">
          <Package className="h-5 w-5" />
          <span>Inventaris Aset</span>
        </div>
        <ChevronDown className={`h-4 w-4 transition-transform ${isOpen ? "rotate-180" : ""}`} />
      </button>

      {isOpen && (
        <div className="flex flex-col bg-gray-50/50 dark:bg-slate-800/30 py-1">
          {canAccessTik && renderNavLink("/inventaris/tik", "Inventaris TIK", Monitor)}
          {canAccessSarpras && renderNavLink("/inventaris/sarpras", "Inventaris Sarpras", Wrench)}
        </div>
      )}
    </div>
  );
}
