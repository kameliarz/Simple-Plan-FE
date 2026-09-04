import React from "react";
import { Home, HelpCircle, User } from "lucide-react";
import { cn } from "../../lib/utils";

export type MobileNavTab = "dashboard" | "helpdesk" | "profile";

interface BottomNavProps {
  activeTab?: MobileNavTab;
  onTabChange?: (tab: MobileNavTab) => void;
  className?: string;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  activeTab = "helpdesk",
  onTabChange,
  className,
}) => {
  const navItems = [
    {
      id: "dashboard" as MobileNavTab,
      label: "Dashboard",
      icon: Home,
    },
    {
      id: "helpdesk" as MobileNavTab,
      label: "Helpdesk",
      icon: HelpCircle,
    },
    {
      id: "profile" as MobileNavTab,
      label: "Profil",
      icon: User,
    },
  ];

  return (
    <nav
      className={cn(
        "fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-[#111827]/95 backdrop-blur-md border-t border-slate-100 dark:border-slate-800 transition-colors",
        className,
      )}
    >
      <div className="max-w-md mx-auto grid grid-cols-3 py-2 px-3">
        {navItems.map((item) => {
          const isActive = activeTab === item.id;
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onTabChange?.(item.id)}
              className={cn(
                "flex flex-col items-center justify-center gap-1 py-1 rounded-xl transition-all duration-200 select-none",
                isActive
                  ? "text-blue-900 dark:text-blue-400 font-semibold"
                  : "text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 font-medium",
              )}
            >
              <Icon className={cn("w-5 h-5 transition-transform", isActive && "scale-110")} />
              <span className="text-[11px] leading-none">{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNav;
