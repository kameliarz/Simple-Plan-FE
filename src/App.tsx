import { useState } from "react";
import Modal from "./components/Modal/Modal";
import Dropdown from "./components/Dropdown/Dropdown";
import Tabs from "./components/Tabs/Tabs";
import Accordion from "./components/Accordion/Accordion";
import Sidebar from "./components/Sidebar/Sidebar";

function App() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background text-text">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <main className="p-6 md:p-10">
        <div className="mx-auto max-w-3xl space-y-10">

          {/* Modal */}
          <section>
            <h1 className="mb-4 text-2xl font-bold">
              Interactive Components
            </h1>

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
              <p>
                Ini adalah contoh isi modal.
              </p>
            </Modal>
          </section>

          {/* Dropdown */}
          <section>
            <h2 className="mb-4 text-lg font-semibold">
              Dropdown
            </h2>

            <div className="flex flex-wrap gap-4">
              <Dropdown
                label="Kategori"
                options={[
                  "TIK",
                  "Sarpras",
                  "Jaringan",
                ]}
              />

              <Dropdown
                label="Status"
                options={[
                  "Baru",
                  "Diproses",
                  "Selesai",
                  "Ditolak",
                ]}
              />
            </div>
          </section>

          {/* Tabs */}
          <section>
            <h2 className="mb-4 text-lg font-semibold">
              Tabs
            </h2>

            <Tabs
              tabs={[
                {
                  label: "Semua",
                  content: <p>Semua tiket</p>,
                },
                {
                  label: "Baru",
                  content: <p>Tiket baru</p>,
                },
                {
                  label: "Diproses",
                  content: (
                    <p>
                      Tiket yang sedang diproses
                    </p>
                  ),
                },
                {
                  label: "Selesai",
                  content: (
                    <p>
                      Tiket yang sudah selesai
                    </p>
                  ),
                },
              ]}
            />
          </section>

          {/* Accordion */}
          <section>
            <h2 className="mb-4 text-lg font-semibold">
              Accordion
            </h2>

            <Accordion
              items={[
                {
                  title: "Informasi Tiket",
                  content: (
                    <div className="space-y-2">
                      <p>
                        Nomor Tiket: TIK-001
                      </p>
                      <p>
                        Kategori: TIK
                      </p>
                      <p>
                        Status: Baru
                      </p>
                    </div>
                  ),
                },
                {
                  title: "Riwayat Penanganan",
                  content: (
                    <div className="space-y-2">
                      <p>
                        01 September - Tiket dibuat
                      </p>
                      <p>
                        01 September - Tiket diterima
                      </p>
                    </div>
                  ),
                },
                {
                  title: "Lampiran",
                  content: (
                    <p>
                      Tidak ada lampiran.
                    </p>
                  ),
                },
              ]}
            />
          </section>

        </div>
      </main>
    </div>
  );
}

export default App;