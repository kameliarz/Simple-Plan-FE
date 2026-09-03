import { useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { Headset, ChevronDown, Monitor, Wrench } from "lucide-react";

export default function HelpdeskTab() {
  const location = useLocation();
  const isActive = location.pathname.includes("/helpdesk");
  const [isOpen, setIsOpen] = useState(isActive);

  return (
    <div className="flex flex-col">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center justify-between px-4 py-2.5 text-sm font-medium transition-colors border-l-2 w-full ${
          isActive ? "border-blue-700 text-blue-700" : "border-transparent text-gray-600 hover:bg-gray-100"
        }`}
      >
        <div className="flex items-center gap-3">
          <Headset className="h-5 w-5" />
          <span>Helpdesk</span>
        </div>
        <ChevronDown className={`h-4 w-4 transition-transform ${isOpen ? "rotate-180" : ""}`} />
      </button>

      {isOpen && (
        <div className="flex flex-col bg-gray-50/50 py-1">
          <NavLink
            to="/helpdesk/tik"
            className={({ isActive }) =>
              `flex items-center gap-3 pl-12 pr-4 py-2 text-sm transition-colors ${
                isActive ? "text-blue-700 font-medium" : "text-gray-500 hover:text-gray-700"
              }`
            }
          >
            <Monitor className="h-4 w-4" />
            <span>Helpdesk TIK</span>
          </NavLink>
          
          <NavLink
            to="/helpdesk/sarpras"
            className={({ isActive }) =>
              `flex items-center gap-3 pl-12 pr-4 py-2 text-sm transition-colors ${
                isActive ? "text-blue-700 font-medium" : "text-gray-500 hover:text-gray-700"
              }`
            }
          >
            <Wrench className="h-4 w-4" />
            <span>Helpdesk Sarpras</span>
          </NavLink>
        </div>
      )}
    </div>
  );
}