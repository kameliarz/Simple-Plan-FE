import { useState } from "react";
import { MobileHeader } from "./components/layout/MobileHeader";
import { BottomNav, type MobileNavTab } from "./components/layout/BottomNav";
import { HelpdeskListPage } from "./features/helpdesk/pages/HelpdeskListPage";
import { HelpdeskDetailPage } from "./features/helpdesk/pages/HelpdeskDetailPage";
import { DesktopHelpdeskPage } from "./features/helpdesk/pages/DesktopHelpdeskPage";
import { MOCK_TICKETS } from "./features/helpdesk/data/mockTickets";
import type { TicketItem } from "./features/helpdesk/types/helpdesk";

import Sidebar from "./components/Sidebar/Sidebar";

function App() {
  const [activeTab, setActiveTab] = useState<MobileNavTab>("helpdesk");
  const [currentView, setCurrentView] = useState<"list" | "detail">("list");
  const [selectedTicketId, setSelectedTicketId] = useState<string>("1");
  const [isDarkMode, setIsDarkMode] = useState(false);
  const selectedTicket = MOCK_TICKETS.find((t) => t.id === selectedTicketId) || MOCK_TICKETS[0];

  const toggleDarkMode = () => {
    setIsDarkMode((prev) => !prev);
    document.documentElement.classList.toggle("dark");
  };

  const handleSelectTicket = (id: string) => {
    setSelectedTicketId(id);
    setCurrentView("detail");
  };

  const handleBackToList = () => {
    setCurrentView("list");
  };

  return (
    <div
      className={`min-h-screen ${isDarkMode ? "dark bg-[#0b1329] text-slate-100" : "bg-slate-100 text-slate-800"}`}
    >
      {/* 1. TAMPILAN MOBILE (Ditampilkan di layar kecil) */}
      <div className="md:hidden flex flex-col min-h-screen bg-[#f8f9ff] dark:bg-[#0f172a]">
        {/* Header Mobile */}
        <MobileHeader isDarkMode={isDarkMode} onToggleDarkMode={toggleDarkMode} />

        {/* Konten Halaman Mobile */}
        <main className="flex-1 overflow-y-auto">
          {activeTab === "helpdesk" &&
            (currentView === "list" ? (
              <HelpdeskListPage onSelectTicket={handleSelectTicket} />
            ) : (
              <HelpdeskDetailPage
                ticket={selectedTicket}
                onBack={handleBackToList}
                onStatusChange={(_id: string, newStatus: TicketItem["status"]) => {
                  console.log("Status tiket diubah menjadi:", newStatus);
                }}
              />
            ))}

          {activeTab === "dashboard" && (
            <div className="p-6 text-center text-slate-400 space-y-2 mt-12">
              <p className="text-base font-bold text-slate-700 dark:text-slate-200">
                Halaman Dashboard
              </p>
              <p className="text-xs">
                Silakan pilih menu Helpdesk di navigasi bawah untuk melihat alur tiket.
              </p>
            </div>
          )}

          {activeTab === "profile" && (
            <div className="p-6 text-center text-slate-400 space-y-2 mt-12">
              <p className="text-base font-bold text-slate-700 dark:text-slate-200">
                Profil Pengguna
              </p>
              <p className="text-xs">Super Admin - Rumah Sakit Citra Husada Jember</p>
            </div>
          )}
        </main>

        {/* Bottom Navigation Bar */}
        <BottomNav
          activeTab={activeTab}
          onTabChange={(tab) => {
            setActiveTab(tab);
            if (tab === "helpdesk") setCurrentView("list");
          }}
        />
      </div>

      {/* 2. TAMPILAN DESKTOP (Ditampilkan di layar medium ke atas) */}
      <div className="hidden md:flex min-h-screen bg-background text-text w-full">
        {/* Sidebar */}
        <Sidebar isDarkMode={isDarkMode} toggleDarkMode={toggleDarkMode} />

        {/* Main Content */}
        <DesktopHelpdeskPage />
      </div>
    </div>
  );
}

export default App;
