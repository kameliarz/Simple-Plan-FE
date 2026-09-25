import React, { useState } from "react";
import { X, Search, CheckCircle2, Circle } from "lucide-react";
import Button from "../../../components/ui/Button";
import Input from "../../../components/ui/Input";

interface Petugas {
  id: string;
  name: string;
  role: string;
  initials: string;
}

const MOCK_PETUGAS: Petugas[] = [
  { id: "1", name: "Hendra Wijaya", role: "IT Support - SIMRS", initials: "HW" },
  { id: "2", name: "Rian Pratama", role: "Teknisi Lapangan", initials: "RP" },
  { id: "3", name: "Siti Aisyah", role: "IT Helpdesk", initials: "SA" },
  { id: "4", name: "Ahmad Fauzi", role: "IT Support - Hardware", initials: "AF" },
];

interface AssignPetugasModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAssign: (petugas: Petugas) => void;
  selectedPetugasId?: string | null;
}

export const AssignPetugasModal: React.FC<AssignPetugasModalProps> = ({
  isOpen,
  onClose,
  onAssign,
  selectedPetugasId,
}) => {
  const [search, setSearch] = useState("");
  const [localSelected, setLocalSelected] = useState<string | null>(selectedPetugasId || null);

  if (!isOpen) return null;

  const filteredPetugas = MOCK_PETUGAS.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleAssign = () => {
    const petugas = MOCK_PETUGAS.find((p) => p.id === localSelected);
    if (petugas) {
      onAssign(petugas);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 w-full sm:max-w-md shadow-xl overflow-hidden flex flex-col sm:rounded-2xl rounded-t-2xl animate-in slide-in-from-bottom-full sm:zoom-in-95 duration-200 max-h-[90vh]">
        
        {/* Drag handle for mobile */}
        <div className="w-full flex justify-center py-2 sm:hidden absolute top-0 left-0 right-0 z-10">
          <div className="w-12 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full"></div>
        </div>

        {/* Header */}
        <div className="flex items-center justify-between p-4 pt-6 sm:pt-4 border-b border-slate-100 dark:border-slate-800">
          <h2 className="text-base font-bold text-slate-800 dark:text-slate-100">Tugaskan Petugas</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:bg-slate-100 dark:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 flex-1 overflow-y-auto max-h-[60vh]">
          <p className="text-xs font-semibold text-slate-500 mb-2">Pilih Petugas</p>
          
          <div className="relative mb-4">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <Input
              placeholder="Cari nama petugas..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 py-2 text-sm"
            />
          </div>

          <div className="space-y-2">
            {filteredPetugas.map((petugas) => {
              const isSelected = localSelected === petugas.id;
              return (
                <div
                  key={petugas.id}
                  onClick={() => setLocalSelected(petugas.id)}
                  className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all ${
                    isSelected
                      ? "border-blue-600 bg-blue-50/50 dark:bg-blue-900/20"
                      : "border-slate-200 dark:border-slate-700 hover:border-blue-300 dark:hover:border-blue-700"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-[#003178] text-white flex items-center justify-center font-bold text-sm shrink-0">
                      {petugas.initials}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-800 dark:text-slate-200 leading-tight">
                        {petugas.name}
                      </p>
                      <p className="text-[11px] text-slate-500">{petugas.role}</p>
                    </div>
                  </div>
                  <div className="shrink-0 text-blue-600 dark:text-blue-500">
                    {isSelected ? (
                      <CheckCircle2 className="w-5 h-5 fill-blue-600 text-white dark:fill-blue-500" />
                    ) : (
                      <Circle className="w-5 h-5 text-slate-300 dark:text-slate-600" />
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800 flex items-center gap-3">
          <Button variant="outline" onClick={onClose} className="flex-1">
            Batal
          </Button>
          <Button 
            onClick={handleAssign} 
            className="flex-1 bg-[#003178] hover:bg-[#00255a] text-white"
            disabled={!localSelected}
          >
            Tugaskan
          </Button>
        </div>
      </div>
    </div>
  );
};
