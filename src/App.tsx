import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { MobileHeader } from "./components/layout/MobileHeader";
import { BottomNav, type MobileNavTab } from "./components/layout/BottomNav";
import { HelpdeskListPage } from "./features/helpdesk/pages/HelpdeskListPage";
import { HelpdeskDetailPage } from "./features/helpdesk/pages/HelpdeskDetailPage";
import { DesktopHelpdeskPage } from "./features/helpdesk/pages/DesktopHelpdeskPage";
import { MOCK_TICKETS } from "./features/helpdesk/data/mockTickets";
import type { TicketItem } from "./features/helpdesk/types/helpdesk";
import { MobileCreateTicketPage } from "./features/helpdesk/pages/MobileCreateTicketPage";
import { HelpdeskScanBarcodePage } from "./features/helpdesk/pages/HelpdeskScanBarcodePage";

import Sidebar from "./components/Sidebar/Sidebar";

function App() {
  const location = useLocation();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<MobileNavTab>("helpdesk");
  const [currentView, setCurrentView] = useState<"list" | "detail" | "create" | "scan">("list");
  const [selectedTicketId, setSelectedTicketId] = useState<string>("1");
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  
  useEffect(() => {
    if (location.pathname === "/helpdesk/sarpras/buat") {
      setActiveTab("helpdesk");
      setCurrentView("create");
      setIsMobileSidebarOpen(false);
    } else if (location.pathname === "/helpdesk/sarpras") {
      setActiveTab("helpdesk");
      if (currentView === "create" || currentView === "scan") {
        setCurrentView("list");
      }
      setIsMobileSidebarOpen(false);
    }
  }, [location.pathname]);
  
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
      <div className="md:hidden flex flex-col min-h-screen bg-[#f8f9ff] dark:bg-[#0f172a] relative">
        
        {/* Mobile Sidebar Overlay */}
        {isMobileSidebarOpen && (
          <div 
            className="fixed inset-0 bg-slate-900/50 z-40" 
            onClick={() => setIsMobileSidebarOpen(false)}
          />
        )}
        
        {/* Mobile Sidebar Drawer */}
        <div 
          className={`fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-slate-900 shadow-xl transform transition-transform duration-300 ease-in-out ${
            isMobileSidebarOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <Sidebar isDarkMode={isDarkMode} toggleDarkMode={toggleDarkMode} />
        </div>

        {/* Header Mobile */}
        <MobileHeader 
          isDarkMode={isDarkMode} 
          onToggleDarkMode={toggleDarkMode} 
          onMenuClick={() => setIsMobileSidebarOpen(true)}
        />

        {/* Konten Halaman Mobile */}
        <main className="flex-1 overflow-y-auto">
          {activeTab === "helpdesk" && (
            currentView === "list" ? (
              <HelpdeskListPage 
                onSelectTicket={handleSelectTicket} 
                onNewTicket={() => navigate("/helpdesk/sarpras/buat")}
              />
            ) : currentView === "detail" ? (
              <HelpdeskDetailPage
                ticket={selectedTicket}
                onBack={handleBackToList}
                onStatusChange={(_id: string, newStatus: TicketItem["status"]) => {
                  console.log("Status tiket diubah menjadi:", newStatus);
                }}
              />
            ) : currentView === "create" ? (
              <MobileCreateTicketPage 
                onBack={() => navigate("/helpdesk/sarpras")} 
                onScan={() => setCurrentView("scan")}
                onSubmitSuccess={() => navigate("/helpdesk/sarpras")}
              />
            ) : currentView === "scan" ? (
              <HelpdeskScanBarcodePage 
                onBack={() => setCurrentView("create")} 
                onSuccess={() => setCurrentView("create")}
              />
            ) : null
          )}

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
