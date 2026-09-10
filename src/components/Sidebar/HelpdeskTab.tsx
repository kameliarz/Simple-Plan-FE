import { useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { Headset, ChevronDown, Wrench } from "lucide-react";

export default function HelpdeskTab() {
  const location = useLocation();
  const isActive = location.pathname.includes("/helpdesk");
  const [isOpen, setIsOpen] = useState(isActive);

  return (
    <div className="flex flex-col">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center justify-between px-4 py-2.5 text-sm font-medium transition-colors border-l-2 w-full ${
          isActive
            ? "border-blue-700 text-blue-700 dark:text-blue-400 dark:border-blue-500"
            : "border-transparent text-gray-600 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-slate-800/50"
        }`}
      >
        <div className="flex items-center gap-3">
          <Headset className="h-5 w-5" />
          <span>Helpdesk</span>
        </div>
        <ChevronDown className={`h-4 w-4 transition-transform ${isOpen ? "rotate-180" : ""}`} />
      </button>

      {isOpen && (
        <div className="flex flex-col bg-gray-50/50 dark:bg-slate-800/30 py-1">
          <NavLink
            to="/helpdesk/sarpras"
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
                  <Wrench className="h-4 w-4" />
                  <span>Helpdesk Sarpras</span>
                </div>
                {isActive && <div className="h-1.5 w-1.5 rounded-full bg-blue-600"></div>}
              </>
            )}
          </NavLink>

          <NavLink
            to="/helpdesk/sarpras/buat"
            className={({ isActive }) =>
              `flex items-center gap-3 pl-12 pr-4 py-2 text-sm transition-colors ${
                isActive
                  ? "text-blue-700 dark:text-blue-400 font-medium"
                  : "text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-slate-200"
              }`
            }
          >
            <span className="text-lg leading-none font-medium mr-1">+</span>
            <span>Buat Tiket</span>
          </NavLink>
        </div>
      )}
    </div>
  );
}
