import React, { useState } from "react";
import { X, Tag, AlertCircle } from "lucide-react";
import Button from "../../../components/ui/Button";

interface TolakPenyelesaianModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: { keterangan: string }) => void;
}

export const TolakPenyelesaianModal: React.FC<TolakPenyelesaianModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
}) => {
  const [keterangan, setKeterangan] = useState("");
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!keterangan) {
      setError("Keterangan kendala wajib diisi!");
      return;
    }
    
    setError(null);
    onSubmit({ keterangan });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 w-full sm:max-w-xl shadow-xl flex flex-col sm:rounded-2xl rounded-t-2xl overflow-hidden max-h-[90vh] animate-in slide-in-from-bottom-full sm:zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="px-6 py-4 pt-8 sm:pt-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between sticky top-0 bg-white dark:bg-slate-900 z-10">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-500">
              <Tag className="w-4 h-4" />
            </div>
            <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100">Keterangan Kendala</h2>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto">
          <form id="tolakForm" onSubmit={handleSubmit} className="space-y-6">
            
            {/* Keterangan Kendala */}
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-800 dark:text-slate-200">
                Keterangan Kendala <span className="text-rose-500">*</span>
              </label>
              <textarea 
                rows={4}
                value={keterangan}
                onChange={(e) => {
                  setKeterangan(e.target.value);
                  if (error) setError(null);
                }}
                className={`w-full px-4 py-3 rounded-xl border outline-none text-sm dark:bg-slate-800 dark:text-slate-200 resize-none ${
                  error 
                    ? 'border-rose-500 focus:ring-rose-100 focus:ring-2 dark:border-rose-500' 
                    : 'border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 dark:border-slate-700'
                }`}
              />
              {error && (
                <p className="text-xs text-rose-500 font-medium flex items-center gap-1.5 mt-1">
                  <AlertCircle className="w-3.5 h-3.5" /> {error}
                </p>
              )}
            </div>

          </form>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex justify-end gap-3">
          <Button variant="outline" onClick={onClose} className="px-8 py-2.5 bg-white border-slate-300 text-slate-700 hover:bg-slate-50 font-semibold rounded-full text-sm">
            Batal
          </Button>
          <Button type="submit" form="tolakForm" className="px-8 py-2.5 bg-[#1e3a8a] hover:bg-[#1e3a8a]/90 text-white font-semibold rounded-full text-sm shadow-sm transition">
            Tolak Penyelesaian
          </Button>
        </div>
      </div>
    </div>
  );
};

export default TolakPenyelesaianModal;
