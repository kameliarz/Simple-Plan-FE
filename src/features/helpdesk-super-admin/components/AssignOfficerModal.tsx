import { useEffect, useState } from "react";
import Modal from "@/components/ui/ui-template/Modal";
import Search from "@/components/ui/ui-template/Search";
import Button from "@/components/ui/ui-template/Button";
import { getTicketAssigneeOptions } from "../services/ticketApi";

export interface Officer {
  id: number;
  name: string;
  role: string;
  initials: string;
}

interface AssignOfficerModalProps {
  isOpen: boolean;
  ticketId: string;
  selectedOfficer: Officer | null;
  onClose: () => void;
  onAssign: (officer: Officer) => void;
}

export default function AssignOfficerModal({
  isOpen,
  ticketId,
  selectedOfficer,
  onClose,
  onAssign,
}: AssignOfficerModalProps) {
  const [search, setSearch] = useState("");
  const [officers, setOfficers] = useState<Officer[]>([]);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const [selectedId, setSelectedId] = useState<number | null>(selectedOfficer?.id ?? null);

  const handleClose = () => {
    setSelectedId(selectedOfficer?.id ?? null);
    setSearch("");
    setError("");
    onClose();
  };

  useEffect(() => {
    if (!isOpen || !ticketId) return;

    let isActive = true;

    const loadOfficers = async () => {
      setIsLoading(true);
      setError("");

      try {
        const result = await getTicketAssigneeOptions(ticketId, search);

        if (isActive) {
          setOfficers(result);
        }
      } catch (err: any /* eslint-disable-line @typescript-eslint/no-explicit-any */) {
        if (isActive) {
          setOfficers([]);
          setError(err.message || "Gagal mengambil daftar petugas.");
        }
      } finally {
        if (isActive) {
          setIsLoading(false);
        }
      }
    };

    loadOfficers();

    return () => {
      isActive = false;
    };
  }, [isOpen, ticketId, search]);

  const handleAssign = () => {
    const officer =
      officers.find((item) => item.id === selectedId) ??
      (selectedOfficer?.id === selectedId ? selectedOfficer : null);

    if (!officer) return;

    onAssign(officer);

    setSearch("");
    setError("");
    onClose();
  };

  return (
    <Modal show={isOpen} onClose={handleClose} title="Tugaskan Petugas" maxWidth="md" closeable>
      <div className="space-y-4">
        <div>
          <label
            htmlFor="search-officer"
            className="mb-1.5 block text-xs font-medium text-text-title"
          >
            Pilih Petugas
          </label>

          <Search
            value={search}
            onChange={setSearch}
            placeholder="Cari nama atau jabatan petugas..."
          />
        </div>

        <div className="max-h-60 space-y-1.5 overflow-y-auto pr-1">
          {isLoading ? (
            <p className="py-6 text-center text-xs text-slate-400">Memuat daftar petugas...</p>
          ) : error ? (
            <p className="py-6 text-center text-xs text-red-500">{error}</p>
          ) : officers.length > 0 ? (
            officers.map((officer) => {
              const isSelected = selectedId === officer.id;

              return (
                <button
                  key={officer.id}
                  type="button"
                  onClick={() => setSelectedId(officer.id)}
                  className={`
                    flex w-full items-center gap-3 rounded-lg border
                    px-3 py-2 text-left transition
                    ${
                      isSelected
                        ? "border-primary-500 bg-blue-50"
                        : "border-slate-200 bg-white hover:bg-slate-50"
                    }
                  `}
                >
                  <div
                    className={`
                      flex h-8 w-8 shrink-0 items-center justify-center
                      rounded-full text-sm font-semibold
                      ${
                        isSelected ? "bg-primary-600 text-slate-100" : "bg-slate-100 text-slate-600"
                      }
                    `}
                  >
                    {officer.initials}
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-text-title">{officer.name}</p>

                    <p className="mt-0.5 truncate text-xs text-slate-400">{officer.role}</p>
                  </div>

                  <div
                    className={`
                      flex h-4 w-4 shrink-0 items-center justify-center
                      rounded-full border
                      ${isSelected ? "border-primary-600" : "border-slate-300"}
                    `}
                  >
                    {isSelected && <div className="h-2 w-2 rounded-full bg-primary-600" />}
                  </div>
                </button>
              );
            })
          ) : (
            <p className="py-6 text-center text-xs text-slate-400">Petugas tidak ditemukan.</p>
          )}
        </div>

        <div className="flex justify-end gap-2 pt-4">
          <Button label="Batal" variant="secondary" className="w-full" onClick={handleClose} />

          <Button label="Tugaskan" variant="primary" className="w-full" onClick={handleAssign} />
        </div>
      </div>
    </Modal>
  );
}
