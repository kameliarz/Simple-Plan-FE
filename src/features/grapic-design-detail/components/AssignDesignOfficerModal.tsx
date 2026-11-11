import { useEffect, useState } from "react";
import { IconCheck, IconSearch } from "@tabler/icons-react";

import Modal from "@/components/ui/ui-template/Modal";
import Button from "@/components/ui/ui-template/Button";

import { getDesignOfficerOptions } from "../services/graphicDesignDetail";

import type { DesignOfficer } from "../types/graphicDesignDetail.types";

interface AssignDesignOfficerModalProps {
  isOpen: boolean;
  selectedOfficer: DesignOfficer | null;
  onClose: () => void;
  onAssign: (officer: DesignOfficer) => void;
}

export default function AssignDesignOfficerModal({
  isOpen,
  selectedOfficer,
  onClose,
  onAssign,
}: AssignDesignOfficerModalProps) {
  const [search, setSearch] = useState("");
  const [officers, setOfficers] = useState<DesignOfficer[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(selectedOfficer?.id ?? null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isOpen) return;

    let isActive = true;

    const loadOfficers = async () => {
      try {
        setIsLoading(true);
        setError("");

        const data = await getDesignOfficerOptions(search);

        if (isActive) {
          setOfficers(data);
        }
      } catch (err) {
        if (isActive) {
          setOfficers([]);
          setError(err instanceof Error ? err.message : "Gagal mengambil daftar petugas.");
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
  }, [isOpen, search]);

  const handleClose = () => {
    setSearch("");
    setError("");
    onClose();
  };

  const handleAssign = () => {
    const officer =
      officers.find((item) => item.id === selectedId) ??
      (selectedOfficer?.id === selectedId ? selectedOfficer : null);

    if (!officer) return;

    onAssign(officer);
    handleClose();
  };

  return (
    <Modal show={isOpen} onClose={handleClose} title="Tugaskan Petugas" maxWidth="md" closeable>
      <div className="space-y-4">
        {/* SEARCH */}
        <div>
          <label
            htmlFor="search-design-officer"
            className="mb-2 block text-xs font-medium text-text-title"
          >
            Pilih Petugas
          </label>

          <div className="relative">
            <IconSearch
              size={18}
              strokeWidth={1.6}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />

            <input
              id="search-design-officer"
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Cari nama petugas..."
              className="
                h-11 w-full rounded-lg
                border border-slate-200
                bg-table-card pl-10 pr-3
                text-sm text-text-title
                outline-none
                placeholder:text-slate-400
                focus:border-primary-600
                dark:border-slate-700
              "
            />
          </div>
        </div>

        {/* OFFICER LIST */}
        <div className="max-h-72 space-y-2 overflow-y-auto pr-1">
          {isLoading ? (
            <p className="py-6 text-center text-xs text-text-secondary">Memuat daftar petugas...</p>
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
                    flex w-full items-center gap-3
                    rounded-lg border px-3 py-2.5
                    text-left transition
                    ${
                      isSelected
                        ? "border-primary-600 bg-blue-50 dark:bg-blue-950/30"
                        : "border-slate-200 bg-table-card hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800"
                    }
                  `}
                >
                  {/* Avatar */}
                  <div
                    className={`
                      flex h-9 w-9 shrink-0
                      items-center justify-center
                      rounded-full text-xs font-semibold
                      ${
                        isSelected
                          ? "bg-primary-600 text-white"
                          : "bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-white"
                      }
                    `}
                  >
                    {officer.initials}
                  </div>

                  {/* Officer Info */}
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-text-title">{officer.name}</p>
                    <p className="mt-0.5 truncate text-xs text-text-secondary">{officer.role}</p>
                  </div>

                  {/* Selection Icon */}
                  <span
                    className={`
                      flex h-5 w-5 shrink-0
                      items-center justify-center
                      rounded-full border
                      ${
                        isSelected
                          ? "border-primary-600 bg-primary-600 text-white"
                          : "border-slate-300 dark:border-slate-500"
                      }
                    `}
                  >
                    {isSelected && <IconCheck size={13} strokeWidth={2.5} />}
                  </span>
                </button>
              );
            })
          ) : (
            <p className="py-6 text-center text-xs text-text-secondary">Petugas tidak ditemukan.</p>
          )}
        </div>

        {/* ACTIONS */}
        <div className="flex gap-2 pt-3">
          <Button label="Batal" variant="secondary" className="flex-1" onClick={handleClose} />

          <Button
            label="Tugaskan"
            variant="primary"
            className="flex-1"
            disabled={selectedId === null}
            onClick={handleAssign}
          />
        </div>
      </div>
    </Modal>
  );
}
