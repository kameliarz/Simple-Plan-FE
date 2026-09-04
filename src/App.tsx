import { useState } from "react";
import { MobileHeader } from "./components/layout/MobileHeader";
import { BottomNav, type MobileNavTab } from "./components/layout/BottomNav";
import { HelpdeskListPage } from "./features/helpdesk/pages/HelpdeskListPage";
import { HelpdeskDetailPage } from "./features/helpdesk/pages/HelpdeskDetailPage";
import { MOCK_TICKETS } from "./features/helpdesk/data/mockTickets";
import type { TicketItem } from "./features/helpdesk/types/helpdesk";
import Modal from "./components/Modal/Modal";
import Dropdown from "./components/Dropdown/Dropdown";
import Tabs from "./components/Tabs/Tabs";
import Accordion from "./components/Accordion/Accordion";
import Sidebar from "./components/Sidebar/Sidebar";

function App() {
  const [activeTab, setActiveTab] = useState<MobileNavTab>("helpdesk");
  const [currentView, setCurrentView] = useState<"list" | "detail">("list");
  const [selectedTicketId, setSelectedTicketId] = useState<string>("1");
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [displayMode, setDisplayMode] = useState<"mobile" | "desktop">("mobile");
  const [isModalOpen, setIsModalOpen] = useState(false);

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
      {/* Top Switcher Bar (Alat Bantu Preview untuk Pengembang & Penguji) */}
      <header className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 px-4 py-2 flex items-center justify-between text-xs sticky top-0 z-50">
        <div className="flex items-center gap-2">
          <span className="font-bold text-blue-950 dark:text-blue-300">Simple-Plan FE2</span>
          <span className="text-slate-400">|</span>
          <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-0.5 rounded-lg">
            <button
              type="button"
              onClick={() => setDisplayMode("mobile")}
              className={`px-3 py-1 rounded-md font-semibold transition ${
                displayMode === "mobile"
                  ? "bg-white dark:bg-slate-700 text-blue-950 dark:text-white shadow-xs"
                  : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              📱 Mobile View (Desain Figma)
            </button>
            <button
              type="button"
              onClick={() => setDisplayMode("desktop")}
              className={`px-3 py-1 rounded-md font-semibold transition ${
                displayMode === "desktop"
                  ? "bg-white dark:bg-slate-700 text-blue-950 dark:text-white shadow-xs"
                  : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              💻 Desktop Showcase
            </button>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={toggleDarkMode}
            className="px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-medium hover:bg-slate-50 dark:hover:bg-slate-700 transition flex items-center gap-1.5"
          >
            <span>{isDarkMode ? "☀️ Light Mode" : "🌙 Dark Mode"}</span>
          </button>
        </div>
      </header>

      {/* 1. TAMPILAN MOBILE (Sesuai Rancangan Desain Figma) */}
      {displayMode === "mobile" ? (
        <div className="py-4 md:py-8 flex justify-center items-start min-h-[calc(100vh-45px)]">
          {/* Mobile Simulator Frame */}
          <div className="w-full max-w-[420px] bg-[#f8f9ff] dark:bg-[#0f172a] shadow-2xl min-h-[850px] relative border border-slate-200/80 dark:border-slate-800 rounded-3xl overflow-hidden flex flex-col">
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
        </div>
      ) : (
        /* 2. TAMPILAN DESKTOP KOMPONEN LAINNYA */
        <div className="min-h-screen bg-background text-text flex">
          {/* Sidebar */}
          <Sidebar />

          {/* Main Content */}
          <main className="flex-1 p-6 md:p-10 overflow-y-auto">
            <div className="mx-auto max-w-3xl space-y-10">
              <section>
                <h1 className="mb-4 text-2xl font-bold">Interactive Components</h1>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(true)}
                  className="rounded-lg bg-primary px-5 py-3 font-semibold text-white transition hover:opacity-90"
                >
                  Buka Modal
                </button>

                <Modal
                  isOpen={isModalOpen}
                  onClose={() => setIsModalOpen(false)}
                  title="Detail Tiket"
                >
                  <p>Ini adalah contoh isi modal.</p>
                </Modal>
              </section>

              <section>
                <h2 className="mb-4 text-lg font-semibold">Dropdown</h2>
                <div className="flex flex-wrap gap-4">
                  <Dropdown label="Kategori" options={["TIK", "Sarpras", "Jaringan"]} />
                  <Dropdown label="Status" options={["Baru", "Diproses", "Selesai", "Ditolak"]} />
                </div>
              </section>

              <section>
                <h2 className="mb-4 text-lg font-semibold">Tabs</h2>
                <Tabs
                  tabs={[
                    { label: "Semua", content: <p>Semua tiket</p> },
                    { label: "Baru", content: <p>Tiket baru</p> },
                    { label: "Diproses", content: <p>Tiket yang sedang diproses</p> },
                    { label: "Selesai", content: <p>Tiket yang sudah selesai</p> },
                  ]}
                />
              </section>

              <section>
                <h2 className="mb-4 text-lg font-semibold">Accordion</h2>
                <Accordion
                  items={[
                    {
                      title: "Informasi Tiket",
                      content: (
                        <div className="space-y-2">
                          <p>Nomor Tiket: TIK-001</p>
                          <p>Kategori: TIK</p>
                          <p>Status: Baru</p>
                        </div>
                      ),
                    },
                    {
                      title: "Riwayat Penanganan",
                      content: (
                        <div className="space-y-2">
                          <p>01 September - Tiket dibuat</p>
                          <p>01 September - Tiket diterima</p>
                        </div>
                      ),
                    },
                  ]}
                />
              </section>
            </div>
          </main>
        </div>
      )}
    </div>
  );
}

export default App;
